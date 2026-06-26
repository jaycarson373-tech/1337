import type { UsageSummary } from "@/lib/chat/types";

export function IntelligenceRail({ summary }: { summary: UsageSummary }) {
  return (
    <aside className="intelligence-rail" aria-label="Crypto intelligence metrics">
      <section className="rail-card">
        <div className="rail-card-header">
          <p className="app-eyebrow">Today</p>
          <span className="live-dot" aria-hidden="true" />
        </div>
        <div className="rail-metric">
          <span>Queries</span>
          <strong>{summary.todaysQueries}</strong>
        </div>
        <div className="rail-metric">
          <span>1337 burned</span>
          <strong>
            {summary.burnedToday.toLocaleString(undefined, {
              maximumFractionDigits: 6
            })}
          </strong>
        </div>
      </section>

      <section className="rail-card">
        <p className="app-eyebrow">Data Quality</p>
        <div className="quality-list">
          <div>
            <span>Freshness</span>
            <strong>{summary.dataFreshness}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{summary.confidenceScore}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>V1 Research</strong>
          </div>
        </div>
      </section>

      <section className="rail-card">
        <p className="app-eyebrow">Live Connectors</p>
        <div className="connector-list">
          <span>DexScreener</span>
          <span>Solana RPC</span>
          <span>OpenAI</span>
          <span>Supabase</span>
        </div>
      </section>
    </aside>
  );
}
