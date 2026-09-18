# Plan Issue Register

Updated: 2026-08-29. Canonical issue list for the current M2.13 correction.

## Product Gate

Deliver a complete, concrete plan that independent criticism can improve and the human can adopt. More models, longer reasoning, valid JSON and passing unit tests are not substitutes. Preserve [010](evaluations/2026-08-27-plan-quality-live-010.md) and [011](evaluations/2026-08-27-plan-wait-continuation-011.md) as negative evidence: six of twelve days, no actual-plan review. Never describe an untested hypothesis as the cause of011.

Statuses: Open, In progress, Local fix (live unverified), Verified, Deferred. Close each item with evidence, not a bulk completion label.

| ID | Priority / status | Evidence / problem | Remedy and acceptance |
| --- | --- | --- | --- |
| PLAN-01 | P0 / Local fix (live unverified) |011: no accepted new days; incomplete response and parser rejections collapse into one error. | New Builder/reviewer attempts retain bounded finish/usage and specific rejection categories in checkpoints/history. Offline route tests separate truncation, malformed JSON, schema, arithmetic, cross-day conflict and transport failure; preserve partial days and no retry. Historical missing evidence stays unknown. |
| PLAN-02 | P0 / Local fix (new directions only) |010's temporary cross-review JSON correction remains in Builder context. Presence proven, causal effect unknown. | Explicit format-only directions are limited to their phase/round and excluded from later Builder prompts. Actual prompt/history tests pass; lasting and legacy requirements remain. Old010/011 corrections and frozen Plan state are not silently migrated. |
| PLAN-03 | P1 / In progress (local profile, live evidence required) | Reasoning and visible output share a9,600-token recovery ceiling;011 shows a rounded~9K decrease, not proof of exhaustion. | D-058 requests low reasoning for recognized GPT-5 Builder only, retains medium semantic judgment and provider defaults elsewhere, and records the requested setting beside reported usage. Offline payload/history tests pass without raising caps. Acceptance still requires complete usable days with reported finish/usage in an authorized one-stage check. |
| PLAN-04 | P1 / Local fix (live unverified beyond180s) |010 timed out at180s. | D-056 removes Plan app deadlines/cumulative-time stops;600s simulated wrapper passes and cancellation remains.011 was shorter than180s; do not claim long live completion. |
| PLAN-05 | P1 / Local fix |010 could not use recovery after a prior formatting retry. | D-056 explicitly renews one artifact attempt, preserving prior reservations/tokens.011 started once, never auto-retried; future request-ledger work is separate. |
| PLAN-06 | P1 / Verified for new Plans | D-062 emits and persists a strict per-stage `started` receipt with unknown usage before Builder/Reviewer provider work, then replaces that request/stage in place with accepted, rejected or provider-error terminal evidence. A Reviewer receipt exists only after Builder acceptance. | Build, 62 tests and lint pass. History round-trip, ordering, replacement and failure paths are covered; credentials/raw output/private reasoning remain excluded. Historical unknown calls are not reconstructed, unknown is not zero or refunded, and provider invoices remain authoritative. |
| PLAN-07 | P1 / Open | Known metadata errors, including #53 labeled Easy; no catalog access. | Source-bound official metadata verification or explicit unresolved metadata gate; no invented verification or permissive validator. |
| PLAN-08 | P1 / Open | Day1 fallback replaces1Medium with2Easy while claiming equal work; fallback time and unspecified substitutes can break the contract. | Explicit replacement tasks and deterministic resulting workload/time checks, including downstream spillover. Preserve requested minimum; unmet work stays unmet. |
| PLAN-09 | P1 / Open | Workload/proficiency assumptions, new/redo mix and time boxes may reward volume over learning. | Separate hard user requirements from assumed daily availability and reviewer preferences; assess mastery, spacing, prerequisites and realistic fallback against a task rubric. Redo is not automatically invalid and review time includes timed redo. |
| PLAN-10 | P1 / Open | Live014 completed the actual artifact and called Fable on it, but invalid JSON caused atomic review rejection. No accepted concern, amendment, recheck or adoption exists; D-055 amendment/recheck still has only scripted evidence. | D-060 makes the actual-artifact review contract reliable offline. Next obtain specific grounded concerns from the preserved Sol artifact, amend affected material, verify and leave adoption to the human. No regeneration or forced agreement. |
| PLAN-11 | P2 / Verified | D-061 distinguishes persisted budget and human stops; legacy rooms remain neutral. A structurally eligible Plan recovery is evaluated against preserved usage before either control enables. | Build, 62 tests and lint pass. Exhausted recovery is visible but disabled, the handler rechecks budget, and no provider call can start. No record migration; D-062 handles new-Plan stage receipts and PLAN-12 durable continuity remains separate. |
| PLAN-12 | P2 / Open | Rebinding models resets the active view; Overview hides Plan progress; tab/refresh may interrupt paid work. | Restore matching seats predictably, expose artifact progress, retain durable checkpoints. Separate a future durable runner from immediate fixes. |
| PLAN-13 | P1 / Local fix (live unverified) | Earlier cross-review failed JSON and switched language. Live014 Fable completed a 5,191-output-token actual-artifact review but its 2,720 visible characters were invalid JSON; raw content was intentionally not retained. | D-060 sends native JSON Schema only to explicitly supported Anthropic Plan Reviewers, keeps local semantic limits authoritative, accepts only a sole JSON fence, rejects prose wrappers, and never retries. Build, 62 tests and lint pass; one saved-artifact Reviewer-only live result remains required. Language consistency is still prompt-level, not a separate deterministic validator. |
| PLAN-14 | P2 / Open | Task roles still inherit generic meeting structure; more seats may add overhead or shared errors. | Test curriculum/feasibility/actual-artifact review responsibility, each with a unique contribution; add seats only for a named gap. |
| PLAN-15 | P2 / Open | No matched evidence of improvement over one strong model. | After one usable artifact, compare accepted material changes, false criticism, cost and human effort. M2.12 remains deferred, not passed. |
| PLAN-16 | P3 / Deferred | Three existing Cloudflare type declaration errors; hosted deployment differs from local. | Separate environment maintenance; not a cause established for010/011 and not part of this correction. |
| PLAN-17 | P0 / Verified | Live012 History12 entered direct Plan synthesis but the API still required two proposals and one review. It rejected locally before provider work. | Generic synthesis-history prerequisites now exclude Detailed Plan. Live014 entered artifact work with empty discussion history and made exactly the intended two calls; ordinary Decide remains gated. |
| PLAN-18 | P0 / Verified | Live012 History13 emitted a valid empty Plan bound to fresh Canonical State version0, but the client parser required version>=1 and aborted before saving it. | Plan artifact parser accepts source version0 and rejects negatives. Live014 persisted all12days from a fresh version-zero room before review. |

