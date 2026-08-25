# Meeting Protocol Blueprint v1

Status: Approved design; implemented through M2.10c Chair-selected targeted debate
Date: 2026-08-22

## Purpose

This blueprint defines the Discuss-room architecture after the v0.9 resumable-orchestration foundation. It turns a bounded sequence of model calls into a human-chaired, resumable, cost-aware decision protocol without treating a growing transcript as shared model memory.

The design must preserve this chain:

> Objective -> Proposal -> Claim -> Objection -> Revision -> Decision -> Follow-up

The raw transcript remains available for people and audit. Models receive only the bounded working context required for their current task.

## Scope Boundary

This is the implemented Discuss decision protocol and a source of reusable Shared Core primitives. It is not a universal phase sequence for every Task Pack. Review, Explore, Create, Research, Execute, and future Play Packs may define different state records, role assignments, visibility, and phase transitions while reusing provider access, persistence, budgets, context isolation, source lineage, and Human Gates. [Product Direction](PRODUCT_DIRECTION.md) is canonical for product-line order.

## Product Truth

### Implemented through v0.10c

- Direct streaming adapters for OpenAI, Anthropic, and Gemini.
- Session-only BYOK plus workspace-managed credentials.
- Provider verification and compatible-model discovery.
- Reusable Connections and provider-neutral Seats with per-seat Model and Role selection.
- Two or three participants.
- Independent proposals, assigned cross-review, one synthesis, and one optional full revision round.
- Human approve, reject, and request-revision gate.
- Stop control and per-room token, latency, and estimated-cost reporting.
- Focus and overview transcript views.
- Credential-free browser-local `RoomStore` with versioned IndexedDB stores for rooms, participant snapshots, append-only completed/failed turn events, state snapshots, memo artifacts, usage, and migration metadata.
- Strict portable JSON Turn Envelopes, explicit `turn.format_failed` events without automatic retry, and a deterministic Canonical Reducer with source lineage, versioning, idempotency, active-state caps, and bounded context rendering.
- Canonical Meeting State persistence with backward-compatible recovery of rooms created before structured state.
- Separate proposal, review, and synthesis requests behind one persisted protocol state machine.
- Auto, Checkpoints, and Turn-by-turn control modes; Checkpoints remain the default.
- Raise Hand at the next safe boundary, scoped append-only Chair Directives, and user-selected one-to-three round limits with a hard five-round protocol cap.
- Idempotent transition logs, pre-call state persistence, completed-turn duplicate guards, explicit interruption recovery, and no automatic provider retry.
- Backward-compatible Meeting Budgets, exact pre-call turn limits, observed token/time boundary stops, and known failed-turn usage accounting.
- Source-linked deterministic Process Reports with reversible low-progress, repeated-dispute, and premature-homogenization warnings persisted as append-only events.
- Buffered turn presentation: raw structured deltas remain off-stage behind Thinking, Generating, and Validating states; completed rooms wait for the user to open Decision.
- Optional user-selected Observer Connection and Model outside the participant Seat count, with one budgeted and recoverable post-Review call per enabled round.
- Observer context isolation to bounded Canonical State, deterministic Process Report, and reference allowlists; strict source-linked Round Brief validation without state mutation or automatic retry.
- Credential-free Observer snapshots, append-only `round.brief` events, and Round Brief artifacts.
- Human Chair selection of one open Dispute at a Review checkpoint, with a persisted source-linked targeted-debate plan.
- Deterministic routing to at most two relevant Seats without a paid routing-model call.
- A recoverable targeted-debate transition using only the named Dispute, related Claim, active Chair Directives, and bounded source Message IDs; no transcript or prior Memo replay.
- Review-compatible targeted deltas capped at 250 transport output tokens, followed by a delta-only Process Report and optional second Round Brief.
- Eighteen passing automated tests and a passing production build.

### Approved here but not implemented

