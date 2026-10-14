import assert from "node:assert/strict";
import test from "node:test";
import { assertPricedOpenAIModel, calculateOpenAICost } from "./pricing.ts";

test("calculates cost using each explicitly configured model schedule", () => {
  assert.equal(calculateOpenAICost("gpt-4.1-mini", 1_000_000, 1_000_000), 2);
  assert.equal(calculateOpenAICost("gpt-4o-mini", 1_000_000, 1_000_000), 0.75);
  assert.equal(calculateOpenAICost("gpt-4o", 1_000_000, 1_000_000), 12.5);
});

test("fails closed for a model without a configured billing schedule", () => {
  assert.throws(() => assertPricedOpenAIModel("gpt-4.1"), /no configured billing schedule/);
  assert.throws(() => calculateOpenAICost("gpt-4.1", 100, 100), /no configured billing schedule/);
});

test("rejects invalid usage rather than returning an understated cost", () => {
  for (const [input, output] of [[-1, 1], [1, -1], [1.5, 1], [Number.NaN, 1], [Number.MAX_SAFE_INTEGER + 1, 1]]) {
    assert.throws(() => calculateOpenAICost("gpt-4o-mini", input, output), /token usage is invalid/);
  }
});
