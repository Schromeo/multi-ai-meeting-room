# Development Log

This chronological log records shipped work, validation, limitations, and the next decision. It is not a place for uncommitted feature ideas; those belong in the roadmap or decision record.

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
