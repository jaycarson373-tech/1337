import { NextResponse } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/auth/api";
import { ChatRequestError, processChatRequest } from "@/lib/chat/process-chat";
import { readBoundedJson } from "@/lib/http/read-bounded-json";

export const dynamic = "force-dynamic";

type ChatRequestBody = {
  chatId?: string | null;
  idempotencyKey?: string;
  prompt?: string;
};

export async function POST(request: Request) {
  const auth = await getAuthenticatedApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const parsedBody = await readBoundedJson<unknown>(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.reason === "too_large" ? "Request body is too large." : "Invalid JSON body." },
      { status: parsedBody.reason === "too_large" ? 413 : 400 }
    );
  }

  const rawBody = parsedBody.value;
  if (
    !rawBody ||
    typeof rawBody !== "object" ||
    Array.isArray(rawBody) ||
    !("prompt" in rawBody) ||
    typeof rawBody.prompt !== "string" ||
    ("idempotencyKey" in rawBody && typeof rawBody.idempotencyKey !== "string") ||
    ("chatId" in rawBody && rawBody.chatId !== null && typeof rawBody.chatId !== "string")
  ) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const body = rawBody as ChatRequestBody;

  try {
    const result = await processChatRequest({
      chatId: body.chatId ?? null,
      idempotencyKey: body.idempotencyKey ?? "",
      prompt: body.prompt ?? "",
      user: auth.user
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatRequestError) {
      return NextResponse.json(
        {
          error: error.message,
          failureReason: error.failureReason ?? null
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat request failed."
      },
      { status: 500 }
    );
  }
}
