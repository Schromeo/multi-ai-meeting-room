export type DetectedProviderId = "openai" | "anthropic" | "gemini";

// Prefix detection is a convenience hint, not credential verification.
export function inferProviderFromApiKey(apiKey: string): DetectedProviderId | null {
  const value = apiKey.trim();

  // Anthropic must precede OpenAI because both currently use an `sk-` family.
  if (/^sk-ant-/i.test(value)) return "anthropic";
  if (/^(?:AIza|AQ\.)/.test(value)) return "gemini";
  if (/^sk-(?:proj-|svcacct-|admin-|[a-zA-Z0-9])/i.test(value)) return "openai";

  return null;
}
