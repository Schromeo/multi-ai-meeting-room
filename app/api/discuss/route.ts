import {
  DiscussEvent,
  ObserverRequest,
  providerIds,
  ProviderId,
  ProviderSummary,
  RoundBrief,
  roleIds,
  roleBriefs,
  roleLabels,
  RoleId,
  SeatRequest,
  UsageSummary,
} from "../../../lib/discuss-protocol";
import {
  parseProcessReport,
  routeSeatsForDispute,
  type ProcessReport,
} from "../../../lib/meeting-orchestrator";
import {
  createInitialMeetingState,
  MeetingState,
  parseMeetingState,
  parseTurnEnvelope,
  reduceTurnEnvelope,
  renderMeetingStateContext,
  TurnEnvelope,
  TurnPhase,
} from "../../../lib/meeting-state";

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

type CompletedTurn = ProviderResult & {
  envelope: TurnEnvelope;
};

type DiscussRequest = {
  objective?: unknown;
  seats?: unknown;
  connections?: unknown;
  iteration?: unknown;
  priorMemo?: unknown;
  requestId?: unknown;
  meetingState?: unknown;
  protocolPhase?: unknown;
  seatIds?: unknown;
  contextTurns?: unknown;
  observer?: unknown;
  processReport?: unknown;
  targetedDisputeId?: unknown;
};

type PhaseContextTurn = {
  id: string;
  seatId: string;
  round: number;
  phase: "proposal" | "review";
  envelope: TurnEnvelope;
};

type SessionConnection = {
  provider: ProviderId;
  apiKey: string;
};

type AgentWork = Omit<SeatRequest, "id"> & {
  id: string;
  seatId: string;
  round: number;
  config: ProviderConfig;
  text?: string;
};

const MAX_OBJECTIVE_LENGTH = 4_000;
const MAX_MEMO_LENGTH = 12_000;
const MAX_OUTPUT_TOKENS = 1_200;
const MAX_OBSERVER_OUTPUT_TOKENS = 300;
const MAX_TARGETED_DEBATE_OUTPUT_TOKENS = 250;
const PROVIDER_TIMEOUT_MS = 90_000;

export async function GET() {
  const providers = providerIds.map((id) => publicProvider(getProviderConfig(id)));
  return Response.json({
    providers,
    configuredCount: providers.filter((provider) => provider.configured).length,
    minParticipants: 2,
    maxParticipants: 3,
    defaultMaxRounds: 2,
    maxIterations: 5,
  });
}

