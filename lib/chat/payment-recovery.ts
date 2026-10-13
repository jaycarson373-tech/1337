export type PaymentRecoveryOutcome =
  | "payment_not_confirmed"
  | "payment_confirmed_answer_missing"
  | "payment_and_answer_saved";

export function classifyPaymentRecovery({
  confirmedSignature,
  assistantMessageSaved
}: {
  confirmedSignature: string | null;
  assistantMessageSaved: boolean;
}): PaymentRecoveryOutcome {
  if (!confirmedSignature) {
    return "payment_not_confirmed";
  }

  return assistantMessageSaved
    ? "payment_and_answer_saved"
    : "payment_confirmed_answer_missing";
}
