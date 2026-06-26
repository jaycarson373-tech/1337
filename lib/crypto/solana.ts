import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TokenAccountNotFoundError,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type TokenBalance = {
  tokenMint: string;
  owner: string;
  tokenAccount: string;
  rawAmount: string;
  uiAmount: number;
  decimals: number;
};

export function createSolanaConnection(rpcUrl: string) {
  return new Connection(rpcUrl, "confirmed");
}

async function getTokenProgramId(connection: Connection, mint: PublicKey) {
  const accountInfo = await connection.getAccountInfo(mint);

  if (!accountInfo) {
    throw new Error("Configured 1337 token mint does not exist on Solana");
  }

  if (accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }

  if (accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
    return TOKEN_PROGRAM_ID;
  }

  throw new Error("Configured 1337 token mint is not an SPL token mint");
}

function toUiAmount(rawAmount: bigint, decimals: number) {
  const divisor = 10 ** decimals;
  return Number(rawAmount) / divisor;
}

export async function get1337Balance({
  connection,
  owner,
  tokenMint
}: {
  connection: Connection;
  owner: string;
  tokenMint: string;
}): Promise<TokenBalance> {
  const ownerPublicKey = new PublicKey(owner);
  const mintPublicKey = new PublicKey(tokenMint);
  const programId = await getTokenProgramId(connection, mintPublicKey);
  const mint = await getMint(connection, mintPublicKey, "confirmed", programId);
  const tokenAccount = getAssociatedTokenAddressSync(
    mintPublicKey,
    ownerPublicKey,
    false,
    programId
  );

  try {
    const account = await getAccount(connection, tokenAccount, "confirmed", programId);
    const rawAmount = account.amount;

    return {
      tokenMint,
      owner,
      tokenAccount: tokenAccount.toBase58(),
      rawAmount: rawAmount.toString(),
      uiAmount: toUiAmount(rawAmount, mint.decimals),
      decimals: mint.decimals
    };
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) {
      return {
        tokenMint,
        owner,
        tokenAccount: tokenAccount.toBase58(),
        rawAmount: "0",
        uiAmount: 0,
        decimals: mint.decimals
      };
    }

    throw error;
  }
}

export function uiAmountToRaw(amount: number, decimals: number) {
  const [whole, fraction = ""] = amount.toFixed(decimals).split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(`${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "") || "0");
}

export async function snapshotBalance({
  supabase,
  userId,
  balance
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  balance: TokenBalance;
}) {
  await supabase.from("balance_snapshots").insert({
    user_id: userId,
    public_key: balance.owner,
    token_mint: balance.tokenMint,
    raw_amount: balance.rawAmount,
    ui_amount: balance.uiAmount
  });
}

export async function send1337ToBurnWallet({
  amountRaw,
  connection,
  decimals,
  mint,
  owner,
  burnWalletAddress
}: {
  amountRaw: bigint;
  connection: Connection;
  decimals: number;
  mint: string;
  owner: Keypair;
  burnWalletAddress: string;
}) {
  const mintPublicKey = new PublicKey(mint);
  const burnOwnerPublicKey = new PublicKey(burnWalletAddress);
  const programId = await getTokenProgramId(connection, mintPublicKey);
  const sourceAta = getAssociatedTokenAddressSync(
    mintPublicKey,
    owner.publicKey,
    false,
    programId
  );
  const destinationAta = getAssociatedTokenAddressSync(
    mintPublicKey,
    burnOwnerPublicKey,
    true,
    programId
  );

  const transaction = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      owner.publicKey,
      destinationAta,
      burnOwnerPublicKey,
      mintPublicKey,
      programId
    ),
    createTransferCheckedInstruction(
      sourceAta,
      mintPublicKey,
      destinationAta,
      owner.publicKey,
      amountRaw,
      decimals,
      [],
      programId
    )
  );

  return sendAndConfirmTransaction(connection, transaction, [owner], {
    commitment: "confirmed",
    skipPreflight: false
  });
}
