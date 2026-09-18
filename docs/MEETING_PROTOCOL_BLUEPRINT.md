# Meeting Protocol Blueprint v1

Status: Approved design; Shared Core implemented through M2.10c, Review extensions, and the first bounded M2.13 detailed-Plan slice
Date: 2026-08-27

## Purpose

This blueprint defines the Discuss-room architecture after the v0.9 resumable-orchestration foundation. It turns a bounded sequence of model calls into a human-chaired, resumable, cost-aware decision protocol without treating a growing transcript as shared model memory.

The design must preserve this chain:

> Objective -> Proposal -> Claim -> Objection -> Revision -> Decision -> Follow-up

The raw transcript remains available for people and audit. Models receive only the bounded working context required for their current task.

## Scope Boundary

This is the implemented Discuss decision protocol and a source of reusable Shared Core primitives. It is not a universal phase sequence for every Task Pack. Review, Explore, Create, Research, Execute, and future Play Packs may define different state records, role assignments, visibility, and phase transitions while reusing provider access, persistence, budgets, context isolation, source lineage, and Human Gates. [Product Direction](PRODUCT_DIRECTION.md) is canonical for product-line order.

## Product Truth

### Implemented Shared Core and Task Pack extensions

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
- Review-compatible targeted deltas capped at 400 transport output tokens, followed by a delta-only Process Report and optional second Round Brief.
- Review-specific trusted current-date context and item-level Human Chair Accept/Reject over canonical Findings.
- Append-only `human.choice` events and deterministic Chair-decided Claim states that later model deltas cannot override.
- Source-linked Human Chair Finding addition and supersession at the Review checkpoint, with exact Artifact, reference, or truth-constraint excerpts validated by both client and server.
- Review synthesis from Canonical State only, with binding rejected-Claim exclusion and a code-enforced five-section Review Brief contract.
- A strict source-linked Review Change Set whose bounded, non-overlapping exact replacements are applied by application code to immutable Artifact v1.
- A distinct changed-material Verifier that reads supplied sources, truth constraints, accepted Findings, and declared changes without receiving unchanged Artifact text or the transcript.
- Separate Artifact v2, Change Set, Verification, and executive Brief views with credential-free Meeting History persistence and restoration.
- A local Keep original outcome after every active Finding is explicitly rejected (or none exist), retaining exact v1 with empty Changes, no Editor/Verifier, and `not_run` verification. It is saved before entering Human Gate; approval freezes v1. Starting another round clears the active result after saving while preserving historical artifacts.
- A persisted, source-versioned Review Editor checkpoint and Verifier-only explicit resume, with one bounded recovery call visible in preflight.
- Independent Verifier lineage and semantic-correctness dimensions, with application-derived overall status and deterministic promotion of every unsupported or unverifiable Change to Remaining Human Checks.
- A separate legacy Decide user-artifact boundary: up to 4,800 synthesis output tokens, ordered Decision sections, one bounded explicit recovery, and no synthesis-driven Canonical Claim mutation. The opt-in structured Plan below has separate caps.
- Review Human Gate item editing that keeps Change identity and Finding lineage immutable, reapplies Chair-edited replacement text to Artifact v1 as Artifact v3, persists the revision without credentials, and visibly limits model verification to Artifact v2. No provider call is made for the human revision.
- Review approval that freezes the exact visible v2 or v3 text, Change Set, source identities, original model verification, human-edited Change IDs, and approval time as a separate credential-free Artifact. Snapshot and room decision share one rollback boundary; rejection creates no approved Artifact.
- Restored phase context is filtered through Canonical State, so abandoned transcript turns cannot enter a later provider prompt; a local pre-provider rejection does not spend the provider-call allowance.
- Schedule-shaped Decide artifacts are checked for requested units, and LeetCode plans that request concrete problems must include problem IDs rather than category labels.
- Legacy MEU-aware checks rejected Smoke 007 for a missing day; that failed quality Gate is not retroactively passed by the new implementation.
- Opt-in Detailed LeetCode plan: frozen 10-15-day MEU/time contract, one discussion round, a Builder streaming independently validated JSONL day records (up to 16,000 output tokens), and a distinct review Seat reading the actual complete Plan (6,000 tokens). The day view shows tasks, computed workload/time, completion checks, adjustments, concerns and assumptions without transport JSON or auto-changing the selected day.
- Plan checkpoints preserve valid days. One explicit recovery allowance (at most two extra calls) requests only missing days, or only the reviewer when all days exist. A saved reviewed checkpoint finishes locally without keys. Detailed/approved artifacts persist outside canonical context; incomplete/unreviewed artifacts cannot be approved. A distinct Seat does not necessarily mean a different model family.
- D-056 removes fixed Plan artifact deadlines and cumulative-time stops (budget zero), while recording elapsed time. Ordinary discussion still has a90s deadline. Explicit saved-plan recovery can cover the minimum missing call slots after an earlier format recovery, without clearing prior reservations or increasing input/output limits. Exactly one interrupted artifact attempt is eligible; after a second attempt no renewal is offered. Save-before-call, source/composition validation and no automatic retry remain. Stopped status complete is not artifact completion. D-061 optionally persists whether that stop was human- or budget-caused; legacy provenance remains unknown, and any recovery clears the old reason. Recovery controls evaluate preserved input/output usage before enabling and never promise a call that the local budget Gate will reject. Wait UI measures time in the current view, not confirmed provider thinking; provider/network/host limits remain possible.
- D-062 records one lifecycle receipt per paid Plan stage. A strict `started` attempt is emitted before Builder or Reviewer provider invocation with finish and usage unknown, then terminal evidence replaces the same request/stage. Reviewer absence is distinguishable from Reviewer started/unknown. Receipts never store credentials, raw provider output or private reasoning; unknown usage is not zero, an invoice or a refund signal.
- Plan validation proves arithmetic/coverage and rejects duplicate/inconsistent labels, not real problem identity/difficulty, teaching quality or feasibility. No external catalog verification, automatic approval, automatic model rewriting or retry. Changing the Plan contract still requires a new room.
- D-057 persists the latest four initial Builder/reviewer attempt diagnostics in the existing Plan artifact, at most twelve line/day rejection details each, without raw responses or private reasoning. Known usage and terminal state are separate from validation; unknown stays unknown. These diagnostics never enter Plan prompts. New format-only Chair directions bind to a phase/round; ordinary and legacy corrections retain their semantics. Archived/frozen contexts are not migrated. See [Plan Issue Register](PLAN_ISSUE_REGISTER.md).
- D-058 assigns recognized original GPT-5 Builder `low` reasoning and actual Plan judgment stages `medium`, while other models/providers keep defaults. The requested setting is persisted separately from reported reasoning usage. No output ceiling, retry or call budget changes; PLAN-03 remains incomplete until one authorized Builder-stage result delivers usable days with terminal/usage evidence.
- Human day editing revalidates the full derived Plan, preserves original AI content/review, saves source-bound revisions before display and freezes exact revised approval. Original comparison and copy/view mark human edits as not model-reviewed. Failed saves retain drafts; unsaved edits block approval/room replacement. No provider call or new store.
- D-055 adds one human-triggered cycle per original Plan: select up to3 concerns -> persist amendment intent -> one Editor call (12K cap) -> save validated affected-day replacements/declines -> persist recheck intent -> one different-Seat recheck (6K cap) -> human decision. It never alters original days/review; the derived Plan keeps unselected/unresolved concerns. Failed calls do not retry, incomplete cycles can be dismissed to the original, and a saved unattempted recheck can continue explicitly. Approval freezes exact output and source/amendment. Local guards are not server-side exactly-once billing. See the model blueprint for the bounded quality profile.
- Fifty-nine offline tests and build/lint pass. Three existing Cloudflare declaration errors remain. New diagnostic/scope UI is rendered-test-only; full browser/IndexedDB-failure acceptance remains open. Live010/011 preserve six days but fail full-artifact quality; passing adapter fixtures does not resolve that evidence.

