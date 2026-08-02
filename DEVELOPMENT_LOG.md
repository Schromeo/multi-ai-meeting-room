# Multi-AI Meeting Room Development Log

This log is the source of truth for product stage, milestones, validation, and future direction.

## Current Stage

**Stage 1: Interactive concept prototype**

The current product validates the meeting-room interaction model: a human host chooses an agenda, selects specialist roles, runs bounded discussion rounds, challenges assumptions, and produces a decision artifact.

Current limits:

- Agent responses are simulated with local templates.
- No OpenAI, Anthropic, or Google model APIs are connected.
- Rooms, transcripts, and artifacts are not persisted.
- There is no evidence retrieval, claim verification, or automated evaluation yet.
- Coding agents cannot currently inspect or modify a real project.

## Milestones

### M0 - Opportunity and product thesis - Complete

- Identified the gap between multi-model comparison and structured multi-AI deliberation.
- Defined the human as meeting chair, with AI participants assigned explicit mandates.
- Chose product strategy and planning as the first wedge.

### M1 - Meeting-room interaction prototype - Complete

- Built agenda input, selectable agent seats, and bounded rounds.
- Added Brainstorm, Review, and Decision modes.
- Added assumption, risk, and decision artifacts.
- Published a private interactive prototype.

### M1.1 - Development log and product truth - Complete

- Made the current capabilities and limitations explicit.
- Added a milestone history and a repeatable development loop.
- Registered the coding-agent harness as an active product hypothesis.

### M2 - Real model roundtable - Next

- Add provider adapters for OpenAI, Anthropic, and Google models.
- Stream independent responses into one shared room context.
- Let each participant cite, challenge, or revise specific claims from earlier turns.
- Add token, latency, and cost controls for every round.

### M3 - Deliberation harness - Planned

- Introduce a chair/orchestrator that chooses who speaks and when a round ends.
- Separate proposal, critique, verification, revision, and synthesis phases.
- Track unresolved disagreements instead of hiding them inside consensus summaries.
- Evaluate whether another round adds information before spending more context and cost.

### M4 - Engineering execution room - Planned

- Connect execution-capable agents such as Codex or Claude Code to an isolated project workspace.
- Turn decisions into specs, implementation tasks, patches, tests, and review findings.
- Require reviewer approval and passing checks before changes can advance.
- Preserve provenance: who proposed, who changed, who reviewed, and what evidence closed the issue.

### M5 - Durable product system - Planned

- Persist rooms, transcripts, artifacts, evaluations, and reusable role templates.
- Add project context, source retrieval, permissions, budgets, and audit history.
- Measure decision quality, defect discovery, human intervention, time, and cost against a single-model baseline.

## Active Product Hypothesis

A base model becomes substantially more useful when it operates inside a bounded engineering harness. Multiple models can propose, critique, test, and revise; execution agents such as Codex or Claude Code can then apply approved decisions to a real codebase. The product opportunity is not merely autonomous coding. It is a human-chaired control system that makes model disagreement, evidence, implementation, and review observable.

This hypothesis is not yet validated. Multi-agent activity can also create duplicated work, shared blind spots, review theater, higher cost, and unclear responsibility. M3 and M4 must therefore be evaluated against measurable outcomes rather than the number of agent messages.

## Development Loop

Every product round should follow the same loop:

1. **Hypothesis** - State the user problem, expected behavior, and success measure.
2. **Build** - Implement the smallest end-to-end capability that tests it.
3. **Critique** - Run specialist review for product, technical, evidence, and failure-mode gaps.
4. **Human decision** - Accept, revise, or reject recommendations; assign an explicit owner.
5. **Evaluation** - Test quality, latency, cost, disagreement resolution, and user usefulness.
6. **Log** - Record what changed, what was learned, open risks, and the next milestone.

## Next Decision Gate

Before building broad autonomy, validate one real workflow end to end:

> A user submits a product or engineering question. Three real models independently propose and critique. A chair surfaces disagreements and produces an approved plan. One coding agent implements a bounded change. Another model reviews it. Tests and the human decide whether the task is complete.

Success means the room finds meaningful issues or produces a better verified result than a single strong model, at an acceptable time and cost.

## Log Entries

### 2026-08-01 - v0.1

- Shipped the first interactive meeting-room prototype.
- Confirmed that all current AI messages are simulated.
- Added this development log and defined the real-model and engineering-harness roadmap.
- Next discussion: define the narrowest M2-to-M4 experiment and its evaluation criteria.
