import {
  AgentProgress,
  providerIds,
  ProviderId,
  roleIds,
  RoleId,
  UsageSummary,
} from "./discuss-protocol";
import {
  MeetingState,
  parseMeetingState,
  parseTurnEnvelope,
  TurnEnvelope,
} from "./meeting-state";
import {
  MeetingProtocolState,
  parseMeetingProtocolState,
  recoverProtocolAfterReload,
} from "./meeting-orchestrator";
import {
  parseReviewArtifactResult,
  parseReviewApprovedArtifact,
  parseReviewEditCheckpoint,
  parseReviewHumanRevision,
  ReviewApprovedArtifact,
  ReviewArtifactResult,
  ReviewEditCheckpoint,
  ReviewHumanRevision,
} from "./review-artifact";
import { parsePlanRequest, parsePlanArtifact, parsePlanApproval, parsePlanHumanRevision, planReady, type PlanRequest, type PlanArtifact, type PlanApproval, type PlanHumanRevision } from "./plan-artifact";

export type TranscriptItem = {
  id: string;
  seatId?: string;
  round?: number;
  provider: ProviderId | "host";
  providerName: string;
  role: RoleId | "host";
  model: string;
  phase: "agenda" | "proposal" | "review" | "synthesis";
  target?: string;
  text: string;
  status: "streaming" | "done" | "error";
  progress?: AgentProgress;
  usage?: UsageSummary;
  envelope?: TurnEnvelope;
  formatError?: string;
  reductionError?: string;
};

export type DecisionStatus = "waiting" | "pending" | "approved" | "rejected";

export type TaskMode = "decide" | "review";

export type ReviewTaskInput = {
  artifact: string;
  references: string;
  truthConstraints: string;
};

export const reviewTaskLimits = {
  artifact: 12_000,
  references: 12_000,
  truthConstraints: 2_000,
} as const;

export type ParticipantSnapshot = {
  provider: ProviderId;
  providerName: string;
  model: string;
  role: RoleId;
};

export type ObserverSnapshot = {
  provider: ProviderId;
  providerName: string;
  model: string;
};

export type MeetingRecord = {
  version: 1;
  id: string;
  objective: string;
  taskMode: TaskMode;
  reviewInput?: ReviewTaskInput;
  planRequest?: PlanRequest;
  planArtifact?: PlanArtifact;
  planApproval?: PlanApproval;
  planHumanRevision?: PlanHumanRevision;
  reviewEditCheckpoint?: ReviewEditCheckpoint;
  reviewResult?: ReviewArtifactResult;
  reviewHumanRevision?: ReviewHumanRevision;
  reviewApprovedArtifact?: ReviewApprovedArtifact;
  stage: "meeting" | "decision";
  transcript: TranscriptItem[];
  memo: string;
  decision: DecisionStatus;
  usage: UsageSummary;
  iteration: number;
  participants: ParticipantSnapshot[];
  observer?: ObserverSnapshot;
  meetingState?: MeetingState;
  protocolState?: MeetingProtocolState;
  createdAt: string;
  updatedAt: string;
};

export const legacyMeetingHistoryKey = "multi-ai-meeting-room.history.v1";
export const meetingHistoryLimit = 30;

export const emptyUsage: UsageSummary = {
  inputTokens: 0,
  outputTokens: 0,
  estimatedUsd: 0,
  latencyMs: 0,
};

