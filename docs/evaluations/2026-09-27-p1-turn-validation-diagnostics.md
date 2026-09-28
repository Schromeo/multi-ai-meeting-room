# P1 validation — precise Turn Envelope diagnostics

Historical P1 checkpoint: the failures below were real at closeout. The later
[P1B correction](../correction-briefs/2026-09-27-p1b-validation-baseline.md) restores
the local full check (68/68, lint/build/types). It does not change this old evidence.

Date: 2026-09-27. Status: locally implemented; repository-wide gate still fails.
Baseline: `a0cae68688cb6963ca7ce3fb1a08cbe7c16676b1`.
No commit, push, deployment, live model call or user-data edit.

## Visible result

A synthetic object with a valid statement and null card now produces:

```text
The turn statement or card is invalid. [turn-envelope/v1 invalid_type at card; expected object; got null]
```

A missing statement instead identifies `missing_field at statement`. Diagnostics
retain the old message prefix and add fixed paths, reason codes and structural
facts only. They do not contain rejected text, unknown property names, credentials
or JSON parser exceptions. Collection failures identify the collection/item index;
they do not yet identify every nested member. Only the first rejected condition
is reported. This is deterministic contract diagnosis, not semantic answer judging.

The existing `agent.format_error.message → transcript.formatError → saved record`
path retains the message without a new event or persisted-field schema. Existing
display wiring is tested; no new browser screenshot, live meeting, or actual
browser IndexedDB acceptance is claimed. Raw provider transport behavior is
unchanged: this change does not redact all existing transcript/delta content.

## Commands and evidence

Final targeted rerun: `node --test --test-name-pattern='P1' tests/rendered-html.test.mjs`
exited 0, all three P1 tests passed. Cross-repository changed-document scan checked
236 local relative link targets with no broken paths (fragment anchors excluded).

| Command/check | Exit/result | Evidence |
| --- | --- | --- |
| `node --test --test-name-pattern='P1 Turn\|P1 preserves\|Turn Envelope validation and' tests/rendered-html.test.mjs` | 0, PASS | 3 targeted tests |
| `pnpm.cmd check` | 1, FAIL | types generation/build passed; 67/68 tests passed; Solo session-key test returned 502 instead of 200; lint/typecheck not reached |
| `pnpm.cmd lint` | 0, PASS | no lint failures |
| `pnpm.cmd typecheck:generated` | 2, FAIL | 41 diagnostics in untouched discuss route and page |
| Read-only Node/TypeScript baseline differential | 0, PASS | replacing only meeting-state source in compiler memory with HEAD source produces exactly the same 41 diagnostics, including locations/messages |
| Read-only parser differential against HEAD | 0, PASS | 1,107 object/JSON/phase/boundary comparisons; acceptance and successful normalized values identical; failures retain baseline prefix |
| `git -c safe.directory=C:/Users/spour/OneDrive/Desktop/Multi-AI-MeetingRoom diff --check` | 0, PASS | no whitespace errors |

The two read-only differentials ran inline via `node --input-type=module`, using
`git show HEAD:lib/meeting-state.ts` and TypeScript transpilation/compiler hosts;
they did not switch/reset files or write baseline files. They are supplemental
one-off checks, not committed test commands. The checked-in tests are repeatable.

All three new P1 tests passed in the full suite: 29 diagnostic/privacy fixtures,
normalization/boundary tests, and a mocked two-seat route plus saved-record parser
round-trip. The route test asserts two original calls, no retry, no review phase,
safe format messages and retained input/output usage. The older Solo failure was
already recorded in the 2026-09-25 Devlog (64/65 before these three tests).

## Review and stop decision

Self-review found no new blocking defect in the scoped change. Existing acceptance,
phase-specific ignored fields, schema and request behavior are retained. This is
not proof over every possible JavaScript input, generic schema introspection,
historical root-cause reconstruction, model-quality improvement, or full-project
readiness. Source tests and record serialization do not replace live UI acceptance.

P1's local diagnostic boundary is delivered. Do not label canonical check green
or merge-ready on this evidence alone. Resolve the baseline Solo/typecheck failures
in a separately bounded correction before relying on a full green integration gate.
P2 source-attempt capture remains separate and unimplemented; no new paid budget
is implied. The historical four-call SledTrace trace is untouched.
