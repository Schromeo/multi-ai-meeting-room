# Roadmap

Statuses: `Complete`, `Current`, `Planned`, `Deferred`.

## Current Position

- **Local product version:** v0.10c.
- **Working baseline:** real streaming Discuss protocol, reusable model Seats, session BYOK, human decision gate, credential-free IndexedDB Event Store, deterministic Canonical Meeting State, and a persisted human-chaired resumable orchestrator.
- **Live evidence gate:** completed on 2026-08-04 with OpenAI `gpt-5-mini` plus Anthropic `claude-haiku-4-5-20251001`; see [Live Baseline 001](evaluations/2026-08-04-v0.6-live-baseline.md).
- **Immediate evidence gate:** M2.10c Chair-selected Dispute routing is complete under deterministic fixtures; next run one bounded real-provider Observer plus targeted-debate smoke evaluation, then stop expanding the generic orchestrator.
- **Approved product direction:** one Shared Core grows through validated vertical Task Packs. Review is the first artifact-centered product line; see [Product Direction](PRODUCT_DIRECTION.md).
- **Critical path:** bounded v0.10c live check -> Review Task Pack -> three-case comparison -> Decide / Plan Pack -> Shared Core consolidation -> evidence-led expansion.

The current foundation is sufficient for the first product slice. No further generic protocol, Observer, routing, agent-autonomy, or broad interface infrastructure work begins without a named Task Pack need. A named backup remains required before major frontend work.

## M0 - Opportunity and Product Thesis - Complete

**Outcome:** distinguish structured, human-chaired deliberation from side-by-side model comparison.

**Exit criteria met:** product thesis, first use case, role model, and human authority were defined.

## M1 - Interaction Prototype - Complete

**Outcome:** validate the room metaphor with agenda input, selectable roles, bounded modes, critique controls, and decision artifacts.

**Known limitation:** all agent messages are simulated.

## M1.1 - Visible Development Log - Complete

**Outcome:** expose current product truth, milestones, development loop, and the engineering-harness hypothesis.

## M1.2 - Project Continuity System - Complete

**Outcome:** add project charter, AI handoff, roadmap, decision record, bilingual development log, and repository-level agent instructions.

## M2 - Real Discuss Room - Current

**Deliverables:**

- provider-neutral model adapter interface;
- two or three real providers or models;
- streamed independent proposals;
- assigned cross-review;
- bounded extra round;
- decision memo containing unresolved dissent;
- per-room token, latency, and estimated-cost reporting.

**Exit criteria:** one objective can complete the full Discuss protocol without simulated agent text, duplicate calls, or manual database repair.

**Implementation progress:** all listed product and protocol surfaces are implemented and covered by a mocked end-to-end stream test. A real OpenAI plus Anthropic room completed proposal, cross-review, synthesis, usage reporting, persistence, and the Human Gate on 2026-08-04. The OpenAI adapter omits unsupported optional generation controls, room history uses IndexedDB, validated Turn Envelopes feed a bounded Canonical Reducer, and the resumable Chair protocol is implemented. M2 remains current only through the bounded v0.10c live check and transition into the first Review product slice.

## M2.1 - Connection and Cost Guardrails - Complete

**Deliverables:** in-product session BYOK, workspace-managed connection status, a unified connection library, explicit provider selection, advisory provider detection, credential verification, compatible-model discovery, connection naming, transactional key replacement, model reload, confirmed disconnect, connection-source labels, preflight call counts, and explicit non-persistence language.

**Exit criteria:** a user can connect two providers without editing code, understand who pays, run a bounded room, and refresh the page without any user credential having been persisted.

## M2.2 - Composable Model Seats - Current

**Deliverables:** separate Connection, Model, Role, Skill, and Seat records; duplicate-provider seats; per-seat models; explicit synthesizer selection; and provider/model/role diversity indicators.

**Exit criteria:** one room can intentionally compare three roles on one model, three models from one provider, or models from multiple providers without misrepresenting the kind of diversity present.

**Implementation progress:** reusable connections, duplicate-provider seats, per-seat connection management, per-seat model selection, and provider-neutral role selection are implemented. Explicit synthesizer selection, skill composition, and diversity indicators remain.