- User-editable multi-dimensional limits and authoritative-cost enforcement beyond the implemented derived turn/token/time boundaries.
- Independently selected Final Synthesizer.
- Real-provider evaluation of Observer drift and non-exact repetition judgment beyond deterministic fixtures.
- Claim-level follow-up and versioned Decision Memos.
- Account-backed D1 persistence, synchronization, and collaboration.

## Core Invariants

1. The human is Chair throughout the meeting, not only at the final gate.
2. Consensus never becomes evidence merely because several models repeat it.
3. Raw transcript, Canonical Meeting State, and per-agent working context are separate artifacts.
4. Models submit events and proposed state deltas. Application code owns the Canonical Meeting State.
5. Every Claim, Dispute, Round Brief, and Memo section retains source IDs.
6. Corrections append new events; they never rewrite audit history silently.
7. A paid system role is visible in preflight call and cost estimates.
8. A restored room never restores credentials or silently runs with unrelated Seats.
9. A round must add information, change a position, resolve a named dispute, ask the Chair, or stop.
10. No quality heuristic can approve a Decision on behalf of the human.

## Role Model

### Human Chair

Owns the objective, constraints, Chair Directives, budget changes, stop overrides, and final approval.

### Participant Seats

Produce substantive proposals, objections, revisions, and domain judgments. They remain separate from provider identity.

### Observer / Recorder

A system role outside the participant Seat count. It receives deterministic metrics plus bounded Meeting State once per completed round. It creates a short Round Brief and a process recommendation, but cannot mutate Canonical State or decide the outcome.

The user explicitly selects its Connection and Model. The UI recommends a low-cost model but does not claim to know the cheapest model without authoritative pricing.

### Final Synthesizer

A system role outside the participant Seat count. The user explicitly selects its Connection and Model. It may reuse a participant model. It reads final state, Round Briefs, unresolved disputes, Chair Directives, and selected high-impact source excerpts.

It can organize a recommendation but cannot delete a dispute, promote an unverified claim to fact, modify a Chair Directive, or approve its own Memo.

## Chair Control Modes

### Auto

The room advances automatically until a hard stop or final synthesis. A soft Monitor stop moves to synthesis rather than requesting another full round. Human approval is still required.

### Checkpoints - Default

The room pauses after independent proposals and after each debate round. The Chair may continue, add a Directive, request targeted debate, or synthesize.

### Turn by Turn

The scheduler runs one participant turn at a time and pauses after each completed turn. This offers maximum control with greater latency.

### Raise Hand

In Auto or Checkpoints mode, Raise Hand asks the scheduler to pause after the current safe boundary. It does not retroactively change already completed calls or silently resend in-flight calls.

## Protocol State Machine

```text
Setup
  -> Agenda
  -> Independent Proposals
  -> Assigned Cross-review
  -> Canonical Reduce
  -> Observer / Round Brief
  -> Optional Chair Checkpoint
  -> Targeted Debate on open Disputes
  -> Canonical Reduce
  -> Observer / Round Brief
  -> repeat within budget or stop
  -> Final Synthesis
  -> Human Gate
  -> Follow-up or Amendment
```

Round 1 preserves independent proposals before any shared synthesis. Later rounds route only named unresolved disputes to relevant Seats. Final synthesis runs once unless an approved follow-up requires a new Memo version.

## Data Contracts

### RoomConfig

```ts
interface RoomConfig {
  objective: string;
  constraints: string[];
  controlMode: "auto" | "checkpoints" | "turn_by_turn";
  outputDepth: "concise" | "standard" | "deep";
  participants: SeatConfig[];
  observer: SystemModelConfig;
  finalSynthesizer: SystemModelConfig;
  budget: MeetingBudget;
}
```

Persisted RoomConfig contains provider, model, role, and policy snapshots, but never API keys or credential-bearing session Connection IDs.

### TurnEnvelope

