"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PlanView } from "./plan-view";
import { PlanAmendmentPanel } from "./plan-amendment";
import { modelRevisedPlan, planDecisionReady, validPlanConcernSelection, preparePlanRecovery } from "../lib/plan-artifact";
import { PlanDayEditor } from "./plan-day-editor";
import { createPlanHumanRevision, missingPlanDays, parsePlanArtifact, parsePlanApproval, parsePlanRequest, planReady, planBrief, planText, planLimits, revisedPlan, type PlanArtifact, type PlanApproval, type PlanHumanRevision, type PlanDay } from "../lib/plan-artifact";
import {
  AgentProgress,
  DiscussEvent,
  ObserverRequest,
  providerIds,
  ProviderId,
  ProviderSummary,
  ReplayCostEstimate,
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
  ObserverSnapshot,
  parseReviewTaskInput,
  ParticipantSnapshot,
  reviewTaskLimits,
  ReviewTaskInput,
  TaskMode,
  TranscriptItem,
  upsertMeetingRecord,
} from "../lib/meeting-record";
import { createBrowserRoomStore, RoomStore } from "../lib/room-store";
import { inferProviderFromApiKey } from "../lib/provider-key-detection";
import {
  addChairFindingByChair,
  appendChairDirective,
  ChairDirective,
  ClaimDecision,
  createInitialMeetingState,
  decideClaimByChair,
  MeetingState,
  reduceTurnEnvelope,
  ReviewFindingSourceKind,
} from "../lib/meeting-state";
import {
  appendProcessReport,
  activeTargetedDebate,
  beginObserverTransition,
  beginProtocolTransition,
  beginTargetedDebateRound,
  completeProtocolTransition,
  completeObserverTransition,
  continueProtocol,
  ControlMode,
  createArtifactFirstProtocolState,
  createDefaultMeetingBudget,
  createMeetingProtocolState,
  createProcessReport,
  evaluateMeetingBudget,
  finishProtocol,
  interruptProtocolTransition,
  latestProcessReport as findLatestProcessReport,
  MeetingProtocolState,
  pauseProtocolAtSafeBoundary,
  runnablePhase,
  routeSeatsForDispute,
  stopProtocol,
} from "../lib/meeting-orchestrator";
import {
  buildReviewExecutiveBrief,
  createReviewApprovedArtifact,
  createReviewHumanRevision,
  prepareKeptOriginalReview,
  ReviewApprovedArtifact,
  ReviewArtifactResult,
  ReviewEditCheckpoint,
  ReviewHumanRevision,
  selectReviewArtifactSeatIds,
  validateReviewFindingSource,
} from "../lib/review-artifact";
import ReplayReceipt from "./replay-receipt";

type WorkspaceStage = "agenda" | "meeting" | "decision";
type TranscriptMode = "focus" | "overview";
type ProviderChoice = ProviderId | "auto";
type ReviewResultView = "artifact" | "changes" | "verification" | "brief";

type ReviewReplayResult = {
  ok: boolean;
  stage: "review_verifier" | "review_baseline";
  fixtureVersion: number;
  provider: ProviderId;
  model: string;
  diagnostic?: string;
  rawOutput: string;
  usage: UsageSummary | null;
  verification?: ReviewArtifactResult["verification"];
  caseId?: string;
  requestId?: string;
  outputAtCap?: boolean;
  costEstimate?: ReplayCostEstimate;
};

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

type ObserverDraft = {
  enabled: boolean;
  connectionId: string;
  model: string;
};

const defaultObjective = "Review Artifact v1 against the supplied references and truth constraints";

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
  ["M2.10", "Bounded progress", "Deterministic budgets are live; Observer and targeted debate remain."],
  ["M3.5", "Research", "Sources, evidence checks, and freshness."],
  ["M4.5", "Execute", "Bounded tools, coding agents, and independent review."],
];