## M2.3 - Role and Skill Library - Planned

**Deliverables:** bounded role constitutions, reusable skill packs, room-specific working state, visible position changes, and human-approved promotion of any learning to durable memory.

**Exit criteria:** a seat can adapt to criticism inside the room while its original mandate and every accepted change remain inspectable.

## M2.4 - Custom Connections - Planned

**Deliverables:** OpenAI-compatible and local connection types, HTTPS and host policy, SSRF protection, auth-header configuration, capability probing, and unknown-price fallbacks.

**Exit criteria:** a custom endpoint can participate without gaining arbitrary network access or producing a false cost/diversity claim.

## M2.5 - Durable Rooms - Current

**Deliverables:** room persistence, transcript recovery, artifacts, event history, and export.

**Exit criteria:** a room can be resumed after a new browser session with its audit history intact.

**Implementation progress:** meeting transcripts, memos, human decisions, usage, participant and Observer snapshots, append-only completed/failed turn, protocol-transition, Chair-Directive, Process-Report, and Round-Brief events, state/protocol snapshots, and Memo/Round-Brief artifacts now persist in a bounded browser-local IndexedDB archive. Users can create a new room without deleting prior records, reopen saved records, recover paused or interrupted protocol state, and delete rooms transactionally. Credentials are excluded. Account ownership, server sync, export, and cross-device recovery remain.

## M2.6 - Meeting Protocol Blueprint v1 - Complete

**Outcome:** define the next bounded Discuss architecture before modifying the running protocol.

**Delivered:** Human Chair control modes; Chair Directives; participant, Observer, Recorder, and Final Synthesizer boundaries; Turn Envelope; Canonical Meeting State; Round Brief; Process Report; Follow-up; versioned Memo; context policy; output caps; budget and stop policy; local-first persistence; UX attention model; and implementation order.

**Exit criteria met:** English and Chinese blueprints distinguish implemented behavior from approved future behavior and identify remaining open decisions.

## M2.7 - Local Event Store - Complete

**Depends on:** current v0.6 history and the approved protocol blueprint.

**Deliverables:** a provider-independent `RoomStore`; IndexedDB implementation; schema versioning; migration from the current localStorage meeting records; Room, participant snapshot, append-only Event, State Snapshot, Artifact, and Usage collections; transactional room deletion; and export-ready reads.

**Security boundary:** API keys, authorization headers, and credential-bearing Connection records never enter the store. Persisted system-role and Seat records keep provider/model/role snapshots only.

**Exit criteria met:** `RoomStore` initializes a versioned seven-store IndexedDB database, migrates validated legacy localStorage records transactionally, persists only completed or failed turns, reconstructs rooms after refresh, prunes the archive to 30 rooms, and never restores credentials. Browser verification migrated and reopened three existing rooms with their memo and usage intact across two reloads.

## M2.8 - Structured Meeting State - Complete

**Depends on:** M2.7.

**Deliverables:** Turn Envelope validation; concise statement and card limits; Claim, Dispute, Assumption, Chair Directive, Human Choice, and Follow-up records; deterministic Canonical Reducer; source lineage; active-state token cap; state versions; and explicit format-error handling without automatic paid retry.

**Exit criteria met:** all provider turns must parse as strict bounded JSON Turn Envelopes before emitting `agent.done`; malformed output emits `agent.format_error`, is stored as `turn.format_failed`, and receives no automatic retry. The deterministic Reducer rejects unknown references and state overflow atomically, assigns stable source-linked record IDs, ignores duplicate turn IDs, versions every successful reduction, and renders valid JSON working context within a 6,000-character cap. Canonical snapshots persist in IndexedDB while old rooms without state remain readable.

## M2.9 - Human-Chaired Resumable Orchestrator - Complete

**Depends on:** M2.8.

**Deliverables:** explicit room state machine; Auto, Checkpoints, and Turn-by-turn modes; Raise Hand; append-only Chair Directives; safe-boundary pause and resume; user-selected maximum rounds; targeted extra turns; idempotent transition IDs; and interruption recovery.