```ts
interface TurnEnvelope {
  statement: string;
  card: {
    stance: "propose" | "support" | "oppose" | "revise" | "no_new_information";
    thesis: string;
    newClaims: Array<{ text: string; assumptionLevel: "low" | "medium" | "high" }>;
    claimUpdates: Array<{
      claimId: string;
      action: "support" | "oppose" | "revise" | "withdraw";
      reason: string;
    }>;
    objections: Array<{
      targetClaimId?: string;
      text: string;
      severity: "minor" | "material" | "blocking";
    }>;
    questionForChair?: string;
    recommendedAction?: string;
    confidence: { level: "low" | "medium" | "high"; reason: string };
  };
}
```

Default limits are one short statement, at most three new Claims, three Claim updates, two objections, and one Chair question. Novelty is computed by the system rather than self-scored by the model.

### Canonical MeetingState

```ts
interface MeetingState {
  version: number;
  objective: string;
  constraints: string[];
  activeChairDirectives: ChairDirective[];
  claims: Claim[];
  disputes: Dispute[];
  assumptions: Assumption[];
  openQuestions: OpenQuestion[];
  humanChoices: HumanChoice[];
  round: number;
  phase: MeetingPhase;
  usage: UsageSummary;
  remainingBudget: MeetingBudget;
}
```

Discuss-mode claims are unverified by default. Useful statuses distinguish proposed, contested, provisionally supported, accepted or rejected by the Chair, and superseded. Agreement is not stored as factual verification.

Initial state caps:

- 8 active proposals.
- 12 active Claims.
- 6 active Disputes.
- 6 active assumptions.
- 4 unresolved human choices.
- 8 active Chair Directives.
- Approximately 1,200 to 1,500 rendered working-context tokens.

Resolved or superseded material moves out of active context while retaining compact IDs and source lineage in durable history.

### ChairDirective

```ts
interface ChairDirective {
  id: string;
  kind: "constraint" | "correction" | "question" | "priority" | "veto";
  target: "all" | string[];
  text: string;
  status: "active" | "satisfied" | "superseded";
  createdAfterMessageId?: string;
  supersededBy?: string;
}
```

Models can report that a Directive appears satisfied. Only the human or deterministic protocol rules can change its status, and only the human can supersede a human Directive.

### RoundBrief and ProcessReport

```ts
interface RoundBrief {
  round: number;
  stateVersion: number;
  newClaimIds: string[];
  changedClaimIds: string[];
  resolvedDisputeIds: string[];
  remainingDisputeIds: string[];
  chairQuestionIds: string[];
  processReport: {
    convergence: "low" | "healthy" | "premature";
    loopRisk: "low" | "medium" | "high";
    driftRisk: "low" | "medium" | "high";
    recommendation: "continue" | "targeted_debate" | "ask_human" | "synthesize";
    reason: string;
  };
}
```

Application code validates every referenced ID. The Observer cannot create or delete canonical records.

### FollowUp

A Follow-up targets one Message, Claim, Dispute, Round Brief, or Decision Memo. Its audience may be the author, selected Seats, the room, or the Final Synthesizer. Clarification uses one targeted turn; targeted debate consumes turn budget; reopening broad debate consumes a round.

An explanation attached to an approved Memo does not rewrite it. A conclusion-changing answer creates a versioned Amendment or Decision Memo v2 and passes through the Human Gate again.

### DecisionMemo

Every Memo records its version, source MeetingState version, provider/model/role snapshot for the Synthesizer, referenced Claim and Dispute IDs, unresolved assumptions, human choices, next actions, and approval status. It never persists a session Connection ID or API key.

## Context Policy

```text
Independent proposal:
  objective + constraints + active Chair Directives + role

Assigned review:
  objective + one target Turn Card + relevant Claims

Targeted debate:
  one Dispute + participant positions + bounded source excerpts

Observer:
  Canonical State + deterministic process metrics

Final Synthesizer:
  Canonical State + Round Briefs + high-impact source excerpts

Follow-up:
  user question + target lineage + relevant current state
```

No prompt receives the complete transcript by default. Stable role and protocol instructions precede dynamic context to support provider prompt caching where available, but caching never replaces context selection.

## Output Policy

Proposed default output caps to validate with real models:

- Proposal: 300 to 450 output tokens.
- Review: 200 to 300 output tokens.
- Targeted debate turn: 150 to 250 output tokens.
- Observer: at most 300 transport output tokens for the strict JSON envelope; the visible summary remains 2-4 concise sentences.
- Final Memo: 600 to 900 output tokens.

The UI is card-first. Provider deltas are transport data and never appear as live speech; the stage shows bounded Thinking, Generating, and Validating states until a validated statement is ready. Raw published output remains expandable for audit.

User-facing depth is separate from working-context size. The room may publish both an executive brief and a detailed task-shaped Artifact. That detailed Artifact is stored for the user and audit but is not replayed into later agent prompts by default; targeted follow-up retrieves only its relevant lineage and sources.

Malformed structured output is stored as a failed-format raw event and is not reduced into Canonical State. There is no automatic paid retry. The Chair may retry explicitly or authorize one bounded extraction call.

## Budget and Stop Policy

### User-facing limits

- Maximum debate rounds: default 2, standard range 1 to 3, advanced hard maximum 5.
- Maximum agent turns: precomputed from Seat count and selected protocol; default ceiling 12 for a three-participant, two-round room.
- Per-phase output caps listed above.
- Room input-token and output-token ceilings.
- Maximum elapsed model time, proposed default 15 minutes.
- Maximum estimated USD when authoritative model pricing is available.
- Maximum call count shown before launch.

When per-model pricing is unknown, token, turn, round, and time limits remain authoritative. Estimated USD is advisory and must not be presented as a guaranteed billing stop.

### Hard stops

The orchestrator stops automatically on user stop, exhausted round/turn/token/time budget, missing runnable Seats, invalid protocol state, or repeated provider failure beyond the explicit retry policy.

### Soft stops

The Monitor recommends pausing when two consecutive evaluation windows add no Claim or position change, the same Dispute repeats unchanged, unresolved questions do not change while cost grows, participants only restate the current Memo, or discussion drifts from the objective.

Premature similarity is not treated as healthy convergence. High similarity before independent challenge, while assumptions remain unresolved, triggers a targeted independent objection or a Chair checkpoint.

In Checkpoints or Turn-by-turn mode, a soft stop pauses for the Chair. In Auto mode, it advances to final synthesis. It never approves the outcome.

## Persistence Architecture

### Implemented through v0.8

Meeting history uses the credential-free IndexedDB `RoomStore`. Legacy bounded `localStorage` records migrate once and remain readable without acquiring Canonical State retroactively.

### Implemented through v0.9

Each room snapshot now also stores `MeetingProtocolState`. Starting, completing, and interrupting a phase appends stable transition events; scoped Chair Directives append separate audit events. A snapshot recovered with a running transition is converted to `interrupted`, never auto-resumed, and requires an explicit Chair action. Credentials remain excluded.

### Implemented through v0.10a

`MeetingProtocolState` also stores backward-compatible derived budgets and bounded deterministic Process Reports. Each report retains source State version and Turn IDs and is persisted as an append-only `process.report` event. Reports remain process artifacts, not Canonical State mutations or Decision authority.

### Implemented through v0.10b

Protocol snapshots also store whether Observer was enabled and up to one validated Round Brief per round. Observer transitions are persisted before provider work, count as one system turn, recover from interruption without silent retry, and return to the Review checkpoint. Credential-free Observer provider/model snapshots, append-only `round.brief` events, and Round Brief artifacts preserve source State, Process Report, and Turn IDs. Old rooms parse with Observer disabled and an empty Brief list.

### Implemented through v0.10c

Protocol snapshots also store up to five `TargetedDebatePlan` records. Each plan names one open Dispute, its source State version, bounded source Message IDs, routed Seat IDs, and the consumed round before any provider request begins. Targeted transitions share the existing interrupted-state recovery contract and never retry automatically. Old rooms parse with an empty targeted-debate list.

### Implemented local layer

The provider-independent `RoomStore` uses browser IndexedDB. Its durable collections are:

