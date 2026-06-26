import type { AdapterMetric, AdapterResult } from "@/lib/context/contracts";

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };
  quoteToken?: {
    symbol?: string;
  };
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
  };
  priceChange?: {
    h24?: number;
    h6?: number;
    h1?: number;
  };
  txns?: {
    h24?: {
      buys?: number;
      sells?: number;
    };
  };
};

type DexSearchResponse = {
  pairs?: DexPair[];
};

function numberMetric({
  id,
  name,
  value,
  unit,
  citationId,
  observedAt
}: {
  id: string;
  name: string;
  value: number | string | null | undefined;
  unit: string;
  citationId: string;
  observedAt: string;
}): AdapterMetric | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(normalized)) {
    return null;
  }

  return {
    metric_id: id,
    name,
    value: normalized,
    unit,
    citation_ids: [citationId],
    observed_at: observedAt,
    confidence: "medium"
  };
}

export async function fetchDexScreenerContext(query: string): Promise<AdapterResult> {
  const fetchedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        accept: "application/json"
      },
      next: {
        revalidate: 60
      }
    });

    if (!response.ok) {
      throw new Error(`DexScreener returned ${response.status}`);
    }

    const payload = (await response.json()) as DexSearchResponse;
    const pairs = (payload.pairs ?? [])
      .filter((pair) => pair.baseToken?.symbol && pair.url)
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
      .slice(0, 3);

    if (!pairs.length) {
      return {
        adapter_id: "dexscreener",
        source: "DexScreener",
        source_url: searchUrl,
        source_type: "market",
        source_trust_tier: "secondary",
        fetched_at: fetchedAt,
        observed_at: fetchedAt,
        expires_at: expiresAt,
        status: "partial",
        entity: query,
        summary: "DexScreener returned no matching liquid pairs for this query.",
        facts: [],
        metrics: [],
        citations: [],
        importance: 0.5,
        confidence: "low",
        metadata: {
          result_count: 0
        },
        errors: ["No matching pairs found."]
      };
    }

    const citations = pairs.map((pair, index) => ({
      citation_id: `dex-${index + 1}`,
      source_name: `DexScreener ${pair.baseToken?.symbol ?? "pair"} / ${
        pair.quoteToken?.symbol ?? "quote"
      }`,
      source_url: pair.url ?? searchUrl,
      adapter_id: "dexscreener",
      fetched_at: fetchedAt,
      observed_at: fetchedAt,
      title: `${pair.baseToken?.symbol ?? "Token"} on ${pair.dexId ?? "DEX"}`,
      publisher: "DexScreener"
    }));

    const facts = pairs.flatMap((pair, index) => {
      const citationId = citations[index].citation_id;
      const label = `${pair.baseToken?.symbol ?? "Token"} / ${
        pair.quoteToken?.symbol ?? "quote"
      } on ${pair.dexId ?? "unknown DEX"} (${pair.chainId ?? "unknown chain"})`;
      const statements = [
        pair.priceUsd
          ? `${label} is quoted around $${Number(pair.priceUsd).toLocaleString(undefined, {
              maximumSignificantDigits: 6
            })}.`
          : null,
        pair.liquidity?.usd
          ? `${label} shows about $${Math.round(pair.liquidity.usd).toLocaleString()} in liquidity.`
          : null,
        pair.volume?.h24
          ? `${label} shows about $${Math.round(pair.volume.h24).toLocaleString()} in 24h volume.`
          : null,
        typeof pair.priceChange?.h24 === "number"
          ? `${label} has a 24h price change of ${pair.priceChange.h24.toFixed(2)}%.`
          : null
      ].filter((statement): statement is string => Boolean(statement));

      return statements.map((statement, factIndex) => ({
        fact_id: `dex-${index + 1}-fact-${factIndex + 1}`,
        statement,
        category:
          factIndex === 0
            ? ("price" as const)
            : factIndex === 1
              ? ("liquidity" as const)
              : factIndex === 2
                ? ("volume" as const)
                : ("other" as const),
        citation_ids: [citationId],
        confidence: "medium" as const,
        observed_at: fetchedAt
      }));
    });

    const metrics = pairs.flatMap((pair, index) => {
      const citationId = citations[index].citation_id;
      const prefix = `dex-${index + 1}`;

      return [
        numberMetric({
          id: `${prefix}-price-usd`,
          name: "price_usd",
          value: pair.priceUsd,
          unit: "USD",
          citationId,
          observedAt: fetchedAt
        }),
        numberMetric({
          id: `${prefix}-liquidity-usd`,
          name: "liquidity_usd",
          value: pair.liquidity?.usd,
          unit: "USD",
          citationId,
          observedAt: fetchedAt
        }),
        numberMetric({
          id: `${prefix}-volume-h24-usd`,
          name: "volume_h24_usd",
          value: pair.volume?.h24,
          unit: "USD",
          citationId,
          observedAt: fetchedAt
        }),
        numberMetric({
          id: `${prefix}-price-change-h24-pct`,
          name: "price_change_h24",
          value: pair.priceChange?.h24,
          unit: "percentage_points",
          citationId,
          observedAt: fetchedAt
        }),
        numberMetric({
          id: `${prefix}-market-cap-usd`,
          name: "market_cap_usd",
          value: pair.marketCap,
          unit: "USD",
          citationId,
          observedAt: fetchedAt
        }),
        numberMetric({
          id: `${prefix}-fdv-usd`,
          name: "fdv_usd",
          value: pair.fdv,
          unit: "USD",
          citationId,
          observedAt: fetchedAt
        })
      ].filter((metric): metric is AdapterMetric => Boolean(metric));
    });

    const topPair = pairs[0];

    return {
      adapter_id: "dexscreener",
      source: "DexScreener",
      source_url: topPair.url ?? searchUrl,
      source_type: "market",
      source_trust_tier: "secondary",
      fetched_at: fetchedAt,
      observed_at: fetchedAt,
      expires_at: expiresAt,
      status: pairs.length > 0 ? "ok" : "partial",
      entity: topPair.baseToken?.symbol ?? query,
      summary: `DexScreener returned ${pairs.length} liquid pair${
        pairs.length === 1 ? "" : "s"
      } relevant to "${query}".`,
      facts,
      metrics,
      citations,
      importance: 0.9,
      confidence: facts.length ? "medium" : "low",
      metadata: {
        result_count: pairs.length,
        top_chain: topPair.chainId ?? null,
        top_dex: topPair.dexId ?? null,
        top_pair_address: topPair.pairAddress ?? null
      },
      errors: []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DexScreener error";

    return {
      adapter_id: "dexscreener",
      source: "DexScreener",
      source_url: searchUrl,
      source_type: "market",
      source_trust_tier: "secondary",
      fetched_at: fetchedAt,
      observed_at: null,
      expires_at: expiresAt,
      status: "error",
      entity: query,
      summary: "DexScreener context is unavailable.",
      facts: [],
      metrics: [],
      citations: [],
      importance: 0.9,
      confidence: "low",
      metadata: {},
      errors: [message]
    };
  }
}
