# P2 — Source attempt evidence

Status: Locally validated; uncommitted/unpushed. 2026-09-27: owner explicitly approved the additive event/local
record contract proposed in SledTrace CURRENT_TASK. Preserve P1/P1B changes.

- Failure: ordinary failed calls can lose reported usage and source lifecycle
  timing; saved transcript timestamps describe saving, not provider invocation.
- Artifact: inspectable local started/terminal receipts for runAgent-backed
  meeting turns; provider finish and Turn Envelope validation remain distinct.
- Reuse: existing IDs, provider diagnostic parsing, local event store and history.
  Plan's lifecycle is a pattern, not shared Plan-specific records.
- Scope: versioned strict metadata, nullable reported usage, monotonic elapsed,
  optional history collection and source.attempt event; old records unchanged.
  Envelope validation is the captured boundary; later task/reducer rejection
  remains in existing events and must not be presented as successful task quality.
- Privacy: fixed fields/codes only; no prompts/raw answers/arbitrary exceptions,
  keys/headers/Connection labels/private reasoning. Room deletion deletes evidence.
- Acceptance: offline completed/rejected/incomplete/error/abort/unknown and partial
  usage, started/terminal ordering, dedup/conflict, round-trip/old records, secret
  fixtures, inspectable display, canonical pnpm.cmd check.
- Non-goals: Plan/Observer/Solo/Review-work instrumentation, behavior/budget/prompt
  changes, SledTrace import, new warnings, retries, live calls, release or push.
- Stop: validated source boundary and documented limitations. A browser disconnect
  may lose a terminal receipt; started does not prove provider billing. This is
  not durable server execution or exactly-once billing.

## Local acceptance — 2026-09-27

- Mechanical: final `pnpm.cmd check` exit 0, 71/71 tests, build/lint/types pass.
  Mocked route execution verifies OpenAI/Anthropic/Gemini metadata boundaries.
  A later Gemini event without usage must retain already-reported visible output.
  Zero is reported only when supplied; reasoning usage never comes from text.
- Storage: actual browser IndexedDB round-trip, repeated-save dedup, conflicting
  receipt transaction rollback, old-record compatibility, unresolved start,
  deletion and reused room ID all pass. Same receipt with different JSON key
  order is not a conflict. Store version remains unchanged.
- Artifact/experience: real SourceAttemptView displays restored synthetic records,
  separating provider completion from invalid_type at card, and displaying an
  unresolved call with unknown counts. This is an isolated component/store
  acceptance, not a live full meeting. Reproduce: `node scripts/preview-source-attempt.mjs`,
  open `http://127.0.0.1:4398`, press Run storage acceptance. Fixture room is removed.
- Semantic/task quality: not evaluated; no automatic repair or quality claim.
  Only Turn Envelope validation is in this receipt; downstream task contracts,
  reducer decisions and Human Gate acceptance are not captured as passed.
- Human Gate/adoption: not evaluated. Economic: zero paid calls; usage/billing
  accuracy and user reading burden not measured. Cross-review advantage: not
  evaluated. This is better failure evidence, not better model answers.
- Review: no remaining blocking finding in scope. Timer-expiry classification,
  real provider streams, disconnect races and full meeting UI/reload remain
  unverified in this slice. Parent cancellation and missing terminal are covered.
- Direction: bounded P2 complete locally. P3 export/privacy/atomic-import design
  is the next candidate, not started. No commit/push/release/deployment.

## Saved contract and limitations

`SourceAttempt` v1 uses `mamr-turn-v1` and `turn-envelope/v1`, application
request/turn/attempt/seat IDs, configured provider/model, phase/round/output cap,
source wall times and monotonic elapsed; call/finish/validation are independent.
Counts use value plus reported/unknown provenance. Gemini visible output and
thought tokens are separate; other providers' output may already include reasoning,
so do not blindly sum them. No cost or verified-served-model claim.

`source.attempt` adds started/terminal transport receipts and optional
`MeetingRecord.sourceAttempts`, limited to 1,024 receipts. Local event identity is
room + attempt + lifecycle. Identical saves dedup; conflicting evidence aborts the
transaction. Old absent data stays absent; terminal without start is allowed
without inventing a start. Reaching the limit surfaces an evidence error, not a
provider retry. The existing provider timeout policy and legacy totals are unchanged.

The browser persists receipts as it receives them; this is not a server durable
audit. Started means application invocation, not confirmed provider acceptance or
charge. A lost terminal stays unresolved. Fixed codes/paths omit raw input,
answers, arbitrary errors, Connection labels, headers and private reasoning.
Configured identifiers are bounded; this is not a general sanitizer for future
arbitrary exports. P3 must define its own opt-in allowlist and privacy checks.
