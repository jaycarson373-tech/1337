import type { Intent } from "@/lib/context/contracts";

export type EvalCase = {
  eval_case_id: string;
  name: string;
  intent: Intent;
  user_prompt: string;
  expected_required_sources: string[];
  expected_degraded: boolean;
  expected_citations: string[];
  expected_confidence: "high" | "medium" | "low";
  prohibited_claims: string[];
  expected_failure_reason: string | null;
};
