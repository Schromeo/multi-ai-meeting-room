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

Product lines grow as bounded vertical Task Packs over a shared core. [Product Direction](PRODUCT_DIRECTION.md) is canonical for the current build order and direction checks.

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

The M2 implementation now contains a real Discuss protocol with provider adapters, streaming responses, bounded rounds, cross-review, a decision memo, a human decision gate, usage estimates, a credential-free IndexedDB Event Store, strict Turn Envelopes, deterministic Canonical Meeting State, and a persisted human-chaired resumable orchestrator. Auto, Checkpoints, and Turn-by-turn modes split provider work into explicit phase transitions; Chair Directives, Raise Hand, interruption recovery, duplicate-transition guards, backward-compatible Meeting Budgets, deterministic source-linked Process Reports, an explicit Observer, and Chair-selected Dispute-targeted rounds are implemented. A real OpenAI plus Anthropic meeting passed the pre-structured end-to-end path on 2026-08-04. After one bounded real-provider verification of the latest path, current work shifts to a Review Task Pack that produces a detailed versioned Artifact and accepted Change Set. Generic orchestration expansion is paused until product evidence requires it.

## Non-Goals For The First Complete Version

- Infinite or unattended autonomous agents.
- A marketplace containing every model and tool.
- Billing, enterprise administration, or broad multi-user collaboration.
- General-purpose automation before the room protocol is validated.
- Claims that multiple models automatically eliminate hallucinations.

## System Boundary

The web application is the control plane for rooms, policies, approvals, and audit records. Code execution and other privileged actions belong in a separate local connector or isolated cloud execution plane.

## Success Definition

The project succeeds when a bounded structured multi-model workflow produces important accepted improvements that a single strong model missed, at acceptable cost, latency, and human effort. Research and Execute later add true multi-agent work only where decomposition, tools, and verification justify it.
