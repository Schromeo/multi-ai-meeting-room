// Metadata only. Never pass provider text, exception messages or credentials here.
export type ReportedCount = { value: number | null; source: "reported" | "unknown" };
export type SourceAttempt = {
  version: 1;
  captureVersion: "mamr-turn-v1";
  validatorVersion: "turn-envelope/v1";
  attemptId: string; requestId: string; turnId: string; seatId: string;
  provider: "openai" | "anthropic" | "gemini"; configuredModel: string;
  phase: "proposal" | "review" | "synthesis"; round: number; outputLimit: number;
  lifecycle: "started" | "terminal";
  startedAt: string; endedAt: string | null; elapsedMs: number | null;
  callStatus: "started" | "returned" | "error" | "cancelled" | "timeout";
  providerFinish: "completed" | "incomplete" | "failed" | "unknown";
  providerReason: "output_limit" | "context_limit" | "content_filter" | "other" | "unknown";
  validation: "not_run" | "passed" | "rejected";
  validationCode: string | null; validationPath: string | null;
  inputTokens: ReportedCount; outputTokens: ReportedCount; reasoningTokens: ReportedCount;
  outputTokenBasis: "provider_output" | "visible_output";
};
export const sourceAttemptLimit = 1024;
const codes = ["output_too_long", "invalid_json", "unsupported_fields", "invalid_type", "missing_field", "empty_string", "string_too_long", "invalid_enum", "too_many_items", "invalid_record", "state_changes_forbidden"];
const keys = ["version", "captureVersion", "validatorVersion", "attemptId", "requestId", "turnId", "seatId", "provider", "configuredModel", "phase", "round", "outputLimit", "lifecycle", "startedAt", "endedAt", "elapsedMs", "callStatus", "providerFinish", "providerReason", "validation", "validationCode", "validationPath", "inputTokens", "outputTokens", "reasoningTokens", "outputTokenBasis"];
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const integer = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0;
const date = (v: unknown): v is string => typeof v === "string" && v.length <= 32 && Number.isFinite(Date.parse(v));
const member = (v: unknown, values: string[]) => typeof v === "string" && values.includes(v);
const identifier = (v: unknown, max: number) => typeof v === "string" && v.length > 0 && v.length <= max && /^[a-zA-Z0-9._:/-]+$/.test(v);
function count(v: unknown): v is ReportedCount {
  return object(v) && Object.keys(v).length === 2 && "value" in v && "source" in v &&
    (v.value === null ? v.source === "unknown" : integer(v.value) && v.source === "reported");
}
export function reportedCount(value: unknown): ReportedCount {
  return integer(value) ? { value, source: "reported" } : { value: null, source: "unknown" };
}
export function parseSourceAttempt(value: unknown): SourceAttempt | null {
  if (!object(value) || Object.keys(value).length !== keys.length || !keys.every(k => k in value) ||
      value.version !== 1 || value.captureVersion !== "mamr-turn-v1" || value.validatorVersion !== "turn-envelope/v1" ||
      !identifier(value.attemptId, 80) || !identifier(value.requestId, 80) || !identifier(value.turnId, 300) ||
      !identifier(value.seatId, 120) || !identifier(value.configuredModel, 120) ||
      !member(value.provider, ["openai", "anthropic", "gemini"]) || !member(value.phase, ["proposal", "review", "synthesis"]) ||
      !integer(value.round) || value.round < 1 || value.round > 100 ||
      !integer(value.outputLimit) || value.outputLimit < 1 || value.outputLimit > 100000 ||
      !member(value.lifecycle, ["started", "terminal"]) || !date(value.startedAt) ||
      !(value.endedAt === null || date(value.endedAt)) || !(value.elapsedMs === null || integer(value.elapsedMs)) ||
      !member(value.callStatus, ["started", "returned", "error", "cancelled", "timeout"]) ||
      !member(value.providerFinish, ["completed", "incomplete", "failed", "unknown"]) ||
      !member(value.providerReason, ["output_limit", "context_limit", "content_filter", "other", "unknown"]) ||
      !member(value.validation, ["not_run", "passed", "rejected"]) ||
      !count(value.inputTokens) || !count(value.outputTokens) || !count(value.reasoningTokens) ||
      !member(value.outputTokenBasis, ["provider_output", "visible_output"])) return null;
  if (value.validation === "rejected") {
    if (!member(value.validationCode, codes) || typeof value.validationPath !== "string" ||
        !/^(\$|statement|card(?:\.(?:stance|thesis|confidence(?:\.(?:level|reason))?|questionForChair|recommendedAction|(?:newClaims|claimUpdates|objections)(?:\[\d{1,3}\])?))?)$/.test(value.validationPath)) return null;
  } else if (value.validationCode !== null || value.validationPath !== null) return null;
  if (value.lifecycle === "started") {
    if (value.callStatus !== "started" || value.endedAt !== null || value.elapsedMs !== null ||
        value.validation !== "not_run" || value.providerFinish !== "unknown" || value.providerReason !== "unknown" ||
        value.inputTokens.value !== null || value.outputTokens.value !== null || value.reasoningTokens.value !== null) return null;
  } else if (value.callStatus === "started" || value.endedAt === null || value.elapsedMs === null ||
      (value.callStatus !== "returned" && value.validation !== "not_run")) return null;
  return Object.fromEntries(keys.map(key => [key,
    ["inputTokens", "outputTokens", "reasoningTokens"].includes(key)
      ? reportedCount((value[key] as ReportedCount).value) : value[key]
  ])) as SourceAttempt;
}
export function sourceAttemptKey(receipt: SourceAttempt) { return receipt.attemptId + ":" + receipt.lifecycle; }
function sameIdentity(a: SourceAttempt, b: SourceAttempt) {
  return ["attemptId", "requestId", "turnId", "seatId", "provider", "configuredModel", "phase", "round",
    "outputLimit", "startedAt", "captureVersion", "validatorVersion", "outputTokenBasis"]
    .every(k => a[k as keyof SourceAttempt] === b[k as keyof SourceAttempt]);
}
export function appendSourceAttempt(current: SourceAttempt[], value: unknown): SourceAttempt[] {
  const receipt = parseSourceAttempt(value);
  if (!receipt) throw new Error("Invalid source attempt metadata.");
  const duplicate = current.find(v => sourceAttemptKey(v) === sourceAttemptKey(receipt));
  if (duplicate) {
    if (JSON.stringify(duplicate) !== JSON.stringify(receipt)) throw new Error("Conflicting source attempt receipt.");
    return current;
  }
  const prior = current.find(v => v.attemptId === receipt.attemptId);
  if (prior && (!sameIdentity(prior, receipt) || receipt.lifecycle === "started")) throw new Error("Invalid source attempt ordering.");
  if (current.length >= sourceAttemptLimit) throw new Error("Source attempt evidence limit reached.");
  return [...current, receipt];
}
export function parseSourceAttempts(value: unknown): SourceAttempt[] | null {
  if (!Array.isArray(value) || value.length > sourceAttemptLimit) return null;
  try {
    let result: SourceAttempt[] = [];
    for (const item of value) {
      const next = appendSourceAttempt(result, item);
      if (next === result) return null; // Stored collections are canonical, not duplicate input streams.
      result = next;
    }
    return result;
  } catch { return null; }
}
