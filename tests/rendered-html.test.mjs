import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

let meetingStateModule;
let meetingOrchestratorModule;

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

async function loadMeetingOrchestratorModule() {
  if (!meetingOrchestratorModule) {
    meetingOrchestratorModule = readFile(
      new URL("../lib/meeting-orchestrator.ts", import.meta.url),
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
  return meetingOrchestratorModule;
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
  assert.equal(body.defaultMaxRounds, 2);
  assert.equal(body.maxIterations, 5);
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
      const request = JSON.parse(String(init?.body ?? "{}"));
      assert.equal(request.thinking, undefined);
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
    const validatingTurns = events.filter(
      (event) => event.type === "agent.progress" && event.stage === "validating",
    );
    assert.equal(validatingTurns.length, 5);
    assert.deepEqual(
      new Set(validatingTurns.map((event) => event.id)),
      new Set(completedTurns.map((event) => event.id)),
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
      if (request.model === "gpt-5-mini") {
        assert.deepEqual(request.reasoning, { effort: "minimal" });
      } else {
        assert.equal(request.reasoning, undefined);
      }
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
            { id: "seat-1", connectionId: "shared-openai", provider: "openai", model: "gpt-5-mini", role: "strategist" },
            { id: "seat-2", connectionId: "shared-openai", provider: "openai", model: "gpt-4.1-mini", role: "critic" },
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
      ["gpt-5-mini", "gpt-4.1-mini"],
    );
    assert.ok(events.find((event) => event.type === "room.done"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("split proposal transitions stop at a checkpoint and reject an applied transition before provider calls", async () => {
  const originalFetch = globalThis.fetch;
  const { createInitialMeetingState, reduceTurnEnvelope } = await loadMeetingStateModule();
  let providerCalls = 0;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.openai.com/")) return originalFetch(input, init);
    providerCalls += 1;
    const request = JSON.parse(String(init?.body ?? "{}"));
    const text = fixtureTurnEnvelope(String(request.input), `${request.model} checkpoint proposal.`);
    return sseResponse([
      { type: "response.output_text.delta", delta: text },
      { type: "response.completed", response: { usage: { input_tokens: 8, output_tokens: 6 } } },
    ]);
  };

  try {
    const worker = await loadWorker();
    const objective = "Verify that resumable proposal transitions stop at a safe checkpoint.";
    const seats = [
      { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
      { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
    ];
    const requestBody = {
      objective,
      seats,
      connections: { shared: { provider: "openai", apiKey: "phase-test-key" } },
      iteration: 1,
      priorMemo: "",
      requestId: "transition-proposal-fixture-1",
      protocolPhase: "proposal",
      seatIds: ["seat-1", "seat-2"],
      contextTurns: [],
      meetingState: createInitialMeetingState(objective),
    };
    const firstResponse = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      }),
      workerEnv(),
      executionContext(),
    );
    assert.equal(firstResponse.status, 200);
    const firstEvents = (await firstResponse.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 2);
    assert.equal(firstEvents.filter((event) => event.type === "phase.start").length, 1);
    assert.equal(firstEvents.find((event) => event.type === "phase.done")?.phase, "proposal");
    assert.equal(firstEvents.find((event) => event.type === "room.done"), undefined);

    let state = requestBody.meetingState;
    for (const event of firstEvents.filter((item) => item.type === "agent.done")) {
      const reduction = reduceTurnEnvelope(state, {
        id: event.id,
        sourceMessageId: event.id,
        seatId: event.seatId,
        round: event.round,
        phase: event.phase,
        envelope: event.envelope,
        usage: event.usage,
      });
      assert.equal(reduction.ok, true);
      state = reduction.state;
    }

    const duplicateResponse = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...requestBody, meetingState: state }),
      }),
      workerEnv(),
      executionContext(),
    );
    const duplicateEvents = (await duplicateResponse.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 2);
    assert.match(duplicateEvents.find((event) => event.type === "room.error")?.message ?? "", /already present/i);

    const proposalContext = firstEvents
      .filter((event) => event.type === "agent.done")
      .map((event) => ({
        id: event.id,
        seatId: event.seatId,
        round: event.round,
        phase: event.phase,
        envelope: event.envelope,
      }));
    const reviewResponse = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...requestBody,
          requestId: "transition-review-fixture-1",
          protocolPhase: "review",
          contextTurns: proposalContext,
          meetingState: state,
        }),
      }),
      workerEnv(),
      executionContext(),
    );
    const reviewEvents = (await reviewResponse.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 4);
    assert.equal(reviewEvents.find((event) => event.type === "phase.done")?.phase, "review");
    assert.equal(reviewEvents.filter((event) => event.type === "agent.done" && event.phase === "review").length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Observer makes one bounded source-linked call without receiving the transcript", async () => {
  const originalFetch = globalThis.fetch;
  const { createInitialMeetingState, reduceTurnEnvelope } = await loadMeetingStateModule();
  const objective = "Check whether the review round is ready for a bounded synthesis.";
  const first = reduceTurnEnvelope(createInitialMeetingState(objective), {
    id: "observer-source-proposal",
    sourceMessageId: "observer-source-proposal",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: validEnvelope({
      statement: "Use a bounded plan.",
      thesis: "The plan should remain bounded.",
      newClaims: [{ text: "Ten days is the fixed planning horizon.", assumptionLevel: "low" }],
      questionForChair: "Which outcome matters most?",
    }),
  });
  assert.equal(first.ok, true);
  const second = reduceTurnEnvelope(first.state, {
    id: "observer-source-review",
    sourceMessageId: "observer-source-review",
    seatId: "seat-2",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "The outcome needs a measurable threshold.",
      stance: "oppose",
      thesis: "The plan needs a measurable threshold.",
      claimUpdates: [{ claimId: first.state.claims[0].id, action: "oppose", reason: "No threshold is named." }],
      objections: [{ targetClaimId: first.state.claims[0].id, text: "The threshold is missing.", severity: "material" }],
    }),
  });
  assert.equal(second.ok, true);
  const state = second.state;
  const stateBefore = JSON.stringify(state);
  const processReport = {
    id: `process-report-r1-v${state.version}`,
    round: 1,
    sourceStateVersion: state.version,
    sourceTurnIds: ["observer-source-proposal", "observer-source-review"],
    createdAt: "2026-08-22T10:00:00.000Z",
    newClaimCount: 1,
    claimUpdateCount: 1,
    objectionCount: 1,
    noNewInformationCount: 0,
    madeStructuralProgress: true,
    distinctThesisRatio: 1,
    activeDisputeIds: [state.disputes[0].id],
    openQuestionCount: 1,
    recommendation: "continue",
    reasons: [],
  };
  let providerCalls = 0;
  let observerPrompt = "";
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.openai.com/")) return originalFetch(input, init);
    providerCalls += 1;
    const request = JSON.parse(String(init?.body ?? "{}"));
    observerPrompt = String(request.input);
    assert.equal(request.model, "gpt-observer-fixture");
    assert.equal(request.max_output_tokens, 300);
    const output = {
      summary: "The round added one claim and one material objection. The threshold dispute remains open.",
      focusClaimIds: [state.claims[0].id],
      remainingDisputeIds: [state.disputes[0].id],
      chairQuestionIds: [state.openQuestions[0].id],
      convergence: "healthy",
      loopRisk: "low",
      driftRisk: "low",
      recommendation: "targeted_debate",
      reason: "Resolve the named threshold dispute before synthesis.",
    };
    return sseResponse([
      { type: "response.output_text.delta", delta: JSON.stringify(output) },
      { type: "response.completed", response: { usage: { input_tokens: 40, output_tokens: 30 } } },
    ]);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective,
          seats: [
            { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
          ],
          observer: { connectionId: "shared", provider: "openai", model: "gpt-observer-fixture" },
          connections: { shared: { provider: "openai", apiKey: "observer-fixture-key" } },
          iteration: 1,
          priorMemo: "FORBIDDEN RAW TRANSCRIPT",
          requestId: "observer-transition-fixture-1",
          protocolPhase: "observer",
          seatIds: [],
          meetingState: state,
          processReport,
        }),
      }),
      workerEnv(),
      executionContext(),
    );
    assert.equal(response.status, 200);
    const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 1);
    assert.doesNotMatch(observerPrompt, /FORBIDDEN RAW TRANSCRIPT/);
    assert.match(observerPrompt, /DETERMINISTIC PROCESS REPORT/);
    assert.match(observerPrompt, new RegExp(state.claims[0].id));
    const done = events.find((event) => event.type === "observer.done");
    assert.ok(done);
    assert.equal(done.brief.sourceStateVersion, state.version);
    assert.equal(done.brief.sourceProcessReportId, processReport.id);
    assert.deepEqual(done.brief.sourceTurnIds, processReport.sourceTurnIds);
    assert.equal(events.find((event) => event.type === "phase.done")?.phase, "observer");
    assert.equal(JSON.stringify(state), stateBefore);
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
    const formatErrors = events.filter((event) => event.type === "agent.format_error");
    assert.equal(providerCalls, 2);
    assert.equal(formatErrors.length, 2);
    assert.deepEqual(
      formatErrors.map((event) => [event.usage.inputTokens, event.usage.outputTokens]),
      [[5, 2], [5, 2]],
    );
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
  assert.equal(parseTurnEnvelope(`\`\`\`json\n${JSON.stringify(proposal)}\n\`\`\``, "proposal").ok, true);
  assert.equal(parseTurnEnvelope(`prefix\n${JSON.stringify(proposal)}`, "proposal").ok, false);
  const omittedCollections = JSON.parse(JSON.stringify(proposal));
  delete omittedCollections.card.claimUpdates;
  delete omittedCollections.card.objections;
  const normalizedCollections = parseTurnEnvelope(omittedCollections, "proposal");
  assert.equal(normalizedCollections.ok, true);
  assert.deepEqual(normalizedCollections.value.card.claimUpdates, []);
  assert.deepEqual(normalizedCollections.value.card.objections, []);

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

  const revision = reduceTurnEnvelope(first.state, {
    id: "turn-revise",
    sourceMessageId: "message-revise",
    seatId: "seat-2",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "Keep the claim visible while requesting a revision.",
      stance: "revise",
      thesis: "A revision request is advisory until the chair resolves it.",
      claimUpdates: [{ claimId: first.state.claims[0].id, action: "revise", reason: "Clarify the success threshold." }],
    }),
  });
  assert.equal(revision.ok, true);
  assert.equal(revision.state.claims[0].status, "contested");

  const parallelSupport = reduceTurnEnvelope(revision.state, {
    id: "turn-support-after-revise",
    sourceMessageId: "message-support-after-revise",
    seatId: "seat-3",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "Support the still-published claim from the same review phase.",
      stance: "support",
      thesis: "Parallel reviewers must share stable Claim references.",
      claimUpdates: [{ claimId: first.state.claims[0].id, action: "support", reason: "The bounded pilot remains useful." }],
    }),
  });
  assert.equal(parallelSupport.ok, true);
  assert.equal(parallelSupport.state.claims[0].status, "contested");
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

