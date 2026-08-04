"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  DiscussEvent,
  providerIds,
  ProviderId,
  ProviderSummary,
  roleBriefs,
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
type WorkspaceStage = "agenda" | "meeting" | "decision";
type TranscriptMode = "focus" | "overview";

const providerUi: Record<
  ProviderId,
  { label: string; initial: string; color: string; defaultRole: RoleId; keyHint: string }
> = {
  openai: {
    label: "OpenAI",
    initial: "O",
    color: "mint",
    defaultRole: "strategist",
    keyHint: "sk-...",
  },
  anthropic: {
    label: "Anthropic",
    initial: "A",
    color: "coral",
    defaultRole: "critic",
    keyHint: "sk-ant-...",
  },
  gemini: {
    label: "Google Gemini",
    initial: "G",
    color: "blue",
    defaultRole: "technical",
    keyHint: "AI...",
  },
};

const initialRoles: Record<ProviderId, RoleId> = {
  openai: "strategist",
  anthropic: "critic",
  gemini: "technical",
};

const initialModels: Record<ProviderId, string> = {
  openai: "gpt-5.6-luna",
  anthropic: "claude-sonnet-5",
  gemini: "gemini-3.6-flash",
};

const initialDraftKeys: Record<ProviderId, string> = {
  openai: "",
  anthropic: "",
  gemini: "",
};

const emptyUsage: UsageSummary = {
  inputTokens: 0,
  outputTokens: 0,
  estimatedUsd: 0,
  latencyMs: 0,
};

const milestones = [
  ["M2", "Real Discuss", "Live protocol implemented; provider evaluation remains."],
  ["M2.1", "Connections", "Session BYOK, model choice, and cost guardrails."],
  ["M2.2", "Composable seats", "Separate connections, models, roles, skills, and seats."],
  ["M2.5", "Durable rooms", "Recovery, history, artifacts, and export."],
  ["M3.5", "Research", "Sources, evidence checks, and freshness."],
  ["M4.5", "Execute", "Bounded tools, coding agents, and independent review."],
];

