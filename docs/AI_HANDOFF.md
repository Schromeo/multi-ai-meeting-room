# AI Handoff

Last updated: 2026-08-03

## Current Snapshot

- **Stage:** M2 real Discuss implementation complete; live provider verification pending.
- **Product:** a human-chaired multi-AI meeting room with Discuss, Research, and Execute permission levels.
- **Implemented:** provider-neutral OpenAI, Anthropic, and Gemini adapters; server-side secrets; token streaming; independent proposals; assigned cross-review; synthesis; one optional revision; human approve/reject gate; usage estimates; stop control; mocked end-to-end protocol tests.
- **Not implemented:** configured production provider keys, live provider evaluation, persistence, evidence retrieval, audit data model, execution connector, or comparative evaluation.
- **Current milestone:** M2 real Discuss room.
- **Next decision:** configure at least two provider secrets and run the first live evaluation.
- **Live site:** `https://multi-ai-meeting-room.schromeo.chatgpt.site`

## Start-of-Session Checklist

1. Read `PROJECT_CHARTER.md`, this file, `DECISIONS.md`, `ROADMAP.md`, and the latest `DEVLOG.md` entry.
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

## End-of-Session Handoff

Before stopping, leave the repository in a buildable state when code changed. Summarize what changed, what was verified, what remains open, and the exact next decision. Do not mark partial work complete merely because a token, time, or retry budget ended.