test("resumable protocol pauses safely and recovers transitions idempotently", async () => {
  const {
    beginProtocolTransition,
    completeProtocolTransition,
    continueProtocol,
    createMeetingProtocolState,
    parseMeetingProtocolState,
    recoverProtocolAfterReload,
  } = await loadMeetingOrchestratorModule();
  const now = "2026-08-08T12:00:00.000Z";
  const initial = createMeetingProtocolState(["seat-1", "seat-2"], "checkpoints", 2, now);
  const running = beginProtocolTransition(initial, "transition-proposal-1", ["seat-1", "seat-2"], now);
  assert.equal(running.ok, true);
  assert.equal(running.state.status, "running");

  const completed = completeProtocolTransition(
    running.state,
    "transition-proposal-1",
    ["seat-1", "seat-2"],
    now,
  );
  assert.equal(completed.ok, true);
  assert.equal(completed.state.phase, "proposal_checkpoint");
  assert.equal(completed.state.status, "paused");
  assert.equal(parseMeetingProtocolState(completed.state)?.phase, "proposal_checkpoint");

  const duplicate = completeProtocolTransition(
    completed.state,
    "transition-proposal-1",
    ["seat-1", "seat-2"],
    now,
  );
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.transitions.length, 1);

  const reviewReady = continueProtocol(completed.state, ["seat-1", "seat-2"], now);
  assert.equal(reviewReady.ok, true);
  assert.equal(reviewReady.state.phase, "review");
  assert.deepEqual(reviewReady.state.pendingSeatIds, ["seat-1", "seat-2"]);

  const reviewRunning = beginProtocolTransition(
    reviewReady.state,
    "transition-review-1",
    ["seat-1", "seat-2"],
    now,
  );
  assert.equal(reviewRunning.ok, true);
  const recovered = recoverProtocolAfterReload(reviewRunning.state, "2026-08-08T12:01:00.000Z");
  assert.equal(recovered.status, "interrupted");
  assert.equal(recovered.transitions.at(-1).status, "interrupted");
  const explicitResume = continueProtocol(recovered, ["seat-1", "seat-2"], now);
  assert.equal(explicitResume.ok, true);
  assert.equal(explicitResume.state.status, "ready");

  const turnByTurn = createMeetingProtocolState(["seat-1", "seat-2"], "turn_by_turn", 2, now);
  const oneSeat = beginProtocolTransition(turnByTurn, "transition-seat-1", ["seat-1"], now);
  const oneSeatDone = completeProtocolTransition(oneSeat.state, "transition-seat-1", ["seat-1"], now);
  assert.equal(oneSeatDone.state.status, "paused");
  assert.deepEqual(oneSeatDone.state.pendingSeatIds, ["seat-2"]);
});

