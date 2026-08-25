import type { ProviderId, RoundBrief, UsageSummary } from "./discuss-protocol";
import type { Dispute, MeetingState, TurnEnvelope, TurnPhase } from "./meeting-state";

export const controlModes = ["auto", "checkpoints", "turn_by_turn"] as const;
export type ControlMode = (typeof controlModes)[number];

export type ProtocolPhase =
  | "proposal"
  | "proposal_checkpoint"
  | "review"
  | "targeted_debate"
  | "review_checkpoint"
  | "synthesis"
  | "human_gate"
  | "complete"
  | "stopped";

export type ProtocolStatus = "ready" | "running" | "paused" | "interrupted" | "complete";
export type ProtocolWorkPhase = TurnPhase | "observer" | "targeted_debate";

export type ProtocolTransition = {
  id: string;
  phase: ProtocolWorkPhase;
  round: number;
  seatIds: string[];
  status: "running" | "completed" | "interrupted";
  startedAt: string;
  completedAt?: string;
};

export type MeetingBudget = {
  maxAgentTurns: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxModelTimeMs: number;
};

export type TargetedDebatePlan = {
  id: string;
  disputeId: string;
  sourceStateVersion: number;
  sourceMessageIds: string[];
  seatIds: string[];
  round: number;
  createdAt: string;
};

export type ProcessReport = {
  id: string;
  round: number;
  sourceStateVersion: number;
  sourceTurnIds: string[];
  createdAt: string;
  newClaimCount: number;
  claimUpdateCount: number;
  objectionCount: number;
  noNewInformationCount: number;
  madeStructuralProgress: boolean;
  distinctThesisRatio: number;
  activeDisputeIds: string[];
  openQuestionCount: number;
  recommendation: "continue" | "pause";
  reasons: Array<"low_progress" | "repeated_disputes" | "premature_homogenization">;
};

export type ProcessTurn = {
  id: string;
  round: number;
  phase: TurnPhase;
  status: "done" | "error";
  envelope?: TurnEnvelope;
};

export type BudgetStatus = {
  allowed: boolean;
  reasons: Array<"turn_limit" | "input_token_limit" | "output_token_limit" | "model_time_limit">;
  usedAgentTurns: number;
  remainingAgentTurns: number;
  remainingInputTokens: number;
  remainingOutputTokens: number;
  remainingModelTimeMs: number;
};

export type MeetingProtocolState = {
  schemaVersion: 1;
  controlMode: ControlMode;
  maxRounds: number;
  round: number;
  phase: ProtocolPhase;
  status: ProtocolStatus;
  pendingSeatIds: string[];
  completedSeatIds: string[];
  transitions: ProtocolTransition[];
  budget: MeetingBudget;
  processReports: ProcessReport[];
  observerEnabled: boolean;
  roundBriefs: RoundBrief[];
  targetedDebates: TargetedDebatePlan[];
  updatedAt: string;
};

export type ProtocolResult =
  | { ok: true; state: MeetingProtocolState; duplicate: boolean }
  | { ok: false; state: MeetingProtocolState; error: string };

export function createMeetingProtocolState(
  seatIds: string[],
  controlMode: ControlMode = "checkpoints",
  maxRounds = 2,
  now = new Date().toISOString(),
  budget?: MeetingBudget,
  observerEnabled = false,
): MeetingProtocolState {
  const participants = uniqueSeatIds(seatIds);
  const boundedMaxRounds = boundedRounds(maxRounds);
  return {
    schemaVersion: 1,
    controlMode,
    maxRounds: boundedMaxRounds,
    round: 1,
    phase: "proposal",
    status: "ready",
    pendingSeatIds: participants,
    completedSeatIds: [],
    transitions: [],
    budget: parseMeetingBudget(budget) ?? createDefaultMeetingBudget(
      participants.length,
      boundedMaxRounds,
      observerEnabled,
    ),
    processReports: [],
    observerEnabled,
    roundBriefs: [],
    targetedDebates: [],
    updatedAt: now,
  };
}

