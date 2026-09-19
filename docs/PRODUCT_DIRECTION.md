# Product Direction

Status: Approved
Date: 2026-09-18

## Why This Direction Exists

The project began with a simple observation: one model often commits early to a plausible path, while a second independently prompted model can expose missing constraints, unsupported claims, and better alternatives. The product should turn that manual copy-review-copy workflow into a bounded, inspectable collaboration that can serve both ordinary conversation and consequential work.

The v0.3 through v0.10c work established a credible engineering foundation: real provider adapters, session BYOK, reusable Seats, streaming, local persistence, structured Meeting State, human checkpoints, budgets, interruption recovery, an optional Observer, and Dispute-targeted debate. That work is useful, but infrastructure maturity has moved ahead of evidence that the user receives a materially better result.

The 2026-08-25 correction was not a rewrite: it stopped infrastructure-first expansion and forced the existing foundation to produce user-visible artifacts. The 2026-09-18 owner decision keeps that discipline but clarifies the larger product boundary. Review is the first trust Pack, not the whole product. The daily entry is a lighter **Ask the Room** escalation from an ordinary answer, idea, choice, or artifact.

## North Star

> When one answer is not enough, ask the room. Preserve useful differences, let the human direct them, and turn them into a better conversation, artifact, decision, or verified action.

The product is not a model switcher, a side-by-side answer grid, a professional-only audit tool, or an autonomous organization. Its durable value is the improvement chain:

> Objective -> Sources -> Artifact -> Finding -> Objection -> Change -> Verification -> Human Decision

## Product Shape

This remains one product. Task modes define the job being done; permission levels define what tools the room may use.

### Interaction Depths

- **Solo:** one model and ordinary conversation for the lowest-friction answer.
- **Quick Council:** **Ask the Room** adds one or two independently prompted challengers and returns a compact Difference Map.
- **Deep Council:** bounded cross-review, one Chair checkpoint, and only a named targeted follow-up when another call has expected information gain.
- **Task Pack:** a job-specific truth mode, role composition, context policy, state, artifact, Human Gate, budget, and rubric.

Depth is progressive. A user may promote selected context from an answer to a Council or Pack without replaying the entire transcript or restarting the task.

### Task Modes

- **Review:** inspect and revise an existing artifact against an objective and supplied sources.
- **Decide / Plan:** compare paths or produce an executable plan with risks, conditions, and checkpoints.
- **Explore:** expand the possibility space before convergence, including brainstorming and reflective entertainment templates.
- **Create:** maintain a coherent long-form artifact through authoring, editorial review, and versioned revision.
- **Play:** run rule-bound simulations or games with public and private Seat state. This is an experimental future Pack, not a current product priority.

### Permission Levels

- **Discuss:** reason only over supplied context and persisted room artifacts.
- **Research:** retrieve sources, capture freshness, and classify claims as supported, contradicted, inferred, outdated, or unresolved.
- **Execute:** use approved tools in an isolated execution plane and verify resulting state changes.

Task mode and permission level are orthogonal. A Review may be Discuss-only or Research-enabled; a Create task may use Research; Play may use deterministic tools without granting general workspace authority.

## Shared Core And Task Packs

Development is product-line driven. A small shared core supports multiple vertical Task Packs.

### Shared Core

- provider, model, Connection, Role, Skill, and Seat composition;
- streaming and validated turn presentation;
- room, event, state, artifact, version, and usage persistence;
- budget, stop, interruption, idempotency, and human-approval boundaries;
- context policies and source lineage;
- protocol runtime and permission enforcement.

### Task Pack

Each Pack owns its agenda schema, recommended Role Pack, phase protocol, state additions, context policy, artifact type, Human Gate, and evaluation rubric. A Task Pack does not duplicate provider access, persistence, billing boundaries, or room history.

Use the **Rule of Two**: an abstraction moves into Shared Core only after at least two validated Task Packs need it. Pack-specific needs remain local until then.

## Product Entry And First Trust Pack

**Ask the Room** is the narrow daily-use entry. It tests whether ordinary users deliberately seek and reuse an independent second perspective without paying the interaction cost of a full meeting. The existing answer is view one; Challengers remain independent until the Difference Map.

Review remains the first complete trust Pack because it directly tests the differentiated hypothesis and produces an outcome that can be compared with a single strong model. Review evidence and artifact machinery are preserved; the Pack no longer defines the whole audience or home experience.

The first Review workflow is:

1. The human supplies an objective, an Artifact v1, reference material, and truth constraints.
2. Two or three task-adaptive reviewers inspect it independently.
3. The system clusters duplicate Findings while preserving material conflicts.
4. Only a named high-impact issue receives bounded cross-review or targeted debate.
5. A designated Editor produces a structured Change Set and Artifact v2.
6. An independent reviewer verifies changed material against the objective, sources, and truth constraints.
7. The human accepts, rejects, or edits changes individually before approving an immutable version.
8. The room publishes a concise brief, a detailed artifact, the accepted Change Set, unresolved issues, and usage.