test("deterministic budgets and process reports stop bounded low-progress work", async () => {
  const {
    beginProtocolTransition,
    completeProtocolTransition,
    continueProtocol,
    createMeetingProtocolState,
    createProcessReport,
    evaluateMeetingBudget,
    parseMeetingProtocolState,
  } = await loadMeetingOrchestratorModule();
  const { createInitialMeetingState } = await loadMeetingStateModule();
  const now = "2026-08-10T12:00:00.000Z";
  const tightBudget = {
    maxAgentTurns: 2,
    maxInputTokens: 2_000,
    maxOutputTokens: 1_000,
    maxModelTimeMs: 10_000,
  };
  const initial = createMeetingProtocolState(
    ["seat-1", "seat-2"],
    "checkpoints",
    2,
    now,
    tightBudget,
  );
  const proposal = beginProtocolTransition(initial, "budget-proposal", ["seat-1", "seat-2"], now);
  assert.equal(proposal.ok, true);
  const proposalDone = completeProtocolTransition(
    proposal.state,
    "budget-proposal",
    ["seat-1", "seat-2"],
    now,
  );
  const reviewReady = continueProtocol(proposalDone.state, ["seat-1", "seat-2"], now);
  const turnStop = evaluateMeetingBudget(reviewReady.state, {
    inputTokens: 100,
    outputTokens: 100,
    estimatedUsd: 0.01,
    latencyMs: 100,
  }, ["seat-1"]);
  assert.equal(turnStop.allowed, false);
  assert.deepEqual(turnStop.reasons, ["turn_limit"]);

  const tokenStop = evaluateMeetingBudget(initial, {
    inputTokens: 2_000,
    outputTokens: 100,
    estimatedUsd: 0.01,
    latencyMs: 100,
  }, ["seat-1"]);
  assert.equal(tokenStop.allowed, false);
  assert.ok(tokenStop.reasons.includes("input_token_limit"));

  const legacyState = JSON.parse(JSON.stringify(initial));
  delete legacyState.budget;
  delete legacyState.processReports;
  const parsedLegacy = parseMeetingProtocolState(legacyState);
  assert.ok(parsedLegacy);
  assert.equal(parsedLegacy.processReports.length, 0);

  const meetingState = createInitialMeetingState("Stop when another round adds nothing.");
  const noProgressEnvelope = validEnvelope({
    statement: "No new information.",
    stance: "no_new_information",
    thesis: "The current state is unchanged.",
  });
  const firstReport = createProcessReport(meetingState, [{
    id: "round-1-no-progress",
    round: 1,
    phase: "review",
    status: "done",
    envelope: noProgressEnvelope,
  }], undefined, now);
  assert.equal(firstReport.recommendation, "continue");
  assert.equal(firstReport.madeStructuralProgress, false);

  const secondReport = createProcessReport(
    { ...meetingState, round: 2, version: 2 },
    [{
      id: "round-2-no-progress",
      round: 2,
      phase: "review",
      status: "done",
      envelope: noProgressEnvelope,
    }],
    firstReport,
    "2026-08-10T12:01:00.000Z",
  );
  assert.equal(secondReport.recommendation, "pause");
  assert.ok(secondReport.reasons.includes("low_progress"));
});

