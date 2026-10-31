import test from "node:test";
import assert from "node:assert/strict";

// Stub the internal pipeline call (POST /v1/chat/completions) that the route
// performs via fetch, so tests run without any provider or credentials.
const originalFetch = globalThis.fetch;
let lastPipelineBody = null;

function stubFetchWithContent(content) {
  globalThis.fetch = async (url, options) => {
    lastPipelineBody = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        choices: [{ message: { role: "assistant", content } }],
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  lastPipelineBody = null;
});

const { POST } = await import("../../src/app/api/providers/[id]/test-models/route.ts");

function makeRequest(body) {
  return new Request("http://localhost:20128/api/providers/antigravity/test-models", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const contextFor = (id) => ({ params: Promise.resolve({ id }) });

test("test-models returns ok per model with latency and pipeline passthrough", async () => {
  stubFetchWithContent("42");
  const res = await POST(
    makeRequest({
      models: ["antigravity/claude-opus-4-6-thinking", "antigravity/gemini-3-flash"],
    }),
    contextFor("antigravity")
  );
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.providerId, "antigravity");
  assert.equal(data.summary.total, 2);
  assert.equal(data.summary.passed, 2);
  assert.equal(data.summary.failed, 0);
  for (const r of data.results) {
    assert.equal(r.status, "ok");
    assert.equal(typeof r.latencyMs, "number");
    assert.ok(r.responseText);
    assert.ok(r.model.startsWith("antigravity/"));
  }
  // The pipeline received the fully-prefixed model and the no-cache headers.
  assert.ok(lastPipelineBody.model.startsWith("antigravity/"));
});

test("test-models dedupes duplicate models", async () => {
  stubFetchWithContent("ok");
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(
      JSON.stringify({ choices: [{ message: { role: "assistant", content: "ok" } }] }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };
  const res = await POST(
    makeRequest({ models: ["antigravity/m1", "antigravity/m1", "antigravity/m2"] }),
    contextFor("antigravity")
  );
  const data = await res.json();
  assert.equal(calls, 2);
  assert.equal(data.summary.total, 2);
});

test("test-models reports upstream errors as failed results, not HTTP errors", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { message: "quota exhausted" } }), { status: 429 });
  const res = await POST(makeRequest({ models: ["m1"] }), contextFor("antigravity"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.summary.failed, 1);
  assert.equal(data.results[0].status, "error");
  assert.match(data.results[0].error, /quota exhausted/);
});

test("test-models validates body and unknown providers", async () => {
  stubFetchWithContent("ok");

  const badBody = await POST(makeRequest({ models: [] }), contextFor("antigravity"));
  assert.equal(badBody.status, 400);

  const noBody = await POST(makeRequest({}), contextFor("antigravity"));
  assert.equal(noBody.status, 400);

  const unknown = await POST(makeRequest({ models: ["m1"] }), contextFor("not-a-provider"));
  assert.equal(unknown.status, 404);
});
