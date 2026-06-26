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
    body: "Hyperliquid continues to sit at the intersection of perps liquidity, product velocity and exchange-native distribution."
  },
  {
    title: "Bull Case",
    body: "If volume, fees and developer mindshare keep compounding, the protocol can become a durable trading venue."
  },
  {
    title: "Bear Case",
    body: "Execution risk, exchange competition and market-wide leverage cycles remain the primary pressure points."
  },
  {
    title: "Risks",
    body: "Liquidity concentration, smart contract exposure, incentive durability and regulatory sensitivity."
  },
  {
    title: "What To Watch",
    body: "Daily volume, open interest, fee capture, builder activity and user retention during volatility."
  },
  {
    title: "Confidence",
    body: "Medium. Strong directional read, but live source confirmation is required before investment decisions."
  }
];

const layerCards = [
  {
    title: "Crypto Intelligence Layer",
    body: "1337 is built around context quality. Market, protocol and on-chain inputs are gathered before the model writes."
  },
  {
    title: "Research Before Answering",
    body: "The product flow is deliberately analyst-like: classify intent, collect context, compress signal, then reason."
  },
  {
    title: "Powered by 1337",
    body: "The token is designed as computational fuel for successful requests, not a decorative add-on."
  }
];

const tokenCards = [
  {
    title: "Every Query Consumes 1337",
    body: "Successful AI requests consume 1337 based on the real cost of running the platform."
  },
  {
    title: "50% Creator Fees Buyback & Burn",
    body: "Half of creator fees are allocated to buying back and permanently burning 1337."
  },
  {
    title: "50% Treasury for AI Infrastructure and Growth",
    body: "The treasury funds model providers, data providers, GPUs, development, security and growth."
  }
];

const roadmap = ["API", "Telegram", "Discord", "Agents"];

export function LandingPage() {
  return (
    <main className="page">
      <div className="ambient" aria-hidden="true" />
      <Header />
      <Hero />
      <LayerSection />
      <TokenSection />
      <RoadmapSection />
      <Footer />
    </main>
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
      <div className="shell hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">1337 / The Crypto Intelligence Model.</p>
          <h1>1337 researches crypto before it answers.</h1>
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
            <Image src="/1337-logo.png" alt="" width={44} height={44} />
          </span>
          <div>
            <p>1337 Research Session</p>
            <span>Live intelligence preview</span>
          </div>
        </div>
        <span className="status-pill">Researching</span>
      </div>

      <div className="console-body">
        <div className="chat-column">
          <div className="message user-message">
            <span>User</span>
            <p>Analyze Hyperliquid.</p>
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

        <div className="answer-column">
          <div className="answer-topline">
            <div>
              <p className="answer-label">Polished answer card</p>
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
          title="ChatGPT ease. Cursor focus. Linear polish. Perplexity-style research."
          body="The interface is intentionally calm. The work happens below the surface: intent, source gathering, context compression and structured reasoning."
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
          body="1337 presents token utility as product infrastructure: clean, direct and tied to successful requests."
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
              The intelligence layer is designed to become a surface that users,
              bots and builders can consume wherever crypto decisions happen.
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
