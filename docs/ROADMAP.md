# Roadmap

Statuses: `Complete`, `Current`, `Planned`, `Deferred`.

## Current Position

- **Local product version:** v0.6.
- **Working baseline:** real streaming Discuss protocol, reusable model Seats, session BYOK, human decision gate, and browser-local meeting history.
- **Live evidence gate:** completed on 2026-08-04 with OpenAI `gpt-5-mini` plus Anthropic `claude-haiku-4-5-20251001`; see [Live Baseline 001](evaluations/2026-08-04-v0.6-live-baseline.md).
- **Immediate implementation gate:** fix model-specific OpenAI optional parameters, create a named v0.6 backup, then begin M2.7.
- **Approved next architecture:** Meeting Protocol Blueprint v1. It is documented but not implemented.
- **Critical path:** live baseline -> local Event Store -> Canonical Meeting State -> resumable Chair-controlled orchestrator -> Observer and targeted debate -> whiteboard and Follow-up -> comparative evaluation.

The protocol refactor must not begin with a large interface rewrite. Storage and state contracts come first; a named backup is required before major frontend work.

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

**Implementation progress:** all listed product and protocol surfaces are implemented and covered by a mocked end-to-end stream test. A real OpenAI plus Anthropic room completed proposal, cross-review, synthesis, usage reporting, persistence, and the Human Gate on 2026-08-04. M2 remains current while the OpenAI adapter's model-specific optional parameters are made capability-aware and the comparison evidence is broadened.

## M2.1 - Connection and Cost Guardrails - Current

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

**Implementation progress:** meeting transcripts, memos, human decisions, usage, and participant summaries now persist in a bounded browser-local archive. Users can create a new room without deleting prior records, reopen saved records, and delete them explicitly. Credentials are excluded. Account ownership, server sync, durable event storage, export, and cross-device recovery remain.

## M2.6 - Meeting Protocol Blueprint v1 - Complete

**Outcome:** define the next bounded Discuss architecture before modifying the running protocol.

**Delivered:** Human Chair control modes; Chair Directives; participant, Observer, Recorder, and Final Synthesizer boundaries; Turn Envelope; Canonical Meeting State; Round Brief; Process Report; Follow-up; versioned Memo; context policy; output caps; budget and stop policy; local-first persistence; UX attention model; and implementation order.

**Exit criteria met:** English and Chinese blueprints distinguish implemented behavior from approved future behavior and identify remaining open decisions.

## M2.7 - Local Event Store - Planned

**Depends on:** current v0.6 history and the approved protocol blueprint.

**Deliverables:** a provider-independent `RoomStore`; IndexedDB implementation; schema versioning; migration from the current localStorage meeting records; Room, participant snapshot, append-only Event, State Snapshot, Artifact, and Usage collections; transactional room deletion; and export-ready reads.

**Security boundary:** API keys, authorization headers, and credential-bearing Connection records never enter the store. Persisted system-role and Seat records keep provider/model/role snapshots only.

**Exit criteria:** a completed or interrupted room can be reconstructed from local events and the latest valid snapshot after refresh, without restoring any credential.

## M2.8 - Structured Meeting State - Planned

**Depends on:** M2.7.

**Deliverables:** Turn Envelope validation; concise statement and card limits; Claim, Dispute, Assumption, Chair Directive, Human Choice, and Follow-up records; deterministic Canonical Reducer; source lineage; active-state token cap; state versions; and explicit format-error handling without automatic paid retry.

**Exit criteria:** model output can update the room only through validated events, every active state item is traceable to source messages, and the rendered model working state remains within its configured cap.

## M2.9 - Human-Chaired Resumable Orchestrator - Planned

**Depends on:** M2.8.

**Deliverables:** explicit room state machine; Auto, Checkpoints, and Turn-by-turn modes; Raise Hand; append-only Chair Directives; safe-boundary pause and resume; user-selected maximum rounds; targeted extra turns; idempotent transition IDs; and interruption recovery.

**Exit criteria:** the Chair can pause after a safe boundary, add a scoped instruction, resume without duplicate provider calls, and recover the same protocol state after refresh.

## M2.10 - Observer, Budgets, and Targeted Debate - Planned

**Depends on:** M2.9.

**Deliverables:** user-selected Observer model; deterministic novelty and progress metrics; one bounded Observer call per completed round; source-linked Round Brief; loop, drift, and premature-homogenization report; hard round/turn/token/time bounds; advisory cost limit when pricing is unknown; preflight maximum call count; and routing of later rounds only to named unresolved disputes.

**Exit criteria:** every extra turn is attributable to a specific unresolved issue, hard limits terminate automatically, soft quality stops are visible and reversible by the Chair, and the Observer cannot mutate state or approve a Decision.

## M2.11 - Decision Whiteboard and Follow-up - Planned

**Depends on:** M2.10.

**Deliverables:** user-selected Final Synthesizer; Meeting Whiteboard for Claims, changed positions, Disputes, assumptions, and Chair questions; card-first live turns; expandable raw audit; source-linked Round Briefs; versioned Decision Memos; Ask Author, Ask Seat, Ask Room, and Ask Synthesizer follow-ups; targeted revision; and Memo amendment flow through a new Human Gate.

**Exit criteria:** a user can understand the current decision without reading the full transcript, trace every consequential Memo section to sources, ask a scoped follow-up without reopening the whole room, and approve only an immutable Memo version.

## M2.12 - Discuss v1 Evaluation and Consolidation - Planned

**Depends on:** M2.11, while the first baseline measurement happens before M2.7.

**Baseline progress:** Live Baseline 001 is complete. It found useful cross-model deltas, excessive output volume, arbitrary generated thresholds entering the memo, final-only human control, and an OpenAI model-parameter compatibility gap.

**Deliverables:** saved single-model baselines; current v0.6 versus Protocol v1 comparison; representative product, planning, and architecture prompts; loop and homogenization fixtures; interruption and recovery tests; context-growth measurements; call, token, latency, cost, and human-reading-effort reports; and a failure taxonomy.

**Exit criteria:** evidence shows when the structured multi-model protocol adds decision value, when it should stop early, and whether its cost and reading burden are acceptable. Features that fail the evaluation are simplified or removed before Research work begins.

## M3 - Audit Ledger - Planned

**Deliverables:** Claim, Evidence, Dispute, Decision, Action, Artifact, and Evaluation records.

**Exit criteria:** a user can trace a final decision back to its supporting claims, objections, revisions, and human approval.

**Relationship to M2.8:** M2.8 introduces the local room records required by the Discuss protocol. M3 expands them into evidence-aware, queryable audit entities rather than restarting the data model.

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

## M5 - Evaluation and Hardening - Planned

**Deliverables:** single-model baseline, outcome rubric, regression scenarios, cost/latency dashboard, failure taxonomy, and recovery paths.

**Exit criteria:** the project can demonstrate where multi-agent deliberation helps, where it does not, and what it costs.

## Deferred Until Evidence Supports Them

Multi-user collaboration, platform-paid billing, model marketplace, mobile clients, unattended autonomy, broad external integrations, and cloud execution infrastructure.

Account-backed D1 room sync is also deferred until identity, room ownership, deletion semantics, encryption boundaries, and conflict policy exist. The empty Drizzle/D1 scaffold does not count as implemented persistence.
