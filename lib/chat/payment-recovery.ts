import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type QueryChargeInsert = Database["public"]["Tables"]["query_charges"]["Insert"];

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
 * The charge row is the durable quote/ledger record for an irreversible token
 * burn. Do not proceed to the burn unless the row was accepted by Supabase.
 */
export async function recordCalculatedCharge({
  charge,
  supabase
}: {
  charge: QueryChargeInsert;
  supabase: SupabaseClient<Database>;
}) {
  const { error } = await supabase.from("query_charges").insert(charge);
  if (error) {
    throw new Error(`Could not record calculated query charge: ${error.message}`);
  }
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
  const { data: burnRow, error: burnError } = await supabase
    .from("burn_attempts")
    .update({ status: "burn_confirmed", signature })
    .eq("idempotency_key", burnIdempotencyKey)
    .select("idempotency_key")
    .maybeSingle();

  if (burnError) throw new Error(`Could not record confirmed burn attempt: ${burnError.message}`);
  if (!burnRow) throw new Error("Could not record confirmed burn attempt: no matching ledger row.");

  const { data: chargeRow, error: chargeError } = await supabase
    .from("query_charges")
    .update({ status: "burn_confirmed", burn_signature: signature })
    .eq("idempotency_key", chargeIdempotencyKey)
    .select("idempotency_key")
    .maybeSingle();

  if (chargeError) throw new Error(`Could not record confirmed query charge: ${chargeError.message}`);
  if (!chargeRow) throw new Error("Could not record confirmed query charge: no matching ledger row.");
}
