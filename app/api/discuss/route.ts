import {
  DiscussEvent,
  providerIds,
  ProviderId,
  ProviderSummary,
  roleIds,
  roleBriefs,
  roleLabels,
  RoleId,
  SeatRequest,
  UsageSummary,
} from "../../../lib/discuss-protocol";

type ProviderConfig = ProviderSummary & {
  apiKey?: string;
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
};

type ProviderResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

type DiscussRequest = {
  objective?: unknown;
  seats?: unknown;
  connections?: unknown;
  iteration?: unknown;
  priorMemo?: unknown;
  requestId?: unknown;
};

type SessionConnection = {
  apiKey: string;
  model?: string;
};

type AgentWork = SeatRequest & {
  id: string;
  config: ProviderConfig;
  text?: string;
};

const MAX_OBJECTIVE_LENGTH = 4_000;
const MAX_MEMO_LENGTH = 12_000;
const MAX_OUTPUT_TOKENS = 1_200;
const PROVIDER_TIMEOUT_MS = 90_000;

export async function GET() {
  const providers = providerIds.map((id) => publicProvider(getProviderConfig(id)));
  return Response.json({
    providers,
    configuredCount: providers.filter((provider) => provider.configured).length,
    minParticipants: 2,
    maxParticipants: 3,
    maxIterations: 2,
  });
}

