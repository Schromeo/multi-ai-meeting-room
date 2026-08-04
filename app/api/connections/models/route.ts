import { providerIds, ProviderId } from "../../../../lib/discuss-protocol";

type ModelOption = {
  id: string;
  name: string;
};

const DISCOVERY_TIMEOUT_MS = 20_000;

export async function POST(request: Request) {
  let body: { provider?: unknown; apiKey?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "The connection request must be valid JSON." }, { status: 400 });
  }

  if (typeof body.provider !== "string" || !providerIds.includes(body.provider as ProviderId)) {
    return Response.json({ error: "Choose a supported API provider." }, { status: 400 });
  }
  const provider = body.provider as ProviderId;
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey || apiKey.length < 8 || apiKey.length > 512 || /\s/.test(apiKey)) {
    return Response.json({ error: "Enter a complete API key." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("model_discovery_timeout"), DISCOVERY_TIMEOUT_MS);
  try {
    const models = await discoverModels(provider, apiKey, controller.signal);
    if (models.length === 0) {
      return Response.json(
        { error: "The provider accepted the connection but returned no compatible text models." },
        { status: 422 },
      );
    }
    return Response.json(
      { provider, models },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  } catch (error) {
    const message = redactSecret(discoveryError(error), apiKey);
    return Response.json({ error: message }, { status: errorStatus(error) });
  } finally {
    clearTimeout(timeout);
  }
}

async function discoverModels(provider: ProviderId, apiKey: string, signal: AbortSignal) {
  if (provider === "openai") return discoverOpenAI(apiKey, signal);
  if (provider === "anthropic") return discoverAnthropic(apiKey, signal);
  return discoverGemini(apiKey, signal);
}

async function discoverOpenAI(apiKey: string, signal: AbortSignal): Promise<ModelOption[]> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal,
  });
  const body = await providerJson(response, "OpenAI");
  const data = Array.isArray(body.data) ? body.data : [];
  return normalizeModels(
    data.flatMap((item) => {
      const id = objectString(item, "id");
      return id && isOpenAITextModel(id) ? [{ id, name: id }] : [];
    }),
  );
}

async function discoverAnthropic(apiKey: string, signal: AbortSignal): Promise<ModelOption[]> {
  const response = await fetch("https://api.anthropic.com/v1/models?limit=100", {
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    signal,
  });
  const body = await providerJson(response, "Anthropic");
  const data = Array.isArray(body.data) ? body.data : [];
  return normalizeModels(
    data.flatMap((item) => {
      const id = objectString(item, "id");
      return id ? [{ id, name: objectString(item, "display_name") || id }] : [];
    }),
  );
}

async function discoverGemini(apiKey: string, signal: AbortSignal): Promise<ModelOption[]> {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
    headers: { "x-goog-api-key": apiKey },
    signal,
  });
  const body = await providerJson(response, "Google Gemini");
  const data = Array.isArray(body.models) ? body.models : [];
  return normalizeModels(
    data.flatMap((item) => {
      const id = objectString(item, "name").replace(/^models\//, "");
      const methods = objectArray(item, "supportedGenerationMethods");
      const compatible = methods.includes("generateContent") || methods.includes("streamGenerateContent");
      return id && compatible ? [{ id, name: objectString(item, "displayName") || id }] : [];
    }),
  );
}

async function providerJson(response: Response, name: string): Promise<Record<string, unknown>> {
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    // The bounded status is still useful when a provider returns non-JSON.
  }
  if (response.ok) return body;
  const detail = nestedErrorMessage(body) || `${name} rejected the connection.`;
  throw new ProviderDiscoveryError(response.status, `${name} verification failed (${response.status}): ${detail}`);
}

class ProviderDiscoveryError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function errorStatus(error: unknown) {
  if (error instanceof ProviderDiscoveryError) {
    return error.status === 401 || error.status === 403 ? 401 : 502;
  }
  return 502;
}

function discoveryError(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return "Model discovery timed out. No automatic retry was started.";
  }
  return error instanceof Error ? error.message.slice(0, 600) : "Model discovery failed.";
}

function nestedErrorMessage(body: Record<string, unknown>) {
  const error = body.error;
  if (!error || typeof error !== "object") return "";
  const message = (error as Record<string, unknown>).message;
  return typeof message === "string" ? message.slice(0, 400) : "";
}

function normalizeModels(models: ModelOption[]) {
  const unique = new Map(models.map((model) => [model.id, model]));
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function isOpenAITextModel(id: string) {
  if (/(audio|tts|transcri|whisper|image|dall-e|embedding|moderation|realtime)/i.test(id)) {
    return false;
  }
  return /^(gpt-|o[134](?:-|$)|codex-|chatgpt-)/i.test(id);
}

function objectString(value: unknown, key: string) {
  if (!value || typeof value !== "object") return "";
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : "";
}

function objectArray(value: unknown, key: string): string[] {
  if (!value || typeof value !== "object") return [];
  const candidate = (value as Record<string, unknown>)[key];
  return Array.isArray(candidate) ? candidate.filter((item): item is string => typeof item === "string") : [];
}

function redactSecret(message: string, secret: string) {
  return message.split(secret).join("[redacted]");
}
