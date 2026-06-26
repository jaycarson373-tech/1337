import { Sidebar } from "@/components/app/sidebar";
import type { AppUser, Chat } from "@/lib/chat/types";

export function AppFrame({
  user,
  chats,
  activeChatId,
  children
}: {
  user: AppUser;
  chats: Chat[];
  activeChatId: string | null;
  children: React.ReactNode;
}) {
  return (
    <main className="app-shell">
      <Sidebar user={user} chats={chats} activeChatId={activeChatId} />
      <div className="app-main">{children}</div>
    </main>
  );
}
