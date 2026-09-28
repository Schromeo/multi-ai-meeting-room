type SeatConfiguration = {
  model: string;
  role: string;
  roleName: string;
  skill: string;
};

type ConfiguredConnection = {
  source: "workspace" | "session";
  apiKey?: string;
  models: Array<{ id: string }>;
};

export function seatSetupIssue(
  seat: SeatConfiguration,
  connection: ConfiguredConnection | undefined,
  validRoles: readonly string[],
): string | null {
  if (!connection) return "Choose an API Connection in Setup.";
  if (connection.source === "session" && !connection.apiKey?.trim()) return "Verify the API Connection in Setup.";
  if (!seat.model || !connection.models.some((model) => model.id === seat.model)) return "Choose a model from this Connection in Setup.";
  if (!validRoles.includes(seat.role)) return "Choose a role in Setup.";

  const name = seat.roleName.trim();
  const skill = seat.skill.trim();
  if (seat.role === "custom" && !name) return "Name this custom role in Setup.";
  if (name && (name.length < 2 || seat.roleName.length > 60)) return "Seat name must be 2–60 characters.";
  if (seat.role === "custom" && !skill) return "Add this custom role's Skill in Setup.";
  if (skill && (skill.length < 8 || seat.skill.length > 500)) return "Skill must be 8–500 characters.";
  return null;
}
