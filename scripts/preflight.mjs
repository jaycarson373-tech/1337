#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_FILES = [".env", ".env.local", ".env.production", ".env.production.local"];
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function inspectEnvironment(env) {
  const failures = [];
  const passed = [];
  const required = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "SOLANA_RPC_URL",
    "TOKEN_MINT_1337",
    "BURN_WALLET_ADDRESS",
    "WALLET_ENCRYPTION_SECRET",
    "TOKEN_PRICE_USD_FALLBACK",
    "MIN_QUERY_USD",
    "MAX_QUERY_USD",
    "QUERY_MARKUP_MULTIPLIER"
  ];
  const value = (name) => env[name]?.trim() ?? "";
  const requireHttps = (name, supabase = false) => {
    try {
      const url = new URL(value(name));
      const validHost = supabase
        ? /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname)
        : Boolean(url.hostname);
      if (
        url.protocol !== "https:" ||
        !validHost ||
        url.username ||
        url.password ||
        url.port ||
        url.search ||
        url.hash
      ) throw new Error();
      passed.push(name);
    } catch {
      failures.push(`${name} must be a valid HTTPS URL${supabase ? " from the Supabase project" : ""}.`);
    }
  };
  const requirePositive = (name) => {
    const parsed = Number(value(name));
    if (Number.isFinite(parsed) && parsed > 0) passed.push(name);
    else failures.push(`${name} must be a positive number.`);
  };

  for (const name of required) {
    if (!value(name)) failures.push(`${name} is required.`);
  }

  requireHttps("NEXT_PUBLIC_SITE_URL");
  requireHttps("NEXT_PUBLIC_SUPABASE_URL", true);
  requireHttps("SOLANA_RPC_URL");

  for (const name of ["TOKEN_MINT_1337", "BURN_WALLET_ADDRESS"]) {
    if (BASE58.test(value(name))) passed.push(name);
    else failures.push(`${name} must be a valid-looking Solana base58 address.`);
  }

  if (value("WALLET_ENCRYPTION_SECRET").length >= 32) passed.push("WALLET_ENCRYPTION_SECRET length");
  else failures.push("WALLET_ENCRYPTION_SECRET must contain at least 32 characters.");

  for (const name of ["TOKEN_PRICE_USD_FALLBACK", "MIN_QUERY_USD", "MAX_QUERY_USD", "QUERY_MARKUP_MULTIPLIER"]) {
    requirePositive(name);
  }

  const minimum = Number(value("MIN_QUERY_USD"));
  const maximum = Number(value("MAX_QUERY_USD"));
  if (Number.isFinite(minimum) && Number.isFinite(maximum) && minimum > maximum) {
    failures.push("MIN_QUERY_USD cannot exceed MAX_QUERY_USD.");
  } else if (minimum > 0 && maximum > 0) {
    passed.push("query price range");
  }

  return { passed, failures };
}

function loadEnvironment() {
  const env = {};
  for (const file of ENV_FILES) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) env[key] = value;
    }
  }
  return { ...env, ...process.env };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = inspectEnvironment(loadEnvironment());
  console.log(`1337 phase-2 configuration: ${report.passed.length} checks passed, ${report.failures.length} failed.`);
  for (const item of report.passed) console.log(`PASS ${item}`);
  for (const item of report.failures) console.error(`FAIL ${item}`);
  if (!report.failures.length) {
    console.log("Configuration shape passed only. This does not verify Supabase access, the mint, RPC, provider billing, or a confirmed on-chain transfer.");
  }
  process.exitCode = report.failures.length ? 1 : 0;
}
