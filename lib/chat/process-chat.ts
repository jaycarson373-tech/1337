import type { User } from "@supabase/supabase-js";
import { fetchDexScreenerContext } from "@/lib/adapters/dexscreener";
import { buildResearchPacket, researchPacketToPrompt } from "@/lib/context/compression";
import {
  createSolanaConnection,
  get1337Balance,
  send1337ToBurnWallet,
  snapshotBalance
} from "@/lib/crypto/solana";
import { getOrCreateUserWallet, getWalletKeypair } from "@/lib/crypto/wallets";
import { getPhase2Env } from "@/lib/env";
import { generateCryptoAnswer } from "@/lib/llm/openai";
import { calculatePricing, estimatePreflightBurnRaw } from "@/lib/pricing/pricing";
import {
  createRequestRun,
  type FailureReason,
  transitionRequestRun
} from "@/lib/request/lifecycle";
import { classifyIntent } from "@/lib/router/intent";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json, Tables } from "@/lib/supabase/database.types";
import { validateContext } from "@/lib/validation/context-validation";
import { titleFromPrompt } from "@/lib/chat/title";

export class ChatRequestError extends Error {
  status: number;
  failureReason?: FailureReason;

  constructor(message: string, status = 500, failureReason?: FailureReason) {
    super(message);
    this.name = "ChatRequestError";
    this.status = status;
    this.failureReason = failureReason;
  }
}

export type ProcessChatResult = {
  chatId: string;
  requestRunId: string;
  userMessage: Tables<"messages">;
  assistantMessage: Tables<"messages">;
  charge: {
    chargedUsd: number;
    actualLlmUsd: number;
    burned1337: number;
    burnSignature: string;
  };
  balance: {
    rawAmount: string;
    uiAmount: number;
    decimals: number;
  };
};

async function ensureChat({
  chatId,
  prompt,
  supabase,
  userId
}: {
  chatId: string | null;
  prompt: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
}) {
  if (chatId) {
    const { data, error } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new ChatRequestError("Chat not found.", 404, "invalid_prompt");
    }

    return chatId;
  }

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: userId,
      title: titleFromPrompt(prompt)
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

async function insertSystemFailureMessage({
  chatId,
  content,
  supabase,
  userId
}: {
  chatId: string;
  content: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
}) {
  await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: userId,
    role: "system",
    content
  });
}

async function failRun({
  chatId,
  failureReason,
  message,
  requestRun,
  status,
  supabase,
  userId
}: {
  chatId: string;
  failureReason: FailureReason;
  message: string;
  requestRun: Tables<"request_runs"> | null;
  status: number;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
}) {
  if (requestRun) {
    await transitionRequestRun({
      failureReason,
      note: message,
      requestRun,
      status: "failed",
      supabase
    });
  }

  await insertSystemFailureMessage({
    chatId,
    content: `${message} No 1337 was charged or burned.`,
    supabase,
    userId
  });

  throw new ChatRequestError(message, status, failureReason);
}

