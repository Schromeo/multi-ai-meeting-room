import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/meeting-diagnostic-export.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { canExportOrdinaryMeeting, createMeetingDiagnosticExport, serializeMeetingDiagnosticExport } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const attemptSource = await readFile(new URL("../lib/source-attempt.ts", import.meta.url), "utf8");
const attemptCompiled = ts.transpileModule(attemptSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { optionalSourceAttempts } = await import(`data:text/javascript;base64,${Buffer.from(attemptCompiled).toString("base64")}`);

const unknown = { value: null, source: "unknown" };
const reported = (value) => ({ value, source: "reported" });
const start = {
  version: 1, captureVersion: "mamr-turn-v1", validatorVersion: "turn-envelope/v1",
  attemptId: "attempt-1", requestId: "request-1", turnId: "turn-1", seatId: "seat-1",
  provider: "openai", configuredModel: "gpt-fixture", phase: "proposal", round: 1,
  outputLimit: 1200, lifecycle: "started", startedAt: "2026-09-27T12:00:00.000Z",
  endedAt: null, elapsedMs: null, callStatus: "started", providerFinish: "unknown",
  providerReason: "unknown", validation: "not_run", validationCode: null, validationPath: null,
  inputTokens: unknown, outputTokens: unknown, reasoningTokens: unknown,
  outputTokenBasis: "provider_output",
};
const terminal = {
  ...start, lifecycle: "terminal", endedAt: "2026-09-27T12:00:02.000Z", elapsedMs: 2000,
  callStatus: "returned", providerFinish: "completed", validation: "passed",
  inputTokens: reported(10), outputTokens: reported(8), reasoningTokens: unknown,
};
const base = {
  version: 1, id: "meeting-fixture-1", taskMode: "decide", objective: "SECRET_OBJECTIVE",
  stage: "decision", createdAt: "2026-09-27T11:59:00.000Z", updatedAt: "2026-09-27T12:00:03.000Z",
  decision: "approved", memo: "SECRET_MEMO", transcript: [{ id: "turn-1", seatId: "seat-1", round: 1,
    provider: "openai", providerName: "SECRET_PROVIDER_LABEL", role: "strategist", model: "gpt-fixture",
    phase: "proposal", text: "SECRET_ANSWER", status: "done" }],
  sourceAttempts: [start, terminal],
  protocolState: { phase: "complete", status: "complete", round: 1, updatedAt: "2026-09-27T12:00:03.000Z" },
  apiKey: "SECRET_KEY", prompt: "SECRET_PROMPT", arbitraryError: "SECRET_EXCEPTION",
};

const cases = [
  ["completed", base],
  ["contract-rejected", { ...base, stage: "meeting", decision: "waiting", memo: "", updatedAt: "2026-09-27T12:00:04.000Z",
    transcript: [{ ...base.transcript[0], status: "error", formatError: "SECRET_EXCEPTION" }],
    sourceAttempts: [start, { ...terminal, validation: "rejected", validationCode: "invalid_type", validationPath: "card.stance", outputTokens: reported(0) }],
    protocolState: { phase: "proposal", status: "interrupted", round: 1, updatedAt: "2026-09-27T12:00:04.000Z" } }],
  ["started-only", { ...base, stage: "meeting", decision: "waiting", memo: "", updatedAt: "2026-09-27T12:00:05.000Z",
    transcript: [{ ...base.transcript[0], status: "error" }], sourceAttempts: [start],
    protocolState: { phase: "proposal", status: "interrupted", round: 1, updatedAt: "2026-09-27T12:00:05.000Z" } }],
];

test("three offline diagnostic examples are exact deterministic projections", async () => {
  for (const [name, record] of cases) {
    const first = serializeMeetingDiagnosticExport(record);
    assert.equal(first, serializeMeetingDiagnosticExport(record));
    const sample = JSON.parse(await readFile(new URL(`./fixtures/diagnostic-export/${name}.json`, import.meta.url), "utf8"));
    assert.deepEqual(JSON.parse(first), sample, name);
    assert.doesNotMatch(first, /SECRET_|prompt|arbitraryError|formatError|objective|providerName|"text"|"memo"/i);
  }
});

test("export uses explicit outcome dimensions and preserves missing P2 evidence", () => {
  const completed = createMeetingDiagnosticExport(base);
  assert.deepEqual(Object.keys(completed), ["schemaVersion", "kind", "room", "workflow", "taskResult", "outcomeSignals", "turns", "sourceEvidence"]);
  assert.equal(completed.outcomeSignals.turnEnvelopeRejectionObserved, false);
  assert.equal(completed.outcomeSignals.meetingInterrupted, false);
  assert.equal(completed.outcomeSignals.humanDecision, "approved");
  assert.equal(completed.outcomeSignals.qualityEvaluation, "not_evaluated");
  assert.deepEqual(Object.keys(completed.sourceEvidence.receipts[0]), Object.keys(start).filter((key) => key !== "configuredModel"));
  assert.deepEqual(Object.keys(completed.sourceEvidence.receipts[0].inputTokens), ["value", "source"]);
  const poisoned = serializeMeetingDiagnosticExport({ ...base, sourceAttempts: [{ ...start, apiKey: "SECRET_KEY", exceptionText: "SECRET_EXCEPTION" }, terminal] });
  assert.doesNotMatch(poisoned, /SECRET_|apiKey|exceptionText/);
  const rejected = createMeetingDiagnosticExport(cases[1][1]);
  assert.equal(rejected.outcomeSignals.turnEnvelopeRejectionObserved, true);
  assert.equal(rejected.outcomeSignals.meetingInterrupted, true);
  assert.equal(rejected.turns[0].formatFailureObserved, true);
  const missing = createMeetingDiagnosticExport(cases[2][1]);
  assert.equal(missing.outcomeSignals.turnEnvelopeRejectionObserved, null);
  assert.deepEqual(missing.sourceEvidence.unresolvedAttemptIds, ["attempt-1"]);
  const old = createMeetingDiagnosticExport({ ...base, sourceAttempts: undefined });
  assert.equal(old.sourceEvidence.state, "not_recorded");
  assert.deepEqual(old.sourceEvidence.receipts, []);
  assert.equal(old.outcomeSignals.turnEnvelopeRejectionObserved, null);
  const terminalOnly = createMeetingDiagnosticExport({ ...base, sourceAttempts: [terminal] });
  assert.deepEqual(terminalOnly.sourceEvidence.receipts.map((item) => item.lifecycle), ["terminal"]);
  assert.deepEqual(terminalOnly.sourceEvidence.unresolvedAttemptIds, []);
  const empty = createMeetingDiagnosticExport({ ...base, sourceAttempts: [] });
  assert.equal(empty.sourceEvidence.state, "recorded_empty");
  assert.equal(empty.outcomeSignals.turnEnvelopeRejectionObserved, null);
});

test("only one ordinary Decide record is eligible", () => {
  assert.equal(canExportOrdinaryMeeting(base), true);
  assert.equal(canExportOrdinaryMeeting({ ...base, taskMode: "review" }), false);
  assert.equal(canExportOrdinaryMeeting({ ...base, planRequest: {} }), false);
  assert.equal(canExportOrdinaryMeeting({ ...base, observer: {} }), false);
  assert.equal(canExportOrdinaryMeeting({ ...base, protocolState: { ...base.protocolState, observerEnabled: true } }), false);
  assert.equal(canExportOrdinaryMeeting({ ...base, id: "unsafe/id?secret=1" }), false);
});

test("resaving a legacy room does not add an empty P2 collection", () => {
  assert.deepEqual(optionalSourceAttempts([], { id: "old-room" }), {});
  assert.deepEqual(optionalSourceAttempts([], { sourceAttempts: [] }), { sourceAttempts: [] });
  assert.deepEqual(optionalSourceAttempts([start], { id: "old-room" }), { sourceAttempts: [start] });
});
