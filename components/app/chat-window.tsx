"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Chat, Message } from "@/lib/chat/types";

const requestSteps = [
  "checking balance",
  "gathering context",
  "analyzing liquidity",
  "reading market data",
  "compressing context",
  "reasoning",
  "burning 1337",
  "completed"
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

type DisplayMessage = Message & {
  pending?: boolean;
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSubmitting) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index = Math.min(index + 1, requestSteps.length - 2);
      setActiveStep(requestSteps[index]);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  const statusText = useMemo(() => {
    if (error) {
      return "request failed";
    }

    return activeStep ?? "ready";
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
      setActiveStep("completed");
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
    <section className="chat-window">
      <div className="chat-header">
        <div>
          <p className="app-eyebrow">AI Chat</p>
          <h1>{activeChat?.title || "Ask 1337"}</h1>
        </div>
        <span>{statusText}</span>
      </div>

      <div className="messages-panel">
        {localMessages.length ? (
          localMessages.map((message) => (
            <article
              key={message.id}
              className={`persisted-message ${message.role}${
                message.pending ? " pending" : ""
              }`}
            >
              <span>{message.role}</span>
              <p>{message.content}</p>
              {message.role === "assistant" &&
              message.cost_usd !== null &&
              message.burned_1337 !== null &&
              message.burn_signature ? (
                <div className="message-charge">
                  <strong>${message.cost_usd.toFixed(6)}</strong>
                  <span>{message.burned_1337.toFixed(6)} 1337 burned</span>
                  <code>{message.burn_signature}</code>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="empty-chat">
            <p>Start a new research thread.</p>
            <span>
              Ask a crypto question. 1337 will check balance, gather context,
              reason, and consume 1337 only after a successful answer.
            </span>
          </div>
        )}

        {isSubmitting ? (
          <div className="request-status" aria-live="polite">
            {requestSteps.map((step) => (
              <span
                key={step}
                className={
                  step === activeStep || (activeStep === "completed" && step === "completed")
                    ? "active"
                    : ""
                }
              >
                {step}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <textarea
          name="prompt"
          rows={1}
          placeholder="Ask anything about crypto..."
          aria-label="Prompt"
          required
          value={prompt}
          disabled={isSubmitting}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Running" : "Send"}
        </button>
      </form>
    </section>
  );
}
