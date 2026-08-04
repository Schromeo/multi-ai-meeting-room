import type { UsageSummary } from "./discuss-protocol";

export type TurnPhase = "proposal" | "review" | "synthesis";
export type AssumptionLevel = "low" | "medium" | "high";
export type ClaimUpdateAction = "support" | "oppose" | "revise" | "withdraw";

export type TurnEnvelope = {
  statement: string;
  card: {
    stance: "propose" | "support" | "oppose" | "revise" | "no_new_information";
    thesis: string;
    newClaims: Array<{ text: string; assumptionLevel: AssumptionLevel }>;
    claimUpdates: Array<{ claimId: string; action: ClaimUpdateAction; reason: string }>;
    objections: Array<{
      targetClaimId?: string;
      text: string;
      severity: "minor" | "material" | "blocking";
    }>;
    questionForChair?: string;
    recommendedAction?: string;
    confidence: { level: "low" | "medium" | "high"; reason: string };
  };
};

export type Claim = {
  id: string;
  text: string;
  status:
    | "proposed"
    | "contested"
    | "provisionally_supported"
    | "accepted_by_chair"
    | "rejected_by_chair"
    | "superseded";
  assumptionLevel: AssumptionLevel;
  sourceMessageIds: string[];
  supportingSeatIds: string[];
  opposingSeatIds: string[];
};

export type Dispute = {
  id: string;
  targetClaimId?: string;
  text: string;
  severity: "minor" | "material" | "blocking";
  status: "open" | "resolved";
  raisedBySeatId: string;
  sourceMessageIds: string[];
};

export type Assumption = {
  id: string;
  claimId: string;
  text: string;
  level: "medium" | "high";
  status: "open" | "resolved";
  sourceMessageIds: string[];
};

export type OpenQuestion = {
  id: string;
  text: string;
  status: "open" | "answered";
  askedBySeatId: string;
  sourceMessageIds: string[];
};

export type ChairDirective = {
  id: string;
  kind: "constraint" | "correction" | "question" | "priority" | "veto";
  target: "all" | string[];
  text: string;
  status: "active" | "satisfied" | "superseded";
  createdAfterMessageId?: string;
  supersededBy?: string;
};

export type HumanChoice = {
  id: string;
  question: string;
  status: "open" | "decided";
  choice?: string;
  sourceMessageIds: string[];
};

export type FollowUp = {
  id: string;
  targetType: "message" | "claim" | "dispute" | "round_brief" | "decision_memo";
  targetId: string;
  audience: "author" | "selected_seats" | "room" | "final_synthesizer";
  seatIds: string[];
  question: string;
  status: "open" | "answered" | "superseded";
  sourceMessageIds: string[];
};

export type MeetingState = {
  schemaVersion: 1;
  version: number;
  objective: string;
  constraints: string[];
  activeChairDirectives: ChairDirective[];
  claims: Claim[];
  disputes: Dispute[];
  assumptions: Assumption[];
  openQuestions: OpenQuestion[];
  humanChoices: HumanChoice[];
  round: number;
  phase: "agenda" | TurnPhase | "decision";
  usage: UsageSummary;
  appliedTurnIds: string[];
  archivedRecordIds: string[];
};

export type TurnReductionEvent = {
  id: string;
  sourceMessageId: string;
  seatId: string;
  round: number;
  phase: TurnPhase;
  envelope: TurnEnvelope;
  usage?: UsageSummary;
};

export type ReductionErrorCode =
  | "invalid_event"
  | "invalid_envelope"
  | "unknown_reference"
  | "state_limit";

export type ReductionResult =
  | {
      ok: true;
      state: MeetingState;
      duplicate: boolean;
      changedClaimIds: string[];
      newClaimIds: string[];
      newDisputeIds: string[];
    }
  | {
      ok: false;
      state: MeetingState;
      error: { code: ReductionErrorCode; message: string; sourceMessageId: string };
    };

