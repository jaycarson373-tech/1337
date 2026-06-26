"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/chat/queries";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function titleFromPrompt(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "New chat";
  }

  return compact.length > 48 ? `${compact.slice(0, 45)}...` : compact;
}

export async function createChatAction() {
  const { supabase, user } = await requireUser();
  await ensureProfile(supabase, user.id, user.email ?? null);

  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: user.id, title: "New chat" })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  redirect(`/app?chat=${data.id}`);
}

export async function sendMessageAction(formData: FormData) {
  const prompt = readString(formData, "prompt");
  const submittedChatId = readString(formData, "chat_id");

  if (!prompt) {
    return;
  }

  const { supabase, user } = await requireUser();
  await ensureProfile(supabase, user.id, user.email ?? null);

  let chatId = submittedChatId;

  if (!chatId) {
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: titleFromPrompt(prompt) })
      .select("id")
      .single();

    if (chatError) {
      throw new Error(chatError.message);
    }

    chatId = chat.id;
  }

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: user.id,
    role: "user",
    content: prompt
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  redirect(`/app?chat=${chatId}`);
}

export async function renameChatAction(formData: FormData) {
  const chatId = readString(formData, "chat_id");
  const title = readString(formData, "title");

  if (!chatId || !title) {
    return;
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  redirect(`/app?chat=${chatId}`);
}

export async function deleteChatAction(formData: FormData) {
  const chatId = readString(formData, "chat_id");

  if (!chatId) {
    return;
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  redirect("/app");
}

export async function signOutAction() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/");
}
