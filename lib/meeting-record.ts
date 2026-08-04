import {
  providerIds,
  ProviderId,
  roleIds,
  RoleId,
  UsageSummary,
} from "./discuss-protocol";

export type TranscriptItem = {
  id: string;
  provider: ProviderId | "host";
  providerName: string;
  role: RoleId | "host";
  model: string;
  phase: "agenda" | "proposal" | "review" | "synthesis";
  target?: string;
  text: string;
  status: "streaming" | "done" | "error";
  usage?: UsageSummary;
};

export type DecisionStatus = "waiting" | "pending" | "approved" | "rejected";

export type ParticipantSnapshot = {
  provider: ProviderId;
  providerName: string;
  model: string;
  role: RoleId;
};

export type MeetingRecord = {
  version: 1;
  id: string;
  objective: string;
  stage: "meeting" | "decision";
  transcript: TranscriptItem[];
  memo: string;
  decision: DecisionStatus;
  usage: UsageSummary;
  iteration: number;
  participants: ParticipantSnapshot[];
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
  const transcript = parseTranscript(record.transcript);
  const participants = parseParticipants(record.participants);
  const usage = parseUsage(record.usage);

  if (
    record.version !== 1 ||
    !isBoundedString(record.id, 1, 200) ||
    !isBoundedString(record.objective, 1, 4_000) ||
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
    !isIsoDate(record.createdAt) ||
    !isIsoDate(record.updatedAt)
  ) {
    return null;
  }

  return {
    version: 1,
    id: record.id,
    objective: record.objective,
    stage: record.stage,
    transcript,
    memo: record.memo,
    decision: record.decision,
    usage,
    iteration: Number(record.iteration),
    participants,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
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
    if (
      !isBoundedString(item.id, 1, 240) ||
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
      usage === null
    ) {
      return null;
    }
    items.push({
      id: item.id,
      provider: provider as ProviderId | "host",
      providerName: item.providerName,
      role: role as RoleId | "host",
      model: item.model,
      phase: item.phase,
      ...(typeof item.target === "string" ? { target: item.target } : {}),
      text: item.text,
      status: item.status,
      ...(usage ? { usage } : {}),
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

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isDecisionStatus(value: unknown): value is DecisionStatus {
  return value === "waiting" || value === "pending" || value === "approved" || value === "rejected";
}

function isPhase(value: unknown): value is TranscriptItem["phase"] {
  return value === "agenda" || value === "proposal" || value === "review" || value === "synthesis";
}

function isTranscriptStatus(value: unknown): value is TranscriptItem["status"] {
  return value === "streaming" || value === "done" || value === "error";
}