export const meetingStateCaps = {
  claims: 12,
  disputes: 6,
  assumptions: 6,
  openQuestions: 6,
  humanChoices: 4,
  chairDirectives: 8,
  renderedContextCharacters: 6_000,
} as const;

const emptyUsage: UsageSummary = {
  inputTokens: 0,
  outputTokens: 0,
  estimatedUsd: 0,
  latencyMs: 0,
};

export function createInitialMeetingState(
  objective: string,
  constraints: string[] = [],
): MeetingState {
  return {
    schemaVersion: 1,
    version: 0,
    objective: objective.trim().slice(0, 4_000),
    constraints: constraints
      .map((item) => item.trim().slice(0, 1_000))
      .filter(Boolean)
      .slice(0, 12),
    activeChairDirectives: [],
    claims: [],
    disputes: [],
    assumptions: [],
    openQuestions: [],
    humanChoices: [],
    round: 0,
    phase: "agenda",
    usage: { ...emptyUsage },
    appliedTurnIds: [],
    archivedRecordIds: [],
  };
}

export function parseTurnEnvelope(
  value: unknown,
  phase: TurnPhase,
): { ok: true; value: TurnEnvelope } | { ok: false; error: string } {
  let candidate = value;
  if (typeof value === "string") {
    if (value.length > 30_000) return { ok: false, error: "The turn output exceeds the format limit." };
    try {
      candidate = JSON.parse(value);
    } catch {
      return { ok: false, error: "The turn output is not valid JSON." };
    }
  }
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["statement", "card"])) {
    return { ok: false, error: "The turn envelope must contain only statement and card." };
  }
  const statementLimit = phase === "synthesis" ? 12_000 : 4_000;
  if (!isBoundedString(candidate.statement, 1, statementLimit) || !isRecord(candidate.card)) {
    return { ok: false, error: "The turn statement or card is invalid." };
  }
  const card = candidate.card;
  if (!hasOnlyKeys(card, [
    "stance",
    "thesis",
    "newClaims",
    "claimUpdates",
    "objections",
    "questionForChair",
    "recommendedAction",
    "confidence",
  ])) {
    return { ok: false, error: "The turn card contains unsupported fields." };
  }
  if (!isStance(card.stance) || !isBoundedString(card.thesis, 1, 600)) {
    return { ok: false, error: "The turn stance or thesis is invalid." };
  }

  const newClaims = parseArray(card.newClaims, 3, parseNewClaim);
  const claimUpdates = parseArray(card.claimUpdates, 3, parseClaimUpdate);
  const objections = parseArray(card.objections, 2, parseObjection);
  const confidence = parseConfidence(card.confidence);
  if (!newClaims || !claimUpdates || !objections || !confidence) {
    return { ok: false, error: "The turn card exceeds its limits or contains invalid records." };
  }
  if (
    card.questionForChair !== undefined &&
    !isBoundedString(card.questionForChair, 1, 500)
  ) {
    return { ok: false, error: "The Chair question is invalid." };
  }
  if (
    card.recommendedAction !== undefined &&
    !isBoundedString(card.recommendedAction, 1, 600)
  ) {
    return { ok: false, error: "The recommended action is invalid." };
  }
  if (
    card.stance === "no_new_information" &&
    (newClaims.length > 0 || claimUpdates.length > 0 || objections.length > 0)
  ) {
    return { ok: false, error: "A no-new-information turn cannot submit state changes." };
  }

  return {
    ok: true,
    value: {
      statement: candidate.statement.trim(),
      card: {
        stance: card.stance,
        thesis: card.thesis.trim(),
        newClaims,
        claimUpdates,
        objections,
        ...(typeof card.questionForChair === "string"
          ? { questionForChair: card.questionForChair.trim() }
          : {}),
        ...(typeof card.recommendedAction === "string"
          ? { recommendedAction: card.recommendedAction.trim() }
          : {}),
        confidence,
      },
    },
  };
}