export async function POST(request: Request) {
  let body: DiscussRequest;
  try {
    body = (await request.json()) as DiscussRequest;
  } catch {
    return Response.json({ error: "The meeting request must be valid JSON." }, { status: 400 });
  }

  if (body.protocolPhase !== undefined) return phaseResponse(request, body);

  const validation = validateRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { objective, seats, connections, iteration, priorMemo, requestId, meetingState } =
    validation.value;
  const work = seats.map((seat, index): AgentWork => ({
    ...seat,
    id: `${requestId}-${iteration}-${seat.id}-${index}`,
    seatId: seat.id,
    round: iteration,
    config: getProviderConfig(
      seat.provider,
      seat.connectionId === `workspace-${seat.provider}`
        ? undefined
        : connections[seat.connectionId],
      seat.model,
    ),
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
        let canonicalState = meetingState ?? createInitialMeetingState(objective);
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
              buildProposalPrompt(objective, item.role, iteration, priorMemo, canonicalState),
              buildSystemPrompt(item.role),
              request.signal,
              emit,
            );
            item.text = result.envelope.statement;
            return { item, result };
          }),
        );

        const proposalCandidates = successfulResults(proposalResults);
        const proposalReduction = reduceCompletedTurns(
          canonicalState,
          proposalCandidates,
          "proposal",
          emit,
        );
        canonicalState = proposalReduction.state;
        const proposals = proposalReduction.accepted;
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
              buildReviewPrompt(
                objective,
                target.role,
                target.config.name,
                target.text ?? "",
                canonicalState,
              ),
              buildSystemPrompt(item.role),
              request.signal,
              emit,
              `${roleLabels[target.role]} / ${target.config.name}`,
            );
            return { item: reviewWork, result, target };
          }),
        );

        const reviewCandidates = successfulResults(reviewResults);
        const reviewReduction = reduceCompletedTurns(
          canonicalState,
          reviewCandidates,
          "review",
          emit,
        );
        canonicalState = reviewReduction.state;
        const reviews = reviewReduction.accepted;
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
        const synthesisCandidate = await runAgent(
          synthesisWork,
          "synthesis",
          buildSynthesisPrompt(
            objective,
            proposals.map(({ item }) => item),
            reviews.map(({ item, result, target }) => ({ item, result, target })),
            iteration,
            canonicalState,
          ),
          buildSystemPrompt("synthesizer"),
          request.signal,
          emit,
        );
        const synthesisReduction = reduceCompletedTurns(
          canonicalState,
          [{ item: synthesisWork, result: synthesisCandidate }],
          "synthesis",
          emit,
        );
        canonicalState = synthesisReduction.state;
        const synthesis = synthesisReduction.accepted[0]?.result;
        if (!synthesis) {
          throw new Error("The synthesis could not update Canonical Meeting State. The room stopped.");
        }

        const allResults = [
          ...proposalCandidates.map(({ item, result }) => ({ result, config: item.config })),
          ...reviewCandidates.map(({ item, result }) => ({ result, config: item.config })),
          { result: synthesis, config: synthesisWork.config },
        ];

        emit({
          type: "room.done",
          requestId,
          iteration,
          memo: synthesis.envelope.statement,
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

function phaseResponse(request: Request, body: DiscussRequest) {
  const validation = validatePhaseRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  const {
    objective,
    seats,
    connections,
    round,
    priorMemo,
    requestId,
    meetingState,
    protocolPhase,
    seatIds,
    contextTurns,
    targetedDisputeId,
  } = validation.value;
  if (protocolPhase === "observer") {
    return observerPhaseResponse(request, validation.value);
  }
  const workBySeatId = new Map(
    seats.map((seat) => [
      seat.id,
      createAgentWork(
        seat,
        requestId,
        round,
        connections,
        protocolPhase === "targeted_debate" ? "review" : protocolPhase,
      ),
    ]),
  );
  const selectedWork = seatIds.flatMap((seatId) => {
    const item = workBySeatId.get(seatId);
    return item ? [item] : [];
  });
  const missing = [...workBySeatId.values()].filter((item) => !item.config.configured);
  if (missing.length > 0) {
    return Response.json(
      { error: `Missing API connections for: ${missing.map((item) => item.config.name).join(", ")}.` },
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
        let canonicalState = meetingState;
        emit({ type: "room.start", requestId, iteration: round, participantCount: seats.length });
        emit({
          type: "phase.start",
          phase: protocolPhase,
          label: protocolPhase === "proposal"
            ? round === 1 ? "Independent proposals" : `Revision round ${round}`
            : protocolPhase === "review" ? "Assigned cross-review"
              : protocolPhase === "targeted_debate" ? `Targeted debate · ${targetedDisputeId}`
                : "Decision memo",
        });

        if (protocolPhase === "proposal") {
          if (selectedWork.some((item) => canonicalState.appliedTurnIds.includes(item.id))) {
            throw new Error("This transition is already present in Canonical Meeting State.");
          }
          const results = await Promise.allSettled(
            selectedWork.map(async (item) => {
              assertUnappliedTurn(canonicalState, item.id);
              const result = await runAgent(
                item,
                "proposal",
                buildProposalPrompt(objective, item.role, round, priorMemo, canonicalState),
                buildSystemPrompt(item.role),
                request.signal,
                emit,
              );
              item.text = result.envelope.statement;
              return { item, result };
            }),
          );
          const candidates = successfulResults(results);
          const reduction = reduceCompletedTurns(canonicalState, candidates, "proposal", emit);
          canonicalState = reduction.state;
          if (reduction.accepted.length === 0) {
            throw new Error("No pending participant completed a proposal. The phase stopped.");
          }
          const accepted = reduction.accepted;
          emit({
            type: "phase.done",
            requestId,
            phase: "proposal",
            round,
            completedSeatIds: accepted.map(({ item }) => item.seatId),
            usage: totalUsage(accepted.map(({ item, result }) => ({ result, config: item.config }))),
          });
        } else if (protocolPhase === "review") {
          if (selectedWork.some((item) => canonicalState.appliedTurnIds.includes(item.id))) {
            throw new Error("This transition is already present in Canonical Meeting State.");
          }
          const proposalTurns = contextTurns.filter((item) => item.round === round && item.phase === "proposal");
          const orderedProposals = seats.flatMap((seat) => {
            const turn = proposalTurns.find((item) => item.seatId === seat.id);
            const item = workBySeatId.get(seat.id);
            if (!turn || !item) return [];
            return [{
              turn,
              item: { ...item, id: turn.id, text: turn.envelope.statement },
            }];
          });
          const results = await Promise.allSettled(
            selectedWork.map(async (item) => {
              assertUnappliedTurn(canonicalState, item.id);
              const reviewerIndex = orderedProposals.findIndex(({ item: proposal }) => proposal.seatId === item.seatId);
              const target = orderedProposals[(reviewerIndex + 1) % orderedProposals.length];
              if (!target) throw new Error("The review target is unavailable.");
              const result = await runAgent(
                item,
                "review",
                buildReviewPrompt(
                  objective,
                  target.item.role,
                  target.item.config.name,
                  target.turn.envelope.statement,
                  canonicalState,
                ),
                buildSystemPrompt(item.role),
                request.signal,
                emit,
                `${roleLabels[target.item.role]} / ${target.item.config.name}`,
              );
              return { item, result, target: target.item };
            }),
          );
          const candidates = successfulResults(results);
          const reduction = reduceCompletedTurns(canonicalState, candidates, "review", emit);
          canonicalState = reduction.state;
          if (reduction.accepted.length === 0) {
            throw new Error("No pending participant completed a cross-review. The phase stopped.");
          }
          const accepted = reduction.accepted;
          emit({
            type: "phase.done",
            requestId,
            phase: "review",
            round,
            completedSeatIds: accepted.map(({ item }) => item.seatId),
            usage: totalUsage(accepted.map(({ item, result }) => ({ result, config: item.config }))),
          });
        } else if (protocolPhase === "targeted_debate") {
          const dispute = canonicalState.disputes.find(
            (item) => item.id === targetedDisputeId && item.status === "open",
          );
          if (!dispute) throw new Error("The targeted Dispute is no longer open.");
          if (selectedWork.some((item) => canonicalState.appliedTurnIds.includes(item.id))) {
            throw new Error("This transition is already present in Canonical Meeting State.");
          }
          const results = await Promise.allSettled(
            selectedWork.map(async (item) => {
              assertUnappliedTurn(canonicalState, item.id);
              const result = await runAgent(
                item,
                "review",
                buildTargetedDebatePrompt(objective, dispute.id, canonicalState),
                buildSystemPrompt(item.role),
                request.signal,
                emit,
                `Dispute ${dispute.id}`,
                MAX_TARGETED_DEBATE_OUTPUT_TOKENS,
              );
              if (
                result.envelope.card.newClaims.length > 0 ||
                result.envelope.card.claimUpdates.length > 1 ||
                result.envelope.card.objections.length > 1
              ) {
                throw new Error("The targeted response exceeded its bounded delta contract.");
              }
              return { item, result };
            }),
          );
          const candidates = successfulResults(results);
          const reduction = reduceCompletedTurns(canonicalState, candidates, "review", emit);
          canonicalState = reduction.state;
          if (reduction.accepted.length === 0) {
            throw new Error("No routed participant completed the targeted debate. The phase stopped.");
          }
          const accepted = reduction.accepted;
          emit({
            type: "phase.done",
            requestId,
            phase: "targeted_debate",
            round,
            completedSeatIds: accepted.map(({ item }) => item.seatId),
            usage: totalUsage(accepted.map(({ item, result }) => ({ result, config: item.config }))),
          });
        } else {
          const proposalTurns = contextTurns.filter((item) => item.round === round && item.phase === "proposal");
          const reviewTurns = contextTurns.filter((item) => item.round === round && item.phase === "review");
          const proposalWork = proposalTurns.flatMap((turn) => {
            const base = workBySeatId.get(turn.seatId);
            if (!base) return [];
            return [{ ...base, id: turn.id, text: turn.envelope.statement }];
          });
          const chosen = (seatIds[0] ? workBySeatId.get(seatIds[0]) : undefined) ??
            proposalWork.find((item) => item.role === "synthesizer") ??
            proposalWork.find((item) => item.role === "strategist") ??
            proposalWork[0] ??
            [...workBySeatId.values()].find((item) => item.role === "synthesizer") ??
            [...workBySeatId.values()].find((item) => item.role === "strategist") ??
            [...workBySeatId.values()][0];
          if (!chosen) throw new Error("No configured Seat is available for synthesis.");
          const synthesisWork: AgentWork = {
            ...chosen,
            id: `${requestId}-${round}-${chosen.seatId}-synthesis`,
            role: "synthesizer",
          };
          assertUnappliedTurn(canonicalState, synthesisWork.id);
          const reviews = reviewTurns.flatMap((turn) => {
            const reviewer = workBySeatId.get(turn.seatId);
            const reviewerIndex = proposalWork.findIndex((item) => item.seatId === turn.seatId);
            const target = proposalWork[(reviewerIndex + 1) % proposalWork.length];
            if (!reviewer || !target) return [];
            const result: CompletedTurn = {
              text: turn.envelope.statement,
              envelope: turn.envelope,
              inputTokens: 0,
              outputTokens: 0,
              latencyMs: 0,
            };
            return [{ item: { ...reviewer, id: turn.id }, result, target }];
          });
          const synthesis = await runAgent(
            synthesisWork,
            "synthesis",
            buildSynthesisPrompt(
              objective,
              proposalWork,
              reviews,
              round,
              canonicalState,
              targetedDisputeId,
              reviewTurns,
            ),
            buildSystemPrompt("synthesizer"),
            request.signal,
            emit,
          );
          const reduction = reduceCompletedTurns(
            canonicalState,
            [{ item: synthesisWork, result: synthesis }],
            "synthesis",
            emit,
          );
          canonicalState = reduction.state;
          const accepted = reduction.accepted[0];
          if (!accepted) throw new Error("The synthesis could not update Canonical Meeting State.");
          const phaseUsage = totalUsage([{ result: synthesis, config: synthesisWork.config }]);
          emit({
            type: "phase.done",
            requestId,
            phase: "synthesis",
            round,
            completedSeatIds: [synthesisWork.seatId],
            usage: phaseUsage,
            memo: synthesis.envelope.statement,
          });
          emit({
            type: "room.done",
            requestId,
            iteration: round,
            memo: synthesis.envelope.statement,
            usage: phaseUsage,
          });
        }
      } catch (error) {
        const rawMessage = request.signal.aborted
          ? "The meeting was stopped by the host."
          : safeErrorMessage(error);
        const message = [...workBySeatId.values()].reduce(
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

function observerPhaseResponse(
  request: Request,
  value: Extract<ReturnType<typeof validatePhaseRequest>, { ok: true }>["value"],
) {
  const { observer, processReport, meetingState, connections, requestId, round } = value;
  if (!observer || !processReport) {
    return Response.json({ error: "Observer phase is missing validated inputs." }, { status: 400 });
  }
  const config = getProviderConfig(
    observer.provider,
    observer.connectionId === `workspace-${observer.provider}`
      ? undefined
      : connections[observer.connectionId],
    observer.model,
  );
  if (!config.configured) {
    return Response.json({ error: `Missing API connection for Observer / ${config.name}.` }, { status: 503 });
  }

  const observerId = `${requestId}-${round}-observer`;
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
        emit({ type: "room.start", requestId, iteration: round, participantCount: 1 });
        emit({ type: "phase.start", phase: "observer", label: "Round health check" });
        emit({
          type: "observer.start",
          id: observerId,
          round,
          provider: observer.provider,
          connectionName: config.name,
          model: config.model,
        });
        emit({ type: "observer.progress", id: observerId, stage: "thinking" });
        let generationStarted = false;
        const result = await streamProvider(
          config,
          buildObserverSystemPrompt(),
          buildObserverPrompt(meetingState, processReport),
          request.signal,
          () => {
            if (!generationStarted) {
              generationStarted = true;
              emit({ type: "observer.progress", id: observerId, stage: "generating" });
            }
          },
          MAX_OBSERVER_OUTPUT_TOKENS,
        );
        emit({ type: "observer.progress", id: observerId, stage: "validating" });
        const parsed = parseObserverOutput(result.text, meetingState);
        const usage = usageForResult(result, config);
        if (!parsed.ok) {
          emit({ type: "observer.format_error", id: observerId, message: parsed.error, usage });
          throw new ObserverFormatError(parsed.error);
        }
        const brief: RoundBrief = {
          id: `round-brief-r${round}-v${meetingState.version}`,
          round,
          sourceStateVersion: meetingState.version,
          sourceProcessReportId: processReport.id,
          sourceTurnIds: [...processReport.sourceTurnIds],
          createdAt: new Date().toISOString(),
          ...parsed.value,
          observer: { provider: observer.provider, model: observer.model },
          usage,
        };
        emit({ type: "observer.done", id: observerId, brief, usage });
        emit({
          type: "phase.done",
          requestId,
          phase: "observer",
          round,
          completedSeatIds: [],
          usage,
        });
      } catch (error) {
        if (!(error instanceof ObserverFormatError)) {
          const rawMessage = request.signal.aborted
            ? "The meeting was stopped by the host."
            : safeErrorMessage(error);
          emit({
            type: "observer.error",
            id: observerId,
            message: redactSecret(rawMessage, config.apiKey),
          });
        }
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

function validatePhaseRequest(body: DiscussRequest):
  | {
      ok: true;
      value: {
        objective: string;
        seats: SeatRequest[];
        connections: Record<string, SessionConnection>;
        round: number;
        priorMemo: string;
        requestId: string;
        meetingState: MeetingState;
        protocolPhase: TurnPhase | "observer" | "targeted_debate";
        seatIds: string[];
        contextTurns: PhaseContextTurn[];
        observer?: ObserverRequest;
        processReport?: ProcessReport;
        targetedDisputeId?: string;
      };
    }
  | { ok: false; error: string } {
  const round = Number(body.iteration);
  if (!Number.isInteger(round) || round < 1 || round > 5) {
    return { ok: false, error: "The protocol round must be between one and five." };
  }
  if (!isApiPhase(body.protocolPhase)) {
    return { ok: false, error: "The protocol phase is invalid." };
  }
  const observer = body.observer === undefined ? undefined : parseObserverRequest(body.observer);
  if (body.observer !== undefined && !observer) {
    return { ok: false, error: "The Observer connection, provider, or model is invalid." };
  }
  if (body.protocolPhase === "observer" && !observer) {
    return { ok: false, error: "Observer phase requires an explicit Observer configuration." };
  }
  const base = validateRequest({
    ...body,
    iteration: round > 1 ? 2 : 1,
    priorMemo: round > 1
      ? body.protocolPhase === "targeted_debate" ||
        (body.protocolPhase === "synthesis" && body.targetedDisputeId !== undefined)
        ? "Targeted debate uses Canonical Meeting State instead of a prior Memo."
        : body.priorMemo
      : "",
    meetingState: round > 1 ? body.meetingState : undefined,
    protocolPhase: undefined,
  }, observer ? [observer] : []);
  if (!base.ok) return base;
  const meetingState = parseMeetingState(body.meetingState);
  if (!meetingState || meetingState.objective !== base.value.objective) {
    return { ok: false, error: "The phase requires matching Canonical Meeting State." };
  }
  if (!Array.isArray(body.seatIds) || body.seatIds.length > 3 || !body.seatIds.every(isIdentifier)) {
    return { ok: false, error: "The pending Seat selection is invalid." };
  }
  const seatIds = [...new Set(body.seatIds as string[])];
  const knownSeats = new Set(base.value.seats.map((seat) => seat.id));
  if (seatIds.some((seatId) => !knownSeats.has(seatId))) {
    return { ok: false, error: "A pending Seat does not belong to this room." };
  }
  if (body.protocolPhase !== "synthesis" && body.protocolPhase !== "observer" && seatIds.length === 0) {
    return { ok: false, error: "A proposal or review phase requires at least one pending Seat." };
  }
  if (body.protocolPhase === "synthesis" && seatIds.length > 1) {
    return { ok: false, error: "Synthesis accepts at most one selected Seat." };
  }
  if (body.protocolPhase === "observer" && seatIds.length > 0) {
    return { ok: false, error: "Observer phase does not accept participant Seats." };
  }
  let targetedDisputeId: string | undefined;
  if (body.protocolPhase === "targeted_debate" || body.protocolPhase === "synthesis") {
    if (body.protocolPhase === "synthesis" && body.targetedDisputeId === undefined) {
      targetedDisputeId = undefined;
    } else {
    if (!isIdentifier(body.targetedDisputeId)) {
      return { ok: false, error: "Targeted debate requires one named Dispute." };
    }
    const dispute = meetingState.disputes.find(
      (item) => item.id === body.targetedDisputeId && item.status === "open",
    );
    if (!dispute) return { ok: false, error: "The targeted Dispute is not open in Canonical Meeting State." };
    if (body.protocolPhase === "targeted_debate") {
      const routedSeatIds = routeSeatsForDispute(meetingState, dispute, base.value.seats.map((seat) => seat.id));
      if (seatIds.length > 2 || seatIds.some((seatId) => !routedSeatIds.includes(seatId))) {
        return { ok: false, error: "Targeted debate Seats do not match the deterministic Dispute route." };
      }
    }
    targetedDisputeId = dispute.id;
    }
  } else if (body.targetedDisputeId !== undefined) {
    return { ok: false, error: "A named Dispute is only valid for targeted debate." };
  }
  const contextTurns = parsePhaseContextTurns(body.contextTurns, base.value.seats, round, meetingState);
  if (!contextTurns) return { ok: false, error: "The bounded phase context is invalid." };
  const proposals = contextTurns.filter((turn) => turn.phase === "proposal");
  const reviews = contextTurns.filter((turn) => turn.phase === "review");
  if (body.protocolPhase === "review" && proposals.length < 2) {
    return { ok: false, error: "Cross-review requires at least two accepted proposals." };
  }
  if (body.protocolPhase === "synthesis") {
    const hasTargetedDelta = Boolean(targetedDisputeId) && reviews.length >= 1;
    if (!hasTargetedDelta && (proposals.length < 2 || reviews.length < 1)) {
      return { ok: false, error: "Synthesis requires accepted proposals and cross-review, or one named targeted delta." };
    }
  }
  const processReport = body.protocolPhase === "observer"
    ? parseProcessReport(body.processReport)
    : undefined;
  if (body.protocolPhase === "observer") {
    if (!processReport || !observer) {
      return { ok: false, error: "Observer phase requires a valid Process Report." };
    }
    const knownTurnIds = new Set(meetingState.appliedTurnIds);
    if (
      processReport.round !== round ||
      processReport.sourceStateVersion !== meetingState.version ||
      processReport.sourceTurnIds.some((turnId) => !knownTurnIds.has(turnId))
    ) {
      return { ok: false, error: "The Process Report does not match Canonical Meeting State." };
    }
  }
  return {
    ok: true,
    value: {
      objective: base.value.objective,
      seats: base.value.seats,
      connections: base.value.connections,
      round,
      priorMemo: base.value.priorMemo,
      requestId: base.value.requestId,
      meetingState,
      protocolPhase: body.protocolPhase,
      seatIds,
      contextTurns,
      ...(observer ? { observer } : {}),
      ...(processReport ? { processReport } : {}),
      ...(targetedDisputeId ? { targetedDisputeId } : {}),
    },
  };
}

function parsePhaseContextTurns(
  value: unknown,
  seats: SeatRequest[],
  round: number,
  state: MeetingState,
): PhaseContextTurn[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 12) return null;
  const knownSeats = new Set(seats.map((seat) => seat.id));
  const turns: PhaseContextTurn[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const item = candidate as Record<string, unknown>;
    if (
      !isIdentifier(item.id) ||
      !isIdentifier(item.seatId) ||
      !knownSeats.has(item.seatId) ||
      item.round !== round ||
      (item.phase !== "proposal" && item.phase !== "review") ||
      !state.appliedTurnIds.includes(item.id)
    ) return null;
    const envelope = parseTurnEnvelope(item.envelope, item.phase);
    if (!envelope.ok) return null;
    turns.push({
      id: item.id,
      seatId: item.seatId,
      round,
      phase: item.phase,
      envelope: envelope.value,
    });
  }
  if (new Set(turns.map((item) => item.id)).size !== turns.length) return null;
  return turns;
}

function parseObserverRequest(value: unknown): ObserverRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    !hasOnlyKeys(item, ["connectionId", "provider", "model"]) ||
    typeof item.connectionId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,120}$/.test(item.connectionId) ||
    typeof item.provider !== "string" ||
    !providerIds.includes(item.provider as ProviderId) ||
    typeof item.model !== "string" ||
    !/^[a-zA-Z0-9._:/-]{1,160}$/.test(item.model.trim())
  ) return null;
  return {
    connectionId: item.connectionId,
    provider: item.provider as ProviderId,
    model: item.model.trim(),
  };
}

function createAgentWork(
  seat: SeatRequest,
  requestId: string,
  round: number,
  connections: Record<string, SessionConnection>,
  phase: TurnPhase,
): AgentWork {
  return {
    ...seat,
    id: `${requestId}-${round}-${seat.id}-${phase}`,
    seatId: seat.id,
    round,
    config: getProviderConfig(
      seat.provider,
      seat.connectionId === `workspace-${seat.provider}` ? undefined : connections[seat.connectionId],
      seat.model,
    ),
  };
}

function assertUnappliedTurn(state: MeetingState, turnId: string) {
  if (state.appliedTurnIds.includes(turnId)) {
    throw new Error("This transition is already present in Canonical Meeting State.");
  }
}

function validateRequest(body: DiscussRequest, additionalConnections: ObserverRequest[] = []):
  | {
      ok: true;
      value: {
        objective: string;
        seats: SeatRequest[];
        connections: Record<string, SessionConnection>;
        iteration: 1 | 2;
        priorMemo: string;
        requestId: string;
        meetingState?: MeetingState;
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
    const id = (candidate as { id?: unknown }).id;
    const connectionId = (candidate as { connectionId?: unknown }).connectionId;
    const model = (candidate as { model?: unknown }).model;
    if (
      typeof id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(id) ||
      typeof connectionId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,120}$/.test(connectionId) ||
      typeof provider !== "string" ||
      !providerIds.includes(provider as ProviderId) ||
      typeof model !== "string" ||
      !/^[a-zA-Z0-9._:/-]{1,160}$/.test(model.trim()) ||
      typeof role !== "string" ||
      !roleIds.includes(role as RoleId)
    ) {
      return { ok: false, error: "A participant has an invalid seat, connection, model, provider, or role." };
    }
    if (seen.has(id)) {
      return { ok: false, error: "Each participant must have a unique seat id." };
    }
    seen.add(id);
    seats.push({
      id,
      connectionId,
      provider: provider as ProviderId,
      model: model.trim(),
      role: role as RoleId,
    });
  }

  const connectionResult = validateSessionConnections(body.connections, seats, additionalConnections);
  if (!connectionResult.ok) return connectionResult;

  const iteration = body.iteration === 2 ? 2 : 1;
  const priorMemo = typeof body.priorMemo === "string" ? body.priorMemo : "";
  if (iteration === 2 && priorMemo.trim().length === 0) {
    return { ok: false, error: "A revision round requires the previous decision memo." };
  }
  if (priorMemo.length > MAX_MEMO_LENGTH) {
    return { ok: false, error: `The prior memo must be under ${MAX_MEMO_LENGTH} characters.` };
  }
  const meetingState =
    body.meetingState === undefined ? undefined : parseMeetingState(body.meetingState);
  if (body.meetingState !== undefined && !meetingState) {
    return { ok: false, error: "The supplied Canonical Meeting State is invalid." };
  }
  if (meetingState && (iteration !== 2 || meetingState.objective !== body.objective.trim())) {
    return { ok: false, error: "Canonical Meeting State belongs only to a matching revision room." };
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
      ...(meetingState ? { meetingState } : {}),
    },
  };
}

function validateSessionConnections(
  value: unknown,
  seats: SeatRequest[],
  additionalConnections: ObserverRequest[] = [],
):
  | { ok: true; value: Record<string, SessionConnection> }
  | { ok: false; error: string } {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    return { ok: false, error: "Session connections must be a provider-keyed object." };
  }

  const activeConnectionIds = new Set([
    ...seats.map((seat) => seat.connectionId),
    ...additionalConnections.map((item) => item.connectionId),
  ]);
  const connections: Record<string, SessionConnection> = {};
  for (const [connectionId, candidate] of Object.entries(value ?? {})) {
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(connectionId) || !activeConnectionIds.has(connectionId)) {
      return { ok: false, error: "A session connection does not belong to an active seat." };
    }
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return { ok: false, error: "A session connection is malformed." };
    }
    const apiKey = (candidate as { apiKey?: unknown }).apiKey;
    const provider = (candidate as { provider?: unknown }).provider;
    if (
      typeof provider !== "string" ||
      !providerIds.includes(provider as ProviderId) ||
      typeof apiKey !== "string" ||
      apiKey.trim().length < 8 ||
      apiKey.length > 512 ||
      /\s/.test(apiKey)
    ) {
      return { ok: false, error: "A session API key is invalid." };
    }
    connections[connectionId] = {
      provider: provider as ProviderId,
      apiKey: apiKey.trim(),
    };
  }
  for (const seat of seats) {
    const connection = connections[seat.connectionId];
    if (connection && connection.provider !== seat.provider) {
      return { ok: false, error: "A seat provider does not match its session connection." };
    }
    if (!connection && seat.connectionId !== `workspace-${seat.provider}`) {
      return { ok: false, error: "A seat references an unavailable connection." };
    }
  }
  for (const item of additionalConnections) {
    const connection = connections[item.connectionId];
    if (connection && connection.provider !== item.provider) {
      return { ok: false, error: "The Observer provider does not match its session connection." };
    }
    if (!connection && item.connectionId !== `workspace-${item.provider}`) {
      return { ok: false, error: "Observer references an unavailable connection." };
    }
  }
  return { ok: true, value: connections };
}

