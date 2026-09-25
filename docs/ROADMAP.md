# Roadmap

Statuses: `Complete`, `Current`, `Planned`, `Deferred`.

## Current Position

- **DP-0.2 engineering portability complete (D-066, 2026-09-24):** the repository-owned vinext launcher, CRLF-safe source test, pinned Wrangler generation, and optional inactive D1 typing pass the canonical `pnpm check`. The first [CI run](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076814165) failed in Corepack before install on both platforms; replacing that installer with the pinned official pnpm action produced passing [Ubuntu and Windows jobs](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748) on `97b865a`. DP-0.3 is now Current at its Correction Brief and baseline gate. See [validation](evaluations/2026-09-19-dp-0-2-local-portability.md).
- **DP-0.1 repository truth complete (D-065, 2026-09-19):** package identity is `multi-ai-meeting-room@0.0.0-development`, pnpm 11.19.0 plus `pnpm-lock.yaml` is the sole package path, the four pinned native build dependencies have explicit install permission, and the private repository is `UNLICENSED` with all rights reserved. README and current status language now point to the DP train rather than stale v0.10c/uncommitted claims. The [command baseline](evaluations/2026-09-19-dp-0-1-repository-baseline.md) records install and lint passing, plus the Windows script, CRLF test, and Cloudflare type failures now owned by DP-0.2. Zero provider calls or deployment.
- **Development-plan reframe approved (D-064, 2026-09-18):** [Product Development Plan](PRODUCT_DEVELOPMENT_PLAN.md) defines a broad human-chaired Multi-AI workspace with a narrow **Ask the Room** entry, alternating Habit and Trust evidence, and staged expansion into Explore, Create, Research, Play, Project Rooms, and controlled Execute. [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md) is canonical for forward build order. DP-0 is Current; approval alone authorizes no paid call, publication, or Execute action.
- **Provider key hints updated (D-063):** Setup now recognizes Gemini `AQ.` authorization keys as well as `AIza`, while preserving ordered Anthropic/OpenAI detection and explicit manual fallback. The rule is local-only and never cross-probes providers. Build, 63 tests and lint pass with zero live calls. This closes the immediate Gemini autodetect defect; it does not verify credentials or add providers.
- **PLAN-06 request receipts closed for new Plans (D-062):** each Builder/Reviewer stage now records `started` with unknown usage before provider work and replaces it in place with its terminal receipt. An absent Reviewer receipt now means it never reached its stage; a persisted started receipt means usage may exist and is not zero. Build, 62 tests and lint pass with zero live calls. Historical ambiguity and provider invoice authority remain unchanged; no generic billing platform was added.
- **PLAN-11 recovery truth closed (D-061):** stopped snapshots now distinguish budget and human provenance while old rooms remain neutral. Saved Plan recovery is disabled before invocation when preserved input/output usage is exhausted; no provider call can start through either control. Build, 62 tests and lint pass with zero live calls. D-062 separately closes new-Plan stage receipts; PLAN-12 durable execution remains open.
- **PLAN-13 local contract closeout (D-060):** supported Anthropic actual-Plan Reviewers now use native JSON Schema while local task semantics remain authoritative. Strict fence/prose and unsupported-model compatibility tests pass; build, 62 tests and lint pass with zero live calls. PLAN-13 is Local fix (live unverified), not complete; PLAN-10 remains open. Next is at most one separately authorized Fable Reviewer-only call against the saved Live014 Plan, never another Builder generation.
- **Artifact-first live014, complete draft / rejected review:** renewed two-call authorization ran Sol then Fable exactly once each. Sol delivered12/12 accepted days; Fable completed but returned invalid JSON, so review/Human Gate/multi-model improvement failed while the full draft remained saved. See [evaluation and artifacts](evaluations/2026-08-29-plan-artifact-first-live-014.md). D-059 and PLAN-17/18 are mechanically verified. D-060 now fixes PLAN-13 locally; PLAN-10 and live verification remain open.
- **Artifact-first live012, mechanical failure then local fix (D-059):** Detailed Plan now launches directly as Sol Builder -> Fable actual-artifact Reviewer with a strict two-call/22K initial budget. History12 was rejected before providers by a stale generic synthesis Gate. History13 rejected the valid version-zero empty checkpoint; its Sol start/billing is unknown and Fable did not run. Both contracts now pass build,61 offline tests and lint. See [evaluation](evaluations/2026-08-29-plan-artifact-first-live-012.md) and18-item issue register. A further two-call run requires renewed authority; no quality claim.
- **PLAN-03 local profile, evidence pending (D-058):** recognized original GPT-5 Builder requests low; Plan semantic judgment remains medium and other providers/models retain defaults. Requested setting is persisted separately from usage. Build,59 tests and lint pass with zero live calls. One fresh-authority Builder-stage result is the exit evidence; M2.13 remains Current.
- **PLAN-01/02 locally fixed (D-057):** bounded initial Plan attempt diagnostics and phase/round-scoped new format directions. Build,59 offline tests and lint pass with zero live calls. See [16-item issue register](PLAN_ISSUE_REGISTER.md); historical011 evidence is still missing, old corrections unchanged, M2.13 quality stillCurrent.
- **Latest continuation011, failed:** D-056 wait/recovery correction passes build/54 offline tests/lint. One new GPT request in the same010 record returned no valid new days; review was not called,6/12 preserved, history11. Time cutoff was not this failure; output exhaustion versus parser rejection remains unobservable. See [011 report and ordered backlog](evaluations/2026-08-27-plan-wait-continuation-011.md). No new$5 authorization or automatic retry.
- **Newest Plan gate, failed:** [Quality010](evaluations/2026-08-27-plan-quality-live-010.md) used six real GPT-5/Opus4.7 calls under fresh $5 authorization. One changed-input format recovery passed; Builder timed out at180s with6/12 days. Missing-days recovery was blocked by shared call reservations before another call. Actual-plan review and D-055 amendment remain untested. Partial original and failure evidence are archived; history11, invoice/failed usage unknown.
- **Source identity:** this is an untagged private pre-release. Current source is identified by Git commit plus dirty state when present and the active DP milestone; historical v0.x labels name preserved development snapshots, not releases.
- **Working baseline:** real streaming Discuss protocol, reusable model Seats, session BYOK, human decision gate, credential-free IndexedDB Event Store, deterministic Canonical Meeting State, and a persisted human-chaired resumable orchestrator.
- **Live evidence gate:** completed on 2026-08-04 with OpenAI `gpt-5-mini` plus Anthropic `claude-haiku-4-5-20251001`; see [Live Baseline 001](evaluations/2026-08-04-v0.6-live-baseline.md).
- **Immediate evidence gate:** [Artifact v2 Benchmark 005](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md) reached the pending Human Gate in six mixed-provider calls for a `$0.046` application estimate. The mechanical path passed, but the quality Gate failed: an explicit metric constraint was missed and the Verifier endorsed a semantically weak rewrite. No broader work is planned.
- **Decide / Plan preview evidence:** [Smoke 006](evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md) completed protocol recovery for $0.044 estimated total but failed artifact quality by omitting concrete problems. This remains a failed quality Gate; the new structured path has only offline evidence.
- **Detailed Plan evidence:** [Smoke 007](evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md) rejected a 2,092-token synthesis missing Day 2. A day-addressable Plan, per-day validation/checkpoints, distinct-Seat actual-plan review, missing-day-only recovery, and immutable approval are now locally implemented. Real-provider quality and browser acceptance remain unverified.
- **Latest bounded evidence:** [Verifier v2 Stage Replay 008](evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md) passed the dual-lineage/semantics contract in exactly one Anthropic Haiku call: 597 input tokens, 224 output tokens, 3.1 seconds, and a `$0.0034` application estimate. Meeting History stayed at 10 records.
- **Correction Gate:** [Development Correction Loop](DEVELOPMENT_CORRECTION_LOOP.md) is now required before implementation, paid evaluation, and milestone close. Recent failures are classified separately as mechanical, semantic, artifact, Human Gate, experience, economic, and differentiated-value evidence.
- **M2.12 evidence:** the [Review Comparison Kit](evaluations/M2.12_REVIEW_COMPARISON.md) has three fixed cases and a scored [S1 resume baseline 009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md): 3/3 issues repaired, usability 2/2, weak human checks, incomplete receipt metadata. One call, $0.00547 standard-price estimate versus $0.0038 generic app estimate. M3/R6 and other cases are NOT RUN; comparative advantage is unknown.
- **Approved product direction:** one Council Kernel grows through validated Task Packs. Ask the Room is the narrow daily entry and Review is the first artifact-centered trust Pack; see [Product Direction](PRODUCT_DIRECTION.md).
- **Preserved M2.13 evidence path (D-060/D-061/D-062):** Live014 supplies the preserved complete artifact; Reviewer-format reliability, truthful recovery controls, and new stage receipts pass locally. The saved-artifact Fable review remains unrun and M2.13 quality/value remain incomplete. D-064 moves this work out of the immediate queue; it may resume only when DP-2 names the information gain and fresh paid-call authority exists. No Plan regeneration or automatic retry.