test("Observer transitions are budgeted, source-bound, resumable, and backward compatible", async () => {
  const {
    beginObserverTransition,
    completeObserverTransition,
    continueProtocol,
    createMeetingProtocolState,
    evaluateMeetingBudget,
    interruptProtocolTransition,
    parseMeetingProtocolState,
  } = await loadMeetingOrchestratorModule();
  const now = "2026-08-22T11:00:00.000Z";
  const report = {
    id: "process-report-r1-v2",
    round: 1,
    sourceStateVersion: 2,
    sourceTurnIds: ["turn-proposal", "turn-review"],
    createdAt: now,
    newClaimCount: 1,
    claimUpdateCount: 1,
    objectionCount: 1,
    noNewInformationCount: 0,
    madeStructuralProgress: true,
    distinctThesisRatio: 1,
    activeDisputeIds: ["dispute-1"],
    openQuestionCount: 1,
    recommendation: "continue",
    reasons: [],
  };
  const initial = createMeetingProtocolState(
    ["seat-1", "seat-2"],
    "checkpoints",
    2,
    now,
    undefined,
    true,
  );
  assert.equal(initial.budget.maxAgentTurns, 12);
  const checkpoint = {
    ...initial,
    phase: "review_checkpoint",
    status: "paused",
    pendingSeatIds: [],
    processReports: [report],
  };
  const budget = evaluateMeetingBudget(checkpoint, {
    inputTokens: 0,
    outputTokens: 0,
    estimatedUsd: 0,
    latencyMs: 0,
  }, [], 1);
  assert.equal(budget.allowed, true);
  const running = beginObserverTransition(checkpoint, "observer-transition-1", now);
  assert.equal(running.ok, true);
  assert.equal(running.state.transitions.at(-1).phase, "observer");
  const interrupted = interruptProtocolTransition(running.state, "observer-transition-1", now);
  assert.equal(interrupted.ok, true);
  const resumed = continueProtocol(interrupted.state, ["seat-1", "seat-2"], now);
  assert.equal(resumed.ok, true);
  assert.equal(resumed.state.phase, "review_checkpoint");
  assert.equal(resumed.state.status, "paused");

  const rerun = beginObserverTransition(resumed.state, "observer-transition-2", now);
  assert.equal(rerun.ok, true);
  const brief = {
    id: "round-brief-r1-v2",
    round: 1,
    sourceStateVersion: 2,
    sourceProcessReportId: report.id,
    sourceTurnIds: [...report.sourceTurnIds],
    createdAt: now,
    summary: "One dispute remains after productive review.",
    focusClaimIds: ["claim-1"],
    remainingDisputeIds: ["dispute-1"],
    chairQuestionIds: ["question-1"],
    convergence: "healthy",
    loopRisk: "low",
    driftRisk: "low",
    recommendation: "targeted_debate",
    reason: "Resolve the remaining dispute.",
    observer: { provider: "openai", model: "gpt-observer" },
    usage: { inputTokens: 20, outputTokens: 10, estimatedUsd: 0.001, latencyMs: 100 },
  };
  const completed = completeObserverTransition(rerun.state, "observer-transition-2", brief, now);
  assert.equal(completed.ok, true);
  assert.equal(completed.state.roundBriefs.length, 1);
  assert.equal(completed.state.phase, "review_checkpoint");
  assert.equal(completed.state.status, "paused");

  const legacy = JSON.parse(JSON.stringify(initial));
  delete legacy.observerEnabled;
  delete legacy.roundBriefs;
  const parsedLegacy = parseMeetingProtocolState(legacy);
  assert.ok(parsedLegacy);
  assert.equal(parsedLegacy.observerEnabled, false);
  assert.deepEqual(parsedLegacy.roundBriefs, []);
});

