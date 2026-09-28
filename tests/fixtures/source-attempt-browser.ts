import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { SourceAttemptView } from "../../app/source-attempt-view";
import { createBrowserRoomStore } from "../../lib/room-store";
import { emptyUsage, parseMeetingRecord, type MeetingRecord } from "../../lib/meeting-record";
import { appendSourceAttempt, reportedCount, type SourceAttempt } from "../../lib/source-attempt";

const started: SourceAttempt = {
  version: 1, captureVersion: "mamr-turn-v1", validatorVersion: "turn-envelope/v1",
  attemptId: "offline-attempt", requestId: "offline-request", turnId: "offline-turn", seatId: "seat-one",
  provider: "openai", configuredModel: "synthetic-model", phase: "proposal", round: 1, outputLimit: 1200,
  lifecycle: "started", startedAt: "2026-09-27T12:00:00.000Z", endedAt: null, elapsedMs: null,
  callStatus: "started", providerFinish: "unknown", providerReason: "unknown",
  validation: "not_run", validationCode: null, validationPath: null,
  inputTokens: reportedCount(null), outputTokens: reportedCount(null), reasoningTokens: reportedCount(null),
  outputTokenBasis: "provider_output",
};
const terminal: SourceAttempt = { ...started, lifecycle: "terminal",
  endedAt: "2026-09-27T12:00:01.250Z", elapsedMs: 1250, callStatus: "returned",
  providerFinish: "completed", validation: "rejected", validationCode: "invalid_type",
  validationPath: "card", inputTokens: reportedCount(42), outputTokens: reportedCount(8),
};
const unresolved: SourceAttempt = { ...started, attemptId: "offline-unresolved", turnId: "offline-turn-two" };
const record: MeetingRecord = {
  version: 1, id: "p2-offline-browser-room", objective: "Validate offline source evidence.",
  taskMode: "decide", stage: "meeting", transcript: [
    { id: "offline-agenda", provider: "host", providerName: "Human Chair", role: "host", model: "human",
      phase: "agenda", text: "Synthetic data only.", status: "done" },
  ], sourceAttempts: [started], memo: "", decision: "waiting", usage: { ...emptyUsage }, iteration: 1,
  participants: [{ provider: "openai", providerName: "OpenAI", model: "synthetic-model", role: "strategist" }],
  createdAt: started.startedAt, updatedAt: started.startedAt,
};
const root = createRoot(document.getElementById("preview")!);
const status = document.getElementById("status")!;
const button = document.getElementById("run") as HTMLButtonElement;
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
button.onclick = async () => {
  button.disabled = true;
  status.textContent = "Running browser IndexedDB checks…";
  const lines: string[] = [];
  const pass = (message: string) => { lines.push("PASS · " + message); status.textContent = lines.join("\n"); };
  const store = createBrowserRoomStore();
  try {
    await store.initialize();
    await store.deleteRoom(record.id);
    const legacy = { ...record }; delete legacy.sourceAttempts;
    assert(parseMeetingRecord(legacy)?.sourceAttempts === undefined, "Legacy records must remain without invented evidence.");
    pass("Old-record compatibility; no fabricated receipts");
    await store.putRoom(record);
    let restored = (await createBrowserRoomStore().listRooms()).find(item => item.id === record.id)!;
    assert(restored.sourceAttempts?.[0].lifecycle === "started" && restored.sourceAttempts.length === 1, "Unresolved start not restored");
    pass("Started-only receipt survives a new store connection; outcome stays unknown");
    const receipts = appendSourceAttempt(appendSourceAttempt([started], terminal), unresolved);
    await store.putRoom({ ...record, sourceAttempts: receipts });
    await store.putRoom({ ...record, sourceAttempts: receipts });
    restored = (await createBrowserRoomStore().listRooms()).find(item => item.id === record.id)!;
    assert(restored.sourceAttempts?.length === 3, "Duplicate receipts or missing terminal");
    assert(restored.sourceAttempts[1].inputTokens.value === 42 && restored.sourceAttempts[1].elapsedMs === 1250, "Source fields lost");
    assert(restored.sourceAttempts[1].reasoningTokens.value === null, "Unknown became zero");
    pass("Start + terminal round-trip and repeated save without duplication");
    let rejected = false;
    try {
      await store.putRoom({ ...record, objective: "Must roll back this change", sourceAttempts: [started, { ...terminal, elapsedMs: 999 }] });
    } catch { rejected = true; }
    restored = (await store.listRooms()).find(item => item.id === record.id)!;
    assert(rejected && restored.objective === record.objective && restored.sourceAttempts?.[1].elapsedMs === 1250, "Conflict did not roll back atomically");
    pass("Conflicting receipt aborts transaction; room and original evidence retained");
    root.render(createElement(SourceAttemptView, { receipts: restored.sourceAttempts! }));
    await store.deleteRoom(record.id);
    assert(!(await store.listRooms()).some(item => item.id === record.id), "Room deletion failed");
    await store.putRoom(legacy);
    const reused = (await store.listRooms()).find(item => item.id === record.id)!;
    assert(reused.sourceAttempts === undefined, "Deleted receipts resurfaced on reused room id");
    await store.deleteRoom(record.id);
    pass("Delete removes receipts; same room ID cannot resurrect evidence");
    pass("No provider/network calls; rendered component uses restored synthetic data");
  } catch (error) {
    status.textContent = lines.join("\n") + "\nFAIL · " + (error instanceof Error ? error.message : "Unknown failure");
  } finally { button.disabled = false; }
};
