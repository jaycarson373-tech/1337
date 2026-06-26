import { Sidebar } from "@/components/app/sidebar";
import { IntelligenceRail } from "@/components/app/intelligence-rail";
import type { AppUser, Chat, UsageSummary } from "@/lib/chat/types";

export function AppFrame({
  user,
  chats,
  activeChatId,
  usageSummary,
  children
}: {
  user: AppUser;
  chats: Chat[];
  activeChatId: string | null;
  usageSummary: UsageSummary;
  children: React.ReactNode;
}) {
  return (
    <main className="app-shell">
      <Sidebar user={user} chats={chats} activeChatId={activeChatId} />
      <div className="app-main">{children}</div>
      <IntelligenceRail summary={usageSummary} />
    </main>
  );
}
