# Agent Instructions

This repository is the Multi-AI Meeting Room project. Before planning or changing anything, read these files in order:

1. `docs/PROJECT_CHARTER.md`
2. `docs/PRODUCT_DIRECTION.md`
3. `docs/DEVELOPMENT_CORRECTION_LOOP.md`
4. `docs/AI_HANDOFF.md`
5. `docs/DECISIONS.md`
6. `docs/ROADMAP.md`
7. `docs/MEETING_PROTOCOL_BLUEPRINT.md`
8. `docs/MODEL_AND_AGENT_BLUEPRINT.md`
9. The latest entries in `docs/DEVLOG.md`

Chinese quick-read mirrors live in `docs/zh-CN/`. English files are canonical if the two versions disagree, but any material documentation change must update both languages in the same change.

Do not restart completed milestones, silently expand scope, run unbounded agent loops, or repeat an unchanged failed call. Human approval is required before any Execute-mode action that modifies an external workspace, repository, account, or service.

Before implementation, write or identify the active Correction Brief required by `docs/DEVELOPMENT_CORRECTION_LOOP.md`: observed failure, user artifact, baseline, smallest hypothesis, expected information gain, acceptance checks, cost boundary, and stop condition. If those are not known, the next step is documentation, a fixture, or a baseline rather than broader implementation.

At the end of a completed milestone, update `docs/DEVLOG.md`, `docs/ROADMAP.md` when status changed, `docs/DECISIONS.md` when a durable choice was made, and their Chinese mirrors.
