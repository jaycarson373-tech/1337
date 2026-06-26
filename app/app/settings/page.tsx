import { AppFrame } from "@/components/app/app-frame";
import { requireUser } from "@/lib/auth/session";
import { ensureProfile, listChats } from "@/lib/chat/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  await ensureProfile(supabase, user.id, user.email ?? null);

  const chats = await listChats(supabase, user.id);

  return (
    <AppFrame
      user={{ id: user.id, email: user.email ?? null }}
      chats={chats}
      activeChatId={null}
    >
      <section className="settings-panel">
        <div>
          <p className="app-eyebrow">Settings</p>
          <h1>Account</h1>
          <p>
            Phase 1 keeps account settings intentionally small. Wallets, live
            balances and deposits arrive in Phase 2.
          </p>
        </div>

        <div className="settings-grid">
          <article>
            <span>Email</span>
            <strong>{user.email || "No email"}</strong>
          </article>
          <article>
            <span>User ID</span>
            <strong>{user.id}</strong>
          </article>
          <article>
            <span>Authentication</span>
            <strong>Supabase Auth</strong>
          </article>
          <article>
            <span>Embedded wallet</span>
            <strong>Phase 2 ready</strong>
          </article>
        </div>
      </section>
    </AppFrame>
  );
}