**Exit criteria met:** the client now persists an explicit protocol state before every provider phase, runs proposal/review/synthesis as separate requests, defaults to Checkpoints, supports Auto and Turn-by-turn, pauses Raise Hand at the next safe boundary, appends scoped Chair Directives to Canonical State and the Event Store, enforces user-selected maximum rounds, and records idempotent transition IDs. A completed transition is rejected before provider calls when its turn IDs already exist; a running transition recovered after refresh becomes interrupted and requires explicit human resume. In-flight provider billing remains inherently ambiguous and is disclosed before resume. Deterministic phase fixtures and recovery tests pass; bounded real-provider verification is the first M2.10 gate.

## M2.10 - Observer, Budgets, and Targeted Debate - Current

**Depends on:** M2.9.

**Deliverables:** user-selected Observer model; deterministic novelty and progress metrics; one bounded Observer call per completed round; source-linked Round Brief; loop, drift, and premature-homogenization report; hard round/turn/token/time bounds; advisory cost limit when pricing is unknown; preflight maximum call count; and routing of later rounds only to named unresolved disputes.

**Exit criteria:** every extra turn is attributable to a specific unresolved issue, hard limits terminate automatically, soft quality stops are visible and reversible by the Chair, and the Observer cannot mutate state or approve a Decision.

**Implementation progress:** M2.10a adds backward-compatible Meeting Budgets, exact pre-call agent-turn gates, observed token/time boundary stops, failed-turn usage accounting, deterministic source-linked Process Reports, reversible structural warnings, and compact budget visibility. The validated-turn presentation correction keeps raw JSON off-stage and preserves manual focus. M2.10b adds an optional user-selected Observer outside the Seat count, exactly one recoverable post-Review call per enabled round, a 5,000-character Canonical State plus Process Report context boundary, strict source-reference validation, a 300-output-token ceiling without automatic retry, source-linked Round Briefs, preflight accounting, and credential-free event/artifact persistence. M2.10c adds a Human Chair Dispute picker, deterministic routing to at most two relevant Seats, a persisted and resumable targeted-debate plan, 250-output-token Review Envelopes using only the named Dispute, related Claim, active Directives, and bounded source IDs, plus a new Process Report and optional Round Brief over only that round's delta. Existing rooms default new fields safely and remain readable. Semantic quality evaluation with real providers, user-editable multi-dimensional limits, and authoritative cost enforcement remain.

**Scope freeze:** one explicitly budgeted real-provider smoke room is the final M2.10 gate. Broader Observer semantics, semantic routing, embedding-based novelty, authoritative pricing, and more budget controls move out of the critical path unless that evaluation reveals a blocking defect.

## M2.11 - Review Task Pack - Planned

**Depends on:** M2.10.

**Product case:** review one supplied artifact against an objective, reference material, and explicit truth constraints.

**Deliverables:** Review Agenda; Artifact v1 and source bundle capture; task-adaptive reviewer Role Pack; independent Finding cards; duplicate clustering that preserves conflicts; one named high-impact cross-review; independently configured Editor or explicit participant-reuse savings mode; structured Change Set; Artifact v2; changed-material verification; separate executive brief and detailed Artifact; item-level accept, reject, or edit actions; immutable approved Artifact version; and expandable audit lineage.

**Initial benchmarks:** resume against a job description, product or requirements document, and technical plan.

**Exit criteria:** a user can provide Artifact v1 and sources, receive material independent Findings and a detailed Artifact v2, trace every accepted change to a Finding and source or explicit inference, decide changes individually, and complete the flow without reading the full transcript or replaying the entire detailed Artifact into every model request.

The durable transition runner remains outside this slice unless navigation prevents the bounded Review case from completing. It must exist before any claim that paid work continues safely across page navigation, but it cannot replace the Artifact outcome as the milestone goal.

## M2.12 - Review Evaluation and Shared Core Consolidation - Planned

**Depends on:** M2.11.

**Baseline progress:** Live Baseline 001 is complete. It found useful cross-model deltas, excessive output volume, arbitrary generated thresholds entering the memo, final-only human control, and an OpenAI model-parameter compatibility gap.