async function runAgent(
  item: AgentWork,
  phase: TurnPhase,
  prompt: string,
  system: string,
  signal: AbortSignal,
  emit: (event: DiscussEvent) => void,
  target?: string,
  maxOutputTokens = MAX_OUTPUT_TOKENS,
): Promise<CompletedTurn> {
  emit({
    type: "agent.start",
    id: item.id,
    seatId: item.seatId,
    connectionId: item.connectionId,
    connectionName: item.config.name,
    provider: item.provider,
    role: item.role,
    model: item.config.model,
    round: item.round,
    phase,
    target,
  });

  try {
    const result = await streamProvider(
      item.config,
      system,
      prompt,
      signal,
      (delta) => emit({ type: "agent.delta", id: item.id, delta }),
      maxOutputTokens,
    );
    emit({ type: "agent.progress", id: item.id, stage: "validating" });
    const parsed = parseTurnEnvelope(result.text, phase);
    if (!parsed.ok) {
      emit({
        type: "agent.format_error",
        id: item.id,
        message: parsed.error,
        usage: usageForResult(result, item.config),
      });
      throw new TurnFormatError(parsed.error);
    }
    return { ...result, envelope: parsed.value };
  } catch (error) {
    if (!(error instanceof TurnFormatError)) {
      emit({
        type: "agent.error",
        id: item.id,
        message: redactSecret(safeErrorMessage(error), item.config.apiKey),
      });
    }
    throw error;
  }
}

