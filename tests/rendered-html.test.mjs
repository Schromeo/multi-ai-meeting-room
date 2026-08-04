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
  assert.match(html, /Meetings/);
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

test("connection verification returns only compatible models and never echoes the key", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url === "https://api.openai.com/v1/models") {
      assert.match(String(init?.headers?.Authorization), /^Bearer /);
      return Response.json({
        data: [
          { id: "gpt-5-test" },
          { id: "text-embedding-test" },
          { id: "whisper-test" },
        ],
      });
    }
    return originalFetch(input, init);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/connections/models", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "openai", apiKey: "session-model-list-key" }),
      }),
      workerEnv(),
      executionContext(),
    );

    assert.equal(response.status, 200);
    const text = await response.text();
    assert.doesNotMatch(text, /session-model-list-key/);
    const body = JSON.parse(text);
    assert.deepEqual(body.models, [{ id: "gpt-5-test", name: "gpt-5-test" }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
      assert.equal(request.model, "gpt-4.1-mini");
      assert.equal(request.reasoning, undefined);
      assert.equal(request.text, undefined);
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
            {
              id: "seat-1",
              connectionId: "session-openai",
              provider: "openai",
              model: "gpt-4.1-mini",
              role: "strategist",
            },
            {
              id: "seat-2",
              connectionId: "session-anthropic",
              provider: "anthropic",
              model: "claude-session-test",
              role: "critic",
            },
          ],
          connections: {
            "session-openai": { provider: "openai", apiKey: "session-openai-key" },
            "session-anthropic": { provider: "anthropic", apiKey: "session-anthropic-key" },
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

test("one verified connection can power multiple seats", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.openai.com/")) {
      providerCalls += 1;
      const request = JSON.parse(String(init?.body ?? "{}"));
      const text = String(request.input).includes("Create the decision memo")
        ? "# Recommendation\nReuse the connection.\n# Unresolved Disputes\nNone."
        : "Reusable OpenAI fixture response.";
      return sseResponse([
        { type: "response.output_text.delta", delta: text },
        { type: "response.completed", response: { usage: { input_tokens: 12, output_tokens: 8 } } },
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
          objective: "Decide whether one connection can support role-diverse seats.",
          seats: [
            { id: "seat-1", connectionId: "shared-openai", provider: "openai", model: "gpt-model-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared-openai", provider: "openai", model: "gpt-model-b", role: "critic" },
          ],
          connections: {
            "shared-openai": { provider: "openai", apiKey: "shared-openai-key" },
          },
          iteration: 1,
          priorMemo: "",
          requestId: "fixture-room-reuse-0001",
        }),
      }),
      workerEnv(),
      executionContext(),
    );

    assert.equal(response.status, 200);
    const streamText = await response.text();
    assert.doesNotMatch(streamText, /shared-openai-key/);
    assert.equal(providerCalls, 5);
    const events = streamText.trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(
      events.filter((event) => event.type === "agent.start" && event.phase === "proposal").map((event) => event.model),
      ["gpt-model-a", "gpt-model-b"],
    );
    assert.ok(events.find((event) => event.type === "room.done"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("source contains real streaming adapters and no simulated agent timer", async () => {
  const [page, styles, route, handoff, handoffZh] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/discuss/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/AI_HANDOFF.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/zh-CN/AI_HANDOFF.md", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /agentCopy|seedMessages|setTimeout\(\(\) => \{\s*const nextRound/);
  assert.match(page, /Add new connection/);
  assert.match(page, /Reload models/);
  assert.match(page, /Replace key/);
  assert.match(page, /Use for Seat/);
  assert.match(page, /multi-ai-meeting-room\.history\.v1/);
  assert.match(page, /Credentials are excluded/);
  const meetingRecordType = page.match(/type MeetingRecord = \{[\s\S]*?\n\};/)?.[0] ?? "";
  assert.ok(meetingRecordType);
  assert.doesNotMatch(meetingRecordType, /apiKey|connectionId/);
  assert.match(styles, /\.decision-actions \.approve-button/);
  assert.match(styles, /\.history-drawer/);
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
