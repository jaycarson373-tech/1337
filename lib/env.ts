export type Phase2Env = {
  openaiApiKey: string;
  solanaRpcUrl: string;
  tokenMint1337: string;
  burnWalletAddress: string;
  walletEncryptionSecret: string;
  tokenPriceUsdFallback: number;
  minQueryUsd: number;
  maxQueryUsd: number;
  queryMarkupMultiplier: number;
};

export type WalletEnv = Pick<
  Phase2Env,
  "solanaRpcUrl" | "tokenMint1337" | "walletEncryptionSecret"
>;

function readRequired(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function readPositiveNumber(name: string) {
  const raw = readRequired(name);
  const value = Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return value;
}

export function getPhase2Env(): Phase2Env {
  const minQueryUsd = readPositiveNumber("MIN_QUERY_USD");
  const maxQueryUsd = readPositiveNumber("MAX_QUERY_USD");

  if (minQueryUsd > maxQueryUsd) {
    throw new Error("MIN_QUERY_USD cannot exceed MAX_QUERY_USD");
  }

  return {
    openaiApiKey: readRequired("OPENAI_API_KEY"),
    solanaRpcUrl: readRequired("SOLANA_RPC_URL"),
    tokenMint1337: readRequired("TOKEN_MINT_1337"),
    burnWalletAddress: readRequired("BURN_WALLET_ADDRESS"),
    walletEncryptionSecret: readRequired("WALLET_ENCRYPTION_SECRET"),
    tokenPriceUsdFallback: readPositiveNumber("TOKEN_PRICE_USD_FALLBACK"),
    minQueryUsd,
    maxQueryUsd,
    queryMarkupMultiplier: readPositiveNumber("QUERY_MARKUP_MULTIPLIER")
  };
}

export function getWalletEnv(): WalletEnv {
  return {
    solanaRpcUrl: readRequired("SOLANA_RPC_URL"),
    tokenMint1337: readRequired("TOKEN_MINT_1337"),
    walletEncryptionSecret: readRequired("WALLET_ENCRYPTION_SECRET")
  };
}