export function reduceTurnEnvelope(state: MeetingState, event: TurnReductionEvent): ReductionResult {
  if (
    !isIdentifier(event.id) ||
    !isIdentifier(event.sourceMessageId) ||
    !isIdentifier(event.seatId) ||
    !Number.isInteger(event.round) ||
    event.round < 1 ||
    event.round > 5 ||
    !isTurnPhase(event.phase)
  ) {
    return reductionFailure(state, event.sourceMessageId, "invalid_event", "The reduction event is invalid.");
  }
  if (state.appliedTurnIds.includes(event.id)) {
    return {
      ok: true,
      state,
      duplicate: true,
      changedClaimIds: [],
      newClaimIds: [],
      newDisputeIds: [],
    };
  }
  const parsed = parseTurnEnvelope(event.envelope, event.phase);
  if (!parsed.ok) {
    return reductionFailure(state, event.sourceMessageId, "invalid_envelope", parsed.error);
  }
  const envelope = parsed.value;
  const knownClaims = new Set(state.claims.map((claim) => claim.id));
  const unknownReference = [
    ...envelope.card.claimUpdates.map((update) => update.claimId),
    ...envelope.card.objections.flatMap((objection) =>
      objection.targetClaimId ? [objection.targetClaimId] : [],
    ),
  ].find((claimId) => !knownClaims.has(claimId));
  if (unknownReference) {
    return reductionFailure(
      state,
      event.sourceMessageId,
      "unknown_reference",
      `The turn references unknown Claim ${unknownReference}.`,
    );
  }

  let claims = state.claims.map(cloneClaim);
  const archivedRecordIds = [...state.archivedRecordIds];
  const changedClaimIds = new Set<string>();
  for (const update of envelope.card.claimUpdates) {
    const claim = claims.find((item) => item.id === update.claimId);
    if (!claim) continue;
    changedClaimIds.add(claim.id);
    claim.sourceMessageIds = appendUnique(claim.sourceMessageIds, event.sourceMessageId);
    if (update.action === "support") {
      claim.supportingSeatIds = appendUnique(claim.supportingSeatIds, event.seatId);
      claim.status = claim.opposingSeatIds.length > 0 ? "contested" : "provisionally_supported";
    } else if (update.action === "oppose") {
      claim.opposingSeatIds = appendUnique(claim.opposingSeatIds, event.seatId);
      claim.status = "contested";
    } else {
      archivedRecordIds.push(claim.id);
    }
  }
  claims = claims.filter((claim) => !archivedRecordIds.includes(claim.id));

  const newClaimIds: string[] = [];
  const assumptions = state.assumptions.map((item) => ({ ...item, sourceMessageIds: [...item.sourceMessageIds] }));
  envelope.card.newClaims.forEach((claim, index) => {
    const id = stableRecordId("claim", event.sourceMessageId, index);
    newClaimIds.push(id);
    claims.push({
      id,
      text: claim.text,
      status: "proposed",
      assumptionLevel: claim.assumptionLevel,
      sourceMessageIds: [event.sourceMessageId],
      supportingSeatIds: [event.seatId],
      opposingSeatIds: [],
    });
    if (claim.assumptionLevel !== "low") {
      assumptions.push({
        id: stableRecordId("assumption", event.sourceMessageId, index),
        claimId: id,
        text: claim.text,
        level: claim.assumptionLevel,
        status: "open",
        sourceMessageIds: [event.sourceMessageId],
      });
    }
  });

  const disputes = state.disputes.map((item) => ({ ...item, sourceMessageIds: [...item.sourceMessageIds] }));
  const newDisputeIds: string[] = [];
  envelope.card.objections.forEach((objection, index) => {
    const id = stableRecordId("dispute", event.sourceMessageId, index);
    newDisputeIds.push(id);
    disputes.push({
      id,
      ...(objection.targetClaimId ? { targetClaimId: objection.targetClaimId } : {}),
      text: objection.text,
      severity: objection.severity,
      status: "open",
      raisedBySeatId: event.seatId,
      sourceMessageIds: [event.sourceMessageId],
    });
    if (objection.targetClaimId) {
      const claim = claims.find((item) => item.id === objection.targetClaimId);
      if (claim) {
        claim.status = "contested";
        claim.opposingSeatIds = appendUnique(claim.opposingSeatIds, event.seatId);
        claim.sourceMessageIds = appendUnique(claim.sourceMessageIds, event.sourceMessageId);
        changedClaimIds.add(claim.id);
      }
    }
  });

  const openQuestions = state.openQuestions.map((item) => ({ ...item, sourceMessageIds: [...item.sourceMessageIds] }));
  if (envelope.card.questionForChair) {
    openQuestions.push({
      id: stableRecordId("question", event.sourceMessageId, 0),
      text: envelope.card.questionForChair,
      status: "open",
      askedBySeatId: event.seatId,
      sourceMessageIds: [event.sourceMessageId],
    });
  }

  const limitError = stateLimitError(claims, disputes, assumptions, openQuestions);
  if (limitError) {
    return reductionFailure(state, event.sourceMessageId, "state_limit", limitError);
  }

  return {
    ok: true,
    duplicate: false,
    changedClaimIds: [...changedClaimIds],
    newClaimIds,
    newDisputeIds,
    state: {
      ...state,
      version: state.version + 1,
      claims,
      disputes,
      assumptions,
      openQuestions,
      round: Math.max(state.round, event.round),
      phase: event.phase,
      usage: event.usage ? mergeUsage(state.usage, event.usage) : { ...state.usage },
      appliedTurnIds: [...state.appliedTurnIds, event.id].slice(-200),
      archivedRecordIds: [...new Set(archivedRecordIds)].slice(-200),
    },
  };
}