The current foundation is sufficient for the approved product train. No further generic protocol, Observer, routing, agent-autonomy, or broad interface infrastructure work begins without a named Task Pack need. A named backup remains required before major frontend work.

## Canonical Development Train

- **DP-0 - Current:** product/repository truth, engineering portability, first-run information architecture, credential-free demo, export, public API safety, and first-minute acceptance.
- **DP-1 - Planned:** Quick Council / Ask the Room daily-use evidence.
- **DP-2 - Planned:** bounded Review trust evidence and simplification decision.
- **DP-3 - Planned:** Pack contract from two validated consumers.
- **DP-4 through DP-9 - Planned:** Explore/Create, Research, Play proof, read-only Project Room, controlled Execute, and selective productization.

DP-0.0 through DP-0.2 are complete. DP-0.3 First-run Information Architecture is the only Current implementation milestone. The exact sub-milestones, dependencies, budgets, acceptance checks, and stop rules live in [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md).

## Preserved Legacy Correction Path

The following items preserve Review and Plan evidence and may be resumed only when the DP train names them. They no longer override DP-0 as the immediate build order.

1. **M2.11 close-out:** item-level editing, Artifact v3, immutable approval, and the bounded Verifier v2 provider Gate are complete. Keep original now closes the zero-accepted-Finding path with exact v1, explicit not-run verification, and human approval. Broader Review machinery stays frozen.
2. **M2.12 product comparison - deferred:** preserve S1 and the existing kit; do not expand tooling or automatically run M3/R6. Return only with a named information gain and fresh budget. This is not comparative success.
3. **M2.13 artifact-first entry - preserved/open:** structured Plan, recovery, human edits and explicit model amendment/recheck now exist. D-060 locally closes the Fable review-format boundary without regenerating the saved Plan. A scripted Day 2 critique changes Day 2 without changing other days; original, declines and remaining concerns persist. DP-2 may later prove one grounded real review, then amendment/recheck and human adoption. No generic editor/configuration expansion or new benchmark platform; offline closure is not teaching quality or comparative success.
4. **Model evidence:** compare a strong single model, the bounded multi-model path, a stronger independent Artifact Builder, and phase-specific reasoning settings with one variable changed per run.
5. **Experience pass:** once the artifact path passes, show stage progress and completed artifact units without exposing streamed transport JSON. Broad visual redesign remains outside this correction path.

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

