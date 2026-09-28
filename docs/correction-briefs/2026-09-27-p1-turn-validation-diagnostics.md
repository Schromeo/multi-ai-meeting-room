# P1 — Precise Turn Envelope validation diagnostics

Closeout: [validation and limits](../evaluations/2026-09-27-p1-turn-validation-diagnostics.md).


Status: Local implementation delivered; full check remains blocked by baseline failures. Owner continuation: 2026-09-27, following the approved SledTrace
P1 plan. This is one bounded correction alongside DP-0.3, not a new product
train or permission to complete DP-0/Plan work.

- Observed failure: the owned MAMR meeting paused after four real calls; the
  combined statement/card error could not identify the invalid field. Original
  invalid output is unavailable; do not invent its cause or retry the meeting.
- User artifact: an inspectable, retained field-specific error on the existing
  turn error surface, without exposing raw output or private field names.
- Baseline: parseTurnEnvelope rejects the same input with a coarse string;
  agent.format_error.message flows to transcript.formatError and saved history.
- Smallest hypothesis: enrich the existing error string with a versioned reason
  code, fixed field path and type/length-only summary. Preserve old message text,
  parser acceptance, event shape, stored schema, prompts and request behavior.
- Information gain: distinguish missing/type/empty/length/record failures from
  each other; no new paid call is needed. This cannot reconstruct the old run.
- Acceptance: offline boundary and privacy fixtures, unchanged valid normalized
  results, route error/usage/no-retry evidence, saved-record round trip, existing
  display wiring, build/type/lint and recorded full-suite limitations.
- Cost boundary: zero provider calls, no credential reads, no user data changes,
  no network deployment, no commit/push/release. Use synthetic failures only.
- Stop: after safe field diagnostics reach the existing error/record path. Do
  not add native SledTrace capture, bundle import, structured public event fields,
  automatic repair or prompt/model/validator relaxation. P2 remains separate.

Direction decision and validation results will be recorded at closeout in the
English/Chinese Devlog, Roadmap and Handoff; durable choice in Decisions.
