# Model and Agent Blueprint

Meeting orchestration, structured state, context selection, budgets, persistence, and follow-up behavior are defined in [MEETING_PROTOCOL_BLUEPRINT.md](MEETING_PROTOCOL_BLUEPRINT.md). This document remains canonical for how connections, models, roles, skills, and seats compose.

## Product Principle

The room orchestrates accountable perspectives, not vendor logos. Provider access, model engines, expert behavior, and meeting state must remain separate so the protocol can evolve without becoming a model marketplace.

## Core Objects

### Connection

Owns provider type, credential reference, optional base URL, allowed models, billing owner, and capability metadata. Current connection types are OpenAI, Anthropic, and Gemini. OpenAI-compatible and local endpoints are deferred until network and secret boundaries are implemented.

### Model

Identifies an engine available through a Connection. Pricing and capabilities are metadata, not guarantees. The UI must not infer a free tier from possession of an API key.

### Role

Defines responsibility and decision lens, such as Strategist, Critical Reviewer, Product Lead, Technical Lead, Skeptic, or Synthesizer. Roles are provider-neutral and should describe obligations rather than theatrical personality.

### Skill

Defines a repeatable work method, such as assumption auditing, counterexample search, requirements decomposition, evidence classification, implementation planning, or decision synthesis. Skills may later include tools only when the room permission permits them.

### Seat

Combines one Connection, Model, Role, and set of Skills for a single room. Seat identity must not equal provider identity; this is required for multiple GPT seats or multiple models from one provider.

### Room

Owns the objective, seats, protocol, round and cost budgets, tool permission, transcript, artifacts, and human decision state.

## Diversity Must Be Described Precisely

The product will report provider, model, role, and skill diversity separately. Three seats using one GPT model can provide role diversity, but must not be presented as three independent model families.

## Bounded Adaptation

Each seat may maintain room-local working state:

- current recommendation;
- assumptions and unresolved questions;
- confidence and evidence status;
- accepted and rejected critiques;
- changes since the previous round and their reasons.

The immutable role constitution and skill definitions are never rewritten automatically. Cross-room memory is deferred until users can inspect, approve, delete, and scope every promoted learning.

## Connection Lifecycle

1. Current private evaluation uses workspace runtime secrets.
2. M2.1 adds session BYOK held only in page memory and cleared on refresh.
3. Durable BYOK requires user identity, encrypted storage, ownership checks, rotation, deletion, and secret-redacted observability.
4. Platform-paid credits and billing remain deferred.

## Interface Stages

- **Setup:** establish two usable connections and show billing ownership.
- **Agenda:** define the decision and compose seats without exposing secret controls.
- **Meeting:** foreground the current speaker, phase, target, and live stream; keep the transcript available as a compact overview.
- **Decision:** foreground the memo, unresolved dissent, usage, revision budget, and human approval.

## Near-Term Non-Goals

No arbitrary endpoint marketplace, autonomous persona mutation, hidden long-term memory, provider-diversity score presented as truth, or unrestricted agent execution.
