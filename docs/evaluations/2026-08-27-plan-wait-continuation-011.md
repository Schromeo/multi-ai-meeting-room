# Plan Wait Continuation 011: Still Incomplete

## Scope and Result

One continuation of [010](2026-08-27-plan-quality-live-010.md), not a new room or another$5 authorization. Same GPT-5 snapshot/Opus4.7, objective and12-day/10MEU/360-minute test contract. D-056 removed Plan deadlines and explicitly reserved the two-call recovery. No prompt/model changes, extra seats, amendment or automatic retry.

- Started through the visible Resume saved plan button at2026-08-27T14:44:54Z. Failure observed at14:46:50Z, so this was not an observed wait beyond180s.
- Exactly one new Builder request. The provider adapter returned, usage was added, but the parser accepted no new day. Error: Days7-12 missing or failing workload/time/duplicate checks. Actual-plan review was never started.
- Still6/12 days. All77 original task rows, day headings, review/completion and adjustment text match010's archived draft. History remains11, pending human approval. No original record deleted or approved.
- The fixed180s and cumulative-time guards no longer blocked this attempt. Completion, semantic quality, review, amendment and adoption remain failed or untested, not passed.

## Evidence and Limits

- [Failure UI](artifacts/plan-wait-011/01-continuation-failure.txt), [all retained days from visible UI](artifacts/plan-wait-011/02-retained-days.json), [preflight](../correction-briefs/2026-08-27-plan-wait-recovery.md).
- Footer changed from46K to37K remaining output (rounded), with zero remaining call slots. Slots are conservative transition reservations, not actual started/billed calls: this continuation used one request, not two. Cumulative known requests across010/011: seven.
- Builder output cap was9,600; potential second review6,000. Exact new input/output/reasoning split, finish reason, rejected raw lines, request ID and invoice are not exposed by this Plan UI/archive. A near-cap response suggests output-budget pressure, but does not prove reasoning exhaustion or malformed JSON. Do not invent an exactactual price or claim no charge because delivery failed. Remain inside the original$5 authorization; no further paid attempt made.
- Code inspection: the Plan Builder branch collapses incomplete responses and rejected rows into a missing-days error; its parser silently drops JSON/schema/whole-plan failures. The prior cross-review-only Chair directive also remains in canonical context supplied to Builder. Its presence is proven; causation in this failure is not.

## Next Work, In Order

| Priority | Issue | Smallest useful change and exit criterion |
| --- | --- | --- |
| P0 | Failure is not diagnosable | Retain bounded, credential-free finish status, visible/reasoning token counts when supplied, and per-day rejection reason. Fixtures distinguish truncation, malformed JSON, bad arithmetic and cross-day conflicts. No new live call merely to discover missing telemetry. |
| P0 | Temporary phase instructions leak onward | Scope the cross-review format repair to that phase. Carry actual user requirements forward, not an obsolete Turn Envelope/output-shortening instruction. Assert the exact Builder prompt excludes it. |
| P1 | Reasoning and artifact output share a shrinking cap | After diagnostics, size visible artifact headroom separately in planning and evaluate one evidenced configuration change. Do not blindly enable maximum reasoning, raise all limits, or split tasks to fit a removed timer. |
| P1 | Recovery and billing are conflated | Keep failed receipts and distinguish started requests from reserved seats. Preserve one explicit recovery and no auto retries. The exhausted UI should not advertise an actionable recovery that preflight will reject. |
| P1 | Draft content is not yet dependable | Original metadata errors, fallback MEU/time arithmetic, unspecified substitutes and conditional spillover remain. Review the actual full Plan and repair named concerns without silently lowering user workload. Cross-day changes need an explicit scope, not mutation of saved good days. |
| P2 | Waiting and restoration remain misleading | Persist honest stop reasons (budget stop is currently later labeled Human Chair stop), match restored seats ergonomically, and show Plan progress in Overview. Defer broader redesign. |
| P2 | Product value unproven | Only after completion, assess whether independent criticism improves the deliverable; a passing JSON parser, long reasoning or more seats is not proof. D-055 live amendment/recheck and matched comparison remain untested. |

## Local Verification

Build and54 offline tests pass after the final stopped/complete guard correction; lint is recorded in the devlog. The long-wait fixture advances an actual adapter wrapper600s, verifies explicit cancellation and preserves ordinary90s behavior. This is not live>180s evidence. Three existing Cloudflare type declarations remain unresolved. The production `stopProtocol` fixture replaced an inaccurate paused-state fixture after browser discovery. No deployment or key extraction.
