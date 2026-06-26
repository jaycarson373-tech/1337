import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthenticatedApiUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 500 }
      )
    };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    };
  }

  return { supabase, user };
}
