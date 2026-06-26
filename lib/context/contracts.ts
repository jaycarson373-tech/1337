export type AdapterStatus = "ok" | "partial" | "stale" | "error";
export type SourceType =
  | "market"
  | "liquidity"
  | "protocol"
  | "onchain"
  | "news"
  | "social"
  | "code"
  | "wallet"
  | "other";
export type SourceTrustTier = "primary" | "secondary" | "derived" | "untrusted";
export type Confidence = "high" | "medium" | "low";
export type Intent =
  | "general"
  | "token_analysis"
  | "wallet_analysis"
  | "protocol_research"
  | "portfolio"
  | "narrative"
  | "news";

export type Citation = {
  citation_id: string;
  source_name: string;
  source_url: string | null;
  adapter_id: string;
  fetched_at: string;
  observed_at: string | null;
  title: string | null;
  publisher: string | null;
};

export type AdapterFact = {
  fact_id: string;
  statement: string;
  category:
    | "price"
    | "liquidity"
    | "volume"
    | "tvl"
    | "revenue"
    | "holders"
    | "transaction"
    | "news"
    | "protocol"
    | "risk"
    | "catalyst"
    | "other";
  citation_ids: string[];
  confidence: Confidence;
  observed_at: string;
};

export type AdapterMetric = {
  metric_id: string;
  name: string;
  value: string | number | boolean | null;
  unit: string;
  citation_ids: string[];
  observed_at: string;
  confidence: Confidence;
};

export type AdapterResult = {
  adapter_id: string;
  source: string;
  source_url: string | null;
  source_type: SourceType;
  source_trust_tier: SourceTrustTier;
  fetched_at: string;
  observed_at: string | null;
  expires_at: string;
  status: AdapterStatus;
  entity: string | null;
  summary: string;
  facts: AdapterFact[];
  metrics: AdapterMetric[];
  citations: Citation[];
  importance: number;
  confidence: Confidence;
  metadata: Record<string, string | number | boolean | null>;
  errors: string[];
};

export type DataQuality = {
  completeness: "complete" | "partial" | "insufficient";
  freshness: "fresh" | "stale" | "mixed" | "unknown";
  source_coverage: "strong" | "limited" | "none";
  conflict_level: "none" | "low" | "medium" | "high";
  confidence: Confidence;
  degraded_reason: string | null;
};

export type ValidationResult = {
  outcome: "valid" | "degraded" | "invalid";
  degraded: boolean;
  dataQuality: DataQuality;
  warnings: string[];
  unavailableSources: string[];
  conflicts: string[];
  failureReason?: string;
};

export type ResearchPacket = {
  request_run_id: string;
  intent: Intent;
  user_question: string;
  generated_at: string;
  degraded: boolean;
  data_quality: DataQuality;
  sections: Record<
    | "market"
    | "liquidity"
    | "protocol"
    | "onchain"
    | "news"
    | "catalysts"
    | "risks"
    | "question"
    | "sources"
    | "data_quality",
    string
  >;
  citations: Citation[];
  validation_warnings: string[];
  unavailable_sources: string[];
  source_conflicts: string[];
};

export type ResearchContext = ResearchPacket;
