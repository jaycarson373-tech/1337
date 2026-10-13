import test from "node:test";
import assert from "node:assert/strict";
import { inspectEnvironment } from "./preflight.mjs";

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://1337.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-key-placeholder",
  SUPABASE_SERVICE_ROLE_KEY: "server-secret-placeholder",
  OPENAI_API_KEY: "provider-key-placeholder",
  SOLANA_RPC_URL: "https://rpc.example",
  TOKEN_MINT_1337: "11111111111111111111111111111111",
  BURN_WALLET_ADDRESS: "Vote111111111111111111111111111111111111111",
  WALLET_ENCRYPTION_SECRET: "a-long-independent-secret-value-1234",
  TOKEN_PRICE_USD_FALLBACK: "0.00001",
  MIN_QUERY_USD: "0.01",
  MAX_QUERY_USD: "1",
  QUERY_MARKUP_MULTIPLIER: "2"
};

test("configuration preflight passes shape checks without returning secret values", () => {
  const report = inspectEnvironment(valid);
  assert.deepEqual(report.failures, []);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes(valid.SUPABASE_SERVICE_ROLE_KEY), false);
  assert.equal(serialized.includes(valid.OPENAI_API_KEY), false);
  assert.equal(serialized.includes(valid.WALLET_ENCRYPTION_SECRET), false);
});

test("preflight rejects insecure URLs, malformed addresses, weak encryption secrets, and invalid pricing", () => {
  const report = inspectEnvironment({
    ...valid,
    NEXT_PUBLIC_SITE_URL: "http://1337.example",
    NEXT_PUBLIC_SUPABASE_URL: "https://evil.example",
    SOLANA_RPC_URL: "https://user:pass@rpc.example",
    TOKEN_MINT_1337: "not-an-address",
    WALLET_ENCRYPTION_SECRET: "short",
    MIN_QUERY_USD: "2",
    MAX_QUERY_USD: "1"
  });
  assert.ok(report.failures.some((item) => item.startsWith("NEXT_PUBLIC_SITE_URL")));
  assert.ok(report.failures.some((item) => item.startsWith("NEXT_PUBLIC_SUPABASE_URL")));
  assert.ok(report.failures.some((item) => item.startsWith("SOLANA_RPC_URL")));
  assert.ok(report.failures.some((item) => item.startsWith("TOKEN_MINT_1337")));
  assert.ok(report.failures.some((item) => item.startsWith("WALLET_ENCRYPTION_SECRET")));
  assert.ok(report.failures.includes("MIN_QUERY_USD cannot exceed MAX_QUERY_USD."));
});

test("preflight rejects base58 strings that do not decode to a 32-byte public key", () => {
  const report = inspectEnvironment({
    ...valid,
    TOKEN_MINT_1337: "111111111111111111111111111111111"
  });
  assert.ok(report.failures.includes("TOKEN_MINT_1337 must decode to a 32-byte Solana public key."));
});

test("preflight reports missing settings by name without echoing supplied keys", () => {
  const report = inspectEnvironment({ ...valid, OPENAI_API_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" });
  assert.ok(report.failures.includes("OPENAI_API_KEY is required."));
  assert.ok(report.failures.includes("SUPABASE_SERVICE_ROLE_KEY is required."));
  assert.equal(JSON.stringify(report).includes("public-key-placeholder"), false);
});