test("the Human Chair can route one open Dispute into a bounded resumable round", async () => {
  const {
    beginProtocolTransition,
    beginTargetedDebateRound,
    completeProtocolTransition,
    createMeetingProtocolState,
    parseMeetingProtocolState,
    recoverProtocolAfterReload,
  } = await loadMeetingOrchestratorModule();
  const { createInitialMeetingState, reduceTurnEnvelope } = await loadMeetingStateModule();
  const now = "2026-08-22T15:00:00.000Z";
  const objective = "Resolve one named disagreement without rerunning the full meeting.";
  let state = createInitialMeetingState(objective);
  state = reduceTurnEnvelope(state, {
    id: "proposal-source-turn",
    sourceMessageId: "proposal-source-message",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: validEnvelope({
      statement: "Use one bounded route.",
      thesis: "A bounded route controls cost.",
      newClaims: [{ text: "Use one bounded route.", assumptionLevel: "low" }],
    }),
  }).state;
  state = reduceTurnEnvelope(state, {
    id: "review-source-turn",
    sourceMessageId: "review-source-message",
    seatId: "seat-2",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "The route still needs a stop condition.",
      stance: "oppose",
      thesis: "The route needs a stop condition.",
      objections: [{ targetClaimId: state.claims[0].id, text: "No stop condition is named.", severity: "material" }],
    }),
  }).state;
  const dispute = state.disputes[0];
  const checkpoint = {
    ...createMeetingProtocolState(["seat-1", "seat-2", "seat-3"], "checkpoints", 2, now),
    phase: "review_checkpoint",
    status: "paused",
    round: 1,
    pendingSeatIds: [],
  };
  const targeted = beginTargetedDebateRound(
    checkpoint,
    state,
    dispute.id,
    ["seat-1", "seat-2", "seat-3"],
    now,
  );
  assert.equal(targeted.ok, true);
  assert.equal(targeted.state.phase, "targeted_debate");
  assert.equal(targeted.state.round, 2);
  assert.deepEqual(targeted.state.pendingSeatIds, ["seat-2", "seat-1"]);
  assert.deepEqual(targeted.state.targetedDebates[0].sourceMessageIds, [
    "review-source-message",
    "proposal-source-message",
  ]);
  assert.equal(parseMeetingProtocolState(targeted.state)?.targetedDebates.length, 1);

  const running = beginProtocolTransition(
    targeted.state,
    "targeted-transition-1",
    targeted.state.pendingSeatIds,
    now,
  );
  assert.equal(running.ok, true);
  assert.equal(running.state.transitions.at(-1).phase, "targeted_debate");
  const recovered = recoverProtocolAfterReload(running.state, now);
  assert.equal(recovered.status, "interrupted");

  const turnByTurnTargeted = beginTargetedDebateRound(
    { ...checkpoint, controlMode: "turn_by_turn" },
    state,
    dispute.id,
    ["seat-1", "seat-2", "seat-3"],
    now,
  );
  const firstTargetedSeat = beginProtocolTransition(
    turnByTurnTargeted.state,
    "targeted-turn-by-turn-1",
    ["seat-2"],
    now,
  );
  const firstTargetedDone = completeProtocolTransition(
    firstTargetedSeat.state,
    "targeted-turn-by-turn-1",
    ["seat-2"],
    now,
  );
  assert.equal(firstTargetedDone.state.status, "paused");
  assert.deepEqual(firstTargetedDone.state.pendingSeatIds, ["seat-1"]);

  const completed = completeProtocolTransition(
    running.state,
    "targeted-transition-1",
    ["seat-2", "seat-1"],
    now,
  );
  assert.equal(completed.ok, true);
  assert.equal(completed.state.phase, "review_checkpoint");
  assert.equal(completed.state.status, "paused");

  const exhausted = beginTargetedDebateRound(
    { ...checkpoint, maxRounds: 1 },
    state,
    dispute.id,
    ["seat-1", "seat-2"],
    now,
  );
  assert.equal(exhausted.ok, false);
  assert.match(exhausted.error, /maximum round/i);
});