export async function POST(request: Request) {
  let body: DiscussRequest;
  try {
    body = (await request.json()) as DiscussRequest;
  } catch {
    return Response.json({ error: "The meeting request must be valid JSON." }, { status: 400 });
  }

  const validation = validateRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { objective, seats, connections, iteration, priorMemo, requestId } = validation.value;
  const work = seats.map((seat, index): AgentWork => ({
    ...seat,
    id: `${requestId}-${iteration}-${seat.provider}-${index}`,
    config: getProviderConfig(seat.provider, connections[seat.provider]),
  }));

  const missing = work.filter((item) => !item.config.configured);
  if (missing.length > 0) {
    return Response.json(
      {
        error: `Missing API connections for: ${missing
          .map((item) => item.config.name)
          .join(", ")}.`,
      },
      { status: 503 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: DiscussEvent) => {
        if (!closed) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      try {
        emit({
          type: "room.start",
          requestId,
          iteration,
          participantCount: work.length,
        });

        emit({
          type: "phase.start",
          phase: "proposal",
          label: iteration === 1 ? "Independent proposals" : "Bounded revision round",
        });

        const proposalResults = await Promise.allSettled(
          work.map(async (item) => {
            const result = await runAgent(
              item,
              "proposal",
              buildProposalPrompt(objective, item.role, iteration, priorMemo),
              buildSystemPrompt(item.role),
              request.signal,
              emit,
            );
            item.text = result.text;
            return { item, result };
          }),
        );

        const proposals = successfulResults(proposalResults);
        if (proposals.length < 2) {
          throw new Error("Fewer than two participants completed a proposal. The room stopped.");
        }

        emit({ type: "phase.start", phase: "review", label: "Assigned cross-review" });

        const reviewResults = await Promise.allSettled(
          proposals.map(async ({ item }, index) => {
            const target = proposals[(index + 1) % proposals.length].item;
            const reviewWork: AgentWork = {
              ...item,
              id: `${item.id}-review`,
            };
            const result = await runAgent(
              reviewWork,
              "review",
              buildReviewPrompt(objective, target.role, target.config.name, target.text ?? ""),
              buildSystemPrompt(item.role),
              request.signal,
              emit,
              `${roleLabels[target.role]} / ${target.config.name}`,
            );
            return { item: reviewWork, result, target };
          }),
        );

        const reviews = successfulResults(reviewResults);
        if (reviews.length === 0) {
          throw new Error("No cross-review completed. The room stopped before synthesis.");
        }

        emit({ type: "phase.start", phase: "synthesis", label: "Decision memo" });

        const completedProposalSeats = proposals.map(({ item }) => item);
        const synthesisSeat =
          completedProposalSeats.find((item) => item.role === "synthesizer") ??
          completedProposalSeats.find((item) => item.role === "strategist") ??
          completedProposalSeats[0];
        const synthesisWork: AgentWork = {
          ...synthesisSeat,
          id: `${synthesisSeat.id}-synthesis`,
          role: "synthesizer",
        };
        const synthesis = await runAgent(
          synthesisWork,
          "synthesis",
          buildSynthesisPrompt(
            objective,
            proposals.map(({ item }) => item),
            reviews.map(({ item, result, target }) => ({ item, result, target })),
            iteration,
          ),
          buildSystemPrompt("synthesizer"),
          request.signal,
          emit,
        );

        const allResults = [
          ...proposals.map(({ item, result }) => ({ result, config: item.config })),
          ...reviews.map(({ item, result }) => ({ result, config: item.config })),
          { result: synthesis, config: synthesisWork.config },
        ];

        emit({
          type: "room.done",
          requestId,
          iteration,
          memo: synthesis.text,
          usage: totalUsage(allResults),
        });
      } catch (error) {
        const rawMessage = request.signal.aborted
          ? "The meeting was stopped by the host."
          : safeErrorMessage(error);
        const message = work.reduce(
          (current, item) => redactSecret(current, item.config.apiKey),
          rawMessage,
        );
        emit({ type: "room.error", requestId, message });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    },
  });
}

function validateRequest(body: DiscussRequest):
  | {
      ok: true;
      value: {
        objective: string;
        seats: SeatRequest[];
        connections: Partial<Record<ProviderId, SessionConnection>>;
        iteration: 1 | 2;
        priorMemo: string;
        requestId: string;
      };
    }
  | { ok: false; error: string } {
  if (typeof body.objective !== "string" || body.objective.trim().length < 8) {
    return { ok: false, error: "Add a meeting objective of at least eight characters." };
  }
  if (body.objective.length > MAX_OBJECTIVE_LENGTH) {
    return { ok: false, error: `The objective must be under ${MAX_OBJECTIVE_LENGTH} characters.` };
  }
  if (!Array.isArray(body.seats) || body.seats.length < 2 || body.seats.length > 3) {
    return { ok: false, error: "Choose two or three configured participants." };
  }

  const seats: SeatRequest[] = [];
  const seen = new Set<string>();
  for (const candidate of body.seats) {
    if (!candidate || typeof candidate !== "object") {
      return { ok: false, error: "Each participant must include a provider and role." };
    }
    const provider = (candidate as { provider?: unknown }).provider;
    const role = (candidate as { role?: unknown }).role;
    if (
      typeof provider !== "string" ||
      !providerIds.includes(provider as ProviderId) ||
      typeof role !== "string" ||
      !roleIds.includes(role as RoleId)
    ) {
      return { ok: false, error: "A participant has an unsupported provider or role." };
    }
    if (seen.has(provider)) {
      return { ok: false, error: "Each provider may occupy only one seat in M2." };
    }
    seen.add(provider);
    seats.push({ provider: provider as ProviderId, role: role as RoleId });
  }

  const connectionResult = validateSessionConnections(body.connections, seats);
  if (!connectionResult.ok) return connectionResult;

  const iteration = body.iteration === 2 ? 2 : 1;
  const priorMemo = typeof body.priorMemo === "string" ? body.priorMemo : "";
  if (iteration === 2 && priorMemo.trim().length === 0) {
    return { ok: false, error: "A revision round requires the previous decision memo." };
  }
  if (priorMemo.length > MAX_MEMO_LENGTH) {
    return { ok: false, error: `The prior memo must be under ${MAX_MEMO_LENGTH} characters.` };
  }
  if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(body.requestId)) {
    return { ok: false, error: "The request is missing a valid idempotency identifier." };
  }

  return {
    ok: true,
    value: {
      objective: body.objective.trim(),
      seats,
      connections: connectionResult.value,
      iteration,
      priorMemo: priorMemo.trim(),
      requestId: body.requestId,
    },
  };
}

function validateSessionConnections(
  value: unknown,
  seats: SeatRequest[],
):
  | { ok: true; value: Partial<Record<ProviderId, SessionConnection>> }
  | { ok: false; error: string } {
  if (value === undefined) return { ok: true, value: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Session connections must be a provider-keyed object." };
  }

  const activeProviders = new Set(seats.map((seat) => seat.provider));
  const connections: Partial<Record<ProviderId, SessionConnection>> = {};
  for (const [provider, candidate] of Object.entries(value)) {
    if (!providerIds.includes(provider as ProviderId) || !activeProviders.has(provider as ProviderId)) {
      return { ok: false, error: "A session connection does not belong to an active provider." };
    }
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return { ok: false, error: "A session connection is malformed." };
    }
    const apiKey = (candidate as { apiKey?: unknown }).apiKey;
    const model = (candidate as { model?: unknown }).model;
    if (
      typeof apiKey !== "string" ||
      apiKey.trim().length < 8 ||
      apiKey.length > 512 ||
      /\s/.test(apiKey)
    ) {
      return { ok: false, error: "A session API key is invalid." };
    }
    if (
      model !== undefined &&
      (typeof model !== "string" ||
        !/^[a-zA-Z0-9._:/-]{1,160}$/.test(model.trim()))
    ) {
      return { ok: false, error: "A session model id is invalid." };
    }
    connections[provider as ProviderId] = {
      apiKey: apiKey.trim(),
      model: typeof model === "string" ? model.trim() : undefined,
    };
  }
  return { ok: true, value: connections };
}

