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

export type SeatRequest = {
  provider: ProviderId;
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
      provider: ProviderId;
      role: RoleId;
      model: string;
      phase: "proposal" | "review" | "synthesis";
      target?: string;
    }
  | { type: "agent.delta"; id: string; delta: string }
  | { type: "agent.done"; id: string; usage: UsageSummary }
  | { type: "agent.error"; id: string; message: string }
  | {
      type: "room.done";
      requestId: string;
      iteration: number;
      memo: string;
      usage: UsageSummary;
    }
  | { type: "room.error"; requestId: string; message: string };
