# Development Log

This chronological log records shipped work, validation, limitations, and the next decision. It is not a place for uncommitted feature ideas; those belong in the roadmap or decision record.

## 2026-09-24 - DP-0.3 Local Entry/Solo Slice (Incomplete)

- Implemented the four intent entries, Chat-first Solo surface, mode-specific objective drafts, and a bounded session-BYOK Solo API without changing saved-room schema or calling a live provider. A Connection change clears Solo context; the workspace-funded key path is rejected.
- Local `pnpm check` passes build, 65 tests, lint, and type check. Browser checks under `pnpm dev` verified the empty-session entry, draft isolation, and 390px first screen. See the [local evaluation](evaluations/2026-09-24-dp-0-3-local-entry-slice.md).
- DP-0.3 stays Current. Old-record browser replay and full acceptance remain open. Local `pnpm start` served HTML but returned 404 for generated CSS; production visual validity is unresolved. Zero real provider calls or deployment.

## 2026-09-24 - DP-0.2 Remote CI Closure

- Pushed the reviewed DP-0.1/DP-0.2 branch and opened [draft PR #1](https://github.com/Schromeo/multi-ai-meeting-room/pull/1). The [first CI run](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076814165) failed on both OSes at `corepack prepare`: the Node 22.13.0 bundled Corepack did not recognize the pnpm registry signature key. Neither job reached dependency installation or project checks.
- Replaced only the CI installer with official `pnpm/action-setup@v6`, keeping pnpm 11.19.0, Node 22.13.0, frozen install, and the exact `pnpm check` contract. Workflow YAML parsed locally. On `97b865a`, the [second run](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748) passed Ubuntu and Windows jobs; each completed the full check. DP-0.2 is Complete. The PR remains draft and unmerged.
- Correction Gate: mechanical portability is verified on local Windows and both remote runners. This does not establish first-run usability, provider quality, or deployment safety. Zero provider calls or deployment. DP-0.3 is Current; its [Correction Brief](correction-briefs/2026-09-24-dp-0-3-first-run-entry.md) and [source baseline](evaluations/2026-09-24-dp-0-3-first-run-baseline.md) now name the entry failure and checks. Local backup branch `backup/dp-0-3-pre-ui-2026-09-24` preserves the pre-UI commit `97b865a`.

## 2026-09-19 - DP-0.2 Local Engineering Portability Pass

- Completed the bilingual [Correction Brief](correction-briefs/2026-09-19-dp-0-2-engineering-portability.md), local [validation report](evaluations/2026-09-19-dp-0-2-local-portability.md), and D-066. A small Node launcher now resolves the pinned ESM vinext CLI and supplies `WRANGLER_LOG_PATH` without shell-specific syntax; `dev`, `build`, and `start` share it with no new dependency.
- Normalized only the loaded page source in the affected source-inspection test, preserving every assertion and all 63 cases. Pinned Wrangler regenerates ignored Cloudflare runtime/module declarations at the start of every canonical check. The inactive D1 binding remains optional. Accurate `Response.json(): unknown` typing exposed and closed one Plan amendment response boundary without changing runtime parsing.
- Added a clean-clone-safe `typecheck`, deterministic worker-type generation, and one canonical `pnpm check`; separated tests from build so failures remain attributable. Added a checked Node 22.13.0 / pnpm 11.19.0 GitHub Actions matrix for Windows and Ubuntu. Existing locked `js-yaml` parsed the workflow and confirmed both jobs use frozen install plus the same check command.
- Local Windows evidence: frozen install passes; generated types are recreated and consumed by TypeScript; all five vinext build environments pass; 63/63 tests pass; lint has zero errors/warnings; type check has zero errors; the full `pnpm check` passes. Wrangler 4.92.0 reported an update, but no dependency was upgraded.
- Correction Gate: zero provider calls, spend, browser-record changes, dependency additions/upgrades, or deployment. No product-quality or browser-usability claim. DP-0.2 remains Current - local pass, CI pending - because the workflow has not run remotely. Do not begin DP-0.3 until Windows and Ubuntu runner evidence passes or names one bounded repair.

## 2026-09-19 - DP-0.1 Product and Repository Truth Baseline

- Completed the bilingual [Correction Brief](correction-briefs/2026-09-19-dp-0-1-repository-truth.md), read-only inventory, [command baseline](evaluations/2026-09-19-dp-0-1-repository-baseline.md), and D-065. The private package is now `multi-ai-meeting-room@0.0.0-development`; current source uses commit/dirty state plus the active DP milestone rather than a fabricated release. Historical v0.x labels remain development snapshots.
- Standardized on pnpm 11.19.0 with `pnpm-lock.yaml`, removed `package-lock.json`, changed the nested test command from npm to pnpm, and replaced four starter build-permission placeholders with explicit allowlisting for the already locked `esbuild`, `sharp`, `unrs-resolver`, and `workerd` families. Frozen install passes without a dependency upgrade.
- Declared the package `UNLICENSED` and all rights reserved; updated README, app metadata, Roadmap, Handoff, documentation indexes, milestones, Decisions, and Chinese mirrors. Session BYOK remains ephemeral. A public deployment must not expose workspace-funded credentials before DP-0.6 adds verified authentication and abuse controls.
- Windows baseline under Node 24.19.0 and pnpm 11.19.0: frozen install passes; lint passes; standard build fails before vinext on POSIX-only `WRANGLER_LOG_PATH=...` syntax; standard test stops at that build; direct tests are 62/63 with one CRLF-sensitive source regex; type check reports only the three known Cloudflare ambient declaration errors. `git diff --check` and current identity/status scans pass.
- Correction Gate: runtime behavior and historical Review/Plan evidence are unchanged; zero provider calls, spend, browser-record changes, dependency upgrades, deployment, or external service changes. DP-0.1 is Complete. DP-0.2 Engineering Portability Baseline is Current and owns those four failure categories; first-run UI remains out of scope until portability closes.

## 2026-09-18 - Product Development Plan and Detailed Milestones Approved

- The owner approved D-064: one human-chaired Multi-AI workspace, **Ask the Room** as the narrow recurring entry, Review as the first trust Pack rather than the product boundary, one bounded queue alternating Habit and Trust evidence, time-boxed Labs for astrology/games/coding context, and read-only Codex/VS Code integration before Execute.
- Promoted the bilingual [Product Development Plan](PRODUCT_DEVELOPMENT_PLAN.md) from draft to Approved and added canonical bilingual [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md). The latter defines DP-0 through DP-9, 65 sub-milestones, dependencies, size budgets, user deliverables, acceptance evidence, non-goals, and stop/simplify decisions.
- Updated Product Direction, Project Charter, Roadmap, Decisions, Handoff, documentation indexes, and Chinese mirrors. Historical M0-M5 implementation/evaluation records remain valid, but DP-0 through DP-9 now determine forward priority.
- DP-0.0 direction and milestone ratification is Complete. DP-0.1 Product and Repository Truth Baseline is Current. Its next action is a Correction Brief and read-only truth inventory before code.
- Documentation only: no product code, dependency, provider call, spend, browser record, deployment, or Execute action. Approval does not revive the saved Plan Reviewer call; Live010-014 remain preserved for DP-2 evidence.

## 2026-08-30 - Current Provider Key Prefix Hints

- D-063 moves API-key prefix inference into a pure local module and adds current Gemini authorization-key recognition for `AQ.` while retaining `AIza`, Anthropic `sk-ant-`, and the existing supported OpenAI `sk-` forms. Anthropic is checked before OpenAI because the families overlap. Unknown or wrong-case formats remain unresolved and require an explicit provider choice.
- Prefix inference remains a convenience hint, never credential verification. It reads only the in-memory string, sends nothing, persists nothing, and never probes multiple providers. Model discovery still calls exactly the selected or confidently inferred provider after the user submits Setup.
- Build, 63 offline tests and lint pass. Regression coverage includes both Gemini forms, ordered Anthropic recognition, OpenAI project/service-account/admin/legacy forms, whitespace, unknown formats and case sensitivity. Type checking retains only the three known Cloudflare ambient-type errors. Zero provider calls, spend, browser-record changes or deployment.
- [Correction brief](correction-briefs/2026-08-30-provider-key-prefix-detection.md); backup `/private/tmp/meeting-room-before-provider-prefix-detection-20260830.tar.gz`. Google is transitioning Gemini from standard keys to authorization keys, so prefix rules must remain isolated and revisable. The next bounded product action remains the separately confirmed three-Seat Gemini-inclusive review smoke; model-list quality is a separate issue and was not folded into this fix.

## 2026-08-30 - PLAN-06 Stage Request Receipts, Local Closeout

- D-062 gives each paid Plan Builder or Reviewer stage a bounded lifecycle receipt inside the existing artifact. Before provider invocation the route emits a strict `started` attempt with request ID, stage, output cap, requested reasoning setting and explicitly unknown finish/usage. Its accepted, rejected or provider-error terminal receipt replaces the same request/stage in place rather than looking like another call.
- A Reviewer receipt appears only after the Builder has been accepted. Therefore a saved Plan can distinguish “Reviewer never started” from “Reviewer started but result/usage is unknown.” Client checkpoint handling persists these events in order; raw output, private reasoning and credentials remain excluded. Unknown usage is never converted to zero or refunded.
- Build, 62 offline tests and lint pass. Tests cover strict started parsing, history round-trip, non-regression from terminal to started, in-place replacement, Builder/Reviewer event ordering, absent unstarted Reviewer receipts and provider-error replacement. Type checking retains only the three known Cloudflare ambient-type errors. Zero real provider calls or spend.
- [Correction brief](correction-briefs/2026-08-29-plan-stage-request-receipts.md); backup `/private/tmp/meeting-room-before-plan-stage-receipts-20260829.tar.gz`. PLAN-06 is Verified for new Plan requests. Historical unknown calls remain unknown and provider invoices remain authoritative. This does not add a generic billing ledger or detached runner. Next evidence remains one separately authorized saved-artifact Fable Reviewer-only call after the connection is restored.

## 2026-08-29 - PLAN-11 Stop and Recovery Truth, Local Closeout

- D-061 adds an optional backward-compatible `stopReason` to stopped protocol snapshots. Budget Gates persist `budget`, explicit host cancellation persists `human`, and legacy stopped rooms without provenance display a neutral stopped state instead of falsely blaming the Human Chair. A recovered or completed protocol clears the old stop reason.
- A structurally eligible saved Plan recovery is now evaluated against its preserved input/output usage before either recovery control is enabled. Exhausted work remains visible and preserved, but the action says why recovery is unavailable, is disabled, and cannot start a provider call. The handler retains its independent budget check.
- Build, 62 offline tests and lint pass. Tests cover budget/human/legacy stop round-trips, invalid reason combinations, stop-reason clearing, recovery budget wiring, and both budget-stop call sites. Type checking retains only three known Cloudflare ambient-type errors. Zero provider calls, spend, record migrations or UI redesign.
- [Correction brief](correction-briefs/2026-08-29-plan-stop-and-recovery-truth.md); backup `/private/tmp/meeting-room-before-plan-stop-reason-20260829.tar.gz`. PLAN-11 is Verified locally and closed. D-062 subsequently closes PLAN-06 for new Plan requests; historical ambiguity and PLAN-12 durable background continuity remain separate. The next product evidence remains one separately authorized saved-artifact Fable Reviewer-only call.

## 2026-08-29 - PLAN-13 Reviewer Contract, Local Closeout

- D-060 adds native Anthropic structured output only when an explicit caller schema and supported model family coincide. The initial actual-artifact Plan Reviewer supplies the narrow review schema; Fable 5 is supported. Unsupported Anthropic IDs and unrelated OpenAI/Gemini requests remain unchanged, with no guessed `thinking` parameter.
- Local `parsePlanReview` remains authoritative for day range, lengths and collection limits. A response consisting solely of one JSON Markdown fence is normalized; prose surrounding embedded JSON is still rejected. Refusal, incomplete output, transport failure, schema failure and semantic failure remain terminal with no automatic retry.
- Build, 62 offline tests and lint pass. Tests cover Fable request shape, unsupported-model omission, unchanged OpenAI payload, strict fence handling, semantic rejection and exactly one Reviewer call for a saved complete Plan. Type checking retains only three known Cloudflare ambient-type errors. Zero provider calls, API spend, Plan regeneration or browser record mutation.
- [Correction brief](correction-briefs/2026-08-29-plan-reviewer-structured-output.md); backup `/private/tmp/meeting-room-before-plan-reviewer-structured-20260829.tar.gz`. PLAN-13 moves to Local fix (live unverified); PLAN-10 remains open because no real concern, amendment, recheck or human adoption has passed. Next evidence is one separately authorized Fable Reviewer-only call against the preserved Live014 artifact, never a Sol rerun.

## 2026-08-29 - Artifact-first Plan Live 014, Complete Draft / Failed Review

- Under renewed authorization for two additional calls / $1 / no retry, the fixed Sol Builder -> Fable Reviewer room ran exactly twice. Sol completed all12days in78s:1,111 input,7,766 output,3,057 reasoning,14,655 visible characters, zero rejected records. This live-verifies D-059's two-call artifact-first mechanical path and PLAN-17/18.
- Fable read the complete artifact and completed in86s:9,388 input,5,191 output,2,720 visible characters. Its review was invalid JSON, so it was rejected atomically; no concern, amendment, approval or multi-model improvement was accepted. All12Builder days remain saved and no retry followed.
- [Live014 evaluation](evaluations/2026-08-29-plan-artifact-first-live-014.md), [full readable Plan](evaluations/artifacts/plan-artifact-first-014/01-plan-readable.md) and [diagnostics](evaluations/artifacts/plan-artifact-first-014/02-attempt-diagnostics.txt) are archived. Approximate list-price total from reported tokens is$0.51, not an invoice; the uncertain canceled History13 request is outside that estimate.
- Artifact audit: concrete progression, spaced redo and closed-book Day12 are useful; exact360-minute saturation, unscheduled remediation days, fatigue thresholds and unverified metadata remain material. The complete draft is not independently reviewed or human-approved. Next work is Reviewer-contract reliability only, offline first; do not regenerate the Plan, add Seats or spend again.

## 2026-08-29 - Artifact-first Plan Entry and Negative Live 012

- D-059 makes Detailed Plan start with the requested artifact: one Builder then one independent actual-artifact Reviewer. Fresh Plan preflight and protocol budget are exactly two calls / 22K output, with no generic proposals, cross-review, Observer or automatic retry. Ordinary Decide/Review are unchanged.
- Live012 used the fixed12-day/10MEU/360-minute case, Sol Builder and Fable Reviewer under a user-approved$1/two-call cap. History12 exposed a stale generic synthesis-history Gate and made zero provider calls. History13 exposed a valid version-zero Plan checkpoint rejected by the client; its Sol request may have started before cancellation, so usage is unknown. Fable and artifact quality were not run.
- Corrected both contracts: Plan synthesis no longer needs generic context turns, and Plan artifacts accept Canonical State version0 while rejecting negatives. An empty-history route test reaches a reviewed12-day mock artifact in exactly two calls. Build,61 tests and lint pass; type checking retains only three known Cloudflare declaration errors. Backup: `/private/tmp/meeting-room-before-artifact-first-plan-20260829.tar.gz`.
- Archived the bilingual [correction brief](correction-briefs/2026-08-29-plan-artifact-first-live-012.md), [evaluation](evaluations/2026-08-29-plan-artifact-first-live-012.md) and issues PLAN-17/18. This is negative mechanical evidence, not Sol/Fable quality or PLAN-03 causal evidence. Stop without using recovery; a new two-call live run needs renewed cost authority because one prior Sol call is uncertain.

## 2026-08-29 - PLAN-03 Stage-Specific Reasoning, Local Only

- D-058 changes one variable for the failed Plan case: recognized original GPT-5 Builder requests `low` rather than `medium`; actual Plan reviewer/editor/recheck remain `medium`, ordinary discussion remains `minimal`. Anthropic, Gemini and unrecognized models keep provider defaults. No output cap, model, prompt, validator, call budget or retry changed.
- Initial Plan attempt diagnostics persist the requested setting separately from reported reasoning tokens. Strict parsing allows old records with no setting and rejects unknown values. Plan view displays both without storing private reasoning or adding it to model context.
- Actual mocked payload tests cover OpenAI Builder/reviewer, Anthropic/Gemini omission of unsupported controls, reasoning-only exhaustion, partial days, history compatibility and UI disclosure. Build,59 tests and lint pass. `tsc --noEmit --incremental false` reports only the same three Cloudflare worker declarations. localhost:3001 returns200. Backup: `/private/tmp/meeting-room-before-plan-reasoning-20260829.tar.gz`.
- Zero live API calls, spend, browser interaction, deployment or archived-record migration. The correction brief uses current official provider documentation but does not broaden model-compatibility inference.
- Product Gate: PLAN-03 remains In progress. Local payload correctness does not prove complete output, teaching quality or cost/value. Next requires fresh explicit authorization for one Builder-stage check under the same model/contract/cap and deliberate clean-context handling; inspect finish, requested setting, reported reasoning/output and accepted days, then stop. Do not reuse010's authorization or auto-retry.

## 2026-08-27 - Plan Issue Register and First Two Local Fixes

- Created the bilingual [16-item issue register](PLAN_ISSUE_REGISTER.md) and [correction brief](correction-briefs/2026-08-27-plan-diagnostics-scope.md). PLAN-01/02 are locally fixed; full Plan quality remains unverified. D-057 records the bounded scope, not another platform milestone.
- Initial Builder/reviewer preserve reported terminal status and nullable usage, partial valid days and specific rejection categories in existing artifact checkpoints/history. Latest four attempts, first twelve rejection details each; no raw response, private reasoning or secrets. Missing terminal events and transport failure cannot become a successful review; no automatic retry. Collapsed Plan diagnostics are separate from model context.
- New explicit format-only Chair directions are scoped to phase/round, including actual provider prompt construction. Ordinary and legacy requirements remain. A successful format save resets the one-shot selection; archived010/011 corrections and frozen Plan context are not migrated.
- Final build,59 offline tests and lint pass. Three existing Cloudflare declaration errors remain; local HTTP200. No browser interaction/IndexedDB fault test this slice. Zero live API calls, no model/cap change, deployment or archive rewrite. Backup: `/private/tmp/meeting-room-before-plan-diagnostics-20260827.tar.gz`.
- Correction Gate: local mechanics/history and scoped prompts pass; new diagnostic UI is rendered-test-only. Semantic/artifact quality, actual-plan review, human adoption and comparative value have no new evidence. No paid economic improvement is claimed. Next PLAN-03 evidence-led output/reasoning work, not another attempt on011 without explicit context/budget authority. Amendment/recheck diagnostics and actual-call accounting remain open.

## 2026-08-27 - Plan Wait Recovery and Negative Continuation011

- D-056 removes application wall-clock aborts for Plan Builder/review/amendment/recheck and cumulative Plan-time stops. Ordinary discussion retains90s. Input/output caps, manual cancellation, source/composition checks and no automatic retry remain. Wait UI displays elapsed time in the current view, not invented thinking progress; provider/host/network limits remain outside this policy.
- Explicit saved-plan recovery persists its allowance before calling and requests only missing days plus review, at most two calls. Retains all prior reservations and token usage, without refunds or repeated renewals after a second artifact attempt. Browser discovery corrected a fixture gap: production stopProtocol uses stopped/complete, not stopped/paused. Finished artifacts remain ineligible.
- User reverified session keys. Rebound original GPT-5/Opus4.7 Seats and reopened the same010 record without a new meeting. One Builder request returned but produced no newly accepted days; actual-plan review was not called. Observed failure within116s, not an actual>180s success. No further paid retry or amendment; seven known requests across010/011, same cumulative$5 authorization. Exact invoice and new failure details unavailable.
- Preserved six days/77 task rows, headings, review/completion and adjustment text against010's archive. History11; no deletion or approval. [011 report, raw UI and ordered backlog](evaluations/2026-08-27-plan-wait-continuation-011.md) are archived; original negative010 remains unchanged. Output allowance46K->37K is rounded and is not an exact token receipt. Failure still conflates incomplete output, malformed rows and validation rejection; do not claim a proven reasoning-token root cause.
- Final build,54 offline tests and lint pass. Long-wait fixture advances the actual provider wrapper600s, verifies cancellation and ordinary90s deadline; recovery uses production stopProtocol and preserves budgets/history. Three known Cloudflare type declaration errors remain. No deployment. Backup: `/private/tmp/meeting-room-before-plan-wait-20260827.tar.gz`.
- Correction Gate: local time/recovery mechanics pass; full artifact, semantic quality, human adoption and differentiated value do not. One new paid call with no added accepted content is a negative economic outcome, not success. Stop this slice; next bounded finish/rejection diagnostics and phase-scoped Chair directives, then evidenced reasoning/output sizing. No more seats, broad UX or ledger-platform expansion.

## 2026-08-27 - Plan Quality Live010, Partial Artifact Archived

- Fresh user authorization: $5, reasoning models allowed, result archival required; additional seats permitted after launch but no room restart. GPT-5 snapshot plus Opus4.7, two seats, one checkpointed round,12days/10MEU/360minutes. Actual configuration is GPT minimal discussion/medium Plan and Claude provider default, not all-model thinking.
- Six real requests. One Claude cross-review JSON failure recovered once with shorter changed input. GPT Builder then hit180s timeout; six complete day records persisted. A missing-days recovery attempt made zero calls: initial8-turn budget had one reservation left, while the composite continuation required two. No actual-plan review, amendment, recheck or human approval.
- [Archived report and original](evaluations/2026-08-27-plan-quality-live-010.md), bilingual summary, raw UI captures and readable six-day draft. Browser history10->11; no refresh, deleted history, credential reads, runtime edits or deployment. Exact provider spend and failed usage unavailable; do not report a fictional invoice.
- Product gate fails:6/12days; Day1 fallback violates3Easy=1Medium, and #53 is incorrectly labeledEasy. These are pre-review audit findings, not an absent reviewer's misses. Long0/12 wait, Overview hiding Plan progress, and blocked recovery remain. More seats do not repair these demonstrated blockers; M2.13 remainsCurrent, M2.12deferred.
- Next: reproduce this partial-state boundary offline, protect artifact recovery from earlier retries, distinguish reserved/started calls and retain interrupted receipts, and fit generation units to the observed timeout. Preserve completed days and continue only missing content plus actual-artifact review with a clear remaining allowance. No test suite rerun for this documentation-only evaluation; prior52 offline tests are not new live-quality evidence.

## 2026-08-27 - Plan Quality Closure, Local Implementation

- Implemented D-055: the Chair selects up to3 concerns and authorizes one amendment plus one distinct-Seat recheck. Editor responses explicitly amend or decline each concern; only affected days may change and the entire derived Plan must pass workload/time/cross-day checks. Recheck may reject the initial criticism or retain a dispute. No forced changes or consensus.
- Original days/review remain immutable. Draft, intent and stage snapshots persist before subsequent calls; UI publishes only after saving. Failure stops, an unattempted saved recheck can continue explicitly, and other failed/interrupted attempts can be dismissed to keep the original. No repeat cycle per Plan. This is a local-client boundary, not a server billing/idempotency guarantee.
- Rechecked changes enter the detailed deliverable, not the short canonical context. Unselected/unresolved concerns survive. Original comparison, change explanations, recheck results, full-plan copy and source-bound approval remain inspectable; later human edits are explicitly outside model review scope.
- Plan prompts now assign curriculum, feasibility, critical-review, editing and changed-material duties. Quality calls preserve chosen models, use medium effort for the existing recognized GPT-5/mini/nano IDs and defaults elsewhere. Builder <=16K, review6K, amendment12K, recheck6K, timeout180s; no all-model deep-thinking claim. Gemini thought tokens are included in reported output, and incomplete OpenAI Plan usage is retained.
- Validation: build, 52 offline tests and lint pass. Tests exercise actual mocked provider routes, a material Day 2 change with other days untouched, false-criticism declines, unresolved concerns, source/approval/history round-trips, client save/call failures, bounded call counts and rendered controls. Type checking retains only three known Cloudflare declaration errors. localhost:3001 returns200. No real browser/IndexedDB fault test, live provider quality test, invoice verification, or deployment.
- Product Gate: mechanical closure now passes locally; teaching quality, real adoption, latency, cost/value and multi-model advantage remain unproven. Development made zero real model calls. Stop implementation here; next is one fresh-budget real quality case, not more UI or evaluation infrastructure. See [Correction Brief](correction-briefs/2026-08-27-plan-quality-closure.md).

## 2026-08-27 - Core Closure Check, Negative Gate

- At the user's request, stopped feature expansion and ran one existing targeted offline test. An actionable scripted Day 2 critique left every Builder day unchanged; the Plan route only appends review. Test passed as a characterization; the critique-to-revision product Gate did not.
- Historical Review 005 had genuine edits but semantic failures; Plan 007 failed delivery; S1 009 is not a matched comparison. No new quality or superiority claim. See [Core Closure Check](evaluations/2026-08-27-core-closure-check.md).
- Zero paid calls and no runtime/UI changes. This audit is closed, not the product. Next work is only bounded Plan concern -> affected-day amendment -> recheck -> human decision. Freeze UX/configuration/evaluation-tool expansion; do not rerun a meeting to prove the known gap. Live verification still needs fresh authorization.

## 2026-08-27 - Human Revision of Individual Plan Days

- Closed an adoption gap: at the pending Plan Human Gate, the Chair can edit one day's tasks, model-supplied difficulty/work labels, time allocation, completion check and adjustment rule. Live totals and existing full-plan validators enforce the unchanged day/MEU/time contract, same-day uniqueness and cross-day consistency. Other days remain intact; restoring an original day removes its human edit after saving.
- The original AI Plan and original review remain immutable. A source-bound `PlanHumanRevision` stores only changed days plus the original artifact identity. The day view exposes the original, lists human-edited days and labels review scope honestly. Full-plan copy includes the same scope warning. This is zero-call human editing, not an AI revision loop or independently verified improvement.
- Save succeeds before publishing a revision. A failed write leaves the draft and previous saved version intact; pending saves suppress stale autosave, and unsaved day edits block approval and room replacement. Exact revised text and revision identity freeze together on approval; approved/rejected plans are read-only. Credential-free local snapshots/artifacts restore revisions without new database stores. Unsaved drafts are page-local and are not reload-safe.
- Build and 48 offline tests pass: whole-plan validation, multi-day edits/restoration, stale/forged provenance, original immutability, exact approval, history round-trip, rendered view/editor controls and the actual save handler with injected storage failure. localhost:3001 returns 200. These are not real browser/IndexedDB fault or measured usability tests. Full type checking retains three existing Cloudflare declaration errors; no new error in this slice.
- Product result: mechanical artifact adoption improved; semantic/pedagogical correctness, actual human adoption, reading effort and comparative model advantage remain untested. Zero live API calls and no changed provider prompts, model budget, rounds, dependencies or deployment. Recorded D-054 and the bilingual [Correction Brief](correction-briefs/2026-08-27-plan-human-revision.md).
- Backup: `/private/tmp/meeting-room-before-plan-human-edit-20260827.tar.gz`. Stop here. M2.13 remains Current: next validate real-browser day editing/history, then a named, freshly authorized provider-quality check. Do not add autonomous revision, generic editor infrastructure or more evaluation tooling before evidence.

## 2026-08-27 - Detailed LeetCode Plan, Local Vertical Slice

- Added opt-in **Detailed LeetCode plan** under Decide / Plan: 10-15 days, explicit daily minimum MEU and minute limit, default 12 days / 10 MEU / 360 minutes. A single discussion round uses existing Seats; the final artifact uses a Builder and a distinct Review Seat, not necessarily different model families.
- Daily records contain concrete problem IDs/titles, model-supplied difficulty, new/redo labels, time boxes, review time, completion checks and adjustment rules. JSONL transport lets complete valid days survive a missing/malformed/truncated later day. UI shows day records, not raw JSON; selection does not follow incoming output automatically.
- Deterministic checks use integer thirds for MEU, reject duplicate same-day IDs, repeated-new tasks and inconsistent difficulty across days, enforce day coverage and daily time/workload bounds. These checks do not verify problem identities, actual difficulty, learning quality or realistic completion time.
- A distinct Seat critiques the actual complete Plan, with day-linked concerns and assumptions. An explicit recovery requests only missing/invalid days, or only the review when all days exist. Already reviewed snapshots can finish locally after a lost completion boundary. Valid days are never rewritten implicitly. Semantic concern resolution/editing remains future work; warnings remain visible for the human decision.
- Partial/complete plans and exact approved snapshots persist separately from the short memo in credential-free room storage. Unreviewed/incomplete plans cannot be approved. Contract/working-state/model mismatches reject recovery before provider calls. Generation freezes the contract; changed requirements currently need a new room.
- Budget: two normal artifact calls plus one explicit recovery allowance (at most two more), displayed in setup; Builder output <=16,000 tokens and Review <=1,800. No automatic retry or old-budget reuse. Interrupted provider usage may be incomplete; estimates are not invoice caps. No provider call was made in this development slice.
- Validation: build and 45 offline tests pass, including mocked provider completion, missing Day 2 recovery, review-only recovery, forged/stale checkpoints, record/approval parsing, and rendered day output. Fixtures use synthetic problem data to validate mechanics, not a golden teaching curriculum. Real browser IndexedDB fault injection, scrolling/clipboard acceptance, actual provider JSONL behavior and semantic quality were not tested. localhost:3001 returns HTTP 200.
- Fixed four existing code typing errors: readonly replay Finding IDs, nullable Editor checkpoint, Observer transition widening, and the context-limit literal parameter. Full type checking still reports three Cloudflare declaration errors in `db/index.ts` and `worker/index.ts`. No dependency, deployment, account or shared database work.
- Frontend backup: `/private/tmp/meeting-room-before-plan-20260827.tar.gz`. Recorded D-053; M2.13 is Current, not complete. Next: browser acceptance of the opt-in path, then one explicitly authorized real Plan case if useful. Evaluate actual task quality before adding orchestration or expanding the Task Pack; M2.12 comparisons remain deferred.

## 2026-08-27 - Review Can Finish Without Forced Changes

- Closed evaluation-tool expansion at the user's request and fixed a main-flow blocker: rejecting every Finding no longer forces the Chair to accept an unnecessary edit. After a completed review and explicit disposition of all Findings, **Keep original** retains exact Artifact v1 and opens the existing Human Gate without Editor/Verifier calls.
- The result records empty Changes, null model attribution, and verification `not_run`, not `pass`. Original formatting survives parsing/history. Approval freezes the exact v1 snapshot; rejected Findings remain auditable. Storage must succeed before the new result is shown. Requesting another round clears the active retained result only after saving the continuation; prior artifact records remain in history.
- Build and 42 tests pass; lint passes. Local regressions cover eligibility, pending/accepted Findings, exact text, invalid provenance, approval, history parsing, and continuation. Save-before-display and no-call handler behavior are source-checked, not browser fault-injection tested. localhost:3001 returns HTTP 200. No live provider calls, browser refresh, or deployment.
- Full `tsc --noEmit --incremental false` remains failing outside this slice: three API-route typing errors (readonly replay Finding IDs, nullable Editor checkpoint, literal context-budget parameter), one orchestrator transition typing error, and three missing Cloudflare worker types. Two narrowing errors in the touched artifact parser were corrected. Build success is not a clean type-check claim.
- Product correction: mechanical/local artifact/Human Gate behavior improved; semantic correctness, user adoption, reading effort, and comparative advantage are not newly verified. This action adds zero API cost; M3/R6 remain unrun. Recorded D-052 and the [Correction Brief](correction-briefs/2026-08-27-review-keep-original.md).
- Next: the detailed Plan path, starting with a day-addressable artifact and completeness/workload checks for the user's LeetCode case. Do not expand evaluation tooling or add model calls just to close a checklist. M2.12 is deferred, not completed; broader Task Pack expansion still requires evidence.

## 2026-08-27 - M2.12 Receipt Access and Estimate Provenance

- Added a collapsed Evidence receipt with complete selectable JSON, copy action, and a manual selection fallback when clipboard access fails. Download remains available; receipts remain page-memory only, with no new storage or endpoint.
- New S1 receipts (including partial failures) and completed Verifier probes disclose effective input/output rates and individual default/runtime-override sources. They explicitly remain provider-wide estimates, not model-verified prices or invoices. Old receipts have unknown provenance; no historical values or arithmetic were rewritten.
- Build, all 40 tests, and ESLint pass. New tests cover receipt rendering/escaping, unknown extra fields, copy success/failure/unavailable clipboard, default/mixed/invalid/zero override rates, and estimate arithmetic with mocked providers. Clipboard focus/selection is source-checked, not live-browser verified. Existing localhost:3001 returns HTTP 200; no browser refresh or paid call was initiated. The extra development server was stopped, preserving the existing server.
- Product correction: this closes the two bounded audit-access defects from 009, not semantic quality or comparative advantage. Baseline 009 evidence remains unchanged, including its missing server metadata. No API spend, new agents, new price catalog, deployment, or full-room run. Recorded D-051.
- Next: return to whether a second independent review can add a source-supported correction or more actionable human checks to the saved S1. M3/R6 remain NOT RUN. Name the information gain and obtain a new budget before any call; skip a low-value comparison rather than adding further infrastructure.

## 2026-08-27 - M2.12 S1 Resume Baseline 009

### Completed

- Used the user's fresh $0.10 approval for exactly one OpenAI `gpt-4.1-2025-04-14` S1 call, after a bilingual paid-run Correction Brief. Frozen public input/prompt, 2,400-output cap, no oracle, no retry, no Meeting write.
- Saved the complete visible candidate and result panel, reconstructed expected input/prompt, and a provenance manifest. [Baseline 009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md) records issue-level scoring and the receipt limitation in both languages.
- Updated the comparison ledger, roadmap, and handoff. No runtime changes, full-room run, deployment, or automatic spend of the remainder.

### Separate Outcomes

- Mechanical: one successful response, 543 input / 548 output tokens, displayed 6.0 seconds. Meetings stayed 10. No truncation observed; provider finish status remains unrecorded.
- Semantic/artifact: all 3 seeded issues found and repaired (weight 8/8); 4/4 protected meanings retained; no unsupported material Finding or harmful edit. Resume usability 2/2 under the existing rubric, assessed unblinded by a non-independent scorer. This small known case is not general proof.
- Human Gate/experience: no actual user adoption, editing, or measured reading time. The model repeats placeholder deletion and offers generic human checks instead of explicit evidence-before-restoration actions.
- Economics: app estimate $0.0038; recomputation from official GPT-4.1 standard prices is $0.00547, invoice unknown. Source uses generic provider-wide default prices, which explains the displayed discrepancy without verifying environment overrides.
- Evidence limitation: in-app download retrieval timed out and content export is unsupported. Full visible output is preserved; server receipt, request ID, exact timing, and server-hash comparison are unavailable. Reconstructed hashes are not misrepresented as a verified transport receipt. No hidden state or key was read.
- Differentiation: unknown. M3/R6 and other cases remain NOT RUN. S1 already repaired these seeded factual defects, so later repeats cannot count as unique cross-review gain.

### Next Action

Stop paid work. Preserve 009 without rerunning it to recover metadata. The next narrow zero-call slice is receipt accessibility without download and explicit estimate provenance. Any later comparison needs a named remaining uncertainty and new authorization; M2.11 expansion remains frozen and M2.12 remains current. Full build/tests were not rerun for this documentation/evidence-only change; the prior implementation's 38-test result is unchanged.

## 2026-08-27 - M2.12 Fixed S1 Replay Entry

### Completed

- Recorded the missing single-model execution boundary in a bilingual Correction Brief before editing. Normal Review would spend several calls; the existing Verifier probe uses the wrong task.
- Extended only the existing development Replay selector with S1 `resume-truth-v1`. The server owns the public fixture and 2,400-output-token cap; arbitrary probe fields fail before provider work. No oracle, generic prompt editor, new dependency, or Meeting write is involved.
- Moved the unchanged offline prompt builder into a pure shared module so CLI and application cannot diverge. Existing Verifier behavior remains covered by its original test.
- Captured the exact public input and system/user prompt, SHA-256 hashes, selected model and actual requested settings, raw output, and known usage in a downloadable credential-free receipt. Responses are unscored; partial failures retain redacted text and unknown usage without retry. Provider finish status remains explicitly unrecorded by the current adapter.
- Kept configuration outside the meeting view; only the development panel gained a selector and evidence-download action. This is not a major frontend rework.

### Validation and Limits

- Build, 38 tests, and ESLint pass. New mocked cases cover exact one-call behavior, prompt equality, receipt hashes, injected-field rejection, partial failure, and secret redaction. No live API calls or API spend occurred.
- Local browser inspection found zero Connections, displayed the S1 selector, and confirmed the run button stays disabled without a connection. No key was read, no verification request was submitted, and no Meeting was run.
- Semantic quality, real-provider S1 compatibility, human reading effort, and comparative advantage remain unknown. Capturing text is not artifact acceptance. The token cap is not an authoritative dollar cap; save the page-memory receipt before switching probes or refreshing.

### Next Action

Ask the user to reconnect and give a fresh one-call budget. Select and record the exact strong model and generation settings, then run S1 once and save the receipt before scoring. Do not automatically run M3/R6/Plan or another Verifier probe.

## 2026-08-27 - M2.12 Offline Review Comparison Kit

### Completed

- Wrote the bilingual Correction Brief, then froze three synthetic cases: resume truthfulness, product requirements, and technical recovery. Public task inputs are separate from evaluator-only issue anchors, false-positive traps, protected meaning, and example complete golden artifacts.
- Added a local-only `review:case` command that prints a task or baseline prompt without reading the oracle, using credentials, calling a provider, or writing Meeting data.
- Added seven offline tests for fixture/source integrity, exact production-parser application of golden changes, missing/stale/unauthorized changes, and public-only exports. Included them in the normal test command.
- Added the bilingual [M2.12 Review Comparison Kit](evaluations/M2.12_REVIEW_COMPARISON.md): S1 strong-single-model, M3 manual-copy, and R6 current-app procedures, separate detection/repair/false-positive scoring, human intervention accounting, and causal credit rules. All real result slots remain NOT RUN.
- Recorded D-050 and moved M2.12 to Current. M2.11 runtime expansion remains frozen; no product runtime, UI, dependencies, credentials, or deployment changed.

### Validation and Product Result

- Mechanical: production build, all thirty-six tests, and ESLint pass. The seven new tests also run independently without a build or server.
- Semantic/artifact: the kit provides hand-authored examples and evidence-based acceptance criteria; local parser success is not a model-quality score. Equivalent sound edits remain acceptable.
- Human Gate/experience: runtime behavior is unchanged; adoption, reading time, and human edit effort have not been measured on these cases.
- Economics: zero provider calls and zero API spend; existing test providers are mocked. No browser/API session was touched.
- Differentiated value: unknown. No single-model, manual-copy, or matched multi-model output has been produced. Goldens and historical diagnostic reports cannot fill baseline result slots.

### Direction Decision and Next Action

Continue to evidence, not more meeting infrastructure. Prepare one S1 `resume-truth-v1` baseline using the frozen public prompt, name its exact model/reasoning/output settings and budget, and obtain fresh authorization before the call. Save that result before choosing whether M3 adds information. Do not automatically run R6, another Verifier replay, or a Plan room.

## 2026-08-27 - Verifier v2 Stage Replay 008

### Completed

- Wrote the bilingual paid-evaluation Correction Brief before the call and preserved the one-call, 600-output-token, no-retry, no-Meeting-write boundary.
- Used the established Anthropic Haiku evidence path with `claude-haiku-4-5-20251001` and the fixed anonymized Review Verifier fixture v2.
- The provider returned one valid check for `change-replay-1`; both independent `lineage` and `semantics` verdicts were `supported`, and `unresolved` was empty.
- Saved the bilingual result as [Verifier v2 Stage Replay 008](evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md).

### Validation

- Exactly one provider call used 597 input tokens and 224 output tokens in 3.1 seconds for a `$0.0034` application estimate, below the user-authorized `$0.01` maximum. Provider invoices remain authoritative.
- Meeting History displayed 10 records before and after the replay. No Meeting, API key, deployment, repository, or external workspace was modified.
- The success condition ended the paid run. There was no retry, model switch, full Review room, or Plan room.

### Gate Result

The Verifier v2 real-provider Gate passes. M2.11 provider-format uncertainty is closed; this result does not establish Review product advantage, Finding recall, or cross-review value.

### Next Action

Freeze additional Review machinery and enter the M2.12 evidence path. Define one shared Review rubric and capture the strong-single-model/manual-copy baselines before authorizing another paid multi-model comparison.

## 2026-08-27 - v0.11j Immutable Review Approval Snapshot

### Completed

- Added the bilingual immutable-approval Correction Brief and kept the implementation inside the existing Review Human Gate with zero provider work.
- Added a strict `ReviewApprovedArtifact` that freezes the visible Artifact v2 or Human Revision v3, exact Change Set, source State and Review-result identity, original model verification, human-edited Change IDs, and approval time.
- Approval now creates the snapshot before completing the room and persists both through the same durable save boundary. A storage failure rolls back the snapshot, decision, and protocol state together; rejection creates no snapshot.
- Persisted the approved result as a separate credential-free `review.approved_artifact` and restored it with Meeting History. Old approved rooms without a snapshot remain readable.
- Updated the Decision view to show the frozen version and approval timestamp while keeping model Verification scoped to Artifact v2.
- Recorded D-049.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-nine automated tests pass.
- Tests cover v2 and v3 approval, exact Human Revision binding, rejection of a stale v2 snapshot when v3 is visible, and rejection of altered model verification.
- Browser checks at 1280x800 and 390x844 found no viewport overflow or console warning. No provider request, credential, paid token, deployment, or external service changed.
- No saved Review result was present in the refreshed browser, so interactive approved-result restoration remains a bounded check for the next natural local fixture rather than a reason for a paid rerun.

### Gate Result

The immutable local adoption boundary passes. M2.11 no longer needs more approval UI or generic artifact infrastructure before evidence; its next Gate is the already planned bounded Verifier v2 provider check, followed by Review comparison rather than feature expansion.

### Next Action

Prepare the existing Verifier v2 Stage Replay Gate and request explicit user budget only immediately before its one provider call. Do not run a full Review or Plan room to test that isolated contract.

## 2026-08-27 - v0.11i Human-Edited Review Artifact v3

### Completed

- Added the required bilingual M2.11 Correction Brief before implementation and kept the slice to the existing Human Gate with zero provider calls.
- Added item-level editing for a Review Change's replacement text. Change identity, Finding IDs, location, source text, rationale, and basis remain immutable.
- Application code revalidates the full bounded Change Set against Artifact v1 and derives Artifact v3; unknown IDs, unchanged edits, oversized replacements, source mismatches, ambiguity, and overlap fail locally.
- Added a source-bound `ReviewHumanRevision`, credential-free Meeting History persistence, restoration, separate `review.human_revision` and `review.artifact.v3` artifacts, and model-text restoration.
- The Decision UI labels Chair-edited Changes, distinguishes Artifact v3, and states that the existing model verification covers v2 rather than the human revision.
- Recorded D-048.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-nine automated tests pass.
- New regression coverage proves deterministic v3 derivation, immutable lineage, unknown-Change rejection, unchanged-edit rejection, and stored revision parsing.
- Browser QA at 1280x800 and 390x844 found no viewport overflow or console warning. No provider request, API credential, paid token, deployment, or external service changed.
- The refreshed local browser contained no saved Review result, so no paid room was created only to stage a v3 screenshot. Interactive Decision-page restoration remains a bounded check when a suitable local fixture naturally exists.

### Gate Result

The item-level editing hypothesis passes locally. M2.11 adoption control improves without adding orchestration or model cost. Immutable final approval remains distinct: approval currently records the room decision but does not yet publish a separate immutable approved Artifact snapshot.

### Next Action

Write the next M2.11 Correction Brief for immutable approval of the currently visible v2 or v3 Artifact, reusing the revision record and making no provider call. Do not start another paid Plan room or broaden Review UI.

## 2026-08-27 - Required Development Correction Loop

### Completed

- Consolidated failures from Live Baseline 001, Review Benchmark 001, Artifact v2 Benchmarks 002 and 005, Stage Replay 003, Mechanical Smoke 004, and Plan Smokes 006 and 007 into one causal diagnosis.
- Added the bilingual [Development Correction Loop](DEVELOPMENT_CORRECTION_LOOP.md), including the required pre-implementation Correction Brief, six development Gates, separate product-result dimensions, evaluation mistakes, and stop/simplify/remove/defer outcomes.
- Made the loop mandatory in `AGENTS.md`, the documentation read order, Product Direction, AI Handoff, Roadmap, and D-047.
- Replaced the ambiguous next-step sequence with an artifact-first correction path: bounded M2.11 close-out, M2.12 comparison and simplification, then a golden fixture and structured day-addressable `PlanArtifact` for M2.13 before any further full paid Plan run.

### Direction Result

The project does not need a rewrite and will not attempt to repair every concern simultaneously. Generic orchestration and full paid Plan reruns remain frozen. The next implementation must name one observed failure and advance one acceptance boundary; model strength, reasoning settings, and interface progress are tested only after the artifact contract they serve exists.

### Validation

- English canonical documentation and Chinese quick-read mirrors were updated together.
- This correction slice changes no runtime code, provider request, API credential, Meeting record, deployment, or external service.

### Next Action

Write the M2.11 close-out Correction Brief, limited to the smallest remaining adoption/evaluation boundary. Do not begin with another full Plan room or a generic protocol/UI change.

## 2026-08-27 - v0.11h Detailed Plan Workload Contract

### Completed

- Added explicit MEU-aware Plan acceptance: each requested day must include at least four concrete LeetCode IDs, an MEU subtotal, separate new and redo/review work, and a minute-level time allocation.
- Raised the bounded Decide synthesis transport to 4,800 output tokens and the synthesis statement limit to 24,000 characters. Preflight still reserves only one explicit recovery.
- Ran one authorized mixed-provider detailed-plan case. An Anthropic review format failure succeeded after one changed-input Human Chair correction; no unchanged retry occurred.
- The final synthesis used 2,092 output tokens, 26 seconds, and a `$0.017` estimate, but omitted Day 2. The application correctly rejected it before Human Gate.
- Saved the evidence as [Detailed Plan Smoke 007](evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md).

### Gate Result

The stricter contract passes as a safety boundary, while the free-form detailed Plan artifact fails. Because the model stopped far below its transport cap, another cap increase is not the next fix. M2.13 needs a structured `PlanArtifact` with independently validated day records and missing-day-only recovery.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-eight automated tests pass before the live run.
- No call followed the failed synthesis. The room remains interrupted and auditable.

### Next Action

Do not retry the same synthesis. Keep M2.11 as the current milestone; use Smoke 007 as the approved design input for a later structured M2.13 Plan Task Pack.

## 2026-08-27 - v0.11g Decide / Plan Delivery Boundary

### Completed

- Ran a real mixed-provider 12-day LeetCode planning room under the user-approved `$0.10` ceiling. Proposal, cross-review, explicit recovery, synthesis, persistence, usage reporting, and Human Gate completed.
- Separated concise working turns from the user-facing artifact: Decide synthesis now has a 2,400-output-token cap, a self-contained `# Deliverable`, and one visible bounded recovery allowance.
- Synthesis ignores administrative Claim deltas, which cannot mutate Canonical State or invalidate an otherwise useful memo.
- Restored phase context now intersects saved transcript turns with Canonical State and deduplicates IDs. An abandoned transcript branch can no longer poison recovery prompts.
- A local request rejection before any provider start no longer consumes the final provider-call allowance.
- Added a code-enforced Decide memo contract. Schedule plans must cover every requested day; a LeetCode plan explicitly requesting problems must name concrete problem IDs rather than substitute category labels.
- Recorded D-045 and saved the full evidence as [Decide / Plan Smoke 006](evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md).

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-eight automated tests pass.
- The final successful synthesis used 1,585 output tokens, 22 seconds, and a `$0.013` application estimate. The room displayed 11K input tokens, 3,974 output tokens, 71 seconds, and `$0.044` total estimated cost; provider billing remains authoritative.
- Browser QA opened the restored Decision artifact and confirmed the memo and Human Gate render without horizontal overflow at the active viewport.

### Gate Result

The protocol and recovery Gate pass. The artifact-quality Gate fails: the real memo covered the 12-day schedule, timing, checkpoints, adjustments, rest, and assumptions, but omitted the requested concrete LeetCode problem list. The new local contract catches that omission; no second paid benchmark was run.

### Current Limits

- The stricter Plan contract has mocked evidence only and does not make M2.13 complete.
- Abandoned transcript cards remain visible in this old room even though they are excluded from model context.
- Language adherence is still prompt-only; one Anthropic review answered in English.

### Next Action

Return to the M2.11 evidence path. Preserve this Plan failure as the entry evidence for M2.13; when that milestone starts, build an explicit Plan Task Pack and run a stage-level artifact probe before another full paid room.

## 2026-08-26 - v0.11f Chair Finding Amendments and Semantic Verification

### Completed

- Added a Review-checkpoint Chair composer that can add a missed Finding or create a traceable replacement for an existing Finding. A replacement appends a new accepted Claim and marks the old Claim superseded instead of rewriting audit history.
- Every Chair-authored Finding stores an exact excerpt from Artifact v1, supplied references, or truth constraints. The client validates the excerpt before saving, and the server validates it again before any paid Review phase.
- Split each Verifier check into independent `lineage` and `semantics` judgments. Application code derives the overall status; Chair acceptance authorizes scope but no longer counts as semantic proof.
- Added explicit Verifier guidance that bounded verbs such as `reduce`, `improve`, and `mitigate` are not absolute merely because they lack a metric. A vaguer rewrite must still demonstrate a truthfulness gain.
- Any unsupported or unverifiable Change is deterministically copied into Remaining Human Checks even when the model returns an empty unresolved list.
- Bumped the development-only Verifier fixture to v2 without changing its one-call, 600-output-token, no-retry, no-Meeting-write boundary.
- Recorded D-044: Chair amendments are append-only source-linked records, and verification separates authorization lineage from semantic correctness.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-seven automated tests pass.
- New regressions cover exact source matching, rejected mismatched source selection, idempotent Chair Finding addition, superseding an existing Finding, persisted-state parsing, dual-dimension Verifier parsing, automatic human-check promotion, bounded-verb prompt guidance, and server rejection before provider work when a Chair source is invalid.
- Browser QA restored the existing realistic Artifact v2 result under the new parser at the current viewport and at 390x844. Verification dimensions render without horizontal overflow, console warning, or console error.
- No provider request, API key transmission, paid token, Meeting mutation, deployment, or database deletion occurred in this implementation slice.

### Current Limits

- The new Verifier v2 provider contract has deterministic and mocked evidence only. It has not passed a real Stage Replay.
- Browser history did not contain a live paused Review checkpoint suitable for exercising the new Chair composer without provider work. Its state transition and source-validation path are covered locally, while final checkpoint visual proof remains pending the next bounded smoke.
- Item-level Change editing and immutable approved Artifact versions remain open M2.11 work.

### Next Action

With fresh explicit user budget authorization, run exactly one Verifier fixture v2 Stage Replay through the existing one-call Gate. If the provider contract passes, run one short synthetic Review smoke before any realistic full benchmark. Do not rerun proposals, add agents, or expand generic orchestration to test this boundary.

## 2026-08-26 - v0.11e Real Artifact v2 Benchmark

### Evidence

- Ran the replacement resume Review with OpenAI `gpt-4.1-mini` and Anthropic `claude-haiku-4-5-20251001`, one round, Checkpoints, and Observer off. Exactly six calls completed without retry or recovery.
- The Chair accepted two of six Findings and rejected four unsupported, duplicate, or non-actionable Findings. Editor produced three exact Changes, Verifier passed, and the detailed Artifact reached the pending Human Gate without rejected-Finding leakage.
- Usage was displayed as 14K input tokens, 3,057 output tokens, 48 seconds model time, and a `$0.046` application estimate under the approved `$0.10` ceiling. Provider invoices remain authoritative.
- The run exposed a semantic reliability failure: both reviewers missed the explicitly constrained `~50%` metric, one reviewer misclassified `reduce` as absolute wording, and the Verifier repeated that premise instead of independently challenging it.
- The room remains unapproved in Meeting History. Saved the evidence as [Artifact v2 Benchmark 005](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md).

### Gate Result

The complete realistic Review path passes mechanically but fails the delegated-user quality Gate. M2.11 remains current: a source-linked Artifact can reach Human Gate, but the Chair cannot yet add a missed Finding and the Verifier can still rubber-stamp a semantically weak accepted Finding.

### Next Action

Before another paid full benchmark, add a bounded Chair Finding amendment at the cross-review checkpoint and make changed-material verification independently test the rewrite's truthfulness. Add local regressions for the missed explicit metric and the false `reduce`-is-absolute premise; do not expand generic orchestration or optimize cost first.

## 2026-08-26 - v0.11e Mechanical Review Smoke

### Evidence

- Ran the normal one-round Review path with two Anthropic Haiku Seats, one reused session connection, Checkpoints mode, and Observer off. Exactly six calls completed without retry.
- The Human Chair accepted one source-explicit Summary Finding and rejected five broader or unsupported Findings before Editor work.
- Editor produced one exact source-linked replacement, application code preserved unchanged text, Verifier passed the Change, and the room reached the pending Human Gate.
- Usage was 7,144 input tokens, 2,666 output tokens, 32 seconds, and a `$0.041` application estimate. This exceeded the predicted `$0.02-$0.03` range; provider invoices remain authoritative.
- The room remains unapproved in Meeting History. Saved the evidence as [Mechanical Review Smoke 004](evaluations/2026-08-26-v0.11-mechanical-review-smoke-004.md).

### Gate Result

The normal Editor/checkpoint/Verifier mechanical Gate passes. The result does not yet prove realistic artifact value or cost-effectiveness, and the estimate miss is now part of the next benchmark rubric.

### Next Action

Do not open a cost micro-optimization branch from this two-line fixture. With the required session connections and the existing `$0.10` full-run ceiling, run one replacement resume benchmark and compare accepted value, reading effort, tokens, latency, and cost before deciding what to simplify.

## 2026-08-26 - v0.11e Live Verifier Stage Probe

### Evidence

- Ran exactly one Anthropic `claude-haiku-4-5-20251001` call through the new fixed Verifier Stage Replay after explicit user authorization.
- The corrected contract passed with 461 input tokens, 163 output tokens, 2.3 seconds model time, and a `$0.0026` application estimate. Provider invoices remain authoritative.
- The response kept exactly the required top-level fields, preserved `change-replay-1`, returned literal status `supported`, and grounded its note in the supplied reference.
- Meeting History remained at six records. No retry, Editor, proposal, cross-review, room mutation, database write, or additional provider call occurred.
- Saved the full bounded result as [Verifier Stage Replay 003](evaluations/2026-08-26-v0.11-verifier-stage-replay-003.md).

### Gate Result

The Verifier provider-format Gate passes. Artifact quality, checkpoint recovery in the normal room path, and Human Gate usefulness remain unproven.

### Next Action

Run one short synthetic mechanical Review smoke through Editor -> persisted checkpoint -> Verifier. If that passes, run one replacement Artifact v2 resume benchmark and judge the user artifact. Do not add more replay stages or generic evaluation infrastructure first.

## 2026-08-26 - v0.11e - One-Call Review Stage Replay

### Completed

- Added a server-owned anonymized Review Verifier fixture that reuses the production changed-material prompt, provider adapters, and strict parser without creating or modifying a Meeting.
- Capped the replay at exactly one provider call and 600 output tokens. It has no retry path, no room/event/database write, and returns usage plus field-specific validation diagnostics even when the model output is rejected.
- Added a development-only Stage Replay panel to the Connection Library. It reuses the current page-memory BYOK connection, permits explicit model selection, and shows the normalized result, advisory usage, and expandable raw provider output for diagnosis.
- Recorded D-043: paid evaluation follows a local-test -> one-stage probe -> short smoke -> full benchmark ladder, and a completed stage is not rebuilt merely to test a later stage.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-six automated tests pass.
- The new provider-boundary fixture asserts one Anthropic request, a 600-token transport cap, omission of the incompatible `thinking` field, strict Change ID preservation, and no Meeting identity in the result.
- Browser QA at the current 603px viewport and at 390x844 confirmed that the replay controls remain reachable inside the scrollable Connection Library, the footer remains fixed, and no horizontal overflow, console warning, or console error appears.
- No real provider request, API key transmission, paid token, Meeting mutation, deployment, or database deletion occurred in this slice.

### Current Limits

- Stage Replay currently supports only the Review Verifier v1 fixture. It is deliberately not a generic evaluation platform and does not persist results.
- The fixed fixture tests provider-format and parser compatibility, not resume quality, Artifact quality, cross-review value, or Human Gate usefulness.
- No live model has passed the corrected Verifier contract yet. Benchmark 002 remains the latest paid evidence.

### Next Action

Reconnect one session provider and authorize at most one Verifier replay call with a small explicit ceiling, targeted at `$0.01-$0.02`. If it passes, run one short synthetic mechanical smoke before the replacement full Artifact v2 benchmark; if it fails, use its exact diagnostic and do not rerun unchanged inputs.

## 2026-08-26 - v0.11d - Verifier Failure Receipts and True Resume

### Completed

- Ran [Artifact v2 Benchmark 002](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-002.md) with the user-approved `$0.10` operating ceiling. Six provider calls produced 3,537 visible output tokens in 54 seconds. The Editor completed, but the Anthropic Verifier returned invalid structured output; the room never reached the Human Gate and was not restarted.
- Replaced the generic Verifier mismatch with field-specific diagnostics and a concrete response skeleton containing the actual Change IDs, exactly three permitted top-level keys, and one literal status per check.
- Added a validated and persisted `ReviewEditCheckpoint` after Editor completion. It contains the source State version, Change Set, application-derived Artifact v2, Editor snapshot, and timestamp.
- Changed explicit recovery so a matching checkpoint routes only the Verifier Seat. The request rejects stale State, changed Findings, changed Artifact v1, or a different Editor snapshot.
- Added one visible bounded Verifier recovery allowance to Review preflight. Normal completion still uses six calls; at most one failed Verifier may consume the seventh without repeating Editor work.
- Recorded D-042: every paid composite substage that can complete independently needs a durable receipt and substage-only resume.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-five automated tests pass.
- Integration coverage proves the first Artifact transition calls Editor plus Verifier, emits the Editor checkpoint, and a resumed request with that checkpoint calls only the Verifier.
- No provider call was made after the live Verifier failure, the failed Resume attempt, or the implementation corrections.

### Current Limits

- Benchmark 002 did not produce a final Artifact v2, verification verdict, aggregate input-token total, or aggregate application cost estimate. Provider invoices remain authoritative.
- The stopped live room predates the new checkpoint event and cannot be retroactively recovered.
- Artifact quality and reading-effort evaluation therefore remain open. No additional Review feature is justified before a replacement run.

### Next Action

With a new explicit budget and fresh session connections, rerun the same resume case once. Confirm direct completion or one Verifier-only recovery, capture aggregate usage, and then judge Artifact v2 quality before any further implementation.

## 2026-08-26 - v0.11c - Source-Linked Artifact v2

### Completed

- Added a strict Review Editor contract that may propose only bounded, non-overlapping exact replacements linked to Human Chair-accepted Finding IDs. Application code, not a model, applies that Change Set to immutable Artifact v1 to create Artifact v2, preventing undeclared edits.
- Added a distinct Verifier call that receives the accepted Findings, supplied references, truth constraints, and declared changed material, but not the full transcript or unchanged Artifact text. Its one-check-per-change response is parsed into a deterministic overall verdict.
- Reused two visible participant Seats as explicit Editor and Verifier roles for this bounded slice. Preflight, budget accounting, live work states, interruption errors, and progress events include both calls; malformed Editor output fails visibly and never invokes the Verifier automatically.
- Added separate Artifact v2, Change Set, Verification, and executive Brief views. Review results are stored without credentials in Meeting History and restore with the room.
- Recorded D-041: Artifact v2 is derived deterministically from a source-linked Change Set, while detailed user output remains separate from bounded model working context.

### Validation

- Production build, ESLint, `git diff --check`, and all twenty-five automated tests pass. New fixtures prove deterministic replacements, accepted-Finding coverage, rejected/unknown Finding refusal, non-overlap, changed-material-only verification context, persistence parsing, and no automatic retry after malformed Editor output.
- Browser QA at `http://localhost:3001/` confirmed the restored setup and Meeting History drawer render without console warnings or errors. The current browser-control surface did not expose viewport resizing, so no new mobile screenshot or live Artifact v2 fixture was claimed.
- No real provider request, API key transmission, paid call, deployment, or database deletion occurred in this implementation slice.

### Current Limits

- Editor and Verifier currently reuse deterministically selected participant Seats. Independent system-role configuration and explicit cost-versus-quality selection remain pending.
- Exact replacement deliberately rejects ambiguous or missing source text. Item-level Change editing, immutable approved Artifact versions, and bulk Finding actions are not implemented.
- Editor and Verifier currently share one recoverable synthesis transition. An interruption after Editor completion can require explicitly restarting the transition and may repeat Editor cost; no automatic retry occurs.
- Artifact v2 quality, verifier usefulness, reading effort, and provider format reliability have mocked evidence only. The three-case Review evaluation has not started.

### Next Action

Run one explicitly budgeted resume Review benchmark through Artifact v2. Compare Artifact v1, accepted Findings, Change Set, verification checks, final Artifact v2, unsupported edits, human edit distance, cost, latency, and reading effort. Make only evidence-driven fixes before the two remaining Review cases.

## 2026-08-26 - v0.11b - Live Review Benchmark and Binding Human Decisions

### Completed

- Ran two bounded resume-versus-job-description Review rooms with OpenAI `gpt-4.1-mini` and Anthropic `claude-haiku-4-5-20251001`. Ten provider calls used 27K input tokens and 6,010 output tokens in 96 seconds with a combined application estimate of `$0.087`, below the user-approved `$0.10` ceiling. Provider invoices remain authoritative.
- The first run exposed a shared false inference: both reviewers treated 2024/2025 resume dates as future dates because the trusted current date was absent. A free-text Chair correction did not bind later agents or synthesis.
- Added the trusted application date to every Review task context and item-level Accept/Reject actions to canonical Findings. A Chair decision now records an append-only `human.choice`, changes the Claim to `accepted_by_chair` or `rejected_by_chair`, resolves related disputes, and cannot be overwritten by later model support, opposition, or objections.
- Changed Review synthesis to read Canonical State rather than raw proposal/review statements. Rejected Findings are binding exclusions and accepted Findings are binding inclusions.
- Added an application-level Review Brief validator requiring five ordered, non-empty sections: Priority Findings, Supported Findings, Contested Findings, Missing Evidence, and Recommended Next Step. Malformed synthesis fails visibly without an automatic paid retry.
- Recorded the complete case, evidence, limitations, and gate result in [Review Benchmark 001](evaluations/2026-08-25-v0.11-review-benchmark-001.md) and D-040.

### Validation

- The second live run no longer produced the future-date error. A different weak timeline inference was rejected by the Chair; Canonical State retained that decision even when cross-review repeated it, and synthesis excluded it.
- The second run still failed the product gate because its brief omitted all required headings, was too shallow for a user who delegates the full review, and introduced an unsupported GitHub-link suggestion. The new parser regression fixture reproduces this failure with five mocked calls and proves there is no retry.
- All twenty-three automated tests and the production build pass.

### Current Limits

- The current Review Brief is an executive control artifact, not the detailed user deliverable. No Editor, structured Change Set, Artifact v2, or changed-material verifier exists yet.
- Finding Accept/Reject is implemented, but bulk decisions, revision notes, and a richer Finding schema remain outside this slice.
- The benchmark used an archived JD summary because the original posting was unavailable. Eligibility and current posting status were deliberately left unresolved.

### Next Action

Implement the Editor slice: transform accepted Findings into a source-linked Change Set and detailed Artifact v2, then verify only changed material before the Human Gate. The next paid resume benchmark compares Artifact v2 quality, unsupported edits, human edit distance, cost, and reading effort; do not spend another provider run evaluating the v1-only brief.

## 2026-08-25 - v0.11a - Review Agenda and Independent Findings

### Completed

- Started M2.11 with the smallest artifact-centered vertical slice instead of expanding the generic orchestrator. Setup now exposes a Review/Decide task selector and makes Review the initial product path.
- Added bounded Review inputs for objective, Artifact v1, supplied references, and Human Chair truth constraints. The Task Pack is validated at the API boundary, stored without credentials in `RoomStore`, restored from Meeting History, and remains backward compatible with old Decide records.
- Gave each independent Proposal reviewer the same explicitly untrusted source bundle and a Review-specific Finding contract. Cross-review checks a named Seat's Findings against the same bundle and must label unsupported material as unverified.
- Published independent proposal-phase Findings as source-linked canonical Claim rows at the Review checkpoint. Artifact v1 remains unchanged in this slice.
- Added a Review Brief synthesis contract with Priority, Supported, Contested, Missing Evidence, and Next Step sections. Synthesis receives Canonical Findings and bounded turn statements, not the raw Artifact, references, or truth-constraint text.
- Recorded D-039: Review sources are Task inputs, Findings are canonical records, and artifact mutation waits for an explicit Editor phase.

### Validation

- Production build passes on the bundled Node runtime.
- All twenty-one automated tests pass. New API fixtures prove an incomplete Review Task Pack stops before any provider call, four reviewer calls receive the shared source bundle, and the final synthesis prompt contains none of the raw source markers.
- In-app browser verification at 1440x1000 and 390x844 found and corrected two responsive issues: objective autofocus hiding the Task Pack selector on desktop and nested objective scrolling collapsing the mobile agenda. The corrected layout has no body-level horizontal overflow, mode switching works, and the browser console has no warning or error.
- No real provider request, API key transmission, paid model call, database deletion, deployment, Editor, Change Set, or Artifact v2 was involved.

### Current Limits

- Reviewer roles are still the existing generic Seat roles; task-adaptive Review Role Packs are not implemented.
- Finding text follows a compact contract but is not yet separately parsed into severity, location, recommendation, and evidence fields; duplicate clustering is also pending.
- The Review Brief organizes Findings but does not create a detailed revised artifact. Item-level Human Gate actions remain for the Editor slice.
- Review inputs are deliberately bounded to 12,000 characters for Artifact and references and 2,000 for truth constraints. Retrieval and long-document chunking belong to a later evidence-backed slice.

### Next Action

Run one explicitly budgeted resume-versus-job-description benchmark. Use targeted debate at most once and only for a material open Dispute. Save the original artifact, Findings, Review Brief, accepted/rejected observations, usage, and reading effort before implementing Editor, Change Set, and Artifact v2.

## 2026-08-25 - v0.10c Live Smoke - Capacity and Envelope Corrections

### Completed

- Ran the single user-approved OpenAI plus Anthropic smoke sequence under a declared `$0.10` ceiling. No fresh room was created after the bounded evidence run, no unchanged failure was retried, and interrupted rooms remain available for audit.
- Confirmed that independent Proposal and cross-Review calls work with Anthropic Haiku plus OpenAI `gpt-4.1-mini`. The first paid Review batch exposed an order-dependent Canonical State overflow rather than a provider-specific failure.
- Rebalanced active-state caps to the bounded three-Seat protocol maximum and enforced phase-specific Proposal and Review delta limits in the parser instead of relying on prompt prose. A worst-case three-Seat phase fixture now proves that the complete bounded batch fits before targeted debate.
- Compacted the Observer contract to one or two sentences, at most two focus Claims, two remaining Disputes, and one Chair question within its existing 300-token ceiling.
- Replaced the full Review schema in targeted debate with a dedicated minimal Envelope and a 400-token ceiling. It carries only the targeted stance, thesis, at most one Claim update, an optional Chair question, and confidence; it cannot add Claims or objections.
- Made Observer format and provider failures visible in the room error surface.
- Recorded D-038: parallel phase capacity and phase-specific contracts are application invariants, not prompt suggestions.

### Evidence

- After the capacity correction, a fresh mixed-provider room completed both Proposals and both cross-Reviews, reaching Canonical State v4 without order-dependent rejection.
- The same room then exposed two remaining real-provider boundaries: the initial Observer failed its larger strict JSON response, and the first targeted round failed under the old full Review Envelope. One explicit changed-input recovery was attempted after raising the transport ceiling; Anthropic still returned invalid JSON and the OpenAI turn was interrupted before completion. No second retry was made.
- The code now uses the smaller targeted schema inferred from that failure, but this final schema has only deterministic fixture evidence. The combined targeted-debate, second Observer, and synthesis path is not yet claimed as live-complete.
- Production build, ESLint, `git diff --check`, and all nineteen automated tests pass. The app has no authoritative cross-provider invoice total; visible estimates and bounded calls were kept under the approved ceiling, while interrupted calls may still appear on provider dashboards.

### Next Action

Do not continue generic orchestration work. At the start of M2.11, use one small Review benchmark to exercise the new minimal targeted Envelope exactly once. If it succeeds, record the M2.10 evidence Gate as complete and continue the Review vertical slice; if it fails, make targeted debate optional and keep the core Review Pack moving without another infrastructure loop.

## 2026-08-25 - Product Direction Baseline - Artifact-Centered Task Packs

### Completed

- Reconciled the original multi-model critical-review thesis with the v0.10c implementation and identified an infrastructure-first sequencing drift: the meeting engine is more mature than evidence of a better user artifact.
- Approved one product with orthogonal Task Modes and permission levels. Review, Decide / Plan, Explore, Create, and future Play are Task Packs; Discuss, Research, and Execute continue to define authority.
- Chose product-line-driven vertical slices over both a speculative universal platform and separate duplicated applications. Added the Rule of Two for promotion into Shared Core.
- Chose Review as the first artifact-centered product line: Artifact v1, supplied sources and truth constraints, independent Findings, bounded cross-review, Change Set, Artifact v2, changed-material verification, and item-level Human Gate decisions.
- Defined the product correction cadence: no two consecutive infrastructure-only milestones, one realistic case and baseline per product milestone, an expected information gain for every new paid call, and simplification or removal when evidence is weak.
- Defined the multi-agent boundary: deterministic multi-model orchestration remains sufficient for Review and Decide; true multi-agent behavior begins only when Research or Execute has independently useful subtasks, distinct tools or private context, a merge contract, and verification.
- Added [Product Direction](PRODUCT_DIRECTION.md), updated the Charter, Decision Record, Roadmap, protocol scope, model/agent composition, documentation index, and repository read order, with Chinese mirrors.

### Product Truth

- No runtime code, provider request, API key, local room, database, deployment, or paid model call changed in this planning milestone.
- v0.10c remains the local product version. Its final gate is one explicitly budgeted real-provider smoke room for the implemented Observer plus targeted-debate path.
- Generic Observer, routing, autonomy, and infrastructure expansion leave the critical path after that smoke room. M2.11 is now the Review Task Pack rather than a broad meeting-interface expansion.

### Next Action

Preserve a recoverable v0.10c source point, run the one bounded live smoke evaluation with explicit user budget approval, record its semantic and cost evidence, then implement the smallest end-to-end Review benchmark without adding unrelated platform abstractions.

## 2026-08-22 - v0.10c - Chair-Selected Targeted Debate

### Completed

- Added a persisted `TargetedDebatePlan` containing one open Dispute, source State version, bounded source Message IDs, routed Seats, round, and creation time. Old protocol snapshots load with an empty plan list.
- Added a Human Chair action at the Review checkpoint. The Chair selects an open Dispute; deterministic application routing wakes at most two relevant Seats, prioritizing the objection raiser and the target Claim's opposing/supporting Seats. No extra routing-model call is made.
- Added a recoverable `targeted_debate` transition that consumes the next round budget, supports Turn-by-turn subsets, is persisted before provider work, and retains the same explicit interruption and no-automatic-retry boundary as other paid transitions.
- Restricted every targeted request to the named Dispute, related Claim, up to four active Chair Directives, and up to eight source Message IDs. It receives no transcript or prior Memo, emits a standard Review Envelope, forbids new Claims, allows at most one Claim update and one objection, and caps transport output at 250 tokens.
- Returned targeted deltas through the existing deterministic Canonical Reducer. The resulting Process Report reads only the targeted round's completed turns; an enabled Observer then creates exactly one new Round Brief for that delta before the room returns to the Review checkpoint or enters synthesis in Auto mode.
- Added a compact checkpoint Dispute selector with visible routed Seats while preserving synthesis as a separate Chair choice.
- Recorded D-032: later paid debate rounds must name and route an unresolved Dispute.

### Validation

- Production build, ESLint, `git diff --check`, and all eighteen automated tests pass with the bundled Node runtime.
- New orchestration coverage verifies deterministic routing, source lineage, maximum-round refusal, persistence parsing, interruption recovery, Checkpoints completion, and Turn-by-turn seat subsets.
- New provider fixtures prove exactly two routed calls, a 250-output-token ceiling, no prior-Memo or transcript leakage, named Dispute/source IDs in every prompt, standard Review reduction, and a `targeted_debate` completion boundary.
- Fresh browser sessions at desktop and 390x844 mobile widths showed no horizontal overflow or console warnings/errors. No real provider call, credential transmission, paid model use, database deletion, or deployment occurred.

### Current Limitations

- Deterministic relevance currently uses the Dispute raiser plus target Claim support/opposition lineage, with a participant-order fallback. It is intentionally not a semantic router and needs real-room evaluation before becoming more elaborate.
- A model can propose a revision to a Claim, but only application and Human Chair rules can later mark the Dispute resolved; explicit dispute-resolution UX remains part of the Whiteboard/Follow-up work.
- Real-provider format reliability, semantic usefulness, latency, and cost for the combined targeted-debate plus second-Observer path are not yet verified.
- Active provider work still belongs to the page lifecycle; navigation remains an explicit interruption rather than background continuation.

### Next Action

With explicit user budget approval, run one fresh Checkpoints room through Proposal, Review, Observer, one Chair-selected targeted Dispute, a second Observer Brief, and synthesis. Record which calls ran, whether the second Brief evaluates only the named delta, whether the Dispute became more decision-useful, and total tokens, latency, and advisory cost before starting M2.11.

## 2026-08-22 - v0.10b - Explicit Observer and Round Brief

### Completed

- Added an optional Round Observer outside the participant Seat count. Setup requires an explicit reusable Connection and Model, and preflight adds exactly one bounded call per configured round.
- Added a recoverable `observer` transition after completed Review. It runs once per round, is persisted before provider work, and returns to the Review checkpoint before Checkpoints mode continues or Auto enters synthesis.
- Restricted Observer input to a 5,000-character Canonical State rendering, the deterministic Process Report, and explicit reference allowlists. It never receives the raw transcript or participant context turns.
- Added a strict 300-output-token Round Brief contract with source State version, Process Report ID, Turn IDs, convergence/loop/drift signals, and a recommendation. Unknown or closed references fail visibly without retry and cannot mutate Canonical State.
- Persisted credential-free Observer snapshots, append-only `round.brief` events, Round Brief artifacts, and protocol snapshots. Fixed RoomStore reads so process events cannot be miscast as transcript messages and Round Brief artifacts cannot replace Decision Memos.
- Added compact Observer setup, live progress, and Review-checkpoint Round Brief surfaces without changing the transcript-first Meeting workspace.

### Validation

- Production build, ESLint, `git diff --check`, and all sixteen automated tests pass with the bundled Node runtime.
- Mocked provider coverage proves one Observer call, a 300-token transport ceiling, no transcript leakage, exact source lineage, no Canonical State mutation, conservative budget accounting, interruption recovery, and backward-compatible loading of rooms without Observer fields.
- Desktop 1440x1000 and mobile 390x844 browser checks found no Observer control overlap; an incomplete Observer configuration correctly keeps Start disabled.
- No real provider call, credential transmission, paid model use, database deletion, or deployment occurred.

### Current Limitations

- Semantic Observer quality has only been tested with deterministic fixtures; a real paid room still requires explicit budget approval.
- The Observer recommendation is advisory. It does not yet route participants, enforce a soft stop, or select the Final Synthesizer.
- The active fetch still belongs to the current page. Navigation during a paid call remains an explicitly recoverable but billing-ambiguous interruption.

### Next Action

Implement one narrow Dispute-targeted continuation: the Chair selects an open Dispute, the router wakes only the relevant Seat or Seats, every request carries the named Dispute and bounded source context, and a second Round Brief evaluates only that delta. Do not add embeddings, Role Packs, the Whiteboard redesign, or a durable runner in the same slice.

## 2026-08-22 - v0.10a - Validated Turn Presentation

### Completed

- Stopped rendering partial provider JSON as live speech. `agent.delta` now advances a bounded Generating state without entering `TranscriptItem.text`; only a validated `agent.done` statement is published.
- Added explicit Thinking, Generating, Validating, Ready, Posted, and Stopped states across the speaker stage and room timeline. The latest materially changing Seat becomes the live focus, while a user-selected timeline item remains pinned until Follow Live is requested.
- Removed token-driven focus-scroll forcing. A newly selected turn opens at its beginning, and Overview auto-follow disengages when the user scrolls away from the bottom.
- Kept the completed Meeting visible after `room.done`; the Human Chair enters Decision explicitly through `Open decision`.
- Recorded D-028 through D-031 for validated presentation, context-independent Artifact depth, task-adaptive stable Role Packs, and a future durable transition runner.

### Validation

- Production build, all fourteen automated tests, ESLint, and `git diff --check` pass with the bundled Node runtime.
- Provider fixtures assert one Validating event for every completed turn and guard against appending `agent.delta` to visible text or navigating directly to Decision from `room.done`.
- Browser checks at 1280x800 and 390x844 found no horizontal overflow. A saved interrupted room reopened with clear timeline status labels and no console warnings or errors.
- No real provider request, API-key transmission, paid model call, database deletion, or deployment occurred.

### Current Limitations

- Concurrent progress behavior is covered by deterministic event fixtures but has not yet been visually observed during a fresh real-provider room.
- Task-adaptive Role Packs, an independent Final Synthesizer, detailed task-shaped Artifacts, and navigation-safe background execution remain approved designs, not runtime behavior.
- The current page still owns the active fetch. Navigating away can leave provider billing ambiguous; recovery remains explicit and never retries automatically.

### Next Action

Return to the M2.10 critical path: implement one explicit user-selected Observer call after a completed Review round, using only deterministic metrics plus bounded Canonical State, then add one Dispute-targeted continuation. Keep Role Packs, detailed Artifacts, and the durable runner as separate later slices.

## 2026-08-21 - v0.10a - Anthropic Adaptive-Thinking Compatibility

### Completed

- Diagnosed a real Anthropic turn failure: a current adaptive-thinking model rejected the adapter's explicit `thinking.type: "disabled"` request field with HTTP 400.
- Removed the optional `thinking` field from ordinary Anthropic meeting requests. This follows the provider's stated default behavior, avoids enabling a paid extended-thinking budget, and does not introduce a model-name compatibility table.
- Added a provider-boundary regression assertion that every Anthropic fixture request omits `thinking`.

### Validation

- Production build and all fourteen automated tests pass with the bundled Node runtime.
- The fix was verified without another provider request or paid retry. The original failed turn remains auditable.

### Scope

- This is a narrow provider-compatibility repair. It does not change the M2.10 roadmap, enable extended thinking, or add new meeting behavior.

## 2026-08-10 - v0.10a - Deterministic Budget and Progress Gate

### Completed

- Added a backward-compatible `MeetingBudget` to persisted protocol snapshots. New rooms derive exact agent-turn ceilings from Seats, phases, and maximum rounds plus conservative input-token, output-token, and model-time boundaries from the existing context, output, and provider-timeout caps. Old rooms derive defaults during parsing and remain readable.
- Added a pre-transition budget gate. Every started transition counts conservatively, including interrupted work; a requested transition that would exceed the agent-turn ceiling is stopped before a provider call. Observed token and model-time exhaustion also blocks the next transition at a safe boundary. Estimated USD remains advisory because pricing is not authoritative.
- Counted known usage from format-failed and semantic-reduction-failed provider responses. Unknown provider failures still do not invent token or cost data.
- Added deterministic source-linked `ProcessReport` records after completed Review rounds. Reports measure structural Claim, update, objection, open-dispute, open-question, no-new-information, and exact normalized-thesis deltas. Two consecutive structurally empty windows, unchanged disputes without updates, or identical theses while assumptions remain open produce a reversible Chair pause recommendation.
- Persisted reports as append-only `process.report` events without allowing them to mutate Canonical State or approve a Decision. Setup now shows derived maximum calls/output/model time; Meeting shows remaining budget; Review Checkpoints show the latest report.
- Recorded D-027: deterministic budget and structural safety signals precede any paid Observer judgment.

### Validation

- Production build, ESLint, `git diff --check`, and all fourteen automated tests pass with the bundled Node runtime.
- New coverage verifies exact pre-call turn exhaustion, observed token exhaustion, backward-compatible parsing of pre-budget protocol snapshots, and a soft pause only after two consecutive no-progress windows.
- Browser verification reopened the pre-D-027 interrupted room without credentials, displayed its derived remaining budget, and found no console warnings or errors. Desktop 1280x800 and mobile 390x844 checks found no horizontal overflow or overlap between the Chair checkpoint and meeting footer.
- No provider request, paid Observer call, credential change, database deletion, or deployment occurred.

### Current Limitations

- Token and model-time ceilings are evaluated from observed usage at transition boundaries; an already in-flight transition may cross them. Exact call count remains the only fully pre-call hard budget in this slice.
- Exact normalized theses are only a deterministic homogenization signal, not semantic similarity. Drift and paraphrased repetition remain for the explicit Observer path; embeddings are intentionally deferred.
- Budget defaults are derived rather than user-editable. Authoritative cost enforcement remains unavailable when model pricing is unknown.
- M2.10 is not complete: there is no user-selected Observer, paid Round Brief, or Dispute-targeted continuation yet.

### Next Action

Implement M2.10b as one explicit Observer system role and at most one Observer call after a completed Review round. Feed it only the deterministic Process Report plus bounded Canonical State, persist a source-linked Round Brief, include the call in preflight, and forbid state mutation. Then add one narrow Dispute-targeted continuation path. Do not add embeddings or start the Meeting Whiteboard redesign.

## 2026-08-08 - v0.9 - Human-Chaired Resumable Orchestrator

### Completed

- Split the previous one-shot meeting request into explicit proposal, review, and synthesis phases while preserving the legacy endpoint path for compatibility.
- Added a persisted `MeetingProtocolState` with Auto, Checkpoints, and Turn-by-turn modes; stable transition IDs; phase, round, and status tracking; safe-boundary pause/resume; and a hard one-to-five-round parser limit.
- Made Checkpoints the default, added one-to-three-round setup controls with a maximum-call preflight, and kept older saved rooms at their original two-round scope instead of silently expanding them.
- Added Raise Hand for the next safe boundary, scoped append-only Chair Directives, checkpoint continuation, another-round requests at the Human Gate, and transactionally persisted approve/reject actions.
- Persisted protocol transitions and Chair Directives as separate RoomStore events. Completed transition IDs and turn IDs provide deterministic duplicate guards, while refresh recovery converts unresolved running work to `interrupted` without making another provider call.
- Updated the split-phase API to validate protocol phase, bounded context, and requested seat IDs before provider work. Completed transitions are rejected before any provider adapter is called.
- Fixed the first live M2.9 preflight defect: transcript and usage refs now update synchronously before strict persistence, so the initial recovery snapshot cannot race React state scheduling. The original failed start was blocked before any provider request.
- The first paid split-phase probe then exposed two portable-output failures without automatic retry: Anthropic wrapped an otherwise valid Envelope in a whole-response `json` fence, while OpenAI `gpt-5-mini` exhausted the 1,200-token output budget before closing its JSON. The validator now strips only a complete fence wrapper, and the OpenAI adapter conditionally requests `reasoning.effort: minimal` only for original GPT-5, GPT-5 mini, and GPT-5 nano identifiers. The output cap remains unchanged.
- The second bounded Proposal transition accepted OpenAI and paused with only Anthropic pending. Anthropic's normalized JSON omitted `claimUpdates`; the validator now treats omitted collection fields as empty arrays without relaxing any semantic field, reference, capacity, or surrounding-text check.
- Preserved streamed `room.error` messages through the client phase boundary instead of replacing them with a generic missing-completion error, so provider-free protocol validation failures remain diagnosable.
- Fixed the first split Review transition before any provider call: constructing proposal targets had mutated the shared Review work objects and replaced new Review IDs with already-applied Proposal IDs. Targets now use immutable copies, and the split Proposal-to-Review fixture asserts two additional provider calls and a Review completion boundary.
- The first paid Review transition then stopped with zero accepted reviews: OpenAI exhausted the output cap before closing its JSON, while Anthropic exceeded the two-objection cap and introduced external examples as factual support despite Research mode being disabled. Review prompts now require a statement of at most 120 words, at most one new Claim, two updates, two objections, one-sentence fields, and no external evidence absent from Canonical State. No synthesis call was made.
- A bounded Review retry made two additional provider calls. Both providers returned format-valid concise Envelopes, and the first Review reduced successfully. The second was rejected because the first Review's `revise` update had archived a Claim that both parallel reviewers saw in their shared input state. The Reducer now treats `revise` as an advisory contest rather than archival; only `withdraw` archives a Claim. A regression test confirms that a second parallel reviewer can still reference the Claim.
- One explicitly approved pending-seat Review call was then run against the already-persisted pre-D-026 room snapshot. Anthropic returned another concise, format-valid Review, but it did not reduce and the room stopped without synthesis or retry. The generic phase error had overwritten the preceding agent-level semantic detail; the client now preserves the first format, reduction, or provider error as the primary interruption message instead of replacing it with the phase summary. Because the room's Canonical State was already mutated under the old archival rule, it is not a clean post-fix verification sample and should not receive another paid retry.
- Recorded D-025: ambiguous in-flight work is recovered explicitly by the Chair and is never automatically retried.
- Recorded D-026: reviewer revision requests preserve published Claim identity until explicit withdrawal or human resolution.

### Validation

- Production build, ESLint, `git diff --check`, and all thirteen automated tests pass with the bundled Node 22 runtime.
- New tests cover pure orchestration transitions, idempotent completion, refresh interruption recovery, Turn-by-turn boundaries, split proposal execution, `phase.done`, and rejection of a completed transition before an extra provider call.
- Repository-wide `tsc --noEmit` reports only the pre-existing missing Cloudflare ambient types in `db/index.ts` and `worker/index.ts`; no changed application file produced a TypeScript error.
- The first live M2.9 proposal probe made two provider calls, then stopped before review or synthesis when both outputs failed strict validation. No automatic retry occurred; subsequent calls require a new explicit transition.
- Across the bounded live session, exactly ten paid provider calls ran: four calls across the first two full Proposal attempts, one pending-seat Anthropic Proposal, and five Reviews. Two provider-free Review starts exposed the immutable-work bug before paid Review work. Zero Synthesis calls ran; one Review is accepted and the pre-D-026 room remains interrupted with one Review pending. The second approved call was not used because Synthesis was conditional on Review success.
- Interactive browser validation could not run in this sandbox because local port binding was denied with `EPERM` on both the development and production servers. Build, server-render, source, and protocol tests remain green, but desktop/mobile visual behavior still needs a live browser pass.
- The requested pre-M2.9 backup tag and the final milestone commit could not be created because this environment denied both tag-lock and `.git/index.lock` writes. The validated M2.9 changes remain in the working tree; the exact pre-change recovery commit is `f986b5e`, and the earlier `backup/v0.6-live-baseline-2026-08-04` tag remains available.

### Current Limitations

- The real-provider Checkpoints run has verified Proposal recovery and one accepted Review, but still needs the pending Review, Review Checkpoint, and Synthesis/Human Gate. Gemini remains untested.
- Browser-local BYOK cannot guarantee exactly-once billing for a request that was in flight during refresh. The UI discloses that ambiguity, never retries automatically, and requires a new explicit transition to continue.
- The current maximum-round and call-count bounds are not yet full token, turn, time, or authoritative-dollar budgets.
- M2.10 has not added Observer / Recorder, Round Briefs, loop and drift monitoring, or Dispute-targeted participant routing. Accepted phase statements remain bounded but are still broader than the final per-agent context design.
- M2.11 has not yet replaced the live transcript focus with Turn Cards, the Meeting Whiteboard, source-linked follow-up, and versioned Memo amendments.

### Next Action

Do not retry the polluted pre-D-026 room. When another live budget is justified, start one fresh, tightly bounded post-D-026 Checkpoints room and require both Reviews to reach the Review Checkpoint before authorizing Synthesis. Then implement M2.10 Observer, Round Brief, Monitor soft stops, and Dispute-targeted routing. Do not start the larger M2.11 interface redesign in the same milestone.

## 2026-08-04 - v0.8 - Structured Meeting State

### Completed

- Added a provider-neutral Turn Envelope contract with strict JSON parsing, exact-field validation, phase-aware statement limits, bounded cards, and explicit `no_new_information` rules.
- Added deterministic Claim, Dispute, Assumption, Open Question, Chair Directive, Human Choice, and Follow-up contracts. Stable IDs and source-message lineage are assigned by application code, not models.
- Implemented an atomic Canonical Reducer with state versions, duplicate-turn protection, unknown-reference rejection, active caps, archived IDs, and cumulative usage.
- Applied the same Reducer at server phase boundaries and in the client replay path. A semantically rejected proposal or review emits `agent.reduction_error` and is excluded from every downstream review or synthesis prompt.
- Added valid JSON context rendering with a hard 6,000-character default cap. Oversized collections are omitted visibly by count rather than truncating JSON or silently deleting durable events.
- Updated all three provider prompts to return the same portable JSON Envelope. Malformed output emits `agent.format_error`, persists as `turn.format_failed`, and stops that turn without an automatic retry; semantic rejection persists as `turn.reduction_failed`.
- Persisted Canonical Meeting State inside existing IndexedDB state snapshots while retaining backward-compatible reads for rooms created before M2.8.
- Preserved an existing room ID and creation time when development hot reload remounts the storage initializer, preventing a retained transcript from being copied into a new room.
- Recorded D-024: use one portable JSON contract before evaluating provider-specific structured-output APIs.

### Validation

- Production build and all eleven automated tests pass. New tests cover Envelope parsing, source lineage, idempotency, unknown references, atomic 12-Claim overflow, bounded valid-JSON context, malformed provider output with exactly two proposal calls and no review, synthesis, or retry, and exclusion of semantically rejected reviews from downstream synthesis.
- ESLint and the focused strict TypeScript check pass.
- Browser reload recovered all three original pre-M2.8 rooms, opened the latest real room to its Decision Memo, restored zero credentials, and reported no console warnings or errors. Repeated development hot reload exposed the room-ID remount bug before the guard was added.
- No real provider request or paid model call was made.

### Current Limitations

- Portable JSON compliance has only been exercised with deterministic provider fixtures. Real OpenAI, Anthropic, and Gemini format reliability still needs a bounded evaluation before claiming production robustness.
- During generation, the existing live transcript may briefly show raw JSON until `agent.done` replaces it with the validated statement. Card-first streaming belongs to M2.11 interface work.
- The current one-shot route now publishes bounded Canonical State and Claim IDs to review and synthesis prompts, but it still sends every accepted proposal/review statement within the request. M2.9 will split phases at safe boundaries; M2.10 will route later turns only to named Disputes.
- Chair Directive, Human Choice, and Follow-up records are defined and validated, but their runtime workflows begin in M2.9 and M2.11.
- After explicit human approval, the five duplicate English baseline rooms created by the pre-fix hot-reload behavior were deleted from the local archive. The latest English baseline and the two original Chinese meetings remain, restoring the archive to three records.
- Repository-wide `tsc --noEmit` still requires the pre-existing Cloudflare ambient types; changed files pass the focused strict check.

### Next Action

Implement M2.9 Human-Chaired Resumable Orchestrator: explicit persisted protocol state, Checkpoints by default, safe-boundary pause/resume, append-only Chair Directives, idempotent transitions, and refresh recovery. Do not add Observer calls or redesign the Meeting UI yet.

## 2026-08-04 - v0.7 - IndexedDB Local Event Store

### Completed

- Removed unconditional OpenAI `reasoning.effort` and `text.verbosity` request fields; the session-BYOK regression case now uses `gpt-4.1-mini` and asserts that neither optional field is sent.
- Preserved the pre-storage baseline in commit `3298d40` and tag `backup/v0.6-live-baseline-2026-08-04` before changing persistence.
- Added a strict credential-free `MeetingRecord` parser and provider-independent `RoomStore` backed by IndexedDB schema version 1.
- Created `rooms`, `participants`, `events`, `stateSnapshots`, `artifacts`, `usage`, and `metadata` stores. Completed and failed turns become append-only events; state snapshots, versioned memo artifacts, usage, and participant snapshots are updated transactionally.
- Migrated validated `multi-ai-meeting-room.history.v1` localStorage records exactly once and removed the legacy key only after the IndexedDB transaction committed.
- Moved room loading, saving, deletion, and bounded 30-room pruning to the asynchronous store. API keys and credential-bearing Connection records remain session-only.

### Validation

- Production build, all seven automated tests, ESLint, the focused strict TypeScript check, and `git diff --check` passed with the bundled Node 22 runtime.
- Browser migration recovered three existing meetings. The newest room reopened with its Decision Memo and exact 2,437 input / 3,424 output / $0.032 / 54-second usage summary intact across two reloads.
- After reload, zero provider connections were restored and the browser console contained no warnings or errors.
- The repository-wide `tsc --noEmit` remains blocked only by pre-existing missing Cloudflare ambient types in `db/index.ts` and `worker/index.ts`; the changed frontend and storage files pass the focused strict check.

### Current Limitations

- Persistence is local to one browser profile. Export, account ownership, server synchronization, conflict handling, and cross-device recovery are not implemented.
- Events currently preserve raw agenda and completed/failed transcript turns; M2.8 has not yet introduced validated Turn Envelopes, Claims, Disputes, or the deterministic Canonical Reducer.
- In-flight streaming deltas remain memory-only. A crash can discard an active partial turn, but cannot promote it to a completed event.
- Transactional deletion is covered by implementation and source checks; browser migration testing intentionally preserved the user's three real records instead of deleting one.

### Next Action

Implement M2.8 Structured Meeting State: Turn Envelope validation, bounded cards, source-linked records, and a deterministic Canonical Reducer over the M2.7 event stream. Do not begin the larger interface redesign yet.

## 2026-08-04 - Evidence Baseline - First Live Two-Provider Room

### Completed

- Verified session BYOK and model discovery with real OpenAI and Anthropic credentials without exposing either key in the room or transcript.
- Completed the full v0.6 protocol with OpenAI `gpt-5-mini` as Strategist and Anthropic `claude-haiku-4-5-20251001` as Critical Reviewer: two independent proposals, two directed reviews, one OpenAI synthesis, usage reporting, local history, and the Human Gate.
- Preserved the independent OpenAI proposal as the content baseline and compared it with the cross-model memo. Anthropic and the directed reviews added a recurrent-decision-class constraint, role asymmetry, chair-competence risk, a measurable pilot, empirical-claim caveats, and durable disputes.
- Left the Human Gate pending. No approval, rejection, or paid revision was submitted on the user's behalf.
- Saved the detailed bilingual evaluation as [Live Baseline 001](evaluations/2026-08-04-v0.6-live-baseline.md).

### Validation

- Successful room: 5 provider calls, 2,437 input tokens, 3,424 output tokens, 54 seconds model time, and a $0.032 advisory cost estimate.
- The final memo preserved disputes about agent count, networking, initial scope, and chair capability.
- No browser console warnings or errors were present after completion.
- A failed `gpt-4.1-mini` probe surfaced its provider error, stopped after the proposal phase, and triggered no automatic retry, review, or synthesis.

### Current Limitations

- The OpenAI adapter unconditionally sends `reasoning.effort` and `text.verbosity`; `gpt-4.1-mini` rejects at least the reasoning parameter even though model discovery lists it.
- The room generated more output than input and imposed excessive reading effort for a short objective.
- Generated operating thresholds entered the memo without evidence, including chair-experience and response-time numbers.
- Synthesis silently reused the OpenAI Strategist because v0.6 has no explicit Final Synthesizer configuration.
- The independent proposal is a valid content control but was not a separately timed standalone API request.

### Next Action

Fix OpenAI optional-parameter compatibility with a regression assertion, create a named v0.6 baseline backup, and then begin M2.7 `RoomStore` plus IndexedDB. Do not spend the remaining revision round unless the user names an objection to resolve.

## 2026-08-03 - Planning Baseline - Meeting Protocol Blueprint v1

### Completed

- Separated current product truth from the approved future protocol: the runnable product remains v0.6, while the new meeting architecture is explicitly marked as not yet implemented.
- Added a bilingual Meeting Protocol Blueprint covering the human chair, structured meeting state, bounded rounds, observer and synthesizer roles, targeted context, follow-up, usage accounting, and local persistence.
- Expanded the roadmap through M2.12 so storage, state reduction, orchestration, monitoring, synthesis, interface work, and evaluation have explicit order and exit criteria.
- Recorded durable decisions for human chair authority, canonical state separation, explicit billable system roles, append-only local storage, and budget-aware stopping.
- Chose browser IndexedDB behind a `RoomStore` boundary as the first local database. Server D1 remains inactive until identity, room ownership, deletion, encryption, and sync semantics are designed.
- Set the critical path to: live v0.6 baseline, local event store, canonical state, resumable orchestration, focused meeting interface, then evaluation and consolidation.

### Validation

- Updated English canonical documents and Chinese quick-read mirrors together.
- Checked roadmap status labels and the boundary between implemented behavior and approved future work.
- This planning milestone changes no runtime code, API behavior, database binding, provider account, deployment, or paid model usage.

### Current Limitations

- Human chair modes, a canonical claim/dispute state, the observer, round briefs, loop monitoring, token budgets, targeted follow-up, and IndexedDB persistence are approved designs, not current product behavior.
- Exact token and cost defaults still require measurements from real provider runs.
- The provider-specific structured output strategy and IndexedDB helper library remain implementation-time choices.
- The production URL still reflects an older deployed version; local v0.6 is the current implementation baseline.

### Next Action

Run one OpenAI plus Anthropic v0.6 meeting without revision, save a single-model baseline for the same prompt, and record useful objections, memo quality, latency, token usage, estimated cost, and provider errors before starting M2.7.

## 2026-08-03 - v0.6 - Local Meeting History

### Completed

- Added a top-level Meetings entry and a focused left-side archive instead of returning meeting history to the scrolling workspace.
- Meetings now automatically preserve the objective, full transcript, decision memo, human approval state, usage totals, rounds, and provider/model/role summaries in this browser.
- `New meeting` creates a fresh room while keeping prior records; saved rooms can be reopened or explicitly deleted.
- Added immediate saves before room switching and reset, plus a bounded 30-record archive.
- Kept credentials outside the archive. API keys, reusable connections, and connection IDs are never serialized into meeting records.
- A restored pending room can request a revision only when the currently connected seats match its saved providers, models, and roles.

### Validation

- Production build and lint pass.
- The empty archive drawer was checked at 1280x720 with no horizontal overflow or clipped controls.
- Source regression checks cover the history entry, storage namespace, archive styling, and credential-free record type.

### Current Limitations

- History is local to one browser profile; there is no account identity, server sync, cross-device recovery, or collaborative room ownership.
- The browser storage quota is not a database guarantee; export and durable event storage remain M2.5 work.
- In-progress streaming text is saved on a short debounce, so an abrupt browser process crash can lose the newest unsaved tokens.
- Session API keys still clear on refresh by design and must be reconnected before a restored room can run another model round.

### Next Decision

Run the first real two-provider meeting, then decide whether the next M2.5 slice should be export/import or account-backed server persistence.

## 2026-08-03 - v0.5 - Verified Connections and Reusable Seats

### Completed

- Created backup tag `backup/pre-reusable-connections-2026-08-03` at the last recorded v0.4 commit.
- Replaced provider-fixed credential rows with an add-connection flow: choose a provider or accept a high-confidence local prefix suggestion, enter one API key, then explicitly verify and load compatible model IDs.
- Added server-side model discovery for OpenAI, Anthropic, and Gemini with bounded timeouts, secret redaction, no automatic retry, and no credential echo.
- Separated connection credentials from seats. One verified connection can now power two or three seats, and each seat independently selects its model and role.
- A newly verified connection fills only the first empty seat; reusing it in another seat is always an explicit user choice.
- Upgraded Setup into a unified Connection Library with optional names, model reload, transactional key replacement, usage-by-seat labels, and confirmed disconnect.
- Added per-seat Manage and `Add new connection` paths that reuse the same library and can assign an existing or newly verified connection to the initiating seat.
- Fixed a decision-gate CSS specificity conflict that rendered the approval label white on white; approved and rejected actions now retain visible state labels.
- Removed the one-seat-per-provider protocol restriction while retaining the two-to-three-seat and two-round bounds.

### Validation

- Production build passes with the bundled Node runtime; lint passes.
- Seven automated tests pass, including model filtering without key echo, mixed-provider session BYOK, and two OpenAI seats sharing one connection while selecting different model IDs.
- Desktop and mobile viewport checks show no horizontal overflow or dialog/control overlap.
- No live provider request was made during automated validation.

### Current Limitations

- The user's real OpenAI and Anthropic credentials and returned model lists have not yet been tested.
- Provider key formats are not a universal detection standard; ambiguous formats require manual provider selection.
- Workspace-managed connections currently expose only their configured default model in the UI.
- Dynamic model lists do not include authoritative pricing; cost remains a provider-level estimate.
- Explicit synthesizer selection, Skill composition, and diversity indicators still belong to M2.2.

### Next Decision

Verify the two real session keys, inspect the returned models, compose a mixed-provider two-seat room, and complete one live round without revision.

## 2026-08-03 - v0.4 - Focused Meeting Workspace and Session BYOK

### Completed

- Created backup tag `backup/pre-live-workspace-redesign-2026-08-03` at the last validated v0.3 commit.
- Replaced the scrolling all-in-one page with Setup, Agenda, Meeting, and Decision stages inside a fixed-height workspace.
- Added a live speaker focus surface, protocol progress, compact room timeline, full transcript overview, and a human decision surface.
- Added an in-product Connections dialog for session-only OpenAI, Anthropic, and Gemini keys plus model IDs.
- Added server handling for immediate session credentials without persistence, response echo, browser storage, or automatic retry.
- Added role mandates and the bilingual model/agent blueprint separating Connection, Model, Role, Skill, Seat, and Room.

### Validation

- Production build and lint pass.
- Five automated tests pass, including a complete session-BYOK meeting fixture and an assertion that credential values never appear in the event stream.
- The existing workspace-secret path remains available.

### Current Limitations

- The v0.4 source is pushed and a deployable version is saved, but production publication is blocked by a Sites runtime transition that rejects its generated `nodejs_compat` flag after that flag became a platform default. The previous production version remains live; do not repeat deployment without a platform or deployment-input change.
- Session keys disappear on refresh by design; durable BYOK still requires identity and encrypted storage.
- One provider may still occupy only one seat; duplicate-provider and per-seat model composition is M2.2.
- Real provider output quality, latency, token accounting, and errors remain unverified.
- Cost reporting remains an estimate and there is not yet a durable daily or per-user budget.

### Next Decision

Connect exactly two providers, run one representative live room without revision, and compare its objections and memo against a saved single-model baseline.

## 2026-08-03 - v0.3 - Real Discuss Implementation

### Completed

- Replaced simulated agent messages with a provider-neutral streaming protocol.
- Added direct server adapters for OpenAI Responses, Anthropic Messages, and Gemini streaming generation APIs.
- Added independent proposals, round-robin cross-review, synthesis, and one optional bounded revision.
- Added human approve/reject controls, a hard stop control, token and latency reporting, and configurable cost estimates.
- Added server-side secret detection without exposing key values to the browser.
- Added role selection independent of provider identity.
- Removed the unused starter loading-skeleton dependency.

### Validation

- Production build passes with the `/api/discuss` route.
- Five automated tests pass, including a fully mocked two-provider proposal, review, and synthesis stream.
- Invalid requests are rejected before any provider call.
- No paid provider request was made during automated validation.

### Current Limitations

- Production provider secrets are not configured, so live meetings remain disabled.
- No real provider latency, token accounting, output quality, or failure behavior has been evaluated yet.
- Rooms are browser-session state only; persistence is M2.5.
- Displayed prices are estimates configured through environment variables, not provider invoices.
- Duplicate submission is blocked in the client, but durable idempotency belongs to the M4 orchestrator.

### Next Decision

Configure at least two provider keys, run one representative meeting, and record whether the cross-review adds useful objections relative to a single-model answer.

## 2026-08-01 - v0.2 - Project Continuity System

### Completed

- Added `AGENTS.md` so future coding agents load project context before acting.
- Added the project charter, AI handoff, roadmap, decision record, and documentation index.
- Added Chinese quick-read mirrors for the project documents.
- Defined bounded rounds, retry limits, duplicate-call protection, stop conditions, and human approval boundaries.
- Replaced the starter README with a project-specific entry point.

### Validation

- Documentation cross-links and project status were checked against the current prototype.
- The production build remained valid; no product behavior was changed.

### Current Limitations

- Documentation cannot enforce runtime behavior by itself. M4 must encode these rules into the orchestrator.
- English and Chinese files can drift unless every material documentation change updates both.

### Next Decision

Define M2 provider configuration, API-key strategy, message protocol, and the minimum decision-memo schema before implementation.

## 2026-08-01 - v0.1 - Interactive Prototype

### Completed

- Shipped the first interactive meeting-room prototype.
- Added agenda input, selectable agent roles, Brainstorm/Review/Decision modes, bounded simulated rounds, and a decision surface.
- Published the private prototype.
- Added a visible development-log section to the product.

### Product Truth

- All current AI messages are simulated local templates.
- No OpenAI, Anthropic, or Google APIs are connected.
- Rooms and artifacts are not persisted.
- There is no evidence retrieval, claim verification, execution agent, or automated evaluation.

### Decisions Reached

- One product will support Discuss, Research, and Execute permission levels.
- The core value is auditable decisions and actions, not model aggregation.
- Real Discuss comes before Research and Execute.

### Next Decision

Build the narrowest real multi-model Discuss workflow and compare it with a strong single-model baseline.
