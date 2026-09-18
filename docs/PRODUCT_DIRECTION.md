# Product Direction

Status: Approved
Date: 2026-08-25

## Why This Direction Exists

The project began with a simple observation: one model often commits early to a plausible path, while a second independently prompted model can expose missing constraints, unsupported claims, and better alternatives. The product should turn that manual copy-review-copy workflow into a bounded, inspectable collaboration.

The v0.3 through v0.10c work established a credible engineering foundation: real provider adapters, session BYOK, reusable Seats, streaming, local persistence, structured Meeting State, human checkpoints, budgets, interruption recovery, an optional Observer, and Dispute-targeted debate. That work is useful, but infrastructure maturity has moved ahead of evidence that the user receives a materially better result.

The correction is not a rewrite. Stop expanding the generic orchestrator and use the existing foundation to complete a user-visible artifact workflow.

## North Star

> Give multiple independent AI perspectives one important problem or artifact, make them challenge consequential differences, and return one inspectable result that the human can revise and adopt.

The product is not a model switcher, a side-by-side answer grid, or an autonomous organization. Its durable value is the improvement chain:

> Objective -> Sources -> Artifact -> Finding -> Objection -> Change -> Verification -> Human Decision

## Product Shape

This remains one product. Task modes define the job being done; permission levels define what tools the room may use.

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

## First Product Line: Review

Review is the first complete vertical slice because it directly tests the differentiated hypothesis and produces an outcome that can be compared with a single strong model.

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

1. Preserve the current v0.10c recovery point and run one explicitly budgeted real-provider smoke evaluation of the implemented Observer plus targeted-debate path.
2. Build Review as the first end-to-end Task Pack. Do not expand Observer, semantic routing, generic agent autonomy, or broad UI infrastructure in the same slice.
3. Compare Review against a saved single-model baseline and manual multi-model copy/paste on the three benchmark tasks.
4. Build one Decide / Plan vertical slice and use it to test which Review abstractions genuinely belong in Shared Core.
5. Consolidate the proven Task Pack contract, Artifact versions, Role Packs, context policies, and evaluation rubrics.
6. Add Explore, then Create, only through bounded vertical slices.
7. Introduce the first true multi-agent workflow in Research when parallel source investigation provides a concrete advantage.
8. Introduce Execute only after Research and the Human Gate are reliable; keep planning, execution, independent review, and deterministic verification separate.
9. Treat Play as an optional future Pack requiring deterministic rules, private Seat state, and strict visibility boundaries.

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

The core hypothesis is supported only when structured multi-model review produces important accepted improvements that a single strong model missed, while cost, latency, and human reading effort remain acceptable.

Track at minimum:

- accepted high-impact changes unique to cross-review;
- false, unsupported, or rejected findings;
- artifact quality against a task-specific rubric;
- time and human edits required to reach an adopted result;
- calls, tokens, latency, and advisory cost;
- failures caused by coordination, context loss, homogenization, or model agreement without evidence.

Features that do not improve this evidence are simplified, made optional, or removed.

## Explicit Deferrals

Until Review and Decide / Plan demonstrate value, defer a generic multi-agent platform, model marketplace, broad custom endpoints, automatic paid Observer defaults, semantic routers, embedding infrastructure, general game engines, long-form creative memory, account collaboration, and unrestricted execution.