async function insertFailedCharge({
  chatId,
  error,
  messageId,
  requestRunId,
  supabase,
  userId
}: {
  chatId: string;
  error: string;
  messageId: string;
  requestRunId: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
}) {
  await supabase.from("query_charges").insert({
    user_id: userId,
    chat_id: chatId,
    message_id: messageId,
    request_run_id: requestRunId,
    status: "failed",
    error
  });
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function processChatRequest({
  chatId,
  idempotencyKey,
  prompt,
  user
}: {
  chatId: string | null;
  idempotencyKey: string;
  prompt: string;
  user: User;
}): Promise<ProcessChatResult> {
  const trimmedPrompt = prompt.replace(/\s+/g, " ").trim();

  if (!trimmedPrompt) {
    throw new ChatRequestError("Prompt is required.", 400, "invalid_prompt");
  }

  if (trimmedPrompt.length > 4000) {
    throw new ChatRequestError("Prompt is too long.", 400, "invalid_prompt");
  }

  if (!idempotencyKey) {
    throw new ChatRequestError("Idempotency key is required.", 400, "invalid_prompt");
  }

  const supabase = createSupabaseAdminClient();

  const { data: duplicateRun, error: duplicateError } = await supabase
    .from("request_runs")
    .select("id,status")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (duplicateError) {
    throw new Error(duplicateError.message);
  }

  if (duplicateRun) {
    throw new ChatRequestError(
      "This request has already been submitted. Refresh the chat to see the latest state.",
      409
    );
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null
    },
    { onConflict: "id" }
  );

  const activeChatId = await ensureChat({
    chatId,
    prompt: trimmedPrompt,
    supabase,
    userId: user.id
  });

  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      chat_id: activeChatId,
      user_id: user.id,
      role: "user",
      content: trimmedPrompt
    })
    .select("*")
    .single();

  if (userMessageError) {
    throw new Error(userMessageError.message);
  }

  let requestRun: Tables<"request_runs"> | null = await createRequestRun({
    chatId: activeChatId,
    idempotencyKey,
    messageId: userMessage.id,
    supabase,
    userId: user.id
  });

  try {
    requestRun = await transitionRequestRun({
      requestRun,
      status: "authenticated",
      supabase
    });

    const env = getPhase2Env();
    const wallet = await getOrCreateUserWallet(
      supabase,
      user.id,
      env.walletEncryptionSecret
    );
    const connection = createSolanaConnection(env.solanaRpcUrl);
    const preflightBalance = await get1337Balance({
      connection,
      owner: wallet.publicKey,
      tokenMint: env.tokenMint1337
    });

    await snapshotBalance({
      balance: preflightBalance,
      supabase,
      userId: user.id
    });

    const estimatedBurnRaw = estimatePreflightBurnRaw({
      maxQueryUsd: env.maxQueryUsd,
      tokenDecimals: preflightBalance.decimals,
      tokenPriceUsd: env.tokenPriceUsdFallback
    });

    if (BigInt(preflightBalance.rawAmount) < estimatedBurnRaw) {
      await insertFailedCharge({
        chatId: activeChatId,
        error: "Insufficient 1337 balance for preflight max query guardrail.",
        messageId: userMessage.id,
        requestRunId: requestRun.id,
        supabase,
        userId: user.id
      });

      await failRun({
        chatId: activeChatId,
        failureReason: "insufficient_balance",
        message: `Insufficient 1337 balance. Required preflight balance is ${(
          env.maxQueryUsd / env.tokenPriceUsdFallback
        ).toLocaleString(undefined, { maximumFractionDigits: 6 })} 1337.`,
        requestRun,
        status: 402,
        supabase,
        userId: user.id
      });
    }

    requestRun = await transitionRequestRun({
      metadata: toJson({
        preflight_balance_raw: preflightBalance.rawAmount,
        estimated_burn_raw: estimatedBurnRaw.toString()
      }),
      requestRun,
      status: "balance_preflight_checked",
      supabase
    });

    const classification = classifyIntent(trimmedPrompt);

    requestRun = await transitionRequestRun({
      intent: classification.intent,
      requestRun,
      status: "intent_classified",
      supabase
    });

    if (!classification.supported) {
      await insertFailedCharge({
        chatId: activeChatId,
        error: `${classification.intent} is not enabled in Phase 2.`,
        messageId: userMessage.id,
        requestRunId: requestRun.id,
        supabase,
        userId: user.id
      });

      await failRun({
        chatId: activeChatId,
        failureReason: "unsupported_intent",
        message:
          "That request type is not enabled in Phase 2. Wallet and portfolio analysis come later.",
        requestRun,
        status: 400,
        supabase,
        userId: user.id
      });
    }

    requestRun = await transitionRequestRun({
      requestRun,
      status: "context_gathering",
      supabase
    });

    const dexResult = await fetchDexScreenerContext(trimmedPrompt);
    await supabase.from("adapter_runs").insert({
      request_run_id: requestRun.id,
      adapter_id: dexResult.adapter_id,
      status: dexResult.status,
      source_count: dexResult.citations.length,
      confidence: dexResult.confidence,
      error: dexResult.errors.join("; ") || null,
      completed_at: new Date().toISOString()
    });

    requestRun = await transitionRequestRun({
      requestRun,
      status: "context_validating",
      supabase
    });

    const validation = validateContext({
      adapters: [dexResult],
      classification
    });

    if (validation.outcome === "invalid") {
      await insertFailedCharge({
        chatId: activeChatId,
        error: validation.failureReason ?? "Context validation failed.",
        messageId: userMessage.id,
        requestRunId: requestRun.id,
        supabase,
        userId: user.id
      });

      await failRun({
        chatId: activeChatId,
        failureReason:
          (validation.failureReason as FailureReason | undefined) ??
          "context_validation_failed",
        message:
          "Required crypto context is unavailable for this request, so 1337 did not generate an answer.",
        requestRun,
        status: 422,
        supabase,
        userId: user.id
      });
    }

    requestRun = await transitionRequestRun({
      degraded: validation.degraded,
      requestRun,
      status: validation.degraded ? "context_degraded" : "context_ready",
      supabase
    });

    const researchPacket = buildResearchPacket({
      adapters: [dexResult],
      intent: classification.intent,
      requestRunId: requestRun.id,
      userQuestion: trimmedPrompt,
      validation
    });

    requestRun = await transitionRequestRun({
      requestRun,
      status: "generation_started",
      supabase
    });

    const llmResult = await generateCryptoAnswer({
      apiKey: env.openaiApiKey,
      researchPacket: researchPacketToPrompt(researchPacket),
      userQuestion: trimmedPrompt
    });

    await supabase.from("model_usage").insert({
      request_run_id: requestRun.id,
      provider: llmResult.provider,
      model: llmResult.model,
      provider_request_id: llmResult.providerRequestId,
      input_tokens: llmResult.inputTokens,
      output_tokens: llmResult.outputTokens,
      actual_cost_usd: llmResult.actualCostUsd
    });

    requestRun = await transitionRequestRun({
      requestRun,
      status: "generation_succeeded",
      supabase
    });

    const pricing = calculatePricing({
      actualLlmUsd: llmResult.actualCostUsd,
      maxQueryUsd: env.maxQueryUsd,
      minQueryUsd: env.minQueryUsd,
      queryMarkupMultiplier: env.queryMarkupMultiplier,
      tokenDecimals: preflightBalance.decimals,
      tokenPriceUsd: env.tokenPriceUsdFallback
    });

    const chargeIdempotencyKey = `${requestRun.id}:charge`;
    const burnIdempotencyKey = `${requestRun.id}:burn`;

    await supabase.from("query_charges").insert({
      user_id: user.id,
      chat_id: activeChatId,
      message_id: userMessage.id,
      request_run_id: requestRun.id,
      status: "calculated",
      preflight_balance_raw: preflightBalance.rawAmount,
      estimated_cost_usd: env.maxQueryUsd,
      actual_llm_usd: pricing.actualLlmUsd,
      charged_usd: pricing.chargedUsd,
      token_price_usd: pricing.tokenPriceUsd,
      burn_amount_ui: pricing.burnAmountUi,
      burn_amount_raw: pricing.burnAmountRaw,
      burn_destination: env.burnWalletAddress,
      idempotency_key: chargeIdempotencyKey,
      pricing_inputs: toJson({
        min_query_usd: env.minQueryUsd,
        max_query_usd: env.maxQueryUsd,
        query_markup_multiplier: env.queryMarkupMultiplier,
        token_decimals: preflightBalance.decimals,
        model: llmResult.model,
        input_tokens: llmResult.inputTokens,
        output_tokens: llmResult.outputTokens
      })
    });

    requestRun = await transitionRequestRun({
      requestRun,
      status: "charge_calculated",
      supabase
    });

    const latestBalance = await get1337Balance({
      connection,
      owner: wallet.publicKey,
      tokenMint: env.tokenMint1337
    });

    if (BigInt(latestBalance.rawAmount) < BigInt(pricing.burnAmountRaw)) {
      await failRun({
        chatId: activeChatId,
        failureReason: "burn_failed_retriable",
        message:
          "1337 generated an answer, but the wallet no longer has enough 1337 to complete the burn/send transaction.",
        requestRun,
        status: 409,
        supabase,
        userId: user.id
      });
    }

    requestRun = await transitionRequestRun({
      requestRun,
      status: "burn_submitted",
      supabase
    });

    await supabase
      .from("query_charges")
      .update({
        status: "burn_submitted"
      })
      .eq("idempotency_key", chargeIdempotencyKey);

    const { data: existingBurn, error: existingBurnError } = await supabase
      .from("burn_attempts")
      .select("*")
      .eq("idempotency_key", burnIdempotencyKey)
      .maybeSingle();

    if (existingBurnError) {
      throw new Error(existingBurnError.message);
    }

    if (existingBurn?.status === "burn_confirmed" && existingBurn.signature) {
      await supabase
        .from("query_charges")
        .update({
          status: "burn_confirmed",
          burn_signature: existingBurn.signature
        })
        .eq("idempotency_key", chargeIdempotencyKey);
    }

    let burnSignature = existingBurn?.signature ?? null;

    if (existingBurn && !burnSignature) {
      await failRun({
        chatId: activeChatId,
        failureReason: "burn_failed_retriable",
        message:
          "A burn/send attempt already exists for this request but has not been confirmed. Reconciliation is required before retrying.",
        requestRun,
        status: 409,
        supabase,
        userId: user.id
      });
    }

    if (!burnSignature) {
      const { error: burnInsertError } = await supabase.from("burn_attempts").insert({
        request_run_id: requestRun.id,
        user_id: user.id,
        status: "burn_submitted",
        burn_amount_raw: pricing.burnAmountRaw,
        burn_amount_ui: pricing.burnAmountUi,
        token_mint: env.tokenMint1337,
        idempotency_key: burnIdempotencyKey
      });

      if (burnInsertError) {
        throw new Error(burnInsertError.message);
      }

      try {
        const ownerKeypair = await getWalletKeypair(
          supabase,
          user.id,
          env.walletEncryptionSecret
        );
        burnSignature = await send1337ToBurnWallet({
          amountRaw: BigInt(pricing.burnAmountRaw),
          burnWalletAddress: env.burnWalletAddress,
          connection,
          decimals: preflightBalance.decimals,
          mint: env.tokenMint1337,
          owner: ownerKeypair
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown burn/send failure";

        await supabase
          .from("burn_attempts")
          .update({
            status: "burn_failed_retriable",
            error: errorMessage
          })
          .eq("idempotency_key", burnIdempotencyKey);

        await supabase
          .from("query_charges")
          .update({
            status: "burn_failed_retriable",
            error: errorMessage
          })
          .eq("idempotency_key", chargeIdempotencyKey);

        await failRun({
          chatId: activeChatId,
          failureReason: "burn_failed_retriable",
          message:
            "1337 generated an answer, but the burn/send transaction failed before completion.",
          requestRun,
          status: 502,
          supabase,
          userId: user.id
        });
      }

      await supabase
        .from("burn_attempts")
        .update({
          status: "burn_confirmed",
          signature: burnSignature
        })
        .eq("idempotency_key", burnIdempotencyKey);

      await supabase
        .from("query_charges")
        .update({
          status: "burn_confirmed",
          burn_signature: burnSignature
        })
        .eq("idempotency_key", chargeIdempotencyKey);
    }

    requestRun = await transitionRequestRun({
      requestRun,
      status: "burn_confirmed",
      supabase
    });

    if (!burnSignature) {
      throw new Error("Burn/send transaction was not confirmed.");
    }

    const confirmedBurnSignature = burnSignature;

    const finalAnswer = [
      llmResult.answer,
      "",
      "---",
      `Cost: $${pricing.chargedUsd.toFixed(6)}`,
      `1337 consumed: ${pricing.burnAmountUi.toLocaleString(undefined, {
        maximumFractionDigits: 6
      })}`,
      `Transaction: ${confirmedBurnSignature}`
    ].join("\n");

    const { data: assistantMessage, error: assistantError } = await supabase
      .from("messages")
      .insert({
        chat_id: activeChatId,
        user_id: user.id,
        role: "assistant",
        content: finalAnswer,
        cost_usd: pricing.chargedUsd,
        burned_1337: pricing.burnAmountUi,
        burn_signature: confirmedBurnSignature
      })
      .select("*")
      .single();

    if (assistantError) {
      throw new Error(assistantError.message);
    }

    requestRun = await transitionRequestRun({
      metadata: toJson({
        assistant_message_id: assistantMessage.id
      }),
      requestRun,
      status: "completed",
      supabase
    });

    const updatedBalance = await get1337Balance({
      connection,
      owner: wallet.publicKey,
      tokenMint: env.tokenMint1337
    });

    await snapshotBalance({
      balance: updatedBalance,
      supabase,
      userId: user.id
    });

    return {
      chatId: activeChatId,
      requestRunId: requestRun.id,
      userMessage,
      assistantMessage,
      charge: {
        chargedUsd: pricing.chargedUsd,
        actualLlmUsd: pricing.actualLlmUsd,
        burned1337: pricing.burnAmountUi,
        burnSignature: confirmedBurnSignature
      },
      balance: {
        rawAmount: updatedBalance.rawAmount,
        uiAmount: updatedBalance.uiAmount,
        decimals: updatedBalance.decimals
      }
    };
  } catch (error) {
    if (error instanceof ChatRequestError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown request failure";

    if (requestRun) {
      await transitionRequestRun({
        failureReason: message.includes("OpenAI")
          ? "generation_failed"
          : "provider_unavailable",
        note: message,
        requestRun,
        status: "failed",
        supabase
      });
    }

    if (requestRun) {
      await insertFailedCharge({
        chatId: activeChatId,
        error: message,
        messageId: userMessage.id,
        requestRunId: requestRun.id,
        supabase,
        userId: user.id
      });
    }

    await insertSystemFailureMessage({
      chatId: activeChatId,
      content: `${message} No 1337 was charged or burned.`,
      supabase,
      userId: user.id
    });

    throw new ChatRequestError(message, 500);
  }
}
