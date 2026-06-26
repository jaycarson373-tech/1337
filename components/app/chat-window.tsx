"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Chat, Message } from "@/lib/chat/types";

const requestSteps = [
  "Reading market data",
  "Checking liquidity",
  "Scanning on-chain activity",
  "Analyzing protocol metrics",
  "Compressing context",
  "Reasoning",
  "Burning 1337"
];

const suggestedPrompts = [
  "Analyze Hyperliquid liquidity and risks",
  "Compare SOL and ETH market structure",
  "What catalysts matter for JUP?",
  "Find bear-case risks for this token"
];

const sourceConnectors = [
  {
    icon: "DS",
    name: "DexScreener",
    detail: "Market + liquidity",
    active: true
  },
  {
    icon: "SOL",
    name: "Solana RPC",
    detail: "Balance + burn path",
    active: true
  },
  {
    icon: "CG",
    name: "CoinGecko",
    detail: "Queued V1 source",
    active: false
  },
  {
    icon: "DL",
    name: "DefiLlama",
    detail: "Protocol metrics",
    active: false
  }
];

type ChatApiResponse = {
  chatId: string;
  userMessage: Message;
  assistantMessage: Message;
  charge: {
    chargedUsd: number;
    actualLlmUsd: number;
    burned1337: number;
    burnSignature: string;
  };
  balance: {
    rawAmount: string;
    uiAmount: number;
    decimals: number;
  };
};

type EstimateResponse = {
  pricing: {
    minQueryUsd: number;
    maxQueryUsd: number;
    estimatedMinBurn1337: number;
    estimatedMaxBurn1337: number;
  };
};

type DisplayMessage = Message & {
  pending?: boolean;
};

function extractSources(message: Message) {
  const sources = new Set<string>();

  if (message.content.includes("[dex-")) {
    sources.add("DexScreener");
  }

  if (message.burn_signature) {
    sources.add("Solana RPC");
  }

  if (message.role === "assistant") {
    sources.add("OpenAI");
  }

  return [...sources];
}

