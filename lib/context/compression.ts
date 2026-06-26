import type {
  AdapterResult,
  DataQuality,
  Intent,
  ResearchPacket,
  ValidationResult
} from "@/lib/context/contracts";

function formatFacts(adapters: AdapterResult[], categories: string[]) {
  const facts = adapters.flatMap((adapter) =>
    adapter.facts.filter((fact) => categories.includes(fact.category))
  );

  if (!facts.length) {
    return "Unavailable in the current context.";
  }

  return facts
    .map((fact) => `- ${fact.statement} [${fact.citation_ids.join(", ")}]`)
    .join("\n");
}

function formatMetrics(adapters: AdapterResult[], names: string[]) {
  const metrics = adapters.flatMap((adapter) =>
    adapter.metrics.filter((metric) => names.includes(metric.name))
  );

  if (!metrics.length) {
    return "No normalized metrics available.";
  }

  return metrics
    .map(
      (metric) =>
        `- ${metric.name}: ${metric.value} ${metric.unit} [${metric.citation_ids.join(", ")}]`
    )
    .join("\n");
}

function formatSources(adapters: AdapterResult[]) {
  const citations = adapters.flatMap((adapter) => adapter.citations);

  if (!citations.length) {
    return "No external source citations available.";
  }

  return citations
    .map(
      (citation) =>
        `- [${citation.citation_id}] ${citation.source_name}${
          citation.source_url ? ` - ${citation.source_url}` : ""
        }`
    )
    .join("\n");
}

function formatDataQuality(dataQuality: DataQuality) {
  return [
    `Completeness: ${dataQuality.completeness}`,
    `Freshness: ${dataQuality.freshness}`,
    `Source coverage: ${dataQuality.source_coverage}`,
    `Conflict level: ${dataQuality.conflict_level}`,
    `Confidence: ${dataQuality.confidence}`,
    dataQuality.degraded_reason ? `Degraded reason: ${dataQuality.degraded_reason}` : null
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildResearchPacket({
  adapters,
  intent,
  requestRunId,
  userQuestion,
  validation
}: {
  adapters: AdapterResult[];
  intent: Intent;
  requestRunId: string;
  userQuestion: string;
  validation: ValidationResult;
}): ResearchPacket {
  const citations = adapters.flatMap((adapter) => adapter.citations);

  return {
    request_run_id: requestRunId,
    intent,
    user_question: userQuestion,
    generated_at: new Date().toISOString(),
    degraded: validation.degraded,
    data_quality: validation.dataQuality,
    sections: {
      market: [
        formatFacts(adapters, ["price", "other"]),
        formatMetrics(adapters, ["price_usd", "market_cap_usd", "fdv_usd", "price_change_h24"])
      ].join("\n"),
      liquidity: [
        formatFacts(adapters, ["liquidity", "volume"]),
        formatMetrics(adapters, ["liquidity_usd", "volume_h24_usd"])
      ].join("\n"),
      protocol:
        intent === "protocol_research"
          ? "Protocol-specific revenue, TVL, and adoption adapters are not enabled in Phase 2. Use available market and liquidity context only."
          : "No protocol-specific context requested or available.",
      onchain:
        "Wallet and on-chain behavioral analysis beyond the deposit balance is not enabled in Phase 2.",
      news:
        intent === "news"
          ? "News analysis requires a cited news adapter and is unavailable in Phase 2."
          : "No cited news context was gathered in Phase 2.",
      catalysts:
        "Infer catalysts only from supplied market/liquidity context. Do not invent news or roadmap items.",
      risks:
        "Discuss liquidity risk, market risk, execution risk, tokenomics risk, competitive risk, and smart contract risk. Clearly label general category risks.",
      question: userQuestion,
      sources: formatSources(adapters),
      data_quality: formatDataQuality(validation.dataQuality)
    },
    citations,
    validation_warnings: validation.warnings,
    unavailable_sources: validation.unavailableSources,
    source_conflicts: validation.conflicts
  };
}

export function researchPacketToPrompt(packet: ResearchPacket) {
  return JSON.stringify(packet, null, 2);
}
