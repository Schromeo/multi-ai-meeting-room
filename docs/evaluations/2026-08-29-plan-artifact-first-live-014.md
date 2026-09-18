# Artifact-first Plan Live 014 - Complete Builder, Invalid Reviewer

Date: 2026-08-29
Mechanical artifact gate: Partial pass
Independent review gate: Fail
Human adoption: Not reached

## Configuration And Boundary

- Fixed 12-day LeetCode objective, minimum 10 MEU/day, 360-minute/day test assumption.
- Builder: OpenAI `gpt-5.6-sol`, provider-default reasoning.
- Reviewer: Anthropic `claude-fable-5`, provider-default adaptive reasoning.
- Gemini unassigned; third Seat and Observer off.
- Renewed user authorization: at most two additional calls, additional USD 1.00 ceiling, no retry.
- Preflight: two calls, 22K output, no application deadline.

## Result

The artifact-first path made exactly the two authorized calls. Sol produced all 12 valid day records in 78 seconds. All days met the mechanical MEU and minute contract; no day line was rejected. The complete checkpoint survived the later review failure.

Fable read the complete Plan and completed after 86 seconds, but its 2,720 visible characters were not valid JSON. The application rejected the entire review as line-one `invalid_json`, retained all 12 days, stopped, and offered no automatic retry. No review conclusion, amendment, Human Gate approval or multi-model improvement was accepted.

| Stage | Status | Input | Output | Reasoning | Latency | Visible / validation |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Sol Builder | accepted | 1,111 | 7,766 | 3,057 | 78s | 14,655 chars; Days 1-12; 0 rejects |
| Fable Reviewer | rejected | 9,388 | 5,191 | unknown | 86s | 2,720 chars; invalid JSON |

At the published rates used in the correction brief, these reported tokens imply an approximate USD 0.51 list-price total. This is not an invoice; provider accounting, caching and the uncertain aborted History13 request remain authoritative/unknown.

## Artifact Audit

Strengths:

- It is the first complete real-provider 12-day structured Plan in this project: concrete IDs/titles, daily work mode, per-task time, review time, completion criteria and adjustment text.
- Topic order is coherent: arrays -> stack/interval -> linked list/binary search -> trees -> heap/greedy -> graph -> backtracking/trie -> DP -> weighted graph -> mixed Hard -> closed-book review.
- Days 2-12 include retrieval from earlier days; Day 12 is a ten-problem closed-book cumulative check.
- It does not silently claim completion after a missed workload and explicitly labels metadata as unverified.

Material concerns still requiring independent/human judgment:

- Every day consumes exactly all 360 minutes. There is no transition, break or overrun buffer, so a single task exceeding its box breaks the schedule.
- Most fallbacks say to pause and add a remediation day. That is honest about unmet MEU, but it makes a fixed 12-day calendar non-executable without an explicit rescheduling rule.
- Days 1-10 assume eight to ten Medium-equivalent tasks plus review daily. The user requested this intensity, but the Plan does not define a fatigue/accuracy threshold for switching from volume to remediation.
- Problem identity and difficulty metadata were not externally verified. Mechanical acceptance is not catalog correctness.
- The Fable review content is unavailable by design because raw invalid output is not retained. We cannot infer whether it contained useful criticism or only a formatting failure.

## Product Finding

D-059's artifact-first architecture is mechanically validated: the user receives a complete useful draft before reviewer risk, with two rather than six initial calls. The core multi-model value is not validated because the independent critique failed at its output contract. This run proves Builder reliability under the current schema, not that Sol+Fable is better than one strong model.

Next work should target the Reviewer contract only: preserve the completed Builder artifact and test one bounded structured-review correction offline before any new paid review. Do not regenerate the Plan or add another Seat. The generic top progress labels and `1 turns complete` counter also remain misleading for artifact-first rooms, but they are secondary to review reliability.

Artifacts: [full readable Plan](artifacts/plan-artifact-first-014/01-plan-readable.md), [attempt diagnostics](artifacts/plan-artifact-first-014/02-attempt-diagnostics.txt).
