import assert from "node:assert/strict";
import test from "node:test";
import { readBoundedJson } from "./read-bounded-json.ts";

test("parses a JSON request within the byte limit", async () => {
  const request = new Request("https://example.test/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "hello" })
  });

  assert.deepEqual(await readBoundedJson(request), { ok: true, value: { prompt: "hello" } });
});

test("rejects an oversized request from Content-Length before reading its body", async () => {
  const request = new Request("https://example.test/api/chat", {
    method: "POST",
    headers: { "content-length": "1000" },
    body: "{}"
  });

  assert.deepEqual(await readBoundedJson(request, 10), { ok: false, reason: "too_large" });
});

test("rejects an oversized streamed request even without Content-Length", async () => {
  const request = new Request("https://example.test/api/chat", {
    method: "POST",
    // Node's Request implementation requires duplex for a ReadableStream body.
    duplex: "half",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("12345"));
        controller.enqueue(new TextEncoder().encode("67890"));
        controller.close();
      }
    })
  });

  assert.deepEqual(await readBoundedJson(request, 8), { ok: false, reason: "too_large" });
});

test("rejects malformed JSON", async () => {
  const request = new Request("https://example.test/api/chat", { method: "POST", body: "{" });
  assert.deepEqual(await readBoundedJson(request), { ok: false, reason: "invalid_json" });
});
