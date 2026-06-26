import { NextResponse } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/auth/api";
import { createSolanaConnection, get1337Balance, snapshotBalance } from "@/lib/crypto/solana";
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
    const balance = await get1337Balance({
      connection: createSolanaConnection(env.solanaRpcUrl),
      owner: wallet.publicKey,
      tokenMint: env.tokenMint1337
    });

    await snapshotBalance({
      balance,
      supabase,
      userId: auth.user.id
    });

    return NextResponse.json({
      wallet: {
        publicKey: wallet.publicKey
      },
      balance: {
        tokenMint: balance.tokenMint,
        tokenAccount: balance.tokenAccount,
        rawAmount: balance.rawAmount,
        uiAmount: balance.uiAmount,
        decimals: balance.decimals
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Balance check failed."
      },
      { status: 500 }
    );
  }
}
