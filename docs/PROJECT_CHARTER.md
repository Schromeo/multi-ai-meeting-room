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

## Product Principles

1. The human remains chair and final authority.
2. Roles are separate from model providers.
3. Independent proposals come before cross-review when diversity matters.
4. Disagreement is preserved until resolved, rejected, or explicitly accepted as uncertainty.
5. Consensus never substitutes for evidence.
6. Every round must change an artifact, resolve a dispute, or stop.
7. Tools operate with least privilege and explicit approval.
8. Quality, time, cost, and human effort are measured against a strong single-model baseline.

## Current Scope

The current prototype validates the room metaphor and interaction flow. The next goal is a real Discuss room with provider adapters, streaming responses, bounded rounds, cross-review, and a decision memo.

## Non-Goals For The First Complete Version

- Infinite or unattended autonomous agents.
- A marketplace containing every model and tool.
- Billing, enterprise administration, or broad multi-user collaboration.
- General-purpose automation before the room protocol is validated.
- Claims that multiple models automatically eliminate hallucinations.

## System Boundary

The web application is the control plane for rooms, policies, approvals, and audit records. Code execution and other privileged actions belong in a separate local connector or isolated cloud execution plane.

## Success Definition

The project succeeds when a bounded multi-agent room produces a more useful or better verified outcome than a single strong model at acceptable cost, latency, and human effort.
