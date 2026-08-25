# AI Handoff

Last updated: 2026-08-25

## Current Snapshot

- **Stage:** v0.10c has completed M2.1 connection guardrails, the reusable-seat core of M2.2, M2.7 Local Event Store, M2.8 Structured Meeting State, M2.9 Human-Chaired Resumable Orchestrator, and the deterministic-safety, explicit-Observer, and Dispute-targeted slices of M2.10. Live Baseline 001 completed the real OpenAI plus Anthropic pre-M2.8 path through the Human Gate on 2026-08-04. The 2026-08-25 direction baseline freezes generic orchestration expansion after one bounded v0.10c smoke evaluation and makes Review the first artifact-centered Task Pack.
- **Product:** one human-chaired multi-AI workspace with Review, Decide / Plan, Explore, Create, and future Play Task Packs across Discuss, Research, and Execute permission levels.
- **Implemented:** provider-neutral OpenAI, Anthropic, and Gemini adapters; workspace secrets plus current-page BYOK; explicit provider selection with advisory key-prefix detection; credential verification and compatible-model discovery; a unified connection library; reusable provider-neutral Seats; token streaming; independent proposals; assigned cross-review; synthesis; human approve/reject gate; usage estimates; stop control; staged workspace and transcript modes; validated-turn presentation with Thinking/Generating/Validating progress instead of raw JSON deltas; user-pinned focus and manual Overview following; explicit user navigation from a completed Meeting to Decision; credential-free IndexedDB `RoomStore`; transactional migration and deletion; append-only room, protocol-transition, Chair-Directive, Process-Report, and Round-Brief events; strict portable JSON Turn Envelopes; format-failure events without automatic retry; server- and client-side deterministic source-linked Canonical Reducer gates; Claim, Dispute, Assumption, Chair Directive, Human Choice, and Follow-up contracts; idempotent turn reduction; active-state caps; bounded context rendering; canonical snapshot persistence; explicit split-phase requests; persisted Auto, Checkpoints, and Turn-by-turn control modes; safe-boundary Raise Hand; user-selected one-to-three round limits with a hard five-round protocol cap; explicit resume after interruption; transition recovery and duplicate-call guards; backward-compatible Meeting Budgets; exact pre-call turn gates; observed token/time boundary stops; failed-turn usage accounting; deterministic source-linked Process Reports and reversible structural warnings; explicit user-selected Observer configuration; one budgeted and recoverable post-Review Observer call per enabled round; strict source-linked Round Brief validation; credential-free Observer snapshots and artifacts; Chair-selected open Disputes; deterministic routing to at most two relevant Seats; persisted, budgeted, resumable targeted-debate transitions; 250-output-token targeted responses with no transcript replay; eighteen automated tests.
- **Approved but not implemented:** Review Agenda and source bundle; task-adaptive reviewer Role Pack; Finding clustering; independently configured Editor; structured Change Set; Artifact v2 and changed-material verification; separate executive brief and detailed Artifact; item-level Human Gate; three-case Review evaluation; later Decide / Plan, Explore, Create, Research, Execute, and Play Task Packs; a durable transition runner with event-cursor reconnection; export; account synchronization; and D1 persistence after identity.
- **Live evidence:** OpenAI `gpt-5-mini` and Anthropic `claude-haiku-4-5-20251001` completed five provider calls with 2,437 input tokens, 3,424 output tokens, 54 seconds of model time, and a $0.032 advisory estimate. The Human Gate remains pending. The report is `evaluations/2026-08-04-v0.6-live-baseline.md`.
- **Resolved live defects:** the OpenAI adapter no longer sends optional `reasoning.effort` or `text.verbosity` controls unconditionally. The Anthropic adapter no longer sends `thinking.type: "disabled"`, which newer adaptive-thinking models reject; ordinary meetings omit `thinking` and retain the provider default. Regression assertions cover both request boundaries. The original failed rooms still demonstrate safe stopping without automatic retry.
- **Other not implemented:** configured production provider keys, encrypted durable BYOK, skill packs, diversity indicators, export, evidence retrieval, execution connector, or broad comparative evaluation.
- **Current milestone:** final M2.10 evidence gate, followed by M2.11 Review Task Pack.
- **Next action:** preserve a recoverable v0.10c source point, then run one explicitly budget-approved fresh Checkpoints room that reaches an open Dispute, lets the Chair choose one targeted round, and verifies that only the routed Seats plus one Observer call run before synthesis. Record cost, latency, format reliability, and whether the named Dispute became more decision-useful. After recording that bounded evidence, begin the smallest end-to-end Review benchmark; do not continue generic Observer, routing, autonomy, or interface infrastructure work.
- **Recovery point:** commit `f986b5e` is the exact pre-M2.9 source state. The existing tag `backup/v0.6-live-baseline-2026-08-04` preserves the earlier live baseline. The current M2.9 changes remain in the working tree because this environment denied `.git/index.lock` and tag-lock writes, so it could not stage, commit, or create a new backup tag.
- **Live site:** `https://multi-ai-meeting-room.schromeo.chatgpt.site`
- **Deployment status:** the live URL still serves the prior version. The v0.4 source is pushed and saved, but Sites publication is blocked by its generated `nodejs_compat` flag conflicting with the platform default introduced on 2026-08-04. Do not retry with unchanged inputs.

