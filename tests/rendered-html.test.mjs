import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

let meetingStateModule;

async function loadMeetingStateModule() {
  if (!meetingStateModule) {
    meetingStateModule = readFile(
      new URL("../lib/meeting-state.ts", import.meta.url),
      "utf8",
    ).then((source) => {
      const output = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText;
      return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
    });
  }
  return meetingStateModule;
}

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
      const text = fixtureTurnEnvelope(String(request.input), "OpenAI fixture response.");
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
          delta: {
            type: "text_delta",
            text: fixtureTurnEnvelope(String(init?.body ?? ""), "Anthropic fixture response."),
          },
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
    const completedTurns = events.filter((event) => event.type === "agent.done");
    assert.equal(completedTurns.length, 5);
    assert.ok(completedTurns.every((event) => event.round === 1 && event.envelope?.card));
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
      const text = fixtureTurnEnvelope(String(request.input), "Reusable OpenAI fixture response.");
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

test("malformed Turn Envelopes fail visibly without a paid retry", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith("https://api.openai.com/")) {
      providerCalls += 1;
      return sseResponse([
        { type: "response.output_text.delta", delta: "not-json" },
        { type: "response.completed", response: { usage: { input_tokens: 5, output_tokens: 2 } } },
      ]);
    }
    return originalFetch(input);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective: "Verify malformed structured turns stop without automatic retry.",
          seats: [
            { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
          ],
          connections: { shared: { provider: "openai", apiKey: "format-test-key" } },
          iteration: 1,
          priorMemo: "",
          requestId: "fixture-format-0001",
        }),
      }),
      workerEnv(),
      executionContext(),
    );

    const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 2);
    assert.equal(events.filter((event) => event.type === "agent.format_error").length, 2);
    assert.equal(events.filter((event) => event.type === "agent.error").length, 0);
    assert.ok(events.find((event) => event.type === "room.error"));
    assert.equal(events.find((event) => event.type === "phase.start" && event.phase === "review"), undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("semantic reduction failures are excluded from downstream synthesis", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  let synthesisPrompt = "";
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.openai.com/")) return originalFetch(input, init);
    providerCalls += 1;
    const request = JSON.parse(String(init?.body ?? "{}"));
    const prompt = String(request.input);
    const synthesis = prompt.includes("Create the decision memo");
    const review = prompt.includes("REVIEW TARGET");
    if (synthesis) synthesisPrompt = prompt;
    const statement = `${request.model}-${synthesis ? "synthesis" : review ? "review" : "proposal"}`;
    const envelope = validEnvelope({
      statement: synthesis
        ? "# Recommendation\nUse accepted state only.\n# Agreements\nBound the state.\n# Unresolved Disputes\nNone.\n# Unverified Assumptions\nFixture.\n# Tradeoffs\nCoverage.\n# Next Actions\nContinue."
        : statement,
      stance: synthesis ? "support" : review ? "oppose" : "propose",
      thesis: statement,
      newClaims: synthesis
        ? []
        : [0, 1, 2].map((index) => ({ text: `${statement}-claim-${index}`, assumptionLevel: "low" })),
    });
    return sseResponse([
      { type: "response.output_text.delta", delta: JSON.stringify(envelope) },
      { type: "response.completed", response: { usage: { input_tokens: 10, output_tokens: 10 } } },
    ]);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective: "Ensure semantically rejected turns cannot influence synthesis.",
          seats: [
            { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
            { id: "seat-3", connectionId: "shared", provider: "openai", model: "gpt-c", role: "technical" },
          ],
          connections: { shared: { provider: "openai", apiKey: "reducer-gate-key" } },
          iteration: 1,
          priorMemo: "",
          requestId: "fixture-reducer-gate-0001",
        }),
      }),
      workerEnv(),
      executionContext(),
    );

    const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 7);
    assert.equal(events.filter((event) => event.type === "agent.reduction_error").length, 2);
    assert.ok(events.find((event) => event.type === "room.done"));
    assert.match(synthesisPrompt, /gpt-a-review/);
    assert.doesNotMatch(synthesisPrompt, /gpt-b-review|gpt-c-review/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Turn Envelope validation and the Canonical Reducer preserve lineage", async () => {
  const {
    createInitialMeetingState,
    parseMeetingState,
    parseTurnEnvelope,
    reduceTurnEnvelope,
    renderMeetingStateContext,
  } = await loadMeetingStateModule();
  const proposal = validEnvelope({
    statement: "Start with a bounded local pilot.",
    thesis: "A local pilot validates the protocol before broader scope.",
    newClaims: [{ text: "A two-provider pilot is the narrowest useful test.", assumptionLevel: "high" }],
  });
  assert.equal(parseTurnEnvelope(JSON.stringify(proposal), "proposal").ok, true);
  assert.equal(parseTurnEnvelope("```json\n{}\n```", "proposal").ok, false);

  const initial = createInitialMeetingState(
    "Choose the narrowest useful protocol test.",
    Array.from({ length: 12 }, (_, index) => `Constraint ${index}: ${"bounded ".repeat(80)}`),
  );
  const first = reduceTurnEnvelope(initial, {
    id: "turn-1",
    sourceMessageId: "message-1",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: proposal,
    usage: { inputTokens: 10, outputTokens: 20, estimatedUsd: 0.01, latencyMs: 100 },
  });
  assert.equal(first.ok, true);
  assert.equal(first.state.version, 1);
  assert.deepEqual(first.state.claims[0].sourceMessageIds, ["message-1"]);
  assert.equal(first.state.assumptions[0].claimId, first.state.claims[0].id);

  const duplicate = reduceTurnEnvelope(first.state, {
    id: "turn-1",
    sourceMessageId: "message-1",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: proposal,
  });
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.version, 1);

  const review = validEnvelope({
    statement: "The pilot still needs a measurable stop condition.",
    stance: "oppose",
    thesis: "The scope is plausible but its success condition is underspecified.",
    claimUpdates: [{ claimId: first.state.claims[0].id, action: "oppose", reason: "No stop metric is named." }],
    objections: [{ targetClaimId: first.state.claims[0].id, text: "The pilot lacks an explicit success threshold.", severity: "material" }],
  });
  const second = reduceTurnEnvelope(first.state, {
    id: "turn-2",
    sourceMessageId: "message-2",
    seatId: "seat-2",
    round: 1,
    phase: "review",
    envelope: review,
  });
  assert.equal(second.ok, true);
  assert.equal(second.state.claims[0].status, "contested");
  assert.equal(second.state.disputes[0].targetClaimId, first.state.claims[0].id);
  assert.deepEqual(second.state.disputes[0].sourceMessageIds, ["message-2"]);
  assert.ok(parseMeetingState(JSON.parse(JSON.stringify(second.state))));
  const rendered = renderMeetingStateContext(second.state, 1_500);
  assert.ok(rendered.length <= 1_500);
  assert.doesNotThrow(() => JSON.parse(rendered));
});

