# Development Correction Loop

Status: Required
Date: 2026-08-27

## Purpose

This document prevents reliable engineering from drifting away from useful product outcomes. The project must not treat a completed protocol, a passing parser, a polished transcript, or a larger model response as proof that the user received a better result.

Every implementation milestone, paid evaluation, and material recovery attempt must pass this correction loop. When evidence contradicts the current design, the next change targets the smallest demonstrated cause instead of adding rounds, agents, output tokens, UI, or generic infrastructure.

## Current Diagnosis

The audit below records the earlier failure baseline, not a request to restart completed work. Current Plan evidence and per-item status live in the [Plan Issue Register](PLAN_ISSUE_REGISTER.md); consult it and the latest Devlog before every correction slice.

The current application is becoming a reliable meeting control plane, but it is not yet a reliable task-delivery system. Recent Review and Decide / Plan runs show three primary causes:

1. The generic Discuss protocol is being asked to perform Task Pack work that needs a task-specific artifact, roles, phases, context policy, Human Gate, and rubric.
2. Participants produce concise opinions rather than independently useful artifact material, so one final Synthesizer must invent most of the deliverable alone.
3. Complex deliverables are generated as one free-form response and validated only after the paid call, making omissions expensive and recovery coarse.

### Product and protocol failures

- Review and Plan are still partially expressed through the generic proposal, cross-review, and memo sequence.
- Plan M2.13 has not started; the current Plan path is entry evidence, not a completed Plan Task Pack.
- Compact Canonical Meeting State is suitable for claims and disputes, not dozens of detailed artifact records.
- A shared recovery allowance can be consumed by an earlier formatting failure and leave the final artifact without targeted recovery.
- The Human Gate cannot yet edit, lock, or repair individual Plan units without reopening broader deliberation.
- Fixed full-participation phases add cost even when only one named issue needs another perspective.

### Prompt and contract failures

- Proposal and review turns are deliberately short, but the final Synthesizer is expected to construct a large detailed artifact from those summaries.
- Generic role prompts do not distribute artifact sections or records among participants.
- Review instructions that prohibit new named examples are appropriate for unsupported factual claims but can suppress the concrete examples required by a planning artifact.
- One synthesis request currently combines planning, content selection, arithmetic, completeness, Markdown structure, and JSON escaping.
- Free-form output is checked after generation by presence-oriented validators; those checks cannot prove factual correctness, arithmetic correctness, or pedagogical quality.
- Larger output caps did not solve missing content. Smoke 007 ended below the cap and still omitted Day 2.
- Language adherence, completeness, and pre-submit self-checks remain largely prompt-only.

### Role and model failures

- Generic Strategist, Critic, Technical Lead, and Synthesizer roles do not guarantee task-shaped coverage.
- Reusing an author model as Synthesizer creates anchoring and weakens independent judgment.
- Provider or model diversity does not guarantee epistemic diversity; multiple models have repeated the same false date inference and missed the same explicit metric constraint.
- A model that follows a small isolated schema may fail the same contract inside a long full-room context.
- Model discovery does not prove support for optional reasoning or thinking parameters.
- More reasoning is not a structural-output guarantee. It may improve semantic tradeoffs while increasing cost and latency.
- No controlled matrix yet compares a strong single model, the current multi-model flow, a stronger final Artifact Builder, and phase-specific reasoning settings.

### Engineering and experience failures

- Validation often occurs only after a provider has generated and charged for an unusable artifact.
- Failed raw candidates and field-level diagnostics are not consistently retained for precise repair.
- Transcript, Canonical State, and restored phase context have previously diverged or shown abandoned duplicate cards.
- Switching rooms, refreshing, or losing session credentials can interrupt paid work at boundaries the page does not fully own.
- Raw streamed JSON is hostile to readers, while fully buffered output can leave the user staring at an unexplained pause.
- A mechanically complete two-line Review still incurred meaningful fixed call and context overhead.
- Advisory application cost is useful for budgeting but is not an authoritative provider invoice.

### Evaluation mistakes to avoid repeating

