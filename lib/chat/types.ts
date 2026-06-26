import type { Tables } from "@/lib/supabase/database.types";

export type Chat = Tables<"chats">;
export type Message = Tables<"messages">;

export type AppUser = {
  id: string;
  email: string | null;
};
