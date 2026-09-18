import type { TurnEnvelope, TurnPhase } from "./meeting-state";
import type { ReviewArtifactResult, ReviewEditCheckpoint } from "./review-artifact";

export const providerIds = ["openai", "anthropic", "gemini"] as const;
export type ProviderId = (typeof providerIds)[number];

export const roleIds = [
  "strategist",
  "critic",
  "product",
  "technical",
  "skeptic",
  "synthesizer",
] as const;
export type RoleId = (typeof roleIds)[number];

export const roleLabels: Record<RoleId, string> = {
  strategist: "Strategist",
  critic: "Critical Reviewer",
  product: "Product Lead",
  technical: "Technical Lead",
  skeptic: "Skeptic",
  synthesizer: "Synthesizer",
};

export const roleBriefs: Record<RoleId, string> = {
  strategist: "Frame the decision, compare paths, and make the tradeoff explicit.",
  critic: "Stress-test assumptions, find consequential weaknesses, and demand a concrete revision.",
  product: "Protect user value, scope, adoption, and the narrowest useful outcome.",
  technical: "Test feasibility, dependencies, failure modes, and implementation sequence.",
  skeptic: "Look for counterexamples, unsupported certainty, and reasons the room may be wrong.",
  synthesizer: "Preserve agreement and dissent while producing a decision-ready memo.",
};

export type SeatRequest = {
  id: string;
  connectionId: string;
  provider: ProviderId;
  model: string;
  role: RoleId;
};

export type ObserverRequest = {
  connectionId: string;
  provider: ProviderId;
  model: string;
};

export type ProviderSummary = {
  id: ProviderId;
  name: string;
  configured: boolean;
  model: string;
};

export type UsageSummary = {
  inputTokens: number;
  outputTokens: number;
  estimatedUsd: number;
  latencyMs: number;
};

export type ReplayCostEstimate = {
  basis: "provider_rates";
  modelSpecific: false;
  currency: "USD";
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
  inputRateSource: "runtime_override" | "provider_default";
  outputRateSource: "runtime_override" | "provider_default";
};

export type AgentProgress = "thinking" | "generating" | "validating";
export type ReviewWorkStage = "editing" | "verifying";

export type RoundBrief = {
  id: string;
  round: number;
  sourceStateVersion: number;
  sourceProcessReportId: string;
  sourceTurnIds: string[];
  createdAt: string;
  summary: string;
  focusClaimIds: string[];
  remainingDisputeIds: string[];
  chairQuestionIds: string[];
  convergence: "low" | "healthy" | "premature";
  loopRisk: "low" | "medium" | "high";
  driftRisk: "low" | "medium" | "high";
  recommendation: "continue" | "targeted_debate" | "ask_human" | "synthesize";
  reason: string;
  observer: {
    provider: ProviderId;
    model: string;
  };
  usage: UsageSummary;
};

export type DiscussEvent =
  | { type: "plan.checkpoint"; artifact: import("./plan-artifact").PlanArtifact }
  | { type: "plan.work"; stage: "building" | "reviewing"; status: "started" | "done"; usage?: UsageSummary }
  | {
      type: "room.start";
      requestId: string;
      iteration: number;
      participantCount: number;
    }
  | {
      type: "phase.start";
      phase: "proposal" | "review" | "targeted_debate" | "observer" | "synthesis";
      label: string;
    }
  | {
      type: "agent.start";
      id: string;
      seatId: string;
      connectionId: string;
      connectionName: string;
      provider: ProviderId;
      role: RoleId;
      model: string;
      round: number;
      phase: "proposal" | "review" | "synthesis";
      target?: string;
    }
  | { type: "agent.delta"; id: string; delta: string }
  | { type: "agent.progress"; id: string; stage: AgentProgress }
  | {
      type: "observer.start";
      id: string;
      round: number;
      provider: ProviderId;
      connectionName: string;
      model: string;
    }
  | { type: "observer.progress"; id: string; stage: AgentProgress }
  | { type: "observer.done"; id: string; brief: RoundBrief; usage: UsageSummary }
  | { type: "observer.format_error"; id: string; message: string; usage: UsageSummary }
  | { type: "observer.error"; id: string; message: string }
  | {
      type: "review.work.start";
      id: string;
      stage: ReviewWorkStage;
      seatId: string;
      provider: ProviderId;
      connectionName: string;
      model: string;
      role: RoleId;
    }
  | { type: "review.work.progress"; id: string; stage: ReviewWorkStage; progress: AgentProgress }
  | { type: "review.work.done"; id: string; stage: ReviewWorkStage; usage: UsageSummary }
  | { type: "review.work.format_error"; id: string; stage: ReviewWorkStage; message: string; usage: UsageSummary }
  | { type: "review.work.error"; id: string; stage: ReviewWorkStage; message: string }
  | { type: "review.edit.done"; checkpoint: ReviewEditCheckpoint }
  | { type: "review.artifact.done"; result: ReviewArtifactResult }
  | {
      type: "agent.done";
      id: string;
      seatId: string;
      round: number;
      phase: TurnPhase;
      envelope: TurnEnvelope;
      usage: UsageSummary;
    }
  | {
      type: "phase.done";
      requestId: string;
      phase: TurnPhase | "observer" | "targeted_debate";
      round: number;
      completedSeatIds: string[];
      usage: UsageSummary;
      memo?: string;
      reviewResult?: ReviewArtifactResult;
      planArtifact?: import("./plan-artifact").PlanArtifact;
    }
  | { type: "agent.format_error"; id: string; message: string; usage: UsageSummary }
  | {
      type: "agent.reduction_error";
      id: string;
      message: string;
      envelope: TurnEnvelope;
      usage: UsageSummary;
    }
  | { type: "agent.error"; id: string; message: string }
  | {
      type: "room.done";
      requestId: string;
      iteration: number;
      memo: string;
      usage: UsageSummary;
      reviewResult?: ReviewArtifactResult;
      planArtifact?: import("./plan-artifact").PlanArtifact;
    }
  | { type: "room.error"; requestId: string; message: string };