## Execution Order And Stop Rule

1.01 diagnostic closure, then02 instruction scope, with no new paid calls.
2.03 based on actual evidence;06/11 only when they block an explicit recovery.
3.07-10 artifact correctness and criticism-to-revision; do not claim adoption on schema success.
4.12-15 only after the complete artifact path earns them.16 remains separate.

Each slice uses the [Development Correction Loop](DEVELOPMENT_CORRECTION_LOOP.md), records changed files/tests and remaining uncertainty, and updates this register and its Chinese mirror. No automatic paid rerun, broad rewrite, new agent platform or unbounded optimization.

## 2026-08-29 Artifact-first Entry Closeout

- D-059 and [Live012](evaluations/2026-08-29-plan-artifact-first-live-012.md) replace the six-call generic launch with one Builder plus one actual-artifact Reviewer. Preflight and initial protocol budget are two calls /22K output.
- PLAN-17 and PLAN-18 are locally fixed with behavioral coverage. Build,61 tests and lint pass. The artifact and reviewer quality Gate is still unrun.
- History12 made no provider call. History13 may have started Sol before client cancellation; no accepted usage exists and D-062 does not reconstruct it. New Plan requests now retain stage lifecycle receipts, but a new run still cannot reuse the original cap without renewed authority.
- Renewed [Live014](evaluations/2026-08-29-plan-artifact-first-live-014.md) then verified PLAN-17/18: Sol persisted12/12days and Fable received the actual artifact in exactly two calls. Fable's invalid JSON leaves PLAN-10/13 open. Stop paid work and preserve the complete draft; next correction is Reviewer-only and offline first.

