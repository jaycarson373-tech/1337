import assert from "node:assert/strict";
import test from "node:test";
import { classifyPaymentRecovery, recordConfirmedBurn } from "./payment-recovery.ts";

test("does not claim a confirmed payment when there is no confirmed signature", () => {
  assert.equal(
    classifyPaymentRecovery({ confirmedSignature: null, assistantMessageSaved: false }),
    "payment_not_confirmed"
  );
});

test("distinguishes a confirmed burn from a missing saved answer", () => {
  assert.equal(
    classifyPaymentRecovery({ confirmedSignature: "signature", assistantMessageSaved: false }),
    "payment_confirmed_answer_missing"
  );
});

test("recognizes a fully saved answer after confirmed payment", () => {
  assert.equal(
    classifyPaymentRecovery({ confirmedSignature: "signature", assistantMessageSaved: true }),
    "payment_and_answer_saved"
  );
});

function makeSupabase(updates, failTableOnce = null) {
  const failed = new Set();
  return {
    from(table) {
      return {
        update(values) {
          return {
            async eq(column, value) {
              updates.push({ table, values, column, value });
              if (table === failTableOnce && !failed.has(table)) {
                failed.add(table);
                return { error: { message: "temporary database error" } };
              }
              return { error: null };
            }
          };
        }
      };
    }
  };
}

test("confirmed burn persistence records both ledgers and can retry a partial write", async () => {
  const updates = [];
  const supabase = makeSupabase(updates, "query_charges");
  const args = {
    burnIdempotencyKey: "run-1:burn",
    chargeIdempotencyKey: "run-1:charge",
    signature: "confirmed-signature",
    supabase
  };

  await assert.rejects(recordConfirmedBurn(args), /Could not record confirmed query charge/);
  await recordConfirmedBurn(args);

  assert.deepEqual(updates.map(({ table, values, value }) => ({ table, values, value })), [
    { table: "burn_attempts", values: { status: "burn_confirmed", signature: "confirmed-signature" }, value: "run-1:burn" },
    { table: "query_charges", values: { status: "burn_confirmed", burn_signature: "confirmed-signature" }, value: "run-1:charge" },
    { table: "burn_attempts", values: { status: "burn_confirmed", signature: "confirmed-signature" }, value: "run-1:burn" },
    { table: "query_charges", values: { status: "burn_confirmed", burn_signature: "confirmed-signature" }, value: "run-1:charge" }
  ]);
});
