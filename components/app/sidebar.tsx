import Link from "next/link";
import { BalanceCard } from "@/components/app/balance-card";
import { UserMenu } from "@/components/app/user-menu";
import { createChatAction, deleteChatAction, renameChatAction } from "@/lib/chat/actions";
import type { AppUser, Chat } from "@/lib/chat/types";

export function Sidebar({
  user,
  chats,
  activeChatId
}: {
  user: AppUser;
  chats: Chat[];
  activeChatId: string | null;
}) {
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <Link className="app-brand" href="/">
          1337
        </Link>
        <form action={createChatAction}>
          <button className="new-chat-button" type="submit">
            New chat
          </button>
        </form>
      </div>

      <nav className="chat-list" aria-label="Chat history">
        {chats.length ? (
          chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/app?chat=${chat.id}`}
              className={chat.id === activeChatId ? "chat-link active" : "chat-link"}
            >
              <span>{chat.title || "Untitled chat"}</span>
              <time>{new Date(chat.created_at).toLocaleDateString()}</time>
            </Link>
          ))
        ) : (
          <div className="empty-sidebar">
            <p>No chats yet.</p>
            <span>Start with a crypto question.</span>
          </div>
        )}
      </nav>

      {activeChat ? (
        <section className="chat-tools" aria-label="Chat controls">
          <p className="app-eyebrow">Current chat</p>
          <form action={renameChatAction} className="rename-form">
            <input type="hidden" name="chat_id" value={activeChat.id} />
            <input
              name="title"
              defaultValue={activeChat.title || "Untitled chat"}
              aria-label="Rename chat"
            />
            <button type="submit">Rename</button>
          </form>
          <form action={deleteChatAction}>
            <input type="hidden" name="chat_id" value={activeChat.id} />
            <button className="danger-button" type="submit">
              Delete chat
            </button>
          </form>
        </section>
      ) : null}

      <div className="sidebar-bottom">
        <BalanceCard />
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
