# Project Charter

## Mission

Build a human-chaired, auditable multi-AI workspace that turns model diversity into better decisions and, when explicitly authorized, verified actions.

## Product Promise

The product should make this progression observable:

> Objective -> Claim -> Evidence -> Objection -> Revision -> Decision -> Action -> Result

The durable value is not the transcript or the number of models. It is a decision or result whose reasoning, disagreement, approval, and verification can be inspected.

## Capability Levels

- **Discuss**: participants may propose, critique, revise, and synthesize.
- **Research**: Discuss capabilities plus retrieval, citations, and claim verification.
- **Execute**: Research capabilities plus permissioned tool use in an isolated execution environment.

These are permission levels inside one product, not separate products.

## Task Modes

Review, Decide / Plan, Explore, Create, and future Play Packs define the job being done. They are separate from permission levels: for example, a Review may run in Discuss or Research, while Execute adds authority without becoming a separate product.

Interaction depth progresses from Solo to Quick Council / **Ask the Room**, Deep Council, and task-shaped Packs. Product lines grow as bounded vertical Task Packs over a shared core. [Product Direction](PRODUCT_DIRECTION.md) defines the approved strategy and [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md) is canonical for the current build order.

## Product Principles

1. The human remains chair and final authority.
2. Roles are separate from model providers.
3. Independent proposals come before cross-review when diversity matters.
4. Disagreement is preserved until resolved, rejected, or explicitly accepted as uncertainty.
5. Consensus never substitutes for evidence.
6. Every round must change an artifact, resolve a dispute, or stop.
7. Tools operate with least privilege and explicit approval.
8. Quality, time, cost, and human effort are measured against a strong single-model baseline.
9. Product evidence leads shared abstractions; infrastructure does not expand without a named vertical use case.

## Current Scope

The implemented foundation contains real provider adapters, session BYOK, composable Seats, bounded streaming, cross-review, Human Gates, usage estimates, a credential-free IndexedDB Event Store, strict Turn Envelopes, deterministic Canonical Meeting State, resumable orchestration, budgets, interruption recovery, an Observer, targeted dispute rounds, Review artifact versions, and a structured Plan path. Review and Plan evidence remains incomplete and is preserved. Under D-064, current forward work is DP-0 product truth and first-minute experience, followed by Quick Council / Ask the Room and bounded Review evidence. Generic orchestration expansion remains paused until a named Pack proves the need.

## Non-Goals For The First Complete Version

- Infinite or unattended autonomous agents.
- A marketplace containing every model and tool.
- Billing, enterprise administration, or broad multi-user collaboration.
- General-purpose automation before the room protocol is validated.
- Claims that multiple models automatically eliminate hallucinations.

## System Boundary

The web application is the control plane for rooms, policies, approvals, and audit records. Code execution and other privileged actions belong in a separate local connector or isolated cloud execution plane.

## Success Definition

The project succeeds when users repeatedly choose independent AI perspectives for ordinary or enjoyable work, and when consequential Task Packs produce important accepted improvements that a single strong model missed, at acceptable cost, latency, and human effort. Research, Play, Project Rooms, and Execute add specialized state, tools, or authority only where their own verification justifies it.
