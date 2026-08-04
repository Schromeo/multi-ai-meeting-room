# Decision Record

Durable product and architecture choices live here. New entries are append-only. Superseded decisions remain visible and point to the replacement.

## D-001 - Human-Chaired System

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** the human controls objectives, approvals, permissions, budgets, and final acceptance.
- **Reason:** multi-model consensus can still be wrong and cannot own human consequences.

## D-002 - One Product, Three Permission Levels

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Discuss, Research, and Execute are room permission levels inside one product.
- **Reason:** they share the same deliberation and audit model while differing mainly in tool authority.

## D-003 - Auditability Over Model Aggregation

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** optimize for traceable claims, disputes, decisions, actions, and results rather than the number of simultaneous models.
- **Reason:** side-by-side answers are easy to copy; a reliable decision process is the differentiated value.

## D-004 - Roles Are Provider-Neutral

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Strategist, Critic, Researcher, Builder, Reviewer, and Chair are role configurations, not fixed provider identities.
- **Reason:** model capabilities and availability change; room protocols should remain stable.

## D-005 - Build Order

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** implement real Discuss first, Research second, and Execute third.
- **Reason:** each level validates the shared core before adding more authority and operational risk.

## D-006 - Separate Control and Execution Planes

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** the web application owns rooms and approvals; a local connector or isolated cloud worker owns privileged execution.
- **Reason:** the hosted interface should not receive unrestricted access to a user's machine or repository.

## D-007 - Bounded Deliberation

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** rooms have explicit round, retry, cost, permission, and stop boundaries.
- **Reason:** more model activity is not automatically more useful and can create loops, duplicate actions, and review theater.

## D-008 - Server-Side Provider Secrets

- **Status:** Superseded by D-011
- **Date:** 2026-08-03
- **Decision:** provider API keys are stored only as server runtime secrets and are never entered into or returned to the browser.
- **Reason:** the private UI does not need access to long-lived provider credentials.

## D-009 - No Automatic Provider Retry In M2

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** a failed or interrupted provider stream is surfaced to the room without an automatic retry.
- **Reason:** retrying a partially generated stream can duplicate cost and mix two different answers. Deliberate retry policy belongs in the later orchestrator.

## D-010 - Provider-Level Streaming Protocol

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** M2 uses direct provider streaming APIs behind one normalized NDJSON room event protocol.
- **Reason:** this preserves provider diversity while keeping the client independent of vendor-specific SSE formats and credentials.

## D-011 - Two-Tier Connection Secrets

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** workspace-managed keys remain server runtime secrets; user-entered BYOK credentials may be held only in current-page memory and sent to the same-origin meeting endpoint for immediate use until authenticated encrypted storage exists.
- **Reason:** users need in-product connection setup, but pretending to persist secrets without identity, encryption, revocation, and ownership boundaries would create a larger security failure. Session credentials are never written to browser storage, URLs, logs, transcripts, or API responses.

## D-012 - Connection, Model, Role, Skill, and Seat Are Separate

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** a Connection owns credentials and provider settings; a Model is an engine available through a connection; a Role defines responsibility; a Skill defines a work method; and a Seat combines them for one room.
- **Reason:** this supports mixed providers, repeated providers, model comparison, reusable expert presets, and future local or OpenAI-compatible endpoints without binding product behavior to vendor names.

## D-013 - Bounded Agent Adaptation

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** an agent may update its working position, assumptions, confidence, and unresolved questions inside a room, but cannot silently rewrite its durable role, skills, or cross-room memory.
- **Reason:** useful deliberation requires changing a view when criticism is valid; durable self-modification without human review creates drift, contamination, and an unauditable source of behavior.

## D-014 - Stage-Focused Meeting Interface

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** the primary interface follows Setup, Agenda, Meeting, and Decision stages. Configuration and project history are hidden after use, live speech owns the main visual focus, and full transcripts remain available as a compact overview.
- **Reason:** the product should direct attention like a real chaired meeting instead of making users scroll through every control and artifact at once.

## D-015 - Named Backup Before Major Interface Rework

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** create a named Git backup tag before any major interface rewrite and record it in the development log.
- **Reason:** frontend exploration is iterative; a clear restoration point protects validated behavior without freezing experimentation.
