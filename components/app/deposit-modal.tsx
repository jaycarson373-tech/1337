"use client";

import { useState } from "react";

export function DepositModal() {
  const [open, setOpen] = useState(false);

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
              <p className="app-eyebrow">Phase 2</p>
              <h2 id="deposit-title">Deposit 1337</h2>
              <p>
                Deposit wallet generation and live token balance arrive in Phase 2.
                This modal is intentionally UI-only for Phase 1.
              </p>
            </div>

            <div className="deposit-placeholder">
              <span>Wallet address pending</span>
              <code>Phase 2 deposit wallet</code>
            </div>

            <button className="app-primary-button" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
