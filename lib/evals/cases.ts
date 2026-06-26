import type { EvalCase } from "@/lib/evals/types";

export const phase2EvalCases: EvalCase[] = [
  {
    eval_case_id: "phase2-token-hyperliquid",
    name: "Token analysis with DexScreener citations",
    intent: "token_analysis",
    user_prompt: "Analyze Hyperliquid.",
    expected_required_sources: ["market", "liquidity"],
    expected_degraded: false,
    expected_citations: ["dex-1"],
    expected_confidence: "medium",
    prohibited_claims: ["guaranteed", "risk-free"],
    expected_failure_reason: null
  },
  {
    eval_case_id: "phase2-dex-degraded",
    name: "DexScreener unavailable lowers confidence",
    intent: "token_analysis",
    user_prompt: "Should I buy this token?",
    expected_required_sources: ["market", "liquidity"],
    expected_degraded: true,
    expected_citations: [],
    expected_confidence: "low",
    prohibited_claims: ["verified liquidity", "confirmed volume"],
    expected_failure_reason: null
  },
  {
    eval_case_id: "phase2-news-fail-closed",
    name: "News request fails without cited news adapter",
    intent: "news",
    user_prompt: "What is the latest news on SOL?",
    expected_required_sources: ["news"],
    expected_degraded: false,
    expected_citations: [],
    expected_confidence: "low",
    prohibited_claims: ["breaking"],
    expected_failure_reason: "context_unavailable"
  }
];
