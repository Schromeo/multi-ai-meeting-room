import type { MeetingRecord } from "./meeting-record";
import type { SourceAttempt } from "./source-attempt";

// One ordinary saved Decide room only. This is a projection, not a copy of the record.
const safeId = /^[a-zA-Z0-9._:/-]+$/;

function receiptFields(receipt: SourceAttempt) {
  return {
    version: receipt.version,
    captureVersion: receipt.captureVersion,
    validatorVersion: receipt.validatorVersion,
    attemptId: receipt.attemptId,
    requestId: receipt.requestId,
    turnId: receipt.turnId,
    seatId: receipt.seatId,
    provider: receipt.provider,
    phase: receipt.phase,
    round: receipt.round,
    outputLimit: receipt.outputLimit,
    lifecycle: receipt.lifecycle,
    startedAt: receipt.startedAt,
    endedAt: receipt.endedAt,
    elapsedMs: receipt.elapsedMs,
    callStatus: receipt.callStatus,
    providerFinish: receipt.providerFinish,
    providerReason: receipt.providerReason,
    validation: receipt.validation,
    validationCode: receipt.validationCode,
    validationPath: receipt.validationPath,
    inputTokens: { value: receipt.inputTokens.value, source: receipt.inputTokens.source },
    outputTokens: { value: receipt.outputTokens.value, source: receipt.outputTokens.source },
    reasoningTokens: { value: receipt.reasoningTokens.value, source: receipt.reasoningTokens.source },
    outputTokenBasis: receipt.outputTokenBasis,
  };
}

export function canExportOrdinaryMeeting(record: MeetingRecord): boolean {
  return record.taskMode === "decide" && !record.planRequest && !record.observer &&
    !record.protocolState?.observerEnabled && safeId.test(record.id) && record.id.length <= 200;
}

export function createMeetingDiagnosticExport(record: MeetingRecord) {
  if (!canExportOrdinaryMeeting(record)) throw new Error("Only a saved ordinary Decide meeting can be exported.");
  const receipts = record.sourceAttempts;
  const terminals = receipts?.filter((item) => item.lifecycle === "terminal") ?? [];
  const terminalIds = new Set(terminals.map((item) => item.attemptId));
  const protocol = record.protocolState;
  return {
    schemaVersion: 1,
    kind: "mamr-ordinary-meeting-diagnostic",
    room: { id: record.id, createdAt: record.createdAt, updatedAt: record.updatedAt },
    workflow: {
      stage: record.stage,
      phase: protocol?.phase ?? null,
      status: protocol?.status ?? null,
      round: protocol?.round ?? null,
      stopReason: protocol?.stopReason ?? null,
      updatedAt: protocol?.updatedAt ?? null,
    },
    taskResult: {
      memoPresent: record.memo.trim().length > 0,
      humanDecision: record.decision,
      qualityEvaluation: "not_evaluated" as const,
    },
    outcomeSignals: {
      turnEnvelopeRejectionObserved: terminals.length ? terminals.some((item) => item.validation === "rejected") : null,
      meetingInterrupted: protocol ? protocol.status === "interrupted" : null,
      humanDecision: record.decision,
      qualityEvaluation: "not_evaluated" as const,
    },
    turns: record.transcript.flatMap((item) =>
      item.provider !== "host" && item.seatId && item.round && safeId.test(item.id) && safeId.test(item.seatId)
        ? [{ id: item.id, seatId: item.seatId, round: item.round, phase: item.phase,
          status: item.status, formatFailureObserved: item.formatError !== undefined,
          reductionFailureObserved: item.reductionError !== undefined }]
        : []),
    sourceEvidence: {
      state: receipts === undefined ? "not_recorded" as const : receipts.length === 0 ? "recorded_empty" as const : "recorded" as const,
      unresolvedAttemptIds: receipts?.filter((item) => item.lifecycle === "started" && !terminalIds.has(item.attemptId)).map((item) => item.attemptId) ?? [],
      receipts: receipts?.map(receiptFields) ?? [],
    },
  };
}

export function serializeMeetingDiagnosticExport(record: MeetingRecord): string {
  return `${JSON.stringify(createMeetingDiagnosticExport(record), null, 2)}\n`;
}
