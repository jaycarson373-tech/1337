import assert from "node:assert/strict";
import test from "node:test";
import { classifyPaymentRecovery } from "./payment-recovery.ts";

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