export function parseMeetingProtocolState(value: unknown): MeetingProtocolState | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null;
  if (
    !controlModes.includes(value.controlMode as ControlMode) ||
    !Number.isInteger(value.maxRounds) ||
    Number(value.maxRounds) < 1 ||
    Number(value.maxRounds) > 5 ||
    !Number.isInteger(value.round) ||
    Number(value.round) < 1 ||
    Number(value.round) > Number(value.maxRounds) ||
    !isProtocolPhase(value.phase) ||
    !isProtocolStatus(value.status) ||
    !isSeatIdArray(value.pendingSeatIds) ||
    !isSeatIdArray(value.completedSeatIds) ||
    !Array.isArray(value.transitions) ||
    value.transitions.length > 100 ||
    !isIsoDate(value.updatedAt)
  ) return null;

  const transitions: ProtocolTransition[] = [];
  for (const candidate of value.transitions) {
    const transition = parseTransition(candidate);
    if (!transition) return null;
    transitions.push(transition);
  }
  if (new Set(transitions.map((item) => item.id)).size !== transitions.length) return null;
  const inferredSeatCount = inferSeatCount(value, transitions);
  const observerEnabled = value.observerEnabled === undefined ? false : value.observerEnabled;
  if (typeof observerEnabled !== "boolean") return null;
  const budget = value.budget === undefined
    ? createDefaultMeetingBudget(inferredSeatCount, Number(value.maxRounds), observerEnabled)
    : parseMeetingBudget(value.budget);
  if (!budget) return null;
  const processReports = value.processReports === undefined
    ? []
    : parseProcessReports(value.processReports);
  if (!processReports) return null;
  const roundBriefs = value.roundBriefs === undefined ? [] : parseRoundBriefs(value.roundBriefs);
  if (!roundBriefs) return null;
  const targetedDebates = value.targetedDebates === undefined
    ? []
    : parseTargetedDebates(value.targetedDebates);
  if (!targetedDebates) return null;

  return {
    schemaVersion: 1,
    controlMode: value.controlMode as ControlMode,
    maxRounds: Number(value.maxRounds),
    round: Number(value.round),
    phase: value.phase as ProtocolPhase,
    status: value.status as ProtocolStatus,
    pendingSeatIds: [...value.pendingSeatIds] as string[],
    completedSeatIds: [...value.completedSeatIds] as string[],
    transitions,
    budget,
    processReports,
    observerEnabled,
    roundBriefs,
    targetedDebates,
    updatedAt: value.updatedAt as string,
  };
}

export function beginTargetedDebateRound(
  state: MeetingProtocolState,
  meetingState: MeetingState,
  disputeId: string,
  participantSeatIds: string[],
  now = new Date().toISOString(),
): ProtocolResult {
  if (state.phase !== "review_checkpoint" || state.status !== "paused") {
    return { ok: false, state, error: "Targeted debate may only start at a paused review checkpoint." };
  }
  if (state.round >= state.maxRounds) {
    return { ok: false, state, error: "The maximum round budget is exhausted." };
  }
  if (meetingState.version < 1 || meetingState.round !== state.round) {
    return { ok: false, state, error: "Targeted debate requires the current Canonical Meeting State." };
  }
  const dispute = meetingState.disputes.find((item) => item.id === disputeId && item.status === "open");
  if (!dispute) return { ok: false, state, error: "Choose an open Dispute from the current state." };
  const seatIds = routeSeatsForDispute(meetingState, dispute, participantSeatIds);
  if (seatIds.length === 0) {
    return { ok: false, state, error: "No relevant runnable Seat is available for this Dispute." };
  }
  const round = state.round + 1;
  const sourceMessageIds = targetedDebateSourceIds(meetingState, dispute);
  const plan: TargetedDebatePlan = {
    id: `targeted-debate-r${round}-${dispute.id}`,
    disputeId: dispute.id,
    sourceStateVersion: meetingState.version,
    sourceMessageIds,
    seatIds,
    round,
    createdAt: now,
  };
  return {
    ok: true,
    duplicate: false,
    state: {
      ...state,
      round,
      phase: "targeted_debate",
      status: "ready",
      pendingSeatIds: seatIds,
      completedSeatIds: [],
      targetedDebates: [...state.targetedDebates, plan].slice(-5),
      updatedAt: now,
    },
  };
}

export function routeSeatsForDispute(
  state: MeetingState,
  dispute: Dispute,
  participantSeatIds: string[],
) {
  const participants = uniqueSeatIds(participantSeatIds);
  const claim = dispute.targetClaimId
    ? state.claims.find((item) => item.id === dispute.targetClaimId)
    : undefined;
  const ranked = uniqueSeatIds([
    dispute.raisedBySeatId,
    ...(claim?.opposingSeatIds ?? []),
    ...(claim?.supportingSeatIds ?? []),
  ]).filter((seatId) => participants.includes(seatId));
  if (ranked.length < 2) {
    ranked.push(...participants.filter((seatId) => !ranked.includes(seatId)));
  }
  return ranked.slice(0, 2);
}

export function activeTargetedDebate(state: MeetingProtocolState) {
  return [...state.targetedDebates].reverse().find((item) => item.round === state.round);
}