**Deliverables:** saved single-model baselines; a documented manual GPT-to-Claude-style copy/review baseline; Review Task Pack runs on all three benchmarks; task-specific rubrics; accepted unique changes; rejected or unsupported Findings; human edit distance; call, token, latency, cost, and reading-effort reports; coordination failure taxonomy; and removal or simplification decisions for low-value protocol features.

**Exit criteria:** evidence identifies important accepted improvements unique to structured cross-review, shows whether they justify cost and effort, and leaves only abstractions required by Review plus at least one named second consumer. Features that fail the evaluation are simplified, made optional, or removed.

## M2.13 - Decide / Plan Task Pack - Planned

**Depends on:** M2.12.

**Deliverables:** decision and planning Agenda variants; recommended Role Packs; alternatives, conditions, risks, checkpoints, and reversal triggers; a detailed decision package or executable plan; scoped follow-up; and a Human Gate appropriate to the artifact.

**Exit criteria:** one real decision and one constrained plan complete end to end, demonstrate which Review abstractions are genuinely reusable, and cause the Task Pack contract to be consolidated under the Rule of Two rather than by speculation.

## M3 - Audit Ledger - Planned

**Deliverables:** Claim, Evidence, Dispute, Decision, Action, Artifact, and Evaluation records.

**Exit criteria:** a user can trace a final decision back to its supporting claims, objections, revisions, and human approval.

**Relationship to M2.8:** M2.8 introduces the structured local room records required by the Discuss protocol. M3 expands them into evidence-aware, queryable audit entities rather than restarting the data model.

## M3.1 - Explore Task Pack - Planned

**Deliverables:** divergence-first Role Packs, idea clustering, preservation of useful outliers, user curation, optional surprise round, and an Idea Board artifact.

**Exit criteria:** the room expands useful possibilities before critique, avoids premature convergence, and lets the user select directions without converting brainstorming into a decision protocol.

## M3.2 - Create Task Pack - Planned

**Deliverables:** one designated Author, editorial roles, versioned sections, Artifact Memory, task-shaped context retrieval, continuity state, and local revision review.

**Exit criteria:** a long-form artifact retains coherent voice and continuity without broadcasting the full manuscript or transcript to every Seat on every turn.

## M3.5 - Research Room - Planned

**Deliverables:** search/retrieval adapter, source capture, claim verification queue, citation display, and freshness metadata.

**Exit criteria:** critical factual claims are marked supported, contradicted, or unresolved with inspectable sources.

## M4 - Harness Orchestrator - Planned

**Deliverables:** explicit room state machine, context isolation, budgets, stop rules, duplicate-call protection, and evaluation hooks.

**Exit criteria:** the orchestrator terminates predictably and every extra round is attributable to a named unresolved issue.

**Relationship to M2.9:** M2.9 validates a bounded discussion state machine. M4 extends the same control model to tool use, workspace changes, executor/reviewer separation, deterministic checks, and action idempotency.

## M4.5 - Execute Room - Planned

**Deliverables:** local execution connector first, scoped permissions, approval gate, coding-agent adapter, independent review, and deterministic checks.

**Exit criteria:** an approved bounded task produces a patch and review result without granting the web control plane unrestricted workspace access.

## M4.8 - Play Task Pack - Deferred

**Deliverables:** deterministic game-pack interface, public and private Seat state, legal-action schemas, seeded randomness, visibility rules, bounded turns, and replay.

**Exit criteria:** one rule-bound simulation runs without hidden-information leakage or model-owned rule enforcement. Play remains deferred until the work-focused Task Packs demonstrate product value.

## M5 - Evaluation and Hardening - Planned

**Deliverables:** single-model baseline, outcome rubric, regression scenarios, cost/latency dashboard, failure taxonomy, and recovery paths.

**Exit criteria:** the project can demonstrate where multi-agent deliberation helps, where it does not, and what it costs.

## Deferred Until Evidence Supports Them

Multi-user collaboration, platform-paid billing, model marketplace, mobile clients, unattended autonomy, broad external integrations, and cloud execution infrastructure.

Account-backed D1 room sync is also deferred until identity, room ownership, deletion semantics, encryption boundaries, and conflict policy exist. The empty Drizzle/D1 scaffold does not count as implemented persistence.
