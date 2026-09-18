# Plan Quality Live 010: Preflight

- Authorization: the user connected two provider accounts and authorized at most USD 5 for this case, including reasoning models and archiving the result. No credentials are read or archived.
- Failure being tested: previous plans were broad or incomplete, and review did not reliably improve the delivered artifact. D-055's amendment/recheck has only offline coverage.
- User artifact: a complete 12-day LeetCode plan, independent critique, any bounded revision/recheck, and a durable archive. Final adoption remains the user's decision.
- Baseline: historical Plan 007 and the negative core-closure characterization. This is not a matched single-model comparison and cannot prove multi-model superiority.
- Hypothesis: a sufficiently sized reasoning builder plus a distinct strong reviewer can deliver a usable plan and expose consequential defects; selected defects can be amended and independently rechecked without another full meeting.
- Setup: GPT-5 snapshot `gpt-5-2025-08-07`, Strategist/builder; `claude-opus-4-7`, Critical Reviewer. Two active seats, one round, checkpoints, Observer off. Detailed LeetCode plan: 12 days, minimum 10 MEU/day, 360 minutes/day. Six hours is an explicit test assumption, not a known user availability.
- Actual reasoning configuration: recognized GPT-5 uses minimal in generic discussion and medium in Plan artifact stages. Claude receives no explicit thinking or effort option; do not claim both models have deep thinking enabled.
- Acceptance: all 12 days; concrete IDs/titles/difficulties; distinct new/redo work; exact weighted load and time accounting; progression, review, completion and adjustment rules; material criticism with truthful resolution status; full artifact separate from compact state. Mechanical validity does not establish problem metadata or pedagogical correctness.
- Cost control: UI preflight advertises at most 8 initial calls / 50K output / 720s model time. Initial builder/reviewer caps are 16K/6K; at most one selected-concern amendment/recheck adds 12K/6K. Use official standard prices, not the app's generic estimate: GPT-5 input/output $1.25/$10 per million, Opus 4.7 $5/$25. Reserve conservatively below $5 including input and reasoning. No Pro models, extra rounds, observer, or blind full-room reruns. Stop before another call if the remaining allowance is uncertain.
- Stop: save evidence on failure before considering any distinct recovery; no unchanged retries. At most one explicit missing-part recovery if justified and still within allowance, and one amendment/recheck cycle for genuine concerns. No unrelated engineering or UI expansion during this run.
- Sources checked: https://developers.openai.com/api/docs/models/gpt-5 ; https://platform.claude.com/docs/en/about-claude/pricing . Standard price estimates are not provider invoices.

## Recovery Decision

After four provider attempts, the Anthropic cross-review failed JSON parsing; the successful OpenAI review is retained. Save `01-cross-review-failure.txt`, then make one changed-input, failed-seat-only attempt with a scoped Chair correction: emit a compact valid Turn Envelope, <=120 Chinese characters in statement, at most one claim update/objection, no new claims or optional fields. This tests whether a smaller envelope fits the existing 1,200-token phase cap; truncation is a hypothesis because raw response/stop reason is not exposed. No second unchanged attempt. The user also permitted additional seats after launch; do not restart this room merely to increase seat count. The total authorization stays $5.

## Submitted Objective

为一个有一定数据结构和算法基础、准备算法面试的人制定一份完整、可直接执行的12天LeetCode刷题计划。每天至少10个Medium等价量：1 Hard=2 Medium，3 Easy=1 Medium。此次测试假设每天可投入360分钟（含复盘），这不是已确认的用户时间条件。必须逐日列出具体题号、题名、难度、新做或重做、每题时间、复盘时间、完成标准和落后时的调整规则；解释主题顺序与间隔复习。不能只列宽泛主题，不得用反复抄答案或把复习冒充新题来凑量。若高强度目标与学习效果有冲突，应明确风险与前提，不能悄悄降低用户题量。审阅者独立核对题量、时间、难度梯度、题目匹配、复习间隔和可执行性，指出具体哪一天哪里有问题及修正建议；无法核实的题目元数据不要假装已查证。最终交付完整中文计划，保留仍未解决的异议，不以一致赞同代替验证。