export function parseMeetingRecord(value: unknown): MeetingRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const taskMode = record.taskMode === undefined ? "decide" : parseTaskMode(record.taskMode);
  const reviewInput = record.reviewInput === undefined
    ? undefined
    : parseReviewTaskInput(record.reviewInput);
  const transcript = parseTranscript(record.transcript);
  const planRequest = record.planRequest === undefined ? undefined : parsePlanRequest(record.planRequest);
  const planArtifact = record.planArtifact === undefined ? undefined : planRequest && typeof record.objective === "string"
    ? parsePlanArtifact(record.planArtifact, planRequest, record.objective) : null;
  const planHumanRevision = record.planHumanRevision === undefined ? undefined : planArtifact ? parsePlanHumanRevision(record.planHumanRevision, planArtifact) : null;
  const planApproval = record.planApproval === undefined ? undefined : planArtifact ? parsePlanApproval(record.planApproval, planArtifact, planHumanRevision) : null;
  const participants = parseParticipants(record.participants);
  const observer = record.observer === undefined ? undefined : parseObserver(record.observer);
  const usage = parseUsage(record.usage);
  const meetingState =
    record.meetingState === undefined ? undefined : parseMeetingState(record.meetingState);
  const acceptedFindingIds = meetingState?.claims
    .filter((claim) => claim.status === "accepted_by_chair")
    .map((claim) => claim.id) ?? [];
  const reviewEditCheckpoint = record.reviewEditCheckpoint === undefined
    ? undefined
    : reviewInput
      ? parseReviewEditCheckpoint(record.reviewEditCheckpoint, reviewInput.artifact, acceptedFindingIds)
      : null;
  const reviewResult = record.reviewResult === undefined
    ? undefined
    : parseReviewArtifactResult(
        record.reviewResult,
        reviewInput?.artifact,
      );
  const reviewHumanRevision = record.reviewHumanRevision === undefined
    ? undefined
    : reviewInput && reviewResult
      ? parseReviewHumanRevision(record.reviewHumanRevision, reviewInput.artifact, reviewResult)
      : null;
  const reviewApprovedArtifact = record.reviewApprovedArtifact === undefined
    ? undefined
    : reviewInput && reviewResult
      ? parseReviewApprovedArtifact(
          record.reviewApprovedArtifact,
          reviewInput.artifact,
          reviewResult,
          reviewHumanRevision ?? undefined,
        )
      : null;
  const protocolState =
    record.protocolState === undefined
      ? undefined
      : parseMeetingProtocolState(record.protocolState);

  if (
    record.version !== 1 ||
    !isBoundedString(record.id, 1, 200) ||
    !isBoundedString(record.objective, 1, 4_000) ||
    !taskMode ||
    (record.planRequest !== undefined && (!planRequest || taskMode !== "decide")) ||
    (record.planArtifact !== undefined && (!planArtifact || !meetingState || planArtifact.sourceStateVersion !== meetingState.version || record.iteration !== 1)) ||
    (record.planApproval !== undefined && (!planApproval || record.decision !== "approved")) ||
    (record.planHumanRevision !== undefined && (!planHumanRevision || !["pending", "approved", "rejected"].includes(String(record.decision)))) ||
    (planRequest && record.decision === "approved" && (!planApproval || !planArtifact || !planReady(planArtifact))) ||
    (planArtifact && record.decision === "pending" && !planReady(planArtifact)) ||
    (taskMode === "review" && !reviewInput) ||
    (taskMode !== "review" && record.reviewInput !== undefined) ||
    (record.reviewEditCheckpoint !== undefined && (!reviewEditCheckpoint || taskMode !== "review")) ||
    (record.reviewResult !== undefined && (!reviewResult || taskMode !== "review")) ||
    (reviewResult?.artifactVersion === 1 && (!meetingState ||
      reviewResult.sourceStateVersion > meetingState.version ||
      meetingState.claims.some((claim) => claim.status !== "rejected_by_chair" && claim.status !== "superseded") ||
      record.reviewEditCheckpoint !== undefined || record.reviewHumanRevision !== undefined)) ||
    (record.reviewHumanRevision !== undefined && (!reviewHumanRevision || taskMode !== "review")) ||
    (record.reviewApprovedArtifact !== undefined &&
      (!reviewApprovedArtifact || taskMode !== "review" || record.decision !== "approved")) ||
    (record.stage !== "meeting" && record.stage !== "decision") ||
    transcript === null ||
    typeof record.memo !== "string" ||
    record.memo.length > 200_000 ||
    !isDecisionStatus(record.decision) ||
    usage === null ||
    !Number.isInteger(record.iteration) ||
    Number(record.iteration) < 1 ||
    Number(record.iteration) > 100 ||
    participants === null ||
    (record.observer !== undefined && !observer) ||
    (record.meetingState !== undefined && !meetingState) ||
    (record.protocolState !== undefined && !protocolState) ||
    !isIsoDate(record.createdAt) ||
    !isIsoDate(record.updatedAt)
  ) {
    return null;
  }

  return {
    version: 1,
    id: record.id,
    objective: record.objective,
    taskMode,
    ...(planRequest ? { planRequest } : {}),
    ...(planArtifact ? { planArtifact } : {}),
    ...(planApproval ? { planApproval } : {}),
    ...(planHumanRevision ? { planHumanRevision } : {}),
    ...(reviewInput ? { reviewInput } : {}),
    ...(reviewEditCheckpoint ? { reviewEditCheckpoint } : {}),
    ...(reviewResult ? { reviewResult } : {}),
    ...(reviewHumanRevision ? { reviewHumanRevision } : {}),
    ...(reviewApprovedArtifact ? { reviewApprovedArtifact } : {}),
    stage: record.stage,
    transcript,
    memo: record.memo,
    decision: record.decision,
    usage,
    iteration: Number(record.iteration),
    participants,
    ...(observer ? { observer } : {}),
    ...(meetingState ? { meetingState } : {}),
    ...(protocolState ? { protocolState } : {}),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function parseTaskMode(value: unknown): TaskMode | null {
  return value === "decide" || value === "review" ? value : null;
}

export function parseReviewTaskInput(value: unknown): ReviewTaskInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    !isBoundedString(input.artifact, 20, reviewTaskLimits.artifact) ||
    input.artifact.trim().length < 20 ||
    !isBoundedString(input.references, 8, reviewTaskLimits.references) ||
    !isBoundedString(input.truthConstraints, 8, reviewTaskLimits.truthConstraints)
  ) return null;
  return {
    artifact: input.artifact,
    references: input.references.trim(),
    truthConstraints: input.truthConstraints.trim(),
  };
}

