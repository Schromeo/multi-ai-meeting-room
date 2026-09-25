# AI Handoff

Last updated: 2026-09-24

## Current Snapshot

- **Approved product train (D-064, 2026-09-18):** [Product Development Plan](PRODUCT_DEVELOPMENT_PLAN.md) makes **Ask the Room** the narrow daily-use entry, keeps Review as the first trust Pack rather than the product boundary, and sequences the broader workspace through DP-0 to DP-9. [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md) is canonical for forward work. DP-0.0 through DP-0.2 are complete; DP-0.3 First-run Information Architecture is Current. No paid call, publication, or Execute action is authorized by this status.
- **Newest engineering gate (D-066 / DP-0.2):** Windows `pnpm check` regenerates Cloudflare runtime types, builds with vinext, passes 63/63 offline tests, lints, and type-checks. The first remote run failed at Corepack signature verification before installation on both OSes. The pinned official pnpm action replaced only that step; [Ubuntu and Windows CI](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748) then passed on `97b865a`. DP-0.2 is Complete. See [validation](evaluations/2026-09-19-dp-0-2-local-portability.md).
- **Newest repository baseline (D-065 / DP-0.1):** the package is the private, untagged `multi-ai-meeting-room@0.0.0-development`; pnpm 11.19.0 plus `pnpm-lock.yaml` is the sole package path; pinned native build dependencies have an explicit allowlist; the repository is `UNLICENSED` with all rights reserved. Stale v0.10c/uncommitted claims are gone. [Baseline evidence](evaluations/2026-09-19-dp-0-1-repository-baseline.md): frozen install and lint pass; Windows build/test scripts, one CRLF-sensitive source test, and three Cloudflare ambient declarations fail reproducibly and belong to DP-0.2. Zero provider calls or deployment.
- **Newest local correction (D-063):** Connection Setup now recognizes current Gemini `AQ.` authorization keys in addition to `AIza`, with Anthropic checked before the overlapping OpenAI `sk-` family and unknown formats left for manual choice. Detection is a local hint only: no persistence, provider probing or credential-verification claim. Build, 63 tests and lint pass; only the three known Cloudflare ambient errors remain. Zero live calls. See [brief](correction-briefs/2026-08-30-provider-key-prefix-detection.md). The prepared Gemini-inclusive three-Seat smoke remains unrun and needs explicit confirmation at action time.
- **Newest local correction (D-062 / PLAN-06):** new Plan Builder/Reviewer stages persist a strict `started` receipt with unknown usage before provider work, then replace the same request/stage with its terminal receipt. No Reviewer receipt means that stage did not start; a surviving started receipt means possible unknown provider usage, never zero. Build, 62 tests and lint pass; only the three known Cloudflare ambient errors remain. Zero live calls. Historical ambiguity is not rewritten and this is not a billing ledger. See [brief](correction-briefs/2026-08-29-plan-stage-request-receipts.md).
- **Newest local correction (D-061 / PLAN-11):** stopped protocol snapshots now preserve `budget` or `human` provenance, while legacy rooms remain neutral. Saved Plan recovery is evaluated against preserved usage before controls enable; an exhausted recovery remains visible but disabled and cannot call a provider. Build, 62 tests and lint pass; only the three known Cloudflare ambient type errors remain. Zero live calls or record migrations. PLAN-11 is locally verified; D-062 separately closes new-Plan receipts while PLAN-12 durable continuity remains open. See [brief](correction-briefs/2026-08-29-plan-stop-and-recovery-truth.md).
- **Newest local correction (D-060 / PLAN-13):** the initial actual-artifact Plan Reviewer now sends native JSON Schema only to explicitly supported Anthropic families, including Fable 5. Local day/length/count semantics remain authoritative; a sole JSON fence is accepted, prose wrappers fail, and no retry/raw retention was added. Build, 62 tests and lint pass; type checking has only the three known Cloudflare ambient errors. Zero live calls; the saved Live014 Plan is untouched. PLAN-13 is local fix/live unverified and PLAN-10 remains open. Next is at most one separately authorized Fable Reviewer-only call against the saved artifact, never another Sol generation. See [brief](correction-briefs/2026-08-29-plan-reviewer-structured-output.md).
- **Newest live result (014):** renewed authorization ran exactly one Sol Builder and one Fable Reviewer. Sol delivered12/12 accepted Plan days; Fable completed but its review failed JSON validation, so the full draft survives without accepted critique or Human Gate. See [evaluation](evaluations/2026-08-29-plan-artifact-first-live-014.md), [Plan](evaluations/artifacts/plan-artifact-first-014/01-plan-readable.md), and diagnostics. D-059/PLAN-17/18 are mechanically verified; D-060 has since fixed the Reviewer contract locally without Plan regeneration or a paid retry.
- **Newest correction and negative live evidence (D-059 / Live012):** Detailed Plan now starts directly with one Builder then one actual-artifact Reviewer under a strict two-call/22K initial budget. History12 found a stale generic synthesis Gate before providers; History13 found the version-zero artifact parser mismatch, with a possible but unconfirmed Sol start and no Fable call. Both are locally fixed; build,61 tests and lint pass. See [evaluation](evaluations/2026-08-29-plan-artifact-first-live-012.md) and [18-item issue register](PLAN_ISSUE_REGISTER.md). Product quality remains unrun; another two-call run needs renewed authority.
- **Newest local correction (D-058 / PLAN-03 in progress):** recognized original GPT-5 Plan Builder now requests low reasoning; actual review/amend/recheck stay medium and other providers/models keep defaults. Attempt diagnostics preserve the requested setting separately from reported reasoning usage. Build,59 tests and lint pass with zero live calls. This is configuration evidence only; one freshly authorized Builder-stage result is still required. See [issue register](PLAN_ISSUE_REGISTER.md).
- **Newest local correction (D-057):** [Plan Issue Register](PLAN_ISSUE_REGISTER.md) tracks16 issues. PLAN-01 initial Builder/reviewer diagnostics persist bounded finish/usage and rejection details without raw responses; PLAN-02 new format directions have explicit phase/round scope.59 offline tests, build and lint pass; zero live calls. Old010/011 diagnostics remain unknown and legacy corrections are not migrated. Actual Plan quality has not passed.
- **Newest continuation (011):** [report](evaluations/2026-08-27-plan-wait-continuation-011.md). D-056 removed Plan deadlines/cumulative-time stops and added one explicit saved-artifact recovery. Same010 room, one new GPT call; no valid new days, review never started. Original77 tasks and six days match the archive; history11, no retry/amendment/approval. Remaining output46K->37K is rounded; raw failure/finish/usage details unavailable. Original cumulative$5 authorization, not another$5. Build,54 offline tests and lint pass; three known Cloudflare type errors remain. Useful full Plan and actual>180s completion remain unproven. D-056 supersedes D-055's historical180s policy below.
- **Newest live result (010):** fresh $5-authorized GPT-5/Opus 4.7 case failed full delivery. Six actual provider requests: one cross-review JSON failure recovered with changed input, then the medium-reasoning Builder timed out at180s with Days1-6 saved. Missing-days recovery was blocked before calling because only one reserved turn remained. No actual-plan review/amendment/recheck or approval. History11; original partial plan and failures archived in [Plan quality010](evaluations/2026-08-27-plan-quality-live-010.md). Failed usage/invoice totals are unknown; do not claim $5 was spent or that quality passed.
- **Stage:** private untagged pre-release at DP-0.3. Historical v0.x names identify preserved development snapshots, not the current release version. Evaluation-tool expansion is closed; M2.12 comparisons are deferred, not passed. Generic orchestration remains frozen.
- **Product:** one human-chaired multi-AI workspace with Review, Decide / Plan, Explore, Create, and future Play Task Packs across Discuss, Research, and Execute permission levels.
- **Implemented:** Review, BYOK, local history and exact approval; structured Detailed LeetCode Plan with bounded generation/recovery, actual-plan review, zero-call human edits, and D-055 explicit amendment/recheck. DP-0.2 local and remote Windows/Ubuntu command matrices pass; real Plan quality remains unproven.
- **Approved but not implemented:** task-adaptive reviewer Role Pack; Finding clustering; independently configured Editor and Verifier; bulk Finding actions; three-case Review evaluation; broader Decide / Plan, Explore, Create, Research, Execute, and Play Task Packs; a durable transition runner with event-cursor reconnection; export; account synchronization; and D1 persistence after identity.
- **Live evidence:** Review Benchmark 001 ran twice with Anthropic Haiku plus OpenAI `gpt-4.1-mini`: ten calls, 27K input tokens, 6,010 output tokens, 96 seconds, and a combined `$0.087` application estimate under the approved `$0.10` ceiling. Run A exposed a shared false future-date inference and proved free-text Chair correction was non-binding. Run B removed that error and proved a rejected Finding remains rejected through cross-review and synthesis, but its malformed, shallow final brief failed the product gate. See `docs/evaluations/2026-08-25-v0.11-review-benchmark-001.md`; provider invoices remain authoritative.
- **Latest live evidence:** Artifact v2 Benchmark 002 used six calls, 3,537 visible output tokens, and 54 seconds. Editor succeeded; Anthropic Verifier failed the changed-material contract. The old composite transition then exhausted its turn budget before Resume. No final Artifact was produced and no call was made after failure. See `docs/evaluations/2026-08-26-v0.11-artifact-v2-benchmark-002.md`.
- **Latest stage evidence:** Verifier v2 Stage Replay 008 called Anthropic Haiku exactly once and passed the dual-lineage/semantics contract with 597 input tokens, 224 output tokens, 3.1 seconds, and a `$0.0034` application estimate. Meeting History remained at 10 records. See `docs/evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md`; provider invoices remain authoritative.
- **Latest mechanical evidence:** Mechanical Review Smoke 004 used exactly six Anthropic Haiku calls and reached the pending Human Gate with one Chair-accepted Change and passing verification. It used 7,144 input tokens, 2,666 output tokens, 32 seconds, and a `$0.041` application estimate, above the predicted `$0.02-$0.03`. See `docs/evaluations/2026-08-26-v0.11-mechanical-review-smoke-004.md`.
- **Latest realistic evidence:** Artifact v2 Benchmark 005 used exactly six OpenAI/Anthropic calls and reached the pending Human Gate with three source-linked Changes. It displayed 14K input tokens, 3,057 output tokens, 48 seconds, and a `$0.046` application estimate. The placeholder removal and bounded `eliminate` rewrite were useful, but both reviewers missed the explicitly constrained `~50%` metric; one reviewer misclassified `reduce` as absolute and the Verifier repeated that premise. See `docs/evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md`.
- **Latest Decide / Plan evidence:** Smoke 006 completed a restored mixed-provider 12-day LeetCode room. The final synthesis used 1,585 output tokens, 22 seconds, and `$0.013`; the room displayed 11K input, 3,974 output, 71 seconds, and `$0.044` total estimated cost. Protocol recovery passed, but the artifact Gate failed because the memo omitted concrete problem names/IDs. See `docs/evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md`.
- **Latest detailed Plan evidence:** Smoke 007 added a 10-MEU daily contract. One changed-input Anthropic review recovery passed; final OpenAI synthesis used 2,092 output tokens, 26 seconds, and `$0.017`, then failed because Day 2 was absent. No retry followed. See `docs/evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md`.
- **Resolved live defects:** provider optional-parameter compatibility; the seat model-selection crash; order-dependent Review rejection caused by undersized Canonical State capacity; prompt-only phase limits; oversized Observer selection output; full Review schema overhead in targeted debate; invisible Observer failure reasons; missing trusted date; non-binding claim decisions; rejected-claim leakage into synthesis; prompt-only Review Brief structure; synthesis card pollution; undersized Decide artifact output; and stale transcript turns poisoning explicit recovery. Original failed rooms remain auditable.
- **Other not implemented:** configured production provider keys, encrypted durable BYOK, skill packs, diversity indicators, export, evidence retrieval, execution connector, or broad comparative evaluation.
- **Current focus:** DP-0.3 first-run information architecture. Preserve existing Review and Plan artifacts and their unresolved quality evidence; do not resume a paid Plan or Review call unless a later DP milestone names its information gain and receives fresh authority.
- **Required correction process:** every implementation slice now begins with the Correction Brief and ends with separate mechanical, semantic, artifact, Human Gate, experience, economic, and differentiated-value results in [Development Correction Loop](DEVELOPMENT_CORRECTION_LOOP.md).
- **Latest local fix:** human day editing at the pending Plan gate, full-plan revalidation, save-before-publish, failed-save draft retention, original-day restore, history and exact revised approval. Original AI Plan/review remain immutable; copy/view state that human edits have not been model-reviewed. No paid call, prompt/budget change or new database store. Three existing Cloudflare declaration errors remain.
- **Latest implementation (D-055):** up to3 selected concerns, one amendment + one distinct-Seat recheck per original Plan, explicit declines and preserved unresolved concerns. Intent/draft saves precede calls; failure stops, completed/dismissed attempts cannot repeat through the UI. Original days/review never mutate; exact approval includes source and amendment. Human edits follow completion/dismissal and are not model-reviewed. Plan artifact calls use medium effort on the existing recognized GPT-5 family, otherwise provider defaults; chosen models stay unchanged. Caps: Builder16K, review6K, amendment12K, recheck6K; Plan timeout180s. Gemini thoughts count toward output usage; incomplete OpenAI Plan responses retain reported usage.
- **Next action:** the DP-0.3 [Correction Brief](correction-briefs/2026-09-24-dp-0-3-first-run-entry.md), [source baseline](evaluations/2026-09-24-dp-0-3-first-run-baseline.md), and local backup branch `backup/dp-0-3-pre-ui-2026-09-24` are ready. Implement the smallest one-Connection Solo and mode-objective correction, then verify its first screen and preserve saved Review/Plan rooms. No provider call or deployment is implied.
- **Recovery points:** `241affd` closes v0.10c and locks the earlier product direction; `d844b40` is the historical seat-model crash fix; `a9a8638` is the clean committed base that entered DP-0.1. Always inspect current HEAD and working-tree status rather than treating these historical hashes as the full current source.
- **Live site:** `https://multi-ai-meeting-room.schromeo.chatgpt.site`
- **Deployment status:** an unauthenticated read-only check on 2026-09-19 returned HTTP 401, so DP-0.1 did not inspect or identify the deployed content version. The older v0.4 / `nodejs_compat` note remains historical evidence, not confirmed current state. Do not publish or attach workspace-funded credentials; deployment work waits for a changed input and the DP-0.6 safety boundary.