export default function Home() {
  const [objective, setObjective] = useState(defaultObjective);
  const [taskMode, setTaskMode] = useState<TaskMode>("review");
  const [reviewArtifact, setReviewArtifact] = useState("");
  const [reviewReferences, setReviewReferences] = useState("");
  const [reviewTruthConstraints, setReviewTruthConstraints] = useState("");
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [sessionConnections, setSessionConnections] = useState<ConnectionRecord[]>([]);
  const [seatDrafts, setSeatDrafts] = useState<SeatDraft[]>(initialSeatDrafts);
  const [observerDraft, setObserverDraft] = useState<ObserverDraft>({
    enabled: false,
    connectionId: "",
    model: "",
  });
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
  const [currentObserver, setCurrentObserver] = useState<ObserverSnapshot | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [replayConnectionId, setReplayConnectionId] = useState("");
  const [replayModelId, setReplayModelId] = useState("");
  const [replayKind, setReplayKind] = useState<"review_verifier_v1" | "review_baseline_resume_v1">("review_verifier_v1");
  const [replayRunning, setReplayRunning] = useState(false);
  const [replayError, setReplayError] = useState("");
  const [replayResult, setReplayResult] = useState<ReviewReplayResult | null>(null);
  const [stage, setStage] = useState<WorkspaceStage>("agenda");
  const [transcriptMode, setTranscriptMode] = useState<TranscriptMode>("focus");
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [liveMessageId, setLiveMessageId] = useState<string | null>(null);
  const [followLive, setFollowLive] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [phase, setPhase] = useState("Awaiting agenda");
  const [phaseKey, setPhaseKey] = useState<"agenda" | "proposal" | "review" | "synthesis">(
    "agenda",
  );
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [memo, setMemo] = useState("");
  const [reviewEditCheckpoint, setReviewEditCheckpoint] = useState<ReviewEditCheckpoint | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewArtifactResult | null>(null);
  const [planEnabled, setPlanEnabled] = useState(false);
  const [planSettings, setPlanSettings] = useState({ days: 12, dailyMeu: 10, dailyMinutes: 360 });
  const planRequest = useMemo(() => taskMode === "decide" && planEnabled ? parsePlanRequest(planSettings) : null, [taskMode, planEnabled, planSettings]);
  const [planArtifact, setPlanArtifact] = useState<PlanArtifact | null>(null);
  const [planApproval, setPlanApproval] = useState<PlanApproval | null>(null);
  const [planWork, setPlanWork] = useState<string | null>(null);
  const planRef = useRef<PlanArtifact | null>(null);
  const planApprovalRef = useRef<PlanApproval | null>(null);
  const [planHumanRevision, setPlanHumanRevision] = useState<PlanHumanRevision | null>(null);
  const planHumanRevisionRef = useRef<PlanHumanRevision | null>(null);
  const [editingPlanDay, setEditingPlanDay] = useState<PlanDay | null>(null);
  const [lastEditedPlanDay, setLastEditedPlanDay] = useState(1);
  const [planSaving, setPlanSaving] = useState(false);
  const planSavingRef = useRef(false);
  const [reviewHumanRevision, setReviewHumanRevision] = useState<ReviewHumanRevision | null>(null);
  const [reviewApprovedArtifact, setReviewApprovedArtifact] = useState<ReviewApprovedArtifact | null>(null);
  const [reviewResultView, setReviewResultView] = useState<ReviewResultView>("artifact");
  const [editingReviewChangeId, setEditingReviewChangeId] = useState("");
  const [reviewChangeDraft, setReviewChangeDraft] = useState("");
  const [reviewWork, setReviewWork] = useState<{
    stage: "editing" | "verifying";
    progress: AgentProgress;
    label: string;
  } | null>(null);
  const [decision, setDecision] = useState<DecisionStatus>("waiting");
  const [usage, setUsage] = useState<UsageSummary>(emptyUsage);
  const [meetingState, setMeetingState] = useState<MeetingState | null>(null);
  const [protocolState, setProtocolState] = useState<MeetingProtocolState | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("checkpoints");
  const [maxRounds, setMaxRounds] = useState(2);
  const [directiveKind, setDirectiveKind] = useState<ChairDirective["kind"]>("constraint");
  const [directiveTarget, setDirectiveTarget] = useState("all");
  const [directiveText, setDirectiveText] = useState("");
  const [chairFindingOpen, setChairFindingOpen] = useState(false);
  const [chairFindingText, setChairFindingText] = useState("");
  const [chairFindingSourceKind, setChairFindingSourceKind] = useState<ReviewFindingSourceKind>("truth_constraint");
  const [chairFindingExcerpt, setChairFindingExcerpt] = useState("");
  const [chairFindingTargetId, setChairFindingTargetId] = useState("");
  const [raiseHandRequested, setRaiseHandRequested] = useState(false);
  const [observerProgress, setObserverProgress] = useState<AgentProgress | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const liveTextRef = useRef<HTMLDivElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const meetingRecordsRef = useRef<MeetingRecord[]>([]);
  const roomStoreRef = useRef<RoomStore | null>(null);
  const meetingStateRef = useRef<MeetingState | null>(null);
  const protocolStateRef = useRef<MeetingProtocolState | null>(null);
  const transcriptRef = useRef<TranscriptItem[]>([]);
  const usageRef = useRef<UsageSummary>(emptyUsage);
  const memoRef = useRef("");
  const reviewEditCheckpointRef = useRef<ReviewEditCheckpoint | null>(null);
  const reviewResultRef = useRef<ReviewArtifactResult | null>(null);
  const reviewHumanRevisionRef = useRef<ReviewHumanRevision | null>(null);
  const reviewApprovedArtifactRef = useRef<ReviewApprovedArtifact | null>(null);
  const decisionRef = useRef<DecisionStatus>("waiting");
  const currentParticipantsRef = useRef<ParticipantSnapshot[]>([]);
  const currentObserverRef = useRef<ObserverSnapshot | null>(null);
  const currentRoomIdRef = useRef("");
  const currentRoomCreatedAtRef = useRef("");
  const raiseHandRef = useRef(false);
  const keepingOriginalRef = useRef(false);

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
        setCurrentRoomId((current) => {
          const next = current || createRoomId();
          currentRoomIdRef.current = next;
          return next;
        });
        setCurrentRoomCreatedAt((current) => {
          const next = current || now;
          currentRoomCreatedAtRef.current = next;
          return next;
        });
        setHistoryError("");
        setHistoryReady(true);
      })
      .catch((storeError) => {
        if (!active) return;
        const now = new Date().toISOString();
        setCurrentRoomId((current) => {
          const next = current || createRoomId();
          currentRoomIdRef.current = next;
          return next;
        });
        setCurrentRoomCreatedAt((current) => {
          const next = current || now;
          currentRoomCreatedAtRef.current = next;
          return next;
        });
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
  const detectedProvider = inferProviderFromApiKey(draftKey);
  const effectiveProvider = providerChoice === "auto" ? detectedProvider : providerChoice;
  const editingConnection = editingConnectionId
    ? sessionConnections.find((connection) => connection.id === editingConnectionId)
    : undefined;
  const replayConnection = connectionById.get(replayConnectionId) ?? connections[0];
  const effectiveReplayModel = replayConnection?.models.some((model) => model.id === replayModelId)
    ? replayModelId
    : replayConnection?.models[0]?.id ?? "";

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
  const observerRequest = useMemo<ObserverRequest | null>(() => {
    if (!observerDraft.enabled || !observerDraft.connectionId || !observerDraft.model) return null;
    const connection = connectionById.get(observerDraft.connectionId);
    if (!connection) return null;
    return {
      connectionId: connection.id,
      provider: connection.provider,
      model: observerDraft.model,
    };
  }, [connectionById, observerDraft]);
  const observerReady = !observerDraft.enabled || Boolean(observerRequest);
  const reviewInput = useMemo<ReviewTaskInput | null>(
    () => parseReviewTaskInput({
      artifact: reviewArtifact,
      references: reviewReferences,
      truthConstraints: reviewTruthConstraints,
    }),
    [reviewArtifact, reviewReferences, reviewTruthConstraints],
  );
  const readySeatCount = seats.length;
  const targetSeatNumber = connectionTargetSeatId
    ? seatDrafts.findIndex((seat) => seat.id === connectionTargetSeatId) + 1
    : 0;
  const canStart =
    !configLoading &&
    historyReady &&
    !running &&
    objective.trim().length >= 8 &&
    (taskMode !== "review" || Boolean(reviewInput)) &&
    (taskMode !== "decide" || !planEnabled || Boolean(planRequest)) &&
    seats.length >= 2 &&
    seats.length <= 3 &&
    observerReady;
  const maximumProviderCalls = seats.length >= 2
    ? planRequest
      ? 2
      : (seats.length * 2 + (taskMode === "review" ? 3 : 2) + (observerDraft.enabled ? 1 : 0)) * maxRounds
    : 0;
  const setupBudget = useMemo(
    () => {
      const base = createDefaultMeetingBudget(Math.max(2, seats.length), maxRounds, observerDraft.enabled);
      return planRequest ? createPlanBudget() : taskMode === "review"
        ? createReviewArtifactBudget(base, maxRounds)
        : createDecisionPackageBudget(base, maxRounds);
    },
    [maxRounds, observerDraft.enabled, seats.length, taskMode, planRequest],
  );
  const activeBudgetStatus = useMemo(
    () => protocolState ? evaluateMeetingBudget(protocolState, usage) : null,
    [protocolState, usage],
  );
  const latestProcessReport = protocolState?.processReports.at(-1);
  const latestRoundBrief = protocolState?.roundBriefs.at(-1);
  const openDisputes = useMemo(
    () => meetingState?.disputes.filter((dispute) => dispute.status === "open") ?? [],
    [meetingState],
  );
  const reviewFindings = useMemo(
    () => taskMode === "review"
      ? (meetingState?.claims ?? []).filter((claim) =>
          Boolean(claim.reviewSource) ||
          claim.sourceMessageIds.some((sourceId) =>
            transcript.some((turn) => turn.id === sourceId && turn.phase === "proposal"),
          ),
        )
      : [],
    [meetingState, taskMode, transcript],
  );
  const acceptedReviewFindings = reviewFindings.filter(
    (finding) => finding.status === "accepted_by_chair",
  );
  const reviewArtifactSeatIds = useMemo(
    () => selectReviewArtifactSeatIds(seats),
    [seats],
  );
  const displayedPlan = planApproval?.artifact ?? (planArtifact ? revisedPlan(planArtifact, planHumanRevision) : null);
  const savedPlanRecovery = planArtifact && protocolState && !planApproval ? preparePlanRecovery(planArtifact, protocolState) : null;
  const savedPlanRecoveryBudgetStatus = savedPlanRecovery
    ? evaluateMeetingBudget(savedPlanRecovery, usage, savedPlanRecovery.pendingSeatIds)
    : null;
  const savedPlanRecoveryUnavailable = savedPlanRecoveryBudgetStatus?.allowed === false;
  const savedPlanRecoveryLabel = savedPlanRecoveryUnavailable && savedPlanRecoveryBudgetStatus
    ? `Recovery unavailable · ${budgetStopLabel(savedPlanRecoveryBudgetStatus.reasons)}`
    : savedPlanRecovery
      ? `Resume saved plan (up to ${savedPlanRecovery.pendingSeatIds.length} calls)`
      : null;
  const planEditedDays = planHumanRevision?.days.map((day) => day.day) ?? [];
  const effectiveReviewArtifact = reviewHumanRevision?.artifactV3 ?? reviewResult?.artifactV2 ?? "";
  const effectiveReviewChanges = reviewHumanRevision?.changeSet ?? reviewResult?.changeSet ?? [];
  const displayedReviewArtifact = reviewApprovedArtifact?.artifact ?? effectiveReviewArtifact;
  const displayedReviewChanges = reviewApprovedArtifact?.changeSet ?? effectiveReviewChanges;
  const displayedReviewVersion = reviewApprovedArtifact?.artifactVersion ??
    reviewHumanRevision?.artifactVersion ?? reviewResult?.artifactVersion ?? 2;
  const selectedDispute = openDisputes.find((dispute) => dispute.id === selectedDisputeId) ?? openDisputes[0];
  const routedDebateSeatIds = selectedDispute && meetingState
    ? routeSeatsForDispute(meetingState, selectedDispute, seats.map((seat) => seat.id))
    : [];
  const roomCompositionMatches = useMemo(
    () => participantsMatchSeats(currentParticipants, seats) && observerMatches(
      protocolState,
      currentObserver,
      observerRequest,
      connectionById,
    ),
    [connectionById, currentObserver, currentParticipants, observerRequest, protocolState, seats],
  );

  const activeTranscriptItem = useMemo(() => {
    if (pinnedMessageId) {
      const pinned = transcript.find((item) => item.id === pinnedMessageId);
      if (pinned) return pinned;
    }
    return (
      transcript.find((item) => item.id === liveMessageId) ??
      [...transcript].reverse().find((item) => item.provider !== "host") ??
      transcript[0]
    );
  }, [liveMessageId, pinnedMessageId, transcript]);

  useEffect(() => {
    if (liveTextRef.current) liveTextRef.current.scrollTop = 0;
  }, [activeTranscriptItem?.id]);

  useEffect(() => {
    if (overviewRef.current && transcriptMode === "overview" && followLive) {
      overviewRef.current.scrollTop = overviewRef.current.scrollHeight;
    }
  }, [followLive, transcript, transcriptMode]);

  useEffect(() => {
    if (planSaving || !historyReady || !currentRoomId || iteration === 0 || transcript.length === 0) return;

    const record: MeetingRecord = {
      version: 1,
      id: currentRoomId,
      objective: objective.trim() || "Untitled meeting",
      taskMode,
      ...(taskMode === "review" && reviewInput ? { reviewInput } : {}),
      ...(reviewEditCheckpoint ? { reviewEditCheckpoint } : {}),
      ...(reviewResult ? { reviewResult } : {}),
      ...(planRequest ? { planRequest } : {}),
      ...(planArtifact ? { planArtifact } : {}),
      ...(planApproval ? { planApproval } : {}),
      ...(planHumanRevision ? { planHumanRevision } : {}),
      ...(reviewHumanRevision ? { reviewHumanRevision } : {}),
      ...(reviewApprovedArtifact ? { reviewApprovedArtifact } : {}),
      stage: memo ? "decision" : "meeting",
      transcript,
      memo,
      decision,
      usage,
      iteration,
      participants: currentParticipants,
      ...(currentObserver ? { observer: currentObserver } : {}),
      ...(meetingState ? { meetingState } : {}),
      ...(protocolState ? { protocolState } : {}),
      createdAt: currentRoomCreatedAt,
      updatedAt: new Date().toISOString(),
    };

    const timer = window.setTimeout(() => {
      if (planSavingRef.current) return;
      if (planArtifact !== planRef.current) return;
      if (planHumanRevision !== planHumanRevisionRef.current) return;
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
    currentObserver,
    currentRoomCreatedAt,
    currentRoomId,
    decision,
    historyReady,
    iteration,
    memo,
    meetingState,
    objective,
    protocolState,
    reviewInput,
    reviewEditCheckpoint,
    reviewHumanRevision,
    reviewApprovedArtifact,
    reviewResult,
    planRequest,
    planArtifact,
    planApproval,
    planHumanRevision,
    planSaving,
    taskMode,
    transcript,
    usage,
  ]);

  function updateTranscript(
    update: TranscriptItem[] | ((current: TranscriptItem[]) => TranscriptItem[]),
  ) {
    const next = typeof update === "function" ? update(transcriptRef.current) : update;
    transcriptRef.current = next;
    setTranscript(next);
  }

  function updateUsage(update: UsageSummary | ((current: UsageSummary) => UsageSummary)) {
    const next = typeof update === "function" ? update(usageRef.current) : update;
    usageRef.current = next;
    setUsage(next);
  }

  function updateMemo(next: string) {
    memoRef.current = next;
    setMemo(next);
  }

  function updateReviewResult(next: ReviewArtifactResult | null) {
    reviewResultRef.current = next;
    setReviewResult(next);
    if (next) setReviewResultView("artifact");
  }

  function updateReviewHumanRevision(next: ReviewHumanRevision | null) {
    reviewHumanRevisionRef.current = next;
    setReviewHumanRevision(next);
    setEditingReviewChangeId("");
    setReviewChangeDraft("");
  }

  function updateReviewApprovedArtifact(next: ReviewApprovedArtifact | null) {
    reviewApprovedArtifactRef.current = next;
    setReviewApprovedArtifact(next);
  }

  function updateReviewEditCheckpoint(next: ReviewEditCheckpoint | null) {
    reviewEditCheckpointRef.current = next;
    setReviewEditCheckpoint(next);
  }

  function updateDecision(next: DecisionStatus) {
    decisionRef.current = next;
    setDecision(next);
  }

  function updateParticipants(next: ParticipantSnapshot[]) {
    currentParticipantsRef.current = next;
    setCurrentParticipants(next);
  }

  function updateObserver(next: ObserverSnapshot | null) {
    currentObserverRef.current = next;
    setCurrentObserver(next);
  }

  function updateProtocol(next: MeetingProtocolState | null) {
    protocolStateRef.current = next;
    setProtocolState(next);
    if (next) setIteration(next.round);
  }

  function updatePlan(next: PlanArtifact | null) {
    planRef.current = next; setPlanArtifact(next);
    if (!next) { updatePlanHumanRevision(null); setEditingPlanDay(null); setLastEditedPlanDay(1); }
  }
  function updatePlanApproval(next: PlanApproval | null) { planApprovalRef.current = next; setPlanApproval(next); }
  function updatePlanHumanRevision(next: PlanHumanRevision | null) { planHumanRevisionRef.current = next; setPlanHumanRevision(next); }

  async function flushProtocolRecord(
    nextProtocol = protocolStateRef.current,
    nextMeetingState = meetingStateRef.current,
    artifactUpdate?: Pick<MeetingRecord, "reviewResult" | "memo" | "decision" | "stage" | "planHumanRevision" | "planArtifact">,
  ) {
    const roomId = currentRoomIdRef.current || currentRoomId;
    const createdAt = currentRoomCreatedAtRef.current || currentRoomCreatedAt;
    if (!historyReady || !roomId || transcriptRef.current.length === 0 || !nextProtocol) {
      throw new Error("The resumable room is not ready for durable storage.");
    }
    const record: MeetingRecord = {
      version: 1,
      id: roomId,
      objective: objective.trim() || "Untitled meeting",
      taskMode,
      ...(taskMode === "review" && reviewInput ? { reviewInput } : {}),
      ...(reviewEditCheckpointRef.current
        ? { reviewEditCheckpoint: reviewEditCheckpointRef.current }
        : {}),
      ...(reviewResultRef.current ? { reviewResult: reviewResultRef.current } : {}),
      ...(planRequest ? { planRequest } : {}),
      ...(planRef.current ? { planArtifact: planRef.current } : {}),
      ...(planApprovalRef.current ? { planApproval: planApprovalRef.current } : {}),
      ...(planHumanRevisionRef.current ? { planHumanRevision: planHumanRevisionRef.current } : {}),
      ...(reviewHumanRevisionRef.current
        ? { reviewHumanRevision: reviewHumanRevisionRef.current }
        : {}),
      ...(reviewApprovedArtifactRef.current
        ? { reviewApprovedArtifact: reviewApprovedArtifactRef.current }
        : {}),
      stage: memoRef.current ? "decision" : "meeting",
      transcript: transcriptRef.current,
      memo: memoRef.current,
      decision: decisionRef.current,
      usage: usageRef.current,
      iteration: nextProtocol.round,
      participants: currentParticipantsRef.current,
      ...(currentObserverRef.current ? { observer: currentObserverRef.current } : {}),
      ...(nextMeetingState ? { meetingState: nextMeetingState } : {}),
      protocolState: nextProtocol,
      createdAt,
      updatedAt: new Date().toISOString(),
      ...artifactUpdate,
    };
    const store = roomStoreRef.current;
    if (!store) throw new Error("The local meeting database is unavailable.");
    await store.putRoom(record);
    const nextRecords = upsertMeetingRecord(meetingRecordsRef.current, record);
    meetingRecordsRef.current = nextRecords;
    setMeetingRecords(nextRecords);
    setHistoryError("");
  }

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

  function chooseObserverConnection(connectionId: string) {
    if (connectionId === "__add__") {
      openConnectionManager();
      return;
    }
    const connection = connectionById.get(connectionId);
    setObserverDraft((current) => ({
      ...current,
      connectionId,
      model: connection ? defaultSeatModel(connection) : "",
    }));
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
    setObserverDraft((current) => {
      if (current.connectionId !== connectionId) return current;
      const modelStillAvailable = models.some((model) => model.id === current.model);
      return modelStillAvailable
        ? current
        : { ...current, model: models.length === 1 ? models[0].id : "" };
    });
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
        setObserverDraft((current) => {
          if (current.connectionId !== replacement.id) return current;
          const modelStillAvailable = models.some((model) => model.id === current.model);
          return modelStillAvailable
            ? current
            : { ...current, model: defaultSeatModel(replacement) };
        });
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

  async function runReviewReplay() {
    if (!replayConnection || !effectiveReplayModel || replayRunning) return;
    setReplayRunning(true);
    setReplayError("");
    setReplayResult(null);
    const replaySeat: SeatRequest = {
      id: "review-verifier-replay",
      connectionId: replayConnection.id,
      provider: replayConnection.provider,
      model: effectiveReplayModel,
      role: "critic",
    };
    try {
      const response = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageReplay: {
            kind: replayKind,
            connectionId: replayConnection.id,
            provider: replayConnection.provider,
            model: effectiveReplayModel,
          },
          connections: sessionConnectionPayload([replaySeat], connectionById),
          requestId: createRequestId(),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as ReviewReplayResult & { error?: string };
      if (!response.ok && !(result.stage === "review_baseline" && typeof result.rawOutput === "string")) {
        throw new Error(result.error ?? `Stage replay failed (${response.status}).`);
      }
      setReplayResult(result);
    } catch (replayFailure) {
      setReplayError(safeClientError(replayFailure));
    } finally {
      setReplayRunning(false);
    }
  }

  function downloadBaselineReceipt() {
    if (replayResult?.stage !== "review_baseline") return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(replayResult, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `review-s1-${replayResult.requestId}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  function removeSessionConnection(connectionId: string) {
    setSessionConnections((current) => current.filter((item) => item.id !== connectionId));
    setSeatDrafts((current) =>
      current.map((seat) =>
        seat.connectionId === connectionId ? { ...seat, connectionId: "", model: "" } : seat,
      ),
    );
    setObserverDraft((current) =>
      current.connectionId === connectionId
        ? { ...current, connectionId: "", model: "" }
        : current,
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
    if (planSavingRef.current) return;
    if (!historyReady || !currentRoomId || iteration === 0 || transcript.length === 0) return;
    await persistMeetingRecord({
      version: 1,
      id: currentRoomId,
      objective: objective.trim() || "Untitled meeting",
      taskMode,
      ...(taskMode === "review" && reviewInput ? { reviewInput } : {}),
      ...(reviewEditCheckpoint ? { reviewEditCheckpoint } : {}),
      ...(reviewResult ? { reviewResult } : {}),
      ...(planRequest ? { planRequest } : {}),
      ...(planArtifact ? { planArtifact } : {}),
      ...(planApproval ? { planApproval } : {}),
      ...(planHumanRevision ? { planHumanRevision } : {}),
      ...(reviewHumanRevision ? { reviewHumanRevision } : {}),
      ...(reviewApprovedArtifact ? { reviewApprovedArtifact } : {}),
      stage: memo ? "decision" : "meeting",
      transcript,
      memo,
      decision,
      usage,
      iteration,
      participants: currentParticipants,
      ...(currentObserver ? { observer: currentObserver } : {}),
      ...(meetingState ? { meetingState } : {}),
      ...(protocolState ? { protocolState } : {}),
      createdAt: currentRoomCreatedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async function openMeetingRecord(roomId: string) {
    if (editingPlanDay || planSavingRef.current) { setError("Save or cancel the day edit before switching meetings."); return; }
    if (running) return;
    await saveCurrentMeetingNow();
    const record = meetingRecordsRef.current.find((item) => item.id === roomId);
    if (!record) return;

    setCurrentRoomId(record.id);
    currentRoomIdRef.current = record.id;
    setCurrentRoomCreatedAt(record.createdAt);
    currentRoomCreatedAtRef.current = record.createdAt;
    updateParticipants(record.participants);
    updateObserver(record.observer ?? null);
    setObjective(record.objective);
    setTaskMode(record.taskMode);
    setPlanEnabled(Boolean(record.planRequest));
    if (record.planRequest) setPlanSettings(record.planRequest);
    updatePlan(record.planArtifact ?? null);
    updatePlanApproval(record.planApproval ?? null);
    updatePlanHumanRevision(record.planHumanRevision ?? null);
    setEditingPlanDay(null);
    setLastEditedPlanDay(1);
    setReviewArtifact(record.reviewInput?.artifact ?? "");
    setReviewReferences(record.reviewInput?.references ?? "");
    setReviewTruthConstraints(record.reviewInput?.truthConstraints ?? "");
    closeChairFindingComposer();
    updateReviewEditCheckpoint(record.reviewEditCheckpoint ?? null);
    updateReviewResult(record.reviewResult ?? null);
    updateReviewHumanRevision(record.reviewHumanRevision ?? null);
    updateReviewApprovedArtifact(record.reviewApprovedArtifact ?? null);
    updateTranscript(record.transcript);
    updateMemo(record.memo);
    updateDecision(record.decision);
    updateUsage(record.usage);
    setIteration(record.iteration);
    meetingStateRef.current = record.meetingState ?? null;
    setMeetingState(record.meetingState ?? null);
    const rawProtocol = record.protocolState ?? legacyProtocolState(record);
    const restoredProtocol = rawProtocol
      ? record.planRequest ? rawProtocol : record.taskMode === "review"
        ? ensureReviewArtifactBudget(rawProtocol, record.participants.length)
        : ensureDecisionPackageBudget(rawProtocol, record.participants.length, record.transcript)
      : rawProtocol;
    updateProtocol(restoredProtocol);
    setControlMode(restoredProtocol?.controlMode ?? "checkpoints");
    setMaxRounds(restoredProtocol?.maxRounds ?? 2);
    setPhase(record.memo
      ? decisionLabel(record.decision)
      : restoredProtocol ? protocolStatusLabel(restoredProtocol) : "Saved meeting");
    setPhaseKey(record.reviewResult || record.reviewEditCheckpoint ? "synthesis" : latestPhase(record.transcript));
    setPinnedMessageId(null);
    setLiveMessageId(null);
    setFollowLive(true);
    setTranscriptMode(record.memo ? "overview" : "focus");
    setError("");
    setStage(record.memo ? "decision" : "meeting");
    setPendingDeleteRoomId(null);
    setHistoryOpen(false);
  }

  async function deleteMeetingRecord(roomId: string) {
    if (roomId === currentRoomId && (editingPlanDay || planSavingRef.current)) { setError("Save or cancel the day edit before deleting this meeting."); return; }
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
    if (editingPlanDay || planSavingRef.current) { setError("Save or cancel the day edit before starting another meeting."); return; }
    if (running) return;
    if (preserveCurrent) await saveCurrentMeetingNow();
    const now = new Date().toISOString();
    const nextRoomId = createRoomId();
    setCurrentRoomId(nextRoomId);
    currentRoomIdRef.current = nextRoomId;
    setCurrentRoomCreatedAt(now);
    currentRoomCreatedAtRef.current = now;
    updateParticipants([]);
    updateObserver(null);
    setObjective("");
    setTaskMode("review");
    setPlanEnabled(false);
    updatePlan(null);
    updatePlanApproval(null);
    setReviewArtifact("");
    setReviewReferences("");
    setReviewTruthConstraints("");
    closeChairFindingComposer();
    updateReviewEditCheckpoint(null);
    updateReviewResult(null);
    updateReviewHumanRevision(null);
    updateReviewApprovedArtifact(null);
    setReviewWork(null);
    updateTranscript([]);
    updateMemo("");
    updateUsage(emptyUsage);
    updateDecision("waiting");
    setIteration(0);
    meetingStateRef.current = null;
    setMeetingState(null);
    updateProtocol(null);
    setPhase("Awaiting agenda");
    setPhaseKey("agenda");
    setError("");
    setPinnedMessageId(null);
    setLiveMessageId(null);
    setFollowLive(true);
    setTranscriptMode("focus");
    setStage("agenda");
    setPendingDeleteRoomId(null);
    setHistoryOpen(false);
    setDirectiveText("");
    setObserverProgress(null);
    raiseHandRef.current = false;
    setRaiseHandRequested(false);
  }

  async function submitMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingPlanDay || planSavingRef.current) { setError("Save or cancel the day edit before starting another run."); return; }
    if (!canStart) return;
    if (iteration > 0) {
      await saveCurrentMeetingNow();
      const now = new Date().toISOString();
      const nextRoomId = createRoomId();
      setCurrentRoomId(nextRoomId);
      currentRoomIdRef.current = nextRoomId;
      setCurrentRoomCreatedAt(now);
      currentRoomCreatedAtRef.current = now;
    }
    const initialMeetingState = createInitialMeetingState(objective.trim());
    const now = new Date().toISOString();
    const initialProtocolState = planRequest
      ? createArtifactFirstProtocolState(reviewArtifactSeatIds, controlMode, now, setupBudget)
      : createMeetingProtocolState(
          seats.map((seat) => seat.id),
          controlMode,
          maxRounds,
          now,
          setupBudget,
          observerDraft.enabled,
        );
    const participants = seats.map((seat) => {
      const connection = connectionById.get(seat.connectionId);
      return {
        provider: seat.provider,
        providerName: connection?.name ?? providerUi[seat.provider].label,
        model: seat.model,
        role: seat.role,
      };
    });
    const observerSnapshot = observerRequest
      ? {
          provider: observerRequest.provider,
          providerName: connectionById.get(observerRequest.connectionId)?.name ??
            providerUi[observerRequest.provider].label,
          model: observerRequest.model,
        }
      : null;
    const openingTranscript: TranscriptItem[] = [{
      id: `host-${Date.now()}`,
      provider: "host",
      providerName: "Human Chair",
      role: "host",
      model: "",
      phase: "agenda",
      text: taskMode === "review" ? `Review · ${objective.trim()}` : objective.trim(),
      status: "done",
    }];
    updateTranscript(openingTranscript);
    updatePlan(null);
    updatePlanApproval(null);
    updateMemo("");
    updateReviewEditCheckpoint(null);
    updateReviewResult(null);
    updateReviewHumanRevision(null);
    updateReviewApprovedArtifact(null);
    closeChairFindingComposer();
    setReviewWork(null);
    updateUsage(emptyUsage);
    updateDecision("waiting");
    updateParticipants(participants);
    updateObserver(observerSnapshot);
    meetingStateRef.current = initialMeetingState;
    setMeetingState(initialMeetingState);
    updateProtocol(initialProtocolState);
    setPinnedMessageId(null);
    setLiveMessageId(null);
    setFollowLive(true);
    setTranscriptMode("focus");
    setPhase(planRequest ? "Ready to build the requested plan" : "Ready for independent proposals");
    setPhaseKey("agenda");
    setStage("meeting");
    setError("");
    raiseHandRef.current = false;
    setRaiseHandRequested(false);
    setObserverProgress(null);
    try {
      await flushProtocolRecord(initialProtocolState, initialMeetingState);
    } catch (storageError) {
      setError(`The meeting did not start because its recovery state could not be saved: ${safeClientError(storageError)}`);
      setPhase("Local recovery unavailable");
      return;
    }
    void runProtocol(initialProtocolState);
  }

  async function runObserverAtCheckpoint(
    state: MeetingProtocolState,
    controller: AbortController,
    transitionId: string,
  ) {
    const observer = observerRequest;
    const report = findLatestProcessReport(state);
    const canonicalState = meetingStateRef.current;
    if (!observer || !currentObserverRef.current) {
      throw new Error("Reconnect the saved Observer provider and model before continuing.");
    }
    if (!report || !canonicalState) {
      throw new Error("Observer requires the current Process Report and Canonical Meeting State.");
    }
    const budgetStatus = evaluateMeetingBudget(state, usageRef.current, [], 1);
    if (!budgetStatus.allowed) {
      const stopped = stopProtocol(state, "budget");
      updateProtocol(stopped);
      setPhase("Budget exhausted");
      setError(`Budget stop: ${budgetStopLabel(budgetStatus.reasons)}. No Observer call was started.`);
      await flushProtocolRecord(stopped);
      return stopped;
    }
    const beginning = beginObserverTransition(state, transitionId);
    if (!beginning.ok) throw new Error(beginning.error);
    let nextState = beginning.state;
    updateProtocol(nextState);
    await flushProtocolRecord(nextState);

    const response = await fetch("/api/discuss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective: objective.trim(),
        taskMode,
        ...(taskMode === "review" && reviewInput ? { reviewInput } : {}),
        seats,
        observer,
        connections: sessionConnectionPayload(seats, connectionById, observer),
        iteration: nextState.round,
        priorMemo: memoRef.current,
        meetingState: canonicalState,
        protocolPhase: "observer",
        seatIds: [],
        processReport: report,
        requestId: transitionId,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Observer phase failed (${response.status}).`);
    }
    if (!response.body) throw new Error("The Observer stream did not open.");
    const boundary: {
      done?: Extract<DiscussEvent, { type: "phase.done" }>;
      brief?: Extract<DiscussEvent, { type: "observer.done" }>["brief"];
      detail?: string;
    } = {};
    await readEvents(response.body, (roomEvent) => {
      if (roomEvent.type === "phase.done" && roomEvent.phase === "observer") boundary.done = roomEvent;
      if (roomEvent.type === "observer.done") boundary.brief = roomEvent.brief;
      if (roomEvent.type === "observer.format_error" && !boundary.detail) {
        boundary.detail = `Observer returned an invalid Round Brief: ${roomEvent.message}`;
      }
      if (roomEvent.type === "observer.error" && !boundary.detail) {
        boundary.detail = `Observer stopped: ${roomEvent.message}`;
      }
      handleEvent(roomEvent);
    });
    if (!boundary.done || !boundary.brief) {
      throw new Error(boundary.detail ?? "Observer ended without a validated Round Brief boundary.");
    }
    const completion = completeObserverTransition(nextState, transitionId, boundary.brief);
    if (!completion.ok) throw new Error(completion.error);
    nextState = completion.state;
    updateProtocol(nextState);
    await flushProtocolRecord(nextState);
    return nextState;
  }

  async function runProtocol(startState = protocolStateRef.current) {
    if (abortRef.current || !startState) return;
    if (planRequest && planRef.current && planReady(planRef.current) && startState.phase === "synthesis") {
      if (planRef.current.sourceStateVersion !== meetingStateRef.current?.version) {
        setError("This plan belongs to an earlier meeting state. No provider call was made.");
        return;
      }
      const completed: MeetingProtocolState = { ...startState, phase: "human_gate", status: "paused", pendingSeatIds: [], completedSeatIds: [], updatedAt: new Date().toISOString() };
      const brief = planBrief(planRef.current);
      try {
        await flushProtocolRecord(completed, meetingStateRef.current, { reviewResult: undefined, memo: brief, decision: "pending", stage: "decision" });
        updateMemo(brief); updateDecision("pending"); updateProtocol(completed); setStage("decision"); setPhase("Human decision required");
      } catch { setError("The reviewed Plan could not be saved. No provider call was made."); }
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStage("meeting");
    setError("");
    setCopied(false);
    let nextState = planRequest ? startState : taskMode === "review"
      ? ensureReviewArtifactBudget(startState, seats.length)
      : ensureDecisionPackageBudget(startState, seats.length, transcriptRef.current);
    let activeTransitionId = "";
    try {
      while (true) {
        if (observerIsPending(nextState)) {
          activeTransitionId = createRequestId();
          nextState = await runObserverAtCheckpoint(nextState, controller, activeTransitionId);
          activeTransitionId = "";
          if (nextState.phase === "stopped") return;
          if (raiseHandRef.current) {
            raiseHandRef.current = false;
            setRaiseHandRequested(false);
            setPhase(protocolStatusLabel(nextState));
            break;
          }
          if (nextState.controlMode === "auto") {
            const continued = continueProtocol(nextState, seats.map((seat) => seat.id));
            if (!continued.ok) throw new Error(continued.error);
            nextState = continued.state;
            updateProtocol(nextState);
            await flushProtocolRecord(nextState);
            continue;
          }
          setPhase(protocolStatusLabel(nextState));
          break;
        }
        if (nextState.status !== "ready" || !runnablePhase(nextState.phase)) break;
        const protocolPhase = runnablePhase(nextState.phase);
        if (!protocolPhase) break;
        const pendingSeatIds = protocolPhase === "synthesis"
          ? planRequest
            ? planRef.current && missingPlanDays(planRef.current).length === 0 ? reviewArtifactSeatIds.slice(1) : reviewArtifactSeatIds
            : taskMode === "review"
            ? reviewEditCheckpointRef.current
              ? reviewArtifactSeatIds.slice(1)
              : reviewArtifactSeatIds
            : []
          : nextState.controlMode === "turn_by_turn"
            ? nextState.pendingSeatIds.slice(0, 1)
            : nextState.pendingSeatIds;
        const budgetStatus = evaluateMeetingBudget(nextState, usageRef.current, pendingSeatIds);
        if (planRequest && protocolPhase === "synthesis" && nextState.transitions.filter((turn) => turn.phase === "synthesis").length >= 2) {
          throw new Error("The Plan's one explicit recovery has been used. Saved days remain available; no further call was started.");
        }
        if (!budgetStatus.allowed) {
          nextState = stopProtocol(nextState, "budget");
          updateProtocol(nextState);
          setPhase("Budget exhausted");
          setError(`Budget stop: ${budgetStopLabel(budgetStatus.reasons)}. No provider call was started.`);
          await flushProtocolRecord(nextState);
          return;
        }
        activeTransitionId = createRequestId();
        const beginning = beginProtocolTransition(
          nextState,
          activeTransitionId,
          pendingSeatIds,
        );
        if (!beginning.ok) throw new Error(beginning.error);
        nextState = beginning.state;
        updateProtocol(nextState);
        await flushProtocolRecord(nextState);

        const response = await fetch("/api/discuss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objective: objective.trim(),
            taskMode,
            ...(taskMode === "review" && reviewInput ? { reviewInput } : {}),
            ...(planRequest ? { planRequest } : {}),
            ...(protocolPhase === "synthesis" && planRef.current ? { planArtifact: planRef.current } : {}),
            seats,
            connections: sessionConnectionPayload(seats, connectionById, observerRequest ?? undefined),
            iteration: nextState.round,
            priorMemo: memoRef.current,
            meetingState: meetingStateRef.current,
            protocolPhase,
            seatIds: pendingSeatIds,
            contextTurns: protocolPhase === "targeted_debate"
              ? []
              : phaseContextTurns(
                  transcriptRef.current,
                  nextState.round,
                  meetingStateRef.current,
                ),
            ...((protocolPhase === "targeted_debate" || protocolPhase === "synthesis") &&
              activeTargetedDebate(nextState)
              ? { targetedDisputeId: activeTargetedDebate(nextState)?.disputeId }
              : {}),
            ...(protocolPhase === "synthesis" && reviewEditCheckpointRef.current
              ? { reviewEditCheckpoint: reviewEditCheckpointRef.current }
              : {}),
            requestId: activeTransitionId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Meeting phase failed (${response.status}).`);
        }
        if (!response.body) throw new Error("The meeting phase stream did not open.");
        const phaseBoundary: {
          event?: Extract<DiscussEvent, { type: "phase.done" }>;
          error?: Extract<DiscussEvent, { type: "room.error" }>;
          detail?: string;
        } = {};
        await readEvents(response.body, async (roomEvent) => {
          if (roomEvent.type === "plan.checkpoint" && planRequest) {
            const parsed = parsePlanArtifact(roomEvent.artifact, planRequest, objective.trim());
            if (!parsed || parsed.sourceStateVersion !== meetingStateRef.current?.version) throw new Error("The Plan checkpoint does not match this room.");
            const previous = planRef.current;
            updatePlan(parsed);
            try { await flushProtocolRecord(nextState); } catch (storageError) {
              updatePlan(previous);
              controller.abort();
              throw storageError;
            }
            return;
          }
          if (roomEvent.type === "phase.done") phaseBoundary.event = roomEvent;
          if (roomEvent.type === "room.error") phaseBoundary.error = roomEvent;
          if (roomEvent.type === "agent.format_error" && !phaseBoundary.detail) {
            phaseBoundary.detail = `This seat returned an invalid Turn Envelope: ${roomEvent.message}`;
          }
          if (roomEvent.type === "agent.reduction_error" && !phaseBoundary.detail) {
            phaseBoundary.detail = `Structured state rejected this turn: ${roomEvent.message}`;
          }
          if (roomEvent.type === "agent.error" && !phaseBoundary.detail) {
            phaseBoundary.detail = `This seat stopped: ${roomEvent.message}`;
          }
          if (roomEvent.type === "review.work.format_error" && !phaseBoundary.detail) {
            phaseBoundary.detail = `${roomEvent.stage === "editing" ? "Editor" : "Verifier"} returned invalid structured output: ${roomEvent.message}`;
          }
          if (roomEvent.type === "review.work.error" && !phaseBoundary.detail) {
            phaseBoundary.detail = `${roomEvent.stage === "editing" ? "Editor" : "Verifier"} stopped: ${roomEvent.message}`;
          }
          handleEvent(roomEvent);
        });
        if (phaseBoundary.error) {
          throw new Error(phaseBoundary.detail ?? phaseBoundary.error.message);
        }
        const phaseDone = phaseBoundary.event;
        if (!phaseDone) throw new Error("The meeting phase ended without a completion boundary.");
        const completion = completeProtocolTransition(
          nextState,
          activeTransitionId,
          phaseDone.completedSeatIds,
        );
        if (!completion.ok) throw new Error(completion.error);
        nextState = completion.state;
        if (
          taskMode === "review" &&
          (phaseDone.phase === "review" || phaseDone.phase === "targeted_debate") &&
          nextState.phase === "synthesis" &&
          nextState.status === "ready"
        ) {
          nextState = {
            ...nextState,
            phase: "review_checkpoint",
            status: "paused",
            updatedAt: new Date().toISOString(),
          };
        }
        if (
          (phaseDone.phase === "review" || phaseDone.phase === "targeted_debate") &&
          meetingStateRef.current
        ) {
          const progressTurns = transcriptRef.current.flatMap((item) =>
            item.provider !== "host" && item.round && item.phase !== "agenda" && item.status !== "streaming"
              ? [{
                  id: item.id,
                  round: item.round,
                  phase: item.phase,
                  status: item.status,
                  ...(item.envelope ? { envelope: item.envelope } : {}),
                }]
              : [],
          );
          const report = createProcessReport(
            meetingStateRef.current,
            progressTurns,
            nextState.processReports.at(-1),
          );
          nextState = appendProcessReport(nextState, report);
        }
        activeTransitionId = "";

        if (raiseHandRef.current && nextState.status === "ready") {
          nextState = pauseProtocolAtSafeBoundary(nextState);
          raiseHandRef.current = false;
          setRaiseHandRequested(false);
        }
        updateProtocol(nextState);
        setPhase(protocolStatusLabel(nextState));
        await flushProtocolRecord(nextState);

        if (observerIsPending(nextState)) continue;
        if (nextState.controlMode !== "auto" || nextState.status !== "ready") break;
      }
    } catch (meetingError) {
      const interruptionMessage = controller.signal.aborted
        ? "This turn was stopped by the Human Chair."
        : "This turn was interrupted before completion.";
      updateTranscript((current) =>
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
        if (activeTransitionId) {
          const interrupted = interruptProtocolTransition(nextState, activeTransitionId);
          if (interrupted.ok) nextState = interrupted.state;
        }
        nextState = stopProtocol(nextState);
        setError("Meeting stopped by the host. No automatic retry was started.");
        setPhase("Stopped");
      } else {
        if (activeTransitionId) {
          const interrupted = interruptProtocolTransition(nextState, activeTransitionId);
          if (interrupted.ok) nextState = interrupted.state;
        }
        setError(safeClientError(meetingError));
        setPhase("Interrupted at a recoverable boundary");
      }
      updateProtocol(nextState);
      try {
        await flushProtocolRecord(nextState);
      } catch {
        setHistoryError("The interrupted protocol state could not be saved.");
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
      setReviewWork(null);
      setPlanWork(null);
    }
  }

  async function keepOriginalReview() {
    const current = protocolStateRef.current;
    const state = meetingStateRef.current;
    if (taskMode !== "review" || !reviewInput || !current || !state || running || keepingOriginalRef.current) return;
    if (reviewResultRef.current || reviewEditCheckpointRef.current) {
      setError("An artifact already exists. Continue its review instead of replacing it.");
      return;
    }
    const kept = prepareKeptOriginalReview(reviewInput.artifact, state, current);
    if (!kept.ok) {
      setError(kept.error);
      return;
    }
    keepingOriginalRef.current = true;
    setRunning(true);
    setError("");
    const brief = buildReviewExecutiveBrief(kept.result);
    try {
      // Save the candidate before exposing a new result or approval state.
      await flushProtocolRecord(kept.protocol, state, { reviewResult: kept.result, memo: brief, decision: "pending", stage: "decision" });
      updateReviewResult(kept.result);
      updateMemo(brief);
      updateDecision("pending");
      updateProtocol(kept.protocol);
      setReviewResultView("artifact");
      setPhaseKey("synthesis");
      setPhase("Original retained; human decision required");
      setStage("decision");
    } catch (storageError) {
      setError(`The original could not be saved. The review remains at its checkpoint: ${safeClientError(storageError)}`);
    } finally {
      keepingOriginalRef.current = false;
      setRunning(false);
    }
  }

  async function resumeSavedPlan() {
    const plan = planRef.current;
    const current = protocolStateRef.current;
    if (!plan || !current || running || abortRef.current || planSavingRef.current || !roomCompositionMatches || planApprovalRef.current) return;
    const resumed = preparePlanRecovery(plan, current);
    if (!resumed || plan.sourceStateVersion !== meetingStateRef.current?.version) {
      setError("This Plan cannot use another recovery, or its source state has changed. No call was made.");
      return;
    }
    const budget = evaluateMeetingBudget(resumed, usageRef.current, resumed.pendingSeatIds);
    if (!budget.allowed) { setError(`Budget stop: ${budgetStopLabel(budget.reasons)}. No provider call was started.`); return; }
    planSavingRef.current = true;
    setPlanSaving(true);
    try {
      await flushProtocolRecord(resumed);
      updateProtocol(resumed);
    } catch (storageError) {
      setError(`The recovery allowance could not be saved. No call was made: ${safeClientError(storageError)}`);
      return;
    } finally { planSavingRef.current = false; setPlanSaving(false); }
    void runProtocol(resumed);
  }

  async function continueMeeting() {
    const current = protocolStateRef.current;
    if (!current || running) return;
    if (planRequest && planRef.current && preparePlanRecovery(planRef.current, current)) {
      await resumeSavedPlan();
      return;
    }
    if (planRequest && planRef.current && planReady(planRef.current) && current.phase === "synthesis") {
      void runProtocol(current);
      return;
    }
    if (!roomCompositionMatches) return;
    if (
      taskMode === "review" &&
      current.phase === "review_checkpoint" &&
      acceptedReviewFindings.length === 0
    ) {
      setError("Accept at least one Finding before building Artifact v2.");
      return;
    }
    const continued = continueProtocol(current, seats.map((seat) => seat.id));
    if (!continued.ok) {
      setError(continued.error);
      return;
    }
    const previousDecision = decisionRef.current;
    const leaveOriginalResult = current.phase === "human_gate" && reviewResultRef.current?.artifactVersion === 1;
    updateDecision("waiting");
    setStage("meeting");
    setError("");
    try {
      await flushProtocolRecord(continued.state, meetingStateRef.current, leaveOriginalResult
        ? { reviewResult: undefined, memo: "", decision: "waiting", stage: "meeting" }
        : undefined);
    } catch (storageError) {
      updateDecision(previousDecision);
      if (previousDecision === "pending") setStage("decision");
      setError(`The meeting cannot continue until its recovery state is saved: ${safeClientError(storageError)}`);
      return;
    }
    if (leaveOriginalResult) {
      updateReviewResult(null);
      updateMemo("");
    }
    updateProtocol(continued.state);
    void runProtocol(continued.state);
  }

  async function startTargetedDebate() {
    const currentProtocol = protocolStateRef.current;
    const currentMeeting = meetingStateRef.current;
    const dispute = currentMeeting?.disputes.find(
      (item) => item.id === (selectedDispute?.id ?? selectedDisputeId) && item.status === "open",
    );
    if (!currentProtocol || !currentMeeting || !dispute || running || !roomCompositionMatches) return;
    const started = beginTargetedDebateRound(
      currentProtocol,
      currentMeeting,
      dispute.id,
      seats.map((seat) => seat.id),
    );
    if (!started.ok) {
      setError(started.error);
      return;
    }
    setError("");
    setStage("meeting");
    try {
      await flushProtocolRecord(started.state);
    } catch (storageError) {
      setError(`The targeted debate cannot start until its recovery state is saved: ${safeClientError(storageError)}`);
      return;
    }
    updateProtocol(started.state);
    void runProtocol(started.state);
  }

  function handleEvent(event: DiscussEvent) {
    if (event.type === "plan.work") {
      setPlanWork(event.stage);
      if (event.usage) updateUsage((current) => mergeUsage(current, event.usage!));
      return;
    }
    if (event.type === "phase.start") {
      setPhase(event.label);
      if (event.phase === "targeted_debate") setPhaseKey("review");
      else if (event.phase !== "observer") setPhaseKey(event.phase);
      return;
    }
    if (event.type === "observer.start") {
      setObserverProgress("thinking");
      setPhase(`Observer · ${event.connectionName}`);
      return;
    }
    if (event.type === "observer.progress") {
      setObserverProgress(event.stage);
      return;
    }
    if (event.type === "observer.done") {
      setObserverProgress(null);
      return;
    }
    if (event.type === "observer.format_error") {
      setObserverProgress(null);
      updateUsage((current) => mergeUsage(current, event.usage));
      setError(`Observer returned an invalid Round Brief: ${event.message}`);
      return;
    }
    if (event.type === "observer.error") {
      setObserverProgress(null);
      setError(`Observer stopped: ${event.message}`);
      return;
    }
    if (event.type === "review.work.start") {
      setReviewWork({
        stage: event.stage,
        progress: "thinking",
        label: `${event.stage === "editing" ? "Editor" : "Verifier"} · ${event.connectionName}`,
      });
      setPhase(event.stage === "editing" ? "Building Artifact v2" : "Verifying changed material");
      return;
    }
    if (event.type === "review.work.progress") {
      setReviewWork((current) => current?.stage === event.stage
        ? { ...current, progress: event.progress }
        : current);
      return;
    }
    if (event.type === "review.work.done") {
      updateUsage((current) => mergeUsage(current, event.usage));
      return;
    }
    if (event.type === "review.edit.done") {
      updateReviewEditCheckpoint(event.checkpoint);
      return;
    }
    if (event.type === "review.work.format_error") {
      updateUsage((current) => mergeUsage(current, event.usage));
      setReviewWork(null);
      setError(`${event.stage === "editing" ? "Editor" : "Verifier"} returned invalid structured output: ${event.message}`);
      return;
    }
    if (event.type === "review.work.error") {
      setReviewWork(null);
      setError(`${event.stage === "editing" ? "Editor" : "Verifier"} stopped: ${event.message}`);
      return;
    }
    if (event.type === "review.artifact.done") {
      updateReviewEditCheckpoint(null);
      updateReviewHumanRevision(null);
      updateReviewApprovedArtifact(null);
      updateReviewResult(event.result);
      setReviewWork(null);
      return;
    }
    if (event.type === "agent.start") {
      setLiveMessageId(event.id);
      updateTranscript((current) => [
        ...current,
        {
          id: event.id,
          seatId: event.seatId,
          round: event.round,
          provider: event.provider,
          providerName: event.connectionName,
          role: event.role,
          model: event.model,
          phase: event.phase,
          target: event.target,
          text: "",
          status: "streaming",
          progress: "thinking",
        },
      ]);
      return;
    }
    if (event.type === "agent.delta") {
      const item = transcriptRef.current.find((candidate) => candidate.id === event.id);
      if (!item || item.progress === "generating") return;
      setLiveMessageId(event.id);
      updateTranscript((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, progress: "generating" } : item,
        ),
      );
      return;
    }
    if (event.type === "agent.progress") {
      setLiveMessageId(event.id);
      updateTranscript((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, progress: event.stage } : item,
        ),
      );
      return;
    }
    if (event.type === "agent.done") {
      setLiveMessageId(event.id);
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
        updateTranscript((current) =>
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
      updateTranscript((current) =>
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
      setLiveMessageId(event.id);
      updateUsage((current) => mergeUsage(current, event.usage));
      updateTranscript((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                status: "error",
                formatError: event.message,
                text: item.text || `This seat returned an invalid Turn Envelope: ${event.message}`,
                usage: event.usage,
              }
            : item,
        ),
      );
      return;
    }
    if (event.type === "agent.reduction_error") {
      setLiveMessageId(event.id);
      updateUsage((current) => mergeUsage(current, event.usage));
      updateTranscript((current) =>
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
      setLiveMessageId(event.id);
      updateTranscript((current) =>
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
    if (event.type === "phase.done") {
      if (!event.reviewResult && !event.planArtifact) updateUsage((current) => mergeUsage(current, event.usage));
      return;
    }
    if (event.type === "room.done") {
      if (event.planArtifact) updatePlan(event.planArtifact);
      if (event.reviewResult) {
        updateReviewHumanRevision(null);
        updateReviewApprovedArtifact(null);
        updateReviewResult(event.reviewResult);
      }
      updateMemo(event.memo);
      updateDecision("pending");
      setPhase("Human decision required");
      return;
    }
    if (event.type === "room.error") {
      setError(event.message);
      setPhase("Needs attention");
    }
  }

  async function addChairDirection() {
    if (planRef.current) { setError("The Plan contract is frozen after generation starts. Start a new room for changed requirements."); return; }
    const currentState = meetingStateRef.current;
    if (!currentState || running || directiveText.trim().length === 0) return;
    const currentPhase = protocolStateRef.current?.phase;
    if (directiveKind === "format" && currentPhase !== "proposal" && currentPhase !== "review" && currentPhase !== "synthesis") {
      setError("A format repair requires a paused proposal, review or synthesis phase."); return;
    }
    const target = directiveTarget === "all" ? "all" as const : [directiveTarget];
    const directive: ChairDirective = {
      id: `directive-${createRequestId()}`,
      kind: directiveKind,
      ...(directiveKind === "format" ? { formatScope: { phase: currentPhase as "proposal" | "review" | "synthesis", round: protocolStateRef.current!.round } } : {}),
      target,
      text: directiveText.trim().slice(0, 1_000),
      status: "active",
      ...(transcriptRef.current.at(-1)?.id
        ? { createdAfterMessageId: transcriptRef.current.at(-1)!.id }
        : {}),
    };
    const result = appendChairDirective(currentState, directive);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    meetingStateRef.current = result.state;
    setMeetingState(result.state);
    setDirectiveText("");
    setError("");
    try {
      await flushProtocolRecord(protocolStateRef.current, result.state);
      setDirectiveKind("constraint");
    } catch (storageError) {
      meetingStateRef.current = currentState;
      setMeetingState(currentState);
      setDirectiveText(directive.text);
      setError(`The direction could not be saved: ${safeClientError(storageError)}`);
    }
  }

  async function decideFinding(claimId: string, decision: ClaimDecision) {
    const currentState = meetingStateRef.current;
    if (!currentState || running) return;
    const result = decideClaimByChair(
      currentState,
      claimId,
      decision,
      `choice-${createRequestId()}`,
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.duplicate) return;
    meetingStateRef.current = result.state;
    setMeetingState(result.state);
    setError("");
    try {
      await flushProtocolRecord(protocolStateRef.current, result.state);
    } catch (storageError) {
      meetingStateRef.current = currentState;
      setMeetingState(currentState);
      setError(`The Finding decision could not be saved: ${safeClientError(storageError)}`);
    }
  }

  function openChairFindingComposer(claimId = "") {
    const finding = reviewFindings.find((item) => item.id === claimId);
    setChairFindingTargetId(finding?.id ?? "");
    setChairFindingText(finding?.text ?? "");
    setChairFindingSourceKind(finding?.reviewSource?.kind ?? "truth_constraint");
    setChairFindingExcerpt(finding?.reviewSource?.excerpt ?? "");
    setChairFindingOpen(true);
    setError("");
  }

  function closeChairFindingComposer() {
    setChairFindingOpen(false);
    setChairFindingText("");
    setChairFindingExcerpt("");
    setChairFindingTargetId("");
  }

  async function addChairFinding() {
    const currentState = meetingStateRef.current;
    const currentProtocol = protocolStateRef.current;
    if (
      !currentState ||
      !currentProtocol ||
      currentProtocol.phase !== "review_checkpoint" ||
      !reviewInput ||
      running
    ) return;
    const source = validateReviewFindingSource(reviewInput, {
      kind: chairFindingSourceKind,
      excerpt: chairFindingExcerpt,
    });
    if (!source.ok) {
      setError(source.error);
      return;
    }
    const result = addChairFindingByChair(
      currentState,
      {
        text: chairFindingText.trim(),
        source: source.source,
        ...(chairFindingTargetId ? { supersedesClaimId: chairFindingTargetId } : {}),
      },
      `choice-${createRequestId()}`,
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    meetingStateRef.current = result.state;
    setMeetingState(result.state);
    setError("");
    try {
      await flushProtocolRecord(currentProtocol, result.state);
      closeChairFindingComposer();
    } catch (storageError) {
      meetingStateRef.current = currentState;
      setMeetingState(currentState);
      setError(`The Chair Finding could not be saved: ${safeClientError(storageError)}`);
    }
  }

  function requestSafePause() {
    raiseHandRef.current = true;
    setRaiseHandRequested(true);
  }

  async function savePlanAmendment(next: PlanArtifact) {
    const parsed = parsePlanArtifact(next, next.request, next.objective);
    if (!parsed) throw new Error("The amendment checkpoint is invalid.");
    const brief = planBrief(modelRevisedPlan(parsed));
    await flushProtocolRecord(protocolStateRef.current, meetingStateRef.current, { planArtifact: parsed, memo: brief, decision: "pending", stage: "decision" });
    updatePlan(parsed); updateMemo(brief); setCopied(false);
    return parsed;
  }

  async function runPlanAmendment(selected?: number[]) {
    let plan = planRef.current;
    if (!plan || abortRef.current || running || planSavingRef.current || editingPlanDay || planHumanRevisionRef.current ||
        planApprovalRef.current || decisionRef.current !== "pending") return;
    if (!roomCompositionMatches || plan.objective !== objective.trim() || plan.sourceStateVersion !== meetingStateRef.current?.version) {
      setError("Restore the original meeting and its model Seats before amending."); return;
    }
    if (selected ? plan.amendment || !validPlanConcernSelection(selected, plan) : plan.amendment?.status !== "amended") return;
    if ([plan.builder, plan.reviewer].some((snapshot) => !seats.some((seat) => seat.id === snapshot.seatId && seat.model === snapshot.model && seat.provider === snapshot.provider))) {
      setError("Reconnect the original Builder and Reviewer before amending."); return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    planSavingRef.current = true;
    setPlanSaving(true); setRunning(true); setError("");
    let inFlight: "amend" | "recheck" | null = null;
    try {
      if (selected) plan = await savePlanAmendment({ ...plan, amendment: { selected, status: "amending", startedAt: new Date().toISOString() } });
      for (const action of (selected ? ["amend", "recheck"] : ["recheck"]) as Array<"amend" | "recheck">) {
        if (controller.signal.aborted) throw new Error("Amendment stopped. No further model call was started.");
        if (action === "recheck") plan = await savePlanAmendment({ ...plan, amendment: { ...plan.amendment!, status: "rechecking" } });
        inFlight = action;
        const response = await fetch("/api/discuss", {
          method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ objective: plan.objective, taskMode: "decide", planRequest: plan.request,
            planArtifact: plan, planAmendmentAction: action, seats,
            connections: sessionConnectionPayload(seats, connectionById), meetingState: meetingStateRef.current, requestId: createRequestId() }),
        });
        const result = (await response.json()) as {
          artifact?: unknown;
          error?: string;
          usage?: UsageSummary;
          usageUnknown?: boolean;
        };
        if (result.usage) {
          const reportedUsage = result.usage;
          updateUsage((current) => mergeUsage(current, reportedUsage));
        }
        if (!response.ok) throw new Error(`${result.error ?? "The amendment failed."}${result.usageUnknown ? " Provider usage is unknown; check your provider account." : ""}`);
        const next = parsePlanArtifact(result.artifact, plan.request, plan.objective);
        if (!next || JSON.stringify({ ...next, amendment: undefined }) !== JSON.stringify({ ...plan, amendment: undefined }) ||
            next.amendment?.startedAt !== plan.amendment!.startedAt ||
            JSON.stringify(next.amendment?.selected) !== JSON.stringify(plan.amendment!.selected) ||
            next.amendment?.status !== (action === "amend" ? "amended" : "complete")) throw new Error("The amendment response changed its source or stage.");
        plan = await savePlanAmendment(next);
        inFlight = null;
      }
    } catch (failure) {
      let storageNotice = "";
      if (inFlight && plan.amendment) {
        try { await savePlanAmendment({ ...plan, amendment: { ...plan.amendment, status: inFlight === "amend" ? "amendment_failed" : "recheck_failed" } }); }
        catch { storageNotice = " The latest result could not be saved; the original and last checkpoint remain."; }
      }
      setError(`${safeClientError(failure)}${storageNotice} No automatic retry. Interrupted-call usage may be incomplete.`);
    } finally {
      abortRef.current = null; planSavingRef.current = false;
      setPlanSaving(false); setRunning(false);
    }
  }

  async function dismissPlanAmendment() {
    const plan = planRef.current;
    if (!plan?.amendment || running || planSavingRef.current || editingPlanDay || planHumanRevisionRef.current || decisionRef.current !== "pending") return;
    planSavingRef.current = true; setPlanSaving(true); setError("");
    try { await savePlanAmendment({ ...plan, amendment: { ...plan.amendment, status: "dismissed" } }); }
    catch (failure) { setError(`The original could not be restored: ${safeClientError(failure)}`); }
    finally { planSavingRef.current = false; setPlanSaving(false); }
  }

  async function savePlanDayEdit() {
    const original = planRef.current;
    if (!original || !editingPlanDay || running || planSavingRef.current || decisionRef.current !== "pending" || planApprovalRef.current) return;
    if (original.sourceStateVersion !== meetingStateRef.current?.version || original.objective !== objective.trim()) {
      setError("The meeting changed while editing. The original plan has not been modified.");
      return;
    }
    const result = createPlanHumanRevision(original, editingPlanDay, planHumanRevisionRef.current);
    if (!result.ok) { setError(result.error); return; }
    planSavingRef.current = true;
    setPlanSaving(true);
    setError("");
    try {
      await flushProtocolRecord(protocolStateRef.current, meetingStateRef.current, {
        reviewResult: undefined, planHumanRevision: result.revision ?? undefined,
        memo: memoRef.current, decision: "pending", stage: "decision",
      });
      updatePlanHumanRevision(result.revision);
      setEditingPlanDay(null);
      setCopied(false);
    } catch (storageError) {
      setError(`The day revision was not saved. Your draft is still open: ${safeClientError(storageError)}`);
    } finally {
      planSavingRef.current = false;
      setPlanSaving(false);
    }
  }

  async function recordHumanDecision(next: "approved" | "rejected") {
    if (running || editingPlanDay || planSavingRef.current || decisionRef.current !== "pending") return;
    const current = protocolStateRef.current;
    if (!current) {
      setError("The room protocol is unavailable, so this decision cannot be saved safely.");
      return;
    }
    const previousDecision = decisionRef.current;
    const previousApprovedArtifact = reviewApprovedArtifactRef.current;
    const previousPlanApproval = planApprovalRef.current;
    if (next === "approved" && planRequest) {
      const artifact = planRef.current && parsePlanArtifact(planRef.current, planRequest, objective.trim());
      if (!artifact || !planReady(artifact)) { setError("Complete the daily plan and its independent review before approval."); return; }
      const revision = planHumanRevisionRef.current;
      const approval = parsePlanApproval({ artifact: revisedPlan(artifact, revision), ...(artifact.amendment ? { sourceArtifact: artifact } : {}), ...(revision ? { humanRevision: revision } : {}), approvedAt: new Date().toISOString() }, artifact, revision);
      if (!approval) { setError("The revised plan could not be frozen for approval."); return; }
      updatePlanApproval(approval);
    }
    if (next === "approved" && reviewResultRef.current && reviewInput) {
      const approved = createReviewApprovedArtifact(
        reviewResultRef.current,
        reviewInput.artifact,
        reviewHumanRevisionRef.current,
        new Date().toISOString(),
      );
      if (!approved.ok) {
        setError(`The Review artifact could not be frozen for approval: ${approved.error}`);
        return;
      }
      updateReviewApprovedArtifact(approved.artifact);
    }
    updateDecision(next);
    const completed = finishProtocol(current);
    updateProtocol(completed);
    setPhase(decisionLabel(next));
    try {
      await flushProtocolRecord(completed);
    } catch (storageError) {
      updateReviewApprovedArtifact(previousApprovedArtifact);
      updatePlanApproval(previousPlanApproval);
      updateDecision(previousDecision);
      updateProtocol(current);
      setPhase("Human decision required");
      setError(`The decision was not applied because it could not be saved: ${safeClientError(storageError)}`);
    }
  }

  async function resetRoom() {
    if (editingPlanDay || planSavingRef.current) { setError("Save or cancel the day edit before resetting this meeting."); return; }
    if (running) return;
    await saveCurrentMeetingNow();
    updatePlan(null);
    updatePlanApproval(null);
    updateTranscript([]);
    updateMemo("");
    updateReviewEditCheckpoint(null);
    updateReviewResult(null);
    updateReviewHumanRevision(null);
    updateReviewApprovedArtifact(null);
    closeChairFindingComposer();
    setReviewWork(null);
    updateUsage(emptyUsage);
    updateDecision("waiting");
    updateObserver(null);
    setIteration(0);
    meetingStateRef.current = null;
    setMeetingState(null);
    updateProtocol(null);
    setPhase("Awaiting agenda");
    setPhaseKey("agenda");
    setError("");
    setPinnedMessageId(null);
    setLiveMessageId(null);
    setFollowLive(true);
    setStage("agenda");
    setObserverProgress(null);
  }

  async function copyMemo() {
    if (!memo) return;
    await navigator.clipboard.writeText(memo);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }

  async function copyReviewArtifact() {
    if (!displayedReviewArtifact) return;
    await navigator.clipboard.writeText(displayedReviewArtifact);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }

  function beginReviewChangeEdit(changeId: string) {
    if (decision !== "pending") return;
    const change = effectiveReviewChanges.find((item) => item.id === changeId);
    if (!change) return;
    setEditingReviewChangeId(changeId);
    setReviewChangeDraft(change.after);
    setError("");
  }

  function currentHumanReviewEdits() {
    const revision = reviewHumanRevisionRef.current;
    if (!revision) return {} as Record<string, string>;
    return Object.fromEntries(
      revision.editedChangeIds.map((changeId) => [
        changeId,
        revision.changeSet.find((change) => change.id === changeId)?.after ?? "",
      ]),
    );
  }

  async function persistReviewHumanRevision(next: ReviewHumanRevision | null) {
    const previous = reviewHumanRevisionRef.current;
    updateReviewHumanRevision(next);
    try {
      await flushProtocolRecord();
      setError("");
    } catch (storageError) {
      updateReviewHumanRevision(previous);
      setError(`The human revision could not be saved: ${safeClientError(storageError)}`);
    }
  }

  async function saveReviewChangeEdit(changeId: string) {
    if (!reviewResult || !reviewInput || decision !== "pending") return;
    const edits = currentHumanReviewEdits();
    edits[changeId] = reviewChangeDraft;
    const created = createReviewHumanRevision(
      reviewResult,
      reviewInput.artifact,
      edits,
      new Date().toISOString(),
      reviewHumanRevisionRef.current ?? undefined,
    );
    if (!created.ok) {
      setError(created.error);
      return;
    }
    await persistReviewHumanRevision(created.revision);
  }

  async function restoreModelReviewChange(changeId: string) {
    if (!reviewResult || !reviewInput || decision !== "pending") return;
    const edits = currentHumanReviewEdits();
    delete edits[changeId];
    if (Object.keys(edits).length === 0) {
      await persistReviewHumanRevision(null);
      return;
    }
    const created = createReviewHumanRevision(
      reviewResult,
      reviewInput.artifact,
      edits,
      new Date().toISOString(),
      reviewHumanRevisionRef.current ?? undefined,
    );
    if (!created.ok) {
      setError(created.error);
      return;
    }
    await persistReviewHumanRevision(created.revision);
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
              <div className="task-mode-heading">
                <span className="section-kicker">Task pack</span>
                <div className="segmented-control task-mode-control" aria-label="Task pack">
                  <button type="button" className={taskMode === "review" ? "active" : ""} onClick={() => setTaskMode("review")} disabled={running}>Review</button>
                  <button type="button" className={taskMode === "decide" ? "active" : ""} onClick={() => setTaskMode("decide")} disabled={running}>Decide / Plan</button>
                </div>
              </div>
              <div className="section-kicker">{taskMode === "review" ? "Review objective" : "Meeting objective"}</div>
              <h1>{taskMode === "review" ? "What should this review improve?" : "What must this room decide?"}</h1>
              <p className="supporting-copy">
                {taskMode === "review"
                  ? "Independent reviewers inspect the same artifact before cross-checking material differences."
                  : "Give the participants a decision, not a broad topic. The human chair keeps final authority."}
              </p>
              <textarea
                className={`objective-input${taskMode === "review" ? " compact" : ""}`}
                id="objective"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                placeholder={taskMode === "review" ? "Define the review outcome and audience..." : "Define the decision and its constraints..."}
                maxLength={4_000}
                rows={taskMode === "review" ? 3 : 7}
                disabled={running}
              />
              {taskMode === "decide" ? <fieldset className="plan-settings">
                <label className="plan-toggle"><input type="checkbox" checked={planEnabled} onChange={(event) => { setPlanEnabled(event.target.checked); if (event.target.checked) setMaxRounds(1); }} />Detailed LeetCode plan</label>
                {planEnabled ? <div className="plan-settings-fields">
                  <label>Days<input type="number" min={10} max={15} value={planSettings.days} onChange={(event) => setPlanSettings((current) => ({ ...current, days: Number(event.target.value) }))} /></label>
                  <label>Minimum MEU / day<input type="number" min={1} max={15} value={planSettings.dailyMeu} onChange={(event) => setPlanSettings((current) => ({ ...current, dailyMeu: Number(event.target.value) }))} /></label>
                  <label>Minutes / day<input type="number" min={60} max={720} step={30} value={planSettings.dailyMinutes} onChange={(event) => setPlanSettings((current) => ({ ...current, dailyMinutes: Number(event.target.value) }))} /></label>
                  <p>Hard = 2 Medium · 3 Easy = 1 Medium. The Plan Builder creates the full artifact first; the independent Review Seat audits that artifact. Two initial calls, no generic proposal round or automatic retry.</p>
                </div> : null}
              </fieldset> : null}
              {taskMode === "review" ? (
                <div className="review-agenda-fields">
                  <label>
                    <span>Artifact v1 <small>{reviewArtifact.length}/{reviewTaskLimits.artifact}</small></span>
                    <textarea
                      value={reviewArtifact}
                      onChange={(event) => setReviewArtifact(event.target.value)}
                      placeholder="Paste the resume, product document, requirements, or technical plan..."
                      maxLength={reviewTaskLimits.artifact}
                      rows={8}
                      disabled={running}
                    />
                  </label>
                  <label>
                    <span>Reference material <small>{reviewReferences.length}/{reviewTaskLimits.references}</small></span>
                    <textarea
                      value={reviewReferences}
                      onChange={(event) => setReviewReferences(event.target.value)}
                      placeholder="Paste the job description, requirements, rubric, or explicitly state that no external reference is supplied."
                      maxLength={reviewTaskLimits.references}
                      rows={5}
                      disabled={running}
                    />
                  </label>
                  <label>
                    <span>Truth constraints <small>{reviewTruthConstraints.length}/{reviewTaskLimits.truthConstraints}</small></span>
                    <textarea
                      value={reviewTruthConstraints}
                      onChange={(event) => setReviewTruthConstraints(event.target.value)}
                      placeholder="Example: do not invent metrics, experience, citations, or requirements; label inference explicitly."
                      maxLength={reviewTaskLimits.truthConstraints}
                      rows={3}
                      disabled={running}
                    />
                  </label>
                </div>
              ) : null}
              <div className="objective-footer">
                <span>{objective.length}/4,000</span>
                <span>Discuss only</span>
                <span>{maxRounds} round{maxRounds === 1 ? "" : "s"} maximum</span>
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

              <section className="protocol-setup" aria-label="Meeting control policy">
                <div>
                  <span className="section-kicker">Chair control</span>
                  <div className="segmented-control protocol-mode-control">
                    <button type="button" className={controlMode === "auto" ? "active" : ""} onClick={() => setControlMode("auto")}>Auto</button>
                    <button type="button" className={controlMode === "checkpoints" ? "active" : ""} onClick={() => setControlMode("checkpoints")}>Checkpoints</button>
                    <button type="button" className={controlMode === "turn_by_turn" ? "active" : ""} onClick={() => setControlMode("turn_by_turn")}>Turn by turn</button>
                  </div>
                </div>
                <div>
                  <span className="section-kicker">Maximum rounds</span>
                  <div className="segmented-control round-limit-control">
                    {[1, 2, 3].map((rounds) => (
                      <button type="button" disabled={Boolean(planRequest) && rounds !== 1} className={maxRounds === rounds ? "active" : ""} onClick={() => setMaxRounds(rounds)} key={rounds}>{rounds}</button>
                    ))}
                  </div>
                </div>
              </section>

              <section className={`observer-setup ${observerDraft.enabled ? "enabled" : ""}`} aria-label="Observer configuration">
                <div className="observer-setup-heading">
                  <div>
                    <span className="section-kicker">Round Observer</span>
                    <strong>Check convergence after each review</strong>
                  </div>
                  <button
                    className={`seat-check ${observerDraft.enabled ? "checked" : ""}`}
                    type="button"
                    onClick={() => setObserverDraft((current) => ({ ...current, enabled: !current.enabled }))}
                    aria-pressed={observerDraft.enabled}
                    disabled={running}
                  >
                    {observerDraft.enabled ? "On" : "Off"}
                  </button>
                </div>
                {observerDraft.enabled ? (
                  <div className="observer-fields">
                    <label>
                      <span>Connection</span>
                      <select
                        value={observerDraft.connectionId}
                        onChange={(event) => chooseObserverConnection(event.target.value)}
                        disabled={running}
                      >
                        <option value="">Choose connection</option>
                        {connections.map((connection) => (
                          <option value={connection.id} key={connection.id}>
                            {connection.name} · {providerUi[connection.provider].label}
                          </option>
                        ))}
                        <option value="__add__">Add new connection…</option>
                      </select>
                    </label>
                    <label>
                      <span>Model</span>
                      <select
                        value={observerDraft.model}
                        onChange={(event) => setObserverDraft((current) => ({ ...current, model: event.target.value }))}
                        disabled={running || !observerDraft.connectionId}
                      >
                        {!connectionById.get(observerDraft.connectionId) ? <option value="">Choose connection first</option> : null}
                        {connectionById.get(observerDraft.connectionId)?.models.map((model) => (
                          <option value={model.id} key={model.id}>{modelOptionLabel(model)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
                <p>One extra bounded call per round. It reads Canonical State and the Process Report, never the full transcript.</p>
              </section>

              <div className="launch-zone">
                <div>
                  <strong>{seats.length >= 2 ? (taskMode === "review" ? "Review team is composed" : "Room is composed") : "Choose two or three seats"}</strong>
                  <span>{maximumProviderCalls > 0
                    ? `${maximumProviderCalls} calls · ${formatTokens(setupBudget.maxOutputTokens)} output · ${setupBudget.maxModelTimeMs ? `${formatDuration(setupBudget.maxModelTimeMs)} model time max` : "No cumulative time cutoff"}`
                    : "Bounded by rounds and seats"}</span>
                </div>
                <button className="primary-button" type="submit" disabled={!canStart}>
                  {taskMode === "review" ? "Start review" : "Start meeting"}
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
                    <i>{index + 1}</i>{phaseLabel(item, taskMode)}
                  </span>
                ))}
              </div>
              <div className="meeting-status">
                <span className={running ? "live-indicator on" : "live-indicator"}>
                  {running ? "Live" : phase}
                </span>
                <div className="segmented-control" aria-label="Transcript view">
                  <button type="button" className={transcriptMode === "focus" ? "active" : ""} onClick={() => setTranscriptMode("focus")}>Focus</button>
                  <button type="button" className={transcriptMode === "overview" ? "active" : ""} onClick={() => { setTranscriptMode("overview"); setFollowLive(true); }}>Overview</button>
                </div>
              </div>
            </header>

            {observerProgress ? (
              <div className="observer-live" role="status" aria-live="polite">
                <span className="turn-progress-mark" aria-hidden="true" />
                <div>
                  <span className="section-kicker">Round Observer</span>
                  <strong>{observerProgressLabel(observerProgress)}</strong>
                </div>
                <small>Canonical State + Process Report only</small>
              </div>
            ) : null}
            {reviewWork ? (
              <div className="review-work-live" role="status" aria-live="polite">
                <span className="turn-progress-mark" aria-hidden="true" />
                <div>
                  <span className="section-kicker">{reviewWork.stage === "editing" ? "Artifact Editor" : "Changed-material Verifier"}</span>
                  <strong>{turnProgressLabel(reviewWork.progress)}</strong>
                </div>
                <small>{reviewWork.label}</small>
              </div>
            ) : null}

            {displayedPlan && transcriptMode === "focus" ? <PlanView plan={displayedPlan} work={planWork} editedDays={planEditedDays} original={planArtifact ?? undefined} approved={Boolean(planApproval)} /> : transcriptMode === "focus" ? (
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
                          {turnStatusLabel(activeTranscriptItem)}
                        </span>
                      </header>
                      {activeTranscriptItem.target ? <div className="reviewing">Reviewing {activeTranscriptItem.target}</div> : null}
                      <div className="live-text" ref={liveTextRef} aria-live="polite">
                        {activeTranscriptItem.status === "streaming" ? (
                          <div className="turn-progress" role="status">
                            <span className="turn-progress-mark" aria-hidden="true" />
                            <strong>{turnProgressLabel(activeTranscriptItem.progress)}</strong>
                          </div>
                        ) : activeTranscriptItem.text}
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
                    {pinnedMessageId || !followLive ? <button type="button" className="text-button" onClick={() => { setPinnedMessageId(null); setFollowLive(true); }}>Follow live</button> : null}
                  </div>
                  <div className="timeline-list">
                    {transcript.map((item) => (
                      <button
                        type="button"
                        className={`timeline-item ${activeTranscriptItem?.id === item.id ? "active" : ""}`}
                        key={item.id}
                        onClick={() => { setPinnedMessageId(item.id); setFollowLive(false); }}
                      >
                        <span className={`timeline-dot ${item.status}`} />
                        <span>
                          <strong>{item.role === "host" ? "Agenda" : roleLabels[item.role]}</strong>
                          <small>{item.providerName} / {item.phase} · {turnStatusLabel(item)}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            ) : (
              <div
                className="overview-grid"
                ref={overviewRef}
                aria-live="polite"
                onScroll={(event) => {
                  const target = event.currentTarget;
                  const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
                  setFollowLive(distanceFromBottom < 32);
                }}
              >
                {transcript.map((item) => (
                  <article className={`overview-message ${item.provider}`} key={item.id}>
                    <header>
                      <span>{item.role === "host" ? "Human Chair" : roleLabels[item.role]}</span>
                      <small>{item.providerName} / {item.phase}</small>
                    </header>
                    {item.target ? <p className="reviewing">Reviews {item.target}</p> : null}
                    <div>{item.status === "streaming" ? turnProgressLabel(item.progress) : item.text}</div>
                  </article>
                ))}
              </div>
            )}

            {protocolState && !running &&
            (protocolState.status === "paused" || protocolState.status === "interrupted") &&
            protocolState.phase !== "human_gate" ? (
              <section className="chair-checkpoint" aria-label="Human Chair checkpoint">
                <div className="checkpoint-summary">
                  <span className="section-kicker">Human Chair checkpoint</span>
                  <h2>{protocolStatusLabel(protocolState)}</h2>
                  <p>{protocolState.status === "interrupted"
                    ? "The previous transition is recorded as interrupted. Its provider call may still have incurred cost. Continuing creates a new explicit transition; nothing retries automatically."
                    : "Add a scoped direction, continue the next safe phase, or return to the agenda."}</p>
                </div>
                <div className="directive-composer">
                  <select value={directiveKind} onChange={(event) => setDirectiveKind(event.target.value as ChairDirective["kind"])} aria-label="Directive type">
                    <option value="constraint">Constraint</option>
                    <option value="correction">Correction</option>
                    <option value="format" disabled={!["proposal", "review", "synthesis"].includes(protocolState.phase)}>Format repair · this phase only</option>
                    <option value="question">Question</option>
                    <option value="priority">Priority</option>
                    <option value="veto">Veto</option>
                  </select>
                  <select value={directiveTarget} onChange={(event) => setDirectiveTarget(event.target.value)} aria-label="Directive audience">
                    <option value="all">All seats</option>
                    {seats.map((seat, index) => <option value={seat.id} key={seat.id}>Seat {index + 1} · {roleLabels[seat.role]}</option>)}
                  </select>
                  <input value={directiveText} onChange={(event) => setDirectiveText(event.target.value)} maxLength={1_000} placeholder="Add a constraint, correction, priority, question, or veto" />
                  <button type="button" onClick={() => void addChairDirection()} disabled={!directiveText.trim()}>Add direction</button>
                </div>
                {meetingState?.activeChairDirectives.length ? (
                  <div className="directive-list">
                    {meetingState.activeChairDirectives.map((directive) => (
                      <span key={directive.id}><strong>{directive.kind}{directive.formatScope ? ` · ${directive.formatScope.phase} / round ${directive.formatScope.round}` : " · whole meeting"}</strong>{directive.text}</span>
                    ))}
                  </div>
                ) : null}
                {taskMode === "review" && reviewFindings.length > 0 ? (
                  <section className="finding-board" aria-label="Independent Findings">
                    <header>
                      <div>
                        <span className="section-kicker">Independent Findings</span>
                        <strong>{reviewFindings.length} material observation{reviewFindings.length === 1 ? "" : "s"}</strong>
                      </div>
                      <div className="finding-board-tools">
                        <span>Artifact v1 remains unchanged</span>
                        {protocolState.phase === "review_checkpoint" ? (
                          <button type="button" onClick={() => openChairFindingComposer()}>Add Finding</button>
                        ) : null}
                      </div>
                    </header>
                    {chairFindingOpen && protocolState.phase === "review_checkpoint" ? (
                      <div className="chair-finding-composer" aria-label="Chair Finding amendment">
                        <div>
                          <span className="section-kicker">{chairFindingTargetId ? "Amend Finding" : "Add missed Finding"}</span>
                          <strong>{chairFindingTargetId ? "Create a traceable replacement" : "Add a source-linked requirement before editing"}</strong>
                        </div>
                        <textarea
                          value={chairFindingText}
                          onChange={(event) => setChairFindingText(event.target.value)}
                          maxLength={500}
                          placeholder="State the issue and the required correction"
                          aria-label="Chair Finding text"
                        />
                        <select
                          value={chairFindingSourceKind}
                          onChange={(event) => setChairFindingSourceKind(event.target.value as ReviewFindingSourceKind)}
                          aria-label="Chair Finding source"
                        >
                          <option value="artifact">Artifact v1</option>
                          <option value="reference">Reference material</option>
                          <option value="truth_constraint">Truth constraints</option>
                        </select>
                        <textarea
                          value={chairFindingExcerpt}
                          onChange={(event) => setChairFindingExcerpt(event.target.value)}
                          maxLength={500}
                          placeholder="Paste an exact excerpt from the selected source"
                          aria-label="Chair Finding source excerpt"
                        />
                        <div className="chair-finding-actions">
                          <button type="button" onClick={closeChairFindingComposer}>Cancel</button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => void addChairFinding()}
                            disabled={chairFindingText.trim().length < 8 || !chairFindingExcerpt.trim()}
                          >
                            {chairFindingTargetId ? "Save amendment" : "Add accepted Finding"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <div className="finding-list">
                      {reviewFindings.map((finding, index) => {
                        const sourceTurn = finding.sourceMessageIds.flatMap((sourceId) => {
                          const turn = transcript.find((item) => item.id === sourceId && item.phase === "proposal");
                          return turn ? [turn] : [];
                        })[0];
                        return (
                          <article className="finding-row" key={finding.id}>
                            <span className={`finding-index ${finding.status}`}>{index + 1}</span>
                            <div>
                              <p>{finding.text}</p>
                              <footer>
                                <span>{finding.reviewSource
                                  ? `Human Chair · ${reviewFindingSourceLabel(finding.reviewSource.kind)}`
                                  : sourceTurn
                                    ? `${roleLabels[sourceTurn.role as RoleId]} · ${sourceTurn.providerName}`
                                    : "Published Finding"}</span>
                                <span>{finding.assumptionLevel === "low" ? "Source-bounded" : `${finding.assumptionLevel} inference`}</span>
                                <span>{claimStatusLabel(finding.status)}</span>
                              </footer>
                              <div className="finding-actions" aria-label={`Human decision for Finding ${index + 1}`}>
                                <button
                                  type="button"
                                  className={finding.status === "accepted_by_chair" ? "active accept" : ""}
                                  aria-pressed={finding.status === "accepted_by_chair"}
                                  onClick={() => void decideFinding(finding.id, "accept")}
                                  disabled={running || finding.status === "superseded"}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className={finding.status === "rejected_by_chair" ? "active reject" : ""}
                                  aria-pressed={finding.status === "rejected_by_chair"}
                                  onClick={() => void decideFinding(finding.id, "reject")}
                                  disabled={running || finding.status === "superseded"}
                                >
                                  Reject
                                </button>
                                {protocolState.phase === "review_checkpoint" && finding.status !== "superseded" ? (
                                  <button type="button" onClick={() => openChairFindingComposer(finding.id)} disabled={running}>
                                    Amend
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
                {taskMode === "review" && protocolState.phase === "review_checkpoint" ? (
                  <div className="review-artifact-route" aria-label="Artifact production roles">
                    <span>
                      <strong>Editor</strong>
                      {reviewArtifactRoleLabel(reviewArtifactSeatIds[0], seats)}
                    </span>
                    <span>
                      <strong>Verifier</strong>
                      {reviewArtifactRoleLabel(reviewArtifactSeatIds[1], seats)}
                    </span>
                    <span>{acceptedReviewFindings.length} accepted Finding{acceptedReviewFindings.length === 1 ? "" : "s"}</span>
                  </div>
                ) : null}
                {latestProcessReport && latestProcessReport.round === protocolState.round ? (
                  <div className={`process-report ${latestProcessReport.recommendation}`} aria-label="Deterministic process report">
                    <div>
                      <span className="section-kicker">Process report · State v{latestProcessReport.sourceStateVersion}</span>
                      <strong>{latestProcessReport.recommendation === "pause" ? "Chair review recommended" : "Structural progress detected"}</strong>
                    </div>
                    <span>{latestProcessReport.newClaimCount} claims</span>
                    <span>{latestProcessReport.claimUpdateCount} updates</span>
                    <span>{latestProcessReport.objectionCount} objections</span>
                    <span>{latestProcessReport.activeDisputeIds.length} open disputes</span>
                    {latestProcessReport.reasons.length > 0 ? <p>{processReasonLabel(latestProcessReport.reasons)}</p> : null}
                  </div>
                ) : null}
                {latestRoundBrief && latestRoundBrief.round === protocolState.round ? (
                  <article className={`round-brief ${latestRoundBrief.recommendation}`} aria-label="Observer Round Brief">
                    <header>
                      <div>
                        <span className="section-kicker">Round Brief · {latestRoundBrief.observer.provider}</span>
                        <strong>{observerRecommendationLabel(latestRoundBrief.recommendation)}</strong>
                      </div>
                      <span>Loop {latestRoundBrief.loopRisk} · Drift {latestRoundBrief.driftRisk}</span>
                    </header>
                    <p>{latestRoundBrief.summary}</p>
                    <p className="round-brief-reason">{latestRoundBrief.reason}</p>
                    <footer>
                      <span>State v{latestRoundBrief.sourceStateVersion}</span>
                      <span>{latestRoundBrief.sourceProcessReportId}</span>
                      <span>{latestRoundBrief.sourceTurnIds.length} source turns</span>
                    </footer>
                  </article>
                ) : null}
                {protocolState.phase === "review_checkpoint" && protocolState.round < protocolState.maxRounds && openDisputes.length > 0 ? (
                  <section className="targeted-debate-picker" aria-label="Targeted debate selection">
                    <div>
                      <span className="section-kicker">Optional next round</span>
                      <strong>Resolve one named dispute</strong>
                      <p>Only the two most relevant Seats receive this Dispute and its bounded source lineage.</p>
                    </div>
                    <label>
                      Open dispute
                      <select
                        value={selectedDispute?.id ?? ""}
                        onChange={(event) => setSelectedDisputeId(event.target.value)}
                      >
                        {openDisputes.map((dispute) => (
                          <option key={dispute.id} value={dispute.id}>
                            {dispute.severity} · {dispute.text.slice(0, 120)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="routed-seats" aria-label="Routed seats">
                      {routedDebateSeatIds.map((seatId) => {
                        const index = seats.findIndex((seat) => seat.id === seatId);
                        const seat = seats[index];
                        return seat ? <span key={seatId}>Seat {index + 1} · {roleLabels[seat.role]}</span> : null;
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => void startTargetedDebate()}
                      disabled={!roomCompositionMatches || routedDebateSeatIds.length === 0}
                    >
                      Debate this dispute
                    </button>
                  </section>
                ) : null}
                <div className="checkpoint-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => void continueMeeting()}
                    disabled={
                      (!roomCompositionMatches && !(planArtifact && planReady(planArtifact) && protocolState.phase === "synthesis")) ||
                      (taskMode === "review" && protocolState.phase === "review_checkpoint" && acceptedReviewFindings.length === 0) ||
                      savedPlanRecoveryUnavailable
                    }
                  >
                    {savedPlanRecoveryLabel ?? (taskMode === "review" && protocolState.phase === "review_checkpoint"
                      ? "Build Artifact v2"
                      : planRequest && protocolState.phase === "synthesis" ? (planArtifact && planReady(planArtifact) ? "Open reviewed plan" : planArtifact && !missingPlanDays(planArtifact).length ? "Resume plan review" : "Build missing plan days") : protocolContinueLabel(protocolState))}
                  </button>
                  {taskMode === "review" && protocolState.phase === "review_checkpoint" && acceptedReviewFindings.length === 0
                    ? <>
                        <button type="button" onClick={() => void keepOriginalReview()}
                          disabled={running || !meetingState || !prepareKeptOriginalReview(reviewInput?.artifact ?? "", meetingState, protocolState).ok}>
                          Keep original
                        </button>
                        <p>{reviewFindings.some((finding) => finding.status !== "rejected_by_chair" && finding.status !== "superseded")
                          ? "Accept or reject the remaining Findings."
                          : "No accepted changes. Retaining the original makes no additional model calls."}</p>
                      </>
                    : null}
                  {!roomCompositionMatches ? <p>Reconnect the saved providers, models, and roles before running more models.</p> : null}
                  {savedPlanRecoveryUnavailable && savedPlanRecoveryBudgetStatus
                    ? <p>Saved work is preserved, but recovery cannot run because {budgetStopLabel(savedPlanRecoveryBudgetStatus.reasons)}. No provider call will start.</p>
                    : null}
                </div>
              </section>
            ) : null}

            <footer className="meeting-controls">
              <div>
                <strong>Round {iteration}/{protocolState?.maxRounds ?? maxRounds}</strong>
                <span>{seats.length} seats / {transcript.filter((item) => item.status === "done").length} turns complete</span>
                {activeBudgetStatus ? <span>{activeBudgetStatus.remainingAgentTurns} call slots · {formatTokens(activeBudgetStatus.remainingOutputTokens)} output · {protocolState?.budget.maxModelTimeMs ? `${formatDuration(activeBudgetStatus.remainingModelTimeMs)} model time left` : "No cumulative time cutoff"}</span> : null}
              </div>
              {error ? <p className="control-error">{error}</p> : null}
              <div className="control-actions">
                {!running && savedPlanRecovery && protocolState?.phase === "stopped" ? <button type="button" onClick={() => void resumeSavedPlan()} disabled={!roomCompositionMatches || planSaving || savedPlanRecoveryUnavailable}>
                  {savedPlanRecoveryLabel}
                </button> : null}
                {running && protocolState?.controlMode === "auto" ? <button type="button" onClick={requestSafePause} disabled={raiseHandRequested}>{raiseHandRequested ? "Pause requested" : "Raise hand"}</button> : null}
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
                  <span className="section-kicker">{reviewResult ? `Review artifact / v${displayedReviewVersion}` : `Decision artifact / Round ${iteration}`}</span>
                  <h1>{planArtifact ? "Study plan" : reviewResult ? `Artifact v${displayedReviewVersion}` : "Decision memo"}</h1>
                </div>
                <span className={`decision-pill ${decision}`}>{decisionLabel(decision)}</span>
              </header>
              {planArtifact ? <>
                {planApproval ? <p>Approved plan · {new Date(planApproval.approvedAt).toLocaleString()}</p> : null}
                {editingPlanDay ? <PlanDayEditor
                  draft={editingPlanDay} request={planArtifact.request} saving={planSaving} error={error}
                  concerns={planArtifact.review?.concerns.filter((item) => item.day === editingPlanDay.day) ?? []}
                  onChange={setEditingPlanDay} onSave={() => void savePlanDayEdit()}
                  onCancel={() => { if (!planSavingRef.current) { setEditingPlanDay(null); setError(""); } }}
                  onRestore={() => { const original = modelRevisedPlan(planArtifact).days.find((day) => day.day === editingPlanDay.day); if (original) setEditingPlanDay(structuredClone(original)); }}
                /> : <PlanView plan={displayedPlan ?? planArtifact} approved={Boolean(planApproval)} editedDays={planEditedDays} original={planArtifact} initialDay={lastEditedPlanDay}
                  onEdit={decision === "pending" && !running && planDecisionReady(planArtifact) ? (day) => { setLastEditedPlanDay(day.day); setEditingPlanDay(structuredClone(day)); setError(""); } : undefined} />}
                <PlanAmendmentPanel key={`${currentRoomId}:${planArtifact.createdAt}`} plan={planArtifact} busy={running}
                  disabled={decision !== "pending" || planSaving || Boolean(editingPlanDay) || Boolean(planHumanRevision)}
                  onStart={(selected) => void runPlanAmendment(selected)} onRecheck={() => void runPlanAmendment()} onDismiss={() => void dismissPlanAmendment()} />
                {planHumanRevision ? <p className="plan-limit-note">Human edits are active. Model amendment is unavailable for this version; its model review does not cover your edits.</p> : null}
                {running ? <button type="button" className="danger-button" onClick={() => abortRef.current?.abort()}>Stop amendment</button> : null}
              </> : reviewResult ? (
                <div className="review-result-body">
                  <div className="segmented-control review-result-tabs" aria-label="Review result view">
                    {([
                      ["artifact", `Artifact v${displayedReviewVersion}`],
                      ["changes", `Change Set ${displayedReviewChanges.length}`],
                      ["verification", "Verification"],
                      ["brief", "Brief"],
                    ] as Array<[ReviewResultView, string]>).map(([view, label]) => (
                      <button
                        type="button"
                        className={reviewResultView === view ? "active" : ""}
                        onClick={() => setReviewResultView(view)}
                        key={view}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {reviewResultView === "artifact" ? (
                    <div className="approved-artifact-view">
                      {reviewResult.artifactVersion === 1 ? <p>Original retained without changes. Editor and Verifier were not run.</p> : null}
                      {reviewApprovedArtifact ? (
                        <div className="approved-artifact-notice">
                          <strong>Approved snapshot · Artifact v{reviewApprovedArtifact.artifactVersion}</strong>
                          <span>{new Date(reviewApprovedArtifact.approvedAt).toLocaleString()}</span>
                        </div>
                      ) : null}
                      <pre className="artifact-v2-output">{displayedReviewArtifact}</pre>
                    </div>
                  ) : null}
                  {reviewResultView === "changes" ? (
                    <div className="change-set-view">
                      {reviewResult.artifactVersion === 1 ? <p>No changes applied. Rejected Findings remain in the meeting history.</p> : null}
                      {reviewHumanRevision ? (
                        <div className="human-revision-notice">
                          <strong>Human revision · Artifact v3</strong>
                          <p>{reviewHumanRevision.editedChangeIds.length} replacement{reviewHumanRevision.editedChangeIds.length === 1 ? "" : "s"} changed by the Chair. Model verification remains attached to v2.</p>
                        </div>
                      ) : null}
                      {reviewApprovedArtifact ? (
                        <div className="approved-artifact-notice">
                          <strong>Immutable approved Change Set</strong>
                          <span>Frozen with Artifact v{reviewApprovedArtifact.artifactVersion}</span>
                        </div>
                      ) : null}
                      {displayedReviewChanges.map((change) => {
                        const check = reviewResult.verification.checks.find((item) => item.changeId === change.id);
                        const humanEdited = reviewApprovedArtifact?.humanEditedChangeIds.includes(change.id) ??
                          reviewHumanRevision?.editedChangeIds.includes(change.id) ?? false;
                        return (
                          <div className="change-set-row" key={change.id}>
                            <header>
                              <strong>{change.location}</strong>
                              <div className="change-row-actions">
                                <span className={`verification-status ${humanEdited ? "human-edited" : check?.status ?? "unverifiable"}`}>{humanEdited ? "Human edited" : verificationStatusLabel(check?.status)}</span>
                                {decision === "pending" ? (
                                  <button type="button" onClick={() => beginReviewChangeEdit(change.id)}>{editingReviewChangeId === change.id ? "Editing" : "Edit"}</button>
                                ) : null}
                              </div>
                            </header>
                            <div className="change-diff">
                              <div><span>Before</span><pre>{change.before}</pre></div>
                              <div>
                                <span>{humanEdited ? "After · Chair revision" : "After"}</span>
                                {editingReviewChangeId === change.id ? (
                                  <div className="change-edit-composer">
                                    <textarea
                                      value={reviewChangeDraft}
                                      onChange={(event) => setReviewChangeDraft(event.target.value)}
                                      maxLength={4_000}
                                      aria-label={`Replacement text for ${change.location}`}
                                    />
                                    <small>{reviewChangeDraft.length}/4000</small>
                                    <div>
                                      <button type="button" onClick={() => { setEditingReviewChangeId(""); setReviewChangeDraft(""); setError(""); }}>Cancel</button>
                                      <button type="button" className="primary-small" onClick={() => void saveReviewChangeEdit(change.id)}>Save revision</button>
                                    </div>
                                  </div>
                                ) : <pre>{change.after || "[Removed]"}</pre>}
                              </div>
                            </div>
                            <p>{change.rationale}</p>
                            <footer>
                              <span>{change.id}</span>
                              <span>{change.findingIds.join(", ")}</span>
                              <span>{change.basis}</span>
                              {humanEdited && decision === "pending" ? <button type="button" onClick={() => void restoreModelReviewChange(change.id)}>Restore model text</button> : null}
                            </footer>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  {reviewResultView === "verification" ? (
                    <div className="verification-view">
                      {reviewHumanRevision ? (
                        <div className="human-revision-notice verification-scope-notice">
                          <strong>Verification scope</strong>
                          <p>The model checks below cover Artifact v2. Chair-edited replacements in Artifact v3 require human review before approval.</p>
                        </div>
                      ) : null}
                      <header>
                        <span className={`verification-verdict ${reviewResult.verification.verdict}`}>{reviewResult.verification.verdict === "not_run" ? "Not run" : reviewResult.verification.verdict === "pass" ? "Passed" : "Needs revision"}</span>
                        <p>{reviewResult.verification.summary}</p>
                      </header>
                      {reviewResult.verification.checks.map((check) => (
                        <div className="verification-row" key={check.changeId}>
                          <strong>{check.changeId}</strong>
                          <span className={`verification-status ${check.status}`}>{verificationStatusLabel(check.status)}</span>
                          <div className="verification-dimensions">
                            <span>Lineage · {verificationStatusLabel(check.lineage)}</span>
                            <span>Semantics · {verificationStatusLabel(check.semantics)}</span>
                          </div>
                          <p>{check.note}</p>
                        </div>
                      ))}
                      {reviewResult.verification.unresolved.length > 0 ? (
                        <div className="verification-unresolved">
                          <strong>Human checks</strong>
                          {reviewResult.verification.unresolved.map((item) => <p key={item}>{item}</p>)}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {reviewResultView === "brief" ? <pre>{memo}</pre> : null}
                </div>
              ) : <pre>{memo || "The room has not produced a decision memo."}</pre>}
              <footer>
                <button type="button" onClick={() => { setTranscriptMode("overview"); setStage("meeting"); }}>Review transcript</button>
                {planArtifact ? <button type="button" disabled={Boolean(editingPlanDay) || planSaving} onClick={async () => { try { await navigator.clipboard.writeText(planText(displayedPlan ?? planArtifact, planEditedDays, planArtifact)); setCopied(true); } catch { setError("Clipboard unavailable."); } }}>{copied ? "Copied" : "Copy full plan"}</button> : null}
                {!planArtifact ? <button type="button" onClick={() => void (reviewResult ? copyReviewArtifact() : copyMemo())} disabled={!memo}>{copied ? "Copied" : reviewResult ? `Copy Artifact v${displayedReviewVersion}` : "Copy memo"}</button> : null}
              </footer>
            </article>

            <aside className="decision-rail">
              <section>
                <span className="section-kicker">Human gate</span>
                <h2>The room advises. You decide.</h2>
                <p>{planArtifact ? `${planArtifact.days.length} days · ${planArtifact.review?.concerns.length ?? 0} review concerns · ${planApproval ? "approved snapshot" : "awaiting your decision"}` : reviewResult ? reviewApprovedArtifact
                  ? `Artifact v${reviewApprovedArtifact.artifactVersion} frozen at approval · ${reviewApprovedArtifact.changeSet.length} changes`
                  : `${effectiveReviewChanges.length} changes · ${reviewHumanRevision ? "Chair revision requires human review" : reviewResult.verification.verdict === "not_run" ? "original retained, not model-verified" : reviewResult.verification.verdict === "pass" ? "verification passed" : "verification needs attention"}`
                  : "Approve the artifact, reject it, or add a scoped direction before spending another bounded round."}</p>
                <div className="decision-actions">
                  <button className="approve-button" type="button" onClick={() => void recordHumanDecision("approved")} disabled={running || decision !== "pending" || Boolean(editingReviewChangeId) || Boolean(editingPlanDay) || planSaving || Boolean(planArtifact && !planDecisionReady(planArtifact))}>{decision === "approved" ? (planArtifact ? "Plan approved" : reviewResult ? `Artifact v${displayedReviewVersion} approved` : "Memo approved") : (planArtifact ? "Approve plan" : reviewResult ? `Approve Artifact v${displayedReviewVersion}` : "Approve memo")}</button>
                  <button type="button" onClick={() => void continueMeeting()} disabled={running || decision !== "pending" || !memo || !protocolState || protocolState.phase !== "human_gate" || protocolState.round >= protocolState.maxRounds || !roomCompositionMatches}>Request another round</button>
                  <button className="reject-button" type="button" onClick={() => void recordHumanDecision("rejected")} disabled={running || decision !== "pending" || Boolean(editingPlanDay) || planSaving}>{decision === "rejected" ? (planArtifact ? "Plan rejected" : reviewResult ? "Artifact rejected" : "Memo rejected") : (planArtifact ? "Reject plan" : reviewResult ? `Reject Artifact v${displayedReviewVersion}` : "Reject memo")}</button>
                </div>
                {decision === "pending" && protocolState && protocolState.round < protocolState.maxRounds && !roomCompositionMatches ? (
                  <p className="revision-note">Reconnect seats with the original providers, models, and roles to request another round.</p>
                ) : null}
                {decision === "pending" && protocolState && protocolState.round >= protocolState.maxRounds ? (
                  <p className="revision-note">The declared round budget is exhausted. Approve, reject, or start a new room.</p>
                ) : null}
                {decision === "pending" && !planArtifact ? (
                  <div className="directive-composer decision-directive-composer">
                    <select value={directiveKind} onChange={(event) => setDirectiveKind(event.target.value as ChairDirective["kind"])} aria-label="Directive type">
                      <option value="constraint">Constraint</option>
                      <option value="correction">Correction</option>
                      <option value="question">Question</option>
                      <option value="priority">Priority</option>
                      <option value="veto">Veto</option>
                    </select>
                    <select value={directiveTarget} onChange={(event) => setDirectiveTarget(event.target.value)} aria-label="Directive audience">
                      <option value="all">All seats</option>
                      {seats.map((seat, index) => <option value={seat.id} key={seat.id}>Seat {index + 1}</option>)}
                    </select>
                    <input value={directiveText} onChange={(event) => setDirectiveText(event.target.value)} maxLength={1_000} placeholder="Add direction before another round" />
                    <button type="button" onClick={() => void addChairDirection()} disabled={!directiveText.trim()}>Add direction</button>
                  </div>
                ) : null}
              </section>
              <section className="usage-summary">
                <span className="section-kicker">Room usage</span>
                <dl>
                  <div><dt>Input</dt><dd>{formatTokens(usage.inputTokens)}</dd></div>
                  <div><dt>Output</dt><dd>{formatTokens(usage.outputTokens)}</dd></div>
                  <div title="Advisory estimate; model pricing is not verified."><dt>Estimated cost</dt><dd>{formatMoney(usage.estimatedUsd)}</dd></div>
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
                        <small>{record.taskMode === "review" ? "Review" : "Decide / Plan"} · {formatRoomDate(record.updatedAt)} · {record.participants.length} seats · {meetingRecordStatus(record)}</small>
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
                if (observerDraft.enabled && observerDraft.connectionId === connection.id) {
                  usedSeats.push("Observer");
                }
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
                      <small>{usedSeats.length ? `Used by ${usedSeats.join(", ")}` : "Not assigned"}</small>
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
              {process.env.NODE_ENV !== "production" ? (
              <section className="stage-replay-panel">
                <div>
                  <span className="section-kicker">Development / Stage replay</span>
                  <strong>{replayKind === "review_verifier_v1" ? "Review Verifier fixture v2" : "S1 baseline / resume-truth-v1"}</strong>
                  <small>One paid provider call, {replayKind === "review_verifier_v1" ? "600" : "2,400"} output-token cap, no retry, and no Meeting write.</small>
                </div>
                <label>
                  <span>Probe</span>
                  <select aria-label="Probe" value={replayKind} disabled={replayRunning} onChange={(event) => {
                    setReplayKind(event.target.value as typeof replayKind);
                    setReplayResult(null);
                    setReplayError("");
                  }}>
                    <option value="review_verifier_v1">Verifier fixture v2</option>
                    <option value="review_baseline_resume_v1">S1 resume baseline</option>
                  </select>
                </label>
                <label>
                  <span>Connection</span>
                  <select
                    value={replayConnection?.id ?? ""}
                    onChange={(event) => {
                      const connection = connectionById.get(event.target.value);
                      setReplayConnectionId(event.target.value);
                      setReplayModelId(connection?.models[0]?.id ?? "");
                      setReplayResult(null);
                      setReplayError("");
                    }}
                    disabled={replayRunning || connections.length === 0}
                  >
                    {connections.map((connection) => (
                      <option key={connection.id} value={connection.id}>{connection.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Model</span>
                  <select
                    value={effectiveReplayModel}
                    onChange={(event) => {
                      setReplayModelId(event.target.value);
                      setReplayResult(null);
                      setReplayError("");
                    }}
                    disabled={replayRunning || !replayConnection}
                  >
                    {(replayConnection?.models ?? []).map((model) => (
                      <option key={model.id} value={model.id}>{modelOptionLabel(model)}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => void runReviewReplay()}
                  disabled={replayRunning || !replayConnection || !effectiveReplayModel}
                >
                  {replayRunning ? "Running one call..." : replayKind === "review_verifier_v1" ? "Replay Verifier" : "Run S1 baseline"}
                </button>
                {replayResult ? (
                  <div className={!replayResult.ok ? "stage-replay-result failed" : replayResult.stage === "review_baseline" ? "stage-replay-result unscored" : "stage-replay-result passed"}>
                    <strong>{replayResult.stage === "review_baseline"
                      ? replayResult.ok ? "Response captured / not scored" : "Request failed / not scored"
                      : replayResult.ok ? "Contract passed" : "Contract rejected"}</strong>
                    <span>{replayResult.provider} / {replayResult.model}</span>
                    {replayResult.usage ? <span>
                      {formatTokens(replayResult.usage.inputTokens)} input · {formatTokens(replayResult.usage.outputTokens)} output · {formatMoney(replayResult.usage.estimatedUsd)} estimated · {formatDuration(replayResult.usage.latencyMs)}
                    </span> : <span>Usage and cost unknown; the provider may have billed this request.</span>}
                    <span>{replayResult.costEstimate
                      ? `Provider-rate estimate: $${replayResult.costEstimate.inputUsdPerMTok}/M input (${replayResult.costEstimate.inputRateSource === "runtime_override" ? "runtime override" : "provider default"}), $${replayResult.costEstimate.outputUsdPerMTok}/M output (${replayResult.costEstimate.outputRateSource === "runtime_override" ? "runtime override" : "provider default"}). Not model-verified; not an invoice.`
                      : "Estimate basis was not recorded for this receipt. Not model-verified; not an invoice."}</span>
                    <p>{replayResult.ok ? replayResult.verification?.summary : replayResult.diagnostic}</p>
                    {replayResult.outputAtCap ? <p className="inline-error">Output limit reached; inspect for truncation.</p> : null}
                    {replayResult.stage === "review_baseline" ? (
                      <>
                        <button className="text-button" type="button" onClick={downloadBaselineReceipt}>Download evidence</button>
                        <ReplayReceipt key={replayResult.requestId} receipt={replayResult} />
                      </>
                    ) : null}
                    <details open={replayResult.stage === "review_baseline"}>
                      <summary>Raw provider output</summary>
                      <pre>{replayResult.rawOutput}</pre>
                    </details>
                  </div>
                ) : null}
                {replayError ? <p className="inline-error">{replayError}</p> : null}
              </section>
              ) : null}
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
              <div><span className="section-kicker">Project truth / v0.10a</span><h2 id="project-title">Build the protocol, not a model carousel</h2></div>
              <button type="button" className="quiet-button" onClick={() => setProjectOpen(false)}>Close</button>
            </header>
            <p className="project-thesis">The room verifies session connections, reuses them across provider-neutral seats, and keeps a local archive of completed meeting content. Account sync, evidence verification, durable BYOK, custom endpoints, and execution remain future work.</p>
            <div className="milestone-stack">
              {milestones.map(([id, title, detail]) => (
                <article className={id === "M2.10" ? "current" : ""} key={id}>
                  <span>{id}</span><div><strong>{title}</strong><p>{detail}</p></div>
                </article>
              ))}
            </div>
            <footer>Current gate: verify one bounded Observer plus named-Dispute route before expanding the decision workspace.</footer>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

async function readEvents(stream: ReadableStream<Uint8Array>, onEvent: (event: DiscussEvent) => void | Promise<void>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) await onEvent(JSON.parse(line) as DiscussEvent);
  }
  buffer += decoder.decode();
  if (buffer.trim()) await onEvent(JSON.parse(buffer) as DiscussEvent);
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function createRoomId() {
  return `meeting-${createRequestId()}`;
}

function sessionConnectionPayload(
  seats: SeatRequest[],
  connectionById: Map<string, ConnectionRecord>,
  observer?: ObserverRequest,
) {
  return Object.fromEntries(
    [...seats, ...(observer ? [observer] : [])].flatMap((item) => {
      const connection = connectionById.get(item.connectionId);
      return connection?.source === "session" && connection.apiKey
        ? [[connection.id, { provider: connection.provider, apiKey: connection.apiKey }]]
        : [];
    }),
  );
}

function observerIsPending(state: MeetingProtocolState) {
  return state.observerEnabled &&
    state.phase === "review_checkpoint" &&
    state.status === "paused" &&
    !state.roundBriefs.some((brief) => brief.round === state.round);
}

function observerMatches(
  protocol: MeetingProtocolState | null,
  snapshot: ObserverSnapshot | null,
  request: ObserverRequest | null,
  connectionById: Map<string, ConnectionRecord>,
) {
  if (!protocol?.observerEnabled) return true;
  if (!snapshot || !request) return false;
  const connection = connectionById.get(request.connectionId);
  return Boolean(
    connection &&
    snapshot.provider === request.provider &&
    snapshot.model === request.model &&
    connection.provider === snapshot.provider
  );
}

function phaseContextTurns(
  transcript: TranscriptItem[],
  round: number,
  state: MeetingState | null,
) {
  const appliedTurnIds = state ? new Set(state.appliedTurnIds) : null;
  const includedTurnIds = new Set<string>();
  return transcript.flatMap((item) => {
    if (
      item.status !== "done" ||
      !item.envelope ||
      !item.seatId ||
      item.round !== round ||
      (item.phase !== "proposal" && item.phase !== "review") ||
      (appliedTurnIds && !appliedTurnIds.has(item.id)) ||
      includedTurnIds.has(item.id)
    ) return [];
    includedTurnIds.add(item.id);
    return [{
      id: item.id,
      seatId: item.seatId,
      round,
      phase: item.phase,
      envelope: item.envelope,
    }];
  });
}

function legacyProtocolState(record: MeetingRecord): MeetingProtocolState | null {
  if (!record.memo || record.participants.length < 2) return null;
  const base = createMeetingProtocolState(
    record.participants.map((_, index) => `seat-${index + 1}`),
    "checkpoints",
    2,
    record.updatedAt,
  );
  if (record.decision === "approved" || record.decision === "rejected") {
    return finishProtocol({ ...base, round: record.iteration }, record.updatedAt);
  }
  return {
    ...base,
    round: record.iteration,
    phase: "human_gate",
    status: "paused",
    pendingSeatIds: [],
    completedSeatIds: [],
    updatedAt: record.updatedAt,
  };
}

function turnProgressLabel(progress: TranscriptItem["progress"]) {
  if (progress === "generating") return "Generating response";
  if (progress === "validating") return "Validating turn";
  return "Thinking";
}

function observerProgressLabel(progress: AgentProgress) {
  if (progress === "generating") return "Drafting a bounded Round Brief";
  if (progress === "validating") return "Checking every source reference";
  return "Inspecting convergence and loop risk";
}

function observerRecommendationLabel(recommendation: MeetingProtocolState["roundBriefs"][number]["recommendation"]) {
  if (recommendation === "targeted_debate") return "Debate a named dispute";
  if (recommendation === "ask_human") return "Ask the Human Chair";
  if (recommendation === "synthesize") return "Ready for synthesis";
  return "Continue the bounded discussion";
}

function turnStatusLabel(item: TranscriptItem) {
  if (item.status === "streaming") return turnProgressLabel(item.progress);
  if (item.status === "error") return "Stopped";
  return item.provider === "host" ? "Posted" : "Ready";
}

function protocolStatusLabel(state: MeetingProtocolState) {
  if (state.status === "interrupted") return "Interrupted · explicit resume required";
  if (state.phase === "proposal_checkpoint") return "Proposal checkpoint";
  if (state.phase === "review_checkpoint") return "Cross-review checkpoint";
  if (state.phase === "human_gate") return "Human decision required";
  if (state.phase === "complete") return "Meeting complete";
  if (state.phase === "stopped" && state.stopReason === "budget") return "Budget exhausted";
  if (state.phase === "stopped" && state.stopReason === "human") return "Stopped by the Human Chair";
  if (state.phase === "stopped") return "Meeting stopped";
  if (state.phase === "proposal" && state.status === "paused") return "Proposal turn paused";
  if (state.phase === "review" && state.status === "paused") return "Cross-review turn paused";
  if (state.phase === "targeted_debate" && state.status === "paused") return "Targeted debate paused";
  if (state.phase === "proposal") return "Ready for proposals";
  if (state.phase === "review") return "Ready for cross-review";
  if (state.phase === "targeted_debate") return "Ready for targeted debate";
  return "Ready for synthesis";
}

function protocolContinueLabel(state: MeetingProtocolState) {
  if (state.status === "interrupted") return "Resume with a new transition";
  if (state.phase === "proposal_checkpoint") return "Continue to cross-review";
  if (state.phase === "review_checkpoint") return "Continue to synthesis";
  if (state.phase === "proposal" || state.phase === "review" || state.phase === "targeted_debate") return "Run next seat";
  return "Continue meeting";
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
  if (record.protocolState?.status === "interrupted") return "Resume required";
  if (record.protocolState?.status === "paused") return "Chair checkpoint";
  return "Meeting saved";
}

function createConnectionId(provider: ProviderId) {
  const suffix = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `session-${provider}-${suffix}`;
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

function phaseLabel(phase: "proposal" | "review" | "synthesis", taskMode: TaskMode) {
  if (taskMode === "review") {
    if (phase === "proposal") return "Findings";
    if (phase === "review") return "Cross-check";
    return "Artifact v2";
  }
  if (phase === "proposal") return "Proposals";
  if (phase === "review") return "Cross-review";
  return "Memo";
}

function claimStatusLabel(status: MeetingState["claims"][number]["status"]) {
  if (status === "provisionally_supported") return "Provisionally supported";
  if (status === "accepted_by_chair") return "Accepted by Chair";
  if (status === "rejected_by_chair") return "Rejected by Chair";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function phaseState(phase: "proposal" | "review" | "synthesis", current: "agenda" | "proposal" | "review" | "synthesis") {
  const order = { agenda: 0, proposal: 1, review: 2, synthesis: 3 };
  if (order[phase] < order[current]) return "complete";
  if (phase === current) return "active";
  return "";
}

function reviewArtifactRoleLabel(seatId: string | undefined, seats: SeatRequest[]) {
  const index = seats.findIndex((seat) => seat.id === seatId);
  const seat = seats[index];
  return seat ? `Seat ${index + 1} · ${roleLabels[seat.role]}` : "Unavailable";
}

function verificationStatusLabel(
  status: ReviewArtifactResult["verification"]["checks"][number]["status"] | undefined,
) {
  if (status === "supported") return "Supported";
  if (status === "unsupported") return "Unsupported";
  return "Unverifiable";
}

function reviewFindingSourceLabel(kind: ReviewFindingSourceKind) {
  if (kind === "artifact") return "Artifact v1";
  if (kind === "reference") return "Reference material";
  return "Truth constraints";
}

function createReviewArtifactBudget(
  base: ReturnType<typeof createDefaultMeetingBudget>,
  maxRounds: number,
) {
  return {
    maxAgentTurns: base.maxAgentTurns + maxRounds * 2,
    maxInputTokens: base.maxInputTokens + maxRounds * 18_000,
    maxOutputTokens: base.maxOutputTokens + maxRounds * 6_000,
    maxModelTimeMs: base.maxModelTimeMs + maxRounds * 180_000,
  };
}

function createDecisionPackageBudget(
  base: ReturnType<typeof createDefaultMeetingBudget>,
  maxRounds: number,
) {
  return {
    maxAgentTurns: base.maxAgentTurns + maxRounds,
    maxInputTokens: base.maxInputTokens + maxRounds * 6_000,
    // The initial synthesis uses 4,800 tokens instead of the base 1,200,
    // and one explicit synthesis recovery receives the same bounded cap.
    maxOutputTokens: base.maxOutputTokens + maxRounds * 8_400,
    maxModelTimeMs: base.maxModelTimeMs + maxRounds * 90_000,
  };
}

function createPlanBudget() {
  return {
    maxAgentTurns: 2,
    maxInputTokens: 50_000,
    maxOutputTokens: planLimits.builderTokens + planLimits.reviewerTokens,
    maxModelTimeMs: 0,
  };
}

function ensureReviewArtifactBudget(state: MeetingProtocolState, seatCount: number) {
  const required = createReviewArtifactBudget(
    createDefaultMeetingBudget(seatCount, state.maxRounds, state.observerEnabled),
    state.maxRounds,
  );
  return {
    ...state,
    budget: {
      maxAgentTurns: Math.max(state.budget.maxAgentTurns, required.maxAgentTurns),
      maxInputTokens: Math.max(state.budget.maxInputTokens, required.maxInputTokens),
      maxOutputTokens: Math.max(state.budget.maxOutputTokens, required.maxOutputTokens),
      maxModelTimeMs: Math.max(state.budget.maxModelTimeMs, required.maxModelTimeMs),
    },
  };
}

function ensureDecisionPackageBudget(
  state: MeetingProtocolState,
  seatCount: number,
  transcript: TranscriptItem[] = [],
) {
  const required = createDecisionPackageBudget(
    createDefaultMeetingBudget(seatCount, state.maxRounds, state.observerEnabled),
    state.maxRounds,
  );
  const latestTransition = state.transitions.at(-1);
  const failedBeforeProviderStart = Boolean(
    latestTransition?.phase === "synthesis" &&
    latestTransition.status === "interrupted" &&
    !transcript.some((item) => item.id.startsWith(`${latestTransition.id}-`)),
  );
  const usedAgentTurns = state.transitions.reduce(
    (total, transition) => total + (
      transition.phase === "synthesis" || transition.phase === "observer"
        ? Math.max(1, transition.seatIds.length)
        : transition.seatIds.length
    ),
    0,
  );
  return {
    ...state,
    budget: {
      // A rejected local phase request never reached a provider and therefore
      // must not consume the room's provider-call allowance.
      maxAgentTurns: Math.max(
        state.budget.maxAgentTurns,
        required.maxAgentTurns,
        failedBeforeProviderStart ? usedAgentTurns + 1 : 0,
      ),
      maxInputTokens: Math.max(state.budget.maxInputTokens, required.maxInputTokens),
      maxOutputTokens: Math.max(state.budget.maxOutputTokens, required.maxOutputTokens),
      maxModelTimeMs: Math.max(state.budget.maxModelTimeMs, required.maxModelTimeMs),
    },
  };
}

function budgetStopLabel(reasons: ReturnType<typeof evaluateMeetingBudget>["reasons"]) {
  return reasons.map((reason) => {
    if (reason === "turn_limit") return "agent-turn limit reached";
    if (reason === "input_token_limit") return "input-token limit reached";
    if (reason === "output_token_limit") return "output-token limit reached";
    return "model-time limit reached";
  }).join(", ");
}

function processReasonLabel(reasons: MeetingProtocolState["processReports"][number]["reasons"]) {
  return reasons.map((reason) => {
    if (reason === "low_progress") return "Two consecutive windows added no structural progress.";
    if (reason === "repeated_disputes") return "Open disputes repeated without a Claim update.";
    return "Participant theses converged while assumptions remain open.";
  }).join(" ");
}

function safeClientError(error: unknown) {
  return error instanceof Error ? error.message : "An unknown meeting error occurred.";
}