export function beginProtocolTransition(
  state: MeetingProtocolState,
  transitionId: string,
  seatIds: string[],
  now = new Date().toISOString(),
): ProtocolResult {
  const existing = state.transitions.find((item) => item.id === transitionId);
  if (existing) {
    return existing.status === "completed"
      ? { ok: true, state, duplicate: true }
      : { ok: false, state, error: `Transition ${transitionId} is already ${existing.status}.` };
  }
  if (state.status !== "ready") {
    return { ok: false, state, error: "The protocol is not ready to start another transition." };
  }
  const phase = runnablePhase(state.phase);
  if (!phase) return { ok: false, state, error: "The current protocol phase is not runnable." };
  if (!isIdentifier(transitionId)) {
    return { ok: false, state, error: "The transition id is invalid." };
  }
  const selectedSeats = uniqueSeatIds(seatIds);
  if (phase !== "synthesis") {
    if (selectedSeats.length === 0 || selectedSeats.some((id) => !state.pendingSeatIds.includes(id))) {
      return { ok: false, state, error: "The transition contains a seat that is not pending." };
    }
  } else if (selectedSeats.length > 1) {
    return { ok: false, state, error: "Synthesis may select at most one seat." };
  }
  const transition: ProtocolTransition = {
    id: transitionId,
    phase,
    round: state.round,
    seatIds: selectedSeats,
    status: "running",
    startedAt: now,
  };
  return {
    ok: true,
    duplicate: false,
    state: {
      ...state,
      status: "running",
      transitions: [...state.transitions, transition].slice(-100),
      updatedAt: now,
    },
  };
}

export function completeProtocolTransition(
  state: MeetingProtocolState,
  transitionId: string,
  completedSeatIds: string[],
  now = new Date().toISOString(),
): ProtocolResult {
  const transition = state.transitions.find((item) => item.id === transitionId);
  if (!transition) return { ok: false, state, error: "The transition is unknown." };
  if (transition.status === "completed") return { ok: true, state, duplicate: true };
  if (transition.status !== "running") {
    return { ok: false, state, error: "Only a running transition can complete." };
  }
  const completed = uniqueSeatIds(completedSeatIds);
  if (transition.phase !== "synthesis" && completed.some((id) => !transition.seatIds.includes(id))) {
    return { ok: false, state, error: "A completed seat was not part of the transition." };
  }
  const transitions = state.transitions.map((item) =>
    item.id === transitionId
      ? { ...item, status: "completed" as const, completedAt: now }
      : item,
  );

  if (transition.phase === "synthesis") {
    return {
      ok: true,
      duplicate: false,
      state: {
        ...state,
        phase: "human_gate",
        status: "paused",
        pendingSeatIds: [],
        completedSeatIds: [],
        transitions,
        updatedAt: now,
      },
    };
  }

  const completedInPhase = uniqueSeatIds([...state.completedSeatIds, ...completed]);
  const pending = state.pendingSeatIds.filter((id) => !completed.includes(id));
  if (pending.length > 0) {
    return {
      ok: true,
      duplicate: false,
      state: {
        ...state,
        status: "paused",
        pendingSeatIds: pending,
        completedSeatIds: completedInPhase,
        transitions,
        updatedAt: now,
      },
    };
  }

  const checkpoint = transition.phase === "proposal" ? "proposal_checkpoint" : "review_checkpoint";
  if (state.controlMode === "auto" && !(checkpoint === "review_checkpoint" && state.observerEnabled)) {
    return {
      ok: true,
      duplicate: false,
      state: prepareNextPhase({ ...state, transitions, updatedAt: now }, checkpoint, now),
    };
  }
  return {
    ok: true,
    duplicate: false,
    state: {
      ...state,
      phase: checkpoint,
      status: "paused",
      pendingSeatIds: [],
      completedSeatIds: [],
      transitions,
      updatedAt: now,
    },
  };
}

export function continueProtocol(
  state: MeetingProtocolState,
  seatIds: string[],
  now = new Date().toISOString(),
): ProtocolResult {
  if (state.status !== "paused" && state.status !== "interrupted") {
    return { ok: false, state, error: "Only a paused or interrupted protocol can continue." };
  }
  if (state.status === "interrupted" && runnablePhase(state.phase)) {
    return {
      ok: true,
      duplicate: false,
      state: { ...state, status: "ready", updatedAt: now },
    };
  }
  if (state.status === "interrupted" && latestTransition(state)?.phase === "observer") {
    return {
      ok: true,
      duplicate: false,
      state: { ...state, status: "paused", updatedAt: now },
    };
  }
  if (state.phase === "proposal" || state.phase === "review" || state.phase === "targeted_debate") {
    return {
      ok: true,
      duplicate: false,
      state: { ...state, status: "ready", updatedAt: now },
    };
  }
  if (state.phase === "proposal_checkpoint" || state.phase === "review_checkpoint") {
    return {
      ok: true,
      duplicate: false,
      state: prepareNextPhase(state, state.phase, now, seatIds),
    };
  }
  if (state.phase === "human_gate") {
    if (state.round >= state.maxRounds) {
      return { ok: false, state, error: "The maximum round budget is exhausted." };
    }
    const participants = uniqueSeatIds(seatIds);
    if (participants.length < 2) {
      return { ok: false, state, error: "At least two seats are required for another round." };
    }
    return {
      ok: true,
      duplicate: false,
      state: {
        ...state,
        round: state.round + 1,
        phase: "proposal",
        status: "ready",
        pendingSeatIds: participants,
        completedSeatIds: [],
        updatedAt: now,
      },
    };
  }
  return { ok: false, state, error: "The current phase cannot continue." };
}

