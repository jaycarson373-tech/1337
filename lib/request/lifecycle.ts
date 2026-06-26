import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/supabase/database.types";

export type RequestLifecycleState =
  | "created"
  | "authenticated"
  | "balance_preflight_checked"
  | "intent_classified"
  | "context_gathering"
  | "context_validating"
  | "context_ready"
  | "context_degraded"
  | "generation_started"
  | "generation_succeeded"
  | "charge_calculated"
  | "burn_submitted"
  | "burn_confirmed"
  | "completed"
  | "failed";

export type FailureReason =
  | "unauthenticated"
  | "insufficient_balance"
  | "invalid_prompt"
  | "unsupported_intent"
  | "context_unavailable"
  | "context_validation_failed"
  | "generation_failed"
  | "pricing_failed"
  | "burn_failed_retriable"
  | "burn_failed_terminal"
  | "rate_limited"
  | "provider_unavailable";

type Transition = {
  status: RequestLifecycleState;
  at: string;
  note?: string;
};

function appendTransition(
  existing: Json,
  status: RequestLifecycleState,
  note?: string
): Json {
  const transitions = Array.isArray(existing) ? existing : [];
  return [
    ...transitions,
    {
      status,
      at: new Date().toISOString(),
      ...(note ? { note } : {})
    } satisfies Transition
  ] as Json;
}

export async function createRequestRun({
  chatId,
  idempotencyKey,
  messageId,
  supabase,
  userId
}: {
  chatId: string;
  idempotencyKey: string;
  messageId: string;
  supabase: SupabaseClient<Database>;
  userId: string;
}) {
  const initialTransitions = appendTransition([], "created");
  const { data, error } = await supabase
    .from("request_runs")
    .insert({
      user_id: userId,
      chat_id: chatId,
      message_id: messageId,
      status: "created",
      idempotency_key: idempotencyKey,
      transitions: initialTransitions
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function transitionRequestRun({
  degraded,
  failureReason,
  intent,
  metadata,
  note,
  requestRun,
  status,
  supabase
}: {
  degraded?: boolean;
  failureReason?: FailureReason | null;
  intent?: string | null;
  metadata?: Json;
  note?: string;
  requestRun: Tables<"request_runs">;
  status: RequestLifecycleState;
  supabase: SupabaseClient<Database>;
}) {
  const transitions = appendTransition(requestRun.transitions, status, note);
  const { data, error } = await supabase
    .from("request_runs")
    .update({
      status,
      transitions,
      ...(typeof degraded === "boolean" ? { degraded } : {}),
      ...(failureReason !== undefined ? { failure_reason: failureReason } : {}),
      ...(intent !== undefined ? { intent } : {}),
      ...(metadata !== undefined ? { metadata } : {})
    })
    .eq("id", requestRun.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
