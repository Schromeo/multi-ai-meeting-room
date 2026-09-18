# Model and Agent Blueprint

Meeting orchestration, structured state, context selection, budgets, persistence, and follow-up behavior are defined in [MEETING_PROTOCOL_BLUEPRINT.md](MEETING_PROTOCOL_BLUEPRINT.md). This document remains canonical for how connections, models, roles, skills, and seats compose.

## Product Principle

The room orchestrates accountable perspectives, not vendor logos. Provider access, model engines, expert behavior, and meeting state must remain separate so the protocol can evolve without becoming a model marketplace.

Task Packs compose these objects for a specific user job. Review, Decide / Plan, Explore, Create, and future Play may recommend different Role Packs and protocols without changing Connection or Model ownership.

### Current Plan Diagnostics (D-057)

Initial Builder/reviewer adapters retain bounded terminal/usage metadata, not response text or private reasoning. OpenAI completion/incomplete events and reported reasoning-token details follow the [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning); Anthropic terminal classification follows its [stop-reason documentation](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons). Unreported fields stay unknown. A transport or missing-terminal failure cannot become a completed Plan review. Diagnostic metadata remains outside Plan prompts and is not a provider invoice, a new ledger, or proof that011 exhausted its allowance. Model choices and output caps are unchanged in this slice; see [Plan Issue Register](PLAN_ISSUE_REGISTER.md).

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

### Task Pack

Defines an agenda schema, recommended Role Pack, protocol phases, context policy, artifact type, Human Gate, and evaluation rubric for one product line. Task Packs reuse the Shared Core and follow the Rule of Two in [Product Direction](PRODUCT_DIRECTION.md).

## Multi-Agent Boundary

A Seat with a Role is not automatically an autonomous agent. Agent behavior additionally requires task ownership, independent state or context, tools or actions, a bounded loop, and a verifiable completion condition. Add it only when decomposition creates concrete value. Review and Decide use deterministic orchestration first; parallel research and isolated execution are the first planned multi-agent candidates.

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

Task Packs may rename or replace Meeting and Decision surfaces when the artifact requires it. Review foregrounds Findings, Change Set, Artifact versions, and item-level acceptance; Create foregrounds the current section and editorial changes; Play eventually requires public and private state. Setup remains quiet after connections are usable.

## Implemented Plan Quality Profile (D-055)

The current Plan Pack uses task-shaped curriculum, feasibility and critique mandates instead of relying only on generic role names. Builder produces the full daily artifact; Reviewer checks actual days; the explicit Editor action changes selected concern days; a different Seat rechecks both the criticism and remedy. These remain bounded roles, not autonomous agents. The chosen provider/model is never silently replaced.

Under D-058, structured Builder calls use `low` effort for `gpt-5`, `gpt-5-mini`, `gpt-5-nano` and their dated snapshots in the existing capability matcher. Actual Plan reviewer, amendment and recheck retain `medium`; ordinary discussion remains `minimal`. Other OpenAI IDs and Anthropic/Gemini retain provider defaults, with no promise of equivalent or enabled deep reasoning. Requested setting is diagnostic evidence, not observed internal behavior. There is no general configuration UI.

Output caps: Builder16K total, Reviewer6K, explicit Amendment12K and Recheck6K. D-056 removes the application deadline for these Plan calls and the cumulative Plan-time cutoff; ordinary discussion retains90s. Manual cancellation, token/call bounds and no automatic retry remain. Provider/transport/host limits are separate. Builder recovery remains missing-days-only. The separate amendment allowance is disclosed before the human starts it. These are ceilings, not usage targets or guaranteed visible output. OpenAI reasoning shares the output budget; incomplete Plan responses preserve reported usage. The official [GPT-5 model page](https://developers.openai.com/api/docs/models/gpt-5) documents its supported minimal/low/medium/high settings. Anthropic/Gemini thinking controls vary by model, so this slice does not infer them.

Gemini output accounting includes `candidatesTokenCount` plus `thoughtsTokenCount`; thought parts are not treated as artifact JSON. See [Gemini thinking usage](https://ai.google.dev/gemini-api/docs/generate-content/thinking#pricing). Application estimates still use existing provider-wide rates, not authoritative model invoices. Select higher-capability models only for a named quality question; no paid test has been authorized by implementing this profile.

Under D-060, the initial actual-artifact Plan Reviewer passes a narrow JSON Schema to explicitly supported Anthropic model families, including Fable 5. Unsupported IDs omit `output_config`; no `thinking` field is inferred. Provider structure controls transport shape only. Existing local Plan validators still enforce request-specific semantic bounds, and format or semantic failure never retries automatically. This capability is not yet generalized to Builder, amendment, recheck, ordinary Turn Envelopes, OpenAI, or Gemini.

## Deferred Expansion

No arbitrary endpoint marketplace, generic autonomous-agent platform, autonomous persona mutation, hidden long-term memory, provider-diversity score presented as truth, or unrestricted agent execution.
