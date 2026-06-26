import Image from "next/image";

const researchSteps = [
  "Scanning market data...",
  "Checking liquidity...",
  "Reading protocol metrics...",
  "Compressing context...",
  "Reasoning..."
];

const answerSections = [
  "Summary",
  "Bull Case",
  "Bear Case",
  "Risks",
  "What To Watch",
  "Confidence"
];

const intelligenceLayer = [
  {
    tag: "01",
    title: "Live Market Context",
    body: "Built to pull price, volume, liquidity and exchange context before the model starts writing."
  },
  {
    tag: "02",
    title: "On-chain Awareness",
    body: "Designed around wallet, protocol and activity signals instead of generic web summaries."
  },
  {
    tag: "03",
    title: "Compressed Research",
    body: "Raw information becomes structured context the model can reason over without drowning in noise."
  }
];

const researchPrinciples = [
  "Intent first. Data second. Answer third.",
  "Facts, interpretation, speculation and unknowns stay separated.",
  "Missing context lowers confidence instead of becoming invented certainty."
];

const tokenUtility = [
  {
    tag: "1337",
    title: "Every Query Consumes 1337",
    body: "Users deposit 1337 and successful requests consume token based on the real cost of the AI request."
  },
  {
    tag: "50%",
    title: "50% Creator Fees Buyback & Burn",
    body: "Platform economics route half of creator fees toward buying back and permanently burning 1337."
  },
  {
    tag: "50%",
    title: "50% Treasury for AI Infrastructure and Growth",
    body: "The treasury funds model providers, data providers, GPUs, development, security and growth."
  }
];

const roadmap = ["API", "Telegram", "Discord", "Agents"];

export function LandingPage() {
  return (
    <main className="page">
      <div aria-hidden="true" className="background-grid" />
      <div aria-hidden="true" className="background-aura" />
      <div aria-hidden="true" className="top-beam" />
      <Header />
      <Hero />
      <IntelligenceSection />
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
            <Image
              src="/1337-logo.png"
              alt=""
              width={84}
              height={84}
              priority
            />
          </span>
          <span>
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
          <span aria-hidden="true">-&gt;</span>
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-logo-orbit" aria-hidden="true">
        <Image
          src="/1337-logo.png"
          alt=""
          fill
          className="hero-logo"
          priority
          sizes="(max-width: 768px) 96vw, 720px"
        />
      </div>

      <div className="shell hero-content">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="spark" aria-hidden="true" />
            <span>1337</span>
            <span className="spark" aria-hidden="true" />
            <span>The Crypto Intelligence Model.</span>
          </div>

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

        <div id="how-it-works" className="preview-grid">
          <ChatPreview />
          <AnswerCard />
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <section className="glass-panel terminal" aria-label="1337 research preview">
      <div className="panel-top">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="panel-kicker">research session</span>
      </div>

      <div>
        <p className="label">User</p>
        <div className="user-message">Analyze Hyperliquid.</div>
      </div>

      <div className="research-block">
        <p className="label">1337</p>
        <div className="research-steps">
          {researchSteps.map((step) => (
            <div className="research-step" key={step}>
              <span className="pulse-dot" aria-hidden="true" />
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnswerCard() {
  return (
    <section className="glass-panel answer-card" aria-label="1337 answer preview">
      <div className="panel-top">
        <div>
          <p className="answer-title">Polished answer card</p>
          <p className="answer-subtitle">context compressed into analyst format</p>
        </div>
        <span className="confidence-pill">Confidence: Medium</span>
      </div>

      <div className="answer-grid">
        {answerSections.map((section) => (
          <article className="answer-section" key={section}>
            <h3>
              <span className="check" aria-hidden="true" />
              {section}
            </h3>
            <div className="skeleton" aria-hidden="true">
              <span />
              <span />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntelligenceSection() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeader
          eyebrow="Crypto Intelligence Layer"
          title="Research Before Answering"
          body="1337 is built around a crypto-specific context layer. The model is only useful after the system has gathered, filtered and compressed the right information."
        />

        <div className="card-grid">
          {intelligenceLayer.map((item) => (
            <article className="glass-panel info-card" key={item.title}>
              <span className="card-icon">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="principles-grid">
          <article className="glass-panel info-card">
            <span className="card-icon">AI</span>
            <h3>A pipeline, not a prompt trick.</h3>
            <p>
              The landing experience previews the future product: intent,
              retrieval, compression and reasoning. This page is visual only,
              but the story matches the locked architecture.
            </p>
          </article>

          <article className="glass-panel info-card">
            <span className="card-icon">RISK</span>
            <h3>Built to say what it knows.</h3>
            <div className="principle-list">
              {researchPrinciples.map((principle) => (
                <div className="principle" key={principle}>
                  <span className="small-dot" aria-hidden="true" />
                  {principle}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function TokenSection() {
  return (
    <section id="powered" className="section">
      <div className="shell">
        <SectionHeader
          eyebrow="Powered by 1337"
          title="The token is computational fuel."
          body="1337 is designed so product usage drives token utility. Successful requests consume 1337, and platform economics route value back into the system."
        />

        <div className="card-grid">
          {tokenUtility.map((item) => (
            <article className="glass-panel info-card" key={item.title}>
              <span className="card-icon">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
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
        <div className="glass-panel roadmap-panel">
          <div className="purple-line" />
          <div className="roadmap-content">
            <div className="section-header">
              <p className="section-eyebrow">Roadmap</p>
              <h2>API, Telegram, Discord, Agents.</h2>
              <p className="section-copy">
                The first public surface is the landing page. The product path
                expands toward integrations that let traders, builders and
                agents consume the same intelligence layer everywhere.
              </p>
            </div>

            <div className="roadmap-grid">
              {roadmap.map((item) => (
                <article className="roadmap-card" key={item}>
                  <span className="card-icon">NEXT</span>
                  <h3>{item}</h3>
                  <p>Future phase</p>
                </article>
              ))}
            </div>
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
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-copy">{body}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <Image
            src="/1337-logo.png"
            alt=""
            width={32}
            height={32}
            className="footer-logo"
          />
          <span>1337</span>
        </div>
        <p>The Crypto Intelligence Model.</p>
      </div>
    </footer>
  );
}
