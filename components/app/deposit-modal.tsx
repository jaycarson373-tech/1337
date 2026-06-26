"use client";

import { useState } from "react";

export function DepositModal({
  onRefresh,
  publicKey,
  tokenMint
}: {
  onRefresh: () => void;
  publicKey: string | null;
  tokenMint: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!publicKey) {
      return;
    }

    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <button className="app-secondary-button" type="button" onClick={() => setOpen(true)}>
        Deposit
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="deposit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <p className="app-eyebrow">Deposit wallet</p>
              <h2 id="deposit-title">Deposit 1337</h2>
              <p>
                Send 1337 SPL tokens to this Solana deposit wallet. Requests use
                the live server-side balance and consume 1337 only after a
                successful response.
              </p>
            </div>

            <div className="deposit-placeholder">
              <span>Wallet address</span>
              <code>{publicKey ?? "Generating wallet..."}</code>
            </div>

            <div className="deposit-placeholder">
              <span>1337 token mint</span>
              <code>{tokenMint ?? "Not configured"}</code>
            </div>

            <p className="deposit-note">
              The deposit wallet must hold a small amount of SOL for Solana network fees.
            </p>

            <div className="modal-actions">
              <button
                className="app-secondary-button"
                type="button"
                disabled={!publicKey}
                onClick={copyAddress}
              >
                {copied ? "Copied" : "Copy address"}
              </button>
              <button className="app-secondary-button" type="button" onClick={onRefresh}>
                Refresh balance
              </button>
              <button className="app-primary-button" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