Initial benchmarks are a resume against a job description, a product or requirements document, and a technical plan. The resume is a useful benchmark, not the permanent market boundary.

## What Comes Next

The approved forward sequence is defined in [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md):

1. **DP-0:** align product and repository truth, first-run information architecture, credential-free demo, export, engineering portability, and public API safety.
2. **DP-1:** build and evaluate Quick Council / Ask the Room as the daily-use wedge.
3. **DP-2:** finish bounded Review evidence and retain, simplify, or remove protocol pieces according to matched comparisons.
4. **DP-3:** consolidate a Pack contract only from the two validated consumers, then prove it with one internal third-Pack spike.
5. **DP-4:** add Explore and Create, with one clearly labelled reflective-entertainment Lab.
6. **DP-5:** add Research and uncertainty-aware company or financial scenario work with dated sources.
7. **DP-6:** promote Play only after one deterministic, privacy-safe, replayable game passes.
8. **DP-7:** add a read-only Project Room for Codex and VS Code context and prompt review.
9. **DP-8:** add controlled Execute only after read-only project evidence, isolated authority, independent review, deterministic checks, and rollback exist.
10. **DP-9:** add identity, sync, billing, collaboration, and curated distribution only for capabilities with repeat-use evidence.

The historical `M0` through `M5` roadmap remains an implementation and evidence ledger. It does not override this forward sequence.

## Multi-Agent Boundary

Multiple model Seats are not automatically autonomous agents. Add multi-agent behavior only when a task can be decomposed into independently useful subtasks, participants need distinct tools or private contexts, outputs have a merge contract, and results can be verified.

Review uses bounded model roles and deterministic orchestration first. Research may add a Lead Researcher, parallel Search Workers, and a Citation Checker. Execute may add Planner, Executor, Reviewer, and Tester roles in isolated workspaces. No general autonomous-agent platform is a prerequisite for the current product.

## Direction Checks

The required operating procedure for these checks is [Development Correction Loop](DEVELOPMENT_CORRECTION_LOOP.md). Every implementation slice must identify its observed failure, user artifact, baseline, smallest hypothesis, expected information gain, acceptance checks, cost boundary, and stop condition before code work expands.

Every completed product milestone must answer:

1. Which real user problem did this change solve?
2. What usable artifact or decision did the user receive?
3. Could one strong model have produced the same result with less effort?
4. Which material findings came specifically from independent cross-review?
5. What cost, latency, reading burden, and complexity were added?
6. What should be removed or simplified if the evidence is weak?

Hard development rules:

- Do not run two consecutive infrastructure-only milestones.
- Every product milestone ends with at least one realistic case and a saved baseline.
- Every new paid model call names its expected information gain before implementation.
- Do not create a shared abstraction with only one validated consumer.
- Do not broaden autonomy, permissions, model count, or rounds without a named use case and Human Gate.
- A polished transcript or reliable state machine is not evidence of a better user outcome.
- If a protocol passes mechanically but its artifact fails, the next work targets the artifact contract or task responsibility split, not generic orchestration polish.

## Success Evidence

The broad product needs two kinds of evidence. **Habit evidence** asks whether users deliberately invoke and reuse independent perspectives for ordinary or enjoyable tasks. **Trust evidence** asks whether structured challenge produces important accepted improvements that a strong single model missed. Both must keep cost, latency, and human reading effort acceptable.

Track at minimum:

- accepted high-impact changes unique to cross-review;
- false, unsupported, or rejected findings;
- artifact quality against a task-specific rubric;
- time and human edits required to reach an adopted result;
- calls, tokens, latency, and advisory cost;
- failures caused by coordination, context loss, homogenization, or model agreement without evidence.
- Ask the Room invocation, second-task reuse, and user-kept unique perspectives;
- saved, exported, or shared results and abandonment caused by reading burden;
- Pack reuse without speculative Shared Core growth;
- permission, privacy, rule, or context-boundary failures in Research, Play, Project, and Execute modes.

Features that do not improve this evidence are simplified, made optional, or removed.

## Explicit Deferrals

Defer a public Pack marketplace, arbitrary remote Pack code, broad custom endpoints, automatic paid Observer defaults, semantic routing or embedding infrastructure without a named consumer, general game engines before one game passes, unrestricted long-term memory, account collaboration before ownership rules, automatic financial action, and unrestricted execution. Labs may explore astrology, games, and coding-context critique, but they do not enter Shared Core or claim product status until their promotion gate passes.
