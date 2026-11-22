export type SoloMessage = { role: "user" | "assistant"; content: string };

export const soloLimits = {
  messageCharacters: 4_000,
  contextCharacters: 24_000,
  contextMessages: 12,
} as const;

export const soloOutputTokens = { lite: 600, medium: 1_200, unlimited: 12_000 } as const;

export function buildSoloContext(history: readonly SoloMessage[], latest: SoloMessage): SoloMessage[] {
  const context = [latest];
  let remaining = soloLimits.contextCharacters - latest.content.length;
  for (let i = history.length - 2; i >= 0 && context.length + 2 <= soloLimits.contextMessages; i -= 2) {
    const question = history[i];
    const answer = history[i + 1];
    const content = answer.content.length <= soloLimits.messageCharacters
      ? answer.content
      : answer.content.slice(0, soloLimits.messageCharacters - 1).replace(/[\uD800-\uDBFF]$/, "") + "…";
    const size = question.content.length + content.length;
    if (size > remaining) break;
    remaining -= size;
    context.unshift(question, { role: "assistant", content });
  }
  return context;
}