test("targeted debate calls only routed Seats with the named bounded context", async () => {
  const originalFetch = globalThis.fetch;
  const { createInitialMeetingState, reduceTurnEnvelope } = await loadMeetingStateModule();
  const objective = "Resolve one named disagreement without replaying the room transcript.";
  let state = createInitialMeetingState(objective);
  state = reduceTurnEnvelope(state, {
    id: "target-proposal-turn",
    sourceMessageId: "target-proposal-message",
    seatId: "seat-1",
    round: 1,
    phase: "proposal",
    envelope: validEnvelope({
      statement: "Adopt a ten-day plan.",
      thesis: "Ten days is the target duration.",
      newClaims: [{ text: "Use a ten-day duration.", assumptionLevel: "medium" }],
    }),
  }).state;
  state = reduceTurnEnvelope(state, {
    id: "target-review-turn",
    sourceMessageId: "target-review-message",
    seatId: "seat-2",
    round: 1,
    phase: "review",
    envelope: validEnvelope({
      statement: "The daily load is unresolved.",
      stance: "oppose",
      thesis: "Daily load needs an explicit bound.",
      objections: [{ targetClaimId: state.claims[0].id, text: "Daily load is not bounded.", severity: "material" }],
    }),
  }).state;
  const dispute = state.disputes[0];
  let providerCalls = 0;
  const prompts = [];
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.openai.com/")) return originalFetch(input, init);
    providerCalls += 1;
    const request = JSON.parse(String(init?.body ?? "{}"));
    const prompt = String(request.input);
    prompts.push(prompt);
    const synthesis = prompt.includes("Create the decision memo");
    assert.equal(request.max_output_tokens, synthesis ? 1_200 : 250);
    const output = synthesis
      ? validEnvelope({
          statement: "# Recommendation\nUse a bounded ten-day plan.\n# Agreements\nDuration is fixed.\n# Unresolved Disputes\nDaily load needs Chair confirmation.\n# Unverified Assumptions\nBaseline skill is self-reported.\n# Tradeoffs\nSpeed versus recovery.\n# Next Actions\nChoose the daily workload.",
          stance: "support",
          thesis: "Use a bounded ten-day plan.",
        })
      : validEnvelope({
          statement: `Routed response ${providerCalls}.`,
          stance: "revise",
          thesis: "Add a daily workload bound.",
          claimUpdates: [{ claimId: state.claims[0].id, action: "revise", reason: "Name a daily workload ceiling." }],
        });
    return sseResponse([
      { type: "response.output_text.delta", delta: JSON.stringify(output) },
      { type: "response.completed", response: { usage: { input_tokens: 50, output_tokens: 30 } } },
    ]);
  };

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective,
          seats: [
            { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
            { id: "seat-3", connectionId: "shared", provider: "openai", model: "gpt-c", role: "product" },
          ],
          connections: { shared: { provider: "openai", apiKey: "targeted-fixture-key" } },
          iteration: 2,
          priorMemo: "FORBIDDEN RAW TRANSCRIPT",
          requestId: "targeted-debate-fixture-1",
          protocolPhase: "targeted_debate",
          targetedDisputeId: dispute.id,
          seatIds: ["seat-2", "seat-1"],
          contextTurns: [],
          meetingState: state,
        }),
      }),
      workerEnv(),
      executionContext(),
    );
    assert.equal(response.status, 200);
    const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 2);
    assert.equal(prompts.length, 2);
    for (const prompt of prompts) {
      assert.match(prompt, /NAMED DISPUTE/);
      assert.match(prompt, new RegExp(dispute.id));
      assert.match(prompt, /target-review-message/);
      assert.doesNotMatch(prompt, /FORBIDDEN RAW TRANSCRIPT/);
    }
    assert.equal(events.find((event) => event.type === "phase.done")?.phase, "targeted_debate");
    assert.deepEqual(
      events.filter((event) => event.type === "agent.start").map((event) => event.seatId),
      ["seat-2", "seat-1"],
    );
    assert.ok(events.filter((event) => event.type === "agent.done").every((event) => event.phase === "review"));

    let targetedState = state;
    for (const event of events.filter((item) => item.type === "agent.done")) {
      targetedState = reduceTurnEnvelope(targetedState, {
        id: event.id,
        sourceMessageId: event.id,
        seatId: event.seatId,
        round: event.round,
        phase: event.phase,
        envelope: event.envelope,
        usage: event.usage,
      }).state;
    }
    const targetedTurns = events
      .filter((event) => event.type === "agent.done")
      .map((event) => ({
        id: event.id,
        seatId: event.seatId,
        round: event.round,
        phase: event.phase,
        envelope: event.envelope,
      }));
    const synthesisResponse = await worker.fetch(
      new Request("http://localhost/api/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective,
          seats: [
            { id: "seat-1", connectionId: "shared", provider: "openai", model: "gpt-a", role: "strategist" },
            { id: "seat-2", connectionId: "shared", provider: "openai", model: "gpt-b", role: "critic" },
            { id: "seat-3", connectionId: "shared", provider: "openai", model: "gpt-c", role: "product" },
          ],
          connections: { shared: { provider: "openai", apiKey: "targeted-fixture-key" } },
          iteration: 2,
          priorMemo: "",
          requestId: "targeted-synthesis-fixture-1",
          protocolPhase: "synthesis",
          targetedDisputeId: dispute.id,
          seatIds: [],
          contextTurns: targetedTurns,
          meetingState: targetedState,
        }),
      }),
      workerEnv(),
      executionContext(),
    );
    const synthesisBody = await synthesisResponse.text();
    assert.equal(synthesisResponse.status, 200, synthesisBody);
    const synthesisEvents = synthesisBody.trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(providerCalls, 3);
    assert.match(prompts[2], /NAMED DISPUTE/);
    assert.match(prompts[2], /Routed response 1/);
    assert.doesNotMatch(prompts[2], /FORBIDDEN RAW TRANSCRIPT/);
    assert.equal(synthesisEvents.find((event) => event.type === "phase.done")?.phase, "synthesis");
    assert.ok(synthesisEvents.find((event) => event.type === "room.done")?.memo);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("source contains real streaming adapters and credential-free structured rooms", async () => {
  const [page, styles, route, meetingRecord, meetingState, orchestrator, roomStore, handoff, handoffZh] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/discuss/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/meeting-record.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/meeting-state.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/meeting-orchestrator.ts", import.meta.url), "utf8"),
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
  assert.match(page, /currentRoomIdRef\.current = next/);
  assert.match(page, /const next = typeof update === "function" \? update\(transcriptRef\.current\) : update/);
  assert.match(page, /const next = typeof update === "function" \? update\(usageRef\.current\) : update/);
  const updateSeatHandler = page.match(/function updateSeat[\s\S]*?\n  }\n\n  function chooseSeatConnection/)?.[0] ?? "";
  assert.ok(updateSeatHandler);
  assert.doesNotMatch(updateSeatHandler, /setObserverDraft|\bmodels\b|\bconnectionId\b/);
  const updateModelsHandler = page.match(/function updateConnectionModels[\s\S]*?\n  }\n\n  async function saveConnection/)?.[0] ?? "";
  assert.ok(updateModelsHandler);
  assert.match(updateModelsHandler, /setObserverDraft/);
  assert.match(page, /beginProtocolTransition/);
  assert.match(page, /phaseBoundary\.detail \?\? phaseBoundary\.error\.message/);
  assert.match(page, /Structured state rejected this turn:/);
  assert.match(page, /Human Chair checkpoint/);
  assert.match(page, /turnProgressLabel/);
  assert.match(page, /progress: "generating"/);
  assert.doesNotMatch(page, /text: item\.text \+ event\.delta/);
  const roomDoneHandler = page.match(/if \(event\.type === "room\.done"\) \{[\s\S]*?\n    \}/)?.[0] ?? "";
  assert.ok(roomDoneHandler);
  assert.doesNotMatch(roomDoneHandler, /setStage\("decision"\)/);
  assert.match(meetingState, /renderedContextCharacters:\s*6_000/);
  assert.match(meetingState, /unknown_reference/);
  assert.match(orchestrator, /recoverProtocolAfterReload/);
  assert.match(orchestrator, /proposal_checkpoint/);
  assert.match(orchestrator, /evaluateMeetingBudget/);
  assert.match(orchestrator, /createProcessReport/);
  assert.match(roomStore, /protocol\.transition/);
  assert.match(roomStore, /chair\.directive/);
  assert.match(roomStore, /process\.report/);
  for (const objectStore of ["rooms", "participants", "events", "stateSnapshots", "artifacts", "usage", "metadata"]) {
    assert.match(roomStore, new RegExp(`["]${objectStore}["]`));
  }
  assert.match(styles, /\.decision-actions \.approve-button/);
  assert.match(styles, /\.history-drawer/);
  assert.match(route, /api\.openai\.com\/v1\/responses/);
  assert.match(route, /api\.anthropic\.com\/v1\/messages/);
  assert.match(route, /streamGenerateContent\?alt=sse/);
  assert.match(route, /stream:\s*true/);
  assert.match(route, /type: "agent\.progress", id: item\.id, stage: "validating"/);
  assert.match(route, /item: \{ \.\.\.item, id: turn\.id, text: turn\.envelope\.statement \}/);
  assert.match(route, /Review limits: statement at most 120 words/);
  assert.match(route, /Do not introduce external evidence/);
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
