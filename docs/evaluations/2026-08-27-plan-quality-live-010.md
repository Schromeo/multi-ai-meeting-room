# Plan Quality Live 010: Incomplete, Archived

Date: 2026-08-27. Decision: **Repair**, not quality pass. Authorization: USD 5 maximum for one detailed LeetCode case; reasoning models permitted. The user later allowed more seats. Two seats had already started, so no new room or additional seat was created solely for diversity.

## Deliverable and Provenance

- [Readable six-day original](artifacts/plan-quality-010/partial-plan.zh-CN.md): model output, not an assistant replacement plan. Days 7-12 are absent; no actual-plan review, amendment, recheck, or human approval occurred.
- [Raw six-day UI text](artifacts/plan-quality-010/03-partial-original.txt), [initial review failure](artifacts/plan-quality-010/01-cross-review-failure.txt), [recovered cross-review](artifacts/plan-quality-010/02-cross-review-recovered.txt), [builder timeout](artifacts/plan-quality-010/04-builder-timeout.txt), [blocked recovery](artifacts/plan-quality-010/05-recovery-budget-block.txt).
- [Preflight and exact objective](../correction-briefs/2026-08-27-plan-quality-live-010.md). Source is the existing local app at localhost:3001; no hidden browser state or credentials were read. History increased from 10 to 11; the new record is visibly saved. Browser left stopped on Day 1. No older room was deleted, no reload, and no code or deployment change during the case.
- Files preserve output as observed, including incorrect metadata and adjustment advice. They are **not a ready-to-adopt 12-day plan**. Structured API responses, provider request IDs and failed-call receipts are not available in this archive.

## Configuration and Attempts

Contract: 12 days, at least 10 Medium-equivalent units/day, 1 Hard = 2 Medium, 3 Easy = 1 Medium, 360 minutes/day including review. Six hours was explicitly a test assumption, not confirmed user availability. One round, checkpoints, Observer off.

| Attempt | Model / stage | Outcome |
| --- | --- | --- |
| 1 | GPT-5 snapshot `gpt-5-2025-08-07`, proposal | Valid short proposal |
| 2 | `claude-opus-4-7`, proposal | Valid proposal; 1,014 output tokens, 27s, $0.013 generic UI estimate |
| 3 | GPT-5, cross-review | Valid critique; English despite Chinese task |
| 4 | Opus 4.7, cross-review | Invalid JSON Turn Envelope; raw text and stop reason not exposed |
| 5 | Opus 4.7, failed-seat-only recovery | Passed after a scoped shorter-envelope directive; original failure preserved |
| 6 | GPT-5, full Plan Builder | `provider_timeout`; Days 1-6 saved; Days 7-12 absent |
| Not called | Missing-days recovery + actual-plan review | Client agent-turn guard rejected before any provider call |

Attempts 1 and 2 ran in parallel, as did 3 and 4; numbering denotes logical attempts, not completion ordering. GPT-5 uses minimal reasoning for ordinary turns and medium for the Plan, with a 16K output cap and 180s timeout. Claude receives no explicit thinking/effort option; this was not an all-model deep-thinking test. No full-room rerun, second unchanged format retry, or additional paid attempt after the timeout.

## Findings

