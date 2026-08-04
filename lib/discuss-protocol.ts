import type { TurnEnvelope, TurnPhase } from "./meeting-state";

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

export type DiscussEvent =
  | {
      type: "room.start";
      requestId: string;
      iteration: number;
      participantCount: number;
    }
  | {
      type: "phase.start";
      phase: "proposal" | "review" | "synthesis";
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
      phase: "proposal" | "review" | "synthesis";
      target?: string;
    }
  | { type: "agent.delta"; id: string; delta: string }
  | {
      type: "agent.done";
      id: string;
      seatId: string;
      round: number;
      phase: TurnPhase;
      envelope: TurnEnvelope;
      usage: UsageSummary;
    }
  | { type: "agent.format_error"; id: string; message: string }
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
    }
  | { type: "room.error"; requestId: string; message: string };
