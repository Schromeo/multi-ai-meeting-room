"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  DiscussEvent,
  providerIds,
  ProviderId,
  ProviderSummary,
  roleIds,
  roleLabels,
  RoleId,
  SeatRequest,
  UsageSummary,
} from "../lib/discuss-protocol";

type TranscriptItem = {
  id: string;
  provider: ProviderId | "host";
  providerName: string;
  role: RoleId | "host";
  model: string;
  phase: "agenda" | "proposal" | "review" | "synthesis";
  target?: string;
  text: string;
  status: "streaming" | "done" | "error";
  usage?: UsageSummary;
};

type DecisionStatus = "waiting" | "pending" | "approved" | "rejected";

const providerUi: Record<
  ProviderId,
  { label: string; initial: string; color: string; defaultRole: RoleId }
> = {
  openai: {
    label: "OpenAI",
    initial: "O",
    color: "mint",
    defaultRole: "strategist",
  },
  anthropic: {
    label: "Anthropic",
    initial: "A",
    color: "coral",
    defaultRole: "critic",
  },
  gemini: {
    label: "Google",
    initial: "G",
    color: "blue",
    defaultRole: "technical",
  },
};

const initialRoles: Record<ProviderId, RoleId> = {
  openai: "strategist",
  anthropic: "critic",
  gemini: "technical",
};

const emptyUsage: UsageSummary = {
  inputTokens: 0,
  outputTokens: 0,
  estimatedUsd: 0,
  latencyMs: 0,
};

const milestones = [
  {
    id: "M1",
    title: "Interaction prototype",
    status: "Complete",
    detail: "Meeting controls, bounded rounds, roles, and decision artifacts.",
  },
  {
    id: "M1.2",
    title: "Project continuity",
    status: "Complete",
    detail: "Bilingual charter, handoff, roadmap, decisions, and loop guardrails.",
  },
  {
    id: "M2",
    title: "Real Discuss room",
    status: "Current",
    detail: "Streaming provider adapters, cross-review, memo, metrics, and human gate.",
  },
  {
    id: "M2.5",
    title: "Durable rooms",
    status: "Planned",
    detail: "Persistence, transcript recovery, artifacts, history, and export.",
  },
  {
    id: "M3.5",
    title: "Research room",
    status: "Planned",
    detail: "Retrieval, sources, claim verification, and freshness metadata.",
  },
  {
    id: "M4.5",
    title: "Execute room",
    status: "Planned",
    detail: "Local execution connector, approval gates, review, and deterministic checks.",
  },
];

const developmentLoop = [
  "Hypothesis",
  "Build",
  "Critique",
  "Human decision",
  "Evaluate",
  "Log",
];

