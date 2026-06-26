"use client";

import { useEffect, useState } from "react";
import { DepositModal } from "@/components/app/deposit-modal";

type BalanceResponse = {
  wallet: {
    publicKey: string;
  };
  balance: {
    rawAmount: string;
    uiAmount: number;
    decimals: number;
    tokenMint: string;
    tokenAccount: string;
  };
};

export function BalanceCard() {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshBalance() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/balance", {
        cache: "no-store"
      });
      const payload = (await response.json()) as BalanceResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "Balance failed");
      }

      setData(payload as BalanceResponse);
    } catch (balanceError) {
      setError(balanceError instanceof Error ? balanceError.message : "Balance unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshBalance();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <section className="balance-card" aria-label="1337 balance">
      <div>
        <p className="app-eyebrow">Balance</p>
        <strong>
          {loading && !data
            ? "Checking..."
            : `${(data?.balance.uiAmount ?? 0).toLocaleString(undefined, {
                maximumFractionDigits: 6
              })} 1337`}
        </strong>
        <span>{error ?? "Live SPL token balance"}</span>
      </div>
      <DepositModal
        publicKey={data?.wallet.publicKey ?? null}
        tokenMint={data?.balance.tokenMint ?? null}
        onRefresh={refreshBalance}
      />
    </section>
  );
}
