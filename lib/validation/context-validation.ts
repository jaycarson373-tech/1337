import type { AdapterResult, ValidationResult } from "@/lib/context/contracts";
import type { IntentClassification } from "@/lib/router/intent";

function hasMetric(results: AdapterResult[], names: string[]) {
  return results.some((result) =>
    result.metrics.some((metric) => names.includes(metric.name))
  );
}

export function validateContext({
  adapters,
  classification
}: {
  adapters: AdapterResult[];
  classification: IntentClassification;
}): ValidationResult {
  const warnings: string[] = [];
  const unavailableSources: string[] = [];
  const conflicts: string[] = [];
  const okAdapters = adapters.filter((adapter) => adapter.status === "ok");
  const errorAdapters = adapters.filter((adapter) => adapter.status === "error");
  const partialAdapters = adapters.filter((adapter) => adapter.status === "partial");

  for (const adapter of errorAdapters) {
    unavailableSources.push(adapter.source);
    warnings.push(`${adapter.source} is unavailable: ${adapter.errors.join("; ")}`);
  }

  for (const adapter of partialAdapters) {
    warnings.push(`${adapter.source} returned partial context.`);
  }

  if (classification.intent === "news") {
    return {
      outcome: "invalid",
      degraded: false,
      dataQuality: {
        completeness: "insufficient",
        freshness: "unknown",
        source_coverage: "none",
        conflict_level: "none",
        confidence: "low",
        degraded_reason: "News analysis requires a cited news source, which is not in Phase 2 scope."
      },
      warnings,
      unavailableSources: ["News"],
      conflicts,
      failureReason: "context_unavailable"
    };
  }

  const hasMarket = hasMetric(adapters, ["price_usd", "market_cap_usd", "fdv_usd"]);
  const hasLiquidity = hasMetric(adapters, ["liquidity_usd", "volume_h24_usd"]);

  if (!okAdapters.length || !hasMarket || !hasLiquidity) {
    return {
      outcome: "degraded",
      degraded: true,
      dataQuality: {
        completeness: "partial",
        freshness: "mixed",
        source_coverage: okAdapters.length ? "limited" : "none",
        conflict_level: "none",
        confidence: "low",
        degraded_reason:
          "Market or liquidity context is incomplete. DexScreener may be unavailable or unable to identify a liquid pair."
      },
      warnings: [
        ...warnings,
        "Market/liquidity coverage is incomplete; confidence must be lowered."
      ],
      unavailableSources,
      conflicts
    };
  }

  if (classification.requiredContext.includes("protocol")) {
    warnings.push(
      "Protocol-specific revenue, TVL, and adoption adapters are not enabled in Phase 2."
    );
  }

  const degraded = warnings.length > 0;

  return {
    outcome: degraded ? "degraded" : "valid",
    degraded,
    dataQuality: {
      completeness: degraded ? "partial" : "complete",
      freshness: "fresh",
      source_coverage: okAdapters.length > 1 ? "strong" : "limited",
      conflict_level: "none",
      confidence: degraded ? "medium" : "high",
      degraded_reason: degraded ? warnings.join(" ") : null
    },
    warnings,
    unavailableSources,
    conflicts
  };
}
