import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  email: string | null
) {
  await supabase
    .from("profiles")
    .upsert({ id: userId, email }, { onConflict: "id" });
}

export async function listChats(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listMessages(
  supabase: SupabaseClient<Database>,
  userId: string,
  chatId: string | null
) {
  if (!chatId) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