export function renderMeetingStateContext(
  state: MeetingState,
  maximumCharacters = meetingStateCaps.renderedContextCharacters,
) {
  const limit = Math.max(1_000, Math.min(maximumCharacters, 12_000));
  const context = {
    version: state.version,
    objective: boundedText(state.objective, Math.min(1_200, Math.floor(limit / 4))),
    constraints: [] as unknown[],
    round: state.round,
    phase: state.phase,
    chairDirectives: [] as unknown[],
    claims: [] as unknown[],
    disputes: [] as unknown[],
    assumptions: [] as unknown[],
    openQuestions: [] as unknown[],
    humanChoices: [] as unknown[],
    omitted: {
      constraints: state.constraints.length,
      chairDirectives: state.activeChairDirectives.length,
      claims: state.claims.length,
      disputes: state.disputes.length,
      assumptions: state.assumptions.length,
      openQuestions: state.openQuestions.length,
      humanChoices: state.humanChoices.length,
    },
  };

  addWhileWithin(context, "constraints", state.constraints.map((item) => boundedText(item, 240)), limit);
  addWhileWithin(context, "chairDirectives", state.activeChairDirectives.map((item) => ({
    id: item.id,
    kind: item.kind,
    text: boundedText(item.text, 320),
    status: item.status,
  })), limit);
  addWhileWithin(context, "claims", state.claims.map((item) => ({
    id: item.id,
    text: boundedText(item.text, 420),
    status: item.status,
    sources: item.sourceMessageIds,
  })), limit);
  addWhileWithin(context, "disputes", state.disputes.map((item) => ({
    id: item.id,
    targetClaimId: item.targetClaimId,
    text: boundedText(item.text, 360),
    severity: item.severity,
    sources: item.sourceMessageIds,
  })), limit);
  addWhileWithin(context, "assumptions", state.assumptions.map((item) => ({
    id: item.id,
    claimId: item.claimId,
    text: boundedText(item.text, 280),
    level: item.level,
  })), limit);
  addWhileWithin(context, "openQuestions", state.openQuestions.map((item) => ({
    id: item.id,
    text: boundedText(item.text, 280),
  })), limit);
  addWhileWithin(context, "humanChoices", state.humanChoices.map((item) => ({
    id: item.id,
    question: boundedText(item.question, 280),
    status: item.status,
  })), limit);
  return JSON.stringify(context);
}

