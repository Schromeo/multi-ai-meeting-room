import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

function workerEnv() {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
}

function executionContext() {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}

test("server-renders the real Discuss room", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    workerEnv(),
    executionContext(),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Multi-AI Meeting Room<\/title>/i);
  assert.match(html, /Multi-AI Meeting Room/);
  assert.match(html, /Start meeting/i);
  assert.match(html, /What must this room decide/);
  assert.match(html, /Room composition/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("provider status endpoint exposes configuration without secrets", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/discuss", { headers: { accept: "application/json" } }),
    workerEnv(),
    executionContext(),
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.minParticipants, 2);
  assert.equal(body.maxParticipants, 3);
  assert.equal(body.maxIterations, 2);
  assert.deepEqual(
    body.providers.map((provider) => provider.id),
    ["openai", "anthropic", "gemini"],
  );
  assert.doesNotMatch(JSON.stringify(body), /apiKey|OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY/);
});

test("meeting endpoint rejects an invalid bounded protocol without calling providers", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/discuss", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "short",
        seats: [],
        iteration: 9,
        requestId: "bad",
      }),
    }),
    workerEnv(),
    executionContext(),
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /objective/i);
});

test("session BYOK streams a bounded meeting without exposing credentials", async () => {
  const originalFetch = globalThis.fetch;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  let providerCalls = 0;

  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.openai.com/")) {
      providerCalls += 1;
      const request = JSON.parse(String(init?.body ?? "{}"));
      const text = String(request.input).includes("Create the decision memo")
        ? "# Recommendation\nRun the bounded experiment.\n# Unresolved Disputes\nNone in this fixture."
        : "OpenAI fixture response.";
      return sseResponse([
        { type: "response.output_text.delta", delta: text },
        {
          type: "response.completed",
          response: { usage: { input_tokens: 20, output_tokens: 10 } },
        },
      ]);
    }
    if (url.startsWith("https://api.anthropic.com/")) {
      providerCalls += 1;
      return sseResponse([
        {
          type: "message_start",
          message: { usage: { input_tokens: 18, output_tokens: 1 } },
        },
        {
          type: "content_block_delta",
          index: 0,
          delta: { type: "text_delta", text: "Anthropic fixture response." },
        },
        { type: "message_delta", usage: { output_tokens: 9 } },
        { type: "message_stop" },
      ]);
    }
    return originalFetch(input, init);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective: "Decide whether the bounded meeting protocol is useful.",
          seats: [
            { provider: "openai", role: "strategist" },
            { provider: "anthropic", role: "critic" },
          ],
          connections: {
            openai: { apiKey: "session-openai-key", model: "gpt-session-test" },
            anthropic: { apiKey: "session-anthropic-key", model: "claude-session-test" },
          },
          iteration: 1,
          priorMemo: "",
          requestId: "fixture-room-0001",
        }),
      }),
      workerEnv(),
      executionContext(),
    );

    assert.equal(response.status, 200);
    const streamText = await response.text();
    assert.doesNotMatch(streamText, /session-openai-key|session-anthropic-key/);
    const events = streamText
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.equal(providerCalls, 5);
    assert.deepEqual(
      events.filter((event) => event.type === "phase.start").map((event) => event.phase),
      ["proposal", "review", "synthesis"],
    );
    const completed = events.find((event) => event.type === "room.done");
    assert.ok(completed);
    assert.match(completed.memo, /# Recommendation/);
    assert.equal(completed.iteration, 1);
    assert.ok(completed.usage.inputTokens > 0);
    assert.ok(completed.usage.outputTokens > 0);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("OPENAI_API_KEY", originalOpenAIKey);
    restoreEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
  }
});

test("source contains real streaming adapters and no simulated agent timer", async () => {
  const [page, route, handoff, handoffZh] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/discuss/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/AI_HANDOFF.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/zh-CN/AI_HANDOFF.md", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /agentCopy|seedMessages|setTimeout\(\(\) => \{\s*const nextRound/);
  assert.match(route, /api\.openai\.com\/v1\/responses/);
  assert.match(route, /api\.anthropic\.com\/v1\/messages/);
  assert.match(route, /streamGenerateContent\?alt=sse/);
  assert.match(route, /stream:\s*true/);
  assert.match(handoff, /M2/);
  assert.match(handoffZh, /M2/);
});

function sseResponse(events) {
  return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), {
    headers: { "content-type": "text/event-stream" },
  });
}

function restoreEnv(key, value) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