async function runAgent(
  item: AgentWork,
  phase: "proposal" | "review" | "synthesis",
  prompt: string,
  system: string,
  signal: AbortSignal,
  emit: (event: DiscussEvent) => void,
  target?: string,
): Promise<ProviderResult> {
  emit({
    type: "agent.start",
    id: item.id,
    provider: item.provider,
    role: item.role,
    model: item.config.model,
    phase,
    target,
  });

  try {
    const result = await streamProvider(item.config, system, prompt, signal, (delta) => {
      emit({ type: "agent.delta", id: item.id, delta });
    });
    emit({
      type: "agent.done",
      id: item.id,
      usage: usageForResult(result, item.config),
    });
    return result;
  } catch (error) {
    emit({
      type: "agent.error",
      id: item.id,
      message: redactSecret(safeErrorMessage(error), item.config.apiKey),
    });
    throw error;
  }
}

async function streamProvider(
  config: ProviderConfig,
  system: string,
  prompt: string,
  parentSignal: AbortSignal,
  onDelta: (delta: string) => void,
): Promise<ProviderResult> {
  if (!config.apiKey) throw new Error(`${config.name} is not configured.`);
  const controller = new AbortController();
  const abort = () => controller.abort(parentSignal.reason);
  parentSignal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => controller.abort("provider_timeout"), PROVIDER_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    if (config.id === "openai") {
      return await streamOpenAI(config, system, prompt, controller.signal, onDelta, startedAt);
    }
    if (config.id === "anthropic") {
      return await streamAnthropic(config, system, prompt, controller.signal, onDelta, startedAt);
    }
    return await streamGemini(config, system, prompt, controller.signal, onDelta, startedAt);
  } finally {
    clearTimeout(timeout);
    parentSignal.removeEventListener("abort", abort);
  }
}

async function streamOpenAI(
  config: ProviderConfig,
  system: string,
  prompt: string,
  signal: AbortSignal,
  onDelta: (delta: string) => void,
  startedAt: number,
): Promise<ProviderResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      instructions: system,
      input: prompt,
      stream: true,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      reasoning: { effort: "low" },
      text: { verbosity: "medium" },
    }),
    signal,
  });
  await ensureSuccess(response, config.name);

  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  await readSSE(response, (event) => {
    if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
      text += event.delta;
      onDelta(event.delta);
    }
    if (event.type === "response.completed") {
      const usage = objectValue(objectValue(event, "response"), "usage");
      inputTokens = numberValue(usage, "input_tokens");
      outputTokens = numberValue(usage, "output_tokens");
    }
    if (event.type === "error") throw new Error(apiEventMessage(event, config.name));
  });
  return requireText({ text, inputTokens, outputTokens, latencyMs: Date.now() - startedAt }, config.name);
}

async function streamAnthropic(
  config: ProviderConfig,
  system: string,
  prompt: string,
  signal: AbortSignal,
  onDelta: (delta: string) => void,
  startedAt: number,
): Promise<ProviderResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey ?? "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      thinking: { type: "disabled" },
    }),
    signal,
  });
  await ensureSuccess(response, config.name);

  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  await readSSE(response, (event) => {
    if (event.type === "message_start") {
      inputTokens = numberValue(objectValue(objectValue(event, "message"), "usage"), "input_tokens");
    }
    if (event.type === "content_block_delta") {
      const delta = objectValue(event, "delta");
      if (delta?.type === "text_delta" && typeof delta.text === "string") {
        text += delta.text;
        onDelta(delta.text);
      }
    }
    if (event.type === "message_delta") {
      outputTokens = numberValue(objectValue(event, "usage"), "output_tokens");
    }
    if (event.type === "error") throw new Error(apiEventMessage(event, config.name));
  });
  return requireText({ text, inputTokens, outputTokens, latencyMs: Date.now() - startedAt }, config.name);
}