**Implementation progress:** M2.10a adds backward-compatible Meeting Budgets, exact pre-call agent-turn gates, observed token/time boundary stops, failed-turn usage accounting, deterministic source-linked Process Reports, reversible structural warnings, and compact budget visibility. The validated-turn presentation correction keeps raw JSON off-stage and preserves manual focus. M2.10b adds an optional user-selected Observer outside the Seat count, exactly one recoverable post-Review call per enabled round, a 5,000-character Canonical State plus Process Report context boundary, strict source-reference validation, a 300-output-token ceiling without automatic retry, source-linked Round Briefs, preflight accounting, and credential-free event/artifact persistence. M2.10c adds a Human Chair Dispute picker, deterministic routing to at most two relevant Seats, a persisted and resumable targeted-debate plan, and a dedicated 400-output-token minimal targeted Envelope using only the named Dispute, related Claim, active Directives, and bounded source IDs, plus a new Process Report and optional Round Brief over only that round's delta. Phase-specific parser limits and worst-case Canonical State capacity now admit the full bounded three-Seat Proposal/Review batch. Existing rooms default new fields safely and remain readable. The 2026-08-25 smoke validated the mixed-provider Proposal/Review path but did not complete the final targeted-debate/Observer/synthesis chain. Semantic quality evaluation, user-editable multi-dimensional limits, and authoritative cost enforcement remain.

**Scope freeze:** generic M2.10 expansion is over. The first small M2.11 Review benchmark may exercise the corrected minimal targeted Envelope once. Success closes this evidence Gate; another failure makes targeted debate optional for the Review Pack instead of opening another orchestration milestone. Broader Observer semantics, semantic routing, embedding novelty, authoritative pricing, and more budget controls remain outside the critical path.

## M2.11 - Review Task Pack - Current

**Depends on:** M2.10.

**Product case:** review one supplied artifact against an objective, reference material, and explicit truth constraints.

**Deliverables:** Review Agenda; Artifact v1 and source bundle capture; task-adaptive reviewer Role Pack; independent Finding cards; duplicate clustering that preserves conflicts; one named high-impact cross-review; independently configured Editor or explicit participant-reuse savings mode; structured Change Set; Artifact v2; changed-material verification; separate executive brief and detailed Artifact; item-level accept, reject, or edit actions; immutable approved Artifact version; and expandable audit lineage.

