import { sendMessageAction } from "@/lib/chat/actions";
import type { Chat, Message } from "@/lib/chat/types";

export function ChatWindow({
  activeChat,
  messages
}: {
  activeChat: Chat | null;
  messages: Message[];
}) {
  return (
    <section className="chat-window">
      <div className="chat-header">
        <div>
          <p className="app-eyebrow">AI Chat</p>
          <h1>{activeChat?.title || "Ask 1337"}</h1>
        </div>
        <span>No AI connected in Phase 1</span>
      </div>

      <div className="messages-panel">
        {messages.length ? (
          messages.map((message) => (
            <article key={message.id} className={`persisted-message ${message.role}`}>
              <span>{message.role}</span>
              <p>{message.content}</p>
            </article>
          ))
        ) : (
          <div className="empty-chat">
            <p>Start a new research thread.</p>
            <span>
              Messages persist now. Intelligence, context gathering and model responses
              are reserved for Phase 2.
            </span>
          </div>
        )}
      </div>

      <form action={sendMessageAction} className="prompt-form">
        <input type="hidden" name="chat_id" value={activeChat?.id || ""} />
        <textarea
          name="prompt"
          rows={1}
          placeholder="Ask anything about crypto..."
          aria-label="Prompt"
          required
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
