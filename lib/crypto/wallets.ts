import { Keypair } from "@solana/web3.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret, encryptSecret } from "@/lib/crypto/encryption";
import type { Database } from "@/lib/supabase/database.types";

export type UserWallet = {
  id: string;
  userId: string;
  publicKey: string;
};

export async function getOrCreateUserWallet(
  supabase: SupabaseClient<Database>,
  userId: string,
  encryptionSecret: string
): Promise<UserWallet> {
  const { data: existing, error: existingError } = await supabase
    .from("user_wallets")
    .select("id,user_id,public_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return {
      id: existing.id,
      userId: existing.user_id ?? userId,
      publicKey: existing.public_key
    };
  }

  const keypair = Keypair.generate();
  const encryptedPrivateKey = encryptSecret(
    Buffer.from(keypair.secretKey).toString("base64"),
    encryptionSecret
  );

  const { data: created, error: createError } = await supabase
    .from("user_wallets")
    .insert({
      user_id: userId,
      public_key: keypair.publicKey.toBase58(),
      encrypted_private_key: encryptedPrivateKey
    })
    .select("id,user_id,public_key")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    id: created.id,
    userId: created.user_id ?? userId,
    publicKey: created.public_key
  };
}

export async function getWalletKeypair(
  supabase: SupabaseClient<Database>,
  userId: string,
  encryptionSecret: string
) {
  const { data, error } = await supabase
    .from("user_wallets")
    .select("encrypted_private_key")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const secretKeyBase64 = decryptSecret(data.encrypted_private_key, encryptionSecret);
  return Keypair.fromSecretKey(Buffer.from(secretKeyBase64, "base64"));
}