async function streamProvider(
  config: ProviderConfig,
  system: string,
  prompt: string,
  parentSignal: AbortSignal,
  onDelta: (delta: string) => void,
  maxOutputTokens = MAX_OUTPUT_TOKENS,
): Promise<ProviderResult> {
  if (!config.apiKey) throw new Error(`${config.name} is not configured.`);
  const controller = new AbortController();
  const abort = () => controller.abort(parentSignal.reason);
  parentSignal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => controller.abort("provider_timeout"), PROVIDER_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    if (config.id === "openai") {
      return await streamOpenAI(config, system, prompt, controller.signal, onDelta, startedAt, maxOutputTokens);
    }
    if (config.id === "anthropic") {
      return await streamAnthropic(config, system, prompt, controller.signal, onDelta, startedAt, maxOutputTokens);
    }
    return await streamGemini(config, system, prompt, controller.signal, onDelta, startedAt, maxOutputTokens);
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
  maxOutputTokens: number,
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
      max_output_tokens: maxOutputTokens,
      ...(supportsMinimalReasoning(config.model)
        ? { reasoning: { effort: "minimal" } }
        : {}),
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

function supportsMinimalReasoning(model: string) {
  return /^gpt-5(?:-(?:mini|nano))?(?:-\d{4}-\d{2}-\d{2})?$/.test(model);
}

async function streamAnthropic(
  config: ProviderConfig,
  system: string,
  prompt: string,
  signal: AbortSignal,
  onDelta: (delta: string) => void,
  startedAt: number,
  maxOutputTokens: number,
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
      max_tokens: maxOutputTokens,
      system,
      messages: [{ role: "user", content: prompt }],
      stream: true,
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
  maxOutputTokens: number,
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
        generationConfig: { maxOutputTokens },
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
    "Return only one valid JSON object matching the requested Turn Envelope. Do not use markdown fences or add text outside the JSON.",
  ].join("\n");
}