- Rooms.
- Participant snapshots.
- Append-only room events.
- Canonical state snapshots.
- Round Brief and Decision Memo artifacts.
- Usage ledger entries.

Streaming deltas remain transport-only and are not persisted in `TranscriptItem`. On completion, one `turn.completed` event stores the final published statement and validated Turn Envelope. An interrupted stream stores `turn.failed` with a bounded failure description. Malformed output stores `turn.format_failed`; semantic reduction failures store `turn.reduction_failed`. Canonical snapshots are written after successful reductions through the room autosave path.

### Future server layer

The repository contains a Drizzle SQLite/D1 scaffold, but no active schema or D1 binding. A D1-backed `ServerRoomStore` waits for identity, ownership, encrypted secret boundaries, and synchronization policy. It must not become a shared unauthenticated meeting database.

Before claiming continuity across navigation, provider transitions move behind a durable runner boundary. Clients reconnect with a room event cursor and may detach without cancelling confirmed work. Unknown in-flight calls keep their ambiguous status and require an explicit Chair recovery choice; reconnect never implies a silent provider retry.

No API keys, authorization headers, or credential-bearing Connection records enter either store. Explicit room deletion removes local events, snapshots, artifacts, raw responses, and usage records.

## UX Attention Model

- Setup focuses on Connections, Seats, Observer, Final Synthesizer, control mode, and budget preflight.
- Agenda focuses on the objective, constraints, expected artifact, and stop condition.
- Live turns focus on one concise speaker statement and Turn Card.
- Checkpoints focus on the Meeting Whiteboard: new Claims, changed positions, open Disputes, and Chair questions.
- Round completion focuses on the Round Brief and Process Report.
- Decision focuses on the versioned Memo and Human Gate.
- Audit and Overview retain expandable raw messages and source lineage.

The Human Gate actions become Approve, Add Chair Direction, Request Targeted Revision, and Reject.

## Implementation Order

1. Freeze this blueprint and its bilingual decision records.
2. Complete one live two-provider baseline evaluation of the current bounded protocol.
3. Create a named backup before protocol and interface rework.
4. Add RoomStore contracts and IndexedDB migration from current local history.
5. Add append-only Event, Snapshot, Artifact, and Usage records.
6. Implement Turn Envelope validation and the deterministic Canonical Reducer.
7. Split the single streaming request into a resumable room state machine. **Complete.**
8. Add Chair modes, Raise Hand, Directives, and round/call-count preflight. **Complete.**
9. Add Observer, Round Brief, and one Chair-selected Dispute-targeted route. **Complete under deterministic fixtures.** Next verify the combined path with one explicitly budgeted real-provider room; broader Monitor enforcement remains pending.
10. Add Final Synthesizer selection, versioned Memos, and source-linked Follow-up.
11. Rework the Meeting UI around Turn Cards and the Meeting Whiteboard.
12. Run cost, quality, loop, interruption, persistence, and single-model baseline evaluations.

## Evaluation Gates

The protocol is not complete merely because it runs. It must demonstrate:

- More decision-useful objections or better resolution than a strong single-model baseline.
- Lower context growth than transcript replay.
- Predictable termination within declared bounds.
- No silent loss of minority objections or Chair Directives.
- Correct recovery after refresh or interruption without restoring credentials.
- Transparent maximum call count and non-misleading cost estimates.
- A readable user experience at each stage without requiring the full transcript.

## Explicitly Deferred

- Semantic embeddings and vector search before structured-state behavior is validated.
- Automatic selection of the cheapest model without authoritative pricing.
- Cross-device or multi-user sync before identity and ownership.
- Durable API-key storage before authentication and encryption.
- Autonomous acceptance of Decisions.
- Research evidence retrieval and Execute tools inside the first protocol refactor.

## Remaining Open Decisions

- Whether provider-native structured-output modes improve reliability enough to replace the portable JSON prompt behind individual adapters.
- Token ceilings after the first real-provider measurements.
- Whether the Observer extraction fallback is enabled by default or only by Chair approval.
- Export format and migration path from IndexedDB to account-backed storage.
