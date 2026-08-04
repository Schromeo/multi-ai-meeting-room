# AI Handoff

Last updated: 2026-08-04

## Current Snapshot

- **Stage:** v0.7 has completed M2.1 connection guardrails, the reusable-seat core of M2.2, and M2.7 Local Event Store. M2.6 Meeting Protocol Blueprint v1 is complete as documentation. Live Baseline 001 completed the real OpenAI plus Anthropic path through the Human Gate on 2026-08-04.
- **Product:** a human-chaired multi-AI meeting room with Discuss, Research, and Execute permission levels.
- **Implemented:** provider-neutral OpenAI, Anthropic, and Gemini adapters; workspace secrets plus current-page BYOK; explicit provider selection with advisory key-prefix detection; credential verification and compatible-model discovery; a unified connection library with naming, transactional key replacement, model reload, usage visibility, and confirmed disconnect; reusable connections; per-seat connection management; duplicate-provider seats with per-seat models and roles; token streaming; independent proposals; assigned cross-review; synthesis; one optional revision; human approve/reject gate; usage estimates; stop control; staged Setup/Agenda/Meeting/Decision workspace; focus and overview transcript modes; a credential-free `RoomStore` backed by seven versioned IndexedDB stores; transactional legacy localStorage migration and room deletion; append-only completed/failed turn events; room, participant, state snapshot, memo artifact, and usage persistence; bounded room pruning; mocked end-to-end protocol tests.
- **Approved but not implemented:** Turn Envelopes; Canonical Meeting State; Claim and Dispute lineage; Auto, Checkpoints, and Turn-by-turn modes; Raise Hand and Chair Directives; user-selected Observer and Final Synthesizer; Round Briefs; process monitoring; maximum-round and multi-dimensional budgets; targeted debate; Meeting Whiteboard; source-linked Follow-up; versioned Memos; export; account synchronization; and D1 persistence after identity.
- **Live evidence:** OpenAI `gpt-5-mini` and Anthropic `claude-haiku-4-5-20251001` completed five provider calls with 2,437 input tokens, 3,424 output tokens, 54 seconds of model time, and a $0.032 advisory estimate. The Human Gate remains pending. The report is `evaluations/2026-08-04-v0.6-live-baseline.md`.
- **Resolved live defect:** the OpenAI adapter no longer sends optional `reasoning.effort` or `text.verbosity` controls unconditionally. A `gpt-4.1-mini` regression test asserts both fields are absent. The original failed room still demonstrates safe stopping without automatic retry.
- **Other not implemented:** configured production provider keys, encrypted durable BYOK, skill packs, diversity indicators, export, evidence retrieval, execution connector, or broad comparative evaluation.
- **Current milestone:** M2.8 Structured Meeting State.
- **Next action:** define and validate the Turn Envelope and implement the deterministic Canonical Reducer contracts over M2.7 events, without beginning the planned interface redesign.
- **Recovery point:** commit `3298d40` and tag `backup/v0.6-live-baseline-2026-08-04` preserve the pre-M2.7 live baseline.
- **Live site:** `https://multi-ai-meeting-room.schromeo.chatgpt.site`
- **Deployment status:** the live URL still serves the prior version. The v0.4 source is pushed and saved, but Sites publication is blocked by its generated `nodejs_compat` flag conflicting with the platform default introduced on 2026-08-04. Do not retry with unchanged inputs.

## Start-of-Session Checklist

1. Read `PROJECT_CHARTER.md`, this file, `DECISIONS.md`, `ROADMAP.md`, `MEETING_PROTOCOL_BLUEPRINT.md`, `MODEL_AND_AGENT_BLUEPRINT.md`, and the latest `DEVLOG.md` entry.
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

## Approved Protocol v1 Target

M2.7 persistence is complete; implement M2.8 through M2.12 in order. State contracts precede orchestration; orchestration precedes interface rework. The target separates raw transcript, Canonical Meeting State, and per-agent context; gives the human Chair in-meeting control; adds explicit paid Observer and Final Synthesizer roles; and routes later turns only to named disputes. `MEETING_PROTOCOL_BLUEPRINT.md` is canonical for this future design.

## End-of-Session Handoff

Before stopping, leave the repository in a buildable state when code changed. Summarize what changed, what was verified, what remains open, and the exact next decision. Do not mark partial work complete merely because a token, time, or retry budget ended.