**Initial benchmarks:** resume against a job description, product or requirements document, and technical plan.

**Implementation progress:** v0.11a added Review Task inputs and canonical independent Findings. v0.11b added trusted time, binding Chair decisions, and canonical-only synthesis. v0.11c added a strict Change Set, application-derived Artifact v2, changed-material verification, result views, budget/progress handling, and restoration. Benchmark 002 then proved Editor completion but failed Verifier formatting and composite recovery. v0.11d added concrete Verifier response skeletons, field diagnostics, a persisted `ReviewEditCheckpoint`, Verifier-only resume, and one preflight-visible recovery allowance. v0.11e added a development-only fixed Verifier Stage Replay with one-call/no-retry/no-persistence bounds. Stage Replay 003 and Mechanical Smoke 004 passed, and realistic Benchmark 005 reached Human Gate while exposing missed-Finding and Verifier-independence failures. v0.11f adds append-only source-linked Chair Finding addition/supersession, client and server source validation, dual lineage/semantics checks, and deterministic Remaining Human Checks. v0.11i adds zero-call item-level replacement editing, application-derived Artifact v3, immutable model lineage, explicit v2 verification scope, and credential-free revision persistence. v0.11j adds a source-bound immutable approved snapshot and atomic decision rollback. Stage Replay 008 passes the v2 dual-lineage/semantics contract against Anthropic Haiku in one bounded call. Independent system-role configuration and Finding clustering remain proposals pending M2.12 evidence rather than automatic implementation work.

**Exit criteria:** a user can provide Artifact v1 and sources, receive material independent Findings and a detailed Artifact v2, trace every accepted change to a Finding and source or explicit inference, decide changes individually, and complete the flow without reading the full transcript or replaying the entire detailed Artifact into every model request.

The durable transition runner remains outside this slice unless navigation prevents the bounded Review case from completing. It must exist before any claim that paid work continues safely across page navigation, but it cannot replace the Artifact outcome as the milestone goal.

## M2.12 - Review Evaluation and Shared Core Consolidation - Deferred

**Depends on:** M2.11.

**Baseline progress:** Live Baseline 001 is complete. It found useful cross-model deltas, excessive output volume, arbitrary generated thresholds entering the memo, final-only human control, and an OpenAI model-parameter compatibility gap.

**Preparation complete:** the existing three-case kit, offline exporter, S1 entry, receipt access, and estimate provenance are sufficient. S1 009 is scored; no second matched arm has run. D-052 closes tooling expansion and defers comparisons while bounded main-flow failures are corrected. M2.11 is not declared product-complete on a format pass.

**S1 completed with limits:** [009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md) repaired all seeded defects with one pinned GPT-4.1 call. Full visible output is archived; server receipt metadata is incomplete, human checks are weak, and generic app estimates differ from model prices. The zero-call receipt fix does not retroactively fill metadata. M3/R6 remain unrun; future comparison needs a named information gain and fresh approval.

**Deliverables:** saved single-model baselines; a documented manual GPT-to-Claude-style copy/review baseline; Review Task Pack runs on all three benchmarks; task-specific rubrics; accepted unique changes; rejected or unsupported Findings; human edit distance; call, token, latency, cost, and reading-effort reports; coordination failure taxonomy; and removal or simplification decisions for low-value protocol features.

**Exit criteria:** evidence identifies important accepted improvements unique to structured cross-review, shows whether they justify cost and effort, and leaves only abstractions required by Review plus at least one named second consumer. Features that fail the evaluation are simplified, made optional, or removed.

## M2.13 - Decide / Plan Task Pack - Current

**Depends on:** M2.12 for broad Task Pack expansion. D-052 permits the bounded detailed-Plan correction while comparisons are deferred; this does not declare M2.12 complete.

**Local implementation:** 12-day / 10-MEU / 360-minute defaults; artifact-first Builder then distinct actual-plan Reviewer; bounded missing-day/reviewer-only recovery. D-054 adds human day editing and exact approval. D-055 adds explicit affected-day model amendment/recheck, immutable source/audit, explained declines, residual concerns and a task-shaped quality profile. D-060 uses native JSON Schema for explicitly supported Anthropic Plan Reviewers while preserving local semantic validation and no retry. Real Reviewer acceptance, teaching quality, amendment/recheck adoption, browser/storage behavior and broader cases remain open. See [Quality Closure Brief](correction-briefs/2026-08-27-plan-quality-closure.md).

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
