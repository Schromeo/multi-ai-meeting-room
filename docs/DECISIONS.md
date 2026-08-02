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
