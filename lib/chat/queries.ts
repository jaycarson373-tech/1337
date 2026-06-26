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

export async function getUsageSummary(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count: todaysQueries, error: queryError } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", startOfDay.toISOString());

  if (queryError) {
    throw new Error(queryError.message);
  }

  const { data: assistantMessages, error: assistantError } = await supabase
    .from("messages")
    .select("burned_1337,created_at")
    .eq("user_id", userId)
    .eq("role", "assistant")
    .gte("created_at", startOfDay.toISOString());

  if (assistantError) {
    throw new Error(assistantError.message);
  }

  const burnedToday = assistantMessages.reduce(
    (total, message) => total + (message.burned_1337 ?? 0),
    0
  );
  const latestAnswerAt = assistantMessages[0]?.created_at;

  return {
    burnedToday,
    confidenceScore: assistantMessages.length ? "Medium" : "Pending",
    dataFreshness: latestAnswerAt ? "Live today" : "Awaiting first query",
    todaysQueries: todaysQueries ?? 0
  };
}