function buildObserverSystemPrompt() {
  return [
    "You are the non-participant Observer in a bounded multi-AI meeting.",
    "Diagnose convergence, repetition, drift, and the next useful boundary action.",
    "Do not add claims, settle disputes, rewrite Canonical State, or act as the final synthesizer.",
    "Use only IDs present in the supplied allowlists.",
    "Return only one valid JSON object matching the requested schema, without markdown fences or commentary.",
  ].join("\n");
}

function buildObserverPrompt(state: MeetingState, report: ProcessReport) {
  const allowed = {
    focusClaimIds: state.claims.map((claim) => claim.id),
    remainingDisputeIds: state.disputes
      .filter((dispute) => dispute.status === "open")
      .map((dispute) => dispute.id),
    chairQuestionIds: state.openQuestions
      .filter((question) => question.status === "open")
      .map((question) => question.id),
  };
  return [
    "CANONICAL MEETING STATE (bounded, authoritative):",
    renderMeetingStateContext(state, 5_000),
    "",
    "DETERMINISTIC PROCESS REPORT:",
    JSON.stringify(report),
    "",
    "REFERENCE ALLOWLISTS:",
    JSON.stringify(allowed),
    "",
    "Return this exact JSON shape:",
    "{",
    '  "summary": "2-4 concise sentences about what changed and what remains",',
    '  "focusClaimIds": ["claim-id"],',
    '  "remainingDisputeIds": ["open-dispute-id"],',
    '  "chairQuestionIds": ["open-question-id"],',
    '  "convergence": "low|healthy|premature",',
    '  "loopRisk": "low|medium|high",',
    '  "driftRisk": "low|medium|high",',
    '  "recommendation": "continue|targeted_debate|ask_human|synthesize",',
    '  "reason": "one concise reason"',
    "}",
    "Use empty arrays when no IDs qualify. Do not invent IDs.",
  ].join("\n");
}