export function upsertMeetingRecord(records: MeetingRecord[], record: MeetingRecord) {
  return [record, ...records.filter((item) => item.id !== record.id)]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, meetingHistoryLimit);
}

function parseTranscript(value: unknown): TranscriptItem[] | null {
  if (!Array.isArray(value) || value.length > 1_000) return null;
  const items: TranscriptItem[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const item = candidate as Record<string, unknown>;
    const provider = item.provider;
    const role = item.role;
    const usage = item.usage === undefined ? undefined : parseUsage(item.usage);
    const envelope =
      item.envelope === undefined || !isTurnPhase(item.phase)
        ? undefined
        : parseTurnEnvelope(item.envelope, item.phase);
    if (
      !isBoundedString(item.id, 1, 240) ||
      (item.seatId !== undefined && !isIdentifier(item.seatId)) ||
      (item.round !== undefined &&
        (!Number.isInteger(item.round) || Number(item.round) < 1 || Number(item.round) > 5)) ||
      (provider !== "host" && !providerIds.includes(provider as ProviderId)) ||
      !isBoundedString(item.providerName, 1, 160) ||
      (role !== "host" && !roleIds.includes(role as RoleId)) ||
      typeof item.model !== "string" ||
      item.model.length > 200 ||
      !isPhase(item.phase) ||
      (item.target !== undefined && typeof item.target !== "string") ||
      typeof item.text !== "string" ||
      item.text.length > 500_000 ||
      !isTranscriptStatus(item.status) ||
      (item.progress !== undefined && !isAgentProgress(item.progress)) ||
      usage === null ||
      (item.envelope !== undefined && (!envelope || !envelope.ok)) ||
      (item.formatError !== undefined && !isBoundedString(item.formatError, 1, 1_000)) ||
      (item.reductionError !== undefined && !isBoundedString(item.reductionError, 1, 1_000))
    ) {
      return null;
    }
    items.push({
      id: item.id,
      ...(typeof item.seatId === "string" ? { seatId: item.seatId } : {}),
      ...(typeof item.round === "number" ? { round: item.round } : {}),
      provider: provider as ProviderId | "host",
      providerName: item.providerName,
      role: role as RoleId | "host",
      model: item.model,
      phase: item.phase,
      ...(typeof item.target === "string" ? { target: item.target } : {}),
      text: item.text,
      status: item.status,
      ...(isAgentProgress(item.progress) ? { progress: item.progress } : {}),
      ...(usage ? { usage } : {}),
      ...(envelope?.ok ? { envelope: envelope.value } : {}),
      ...(typeof item.formatError === "string" ? { formatError: item.formatError } : {}),
      ...(typeof item.reductionError === "string" ? { reductionError: item.reductionError } : {}),
    });
  }
  return items;
}

