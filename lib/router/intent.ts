import type { Intent } from "@/lib/context/contracts";

export type IntentClassification = {
  intent: Intent;
  supported: boolean;
  requiredContext: Array<"market" | "liquidity" | "protocol" | "news">;
  minimumSources: number;
};

const walletPattern = /\b(wallet|address|holdings|transactions?|transfers?)\b/i;
const portfolioPattern = /\b(portfolio|allocation|my bags|my positions?)\b/i;
const newsPattern = /\b(news|headline|happened|announcement|recent|latest)\b/i;
const narrativePattern = /\b(narrative|sector|trend|meta|rotation)\b/i;
const protocolPattern = /\b(protocol|tvl|revenue|fees|dao|chain|dex|perps|exchange)\b/i;
const tokenPattern = /\b(token|coin|price|liquidity|volume|market cap|mcap|buy|sell|bull|bear|analy[sz]e)\b/i;

export function classifyIntent(prompt: string): IntentClassification {
  if (walletPattern.test(prompt)) {
    return {
      intent: "wallet_analysis",
      supported: false,
      requiredContext: [],
      minimumSources: 0
    };
  }

  if (portfolioPattern.test(prompt)) {
    return {
      intent: "portfolio",
      supported: false,
      requiredContext: [],
      minimumSources: 0
    };
  }

  if (newsPattern.test(prompt)) {
    return {
      intent: "news",
      supported: true,
      requiredContext: ["news"],
      minimumSources: 1
    };
  }

  if (narrativePattern.test(prompt)) {
    return {
      intent: "narrative",
      supported: true,
      requiredContext: ["market", "liquidity"],
      minimumSources: 1
    };
  }

  if (protocolPattern.test(prompt)) {
    return {
      intent: "protocol_research",
      supported: true,
      requiredContext: ["market", "liquidity", "protocol"],
      minimumSources: 1
    };
  }

  if (tokenPattern.test(prompt)) {
    return {
      intent: "token_analysis",
      supported: true,
      requiredContext: ["market", "liquidity"],
      minimumSources: 1
    };
  }

  return {
    intent: "general",
    supported: true,
    requiredContext: ["market"],
    minimumSources: 0
  };
}
