export type PricingInputs = {
  actualLlmUsd: number;
  maxQueryUsd: number;
  minQueryUsd: number;
  queryMarkupMultiplier: number;
  tokenDecimals: number;
  tokenPriceUsd: number;
};

export type PricingResult = {
  actualLlmUsd: number;
  chargedUsd: number;
  tokenPriceUsd: number;
  burnAmountUi: number;
  burnAmountRaw: string;
};

export function calculatePricing({
  actualLlmUsd,
  maxQueryUsd,
  minQueryUsd,
  queryMarkupMultiplier,
  tokenDecimals,
  tokenPriceUsd
}: PricingInputs): PricingResult {
  if (!Number.isFinite(actualLlmUsd) || actualLlmUsd < 0) {
    throw new Error("Actual LLM cost is invalid");
  }

  const markedUp = actualLlmUsd * queryMarkupMultiplier;
  const chargedUsd = Math.min(Math.max(minQueryUsd, markedUp), maxQueryUsd);
  const burnAmountUi = chargedUsd / tokenPriceUsd;
  const multiplier = 10 ** tokenDecimals;
  const burnAmountRaw = BigInt(Math.ceil(burnAmountUi * multiplier)).toString();

  return {
    actualLlmUsd,
    chargedUsd,
    tokenPriceUsd,
    burnAmountUi,
    burnAmountRaw
  };
}

export function estimatePreflightBurnRaw({
  maxQueryUsd,
  tokenDecimals,
  tokenPriceUsd
}: {
  maxQueryUsd: number;
  tokenDecimals: number;
  tokenPriceUsd: number;
}) {
  const multiplier = 10 ** tokenDecimals;
  return BigInt(Math.ceil((maxQueryUsd / tokenPriceUsd) * multiplier));
}
