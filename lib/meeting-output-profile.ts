export type OutputProfile = "lite" | "medium" | "unlimited";

export type MeetingOutputLimits = {
  turnTokens: number;
  synthesisTokens: number;
};

export const meetingOutputRanges: Record<OutputProfile, {
  turn: { min: number; max: number; default: number };
  synthesis: { min: number; max: number; default: number };
}> = {
  lite: { turn: { min: 800, max: 2_400, default: 1_200 }, synthesis: { min: 2_400, max: 6_000, default: 4_000 } },
  medium: { turn: { min: 1_600, max: 6_000, default: 3_000 }, synthesis: { min: 4_000, max: 12_000, default: 8_000 } },
  unlimited: { turn: { min: 4_000, max: 12_000, default: 8_000 }, synthesis: { min: 8_000, max: 16_000, default: 12_000 } },
};

export function defaultMeetingOutputLimits(profile: OutputProfile): MeetingOutputLimits {
  const range = meetingOutputRanges[profile];
  return { turnTokens: range.turn.default, synthesisTokens: range.synthesis.default };
}

export function parseMeetingOutputLimits(value: unknown, profile: OutputProfile): MeetingOutputLimits | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (Object.keys(candidate).some((key) => key !== "turnTokens" && key !== "synthesisTokens")) return null;
  const range = meetingOutputRanges[profile];
  const valid = (number: unknown, min: number, max: number) =>
    typeof number === "number" && Number.isInteger(number) && number >= min && number <= max && number % 100 === 0;
  if (!valid(candidate.turnTokens, range.turn.min, range.turn.max) ||
      !valid(candidate.synthesisTokens, range.synthesis.min, range.synthesis.max)) return null;
  return { turnTokens: candidate.turnTokens as number, synthesisTokens: candidate.synthesisTokens as number };
}
