import { NextResponse } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/auth/api";
import { ChatRequestError, processChatRequest } from "@/lib/chat/process-chat";

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

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

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