async function streamGemini(
  config: ProviderConfig,
  system: string,
  prompt: string,
  signal: AbortSignal,
  onDelta: (delta: string) => void,
  startedAt: number,
): Promise<ProviderResult> {
  const model = encodeURIComponent(config.model);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": config.apiKey ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
      signal,
    },
  );
  await ensureSuccess(response, config.name);

  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  await readSSE(response, (event) => {
    const candidates = Array.isArray(event.candidates) ? event.candidates : [];
    const candidate = objectValue(candidates[0]);
    const content = objectValue(candidate, "content");
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    for (const part of parts) {
      const value = objectValue(part);
      if (typeof value?.text === "string" && value.text.length > 0) {
        text += value.text;
        onDelta(value.text);
      }
    }
    const usage = objectValue(event, "usageMetadata");
    inputTokens = numberValue(usage, "promptTokenCount") || inputTokens;
    outputTokens = numberValue(usage, "candidatesTokenCount") || outputTokens;
  });
  return requireText({ text, inputTokens, outputTokens, latencyMs: Date.now() - startedAt }, config.name);
}

async function readSSE(response: Response, onEvent: (event: Record<string, unknown>) => void) {
  if (!response.body) throw new Error("The provider returned an empty stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processBlock = (block: string) => {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data || data === "[DONE]") return;
    try {
      onEvent(JSON.parse(data) as Record<string, unknown>);
    } catch (error) {
      if (error instanceof SyntaxError) return;
      throw error;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? "";
    for (const block of blocks) processBlock(block);
  }
  buffer += decoder.decode();
  if (buffer.trim()) processBlock(buffer);
}

async function ensureSuccess(response: Response, providerName: string) {
  if (response.ok) return;
  const raw = (await response.text()).slice(0, 1_000);
  let detail = raw;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    detail = apiEventMessage(parsed, providerName);
  } catch {
    // Keep the bounded response text when the provider did not return JSON.
  }
  throw new Error(`${providerName} request failed (${response.status}): ${detail}`);
}

function buildSystemPrompt(role: RoleId) {
  return [
    "You are a participant in a human-chaired multi-AI deliberation room.",
    `Your assigned role is ${roleLabels[role]}.`,
    `Your role mandate is: ${roleBriefs[role]}`,
    "Produce decision-useful work, not conversational filler.",
    "Separate factual claims from assumptions and value judgments.",
    "Do not claim to have searched or verified external sources; Research mode is disabled.",
    "Name uncertainty and meaningful disagreement directly.",
    "Be concise enough for other participants to review.",
  ].join("\n");
}

function buildProposalPrompt(objective: string, role: RoleId, iteration: number, priorMemo: string) {
  const revision =
    iteration === 2
      ? `\nThis is the single permitted revision round. Address unresolved disputes in the prior memo and state what you changed.\n\nPRIOR MEMO:\n${priorMemo}`
      : "";
  return `MEETING OBJECTIVE:\n${objective}\n\nAs ${roleLabels[role]}, provide:\n1. Your recommendation or framing.\n2. The three strongest reasons.\n3. Assumptions that could make it wrong.\n4. The most important tradeoff or objection.\n5. What the human chair should decide next.${revision}`;
}

function buildReviewPrompt(
  objective: string,
  targetRole: RoleId,
  targetProvider: string,
  proposal: string,
) {
  return `MEETING OBJECTIVE:\n${objective}\n\nREVIEW TARGET: ${roleLabels[targetRole]} using ${targetProvider}\n\nTARGET PROPOSAL:\n${proposal}\n\nReview this specific proposal. Return:\n1. Strongest valid point.\n2. Most consequential weakness or missing assumption.\n3. Any unsupported factual claim.\n4. A concrete revision.\n5. Verdict: accept, revise, or reject.\n\nDo not repeat the proposal or review your own unrelated ideas.`;
}

function buildSynthesisPrompt(
  objective: string,
  proposals: AgentWork[],
  reviews: Array<{ item: AgentWork; result: ProviderResult; target: AgentWork }>,
  iteration: number,
) {
  const proposalText = proposals
    .map(
      (item, index) =>
        `PROPOSAL ${index + 1} — ${roleLabels[item.role]} / ${item.config.name}:\n${item.text}`,
    )
    .join("\n\n");
  const reviewText = reviews
    .map(
      ({ item, result, target }, index) =>
        `REVIEW ${index + 1} — ${roleLabels[item.role]} / ${item.config.name} reviewing ${roleLabels[target.role]} / ${target.config.name}:\n${result.text}`,
    )
    .join("\n\n");

  return `MEETING OBJECTIVE:\n${objective}\n\nITERATION: ${iteration} of 2 maximum\n\n${proposalText}\n\n${reviewText}\n\nCreate the decision memo. Do not force consensus and do not invent evidence. Use exactly these headings:\n\n# Recommendation\n# Agreements\n# Unresolved Disputes\n# Unverified Assumptions\n# Tradeoffs\n# Next Actions\n\nUnder Recommendation, state one clear recommendation or explicitly state that the evidence is insufficient. Preserve important minority objections and identify what requires a human decision.`;
}

