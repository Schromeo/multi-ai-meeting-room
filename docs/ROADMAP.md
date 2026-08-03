# Roadmap

Statuses: `Complete`, `Current`, `Planned`, `Deferred`.

## M0 - Opportunity and Product Thesis - Complete

**Outcome:** distinguish structured, human-chaired deliberation from side-by-side model comparison.

**Exit criteria met:** product thesis, first use case, role model, and human authority were defined.

## M1 - Interaction Prototype - Complete

**Outcome:** validate the room metaphor with agenda input, selectable roles, bounded modes, critique controls, and decision artifacts.

**Known limitation:** all agent messages are simulated.

## M1.1 - Visible Development Log - Complete

**Outcome:** expose current product truth, milestones, development loop, and the engineering-harness hypothesis.

## M1.2 - Project Continuity System - Complete

**Outcome:** add project charter, AI handoff, roadmap, decision record, bilingual development log, and repository-level agent instructions.

## M2 - Real Discuss Room - Current

**Deliverables:**

- provider-neutral model adapter interface;
- two or three real providers or models;
- streamed independent proposals;
- assigned cross-review;
- bounded extra round;
- decision memo containing unresolved dissent;
- per-room token, latency, and estimated-cost reporting.

**Exit criteria:** one objective can complete the full Discuss protocol without simulated agent text, duplicate calls, or manual database repair.

**Implementation progress:** all listed product and protocol surfaces are implemented and covered by a mocked end-to-end stream test. Remaining exit work is production secret configuration and at least one live two-provider evaluation.

## M2.5 - Durable Rooms - Planned

**Deliverables:** room persistence, transcript recovery, artifacts, event history, and export.

**Exit criteria:** a room can be resumed after a new browser session with its audit history intact.

## M3 - Audit Ledger - Planned

**Deliverables:** Claim, Evidence, Dispute, Decision, Action, Artifact, and Evaluation records.

**Exit criteria:** a user can trace a final decision back to its supporting claims, objections, revisions, and human approval.

## M3.5 - Research Room - Planned

**Deliverables:** search/retrieval adapter, source capture, claim verification queue, citation display, and freshness metadata.

**Exit criteria:** critical factual claims are marked supported, contradicted, or unresolved with inspectable sources.

## M4 - Harness Orchestrator - Planned

**Deliverables:** explicit room state machine, context isolation, budgets, stop rules, duplicate-call protection, and evaluation hooks.

**Exit criteria:** the orchestrator terminates predictably and every extra round is attributable to a named unresolved issue.

## M4.5 - Execute Room - Planned

**Deliverables:** local execution connector first, scoped permissions, approval gate, coding-agent adapter, independent review, and deterministic checks.

**Exit criteria:** an approved bounded task produces a patch and review result without granting the web control plane unrestricted workspace access.

## M5 - Evaluation and Hardening - Planned

**Deliverables:** single-model baseline, outcome rubric, regression scenarios, cost/latency dashboard, failure taxonomy, and recovery paths.

**Exit criteria:** the project can demonstrate where multi-agent deliberation helps, where it does not, and what it costs.

## Deferred Until Evidence Supports Them

Multi-user collaboration, billing, model marketplace, mobile clients, unattended autonomy, broad external integrations, and cloud execution infrastructure.