export function ChatWindow({
  activeChat,
  messages
}: {
  activeChat: Chat | null;
  messages: Message[];
}) {
  const router = useRouter();
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>(messages);
  const [prompt, setPrompt] = useState("");
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateResponse["pricing"] | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/estimate", {
          cache: "no-store"
        });
        const payload = (await response.json()) as EstimateResponse | { error?: string };

        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : "Estimate failed");
        }

        setEstimate((payload as EstimateResponse).pricing);
      } catch (estimateFailure) {
        setEstimateError(
          estimateFailure instanceof Error ? estimateFailure.message : "Estimate unavailable"
        );
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isSubmitting) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index = Math.min(index + 1, requestSteps.length - 1);
      setActiveStep(requestSteps[index]);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  const statusText = useMemo(() => {
    if (error) {
      return "request failed";
    }

    return activeStep ?? "standing by";
  }, [activeStep, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isSubmitting) {
      return;
    }

    const tempId = `temp-${crypto.randomUUID()}`;
    const idempotencyKey = crypto.randomUUID();
    const now = new Date().toISOString();

    setError(null);
    setPrompt("");
    setActiveStep(requestSteps[0]);
    setIsSubmitting(true);
    setLocalMessages((current) => [
      ...current,
      {
        id: tempId,
        chat_id: activeChat?.id ?? null,
        user_id: null,
        role: "user",
        content: trimmedPrompt,
        cost_usd: null,
        burned_1337: null,
        burn_signature: null,
        created_at: now,
        pending: true
      }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          chatId: activeChat?.id ?? null,
          idempotencyKey,
          prompt: trimmedPrompt
        })
      });

      const payload = (await response.json()) as ChatApiResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "Request failed");
      }

      const result = payload as ChatApiResponse;
      setActiveStep("Completed");
      setLocalMessages((current) => [
        ...current.filter((message) => message.id !== tempId),
        result.userMessage,
        result.assistantMessage
      ]);

      if (!activeChat || activeChat.id !== result.chatId) {
        router.replace(`/app?chat=${result.chatId}`);
      }

      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Request failed";

      setError(message);
      setLocalMessages((current) => [
        ...current.filter((message) => message.id !== tempId),
        {
          id: `error-${crypto.randomUUID()}`,
          chat_id: activeChat?.id ?? null,
          user_id: null,
          role: "system",
          content: `${message} No 1337 was charged or burned.`,
          cost_usd: null,
          burned_1337: null,
          burn_signature: null,
          created_at: new Date().toISOString()
        }
      ]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="chat-window terminal-workstation">
      <div className="chat-header terminal-header">
        <div>
          <p className="app-eyebrow">Crypto Intelligence Layer</p>
          <h1>{activeChat?.title || "Research Workstation"}</h1>
          <span>Live context, source validation, reasoning and real 1337 burn settlement.</span>
        </div>
        <div className="terminal-status">
          <i aria-hidden="true" />
          <span>{statusText}</span>
        </div>
      </div>

      <div className="command-center">
        <div className="command-meta">
          <span>Command Center</span>
          <strong>
            {estimate
              ? `Est. ${estimate.estimatedMinBurn1337.toFixed(4)}-${estimate.estimatedMaxBurn1337.toFixed(
                  4
                )} 1337`
              : estimateError
                ? "Estimate unavailable"
                : "Calculating estimate"}
          </strong>
        </div>
        <form className="terminal-prompt-form" onSubmit={handleSubmit}>
          <textarea
            name="prompt"
            rows={2}
            placeholder="Run crypto intelligence on a token, protocol, market structure, catalyst or risk..."
            aria-label="Prompt"
            required
            value={prompt}
            disabled={isSubmitting}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Running" : "Run"}
          </button>
        </form>
        <div className="suggested-prompts" aria-label="Suggested research prompts">
          {suggestedPrompts.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isSubmitting}
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="workstation-grid">
        <aside className="research-stack" aria-label="Research operations">
          <section className="ops-card">
            <div className="ops-card-header">
              <p className="app-eyebrow">Research Status</p>
              <span>{isSubmitting ? "Live" : "Idle"}</span>
            </div>
            <div className="terminal-step-list">
              {requestSteps.map((step) => (
                <div
                  key={step}
                  className={`terminal-step ${
                    step === activeStep || (activeStep === "Completed" && step === "Burning 1337")
                      ? "active"
                      : ""
                  }`}
                >
                  <i aria-hidden="true" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-card">
            <div className="ops-card-header">
              <p className="app-eyebrow">Sources Used</p>
              <span>V1</span>
            </div>
            <div className="source-list">
              {sourceConnectors.map((source) => (
                <div className={source.active ? "source-row active" : "source-row"} key={source.name}>
                  <span className="source-icon">{source.icon}</span>
                  <div>
                    <strong>{source.name}</strong>
                    <small>{source.detail}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="research-feed">
          {localMessages.length ? (
            localMessages.map((message) => {
              const sources = extractSources(message);

              return (
                <article
                  key={message.id}
                  className={`persisted-message ${message.role}${
                    message.pending ? " pending" : ""
                  }`}
                >
                  <span>{message.role === "assistant" ? "Research report" : message.role}</span>
                  <p>{message.content}</p>
                  {message.role === "assistant" ? (
                    <div className="report-footer">
                      <div className="report-sources">
                        {sources.length
                          ? sources.map((source) => <span key={source}>{source}</span>)
                          : null}
                      </div>
                      {message.cost_usd !== null &&
                      message.burned_1337 !== null &&
                      message.burn_signature ? (
                        <div className="message-charge">
                          <strong>${message.cost_usd.toFixed(6)}</strong>
                          <span>{message.burned_1337.toFixed(6)} 1337 burned</span>
                          <span>Transaction confirmed</span>
                          <code>{message.burn_signature}</code>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="empty-chat terminal-empty">
              <p>Crypto intelligence terminal ready.</p>
              <span>
                Start with a token, protocol, narrative, liquidity or risk question.
                1337 will gather context before it answers.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
