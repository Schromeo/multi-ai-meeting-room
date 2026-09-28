# P1 验收 — 精确 Turn Envelope 诊断

本页为 P1 历史检查点，失败是当时的真实结果。后续 [P1B 修正](../correction-briefs/2026-09-27-p1b-validation-baseline.md)
已恢复本地全检查（68/68、lint/build/types），不改写下方旧证据。

日期：2026-09-27。状态：本地实现完成；全仓验收仍失败。
基线：`a0cae68688cb6963ca7ce3fb1a08cbe7c16676b1`。
未提交、推送、部署、调用真实模型或改动用户数据。

## 可以看到的结果

对 statement 合法、card 为 null 的合成输入，实际返回：

```text
The turn statement or card is invalid. [turn-envelope/v1 invalid_type at card; expected object; got null]
```

缺少 statement 时则明确报告 `missing_field at statement`。保留旧错误前缀，
只附加固定路径、原因码、类型／长度；不包含被拒绝的原文、未知属性名、凭据或
JSON 解析器异常内容。集合错误定位到集合／元素下标，尚不细分每个嵌套成员。
只报告首先拒绝的条件；这是确定性合同诊断，不是答案语义评判。

现有 `agent.format_error.message → transcript.formatError → 历史记录` 保留
诊断，不新增事件或持久化字段。已测试展示接线；没有本轮真实浏览器截图、会议
或浏览器 IndexedDB 验收。现有原始 provider delta／transcript 行为未改变；
本改动并不代表所有既有内容都已脱敏。

## 命令与证据

最终定向复跑 `node --test --test-name-pattern='P1' tests/rendered-html.test.mjs`
退出 0，三个 P1 测试全部通过。跨仓库改动文档检查 236 个本地相对链接目标，
无路径失效（不含 fragment 锚点验证）。

| 命令／检查 | 退出码／结果 | 证据 |
| --- | --- | --- |
| `node --test --test-name-pattern='P1 Turn\|P1 preserves\|Turn Envelope validation and' tests/rendered-html.test.mjs` | 0，通过 | 3 项定向测试 |
| `pnpm.cmd check` | 1，失败 | types 生成与 build 通过；测试 67/68，Solo session-key 用例应为 200、实为 502；未进入 lint/typecheck |
| `pnpm.cmd lint` | 0，通过 | 无 lint 失败 |
| `pnpm.cmd typecheck:generated` | 2，失败 | 未修改的 discuss route 和 page 共 41 条诊断 |
| 只读 Node/TypeScript 基线对照 | 0，通过 | 编译器内存中换回 HEAD meeting-state 源码，41 条诊断及位置／消息完全相同 |
| HEAD 校验器对照 | 0，通过 | 1,107 组 object/JSON/phase/边界比较，接受／拒绝和成功归一化相同，失败保留旧前缀 |
| `git -c safe.directory=C:/Users/spour/OneDrive/Desktop/Multi-AI-MeetingRoom diff --check` | 0，通过 | 无空白错误 |

两项只读对照通过内联 `node --input-type=module` 运行，读取
`git show HEAD:lib/meeting-state.ts` 并使用 TypeScript 转译／compiler host；
没有切换、重置或写入基线文件。它们是本轮补充检查，不是已入库脚本；新增测试
已写入仓库，可重复运行。

三个新增 P1 测试在全套中均通过：29 组诊断／隐私 fixture、归一化／长度边界、
模拟双席位 route 与历史记录解析 round-trip。路由验证仅原来的两次模拟调用，
无重试、无 review 阶段、错误不泄露假秘密且保留输入／输出 usage。Solo 失败
在 2026-09-25 DEVLOG 已记录为 64/65，本轮增加三个通过用例后为 67/68。

## 自检与停止点

本片自检未发现新阻塞缺陷；原校验、按阶段忽略的字段、schema 与请求行为保留。
不声称覆盖所有 JavaScript 输入、通用 schema 内省、还原历史根因、提升模型质量
或全仓就绪。源码展示接线与记录序列化测试不等于真实 UI 验收。

P1 本地诊断边界已交付，但不能将 canonical check 标绿或据此直接宣称可合并。
依赖全绿集成门槛前，应另开有界修正解决既有 Solo／类型错误。P2 源头尝试采集
仍未实现，本轮不启动，也不续用旧付费额度。历史四次调用的 SledTrace trace 未改动。