### Approved here but not implemented

- User-editable multi-dimensional limits and authoritative-cost enforcement beyond the implemented derived turn/token/time boundaries.
- Independently selected Final Synthesizer.
- Independently configured Review Editor and Verifier system roles; v0.11c explicitly reuses two participant Seats.
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

### Review Artifact Boundary

After the Chair has accepted at least one canonical Finding, Review synthesis uses a bounded artifact branch:

```text
Accepted Findings, including source-linked Chair additions or supersessions
  -> Editor Change Set
  -> Application validates exact, non-overlapping replacements
  -> Application derives Artifact v2 from immutable Artifact v1
  -> Verifier checks declared changed material against sources and constraints
  -> Artifact v2 + Change Set + Verification + Executive Brief
  -> Human Gate
```

The Chair may repair reviewer omission before Editor work by appending a new accepted Finding with an exact excerpt from Artifact v1, a supplied reference, or a truth constraint. Amending an existing Finding creates a new Claim and marks the old one superseded; it never rewrites audit history. Client validation gives immediate feedback, and the server revalidates every Chair source before any paid call.

The Editor cannot provide an opaque full rewrite. Rejected or unknown Finding IDs, ambiguous source text, overlapping Changes, uncovered accepted Findings, malformed JSON, and oversized output stop the transition visibly without automatic retry. A validated Editor result is persisted before Verifier work. If Verifier fails, explicit resume must match the same source State, accepted Findings, Artifact v1, and Editor snapshot, then calls only the Verifier within one preflight-visible recovery allowance. The Verifier does not receive the full transcript or unchanged document content. It judges whether each Change is authorized by its accepted Finding lineage separately from whether the changed wording is semantically correct against the supplied evidence. Chair acceptance never substitutes for truth verification. Application code derives the combined status and sends every unsupported or unverifiable Change to Remaining Human Checks. The detailed Artifact is a user deliverable and is never substituted for bounded Canonical State in later model context.

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

Application-enforced phase limits are one short statement; Proposal allows at most three new Claims, no Claim updates, one objection, and one Chair question; Review allows at most one new Claim, two Claim updates, one objection, and one Chair question. Targeted debate uses its smaller dedicated contract. Novelty is computed by the system rather than self-scored by the model.

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
- 8 active Disputes.
- 12 active assumptions.
- 8 active open questions.
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
- Targeted debate turn: at most 400 transport output tokens for a complete strict JSON envelope.
- Observer: at most 300 transport output tokens for the strict JSON envelope; the visible summary remains 1-2 concise sentences and references at most two focus Claims, two remaining Disputes, and one Chair question.
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

- D-060 now uses provider-native structured output narrowly for explicitly supported Anthropic actual-Plan Reviewers. Live evidence must determine whether to retain it and whether any second artifact contract justifies broader adapter adoption; portable JSON remains the default elsewhere.
- Token ceilings after the first real-provider measurements.
- Whether the Observer extraction fallback is enabled by default or only by Chair approval.
- Export format and migration path from IndexedDB to account-backed storage.