## 2026-08-29 PLAN-13 Local Contract Closeout

- [Correction brief](correction-briefs/2026-08-29-plan-reviewer-structured-output.md), D-060. Supported Anthropic Plan Reviewers now receive `output_config.format` with the narrow review JSON Schema; Fable 5 is covered. Unsupported Claude IDs and unrelated OpenAI/Gemini calls retain their existing payloads and provider-default thinking.
- Local Plan validation still enforces the request-specific day range, lengths and collection limits. A response containing only one JSON fence is normalized; explanatory text around JSON remains invalid. No raw response retention, hidden extraction call, automatic retry, model/cap/prompt-role change or Plan regeneration was added.
- Build and 62 offline tests pass; lint passes. Type checking reports only the same three Cloudflare ambient-type errors. Zero provider calls and zero API spend. Backup: `/private/tmp/meeting-room-before-plan-reviewer-structured-20260829.tar.gz`.
- **Stop:** PLAN-13 is locally fixed but not live-verified. PLAN-10 remains open. The next evidence-bearing action is at most one explicitly authorized Fable Reviewer-only call against the preserved Live014 artifact, followed by inspection of accepted concerns and semantic quality; never rerun Sol for this check.

## 2026-08-27 Local Closeout:01 And02

- Changed `lib/plan-artifact.ts`, `lib/meeting-state.ts`, `app/api/discuss/route.ts`, `app/page.tsx`, `app/plan-view.tsx` and `tests/rendered-html.test.mjs`. [Correction brief](correction-briefs/2026-08-27-plan-diagnostics-scope.md), decision D-057.
- Store the latest four initial Builder/reviewer attempt summaries and first twelve rejection details per attempt, with total rejected count. Capture only supplied usage and terminal status; missing usage is null, not zero. No raw response, credential or private reasoning storage. Diagnostic data is excluded from Plan model prompts.
- Validation: build,59 offline tests and lint pass. Tests cover all three provider adapters, reasoning-only output exhaustion, interrupted streams, missing terminal events, malformed review JSON, record round-trip and phase-scoped actual prompts. Three pre-existing Cloudflare type errors remain; no new browser interaction or IndexedDB fault test this slice. Local HTTP200.
- Zero live API calls, no deployment, model switch, output-budget change, automatic retry or rewrite of archived days. Amendment/recheck do not yet retain these attempt summaries. Reported tokens are not an authoritative invoice, and provider request IDs are not captured by this slice.
- Next: PLAN-03 evidence-led output/reasoning work.011 cannot reveal lost raw output retroactively; any future live check requires explicit remaining-budget authority and a deliberate context choice for the old global correction. Full Plan quality, independent review and human adoption remain unverified.

## 2026-08-29 PLAN-03 Local Profile

- [Correction brief](correction-briefs/2026-08-29-plan-reasoning-headroom.md), D-058. For recognized original GPT-5 IDs, Builder requests `low`; actual Plan reviewer, editor and recheck request `medium`; ordinary discussion remains `minimal`. Anthropic, Gemini and unrecognized models retain provider defaults rather than receiving guessed cross-model thinking parameters.
- Attempt diagnostics now distinguish the requested setting from reported reasoning tokens. Old diagnostics without this field remain valid; unknown enum values are rejected. The collapsed Plan view shows both and still stores no reasoning content.
- Output caps, dynamic missing-day sizing, prompts, validators, models, call budgets and retry behavior are unchanged. The9,600 figure remains the six-missing-day request ceiling, not a reserved visible-text guarantee.
- Build and59 offline tests pass. Tests inspect actual mocked payloads and defaults for all three adapters, history compatibility, UI disclosure, truncation and partial-day preservation. Lint/type/local HTTP results are recorded in the Devlog. Zero live calls.
- **Stop:** this is not complete or live-verified. Do not spend from010's old authorization. The next information-bearing action is one explicitly authorized Builder-stage check with the same model, contract and cap, followed by inspection of finish, requested setting, reported reasoning/output and accepted days. If low still exhausts or harms the artifact, retain that failure and reconsider the cap/profile; do not auto-retry.
