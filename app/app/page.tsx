import { AppFrame } from "@/components/app/app-frame";
import { ChatWindow } from "@/components/app/chat-window";
import { requireUser } from "@/lib/auth/session";
import { ensureProfile, listChats, listMessages } from "@/lib/chat/queries";

export const dynamic = "force-dynamic";

export default async function AppPage({
  searchParams
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const { supabase, user } = await requireUser();
  await ensureProfile(supabase, user.id, user.email ?? null);

  const params = await searchParams;
  const chats = await listChats(supabase, user.id);
  const requestedChat = params.chat || null;
  const activeChat =
    chats.find((chat) => chat.id === requestedChat) ?? chats[0] ?? null;
  const messages = await listMessages(supabase, user.id, activeChat?.id ?? null);

  return (
    <AppFrame
      user={{ id: user.id, email: user.email ?? null }}
      chats={chats}
      activeChatId={activeChat?.id ?? null}
    >
      <ChatWindow activeChat={activeChat} messages={messages} />
    </AppFrame>
  );
}
