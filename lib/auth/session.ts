import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState =
  | {
      configured: false;
      user: null;
    }
  | {
      configured: true;
      user: User | null;
    };

export async function getAuthState(): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { configured: true, user };
}

export async function requireUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?missing_config=1");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
