# Artifact-first Plan Live 012 - Pre-provider Contract Failures

Date: 2026-08-29
Gate: Mechanical live path failed before a usable provider result
Artifact quality: Not run

## Authorized Configuration

- Fixed 12-day LeetCode case, 10 MEU per day, explicit 360-minute test assumption.
- Seat 1: OpenAI `gpt-5.6-sol`, Strategist / Plan Builder.
- Seat 2: Anthropic `claude-fable-5`, Critical Reviewer.
- Gemini connection present but unassigned; third Seat and Observer off.
- Setup preflight: `2 calls · 22K output · No cumulative time cutoff`.
- User ceiling: USD 1.00, at most two provider calls, no automatic retry.

## Observed Attempts

1. History 12 entered direct synthesis but `/api/discuss` retained the generic Decide prerequisite requiring two proposals and one cross-review. The request was rejected before `runPlanArtifactPhase` and before any provider call. No Plan was created.
2. After that gate was corrected and offline-tested, History 13 entered `runPlanArtifactPhase`. Its initial empty Plan checkpoint used Canonical State version 0, while the client Plan parser incorrectly required source version at least 1. The client aborted with `The Plan checkpoint does not match this room.` before saving an artifact or usage receipt. The server emits this checkpoint immediately before beginning the Builder request, so whether OpenAI started or billed the Sol request is unknown. Count it conservatively as a possible call; do not report zero or retry under the old cap.

No Fable review ran. No day record, model response, provider finish state or token usage was accepted. This is application-contract evidence, not a Sol/Fable quality evaluation.

## Corrections And Evidence

- Detailed Plan now creates an artifact-first protocol at `synthesis`, with only the selected Builder and Reviewer pending.
- Initial Plan budget is exactly two agent turns and 22,000 output tokens; generic proposals, cross-review and automatic retries are excluded.
- Generic synthesis-history prerequisites now apply only to non-Plan Decide synthesis.
- Plan artifacts accept source State version 0, matching a fresh artifact-first room; negative versions remain invalid.
- Build and 61 offline tests pass, including an empty-history Plan route that makes exactly two mocked provider calls and reaches a reviewed 12-day artifact. Lint passes. Full type checking still has only the three known Cloudflare declaration errors.

## Stop And Next Evidence

Stop without clicking `Build missing plan days`. A new live run can make up to two further provider calls, so it requires refreshed cost/call authorization because one Sol call from History 13 may have started. Reconnect session-only keys after the final hot reload, rerun once, then archive exact accepted days, review, diagnostics and provider-reported usage. No unchanged retry.