export function parseMeetingState(value: unknown): MeetingState | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null;
  if (
    !Number.isInteger(value.version) || Number(value.version) < 0 || Number(value.version) > 10_000 ||
    !isBoundedString(value.objective, 1, 4_000) ||
    !Array.isArray(value.constraints) || value.constraints.length > 12 ||
    !value.constraints.every((item) => isBoundedString(item, 1, 1_000)) ||
    !Number.isInteger(value.round) || Number(value.round) < 0 || Number(value.round) > 5 ||
    !isMeetingPhase(value.phase) ||
    !isUsage(value.usage) ||
    !isIdentifierArray(value.appliedTurnIds, 200) ||
    !isIdentifierArray(value.archivedRecordIds, 200)
  ) return null;

  const claims = parseArray(value.claims, meetingStateCaps.claims, parseClaim);
  const disputes = parseArray(value.disputes, meetingStateCaps.disputes, parseDispute);
  const assumptions = parseArray(value.assumptions, meetingStateCaps.assumptions, parseAssumption);
  const openQuestions = parseArray(value.openQuestions, meetingStateCaps.openQuestions, parseOpenQuestion);
  const directives = parseArray(value.activeChairDirectives, meetingStateCaps.chairDirectives, parseDirective);
  const humanChoices = parseArray(value.humanChoices, meetingStateCaps.humanChoices, parseHumanChoice);
  if (!claims || !disputes || !assumptions || !openQuestions || !directives || !humanChoices) return null;

  return {
    schemaVersion: 1,
    version: Number(value.version),
    objective: value.objective,
    constraints: [...value.constraints] as string[],
    activeChairDirectives: directives,
    claims,
    disputes,
    assumptions,
    openQuestions,
    humanChoices,
    round: Number(value.round),
    phase: value.phase,
    usage: { ...value.usage },
    appliedTurnIds: [...value.appliedTurnIds] as string[],
    archivedRecordIds: [...value.archivedRecordIds] as string[],
  };
}

function parseNewClaim(value: unknown) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["text", "assumptionLevel"])) return null;
  if (!isBoundedString(value.text, 1, 500) || !isAssumptionLevel(value.assumptionLevel)) return null;
  return { text: value.text.trim(), assumptionLevel: value.assumptionLevel };
}

function parseClaimUpdate(value: unknown) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["claimId", "action", "reason"])) return null;
  if (!isIdentifier(value.claimId) || !isClaimUpdateAction(value.action) || !isBoundedString(value.reason, 1, 500)) return null;
  return { claimId: value.claimId, action: value.action, reason: value.reason.trim() };
}

function parseObjection(value: unknown) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["targetClaimId", "text", "severity"])) return null;
  if (
    (value.targetClaimId !== undefined && !isIdentifier(value.targetClaimId)) ||
    !isBoundedString(value.text, 1, 500) ||
    !isSeverity(value.severity)
  ) return null;
  return {
    ...(typeof value.targetClaimId === "string" ? { targetClaimId: value.targetClaimId } : {}),
    text: value.text.trim(),
    severity: value.severity,
  };
}

function parseConfidence(value: unknown) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["level", "reason"])) return null;
  if (!isConfidenceLevel(value.level) || !isBoundedString(value.reason, 1, 400)) return null;
  return { level: value.level, reason: value.reason.trim() };
}

function parseClaim(value: unknown): Claim | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isBoundedString(value.text, 1, 500)) return null;
  if (!isClaimStatus(value.status) || !isAssumptionLevel(value.assumptionLevel)) return null;
  if (!isIdentifierArray(value.sourceMessageIds, 20) || !isIdentifierArray(value.supportingSeatIds, 20) || !isIdentifierArray(value.opposingSeatIds, 20)) return null;
  return {
    id: value.id,
    text: value.text,
    status: value.status,
    assumptionLevel: value.assumptionLevel,
    sourceMessageIds: [...value.sourceMessageIds],
    supportingSeatIds: [...value.supportingSeatIds],
    opposingSeatIds: [...value.opposingSeatIds],
  };
}