export default function Home() {
  const [objective, setObjective] = useState(
    "Decide the narrowest useful version of a multi-AI meeting room",
  );
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [activeProviders, setActiveProviders] = useState<ProviderId[]>([]);
  const [roles, setRoles] = useState<Record<ProviderId, RoleId>>(initialRoles);
  const [models, setModels] = useState<Record<ProviderId, string>>(initialModels);
  const [sessionKeys, setSessionKeys] = useState<Partial<Record<ProviderId, string>>>({});
  const [draftKeys, setDraftKeys] = useState<Record<ProviderId, string>>(initialDraftKeys);
  const [configLoading, setConfigLoading] = useState(true);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [stage, setStage] = useState<WorkspaceStage>("agenda");
  const [transcriptMode, setTranscriptMode] = useState<TranscriptMode>("focus");
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [phase, setPhase] = useState("Awaiting agenda");
  const [phaseKey, setPhaseKey] = useState<"agenda" | "proposal" | "review" | "synthesis">(
    "agenda",
  );
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [memo, setMemo] = useState("");
  const [decision, setDecision] = useState<DecisionStatus>("waiting");
  const [usage, setUsage] = useState<UsageSummary>(emptyUsage);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const liveTextRef = useRef<HTMLDivElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);

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
        setModels((current) => {
          const next = { ...current };
          data.providers.forEach((provider) => {
            next[provider.id] = provider.model;
          });
          return next;
        });
        const configured = data.providers
          .filter((provider) => provider.configured)
          .map((provider) => provider.id);
        setActiveProviders(configured.slice(0, 3));
        if (configured.length < 2) setConnectionOpen(true);
      })
      .catch((configError) => setError(safeClientError(configError)))
      .finally(() => setConfigLoading(false));
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  const isWorkspaceConnected = (provider: ProviderId) =>
    Boolean(providers.find((item) => item.id === provider)?.configured);
  const isSessionConnected = (provider: ProviderId) => Boolean(sessionKeys[provider]);
  const isConnected = (provider: ProviderId) =>
    isWorkspaceConnected(provider) || isSessionConnected(provider);
  const connectedCount = providerIds.filter(isConnected).length;
  const projectedConnectedCount = providerIds.filter(
    (provider) => isConnected(provider) || draftKeys[provider].trim().length >= 8,
  ).length;

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

  const activeTranscriptItem = useMemo(() => {
    if (pinnedMessageId) {
      const pinned = transcript.find((item) => item.id === pinnedMessageId);
      if (pinned) return pinned;
    }
    return (
      transcript.find((item) => item.status === "streaming") ??
      [...transcript].reverse().find((item) => item.provider !== "host") ??
      transcript[0]
    );
  }, [pinnedMessageId, transcript]);

  useEffect(() => {
    if (liveTextRef.current && !pinnedMessageId) {
      liveTextRef.current.scrollTop = liveTextRef.current.scrollHeight;
    }
    if (overviewRef.current && transcriptMode === "overview") {
      overviewRef.current.scrollTop = overviewRef.current.scrollHeight;
    }
  }, [activeTranscriptItem?.text, pinnedMessageId, transcript, transcriptMode]);

  function toggleProvider(provider: ProviderId) {
    if (running || !isConnected(provider)) return;
    setActiveProviders((current) => {
      if (current.includes(provider)) return current.filter((item) => item !== provider);
      return current.length >= 3 ? current : [...current, provider];
    });
  }

  function updateRole(provider: ProviderId, role: RoleId) {
    if (!running) setRoles((current) => ({ ...current, [provider]: role }));
  }

  function saveConnections(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnectionError("");
    const nextKeys = { ...sessionKeys };
    for (const provider of providerIds) {
      const draft = draftKeys[provider].trim();
      if (!draft) continue;
      if (draft.length < 8 || /\s/.test(draft)) {
        setConnectionError(`${providerUi[provider].label} key does not look complete.`);
        return;
      }
      if (!/^[a-zA-Z0-9._:/-]{1,160}$/.test(models[provider].trim())) {
        setConnectionError(`${providerUi[provider].label} model id is invalid.`);
        return;
      }
      nextKeys[provider] = draft;
    }

    const available = providerIds.filter(
      (provider) => isWorkspaceConnected(provider) || Boolean(nextKeys[provider]),
    );
    if (available.length < 2) {
      setConnectionError("Connect at least two providers to open a real meeting.");
      return;
    }
    setSessionKeys(nextKeys);
    setDraftKeys(initialDraftKeys);
    setActiveProviders((current) => {
      const retained = current.filter((provider) => available.includes(provider));
      for (const provider of available) {
        if (retained.length >= 3) break;
        if (!retained.includes(provider)) retained.push(provider);
      }
      return retained;
    });
    setConnectionOpen(false);
  }

  function removeSessionConnection(provider: ProviderId) {
    setSessionKeys((current) => {
      const next = { ...current };
      delete next[provider];
      return next;
    });
    if (!isWorkspaceConnected(provider)) {
      setActiveProviders((current) => current.filter((item) => item !== provider));
    }
  }

  function submitMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    setPinnedMessageId(null);
    setTranscriptMode("focus");
    void runMeeting(1, "");
  }

  async function runMeeting(nextIteration: 1 | 2, priorMemo: string) {
    if (running) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStage("meeting");
    setError("");
    setCopied(false);
    setPhase(nextIteration === 1 ? "Opening room" : "Opening revision round");
    setPhaseKey("agenda");
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

    const connections = Object.fromEntries(
      seats.flatMap((seat) => {
        const apiKey = sessionKeys[seat.provider];
        return apiKey
          ? [[seat.provider, { apiKey, model: models[seat.provider].trim() }]]
          : [];
      }),
    );

    try {
      const response = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: objective.trim(),
          seats,
          connections,
          iteration: nextIteration,
          priorMemo,
          requestId: createRequestId(),
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
      setPhaseKey(event.phase);
      setPinnedMessageId(null);
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
      setStage("decision");
      return;
    }
    if (event.type === "room.error") {
      setError(event.message);
      setPhase("Needs attention");
    }
  }

  function resetRoom() {
    if (running) return;
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    setIteration(0);
    setPhase("Awaiting agenda");
    setPhaseKey("agenda");
    setError("");
    setPinnedMessageId(null);
    setStage("agenda");
  }

  async function copyMemo() {
    if (!memo) return;
    await navigator.clipboard.writeText(memo);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }

  return (
    <main className="meeting-app">
      <header className="app-header">
        <button className="brand" type="button" onClick={() => !running && setStage("agenda")}>
          <span className="brand-mark">M</span>
          <span>
            <strong>Meeting Room</strong>
            <small>Human-chaired AI deliberation</small>
          </span>
        </button>

        <nav className="stage-nav" aria-label="Meeting stages">
          <button type="button" className={connectedCount >= 2 ? "complete" : "active"} onClick={() => setConnectionOpen(true)}>
            <span>1</span> Setup
          </button>
          <button type="button" className={stage === "agenda" ? "active" : transcript.length ? "complete" : ""} onClick={() => !running && setStage("agenda")}>
            <span>2</span> Agenda
          </button>
          <button type="button" className={stage === "meeting" ? "active" : memo ? "complete" : ""} disabled={!transcript.length} onClick={() => setStage("meeting")}>
            <span>3</span> Meeting
          </button>
          <button type="button" className={stage === "decision" ? "active" : decision === "approved" ? "complete" : ""} disabled={!memo} onClick={() => setStage("decision")}>
            <span>4</span> Decision
          </button>
        </nav>

        <div className="header-actions">
          <button className="quiet-button" type="button" onClick={() => setProjectOpen(true)}>
            Project
          </button>
          <button className="connection-button" type="button" onClick={() => setConnectionOpen(true)}>
            <span className={connectedCount >= 2 ? "status-dot ready" : "status-dot"} />
            {connectedCount}/3 connected
          </button>
        </div>
      </header>

      <section className="workspace-frame">
        {stage === "agenda" ? (
          <form className="agenda-workspace" onSubmit={submitMeeting}>
            <section className="objective-panel">
              <div className="section-kicker">Meeting objective</div>
              <h1>What must this room decide?</h1>
              <p className="supporting-copy">
                Give the participants a decision, not a broad topic. The human chair keeps final authority.
              </p>
              <textarea
                id="objective"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                placeholder="Define the decision and its constraints..."
                maxLength={4_000}
                rows={7}
                disabled={running}
                autoFocus
              />
              <div className="objective-footer">
                <span>{objective.length}/4,000</span>
                <span>Discuss only</span>
                <span>2 rounds maximum</span>
              </div>
              {connectedCount < 2 && !configLoading ? (
                <button className="connection-callout" type="button" onClick={() => setConnectionOpen(true)}>
                  Connect at least two models before opening the room
                </button>
              ) : null}
              {error ? <p className="inline-error">{error}</p> : null}
            </section>

            <aside className="seat-composer">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Room composition</span>
                  <h2>{seats.length} active seats</h2>
                </div>
                <button type="button" className="text-button" onClick={() => setConnectionOpen(true)}>
                  Manage
                </button>
              </div>

              <div className="seat-list">
                {providerIds.map((provider) => {
                  const ui = providerUi[provider];
                  const connected = isConnected(provider);
                  const checked = activeProviders.includes(provider);
                  return (
                    <article className={`seat-row ${ui.color} ${checked ? "selected" : ""}`} key={provider}>
                      <button
                        className="seat-selector"
                        type="button"
                        disabled={!connected}
                        onClick={() => toggleProvider(provider)}
                        aria-pressed={checked}
                      >
                        <span className="avatar">{ui.initial}</span>
                        <span className="seat-identity">
                          <strong>{ui.label}</strong>
                          <small>{connected ? models[provider] : "Connection required"}</small>
                        </span>
                        <span className={`seat-check ${checked ? "checked" : ""}`}>{checked ? "On" : "Off"}</span>
                      </button>
                      <label>
                        <span>Role</span>
                        <select
                          value={roles[provider]}
                          onChange={(event) => updateRole(provider, event.target.value as RoleId)}
                          disabled={!checked || running}
                        >
                          {roleIds.map((role) => (
                            <option value={role} key={role}>{roleLabels[role]}</option>
                          ))}
                        </select>
                      </label>
                      <p>{roleBriefs[roles[provider]]}</p>
                    </article>
                  );
                })}
              </div>

              <div className="launch-zone">
                <div>
                  <strong>{seats.length >= 2 ? "Room is composed" : "Choose two or three seats"}</strong>
                  <span>{seats.length === 3 ? "7 calls per round" : seats.length === 2 ? "5 calls per round" : "Bounded at two rounds"}</span>
                </div>
                <button className="primary-button" type="submit" disabled={!canStart}>
                  Start meeting
                </button>
              </div>
            </aside>
          </form>
        ) : null}

        {stage === "meeting" ? (
          <section className="meeting-workspace">
            <header className="meeting-toolbar">
              <div className="phase-progress" aria-label="Protocol progress">
                {(["proposal", "review", "synthesis"] as const).map((item, index) => (
                  <span className={phaseState(item, phaseKey)} key={item}>
                    <i>{index + 1}</i>{phaseLabel(item)}
                  </span>
                ))}
              </div>
              <div className="meeting-status">
                <span className={running ? "live-indicator on" : "live-indicator"}>
                  {running ? "Live" : phase}
                </span>
                <div className="segmented-control" aria-label="Transcript view">
                  <button type="button" className={transcriptMode === "focus" ? "active" : ""} onClick={() => setTranscriptMode("focus")}>Focus</button>
                  <button type="button" className={transcriptMode === "overview" ? "active" : ""} onClick={() => setTranscriptMode("overview")}>Overview</button>
                </div>
              </div>
            </header>

            {transcriptMode === "focus" ? (
              <div className="focus-layout">
                <article className={`speaker-stage ${activeTranscriptItem?.provider ?? "host"}`}>
                  {activeTranscriptItem ? (
                    <>
                      <header className="speaker-header">
                        <span className="speaker-avatar">
                          {activeTranscriptItem.provider === "host" ? "H" : providerUi[activeTranscriptItem.provider].initial}
                        </span>
                        <div>
                          <span className="section-kicker">{activeTranscriptItem.phase}</span>
                          <h2>{activeTranscriptItem.role === "host" ? "Human Chair" : roleLabels[activeTranscriptItem.role]}</h2>
                          <p>{activeTranscriptItem.providerName}{activeTranscriptItem.model ? ` / ${activeTranscriptItem.model}` : ""}</p>
                        </div>
                        <span className={`speaker-state ${activeTranscriptItem.status}`}>
                          {activeTranscriptItem.status === "streaming" ? "Speaking" : activeTranscriptItem.status}
                        </span>
                      </header>
                      {activeTranscriptItem.target ? <div className="reviewing">Reviewing {activeTranscriptItem.target}</div> : null}
                      <div className="live-text" ref={liveTextRef} aria-live="polite">
                        {activeTranscriptItem.text || (activeTranscriptItem.status === "streaming" ? "Waiting for the first token..." : "")}
                        {activeTranscriptItem.status === "streaming" ? <span className="stream-caret" /> : null}
                      </div>
                      {activeTranscriptItem.usage ? (
                        <footer className="speaker-metrics">
                          <span>{formatTokens(activeTranscriptItem.usage.outputTokens)} output tokens</span>
                          <span>{formatDuration(activeTranscriptItem.usage.latencyMs)}</span>
                          <span>{formatMoney(activeTranscriptItem.usage.estimatedUsd)}</span>
                        </footer>
                      ) : null}
                    </>
                  ) : (
                    <div className="empty-stage"><strong>Opening the room</strong><span>The first participant will appear here.</span></div>
                  )}
                </article>

                <aside className="room-timeline">
                  <div className="panel-heading compact">
                    <div><span className="section-kicker">Room timeline</span><h2>{phase}</h2></div>
                    {pinnedMessageId ? <button type="button" className="text-button" onClick={() => setPinnedMessageId(null)}>Follow live</button> : null}
                  </div>
                  <div className="timeline-list">
                    {transcript.map((item) => (
                      <button
                        type="button"
                        className={`timeline-item ${activeTranscriptItem?.id === item.id ? "active" : ""}`}
                        key={item.id}
                        onClick={() => setPinnedMessageId(item.id)}
                      >
                        <span className={`timeline-dot ${item.status}`} />
                        <span>
                          <strong>{item.role === "host" ? "Agenda" : roleLabels[item.role]}</strong>
                          <small>{item.providerName} / {item.phase}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="overview-grid" ref={overviewRef} aria-live="polite">
                {transcript.map((item) => (
                  <article className={`overview-message ${item.provider}`} key={item.id}>
                    <header>
                      <span>{item.role === "host" ? "Human Chair" : roleLabels[item.role]}</span>
                      <small>{item.providerName} / {item.phase}</small>
                    </header>
                    {item.target ? <p className="reviewing">Reviews {item.target}</p> : null}
                    <div>{item.text || "Waiting..."}</div>
                  </article>
                ))}
              </div>
            )}

            <footer className="meeting-controls">
              <div>
                <strong>Round {iteration}/2</strong>
                <span>{seats.length} seats / {transcript.filter((item) => item.status === "done").length} turns complete</span>
              </div>
              {error ? <p className="control-error">{error}</p> : null}
              <div className="control-actions">
                {running ? <button className="danger-button" type="button" onClick={() => abortRef.current?.abort()}>Stop meeting</button> : null}
                {!running && memo ? <button type="button" onClick={() => setStage("decision")}>Open decision</button> : null}
                {!running && !memo ? <button type="button" onClick={resetRoom}>Return to agenda</button> : null}
              </div>
            </footer>
          </section>
        ) : null}

        {stage === "decision" ? (
          <section className="decision-workspace">
            <article className="memo-surface">
              <header>
                <div>
                  <span className="section-kicker">Decision artifact / Round {iteration}</span>
                  <h1>Decision memo</h1>
                </div>
                <span className={`decision-pill ${decision}`}>{decisionLabel(decision)}</span>
              </header>
              <pre>{memo || "The room has not produced a decision memo."}</pre>
              <footer>
                <button type="button" onClick={() => { setTranscriptMode("overview"); setStage("meeting"); }}>Review transcript</button>
                <button type="button" onClick={() => void copyMemo()} disabled={!memo}>{copied ? "Copied" : "Copy memo"}</button>
              </footer>
            </article>

            <aside className="decision-rail">
              <section>
                <span className="section-kicker">Human gate</span>
                <h2>The room advises. You decide.</h2>
                <p>Approve the artifact, reject it, or spend the single remaining revision round on named objections.</p>
                <div className="decision-actions">
                  <button className="approve-button" type="button" onClick={() => setDecision("approved")} disabled={running || decision !== "pending"}>Approve memo</button>
                  <button type="button" onClick={() => void runMeeting(2, memo)} disabled={running || decision !== "pending" || iteration !== 1 || !memo}>Request revision</button>
                  <button className="reject-button" type="button" onClick={() => setDecision("rejected")} disabled={running || decision !== "pending"}>Reject memo</button>
                </div>
              </section>
              <section className="usage-summary">
                <span className="section-kicker">Room usage</span>
                <dl>
                  <div><dt>Input</dt><dd>{formatTokens(usage.inputTokens)}</dd></div>
                  <div><dt>Output</dt><dd>{formatTokens(usage.outputTokens)}</dd></div>
                  <div><dt>Estimated cost</dt><dd>{formatMoney(usage.estimatedUsd)}</dd></div>
                  <div><dt>Model time</dt><dd>{formatDuration(usage.latencyMs)}</dd></div>
                </dl>
                <p>Estimate only. Provider billing is authoritative.</p>
              </section>
              <button className="new-meeting-button" type="button" onClick={resetRoom} disabled={running}>New meeting</button>
              {error ? <p className="inline-error">{error}</p> : null}
            </aside>
          </section>
        ) : null}
      </section>

      {connectionOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="connection-dialog" role="dialog" aria-modal="true" aria-labelledby="connections-title" onSubmit={saveConnections}>
            <header className="dialog-header">
              <div>
                <span className="section-kicker">Setup</span>
                <h2 id="connections-title">Model connections</h2>
                <p>Keys entered here live only in this page and are cleared on refresh.</p>
              </div>
              <button type="button" className="quiet-button" onClick={() => setConnectionOpen(false)}>Close</button>
            </header>

            <div className="privacy-note">
              <strong>Session-only BYOK</strong>
              <span>Sent only to this site&apos;s meeting endpoint for immediate provider calls. Never placed in URLs, transcripts, or browser storage.</span>
            </div>

            <div className="connection-list">
              {providerIds.map((provider) => {
                const ui = providerUi[provider];
                const workspaceConnected = isWorkspaceConnected(provider);
                const sessionConnected = isSessionConnected(provider);
                return (
                  <section className={`connection-row ${ui.color}`} key={provider}>
                    <div className="connection-identity">
                      <span className="avatar">{ui.initial}</span>
                      <span>
                        <strong>{ui.label}</strong>
                        <small>{sessionConnected ? "Connected for this page" : workspaceConnected ? "Managed by workspace" : "Not connected"}</small>
                      </span>
                    </div>
                    <label>
                      <span>API key</span>
                      <input
                        type="password"
                        value={draftKeys[provider]}
                        onChange={(event) => setDraftKeys((current) => ({ ...current, [provider]: event.target.value }))}
                        placeholder={sessionConnected ? "Enter a new key to replace it" : workspaceConnected ? "Workspace key is active" : ui.keyHint}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={workspaceConnected && !sessionConnected}
                      />
                    </label>
                    <label>
                      <span>Model id</span>
                      <input
                        type="text"
                        value={models[provider]}
                        onChange={(event) => setModels((current) => ({ ...current, [provider]: event.target.value }))}
                        spellCheck={false}
                        disabled={workspaceConnected && !sessionConnected}
                      />
                    </label>
                    {sessionConnected ? <button className="disconnect-button" type="button" onClick={() => removeSessionConnection(provider)}>Disconnect</button> : <span className="billing-owner">Billed by {ui.label}</span>}
                  </section>
                );
              })}
            </div>
            {connectionError ? <p className="inline-error">{connectionError}</p> : null}
            <footer className="dialog-footer">
              <span>{projectedConnectedCount}/3 available after saving</span>
              <button className="primary-button" type="submit" disabled={projectedConnectedCount < 2}>Save connections</button>
            </footer>
          </form>
        </div>
      ) : null}

      {projectOpen ? (
        <div className="modal-backdrop project-backdrop" role="presentation">
          <aside className="project-drawer" role="dialog" aria-modal="true" aria-labelledby="project-title">
            <header className="dialog-header">
              <div><span className="section-kicker">Project truth / v0.4</span><h2 id="project-title">Build the protocol, not a model carousel</h2></div>
              <button type="button" className="quiet-button" onClick={() => setProjectOpen(false)}>Close</button>
            </header>
            <p className="project-thesis">The current room can stream independent proposals, assigned reviews, and a bounded memo. Persistence, evidence verification, durable BYOK, custom endpoints, and execution remain future work.</p>
            <div className="milestone-stack">
              {milestones.map(([id, title, detail], index) => (
                <article className={index === 1 ? "current" : ""} key={id}>
                  <span>{id}</span><div><strong>{title}</strong><p>{detail}</p></div>
                </article>
              ))}
            </div>
            <footer>Current gate: connect two providers and complete one live evaluation without duplicate calls.</footer>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

async function readEvents(stream: ReadableStream<Uint8Array>, onEvent: (event: DiscussEvent) => void) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) onEvent(JSON.parse(line) as DiscussEvent);
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
  return new Intl.NumberFormat("en", { notation: value >= 10_000 ? "compact" : "standard" }).format(value);
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
  if (status === "pending") return "Decision required";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Waiting";
}

function phaseLabel(phase: "proposal" | "review" | "synthesis") {
  if (phase === "proposal") return "Proposals";
  if (phase === "review") return "Cross-review";
  return "Memo";
}

function phaseState(phase: "proposal" | "review" | "synthesis", current: "agenda" | "proposal" | "review" | "synthesis") {
  const order = { agenda: 0, proposal: 1, review: 2, synthesis: 3 };
  if (order[phase] < order[current]) return "complete";
  if (phase === current) return "active";
  return "";
}

function safeClientError(error: unknown) {
  return error instanceof Error ? error.message : "An unknown meeting error occurred.";
}
