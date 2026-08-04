# Development Log

This chronological log records shipped work, validation, limitations, and the next decision. It is not a place for uncommitted feature ideas; those belong in the roadmap or decision record.

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