function parseDispute(value: unknown): Dispute | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isBoundedString(value.text, 1, 500)) return null;
  if ((value.targetClaimId !== undefined && !isIdentifier(value.targetClaimId)) || !isSeverity(value.severity) || (value.status !== "open" && value.status !== "resolved") || !isIdentifier(value.raisedBySeatId) || !isIdentifierArray(value.sourceMessageIds, 20)) return null;
  return { id: value.id, ...(typeof value.targetClaimId === "string" ? { targetClaimId: value.targetClaimId } : {}), text: value.text, severity: value.severity, status: value.status, raisedBySeatId: value.raisedBySeatId, sourceMessageIds: [...value.sourceMessageIds] };
}

function parseAssumption(value: unknown): Assumption | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isIdentifier(value.claimId) || !isBoundedString(value.text, 1, 500) || (value.level !== "medium" && value.level !== "high") || (value.status !== "open" && value.status !== "resolved") || !isIdentifierArray(value.sourceMessageIds, 20)) return null;
  return { id: value.id, claimId: value.claimId, text: value.text, level: value.level, status: value.status, sourceMessageIds: [...value.sourceMessageIds] };
}

function parseOpenQuestion(value: unknown): OpenQuestion | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isBoundedString(value.text, 1, 500) || (value.status !== "open" && value.status !== "answered") || !isIdentifier(value.askedBySeatId) || !isIdentifierArray(value.sourceMessageIds, 20)) return null;
  return { id: value.id, text: value.text, status: value.status, askedBySeatId: value.askedBySeatId, sourceMessageIds: [...value.sourceMessageIds] };
}

function parseDirective(value: unknown): ChairDirective | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isDirectiveKind(value.kind) || !(value.target === "all" || isIdentifierArray(value.target, 20)) || !isBoundedString(value.text, 1, 1_000) || !isDirectiveStatus(value.status)) return null;
  if ((value.createdAfterMessageId !== undefined && !isIdentifier(value.createdAfterMessageId)) || (value.supersededBy !== undefined && !isIdentifier(value.supersededBy))) return null;
  return { id: value.id, kind: value.kind, target: value.target === "all" ? "all" : [...value.target], text: value.text, status: value.status, ...(typeof value.createdAfterMessageId === "string" ? { createdAfterMessageId: value.createdAfterMessageId } : {}), ...(typeof value.supersededBy === "string" ? { supersededBy: value.supersededBy } : {}) };
}

function parseHumanChoice(value: unknown): HumanChoice | null {
  if (!isRecord(value) || !isIdentifier(value.id) || !isBoundedString(value.question, 1, 1_000) || (value.status !== "open" && value.status !== "decided") || (value.choice !== undefined && !isBoundedString(value.choice, 1, 1_000)) || !isIdentifierArray(value.sourceMessageIds, 20)) return null;
  return { id: value.id, question: value.question, status: value.status, ...(typeof value.choice === "string" ? { choice: value.choice } : {}), sourceMessageIds: [...value.sourceMessageIds] };
}

function stateLimitError(claims: Claim[], disputes: Dispute[], assumptions: Assumption[], questions: OpenQuestion[]) {
  if (claims.length > meetingStateCaps.claims) return `The active Claim cap is ${meetingStateCaps.claims}.`;
  if (disputes.length > meetingStateCaps.disputes) return `The active Dispute cap is ${meetingStateCaps.disputes}.`;
  if (assumptions.length > meetingStateCaps.assumptions) return `The active assumption cap is ${meetingStateCaps.assumptions}.`;
  if (questions.length > meetingStateCaps.openQuestions) return `The open Chair-question cap is ${meetingStateCaps.openQuestions}.`;
  return "";
}

function reductionFailure(state: MeetingState, sourceMessageId: string, code: ReductionErrorCode, message: string): ReductionResult {
  return { ok: false, state, error: { code, message, sourceMessageId } };
}

