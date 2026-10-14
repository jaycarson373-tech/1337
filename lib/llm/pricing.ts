export const OPENAI_MODEL_PRICING_USD_PER_1M = {
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 }
} as const;

export type PricedOpenAIModel = keyof typeof OPENAI_MODEL_PRICING_USD_PER_1M;

export function assertPricedOpenAIModel(model: string): asserts model is PricedOpenAIModel {
  if (!Object.hasOwn(OPENAI_MODEL_PRICING_USD_PER_1M, model)) {
    throw new Error(`OpenAI model "${model}" has no configured billing schedule.`);
  }
}

export function calculateOpenAICost(model: string, inputTokens: number, outputTokens: number) {
  assertPricedOpenAIModel(model);

  if (
    !Number.isSafeInteger(inputTokens) || inputTokens < 0 ||
    !Number.isSafeInteger(outputTokens) || outputTokens < 0
  ) {
    throw new Error("OpenAI token usage is invalid.");
  }

  const pricing = OPENAI_MODEL_PRICING_USD_PER_1M[model];
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}