type ObserverAssessment = Omit<
  RoundBrief,
  | "id"
  | "round"
  | "sourceStateVersion"
  | "sourceProcessReportId"
  | "sourceTurnIds"
  | "createdAt"
  | "observer"
  | "usage"
>;

function parseObserverOutput(
  text: string,
  state: MeetingState,
): { ok: true; value: ObserverAssessment } | { ok: false; error: string } {
  let value: unknown;
  try {
    value = JSON.parse(stripOneJsonFence(text));
  } catch {
    return { ok: false, error: "Observer returned invalid JSON." };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Observer output must be one JSON object." };
  }
  const item = value as Record<string, unknown>;
  const keys = [
    "summary",
    "focusClaimIds",
    "remainingDisputeIds",
    "chairQuestionIds",
    "convergence",
    "loopRisk",
    "driftRisk",
    "recommendation",
    "reason",
  ];
  if (!hasOnlyKeys(item, keys)) {
    return { ok: false, error: "Observer output contains missing or unsupported fields." };
  }
  if (
    !isBoundedText(item.summary, 1, 2_000) ||
    !isIdentifierList(item.focusClaimIds, 6) ||
    !isIdentifierList(item.remainingDisputeIds, 6) ||
    !isIdentifierList(item.chairQuestionIds, 6) ||
    !isConvergence(item.convergence) ||
    !isRisk(item.loopRisk) ||
    !isRisk(item.driftRisk) ||
    !isObserverRecommendation(item.recommendation) ||
    !isBoundedText(item.reason, 1, 1_000)
  ) {
    return { ok: false, error: "Observer output does not match the bounded Round Brief schema." };
  }
  const claimIds = new Set(state.claims.map((claim) => claim.id));
  const openDisputeIds = new Set(
    state.disputes.filter((dispute) => dispute.status === "open").map((dispute) => dispute.id),
  );
  const openQuestionIds = new Set(
    state.openQuestions.filter((question) => question.status === "open").map((question) => question.id),
  );
  if (
    item.focusClaimIds.some((id) => !claimIds.has(id)) ||
    item.remainingDisputeIds.some((id) => !openDisputeIds.has(id)) ||
    item.chairQuestionIds.some((id) => !openQuestionIds.has(id))
  ) {
    return { ok: false, error: "Observer referenced an unknown or closed Canonical State record." };
  }
  return {
    ok: true,
    value: {
      summary: item.summary.trim(),
      focusClaimIds: [...item.focusClaimIds],
      remainingDisputeIds: [...item.remainingDisputeIds],
      chairQuestionIds: [...item.chairQuestionIds],
      convergence: item.convergence,
      loopRisk: item.loopRisk,
      driftRisk: item.driftRisk,
      recommendation: item.recommendation,
      reason: item.reason.trim(),
    },
  };
}