- Do not rerun an entire room to diagnose one failed substage when a fixed Stage Replay can isolate it.
- Do not change the objective, artifact contract, output cap, model, and validator in the same comparison.
- Do not increase output caps before proving truncation caused the failure.
- Do not run a full benchmark without a saved golden artifact, task rubric, and single-model baseline.
- Do not call a protocol mechanically successful artifact evidence.
- Do not claim multi-model value without identifying accepted improvements that the baseline missed.
- Do not optimize cost around a workflow whose user artifact still fails.

## Required Correction Brief

Before implementation begins, record these answers in the active milestone, issue, evaluation note, or development update:

1. **Observed failure:** what real user or saved fixture failed, and at which stage?
2. **User artifact:** what exact adoptable result should the user receive?
3. **Baseline:** what would one strong model or the current saved version produce?
4. **Smallest hypothesis:** what single cause is this change testing?
5. **Expected information gain:** why is each new paid call or model role necessary?
6. **Acceptance checks:** which deterministic and human rubric checks define success?
7. **Cost boundary:** what calls, tokens, latency, dollars, and reading effort are permitted?
8. **Stop condition:** what result ends, reverts, simplifies, or redirects this branch?

If these answers are unavailable, the next action is a documentation, fixture, or baseline step, not implementation expansion.

## Development Gates

### Gate 0 - Purpose

- Name the current Task Pack and milestone.
- Link the change to one observed user failure.
- Reject work that only improves generic infrastructure without a named consumer.

### Gate 1 - Artifact

- Define the artifact schema and user acceptance rubric before prompt tuning.
- Separate compact model working state from the detailed user deliverable.
- Prefer addressable records over one free-form response when units can fail independently.

### Gate 2 - Responsibility

- Assign each model a unique, inspectable contribution to the artifact or its verification.
- Keep deterministic formatting, counting, arithmetic, and state mutation in application code.
- Use a stronger or independent model only where semantic judgment justifies it.

### Gate 3 - Local Evidence

- Add deterministic fixtures and validators first.
- Test missing, duplicated, malformed, unsupported, and partial artifact units.
- Preserve valid completed substages with durable receipts.

### Gate 4 - Paid Evidence

- Follow the ladder: local test -> one-stage replay -> short synthetic smoke -> realistic benchmark.
- Do not retry unchanged failed input.
- Compare one variable at a time and retain raw failure diagnostics.

### Gate 5 - Product Result

Score these dimensions separately:

- mechanical completion;
- semantic or factual reliability;
- artifact completeness and usability;
- Human Gate editability and adoption;
- latency, cost, and reading burden;
- improvements unique to cross-review over the baseline.

A pass in one dimension never implies a pass in another.

### Gate 6 - Direction Decision

At milestone close, explicitly choose one:

- **Continue:** evidence supports the next bounded slice.
- **Repair:** one isolated failure has a named fix and test.
- **Simplify:** multi-model or protocol overhead did not justify itself.
- **Remove:** the feature adds no accepted user value.
- **Defer:** the need is plausible but not on the current critical path.

Update the Development Log, Roadmap status, Decision Record when durable, AI Handoff, and Chinese mirrors before declaring the milestone complete.

## Approved Recovery Path

1. Freeze new generic orchestrator features and further full paid Plan reruns.
2. Finish only the M2.11 Review adoption path needed for evaluation: Verifier v2 evidence, item-level Change editing, immutable approval, and saved baselines. Do not polish unrelated Review infrastructure.
3. Run the M2.12 Review comparison and decide which existing protocol pieces earn reuse.
4. Begin M2.13 with a golden constrained-plan fixture and rubric, then define a structured, day-addressable `PlanArtifact` before changing prompts.
5. Give Plan task-shaped roles independently useful responsibilities; use a separate Artifact Builder and semantic Auditor rather than asking short generic turns to support one heroic synthesis.
6. Add deterministic completeness, workload, identity, and arithmetic checks; use an authoritative problem catalog when concrete LeetCode metadata matters.
7. Persist valid Plan units and repair only missing or invalid units with stage-specific recovery budgets.
8. After the structure works locally, compare a strong single-model baseline, a stronger final builder, the bounded multi-model flow, and phase-specific reasoning settings.
9. Improve progress presentation only after the artifact pipeline is reliable: show stage, target, elapsed state, and completed artifact units without streaming raw JSON.

The next code change must advance one item in this path and name its exit criterion. It must not attempt to solve all recorded concerns at once.