export function interruptProtocolTransition(
  state: MeetingProtocolState,
  transitionId: string,
  now = new Date().toISOString(),
): ProtocolResult {
  const transition = state.transitions.find((item) => item.id === transitionId);
  if (!transition) return { ok: false, state, error: "The transition is unknown." };
  if (transition.status === "completed") return { ok: true, state, duplicate: true };
  const transitions = state.transitions.map((item) =>
    item.id === transitionId
      ? { ...item, status: "interrupted" as const, completedAt: now }
      : item,
  );
  return {
    ok: true,
    duplicate: false,
    state: { ...state, status: "interrupted", transitions, updatedAt: now },
  };
}

export function pauseProtocolAtSafeBoundary(
  state: MeetingProtocolState,
  now = new Date().toISOString(),
): MeetingProtocolState {
  if (state.status !== "ready") return state;
  return { ...state, status: "paused", updatedAt: now };
}

export function finishProtocol(
  state: MeetingProtocolState,
  now = new Date().toISOString(),
): MeetingProtocolState {
  return {
    ...state,
    phase: "complete",
    status: "complete",
    pendingSeatIds: [],
    completedSeatIds: [],
    updatedAt: now,
  };
}

export function stopProtocol(
  state: MeetingProtocolState,
  now = new Date().toISOString(),
): MeetingProtocolState {
  return {
    ...state,
    phase: "stopped",
    status: "complete",
    pendingSeatIds: [],
    completedSeatIds: [],
    updatedAt: now,
  };
}

export function recoverProtocolAfterReload(
  state: MeetingProtocolState,
  now = new Date().toISOString(),
): MeetingProtocolState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "interrupted",
    transitions: state.transitions.map((transition) =>
      transition.status === "running"
        ? { ...transition, status: "interrupted" as const, completedAt: now }
        : transition,
    ),
    updatedAt: now,
  };
}

export function runnablePhase(phase: ProtocolPhase): TurnPhase | "targeted_debate" | null {
  return phase === "proposal" || phase === "review" || phase === "targeted_debate" || phase === "synthesis"
    ? phase
    : null;
}

export function createDefaultMeetingBudget(
  seatCount: number,
  maxRounds: number,
  observerEnabled = false,
): MeetingBudget {
  const participants = Math.max(2, Math.min(3, Number.isInteger(seatCount) ? seatCount : 2));
  const turns = (participants * 2 + 1 + (observerEnabled ? 1 : 0)) * boundedRounds(maxRounds);
  return {
    maxAgentTurns: turns,
    maxInputTokens: turns * 6_000,
    maxOutputTokens: turns * 1_200,
    maxModelTimeMs: turns * 90_000,
  };
}

export function evaluateMeetingBudget(
  state: MeetingProtocolState,
  usage: UsageSummary,
  requestedSeatIds: string[] = [],
  requestedSystemTurns = 0,
): BudgetStatus {
  const phase = runnablePhase(state.phase);
  const requestedTurns = phase === "synthesis"
    ? 1
    : phase ? uniqueSeatIds(requestedSeatIds).length : Math.max(0, requestedSystemTurns);
  const usedAgentTurns = state.transitions.reduce(
    (total, transition) => total + (
      transition.phase === "synthesis" || transition.phase === "observer" ? 1 : transition.seatIds.length
    ),
    0,
  );
  const reasons: BudgetStatus["reasons"] = [];
  if (usedAgentTurns + requestedTurns > state.budget.maxAgentTurns) reasons.push("turn_limit");
  if (usage.inputTokens >= state.budget.maxInputTokens) reasons.push("input_token_limit");
  if (usage.outputTokens >= state.budget.maxOutputTokens) reasons.push("output_token_limit");
  if (usage.latencyMs >= state.budget.maxModelTimeMs) reasons.push("model_time_limit");
  return {
    allowed: reasons.length === 0,
    reasons,
    usedAgentTurns,
    remainingAgentTurns: Math.max(0, state.budget.maxAgentTurns - usedAgentTurns),
    remainingInputTokens: Math.max(0, state.budget.maxInputTokens - usage.inputTokens),
    remainingOutputTokens: Math.max(0, state.budget.maxOutputTokens - usage.outputTokens),
    remainingModelTimeMs: Math.max(0, state.budget.maxModelTimeMs - usage.latencyMs),
  };
}

