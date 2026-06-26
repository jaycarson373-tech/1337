import Image from "next/image";

const researchSteps = [
  "Scanning market data",
  "Checking liquidity",
  "Reading protocol metrics",
  "Compressing context",
  "Reasoning"
];

const answerSections = [
  {
    title: "Summary",
    body: "Hyperliquid sits at the intersection of perps liquidity, product velocity and exchange-native distribution."
  },
  {
    title: "Bull Case",
    body: "Volume, fees and builder mindshare can compound into a durable trading venue."
  },
  {
    title: "Bear Case",
    body: "Execution risk, competition and leverage cycles remain the pressure points."
  },
  {
    title: "Risks",
    body: "Liquidity concentration, contract exposure, incentives and regulation."
  },
  {
    title: "What To Watch",
    body: "Volume, open interest, fees, builder activity and retention."
  },
  {
    title: "Confidence",
    body: "Medium. Strong read, but live source confirmation matters."
  }
];

const layerCards = [
  {
    title: "Crypto Intelligence Layer",
    body: "Market, protocol and on-chain inputs are gathered before the model writes."
  },
  {
    title: "Research Before Answering",
    body: "Classify intent, collect context, compress signal, then reason."
  },
  {
    title: "Powered by 1337",
    body: "The token is computational fuel for successful requests."
  }
];

const tokenCards = [
  {
    title: "Every Query Consumes 1337",
    body: "Successful requests consume 1337 based on real platform cost."
  },
  {
    title: "50% Creator Fees Buyback & Burn",
    body: "Half of creator fees buy back and permanently burn 1337."
  },
  {
    title: "50% Treasury for AI Infrastructure and Growth",
    body: "Treasury funds models, data, GPUs, development and growth."
  }
];

const roadmap = ["API", "Telegram", "Discord", "Agents"];

const heroSignals = ["Market data", "Liquidity", "On-chain", "Protocol metrics"];

const sourceSystems = [
  ["DexScreener", "Market"],
  ["Solana RPC", "On-chain"],
  ["CoinGecko", "Prices"],
  ["DefiLlama", "Protocol"]
];

export function LandingPage() {
  return (
    <main className="page">
      <div className="ambient" aria-hidden="true" />
      <BackgroundGraphics />
      <Header />
      <Hero />
      <LayerSection />
      <TokenSection />
      <RoadmapSection />
      <Footer />
    </main>
  );
}

function BackgroundGraphics() {
  return (
    <div className="site-background" aria-hidden="true">
      <div className="bg-graphic bg-graphic-hero" />
      <div className="bg-graphic bg-graphic-layer" />
      <div className="bg-graphic bg-graphic-token" />
      <div className="bg-graphic bg-graphic-roadmap" />
      <div className="bg-graphic bg-graphic-rain" />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <nav className="shell nav" aria-label="Main navigation">
        <a href="#" className="brand" aria-label="1337 home">
          <span className="brand-mark">
            <Image src="/1337-logo.png" alt="" width={64} height={64} priority />
          </span>
          <span className="brand-copy">
            <span className="brand-name">1337</span>
            <span className="brand-subtitle">The Crypto Intelligence Model</span>
          </span>
        </a>

        <div className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#powered">Powered by 1337</a>
          <a href="#roadmap">Roadmap</a>
        </div>

        <a className="nav-cta" href="#how-it-works">
          Launch 1337
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-datacenter" aria-hidden="true" />
      <div className="shell hero-shell">
        <div className="hero-copy">
          <div className="hero-terminal-strip" aria-label="Crypto intelligence terminal status">
            <span className="terminal-dot" aria-hidden="true" />
            <span>Crypto Intelligence Terminal</span>
            <strong>Live research stack</strong>
          </div>
          <div className="hero-logo-card" aria-hidden="true">
            <Image src="/1337-logo.png" alt="" width={96} height={96} priority />
          </div>
          <p className="eyebrow">1337 / The Crypto Intelligence Model.</p>
          <h1>
            <span>1337 researches crypto</span>
            <span>before it answers.</span>
          </h1>
          <p className="hero-subtext">
            Ask anything about crypto. 1337 pulls live market, on-chain and
            protocol data into a Crypto Intelligence Layer before answering.
          </p>

          <div className="hero-actions">
            <a className="button-primary" href="#how-it-works">
              Launch 1337
            </a>
            <a className="button-secondary" href="#how-it-works">
              How It Works
            </a>
          </div>

          <div className="hero-signal-row" aria-label="Crypto intelligence data layers">
            {heroSignals.map((signal) => (
              <span key={signal}>
                <i aria-hidden="true" />
                {signal}
              </span>
            ))}
          </div>
        </div>

        <HeroConsole />
      </div>
    </section>
  );
}

function HeroConsole() {
  return (
    <section id="how-it-works" className="console" aria-label="1337 chat preview">
      <div className="console-header">
        <div className="console-brand">
          <span className="console-logo">
            <Image src="/1337-logo.png" alt="" width={52} height={52} />
          </span>
          <div>
            <p>1337</p>
            <span>Research session</span>
          </div>
        </div>
        <span className="status-pill">
          <i aria-hidden="true" />
          Researching
        </span>
      </div>

      <div className="console-systems" aria-label="Data sources preview">
        {sourceSystems.map(([name, detail]) => (
          <div key={name}>
            <span>{name}</span>
            <strong>{detail}</strong>
          </div>
        ))}
      </div>

      <div className="console-body">
        <div className="chat-column">
          <div className="message-row">
            <div className="avatar user-avatar" aria-hidden="true">
              U
            </div>
            <div className="message user-message">
              <span>User</span>
              <p>Analyze Hyperliquid.</p>
            </div>
          </div>

          <div className="message-row">
            <div className="avatar logo-avatar" aria-hidden="true">
              <Image src="/1337-logo.png" alt="" width={28} height={28} />
            </div>
            <div className="message assistant-message">
              <span>1337</span>
              <div className="research-list">
                {researchSteps.map((step) => (
                  <div className="research-step" key={step}>
                    <i aria-hidden="true" />
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="answer-column">
          <div className="answer-topline">
            <div>
              <p className="answer-label">Institutional research brief</p>
              <h2>Hyperliquid analysis</h2>
            </div>
            <span>Confidence: Medium</span>
          </div>

          <div className="answer-grid">
            {answerSections.map((section) => (
              <article className="answer-section" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LayerSection() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeader
          eyebrow="System"
          title="A crypto-native research workstation."
          body="A calm interface for intent, source gathering, context compression and structured reasoning."
        />

        <div className="cards three-up">
          {layerCards.map((card) => (
            <article className="card" key={card.title}>
              <span className="card-rule" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TokenSection() {
  return (
    <section id="powered" className="section section-tight">
      <div className="shell">
        <SectionHeader
          eyebrow="Economics"
          title="Usage powers the network."
          body="Token utility stays clean, direct and tied to successful requests."
        />

        <div className="cards three-up">
          {tokenCards.map((card) => (
            <article className="card" key={card.title}>
              <span className="card-rule" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="section">
      <div className="shell">
        <div className="roadmap-panel">
          <div>
            <p className="eyebrow">Roadmap</p>
            <h2>API, Telegram, Discord, Agents.</h2>
            <p>
              The intelligence layer can move wherever crypto decisions happen.
            </p>
          </div>

          <div className="roadmap-grid">
            {roadmap.map((item) => (
              <article key={item}>
                <span>{item}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <Image src="/1337-logo.png" alt="" width={28} height={28} />
          <span>1337</span>
        </div>
        <p>The Crypto Intelligence Model.</p>
      </div>
    </footer>
  );
}