## Start-of-Session Checklist

1. Read `PROJECT_CHARTER.md`, `PRODUCT_DIRECTION.md`, this file, `DECISIONS.md`, `ROADMAP.md`, `MEETING_PROTOCOL_BLUEPRINT.md`, `MODEL_AND_AGENT_BLUEPRINT.md`, and the latest `DEVLOG.md` entry.
2. Inspect the current working tree before editing. Preserve user changes.
3. State which milestone and exit criterion the proposed work advances.
4. Confirm the task is not already completed or recorded as rejected.
5. Keep the change inside the smallest end-to-end test of the current hypothesis.

## Loop and Retry Guardrails

- Agent deliberation defaults to at most **three rounds**. More rounds require a human decision or evidence that another round can resolve a named open issue.
- A tool, API, build, or deployment operation gets one initial attempt and at most **two retries**.
- A retry is allowed only after a transient failure or a concrete change in inputs, state, permissions, or implementation.
- Never repeat the same call with unchanged inputs after the same failure.
- Stop when the success condition is met, the round or retry budget is exhausted, the next action needs new authority, or no unresolved issue can be changed by another round.
- Do not create unattended recursive agent-to-agent conversations.
- Record provider request IDs or idempotency keys when supported so actions cannot be duplicated silently.

## Human Approval Boundaries

Explicit human approval is required before:

- entering Execute mode for a new task;
- modifying a real repository, account, external service, or production environment;
- expanding permissions, budget, model count, or maximum rounds;
- publishing to a broader audience or sending information to a third party;
- accepting an unresolved high-impact risk.

Read-only inspection and simulated discussion do not require Execute approval.

## Room Invariants

- Every room has an objective, constraints, expected artifact, permission level, budget, and stop condition.
- Every participant has a role, model, context policy, and tool policy.
- A synthesis must retain unresolved disputes and confidence limits.
- An Execute action must reference an approved Decision.
- A review agent should not automatically inherit the executor's private reasoning.
- Deterministic checks such as tests cannot be replaced by model agreement.
- Events and artifacts are append-only in the audit history; corrections create new records.

## Definition of Done

A milestone is done only when:

1. Its exit criteria pass.
2. Relevant tests or evaluations have run.
3. Known limitations and failures are recorded.
4. `DEVLOG.md` is updated.
5. `ROADMAP.md` reflects the new status.
6. Durable choices are added to `DECISIONS.md`.
7. Chinese mirrors are updated with the same meaning.

## M2 Live Verification Target

Verify the implemented Discuss workflow with real providers:

1. The user submits an objective and chooses two or three participants.
2. Participants produce independent streamed proposals.
3. Each participant reviews a specifically assigned proposal or claim.
4. The system displays agreements, disputes, and unverified assumptions.
5. A synthesizer produces a decision memo without erasing dissent.
6. The human accepts, revises, rejects, or requests one additional bounded round.

M2 does not include web research, coding execution, generic tool plugins, or autonomous loops. Provider secrets and model defaults are documented in `PROVIDER_CONFIGURATION.md`.

## Approved Product Target

M2.7 persistence, M2.8 structured state, M2.9 resumable orchestration, and the implemented M2.10 slices form the current Shared Core. After one bounded live check, build M2.11 Review and M2.12 evidence before M2.13 Decide / Plan. Do not treat the Discuss protocol as a universal sequence for every Task Pack. `PRODUCT_DIRECTION.md` is canonical for product order; `MEETING_PROTOCOL_BLUEPRINT.md` remains canonical for the implemented Discuss protocol.

## End-of-Session Handoff

Before stopping, leave the repository in a buildable state when code changed. Summarize what changed, what was verified, what remains open, and the exact next decision. Do not mark partial work complete merely because a token, time, or retry budget ended.