export function createProcessReport(
  state: MeetingState,
  turns: ProcessTurn[],
  previous: ProcessReport | undefined,
  now = new Date().toISOString(),
): ProcessReport {
  const sourceTurns = turns.filter(
    (turn) => turn.round === state.round && turn.status === "done" && turn.envelope,
  );
  const envelopes = sourceTurns.flatMap((turn) => turn.envelope ? [turn.envelope] : []);
  const theses = envelopes.map((envelope) => normalizeThesis(envelope.card.thesis)).filter(Boolean);
  const distinctThesisRatio = theses.length === 0 ? 1 : new Set(theses).size / theses.length;
  const newClaimCount = envelopes.reduce((total, envelope) => total + envelope.card.newClaims.length, 0);
  const claimUpdateCount = envelopes.reduce((total, envelope) => total + envelope.card.claimUpdates.length, 0);
  const objectionCount = envelopes.reduce((total, envelope) => total + envelope.card.objections.length, 0);
  const noNewInformationCount = envelopes.filter(
    (envelope) => envelope.card.stance === "no_new_information",
  ).length;
  const activeDisputeIds = state.disputes
    .filter((dispute) => dispute.status === "open")
    .map((dispute) => dispute.id)
    .sort();
  const reasons: ProcessReport["reasons"] = [];
  const noStructuralProgress = newClaimCount === 0 && claimUpdateCount === 0 && objectionCount === 0;
  if (previous && !previous.madeStructuralProgress && noStructuralProgress) reasons.push("low_progress");
  if (
    previous &&
    claimUpdateCount === 0 &&
    newClaimCount === 0 &&
    sameIds(previous.activeDisputeIds, activeDisputeIds) &&
    activeDisputeIds.length > 0
  ) reasons.push("repeated_disputes");
  if (theses.length >= 2 && distinctThesisRatio <= 0.5 && state.assumptions.some((item) => item.status === "open")) {
    reasons.push("premature_homogenization");
  }
  return {
    id: `process-report-r${state.round}-v${state.version}`,
    round: state.round,
    sourceStateVersion: state.version,
    sourceTurnIds: sourceTurns.map((turn) => turn.id).slice(-20),
    createdAt: now,
    newClaimCount,
    claimUpdateCount,
    objectionCount,
    noNewInformationCount,
    madeStructuralProgress: !noStructuralProgress,
    distinctThesisRatio: Number(distinctThesisRatio.toFixed(3)),
    activeDisputeIds: activeDisputeIds.slice(0, 6),
    openQuestionCount: state.openQuestions.filter((question) => question.status === "open").length,
    recommendation: reasons.length > 0 ? "pause" : "continue",
    reasons: [...new Set(reasons)],
  };
}

export function appendProcessReport(
  state: MeetingProtocolState,
  report: ProcessReport,
): MeetingProtocolState {
  if (state.processReports.some((item) => item.id === report.id)) return state;
  return {
    ...state,
    processReports: [...state.processReports, report].slice(-10),
    updatedAt: report.createdAt,
  };
}

export function beginObserverTransition(
  state: MeetingProtocolState,
  transitionId: string,
  now = new Date().toISOString(),
): ProtocolResult {
  const existing = state.transitions.find((item) => item.id === transitionId);
  if (existing) {
    return existing.status === "completed"
      ? { ok: true, state, duplicate: true }
      : { ok: false, state, error: `Transition ${transitionId} is already ${existing.status}.` };
  }
  if (!state.observerEnabled) {
    return { ok: false, state, error: "Observer is not enabled for this meeting." };
  }
  if (state.phase !== "review_checkpoint" || state.status !== "paused") {
    return { ok: false, state, error: "Observer may only run at a paused review checkpoint." };
  }
  if (!isIdentifier(transitionId)) {
    return { ok: false, state, error: "The transition id is invalid." };
  }
  const report = latestProcessReport(state);
  if (!report || report.round !== state.round) {
    return { ok: false, state, error: "A current-round process report is required before Observer runs." };
  }
  if (state.roundBriefs.some((brief) => brief.round === state.round)) {
    return { ok: false, state, error: "Observer already completed this round." };
  }
  return {
    ok: true,
    duplicate: false,
    state: {
      ...state,
      status: "running",
      transitions: [
        ...state.transitions,
        {
          id: transitionId,
          phase: "observer",
          round: state.round,
          seatIds: [],
          status: "running",
          startedAt: now,
        },
      ].slice(-100),
      updatedAt: now,
    },
  };
}

