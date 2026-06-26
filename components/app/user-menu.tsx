import Link from "next/link";
import { signOutAction } from "@/lib/chat/actions";
import type { AppUser } from "@/lib/chat/types";

export function UserMenu({ user }: { user: AppUser }) {
  return (
    <div className="user-menu">
      <div className="user-avatar-large" aria-hidden="true">
        {(user.email || "U").slice(0, 1).toUpperCase()}
      </div>
      <div>
        <p>{user.email || "1337 user"}</p>
        <div className="user-menu-actions">
          <Link href="/app/settings">Settings</Link>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );
}
