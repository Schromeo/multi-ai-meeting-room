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
import {
  DecisionStatus,
  emptyUsage,
  MeetingRecord,
  ParticipantSnapshot,
  TranscriptItem,
  upsertMeetingRecord,
} from "../lib/meeting-record";
import { createBrowserRoomStore, RoomStore } from "../lib/room-store";
import {
  createInitialMeetingState,
  MeetingState,
  reduceTurnEnvelope,
} from "../lib/meeting-state";

type WorkspaceStage = "agenda" | "meeting" | "decision";
type TranscriptMode = "focus" | "overview";
type ProviderChoice = ProviderId | "auto";

type ModelOption = {
  id: string;
  name: string;
};

type ConnectionRecord = {
  id: string;
  provider: ProviderId;
  name: string;
  source: "workspace" | "session";
  models: ModelOption[];
  apiKey?: string;
};

type SeatDraft = {
  id: string;
  enabled: boolean;
  connectionId: string;
  model: string;
  role: RoleId;
};

const defaultObjective = "Decide the narrowest useful version of a multi-AI meeting room";

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

const initialSeatDrafts: SeatDraft[] = [
  { id: "seat-1", enabled: true, connectionId: "", model: "", role: "strategist" },
  { id: "seat-2", enabled: true, connectionId: "", model: "", role: "critic" },
  { id: "seat-3", enabled: false, connectionId: "", model: "", role: "technical" },
];

const milestones = [
  ["M2", "Real Discuss", "Live two-provider path verified; protocol refinement remains."],
  ["M2.1", "Connections", "Session BYOK, model choice, and cost guardrails."],
  ["M2.2", "Composable seats", "Separate connections, models, roles, skills, and seats."],
  ["M2.7", "Local Event Store", "IndexedDB events, snapshots, artifacts, usage, and migration."],
  ["M2.8", "Structured state", "Validated turn cards and source-linked canonical records."],
  ["M2.9", "Resumable Chair", "Checkpoints, directives, pause, resume, and recovery."],
  ["M3.5", "Research", "Sources, evidence checks, and freshness."],
  ["M4.5", "Execute", "Bounded tools, coding agents, and independent review."],
];