export function completeObserverTransition(
  state: MeetingProtocolState,
  transitionId: string,
  brief: RoundBrief,
  now = new Date().toISOString(),
): ProtocolResult {
  const transition = state.transitions.find((item) => item.id === transitionId);
  if (!transition || transition.phase !== "observer") {
    return { ok: false, state, error: "The Observer transition is unknown." };
  }
  if (transition.status === "completed") return { ok: true, state, duplicate: true };
  if (transition.status !== "running") {
    return { ok: false, state, error: "Only a running Observer transition can complete." };
  }
  const parsedBrief = parseRoundBrief(brief);
  const report = latestProcessReport(state);
  if (
    !parsedBrief ||
    parsedBrief.round !== state.round ||
    parsedBrief.sourceStateVersion !== report?.sourceStateVersion ||
    parsedBrief.sourceProcessReportId !== report?.id ||
    !sameIds(parsedBrief.sourceTurnIds, report.sourceTurnIds)
  ) {
    return { ok: false, state, error: "The Round Brief does not match the current review checkpoint." };
  }
  const transitions = state.transitions.map((item) =>
    item.id === transitionId
      ? { ...item, status: "completed" as const, completedAt: now }
      : item,
  );
  return {
    ok: true,
    duplicate: false,
    state: {
      ...state,
      phase: "review_checkpoint",
      status: "paused",
      transitions,
      roundBriefs: [...state.roundBriefs, parsedBrief].slice(-5),
      updatedAt: now,
    },
  };
}

export function latestProcessReport(state: MeetingProtocolState) {
  return [...state.processReports].reverse().find((report) => report.round === state.round);
}

function prepareNextPhase(
  state: MeetingProtocolState,
  checkpoint: "proposal_checkpoint" | "review_checkpoint",
  now: string,
  seatIds: string[] = [],
): MeetingProtocolState {
  if (checkpoint === "proposal_checkpoint") {
    const participants = uniqueSeatIds(seatIds.length > 0 ? seatIds : completedSeatsForRound(state));
    return {
      ...state,
      phase: "review",
      status: "ready",
      pendingSeatIds: participants,
      completedSeatIds: [],
      updatedAt: now,
    };
  }
  return {
    ...state,
    phase: "synthesis",
    status: "ready",
    pendingSeatIds: [],
    completedSeatIds: [],
    updatedAt: now,
  };
}

function completedSeatsForRound(state: MeetingProtocolState) {
  return state.transitions
    .filter((item) => item.round === state.round && item.phase === "proposal" && item.status === "completed")
    .flatMap((item) => item.seatIds);
}

function parseMeetingBudget(value: unknown): MeetingBudget | null {
  if (!isRecord(value)) return null;
  if (
    !isBoundedInteger(value.maxAgentTurns, 1, 100) ||
    !isBoundedInteger(value.maxInputTokens, 1_000, 5_000_000) ||
    !isBoundedInteger(value.maxOutputTokens, 500, 1_000_000) ||
    !isBoundedInteger(value.maxModelTimeMs, 1_000, 24 * 60 * 60 * 1_000)
  ) return null;
  return {
    maxAgentTurns: Number(value.maxAgentTurns),
    maxInputTokens: Number(value.maxInputTokens),
    maxOutputTokens: Number(value.maxOutputTokens),
    maxModelTimeMs: Number(value.maxModelTimeMs),
  };
}

function parseProcessReports(value: unknown): ProcessReport[] | null {
  if (!Array.isArray(value) || value.length > 10) return null;
  const reports: ProcessReport[] = [];
  for (const item of value) {
    const report = parseProcessReport(item);
    if (!report) return null;
    reports.push(report);
  }
  if (new Set(reports.map((report) => report.id)).size !== reports.length) return null;
  return reports;
}

export function parseProcessReport(value: unknown): ProcessReport | null {
  if (!isRecord(value)) return null;
  if (
    !isIdentifier(value.id) ||
    !isBoundedInteger(value.round, 1, 5) ||
    !isBoundedInteger(value.sourceStateVersion, 0, 10_000) ||
    !isSeatIdArrayWithLimit(value.sourceTurnIds, 20) ||
    !isIsoDate(value.createdAt) ||
    !isBoundedInteger(value.newClaimCount, 0, 100) ||
    !isBoundedInteger(value.claimUpdateCount, 0, 100) ||
    !isBoundedInteger(value.objectionCount, 0, 100) ||
    !isBoundedInteger(value.noNewInformationCount, 0, 100) ||
    typeof value.madeStructuralProgress !== "boolean" ||
    typeof value.distinctThesisRatio !== "number" ||
    !Number.isFinite(value.distinctThesisRatio) ||
    value.distinctThesisRatio < 0 ||
    value.distinctThesisRatio > 1 ||
    !isSeatIdArrayWithLimit(value.activeDisputeIds, 6) ||
    !isBoundedInteger(value.openQuestionCount, 0, 100) ||
    (value.recommendation !== "continue" && value.recommendation !== "pause") ||
    !Array.isArray(value.reasons) ||
    value.reasons.length > 3 ||
    !value.reasons.every(isProcessReason)
  ) return null;
  return {
    id: value.id,
    round: Number(value.round),
    sourceStateVersion: Number(value.sourceStateVersion),
    sourceTurnIds: [...value.sourceTurnIds] as string[],
    createdAt: value.createdAt,
    newClaimCount: Number(value.newClaimCount),
    claimUpdateCount: Number(value.claimUpdateCount),
    objectionCount: Number(value.objectionCount),
    noNewInformationCount: Number(value.noNewInformationCount),
    madeStructuralProgress: value.madeStructuralProgress,
    distinctThesisRatio: value.distinctThesisRatio,
    activeDisputeIds: [...value.activeDisputeIds] as string[],
    openQuestionCount: Number(value.openQuestionCount),
    recommendation: value.recommendation,
    reasons: [...value.reasons] as ProcessReport["reasons"],
  };
}