export default function Home() {
  const [objective, setObjective] = useState(
    "Decide the narrowest useful version of a multi-AI meeting room",
  );
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [activeProviders, setActiveProviders] = useState<ProviderId[]>([]);
  const [roles, setRoles] = useState<Record<ProviderId, RoleId>>(initialRoles);
  const [configLoading, setConfigLoading] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [phase, setPhase] = useState("Awaiting agenda");
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [memo, setMemo] = useState("");
  const [decision, setDecision] = useState<DecisionStatus>("waiting");
  const [usage, setUsage] = useState<UsageSummary>(emptyUsage);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/discuss", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Provider configuration is unavailable.");
        return (await response.json()) as { providers: ProviderSummary[] };
      })
      .then((data) => {
        if (!active) return;
        setProviders(data.providers);
        setActiveProviders(
          data.providers.filter((provider) => provider.configured).map((provider) => provider.id),
        );
      })
      .catch((configError) => {
        if (active) setError(safeClientError(configError));
      })
      .finally(() => {
        if (active) setConfigLoading(false);
      });
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  const configuredCount = providers.filter((provider) => provider.configured).length;
  const seats = useMemo<SeatRequest[]>(
    () =>
      activeProviders.map((provider) => ({
        provider,
        role: roles[provider],
      })),
    [activeProviders, roles],
  );
  const canStart =
    !configLoading &&
    !running &&
    objective.trim().length >= 8 &&
    seats.length >= 2 &&
    seats.length <= 3;

  function toggleProvider(provider: ProviderId) {
    if (running || !providers.find((item) => item.id === provider)?.configured) return;
    setActiveProviders((current) => {
      if (current.includes(provider)) {
        return current.length <= 2 ? current : current.filter((item) => item !== provider);
      }
      return current.length >= 3 ? current : [...current, provider];
    });
  }

  function updateRole(provider: ProviderId, role: RoleId) {
    if (running) return;
    setRoles((current) => ({ ...current, [provider]: role }));
  }

  function submitMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    void runMeeting(1, "");
  }

  async function runMeeting(nextIteration: 1 | 2, priorMemo: string) {
    if (running) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setError("");
    setCopied(false);
    setPhase(nextIteration === 1 ? "Opening room" : "Opening revision round");
    setDecision("waiting");
    setIteration(nextIteration);

    if (nextIteration === 1) {
      setTranscript([
        {
          id: `host-${Date.now()}`,
          provider: "host",
          providerName: "Human Chair",
          role: "host",
          model: "",
          phase: "agenda",
          text: objective.trim(),
          status: "done",
        },
      ]);
    }

    try {
      const requestId = createRequestId();
      const response = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: objective.trim(),
          seats,
          iteration: nextIteration,
          priorMemo,
          requestId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Meeting request failed (${response.status}).`);
      }
      if (!response.body) throw new Error("The meeting stream did not open.");

      await readEvents(response.body, handleEvent);
    } catch (meetingError) {
      if (controller.signal.aborted) {
        setError("Meeting stopped by the host. No automatic retry was started.");
        setPhase("Stopped");
      } else {
        setError(safeClientError(meetingError));
        setPhase("Needs attention");
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  }

  function handleEvent(event: DiscussEvent) {
    if (event.type === "phase.start") {
      setPhase(event.label);
      return;
    }
    if (event.type === "agent.start") {
      const providerName = providers.find((provider) => provider.id === event.provider)?.name;
      setTranscript((current) => [
        ...current,
        {
          id: event.id,
          provider: event.provider,
          providerName: providerName ?? providerUi[event.provider].label,
          role: event.role,
          model: event.model,
          phase: event.phase,
          target: event.target,
          text: "",
          status: "streaming",
        },
      ]);
      return;
    }
    if (event.type === "agent.delta") {
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, text: item.text + event.delta } : item,
        ),
      );
      return;
    }
    if (event.type === "agent.done") {
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, status: "done", usage: event.usage } : item,
        ),
      );
      return;
    }
    if (event.type === "agent.error") {
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                status: "error",
                text: item.text || `This seat stopped: ${event.message}`,
              }
            : item,
        ),
      );
      return;
    }
    if (event.type === "room.done") {
      setMemo(event.memo);
      setUsage((current) =>
        event.iteration === 1 ? event.usage : mergeUsage(current, event.usage),
      );
      setDecision("pending");
      setPhase("Human decision required");
      return;
    }
    if (event.type === "room.error") {
      setError(event.message);
      setPhase("Needs attention");
    }
  }

  function stopMeeting() {
    abortRef.current?.abort();
  }

  function resetRoom() {
    if (running) return;
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    setIteration(0);
    setPhase("Awaiting agenda");
    setError("");
  }

  async function copyMemo() {
    if (!memo) return;
    await navigator.clipboard.writeText(memo);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Human-chaired AI deliberation</p>
            <h1>Multi-AI Meeting Room</h1>
          </div>
          <div className="topbar-actions">
            <a className="devlog-link" href="#development-log">
              Development Log
            </a>
            <div className="room-stats" aria-label="Room status">
              <span>{seats.length} seats</span>
              <span>{iteration === 0 ? "No round" : `Round ${iteration}/2`}</span>
              <span>Discuss</span>
            </div>
          </div>
        </header>

        <div className="capability-strip" aria-label="Room permissions">
          <div className="capability active">
            <strong>Discuss</strong>
            <span>Active</span>
          </div>
          <div className="capability locked">
            <strong>Research</strong>
            <span>M3.5</span>
          </div>
          <div className="capability locked">
            <strong>Execute</strong>
            <span>M4.5</span>
          </div>
        </div>

        <form className="agenda" onSubmit={submitMeeting}>
          <label htmlFor="objective">Meeting objective</label>
          <div className="agenda-row">
            <textarea
              id="objective"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="What must this room decide?"
              maxLength={4_000}
              rows={2}
              disabled={running}
            />
            <button type="submit" disabled={!canStart}>
              Start Meeting
            </button>
          </div>
          <div className="agenda-meta">
            <span>{objective.length}/4,000</span>
            <span>2 rounds maximum</span>
            <span>{configuredCount}/3 providers configured</span>
          </div>
        </form>

        {configuredCount < 2 && !configLoading ? (
          <div className="configuration-notice" role="status">
            <strong>Provider configuration required</strong>
            <span>
              Add at least two server-side API keys before a real meeting can begin.
            </span>
          </div>
        ) : null}

        <section className="meeting-grid" aria-label="Discuss room">
          <aside className="agent-rail" aria-label="Participant seats">
            <div className="rail-heading">
              <p className="eyebrow">Participants</p>
              <h2>Model seats</h2>
            </div>
            {providerIds.map((providerId) => {
              const config = providers.find((item) => item.id === providerId);
              const ui = providerUi[providerId];
              const configured = Boolean(config?.configured);
              const checked = activeProviders.includes(providerId);
              return (
                <article className={`agent-seat ${ui.color}`} key={providerId}>
                  <div className="agent-seat-head">
                    <span className="avatar">{ui.initial}</span>
                    <span className="agent-identity">
                      <strong>{config?.name ?? ui.label}</strong>
                      <small>{configLoading ? "Checking configuration" : config?.model}</small>
                    </span>
                    <label className="seat-toggle">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProvider(providerId)}
                        disabled={!configured || running}
                        aria-label={`Use ${ui.label} in this room`}
                      />
                      <span>{configured ? "Ready" : "No key"}</span>
                    </label>
                  </div>
                  <label className="role-field">
                    <span>Assigned role</span>
                    <select
                      value={roles[providerId]}
                      onChange={(event) =>
                        updateRole(providerId, event.target.value as RoleId)
                      }
                      disabled={!checked || running}
                    >
                      {roleIds.map((role) => (
                        <option value={role} key={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              );
            })}
          </aside>

          <section className="transcript" aria-label="Meeting transcript">
            <div className="transcript-head">
              <div>
                <p className="eyebrow">Live room</p>
                <h2>{phase}</h2>
              </div>
              <div className={running ? "pulse on" : "pulse"}>
                {running ? "streaming" : decision === "pending" ? "awaiting chair" : "ready"}
              </div>
            </div>

            <div className="messages" aria-live="polite">
              {transcript.length === 0 ? (
                <div className="empty-room">
                  <span>DISCUSS / M2</span>
                  <strong>No active transcript</strong>
                </div>
              ) : (
                transcript.map((item) => (
                  <article
                    className={`message ${item.provider} ${item.status}`}
                    key={item.id}
                  >
                    <div className="message-meta">
                      <span>
                        <strong>
                          {item.role === "host" ? "Human Chair" : roleLabels[item.role]}
                        </strong>
                        {item.provider !== "host" ? ` · ${item.providerName}` : ""}
                      </span>
                      <span className="phase-tag">{item.phase}</span>
                    </div>
                    {item.target ? <p className="review-target">Reviews {item.target}</p> : null}
                    <p className="message-text">
                      {item.text || (item.status === "streaming" ? "Waiting for first token…" : "")}
                    </p>
                    {item.usage ? (
                      <div className="message-usage">
                        <span>{formatTokens(item.usage.outputTokens)} out</span>
                        <span>{formatDuration(item.usage.latencyMs)}</span>
                        <span>{formatMoney(item.usage.estimatedUsd)}</span>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>

            <div className="controls" aria-label="Meeting controls">
              {running ? (
                <button className="stop-button" type="button" onClick={stopMeeting}>
                  Stop Meeting
                </button>
              ) : (
                <button type="button" onClick={resetRoom} disabled={transcript.length === 0}>
                  Clear Room
                </button>
              )}
              <button
                type="button"
                onClick={() => void runMeeting(2, memo)}
                disabled={running || decision !== "pending" || iteration !== 1 || !memo}
              >
                Request One Revision
              </button>
              <button
                type="button"
                onClick={() => setDecision("approved")}
                disabled={running || decision !== "pending" || !memo}
              >
                Approve Memo
              </button>
            </div>
          </section>

          <aside className="insights" aria-label="Decision surface">
            <section>
              <p className="eyebrow">Artifact</p>
              <h2>Decision Surface</h2>
            </section>

            <div className="artifact-block status-block">
              <span className={`decision-state ${decision}`}>{decisionLabel(decision)}</span>
              <dl>
                <div>
                  <dt>Permission</dt>
                  <dd>Discuss only</dd>
                </div>
                <div>
                  <dt>Round budget</dt>
                  <dd>{iteration}/2</dd>
                </div>
                <div>
                  <dt>Providers</dt>
                  <dd>{seats.length}</dd>
                </div>
              </dl>
            </div>

            <div className="artifact-block metric-grid">
              <div>
                <span>Input</span>
                <strong>{formatTokens(usage.inputTokens)}</strong>
              </div>
              <div>
                <span>Output</span>
                <strong>{formatTokens(usage.outputTokens)}</strong>
              </div>
              <div>
                <span>Est. cost</span>
                <strong>{formatMoney(usage.estimatedUsd)}</strong>
              </div>
              <div>
                <span>Model time</span>
                <strong>{formatDuration(usage.latencyMs)}</strong>
              </div>
            </div>

            <div className="artifact-block memo-block">
              <div className="artifact-title">
                <h3>Decision memo</h3>
                <button type="button" onClick={() => void copyMemo()} disabled={!memo}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre>{memo || "The synthesized memo will appear after proposal and review phases."}</pre>
            </div>

            {decision === "pending" ? (
              <button
                className="reject-button"
                type="button"
                onClick={() => setDecision("rejected")}
              >
                Reject Memo
              </button>
            ) : null}
            {error ? <p className="room-error">{error}</p> : null}
          </aside>
        </section>

        <section className="devlog" id="development-log" aria-labelledby="devlog-title">
          <div className="devlog-heading">
            <div>
              <p className="eyebrow">Development Log / v0.3</p>
              <h2 id="devlog-title">M2 real Discuss room</h2>
            </div>
            <div className="stage-marker">
              <span>Current stage</span>
              <strong>Provider configuration and live evaluation</strong>
            </div>
          </div>

          <div className="truth-strip" aria-label="Current product truth">
            <strong>What is real now</strong>
            <p>
              The room uses provider-neutral server adapters, token streaming,
              independent proposals, assigned cross-review, bounded revision, a human
              decision gate, and usage estimates. It still has no persistence,
              retrieval, evidence verification, or execution tools.
            </p>
          </div>

          <div className="milestone-list" aria-label="Product milestones">
            {milestones.map((milestone) => (
              <article className="milestone" key={milestone.id}>
                <div className="milestone-id">{milestone.id}</div>
                <div>
                  <div className="milestone-title">
                    <h3>{milestone.title}</h3>
                    <span className={`milestone-status ${milestone.status.toLowerCase()}`}>
                      {milestone.status}
                    </span>
                  </div>
                  <p>{milestone.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="devlog-lower">
            <section className="product-hypothesis">
              <p className="eyebrow">M2 evaluation question</p>
              <h3>Does structured disagreement improve the decision?</h3>
              <p>
                The experiment is successful only when the room surfaces useful
                objections or produces a more defensible memo than a single strong
                model at acceptable time and cost.
              </p>
              <p className="hypothesis-caution">
                Provider diversity is not treated as evidence. Research remains a
                separate permission level and milestone.
              </p>
            </section>

            <section className="development-loop">
              <p className="eyebrow">Every development round</p>
              <ol>
                {developmentLoop.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="next-gate">
                <strong>Next gate:</strong> configure two provider keys and complete one
                live end-to-end meeting without duplicate calls.
              </p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

async function readEvents(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: DiscussEvent) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as DiscussEvent);
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) onEvent(JSON.parse(buffer) as DiscussEvent);
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function mergeUsage(a: UsageSummary, b: UsageSummary): UsageSummary {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    estimatedUsd: a.estimatedUsd + b.estimatedUsd,
    latencyMs: a.latencyMs + b.latencyMs,
  };
}

function formatTokens(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 10_000 ? "compact" : "standard" }).format(
    value,
  );
}

function formatMoney(value: number) {
  if (value <= 0) return "$0.000";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 0.01 ? 4 : 3,
    maximumFractionDigits: value < 0.01 ? 4 : 3,
  }).format(value);
}

function formatDuration(value: number) {
  if (value <= 0) return "0s";
  return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)}s`;
}

function decisionLabel(status: DecisionStatus) {
  if (status === "pending") return "Chair decision required";
  if (status === "approved") return "Memo approved";
  if (status === "rejected") return "Memo rejected";
  return "No decision memo";
}

function safeClientError(error: unknown) {
  return error instanceof Error ? error.message : "An unknown meeting error occurred.";
}
