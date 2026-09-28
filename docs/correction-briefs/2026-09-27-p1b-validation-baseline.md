# P1B — Restore the validation baseline

Status: Locally validated, 2026-09-27. Owner continuation after P1 authorizes this bounded
baseline correction alongside DP-0.3, not P2 or completion of DP-0.3.

- Observed: Solo fixture returns 502 instead of 200; generated typecheck reports
  41 errors. Both predate P1. Preserve all uncommitted P1 code/docs.
- Artifact: an honest passing local canonical check for the selected MAMR testbed.
- Baseline: default Solo cap is 1200, but the mock asserts 1600 inside fetch;
  its assertion is caught as a provider error. Phase validation actually returns
  ok/value but its declared success type lacks value/objective. Two Review
  callers pass an output profile that the existing helper ignores.
- Smallest patch: correct the return type, remove ignored extra arguments,
  align tests to current output profiles and move request assertions outside
  the mock so future mismatches report their actual assertion.
- Non-goals: no budget/prompt/model/validator/provider behavior changes, schema,
  retries, P2 capture, dependency upgrade, deployment or cleanup.
- Acceptance: reproduce failures, cover omitted/lite/medium/unlimited Solo caps,
  one mocked call per request, response/usage/privacy; typecheck, canonical
  pnpm.cmd check, P1 regression and diff checks.
- Cost: zero real provider calls, no credential reads or user-data changes.
- Stop: canonical gate passes or a new material cause requires another decision.
  No commit/push/release in this slice. Close out bilingual Devlog/Roadmap/Handoff;
  retain previous failed evidence as history. P2 remains a separate slice.

## Closeout — local PASS

- Baseline reproduction: `node --test --test-name-pattern='Solo makes' tests/rendered-html.test.mjs`
  exited 1 (502 vs 200); `pnpm.cmd typecheck:generated` exited 2 (41 diagnostics).
- Root causes: the mocked fetch asserted an obsolete 1600 cap inside the route's
  catch boundary; actual default is 1200. The phase return annotation lacked the
  existing value wrapper/objective, causing cascading type errors. Review's third
  argument was already ignored at runtime.
- Changed only the phase-return annotation, removed two ignored Review arguments,
  and replaced the stale Solo test with omitted/lite/medium/unlimited fixtures
  (1200/600/1200/12000). Assertions now run outside the provider mock. Each fixture
  checks exactly one request, output/usage and no credential in the reply.
- `pnpm.cmd typecheck:generated` — exit 0.
- `node --test --test-name-pattern='Solo|P1' tests/rendered-html.test.mjs` — exit 0,
  5/5 pass (four Solo profile cases are assertions within one test).
- `pnpm.cmd check` — exit 0: worker types, production build, 68/68 tests, lint
  and typecheck all pass on this local working tree, including previous P1 work.
- `git -c safe.directory=C:/Users/spour/OneDrive/Desktop/Multi-AI-MeetingRoom diff --check`
  — exit 0. No test skipped or compiler suppression added. No dependency changes.
- Self-review: no introduced blocking finding. Existing Review budgets intentionally
  remain unchanged; this is not a new profile-aware Review budget implementation.
- Limits: no paid call, browser/IndexedDB acceptance, remote CI, commit, push,
  release or deployment. Build's existing unknown-route classification notice
  remains informational. Passing local engineering checks is not model-quality
  evidence or DP-0.3 completion.
- Decision: Continue to P2 as a separately scoped SledTrace product slice after
  its source-evidence contract/gates are agreed. P2 is not implemented here.
  P1's earlier failed report remains historical, superseded only for gate status.