function parseRoundBriefs(value: unknown): RoundBrief[] | null {
  if (!Array.isArray(value) || value.length > 5) return null;
  const briefs: RoundBrief[] = [];
  for (const item of value) {
    const brief = parseRoundBrief(item);
    if (!brief) return null;
    briefs.push(brief);
  }
  if (new Set(briefs.map((brief) => brief.id)).size !== briefs.length) return null;
  return briefs;
}

function parseTargetedDebates(value: unknown): TargetedDebatePlan[] | null {
  if (!Array.isArray(value) || value.length > 5) return null;
  const plans: TargetedDebatePlan[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate) ||
      !isIdentifier(candidate.id) ||
      !isIdentifier(candidate.disputeId) ||
      !isBoundedInteger(candidate.sourceStateVersion, 1, 10_000) ||
      !isSeatIdArrayWithLimit(candidate.sourceMessageIds, 8) ||
      !isSeatIdArrayWithLimit(candidate.seatIds, 2) ||
      candidate.seatIds.length === 0 ||
      !isBoundedInteger(candidate.round, 2, 5) ||
      !isIsoDate(candidate.createdAt)
    ) return null;
    plans.push({
      id: candidate.id,
      disputeId: candidate.disputeId,
      sourceStateVersion: Number(candidate.sourceStateVersion),
      sourceMessageIds: [...candidate.sourceMessageIds],
      seatIds: [...candidate.seatIds],
      round: Number(candidate.round),
      createdAt: candidate.createdAt,
    });
  }
  if (new Set(plans.map((plan) => plan.id)).size !== plans.length) return null;
  return plans;
}

export function parseRoundBrief(value: unknown): RoundBrief | null {
  if (!isRecord(value) || !isRecord(value.observer) || !isRecord(value.usage)) return null;
  if (
    !isIdentifier(value.id) ||
    !isBoundedInteger(value.round, 1, 5) ||
    !isBoundedInteger(value.sourceStateVersion, 0, 10_000) ||
    !isIdentifier(value.sourceProcessReportId) ||
    !isSeatIdArrayWithLimit(value.sourceTurnIds, 20) ||
    !isIsoDate(value.createdAt) ||
    !isBoundedText(value.summary, 1, 2_000) ||
    !isSeatIdArrayWithLimit(value.focusClaimIds, 6) ||
    !isSeatIdArrayWithLimit(value.remainingDisputeIds, 6) ||
    !isSeatIdArrayWithLimit(value.chairQuestionIds, 6) ||
    !isConvergence(value.convergence) ||
    !isRisk(value.loopRisk) ||
    !isRisk(value.driftRisk) ||
    !isObserverRecommendation(value.recommendation) ||
    !isBoundedText(value.reason, 1, 1_000) ||
    !isProviderId(value.observer.provider) ||
    !isBoundedText(value.observer.model, 1, 240) ||
    !isUsageSummary(value.usage)
  ) return null;
  return {
    id: value.id,
    round: Number(value.round),
    sourceStateVersion: Number(value.sourceStateVersion),
    sourceProcessReportId: value.sourceProcessReportId,
    sourceTurnIds: [...value.sourceTurnIds] as string[],
    createdAt: value.createdAt,
    summary: value.summary.trim(),
    focusClaimIds: [...value.focusClaimIds] as string[],
    remainingDisputeIds: [...value.remainingDisputeIds] as string[],
    chairQuestionIds: [...value.chairQuestionIds] as string[],
    convergence: value.convergence,
    loopRisk: value.loopRisk,
    driftRisk: value.driftRisk,
    recommendation: value.recommendation,
    reason: value.reason.trim(),
    observer: {
      provider: value.observer.provider,
      model: value.observer.model.trim(),
    },
    usage: {
      inputTokens: Number(value.usage.inputTokens),
      outputTokens: Number(value.usage.outputTokens),
      estimatedUsd: Number(value.usage.estimatedUsd),
      latencyMs: Number(value.usage.latencyMs),
    },
  };
}

