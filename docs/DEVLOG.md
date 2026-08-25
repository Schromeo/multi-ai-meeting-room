# Development Log

This chronological log records shipped work, validation, limitations, and the next decision. It is not a place for uncommitted feature ideas; those belong in the roadmap or decision record.

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