export default function Home() {
  const [objective, setObjective] = useState(defaultObjective);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [sessionConnections, setSessionConnections] = useState<ConnectionRecord[]>([]);
  const [seatDrafts, setSeatDrafts] = useState<SeatDraft[]>(initialSeatDrafts);
  const [providerChoice, setProviderChoice] = useState<ProviderChoice>("auto");
  const [draftName, setDraftName] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [discoveringModels, setDiscoveringModels] = useState(false);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [focusedConnectionId, setFocusedConnectionId] = useState<string | null>(null);
  const [connectionTargetSeatId, setConnectionTargetSeatId] = useState<string | null>(null);
  const [loadingConnectionId, setLoadingConnectionId] = useState<string | null>(null);
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [pendingDeleteRoomId, setPendingDeleteRoomId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [currentRoomCreatedAt, setCurrentRoomCreatedAt] = useState("");
  const [currentParticipants, setCurrentParticipants] = useState<ParticipantSnapshot[]>([]);
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
  const [meetingState, setMeetingState] = useState<MeetingState | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const liveTextRef = useRef<HTMLDivElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const meetingRecordsRef = useRef<MeetingRecord[]>([]);
  const roomStoreRef = useRef<RoomStore | null>(null);
  const meetingStateRef = useRef<MeetingState | null>(null);

  useEffect(() => {
    let active = true;
    const store = createBrowserRoomStore();
    roomStoreRef.current = store;
    void store.initialize()
      .then(({ records }) => {
        if (!active) return;
        const now = new Date().toISOString();
        meetingRecordsRef.current = records;
        setMeetingRecords(records);
        setCurrentRoomId((current) => current || createRoomId());
        setCurrentRoomCreatedAt((current) => current || now);
        setHistoryError("");
        setHistoryReady(true);
      })
      .catch((storeError) => {
        if (!active) return;
        const now = new Date().toISOString();
        setCurrentRoomId((current) => current || createRoomId());
        setCurrentRoomCreatedAt((current) => current || now);
        setHistoryError(safeClientError(storeError));
        setHistoryReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

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
        const configured = data.providers.filter((provider) => provider.configured);
        if (configured.length > 0) {
          setSeatDrafts((current) =>
            current.map((seat, index) => {
              if (!seat.enabled) return seat;
              const provider = configured[index];
              if (!provider) return seat;
              return {
                ...seat,
                connectionId: `workspace-${provider.id}`,
                model: provider.model,
              };
            }),
          );
        } else {
          setConnectionOpen(true);
        }
      })
      .catch((configError) => setError(safeClientError(configError)))
      .finally(() => setConfigLoading(false));
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  const workspaceConnections = useMemo<ConnectionRecord[]>(
    () =>
      providers
        .filter((provider) => provider.configured)
        .map((provider) => ({
          id: `workspace-${provider.id}`,
          provider: provider.id,
          name: `${provider.name} workspace`,
          source: "workspace",
          models: [{ id: provider.model, name: provider.model }],
        })),
    [providers],
  );
  const connections = useMemo(
    () => [...workspaceConnections, ...sessionConnections],
    [sessionConnections, workspaceConnections],
  );
  const connectionById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections],
  );
  const detectedProvider = inferProvider(draftKey);
  const effectiveProvider = providerChoice === "auto" ? detectedProvider : providerChoice;
  const editingConnection = editingConnectionId
    ? sessionConnections.find((connection) => connection.id === editingConnectionId)
    : undefined;

  const seats = useMemo<SeatRequest[]>(
    () =>
      seatDrafts.flatMap((seat) => {
        if (!seat.enabled || !seat.connectionId || !seat.model) return [];
        const connection = connectionById.get(seat.connectionId);
        return connection
          ? [{
              id: seat.id,
              connectionId: connection.id,
              provider: connection.provider,
              model: seat.model,
              role: seat.role,
            }]
          : [];
      }),
    [connectionById, seatDrafts],
  );
  const readySeatCount = seats.length;
  const targetSeatNumber = connectionTargetSeatId
    ? seatDrafts.findIndex((seat) => seat.id === connectionTargetSeatId) + 1
    : 0;
  const canStart =
    !configLoading &&
    !running &&
    objective.trim().length >= 8 &&
    seats.length >= 2 &&
    seats.length <= 3;
  const roomCompositionMatches = useMemo(
    () => participantsMatchSeats(currentParticipants, seats),
    [currentParticipants, seats],
  );

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

  useEffect(() => {
    if (!historyReady || !currentRoomId || iteration === 0 || transcript.length === 0) return;

    const record: MeetingRecord = {
      version: 1,
      id: currentRoomId,
      objective: objective.trim() || "Untitled meeting",
      stage: memo ? "decision" : "meeting",
      transcript,
      memo,
      decision,
      usage,
      iteration,
      participants: currentParticipants,
      ...(meetingState ? { meetingState } : {}),
      createdAt: currentRoomCreatedAt,
      updatedAt: new Date().toISOString(),
    };

    const timer = window.setTimeout(() => {
      const nextRecords = upsertMeetingRecord(meetingRecordsRef.current, record);
      meetingRecordsRef.current = nextRecords;
      setMeetingRecords(nextRecords);
      const store = roomStoreRef.current;
      if (!store) {
        setHistoryError("The local meeting database is unavailable.");
        return;
      }
      void store.putRoom(record)
        .then(() => setHistoryError(""))
        .catch(() => setHistoryError("This browser could not save the latest meeting record."));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [
    currentParticipants,
    currentRoomCreatedAt,
    currentRoomId,
    decision,
    historyReady,
    iteration,
    memo,
    meetingState,
    objective,
    transcript,
    usage,
  ]);

  function updateSeat(id: string, update: Partial<SeatDraft>) {
    if (running) return;
    setSeatDrafts((current) =>
      current.map((seat) => (seat.id === id ? { ...seat, ...update } : seat)),
    );
  }

  function chooseSeatConnection(seatId: string, connectionId: string) {
    if (connectionId === "__add__") {
      openConnectionManager(seatId);
      return;
    }
    const connection = connectionById.get(connectionId);
    updateSeat(seatId, {
      connectionId,
      model: connection ? defaultSeatModel(connection) : "",
    });
  }

  function assignConnectionToTarget(connection: ConnectionRecord) {
    if (!connectionTargetSeatId) return;
    setSeatDrafts((current) =>
      current.map((seat) =>
        seat.id === connectionTargetSeatId
          ? {
              ...seat,
              enabled: true,
              connectionId: connection.id,
              model: defaultSeatModel(connection),
            }
          : seat,
      ),
    );
    setFocusedConnectionId(connection.id);
  }

  function resetConnectionBuilder() {
    setEditingConnectionId(null);
    setProviderChoice("auto");
    setDraftName("");
    setDraftKey("");
  }

  function openConnectionManager(seatId?: string, connectionId?: string) {
    setConnectionTargetSeatId(seatId ?? null);
    setFocusedConnectionId(connectionId ?? null);
    setPendingDisconnectId(null);
    setConnectionError("");
    resetConnectionBuilder();
    setConnectionOpen(true);
  }

  function closeConnectionManager() {
    setConnectionOpen(false);
    setConnectionTargetSeatId(null);
    setFocusedConnectionId(null);
    setPendingDisconnectId(null);
    setConnectionError("");
    resetConnectionBuilder();
  }

  function beginKeyReplacement(connection: ConnectionRecord) {
    if (connection.source !== "session") return;
    setEditingConnectionId(connection.id);
    setFocusedConnectionId(connection.id);
    setProviderChoice(connection.provider);
    setDraftName(connection.name);
    setDraftKey("");
    setPendingDisconnectId(null);
    setConnectionError("");
  }

  async function verifyConnection(provider: ProviderId, apiKey: string) {
    const response = await fetch("/api/connections/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey }),
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      provider?: ProviderId;
      models?: ModelOption[];
    };
    if (!response.ok || body.provider !== provider || !Array.isArray(body.models)) {
      throw new Error(body.error ?? `Connection verification failed (${response.status}).`);
    }
    return body.models;
  }

  function updateConnectionModels(connectionId: string, models: ModelOption[]) {
    setSessionConnections((current) =>
      current.map((connection) =>
        connection.id === connectionId ? { ...connection, models } : connection,
      ),
    );
    setSeatDrafts((current) =>
      current.map((seat) => {
        if (seat.connectionId !== connectionId) return seat;
        const modelStillAvailable = models.some((model) => model.id === seat.model);
        return modelStillAvailable
          ? seat
          : { ...seat, model: models.length === 1 ? models[0].id : "" };
      }),
    );
  }

  async function saveConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnectionError("");
    const apiKey = draftKey.trim();
    if (!effectiveProvider) {
      setConnectionError("This key prefix is ambiguous. Choose its API provider first.");
      return;
    }
    if (apiKey.length < 8 || apiKey.length > 512 || /\s/.test(apiKey)) {
      setConnectionError("The API key does not look complete.");
      return;
    }
    setDiscoveringModels(true);
    try {
      const models = await verifyConnection(effectiveProvider, apiKey);
      if (editingConnection) {
        const replacement: ConnectionRecord = {
          ...editingConnection,
          name: draftName.trim() || editingConnection.name,
          apiKey,
          models,
        };
        setSessionConnections((current) =>
          current.map((connection) =>
            connection.id === replacement.id ? replacement : connection,
          ),
        );
        setSeatDrafts((current) =>
          current.map((seat) => {
            if (seat.connectionId !== replacement.id) return seat;
            const modelStillAvailable = models.some((model) => model.id === seat.model);
            return modelStillAvailable
              ? seat
              : { ...seat, model: defaultSeatModel(replacement) };
          }),
        );
        resetConnectionBuilder();
        return;
      }
      const ordinal = sessionConnections.filter(
        (connection) => connection.provider === effectiveProvider,
      ).length + 1;
      const connection: ConnectionRecord = {
        id: createConnectionId(effectiveProvider),
        provider: effectiveProvider,
        name: draftName.trim() || `${providerUi[effectiveProvider].label} ${ordinal}`,
        source: "session",
        apiKey,
        models,
      };
      setSessionConnections((current) => [...current, connection]);
      setSeatDrafts((current) => {
        const firstOpen = current.find((seat) => seat.enabled && !seat.connectionId)?.id;
        const targetSeatId = connectionTargetSeatId ?? firstOpen;
        return current.map((seat) =>
          seat.id === targetSeatId
            ? {
                ...seat,
                enabled: true,
                connectionId: connection.id,
                model: defaultSeatModel(connection),
              }
            : seat,
        );
      });
      setFocusedConnectionId(connection.id);
      setConnectionTargetSeatId(null);
      resetConnectionBuilder();
    } catch (connectionFailure) {
      setConnectionError(safeClientError(connectionFailure));
    } finally {
      setDiscoveringModels(false);
    }
  }

  async function reloadConnectionModels(connection: ConnectionRecord) {
    if (connection.source !== "session" || !connection.apiKey || loadingConnectionId) return;
    setConnectionError("");
    setLoadingConnectionId(connection.id);
    setFocusedConnectionId(connection.id);
    try {
      const models = await verifyConnection(connection.provider, connection.apiKey);
      updateConnectionModels(connection.id, models);
    } catch (reloadFailure) {
      setConnectionError(safeClientError(reloadFailure));
    } finally {
      setLoadingConnectionId(null);
    }
  }

  function removeSessionConnection(connectionId: string) {
    setSessionConnections((current) => current.filter((item) => item.id !== connectionId));
    setSeatDrafts((current) =>
      current.map((seat) =>
        seat.connectionId === connectionId ? { ...seat, connectionId: "", model: "" } : seat,
      ),
    );
    if (editingConnectionId === connectionId) resetConnectionBuilder();
    if (focusedConnectionId === connectionId) setFocusedConnectionId(null);
    setPendingDisconnectId(null);
  }

  async function persistMeetingRecord(record: MeetingRecord) {
    const nextRecords = upsertMeetingRecord(meetingRecordsRef.current, record);
    meetingRecordsRef.current = nextRecords;
    setMeetingRecords(nextRecords);
    const store = roomStoreRef.current;
    if (!store) {
      setHistoryError("The local meeting database is unavailable.");
      return;
    }
    try {
      await store.putRoom(record);
      setHistoryError("");
    } catch {
      setHistoryError("This browser could not update meeting history.");
    }
  }

  async function saveCurrentMeetingNow() {
    if (!historyReady || !currentRoomId || iteration === 0 || transcript.length === 0) return;
    await persistMeetingRecord({
      version: 1,
      id: currentRoomId,
      objective: objective.trim() || "Untitled meeting",
      stage: memo ? "decision" : "meeting",
      transcript,
      memo,
      decision,
      usage,
      iteration,
      participants: currentParticipants,
      ...(meetingState ? { meetingState } : {}),
      createdAt: currentRoomCreatedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async function openMeetingRecord(roomId: string) {
    if (running) return;
    await saveCurrentMeetingNow();
    const record = meetingRecordsRef.current.find((item) => item.id === roomId);
    if (!record) return;

    setCurrentRoomId(record.id);
    setCurrentRoomCreatedAt(record.createdAt);
    setCurrentParticipants(record.participants);
    setObjective(record.objective);
    setTranscript(record.transcript);
    setMemo(record.memo);
    setDecision(record.decision);
    setUsage(record.usage);
    setIteration(record.iteration);
    meetingStateRef.current = record.meetingState ?? null;
    setMeetingState(record.meetingState ?? null);
    setPhase(record.memo ? decisionLabel(record.decision) : "Saved meeting");
    setPhaseKey(latestPhase(record.transcript));
    setPinnedMessageId(null);
    setTranscriptMode(record.memo ? "overview" : "focus");
    setError("");
    setStage(record.memo ? "decision" : "meeting");
    setPendingDeleteRoomId(null);
    setHistoryOpen(false);
  }

  async function deleteMeetingRecord(roomId: string) {
    if (running && currentRoomId === roomId) return;
    const store = roomStoreRef.current;
    if (!store) {
      setHistoryError("The local meeting database is unavailable.");
      return;
    }
    try {
      await store.deleteRoom(roomId);
      const nextRecords = meetingRecordsRef.current.filter((item) => item.id !== roomId);
      meetingRecordsRef.current = nextRecords;
      setMeetingRecords(nextRecords);
      setHistoryError("");
      setPendingDeleteRoomId(null);
      if (currentRoomId === roomId) await createNewMeeting(false);
    } catch {
      setHistoryError("This browser could not delete the meeting record.");
    }
  }

  async function createNewMeeting(preserveCurrent = true) {
    if (running) return;
    if (preserveCurrent) await saveCurrentMeetingNow();
    const now = new Date().toISOString();
    setCurrentRoomId(createRoomId());
    setCurrentRoomCreatedAt(now);
    setCurrentParticipants([]);
    setObjective("");
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    setIteration(0);
    meetingStateRef.current = null;
    setMeetingState(null);
    setPhase("Awaiting agenda");
    setPhaseKey("agenda");
    setError("");
    setPinnedMessageId(null);
    setTranscriptMode("focus");
    setStage("agenda");
    setPendingDeleteRoomId(null);
    setHistoryOpen(false);
  }

  async function submitMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    if (iteration > 0) {
      await saveCurrentMeetingNow();
      const now = new Date().toISOString();
      setCurrentRoomId(createRoomId());
      setCurrentRoomCreatedAt(now);
    }
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    meetingStateRef.current = null;
    setMeetingState(null);
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
      const initialState = createInitialMeetingState(objective.trim());
      meetingStateRef.current = initialState;
      setMeetingState(initialState);
      setCurrentParticipants(
        seats.map((seat) => {
          const connection = connectionById.get(seat.connectionId);
          return {
            provider: seat.provider,
            providerName: connection?.name ?? providerUi[seat.provider].label,
            model: seat.model,
            role: seat.role,
          };
        }),
      );
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
        const connection = connectionById.get(seat.connectionId);
        return connection?.source === "session" && connection.apiKey
          ? [[connection.id, { provider: connection.provider, apiKey: connection.apiKey }]]
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
          ...(nextIteration === 2 && meetingStateRef.current
            ? { meetingState: meetingStateRef.current }
            : {}),
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
      const interruptionMessage = controller.signal.aborted
        ? "This turn was stopped by the Human Chair."
        : "This turn was interrupted before completion.";
      setTranscript((current) =>
        current.map((item) =>
          item.status === "streaming"
            ? {
                ...item,
                status: "error",
                text: item.text || interruptionMessage,
              }
            : item,
        ),
      );
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
      setTranscript((current) => [
        ...current,
        {
          id: event.id,
          provider: event.provider,
          providerName: event.connectionName,
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
      const currentState =
        meetingStateRef.current ?? createInitialMeetingState(objective.trim() || "Untitled meeting");
      const reduction = reduceTurnEnvelope(currentState, {
        id: event.id,
        sourceMessageId: event.id,
        seatId: event.seatId,
        round: event.round,
        phase: event.phase,
        envelope: event.envelope,
        usage: event.usage,
      });
      if (!reduction.ok) {
        setError(`Structured state rejected this turn: ${reduction.error.message}`);
        setTranscript((current) =>
          current.map((item) =>
            item.id === event.id
              ? {
                  ...item,
                  text: event.envelope.statement,
                  status: "error",
                  envelope: event.envelope,
                  reductionError: reduction.error.message,
                  usage: event.usage,
                }
              : item,
          ),
        );
        return;
      }
      meetingStateRef.current = reduction.state;
      setMeetingState(reduction.state);
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                text: event.envelope.statement,
                status: "done",
                envelope: event.envelope,
                usage: event.usage,
              }
            : item,
        ),
      );
      return;
    }
    if (event.type === "agent.format_error") {
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                status: "error",
                formatError: event.message,
                text: item.text || `This seat returned an invalid Turn Envelope: ${event.message}`,
              }
            : item,
        ),
      );
      return;
    }
    if (event.type === "agent.reduction_error") {
      setTranscript((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                text: event.envelope.statement,
                status: "error",
                envelope: event.envelope,
                reductionError: event.message,
                usage: event.usage,
              }
            : item,
        ),
      );
      setError(`Structured state rejected this turn: ${event.message}`);
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

  async function resetRoom() {
    if (running) return;
    await saveCurrentMeetingNow();
    setTranscript([]);
    setMemo("");
    setUsage(emptyUsage);
    setDecision("waiting");
    setIteration(0);
    meetingStateRef.current = null;
    setMeetingState(null);
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
          <button type="button" className={readySeatCount >= 2 ? "complete" : "active"} onClick={() => openConnectionManager()}>
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
          <button className="quiet-button meeting-history-button" type="button" onClick={() => setHistoryOpen(true)}>
            Meetings <span>{meetingRecords.length}</span>
          </button>
          <button className="quiet-button project-button" type="button" onClick={() => setProjectOpen(true)}>
            Project
          </button>
          <button className="connection-button" type="button" onClick={() => openConnectionManager()}>
            <span className={readySeatCount >= 2 ? "status-dot ready" : "status-dot"} />
            {connections.length} connection{connections.length === 1 ? "" : "s"}
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
              {readySeatCount < 2 && !configLoading ? (
                <button className="connection-callout" type="button" onClick={() => openConnectionManager()}>
                  Add one connection, then compose at least two model seats
                </button>
              ) : null}
              {error ? <p className="inline-error">{error}</p> : null}
            </section>

            <aside className="seat-composer">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Room composition</span>
                  <h2>{seats.length} seats ready</h2>
                </div>
                <button type="button" className="text-button" onClick={() => openConnectionManager()}>
                  Manage
                </button>
              </div>

              <div className="seat-list">
                {seatDrafts.map((seat, index) => {
                  const connection = connectionById.get(seat.connectionId);
                  const ui = connection ? providerUi[connection.provider] : null;
                  return (
                    <article className={`seat-row ${ui?.color ?? ""} ${seat.enabled ? "selected" : ""}`} key={seat.id}>
                      <div className="seat-selector">
                        <span className="avatar">{ui?.initial ?? index + 1}</span>
                        <span className="seat-identity">
                          <strong>Seat {index + 1}</strong>
                          <small>{connection ? `${connection.name} / ${seat.model || "Choose model"}` : "Choose a reusable connection"}</small>
                        </span>
                        <button
                          className={`seat-check ${seat.enabled ? "checked" : ""}`}
                          type="button"
                          onClick={() => updateSeat(seat.id, { enabled: !seat.enabled })}
                          aria-pressed={seat.enabled}
                          disabled={running}
                        >
                          {seat.enabled ? "On" : "Off"}
                        </button>
                      </div>
                      <div className="seat-fields">
                        <div className="seat-field">
                          <div className="field-label-row">
                            <label htmlFor={`${seat.id}-connection`}>Connection</label>
                            <button
                              type="button"
                              onClick={() => openConnectionManager(seat.id, connection?.id)}
                              disabled={running}
                            >
                              Manage
                            </button>
                          </div>
                          <select
                            id={`${seat.id}-connection`}
                            value={seat.connectionId}
                            onChange={(event) => chooseSeatConnection(seat.id, event.target.value)}
                            disabled={!seat.enabled || running}
                          >
                            <option value="">Choose connection</option>
                            {connections.map((item) => (
                              <option value={item.id} key={item.id}>
                                {item.name} · {providerUi[item.provider].label}
                              </option>
                            ))}
                            <option value="__add__">Add new connection…</option>
                          </select>
                        </div>
                        <label>
                          <span>Model</span>
                          <select
                            value={seat.model}
                            onChange={(event) => updateSeat(seat.id, { model: event.target.value })}
                            disabled={!seat.enabled || !connection || running}
                          >
                            {!connection ? <option value="">Choose connection first</option> : null}
                            {connection && connection.models.length > 1 ? <option value="">Choose model</option> : null}
                            {connection?.models.map((model) => (
                              <option value={model.id} key={model.id}>{modelOptionLabel(model)}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Role</span>
                        <select
                            value={seat.role}
                            onChange={(event) => updateSeat(seat.id, { role: event.target.value as RoleId })}
                            disabled={!seat.enabled || running}
                        >
                          {roleIds.map((role) => (
                            <option value={role} key={role}>{roleLabels[role]}</option>
                          ))}
                        </select>
                        </label>
                      </div>
                      <p>{roleBriefs[seat.role]}</p>
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
                  <button className="approve-button" type="button" onClick={() => setDecision("approved")} disabled={running || decision !== "pending"}>{decision === "approved" ? "Memo approved" : "Approve memo"}</button>
                  <button type="button" onClick={() => void runMeeting(2, memo)} disabled={running || decision !== "pending" || iteration !== 1 || !memo || !roomCompositionMatches}>Request revision</button>
                  <button className="reject-button" type="button" onClick={() => setDecision("rejected")} disabled={running || decision !== "pending"}>{decision === "rejected" ? "Memo rejected" : "Reject memo"}</button>
                </div>
                {decision === "pending" && iteration === 1 && !roomCompositionMatches ? (
                  <p className="revision-note">Reconnect seats with the original providers, models, and roles to request a revision.</p>
                ) : null}
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
              <button className="new-meeting-button" type="button" onClick={() => createNewMeeting()} disabled={running}>New meeting</button>
              {error ? <p className="inline-error">{error}</p> : null}
            </aside>
          </section>
        ) : null}
      </section>

      {historyOpen ? (
        <div className="modal-backdrop history-backdrop" role="presentation">
          <aside className="history-drawer" role="dialog" aria-modal="true" aria-labelledby="meeting-history-title">
            <header className="dialog-header">
              <div>
                <span className="section-kicker">Local meeting archive</span>
                <h2 id="meeting-history-title">Meetings</h2>
                <p>Rooms and audit events saved in this browser.</p>
              </div>
              <button type="button" className="quiet-button" onClick={() => setHistoryOpen(false)}>Close</button>
            </header>
            <div className="history-toolbar">
              <span>{meetingRecords.length} saved</span>
              <button className="primary-button" type="button" onClick={() => createNewMeeting()} disabled={running}>New meeting</button>
            </div>
            <div className="history-list">
              {meetingRecords.length === 0 ? (
                <div className="empty-history">
                  <strong>No meeting records yet</strong>
                  <span>Your first meeting will appear here as soon as it starts.</span>
                </div>
              ) : meetingRecords.map((record) => {
                const deletePending = pendingDeleteRoomId === record.id;
                return (
                  <article className={`history-row ${currentRoomId === record.id ? "active" : ""}`} key={record.id}>
                    <button
                      className="history-record-button"
                      type="button"
                      onClick={() => openMeetingRecord(record.id)}
                      disabled={running}
                      aria-current={currentRoomId === record.id ? "page" : undefined}
                    >
                      <span className={`history-status ${record.decision}`} />
                      <span className="history-record-copy">
                        <strong>{record.objective}</strong>
                        <small>{formatRoomDate(record.updatedAt)} · {record.participants.length} seats · {meetingRecordStatus(record)}</small>
                      </span>
                    </button>
                    <div className="history-row-actions">
                      {deletePending ? (
                        <>
                          <span>Delete this record?</span>
                          <button className="history-delete-confirm" type="button" onClick={() => deleteMeetingRecord(record.id)}>Delete</button>
                          <button type="button" onClick={() => setPendingDeleteRoomId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setPendingDeleteRoomId(record.id)} disabled={running && currentRoomId === record.id}>Delete</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <footer className="history-footer">
              <strong>Credentials are excluded.</strong>
              <span>API keys and session connections still clear on refresh. Account sync, export, and cloud recovery are not implemented yet.</span>
              {historyError ? <em>{historyError}</em> : null}
            </footer>
          </aside>
        </div>
      ) : null}

      {connectionOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="connection-dialog" role="dialog" aria-modal="true" aria-labelledby="connections-title">
            <header className="dialog-header">
              <div>
                <span className="section-kicker">Setup / Connection library</span>
                <h2 id="connections-title">{targetSeatNumber ? `Manage Seat ${targetSeatNumber}` : "API connections"}</h2>
                <p>{targetSeatNumber ? "Choose an existing connection or add a new one for this seat." : "Add and manage reusable provider connections in one place."}</p>
              </div>
              <button type="button" className="quiet-button" onClick={closeConnectionManager}>Close</button>
            </header>

            <div className="privacy-note">
              <strong>Session-only BYOK</strong>
              <span>Sent only to this site&apos;s meeting endpoint for immediate provider calls. Never placed in URLs, transcripts, or browser storage.</span>
            </div>

            <form className="connection-builder" onSubmit={saveConnection}>
              <label>
                <span>Connection name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder={editingConnection?.name ?? "Optional nickname"}
                  maxLength={60}
                  disabled={discoveringModels}
                />
              </label>
              <label>
                <span>API provider</span>
                <select
                  value={providerChoice}
                  onChange={(event) => setProviderChoice(event.target.value as ProviderChoice)}
                  disabled={discoveringModels || Boolean(editingConnection)}
                >
                  <option value="auto">Auto-detect when possible</option>
                  {providerIds.map((provider) => (
                    <option value={provider} key={provider}>{providerUi[provider].label}</option>
                  ))}
                </select>
              </label>
              <label className="key-field">
                <span>{editingConnection ? "Replacement API key" : "API key"}</span>
                <input
                  type="password"
                  value={draftKey}
                  onChange={(event) => setDraftKey(event.target.value)}
                  placeholder={effectiveProvider ? providerUi[effectiveProvider].keyHint : "Paste provider API key"}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={discoveringModels}
                />
              </label>
              <div className="connection-builder-actions">
                <button className="primary-button" type="submit" disabled={discoveringModels || draftKey.trim().length < 8}>
                  {discoveringModels ? "Loading models..." : editingConnection ? "Verify replacement" : "Verify & add"}
                </button>
                {editingConnection ? <button className="text-button" type="button" onClick={resetConnectionBuilder}>Cancel</button> : null}
              </div>
              <small className={effectiveProvider ? "detection-note detected" : "detection-note"}>
                {editingConnection
                  ? "The current key stays active unless this replacement verifies successfully."
                  : providerChoice !== "auto"
                  ? `${providerUi[providerChoice].label} selected manually`
                  : effectiveProvider
                    ? `${providerUi[effectiveProvider].label} detected from key format`
                    : "Unknown formats stay local until you choose a provider"}
              </small>
            </form>

            <div className="connection-list">
              {connections.length === 0 ? (
                <div className="empty-connections">
                  <strong>No verified connections yet</strong>
                  <span>One connection can power several seats and models.</span>
                </div>
              ) : connections.map((connection) => {
                const ui = providerUi[connection.provider];
                const usedSeats = seatDrafts.flatMap((seat, index) =>
                  seat.connectionId === connection.id ? [`Seat ${index + 1}`] : [],
                );
                const disconnectPending = pendingDisconnectId === connection.id;
                return (
                  <section className={`connection-row ${ui.color} ${focusedConnectionId === connection.id ? "focused" : ""}`} key={connection.id}>
                    <div className="connection-identity">
                      <span className="avatar">{ui.initial}</span>
                      <span>
                        <strong>{connection.name}</strong>
                        <small>{connection.source === "session" ? "Verified for this page" : "Managed by workspace"}</small>
                      </span>
                    </div>
                    <div className="connection-model-summary">
                      <strong>{connection.models.length}</strong>
                      <span>available model{connection.models.length === 1 ? "" : "s"}</span>
                      <small>{usedSeats.length ? `Used by ${usedSeats.join(", ")}` : "Not assigned to a seat"}</small>
                    </div>
                    <span className="billing-owner">Billed by {ui.label}</span>
                    {disconnectPending ? (
                      <div className="disconnect-confirm">
                        <span>{usedSeats.length ? `Unassign ${usedSeats.join(", ")}?` : "Remove this connection?"}</span>
                        <button className="disconnect-button" type="button" onClick={() => removeSessionConnection(connection.id)}>Confirm</button>
                        <button className="text-button" type="button" onClick={() => setPendingDisconnectId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="connection-actions">
                        {targetSeatNumber ? (
                          <button
                            type="button"
                            onClick={() => assignConnectionToTarget(connection)}
                            disabled={seatDrafts[targetSeatNumber - 1]?.connectionId === connection.id}
                          >
                            {seatDrafts[targetSeatNumber - 1]?.connectionId === connection.id ? "Selected" : `Use for Seat ${targetSeatNumber}`}
                          </button>
                        ) : null}
                        {connection.source === "session" ? (
                          <>
                            <button type="button" onClick={() => void reloadConnectionModels(connection)} disabled={Boolean(loadingConnectionId)}>
                              {loadingConnectionId === connection.id ? "Reloading…" : "Reload models"}
                            </button>
                            <button type="button" onClick={() => beginKeyReplacement(connection)}>Replace key</button>
                            <button className="disconnect-button" type="button" onClick={() => setPendingDisconnectId(connection.id)}>Disconnect</button>
                          </>
                        ) : <span className="managed-label">Workspace managed</span>}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
            {connectionError ? <p className="inline-error">{connectionError}</p> : null}
            <footer className="dialog-footer">
              <span>{readySeatCount}/3 seats ready · keys clear on refresh</span>
              <button className="primary-button" type="button" onClick={closeConnectionManager}>Done</button>
            </footer>
          </section>
        </div>
      ) : null}

      {projectOpen ? (
        <div className="modal-backdrop project-backdrop" role="presentation">
          <aside className="project-drawer" role="dialog" aria-modal="true" aria-labelledby="project-title">
            <header className="dialog-header">
              <div><span className="section-kicker">Project truth / v0.6</span><h2 id="project-title">Build the protocol, not a model carousel</h2></div>
              <button type="button" className="quiet-button" onClick={() => setProjectOpen(false)}>Close</button>
            </header>
            <p className="project-thesis">The room verifies session connections, reuses them across provider-neutral seats, and keeps a local archive of completed meeting content. Account sync, evidence verification, durable BYOK, custom endpoints, and execution remain future work.</p>
            <div className="milestone-stack">
              {milestones.map(([id, title, detail], index) => (
                <article className={index === 1 || index === 3 ? "current" : ""} key={id}>
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

function createRoomId() {
  return `meeting-${createRequestId()}`;
}

function participantsMatchSeats(participants: ParticipantSnapshot[], seats: SeatRequest[]) {
  if (participants.length < 2 || participants.length !== seats.length) return false;
  const participantKeys = participants
    .map((item) => `${item.provider}\u0000${item.model}\u0000${item.role}`)
    .sort();
  const seatKeys = seats
    .map((item) => `${item.provider}\u0000${item.model}\u0000${item.role}`)
    .sort();
  return participantKeys.every((key, index) => key === seatKeys[index]);
}

function latestPhase(transcript: TranscriptItem[]) {
  return transcript.at(-1)?.phase ?? "agenda";
}

function formatRoomDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved meeting";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function meetingRecordStatus(record: MeetingRecord) {
  if (record.decision === "approved") return "Approved";
  if (record.decision === "rejected") return "Rejected";
  if (record.memo) return "Decision pending";
  return "Meeting saved";
}

function createConnectionId(provider: ProviderId) {
  const suffix = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `session-${provider}-${suffix}`;
}

function inferProvider(apiKey: string): ProviderId | null {
  const value = apiKey.trim();
  if (/^sk-ant-/i.test(value)) return "anthropic";
  if (/^AIza/.test(value)) return "gemini";
  if (/^sk-(?:proj-|svcacct-|admin-|[a-zA-Z0-9])/i.test(value)) return "openai";
  return null;
}

function defaultSeatModel(connection: ConnectionRecord) {
  return connection.models.length === 1 ? connection.models[0].id : "";
}

function modelOptionLabel(model: ModelOption) {
  return model.name === model.id ? model.id : `${model.name} · ${model.id}`;
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