function inferSeatCount(value: Record<string, unknown>, transitions: ProtocolTransition[]) {
  const ids = new Set<string>();
  for (const candidate of [value.pendingSeatIds, value.completedSeatIds]) {
    if (Array.isArray(candidate)) candidate.filter(isIdentifier).forEach((id) => ids.add(id));
  }
  transitions.flatMap((transition) => transition.seatIds).forEach((id) => ids.add(id));
  return Math.max(2, Math.min(3, ids.size || 2));
}

function normalizeThesis(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function targetedDebateSourceIds(state: MeetingState, dispute: Dispute) {
  const claim = dispute.targetClaimId
    ? state.claims.find((item) => item.id === dispute.targetClaimId)
    : undefined;
  return [...new Set([...dispute.sourceMessageIds, ...(claim?.sourceMessageIds ?? [])])].slice(0, 8);
}

function latestTransition(state: MeetingProtocolState) {
  return state.transitions.at(-1);
}

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function isBoundedInteger(value: unknown, minimum: number, maximum: number) {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

function isSeatIdArrayWithLimit(value: unknown, limit: number): value is string[] {
  return Array.isArray(value) && value.length <= limit && value.every(isIdentifier) && new Set(value).size === value.length;
}

function isProcessReason(value: unknown): value is ProcessReport["reasons"][number] {
  return value === "low_progress" || value === "repeated_disputes" || value === "premature_homogenization";
}

function isBoundedText(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function isUsageSummary(value: Record<string, unknown>): value is UsageSummary & Record<string, unknown> {
  return isNonNegativeNumber(value.inputTokens) &&
    isNonNegativeNumber(value.outputTokens) &&
    isNonNegativeNumber(value.estimatedUsd) &&
    isNonNegativeNumber(value.latencyMs);
}

function isNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isConvergence(value: unknown): value is RoundBrief["convergence"] {
  return value === "low" || value === "healthy" || value === "premature";
}

function isRisk(value: unknown): value is RoundBrief["loopRisk"] {
  return value === "low" || value === "medium" || value === "high";
}

function isObserverRecommendation(value: unknown): value is RoundBrief["recommendation"] {
  return value === "continue" || value === "targeted_debate" ||
    value === "ask_human" || value === "synthesize";
}

function isProviderId(value: unknown): value is ProviderId {
  return value === "openai" || value === "anthropic" || value === "gemini";
}

function parseTransition(value: unknown): ProtocolTransition | null {
  if (!isRecord(value)) return null;
  if (
    !isIdentifier(value.id) ||
    !isProtocolWorkPhase(value.phase) ||
    !Number.isInteger(value.round) ||
    Number(value.round) < 1 ||
    Number(value.round) > 5 ||
    !isSeatIdArray(value.seatIds) ||
    !isTransitionStatus(value.status) ||
    !isIsoDate(value.startedAt) ||
    (value.completedAt !== undefined && !isIsoDate(value.completedAt))
  ) return null;
  return {
    id: value.id,
    phase: value.phase,
    round: Number(value.round),
    seatIds: [...value.seatIds],
    status: value.status,
    startedAt: value.startedAt,
    ...(typeof value.completedAt === "string" ? { completedAt: value.completedAt } : {}),
  };
}

function uniqueSeatIds(values: string[]) {
  return [...new Set(values.filter(isIdentifier))].slice(0, 3);
}

function boundedRounds(value: number) {
  return Math.max(1, Math.min(5, Number.isInteger(value) ? value : 2));
}

function isSeatIdArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 3 && value.every(isIdentifier) && new Set(value).size === value.length;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,240}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isTurnPhase(value: unknown): value is TurnPhase {
  return value === "proposal" || value === "review" || value === "synthesis";
}

function isProtocolWorkPhase(value: unknown): value is ProtocolWorkPhase {
  return isTurnPhase(value) || value === "observer" || value === "targeted_debate";
}

function isProtocolPhase(value: unknown): value is ProtocolPhase {
  return value === "proposal" || value === "proposal_checkpoint" || value === "review" ||
    value === "targeted_debate" || value === "review_checkpoint" || value === "synthesis" || value === "human_gate" ||
    value === "complete" || value === "stopped";
}

function isProtocolStatus(value: unknown): value is ProtocolStatus {
  return value === "ready" || value === "running" || value === "paused" ||
    value === "interrupted" || value === "complete";
}

function isTransitionStatus(value: unknown): value is ProtocolTransition["status"] {
  return value === "running" || value === "completed" || value === "interrupted";
}