function stableRecordId(prefix: string, sourceMessageId: string, index: number) {
  const source = sourceMessageId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
  return `${prefix}-${source}-${index + 1}`;
}

function cloneClaim(claim: Claim): Claim {
  return { ...claim, sourceMessageIds: [...claim.sourceMessageIds], supportingSeatIds: [...claim.supportingSeatIds], opposingSeatIds: [...claim.opposingSeatIds] };
}

function appendUnique(values: string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function mergeUsage(a: UsageSummary, b: UsageSummary): UsageSummary {
  return { inputTokens: a.inputTokens + b.inputTokens, outputTokens: a.outputTokens + b.outputTokens, estimatedUsd: a.estimatedUsd + b.estimatedUsd, latencyMs: a.latencyMs + b.latencyMs };
}

function addWhileWithin(context: Record<string, unknown>, key: "constraints" | "chairDirectives" | "claims" | "disputes" | "assumptions" | "openQuestions" | "humanChoices", items: unknown[], limit: number) {
  const target = context[key] as unknown[];
  const omitted = context.omitted as Record<string, number>;
  for (const item of items) {
    target.push(item);
    omitted[key] -= 1;
    if (JSON.stringify(context).length <= limit) continue;
    target.pop();
    omitted[key] += 1;
    break;
  }
}

function boundedText(value: string, maximum: number) {
  return value.length <= maximum ? value : `${value.slice(0, Math.max(0, maximum - 3))}...`;
}

function parseArray<T>(value: unknown, maximum: number, parser: (item: unknown) => T | null): T[] | null {
  if (!Array.isArray(value) || value.length > maximum) return null;
  const output: T[] = [];
  for (const item of value) {
    const parsed = parser(item);
    if (!parsed) return null;
    output.push(parsed);
  }
  return output;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isBoundedString(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,240}$/.test(value);
}

function isIdentifierArray(value: unknown, maximum: number): value is string[] {
  return Array.isArray(value) && value.length <= maximum && value.every(isIdentifier);
}

function isUsage(value: unknown): value is UsageSummary {
  if (!isRecord(value)) return false;
  return [value.inputTokens, value.outputTokens, value.estimatedUsd, value.latencyMs]
    .every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0);
}

function isStance(value: unknown): value is TurnEnvelope["card"]["stance"] {
  return value === "propose" || value === "support" || value === "oppose" || value === "revise" || value === "no_new_information";
}

function isAssumptionLevel(value: unknown): value is AssumptionLevel {
  return value === "low" || value === "medium" || value === "high";
}

function isClaimUpdateAction(value: unknown): value is ClaimUpdateAction {
  return value === "support" || value === "oppose" || value === "revise" || value === "withdraw";
}

function isSeverity(value: unknown): value is Dispute["severity"] {
  return value === "minor" || value === "material" || value === "blocking";
}

function isConfidenceLevel(value: unknown): value is TurnEnvelope["card"]["confidence"]["level"] {
  return value === "low" || value === "medium" || value === "high";
}

function isTurnPhase(value: unknown): value is TurnPhase {
  return value === "proposal" || value === "review" || value === "synthesis";
}

function isMeetingPhase(value: unknown): value is MeetingState["phase"] {
  return value === "agenda" || value === "proposal" || value === "review" || value === "synthesis" || value === "decision";
}

function isClaimStatus(value: unknown): value is Claim["status"] {
  return value === "proposed" ||
    value === "contested" ||
    value === "provisionally_supported" ||
    value === "accepted_by_chair" ||
    value === "rejected_by_chair" ||
    value === "superseded";
}

function isDirectiveKind(value: unknown): value is ChairDirective["kind"] {
  return value === "constraint" || value === "correction" || value === "question" || value === "priority" || value === "veto";
}

function isDirectiveStatus(value: unknown): value is ChairDirective["status"] {
  return value === "active" || value === "satisfied" || value === "superseded";
}