1. **Recovery allowance conflicts with earlier recovery.** Initial preflight advertised 8 calls, including Plan recovery. Two proposals, two reviews and one recovered review consume five reservations; the initial synthesis reserves Builder plus reviewer, consuming two more even though the reviewer never ran. One slot remains, while missing-days generation plus review requires two. The visible result is `Budget stop: agent-turn limit reached. No provider call was started.` This is a call-limit stop, not exhaustion of the user's $5. A per-artifact recovery allowance is not truly protected from earlier failures.
2. **Reasoning-capable generation does not fit the current time boundary reliably.** The builder made valid daily progress but hit 180s with only half the artifact. This is an observed timeout, not proof of output-token exhaustion. Medium reasoning plus detailed output needs a task-sized generation strategy; merely buying a more expensive model or adding seats would not remove this limit.
3. **The short protocol envelope remains fragile.** Opus cross-review failed JSON validation under the 1,200-token cap. A compact, changed-input recovery worked, but truncation cannot be proven without the raw failed output/stop reason. The recovered statement also exceeded the requested 120 Chinese characters. Word-based prompt limits are not reliable Chinese length controls.
4. **Mechanical task totals do not validate prose.** Day 1 says replacing one Medium with two Easy keeps MEU unchanged, contradicting the explicit 3:1 rule. Day 2 suggests replacing a 22-minute new Medium with two redo Mediums at up to 14 minutes each when behind schedule; this does not necessarily save time. Several replacement rules omit specific substitute IDs. Review of the actual artifact never ran, so these are audit findings, not defects that the absent reviewer demonstrably missed.
5. **Metadata can be stale despite plausible-looking tables.** Day 1 labels #53 Maximum Subarray Easy. The [official LeetCode page](https://leetcode.com/problems/maximum-subarray/?search=498) lists Medium. The app correctly warns that metadata is model-supplied, but the validator uses those supplied labels. Only a spot check was performed, not catalog-wide verification.
6. **Useful detail exists, but learning quality is not established.** Six days contain 77 task entries, explicit new/redo labels, 60 minutes of review each, and concrete completion/adjustment text. Supplied-label totals range from 10 to 14.33 MEU and 286-344 minutes. A minimum of 10 is not a mandate to inflate later days to 14; increasing workload and compressed timeboxes remain adoption risks. Reviewers suggested protecting review time, but the plan did not consistently embody their suggested 120-minute allocation. Model suggestions are not automatically approved constraints.
7. **Premature review can criticize abstractions instead of checking a deliverable.** Four ordinary successful turns preceded any daily task. The models debated unspecified time ratios and spacing evidence rather than checking concrete IDs and fallback arithmetic. This is evidence for emphasizing actual-artifact review, not for proving that cross-review is useless.
8. **Observability and cost gaps remain.** Overview showed only earlier discussion during Plan generation; Focus showed 0/12 until complete records arrived. After the builder timeout, the displayed remaining model-time/output counters did not include that interrupted call. The dollar/usage breakdown is tied to later result UI, inaccessible here. The current record is saved but the budget-blocked state exposes no useful continuation action beyond returning to the agenda. Do not silently restart it.

## Cost and Budget

Six provider requests were initiated: three OpenAI and three Anthropic. The attempted missing-days recovery made zero requests. Two failed attempts lack complete visible receipts; **actual spend cannot be reported exactly or inferred from the app's remaining counters**. No provider invoice was inspected.

Using checked standard pricing, GPT-5 costs $1.25/$10 per million input/output tokens and Opus 4.7 $5/$25. Total requested output ceilings for the six calls imply an output-component ceiling of `(2*1200+16000)*10/1e6 + (3*1200)*25/1e6 = $0.274`, including reasoning in OpenAI's output allowance. This excludes input, taxes, account-specific pricing and any interrupted-call billing differences; it is **not the actual bill or a total-cost ceiling**. The $5 authorization was not consumed by additional retries to force success. Preserve the receipt gap rather than reporting a fictional exact price. Sources: [OpenAI model pricing](https://developers.openai.com/api/docs/models/gpt-5), [Anthropic standard pricing](https://platform.claude.com/docs/en/about-claude/pricing).

## Gate and Next Action

| Gate | Result |
| --- | --- |
| Mechanical | Partial: valid day checkpoints survive timeout; recovery is blocked by shared call allowance |
| Semantic | Fail on observed arithmetic/metadata; actual-plan model review not reached |
| Artifact | Fail: 6/12 days, not a complete adoptable result |
| Human Gate | Not reached; no approval or revision falsely recorded |
| Experience | Partial content inspectable; long silent period and unusable recovery boundary |
| Economic | Six bounded attempts; real invoice/failed usage unknown; no extra charged recovery |
| Differentiated value | Unproven; no final amendment and no matched single-model comparison |

Next bounded engineering work: make the advertised artifact recovery allowance reachable after one earlier format recovery, preserve actual call/usage provenance rather than confusing reservations with started provider calls, and fit generation units to the observed timeout. Test this exact saved partial-state path offline before another paid continuation. Preserve these six days and resume only missing content plus actual-artifact review; do not add more seats or rerun the room to hide the failure. Then assess and repair concrete review concerns. D-055's live amendment/recheck quality remains untested; M2.12 stays deferred and M2.13 stays Current.