test("the Canonical Reducer rejects unknown references and active-state overflow atomically", async () => {
  const { createInitialMeetingState, reduceTurnEnvelope } = await loadMeetingStateModule();
  const initial = createInitialMeetingState("Keep the active state bounded.");
  const unknown = reduceTurnEnvelope(initial, {
    id: "unknown-turn",
    sourceMessageId: "unknown-message",
    seatId: "seat-1",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "Oppose a missing claim.",
      stance: "oppose",
      thesis: "This reference must not mutate state.",
      claimUpdates: [{ claimId: "claim-does-not-exist", action: "oppose", reason: "Missing." }],
    }),
  });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.error.code, "unknown_reference");
  assert.equal(unknown.state, initial);

  let state = initial;
  for (let index = 0; index < 4; index += 1) {
    const result = reduceTurnEnvelope(state, {
      id: `fill-turn-${index}`,
      sourceMessageId: `fill-message-${index}`,
      seatId: "seat-1",
      round: 1,
      phase: "proposal",
      envelope: validEnvelope({
        statement: `Add claims ${index}.`,
        thesis: "Fill the bounded active state.",
        newClaims: [0, 1, 2].map((claim) => ({ text: `Claim ${index}-${claim}`, assumptionLevel: "low" })),
      }),
    });
    assert.equal(result.ok, true);
    state = result.state;
  }
  assert.equal(state.claims.length, 12);
  const overflow = reduceTurnEnvelope(state, {
    id: "overflow-turn",
    sourceMessageId: "overflow-message",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: validEnvelope({
      statement: "This claim exceeds the cap.",
      thesis: "Overflow must be explicit.",
      newClaims: [{ text: "Claim 13", assumptionLevel: "low" }],
    }),
  });
  assert.equal(overflow.ok, false);
  assert.equal(overflow.error.code, "state_limit");
  assert.equal(overflow.state.version, state.version);
  assert.equal(overflow.state.claims.length, 12);
});

