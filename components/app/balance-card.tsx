import { DepositModal } from "@/components/app/deposit-modal";

export function BalanceCard() {
  return (
    <section className="balance-card" aria-label="1337 balance">
      <div>
        <p className="app-eyebrow">Balance</p>
        <strong>0 1337</strong>
        <span>Live SPL balance connects in Phase 2.</span>
      </div>
      <DepositModal />
    </section>
  );
}