export function finalizeInterruptedTurns(record: MeetingRecord): MeetingRecord {
  return {
    ...record,
    transcript: record.transcript.map((item) =>
      item.status === "streaming" ? { ...item, status: "error" as const } : item,
    ),
    ...(record.protocolState
      ? { protocolState: recoverProtocolAfterReload(record.protocolState) }
      : {}),
  };
}

function parseParticipants(value: unknown): ParticipantSnapshot[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const participants: ParticipantSnapshot[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const participant = candidate as Record<string, unknown>;
    if (
      !providerIds.includes(participant.provider as ProviderId) ||
      !isBoundedString(participant.providerName, 1, 160) ||
      !isBoundedString(participant.model, 1, 200) ||
      !roleIds.includes(participant.role as RoleId)
    ) {
      return null;
    }
    participants.push({
      provider: participant.provider as ProviderId,
      providerName: participant.providerName,
      model: participant.model,
      role: participant.role as RoleId,
    });
  }
  return participants;
}

function parseObserver(value: unknown): ObserverSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const observer = value as Record<string, unknown>;
  if (
    !providerIds.includes(observer.provider as ProviderId) ||
    !isBoundedString(observer.providerName, 1, 160) ||
    !isBoundedString(observer.model, 1, 200)
  ) return null;
  return {
    provider: observer.provider as ProviderId,
    providerName: observer.providerName,
    model: observer.model,
  };
}

function parseUsage(value: unknown): UsageSummary | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const usage = value as Record<string, unknown>;
  const values = [
    usage.inputTokens,
    usage.outputTokens,
    usage.estimatedUsd,
    usage.latencyMs,
  ];
  if (!values.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0)) {
    return null;
  }
  return {
    inputTokens: usage.inputTokens as number,
    outputTokens: usage.outputTokens as number,
    estimatedUsd: usage.estimatedUsd as number,
    latencyMs: usage.latencyMs as number,
  };
}

function isBoundedString(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.length >= minimum && value.length <= maximum;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,240}$/.test(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isDecisionStatus(value: unknown): value is DecisionStatus {
  return value === "waiting" || value === "pending" || value === "approved" || value === "rejected";
}

function isPhase(value: unknown): value is TranscriptItem["phase"] {
  return value === "agenda" || value === "proposal" || value === "review" || value === "synthesis";
}

function isTurnPhase(value: unknown): value is "proposal" | "review" | "synthesis" {
  return value === "proposal" || value === "review" || value === "synthesis";
}

function isTranscriptStatus(value: unknown): value is TranscriptItem["status"] {
  return value === "streaming" || value === "done" || value === "error";
}

function isAgentProgress(value: unknown): value is AgentProgress {
  return value === "thinking" || value === "generating" || value === "validating";
}