function getProviderConfig(id: ProviderId, session?: SessionConnection): ProviderConfig {
  const values: Record<ProviderId, Omit<ProviderConfig, "configured">> = {
    openai: {
      id,
      name: "OpenAI",
      apiKey: readRuntimeValue("OPENAI_API_KEY"),
      model: readRuntimeValue("OPENAI_MODEL") ?? "gpt-5.6-luna",
      inputUsdPerMTok: readRuntimeNumber("OPENAI_INPUT_USD_PER_MTOK", 1),
      outputUsdPerMTok: readRuntimeNumber("OPENAI_OUTPUT_USD_PER_MTOK", 6),
    },
    anthropic: {
      id,
      name: "Anthropic",
      apiKey: readRuntimeValue("ANTHROPIC_API_KEY"),
      model: readRuntimeValue("ANTHROPIC_MODEL") ?? "claude-sonnet-5",
      inputUsdPerMTok: readRuntimeNumber("ANTHROPIC_INPUT_USD_PER_MTOK", 2),
      outputUsdPerMTok: readRuntimeNumber("ANTHROPIC_OUTPUT_USD_PER_MTOK", 10),
    },
    gemini: {
      id,
      name: "Google",
      apiKey: readRuntimeValue("GEMINI_API_KEY"),
      model: readRuntimeValue("GEMINI_MODEL") ?? "gemini-3.6-flash",
      inputUsdPerMTok: readRuntimeNumber("GEMINI_INPUT_USD_PER_MTOK", 1.5),
      outputUsdPerMTok: readRuntimeNumber("GEMINI_OUTPUT_USD_PER_MTOK", 7.5),
    },
  };
  const value = values[id];
  const resolved = {
    ...value,
    apiKey: session?.apiKey ?? value.apiKey,
    model: session?.model ?? value.model,
  };
  return { ...resolved, configured: Boolean(resolved.apiKey) };
}

function readRuntimeValue(key: string): string | undefined {
  const processValue = typeof process !== "undefined" ? process.env[key] : undefined;
  return processValue?.trim() || undefined;
}

function readRuntimeNumber(key: string, fallback: number) {
  const value = Number(readRuntimeValue(key));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function publicProvider(config: ProviderConfig): ProviderSummary {
  return {
    id: config.id,
    name: config.name,
    configured: config.configured,
    model: config.model,
  };
}

function usageForResult(result: ProviderResult, config: ProviderConfig): UsageSummary {
  return {
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedUsd:
      (result.inputTokens * config.inputUsdPerMTok + result.outputTokens * config.outputUsdPerMTok) /
      1_000_000,
    latencyMs: result.latencyMs,
  };
}

function totalUsage(
  results: Array<{ result: ProviderResult; config: ProviderConfig }>,
): UsageSummary {
  let inputTokens = 0;
  let outputTokens = 0;
  let estimatedUsd = 0;
  let latencyMs = 0;
  results.forEach(({ result, config }) => {
    inputTokens += result.inputTokens;
    outputTokens += result.outputTokens;
    latencyMs += result.latencyMs;
    estimatedUsd += usageForResult(result, config).estimatedUsd;
  });
  return { inputTokens, outputTokens, estimatedUsd, latencyMs };
}

function successfulResults<T>(results: PromiseSettledResult<T>[]) {
  return results
    .filter((result): result is PromiseFulfilledResult<T> => result.status === "fulfilled")
    .map((result) => result.value);
}

function requireText(result: ProviderResult, providerName: string) {
  if (!result.text.trim()) throw new Error(`${providerName} returned no text.`);
  return { ...result, text: result.text.trim() };
}

function objectValue(value: unknown, key?: string): Record<string, unknown> | undefined {
  const candidate =
    key && value && typeof value === "object"
      ? (value as Record<string, unknown>)[key]
      : value;
  return candidate && typeof candidate === "object"
    ? (candidate as Record<string, unknown>)
    : undefined;
}

function numberValue(value: unknown, key: string) {
  const candidate = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : 0;
}

function apiEventMessage(event: Record<string, unknown>, providerName: string) {
  const error = objectValue(event, "error");
  if (typeof error?.message === "string") return error.message.slice(0, 500);
  if (typeof event.message === "string") return event.message.slice(0, 500);
  return `${providerName} returned an API error.`;
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "The provider request timed out or was stopped.";
    return error.message.slice(0, 600);
  }
  return "The meeting stopped because of an unknown provider error.";
}

function redactSecret(message: string, secret?: string) {
  return secret ? message.split(secret).join("[redacted]") : message;
}
