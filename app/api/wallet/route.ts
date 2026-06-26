import { NextResponse } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/auth/api";
import { getOrCreateUserWallet } from "@/lib/crypto/wallets";
import { getWalletEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const env = getWalletEnv();
    const supabase = createSupabaseAdminClient();
    const wallet = await getOrCreateUserWallet(
      supabase,
      auth.user.id,
      env.walletEncryptionSecret
    );

    return NextResponse.json({
      wallet: {
        publicKey: wallet.publicKey
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Wallet generation failed."
      },
      { status: 500 }
    );
  }
}
