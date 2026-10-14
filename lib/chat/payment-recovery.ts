import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

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

/**
 * Persist a confirmed on-chain burn to both ledgers. Callers should retry this
 * operation from their recovery path if either database write fails; the chain
 * signature remains the source of truth and must never be discarded.
 */
export async function recordConfirmedBurn({
  burnIdempotencyKey,
  chargeIdempotencyKey,
  signature,
  supabase
}: {
  burnIdempotencyKey: string;
  chargeIdempotencyKey: string;
  signature: string;
  supabase: SupabaseClient<Database>;
}) {
  const { error: burnError } = await supabase
    .from("burn_attempts")
    .update({ status: "burn_confirmed", signature })
    .eq("idempotency_key", burnIdempotencyKey);

  if (burnError) throw new Error(`Could not record confirmed burn attempt: ${burnError.message}`);

  const { error: chargeError } = await supabase
    .from("query_charges")
    .update({ status: "burn_confirmed", burn_signature: signature })
    .eq("idempotency_key", chargeIdempotencyKey);

  if (chargeError) throw new Error(`Could not record confirmed query charge: ${chargeError.message}`);
}