test("source contains real streaming adapters and credential-free structured rooms", async () => {
  const [page, styles, route, meetingRecord, meetingState, roomStore, handoff, handoffZh] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/discuss/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/meeting-record.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/meeting-state.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/room-store.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/AI_HANDOFF.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/zh-CN/AI_HANDOFF.md", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /agentCopy|seedMessages|setTimeout\(\(\) => \{\s*const nextRound/);
  assert.match(page, /Add new connection/);
  assert.match(page, /Reload models/);
  assert.match(page, /Replace key/);
  assert.match(page, /Use for Seat/);
  assert.match(page, /createBrowserRoomStore/);
  assert.match(page, /Credentials are excluded/);
  const meetingRecordType = meetingRecord.match(/export type MeetingRecord = \{[\s\S]*?\n\};/)?.[0] ?? "";
  assert.ok(meetingRecordType);
  assert.doesNotMatch(meetingRecordType, /apiKey|connectionId/);
  assert.match(roomStore, /indexedDB\.open\(databaseName, databaseVersion\)/);
  assert.match(roomStore, /multi-ai-meeting-room\.history\.v1|legacyMeetingHistoryKey/);
  assert.match(roomStore, /localStorage\.removeItem\(legacyMeetingHistoryKey\)/);
  assert.match(roomStore, /participantStore\.delete/);
  assert.match(roomStore, /turn\.format_failed/);
  assert.match(roomStore, /canonicalState/);
  assert.match(page, /This turn was interrupted before completion\./);
  assert.match(page, /reduceTurnEnvelope/);
  assert.match(meetingState, /renderedContextCharacters:\s*6_000/);
  assert.match(meetingState, /unknown_reference/);
  for (const objectStore of ["rooms", "participants", "events", "stateSnapshots", "artifacts", "usage", "metadata"]) {
    assert.match(roomStore, new RegExp(`["]${objectStore}["]`));
  }
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

function fixtureTurnEnvelope(prompt, fallbackStatement) {
  const synthesis = prompt.includes("Create the decision memo");
  const review = prompt.includes("REVIEW TARGET");
  const statement = synthesis
    ? "# Recommendation\nRun the bounded experiment.\n# Agreements\nUse explicit bounds.\n# Unresolved Disputes\nNone in this fixture.\n# Unverified Assumptions\nFixture only.\n# Tradeoffs\nCost versus diversity.\n# Next Actions\nMeasure the pilot."
    : fallbackStatement;
  return JSON.stringify(validEnvelope({
    statement,
    stance: synthesis ? "support" : review ? "oppose" : "propose",
    thesis: synthesis ? "Run the bounded experiment." : review ? "The target needs revision." : fallbackStatement,
    newClaims: synthesis || review ? [] : [{ text: fallbackStatement, assumptionLevel: "low" }],
    objections: review ? [{ text: "The target needs a clearer bound.", severity: "material" }] : [],
  }));
}

function validEnvelope({
  statement,
  stance = "propose",
  thesis,
  newClaims = [],
  claimUpdates = [],
  objections = [],
  questionForChair,
}) {
  return {
    statement,
    card: {
      stance,
      thesis,
      newClaims,
      claimUpdates,
      objections,
      ...(questionForChair ? { questionForChair } : {}),
      recommendedAction: "Continue only within the declared bound.",
      confidence: { level: "medium", reason: "This is a bounded test fixture." },
    },
  };
}

function restoreEnv(key, value) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
