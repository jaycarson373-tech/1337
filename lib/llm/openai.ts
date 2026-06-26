import { SYSTEM_PROMPT_1337 } from "@/lib/llm/system-prompt";

type OpenAIUsage = {
  input_tokens?: number;
  output_tokens?: number;
};

type OpenAIResponse = {
  id?: string;
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: OpenAIUsage;
  error?: {
    message?: string;
  };
};

export type LlmResult = {
  answer: string;
  provider: "openai";
  model: string;
  providerRequestId: string | null;
  inputTokens: number;
  outputTokens: number;
  actualCostUsd: number;
};

const MODEL_PRICING_USD_PER_1M: Record<string, { input: number; output: number }> = {
  "gpt-4.1-mini": {
    input: 0.4,
    output: 1.6
  },
  "gpt-4o-mini": {
    input: 0.15,
    output: 0.6
  },
  "gpt-4o": {
    input: 2.5,
    output: 10
  }
};

function extractOutputText(response: OpenAIResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text))
      .join("\n")
      .trim() ?? ""
  );
}

function calculateOpenAICost(model: string, inputTokens: number, outputTokens: number) {
  const pricing = MODEL_PRICING_USD_PER_1M[model] ?? MODEL_PRICING_USD_PER_1M["gpt-4.1-mini"];
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export async function generateCryptoAnswer({
  apiKey,
  researchPacket,
  userQuestion
}: {
  apiKey: string;
  researchPacket: string;
  userQuestion: string;
}): Promise<LlmResult> {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT_1337
        },
        {
          role: "user",
          content: [
            "User question:",
            userQuestion,
            "",
            "Validated Crypto Intelligence Layer research packet:",
            researchPacket,
            "",
            "Write the final answer using the 1337 research format and cite source IDs."
          ].join("\n")
        }
      ],
      temperature: 0.2
    })
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `OpenAI returned ${response.status}`);
  }

  const answer = extractOutputText(payload);

  if (!answer) {
    throw new Error("OpenAI returned an empty answer");
  }

  const inputTokens = payload.usage?.input_tokens ?? 0;
  const outputTokens = payload.usage?.output_tokens ?? 0;

  return {
    answer,
    provider: "openai",
    model,
    providerRequestId: payload.id ?? null,
    inputTokens,
    outputTokens,
    actualCostUsd: calculateOpenAICost(model, inputTokens, outputTokens)
  };
}