## Start-of-Session Checklist

1. Read `PROJECT_CHARTER.md`, `PRODUCT_DIRECTION.md`, `PRODUCT_DEVELOPMENT_PLAN.md`, `DEVELOPMENT_MILESTONES.md`, `DEVELOPMENT_CORRECTION_LOOP.md`, this file, `DECISIONS.md`, `ROADMAP.md`, `MEETING_PROTOCOL_BLUEPRINT.md`, `MODEL_AND_AGENT_BLUEPRINT.md`, and the latest `DEVLOG.md` entry.
2. Inspect the current working tree before editing. Preserve user changes.
3. State which milestone and exit criterion the proposed work advances.
4. Confirm the task is not already completed or recorded as rejected.
5. Keep the change inside the smallest end-to-end test of the current hypothesis.
6. Write the active Correction Brief before implementation; if it cannot be completed, create a fixture, rubric, or baseline instead of expanding code.

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

M2.7 persistence, M2.8 structured state, M2.9 resumable orchestration, implemented M2.10 slices, and Review/Plan artifact lessons form the current Council Kernel. D-064 makes Ask the Room the narrow entry and Review the first trust Pack. `DEVELOPMENT_MILESTONES.md` governs forward order; historical M milestones remain implementation/evidence status. Do not treat Discuss as a universal sequence. `MEETING_PROTOCOL_BLUEPRINT.md` describes implemented behavior, not the required phase order for every Pack.

## End-of-Session Handoff

Before stopping, leave the repository in a buildable state when code changed. Summarize what changed, what was verified, what remains open, and the exact next decision. Do not mark partial work complete merely because a token, time, or retry budget ended.