function stripOneJsonFence(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);
  return match?.[1]?.trim() ?? trimmed;
}

function buildProposalPrompt(
  objective: string,
  role: RoleId,
  iteration: number,
  priorMemo: string,
  state: MeetingState,
) {
  const revision =
    iteration === 2
      ? `\nThis is bounded revision round ${iteration}. Address unresolved disputes in the prior memo and state what you changed. Prefer claimUpdates using IDs from CURRENT CANONICAL STATE; add at most one genuinely new Claim.\n\nPRIOR MEMO:\n${priorMemo}\n\nCURRENT CANONICAL STATE:\n${renderMeetingStateContext(state)}`
      : "";
  return `MEETING OBJECTIVE:\n${objective}\n\nAs ${roleLabels[role]}, provide a concise proposal as a Turn Envelope. Use up to three newClaims, mark no more than two as medium/high assumptions, use up to two objections, and ask at most one questionForChair. claimUpdates must be empty because no canonical Claim IDs have been published yet.${revision}\n\n${turnEnvelopeSchema("proposal")}`;
}

function buildReviewPrompt(
  objective: string,
  targetRole: RoleId,
  targetProvider: string,
  proposal: string,
  state: MeetingState,
) {
  return `MEETING OBJECTIVE:\n${objective}\n\nREVIEW TARGET: ${roleLabels[targetRole]} using ${targetProvider}\n\nTARGET PROPOSAL:\n${proposal}\n\nCURRENT CANONICAL STATE:\n${renderMeetingStateContext(state)}\n\nReview this specific proposal. The statement should name its strongest valid point, most consequential weakness, unsupported factual claims, concrete revision, and verdict. Use only published Claim IDs from CURRENT CANONICAL STATE in targetClaimId or claimUpdates. Do not repeat the proposal or review unrelated ideas. Do not introduce external evidence, named examples, or empirical claims that are absent from CURRENT CANONICAL STATE; label them unverified instead.\n\n${turnEnvelopeSchema("review")}`;
}

function buildTargetedDebatePrompt(objective: string, disputeId: string, state: MeetingState) {
  const dispute = state.disputes.find((item) => item.id === disputeId && item.status === "open");
  if (!dispute) throw new Error("The targeted Dispute is unavailable.");
  const claim = dispute.targetClaimId
    ? state.claims.find((item) => item.id === dispute.targetClaimId)
    : undefined;
  const sourceMessageIds = [...new Set([
    ...dispute.sourceMessageIds,
    ...(claim?.sourceMessageIds ?? []),
  ])].slice(0, 8);
  const context = {
    dispute,
    targetClaim: claim ?? null,
    sourceMessageIds,
    activeChairDirectives: state.activeChairDirectives.filter(
      (directive) => directive.status === "active",
    ).slice(0, 4),
  };
  return `MEETING OBJECTIVE:\n${objective}\n\nNAMED DISPUTE:\n${JSON.stringify(context)}\n\nRespond only to this Dispute. State whether its target Claim should be supported, opposed, or revised; identify the smallest concrete change that could resolve it; and use no facts outside this bounded source context. Do not summarize the room or open unrelated topics. If this context cannot resolve the Dispute, return no_new_information and ask one precise question for the Human Chair. Use only the target Claim ID in claimUpdates or targetClaimId.\n\nTargeted debate limits: statement at most 100 words; no newClaims; at most 1 claimUpdate and 1 objection. Keep each field to one sentence.\n\n${turnEnvelopeSchema("review")}`;
}

function buildSynthesisPrompt(
  objective: string,
  proposals: AgentWork[],
  reviews: Array<{ item: AgentWork; result: CompletedTurn; target: AgentWork }>,
  iteration: number,
  state: MeetingState,
  targetedDisputeId?: string,
  targetedReviewTurns: PhaseContextTurn[] = [],
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
        `REVIEW ${index + 1} — ${roleLabels[item.role]} / ${item.config.name} reviewing ${roleLabels[target.role]} / ${target.config.name}:\n${result.envelope.statement}`,
    )
    .join("\n\n");

  const targetedDeltaText = targetedDisputeId
    ? targetedReviewTurns
        .map((turn, index) => {
          const reviewer = turn.seatId;
          return `TARGETED RESPONSE ${index + 1} — ${reviewer}:\n${turn.envelope.statement}`;
        })
        .join("\n\n")
    : "";
  const workingTurns = targetedDisputeId
    ? `NAMED DISPUTE: ${targetedDisputeId}\n\n${targetedDeltaText}`
    : `${proposalText}\n\n${reviewText}`;

  return `MEETING OBJECTIVE:\n${objective}\n\nROUND: ${iteration}\n\nCURRENT CANONICAL STATE:\n${renderMeetingStateContext(state)}\n\n${workingTurns}\n\nCreate the decision memo inside the Turn Envelope statement. Do not force consensus and do not invent evidence. The statement must use exactly these headings:\n\n# Recommendation\n# Agreements\n# Unresolved Disputes\n# Unverified Assumptions\n# Tradeoffs\n# Next Actions\n\nUnder Recommendation, state one clear recommendation or explicitly state that the evidence is insufficient. Preserve important minority objections and identify what requires a human decision. Keep newClaims, claimUpdates, and objections empty; synthesis organizes the validated discussion but does not create new canonical records.\n\n${turnEnvelopeSchema("synthesis")}`;
}

function turnEnvelopeSchema(phase: TurnPhase) {
  const phaseLimits = phase === "proposal"
    ? "Proposal limits: statement at most 140 words; at most 3 newClaims, 0 claimUpdates, and 2 objections."
    : phase === "review"
      ? "Review limits: statement at most 120 words; at most 1 newClaim, 2 claimUpdates, and 2 objections. Keep each text and reason to one sentence."
      : "Synthesis limits: statement at most 700 words; newClaims, claimUpdates, and objections must be empty arrays.";
  return [
    phaseLimits,
    "Return only this JSON shape:",
    "{",
    '  "statement": "the visible concise response",',
    '  "card": {',
    `    "stance": "${phase === "proposal" ? "propose" : phase === "review" ? "support|oppose|revise|no_new_information" : "support|revise"}",`,
    '    "thesis": "one sentence",',
    '    "newClaims": [{"text": "claim", "assumptionLevel": "low|medium|high"}],',
    '    "claimUpdates": [{"claimId": "published-claim-id", "action": "support|oppose|revise|withdraw", "reason": "why"}],',
    '    "objections": [{"text": "objection", "severity": "minor|material|blocking"}],',
    '    "questionForChair": "optional question",',
    '    "recommendedAction": "optional action",',
    '    "confidence": {"level": "low|medium|high", "reason": "why"}',
    "  }",
    "}",
    "Use empty arrays when a collection has no entries. Omit optional fields instead of writing null.",
  ].join("\n");
}

function getProviderConfig(id: ProviderId, session?: SessionConnection, model?: string): ProviderConfig {
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
    model: model ?? value.model,
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

function reduceCompletedTurns<T extends { item: AgentWork; result: CompletedTurn }>(
  initialState: MeetingState,
  turns: T[],
  phase: TurnPhase,
  emit: (event: DiscussEvent) => void,
) {
  let state = initialState;
  const accepted: T[] = [];
  for (const turn of turns) {
    const usage = usageForResult(turn.result, turn.item.config);
    const reduction = reduceTurnEnvelope(state, {
      id: turn.item.id,
      sourceMessageId: turn.item.id,
      seatId: turn.item.seatId,
      round: turn.item.round,
      phase,
      envelope: turn.result.envelope,
      usage,
    });
    if (!reduction.ok) {
      emit({
        type: "agent.reduction_error",
        id: turn.item.id,
        message: reduction.error.message,
        envelope: turn.result.envelope,
        usage,
      });
      continue;
    }
    state = reduction.state;
    accepted.push(turn);
    emit({
      type: "agent.done",
      id: turn.item.id,
      seatId: turn.item.seatId,
      round: turn.item.round,
      phase,
      envelope: turn.result.envelope,
      usage,
    });
  }
  return { state, accepted };
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

class TurnFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TurnFormatError";
  }
}

class ObserverFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObserverFormatError";
  }
}

function redactSecret(message: string, secret?: string) {
  return secret ? message.split(secret).join("[redacted]") : message;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,240}$/.test(value);
}

function isIdentifierList(value: unknown, limit: number): value is string[] {
  return Array.isArray(value) && value.length <= limit &&
    value.every(isIdentifier) && new Set(value).size === value.length;
}

function isBoundedText(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.length <= maximum;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).length === keys.length && Object.keys(value).every((key) => allowed.has(key));
}

function isConvergence(value: unknown): value is RoundBrief["convergence"] {
  return value === "low" || value === "healthy" || value === "premature";
}

function isRisk(value: unknown): value is RoundBrief["loopRisk"] {
  return value === "low" || value === "medium" || value === "high";
}

function isObserverRecommendation(value: unknown): value is RoundBrief["recommendation"] {
  return value === "continue" || value === "targeted_debate" ||
    value === "ask_human" || value === "synthesize";
}

function isTurnPhase(value: unknown): value is TurnPhase {
  return value === "proposal" || value === "review" || value === "synthesis";
}

function isApiPhase(value: unknown): value is TurnPhase | "observer" | "targeted_debate" {
  return isTurnPhase(value) || value === "observer" || value === "targeted_debate";
}
