# 产物优先 Plan 真实实验 012：供应商结果前的契约失败

日期：2026-08-29
Gate：真实机械链路在取得可用供应商结果前失败
产物质量：未运行

## 已授权配置

- 固定 12 天 LeetCode 案例，每天 10 MEU，明确 360 分钟只是测试假设。
- Seat 1：OpenAI `gpt-5.6-sol`，Strategist / Plan Builder。
- Seat 2：Anthropic `claude-fable-5`，Critical Reviewer。
- Gemini 已连接但未分配；第三席和 Observer 关闭。
- 启动预检：`2 calls · 22K output · No cumulative time cutoff`。
- 用户上限：1 美元，最多两次供应商调用，不自动重试。

## 已观察尝试

1. 历史 12 已直达 synthesis，但 `/api/discuss` 仍保留普通 Decide 的前置条件，要求两份 proposal 和一份 cross-review。请求在进入 `runPlanArtifactPhase` 及任何供应商调用前被拒绝，没有产生 Plan。
2. 修复并离线验证上述 Gate 后，历史 13 进入 `runPlanArtifactPhase`。初始空 Plan checkpoint 绑定 Canonical State version 0，但客户端 Plan 解析器错误要求来源版本至少为 1。浏览器在保存产物或用量回执前以 `The Plan checkpoint does not match this room.` 中止。服务端会在准备启动 Builder 前立即发出该 checkpoint，因此 OpenAI 是否已启动或计费 Sol 请求未知。保守视作可能发生过一次调用；不能报告为零，也不能沿用原上限重试。

Fable 审阅没有运行；没有任何天记录、模型响应、结束状态或 token 用量被接受。这是应用契约证据，不是 Sol/Fable 质量评估。

## 修复与证据

- Detailed Plan 现在以产物优先协议从 `synthesis` 开始，仅 Builder 和 Reviewer 待执行。
- 首次 Plan 预算严格为两个 agent turn 和 22,000 输出 token；不含通用提案、交叉审阅或自动重试。
- 通用 synthesis 历史前置条件只约束非 Plan 的 Decide 综合。
- Plan 产物允许来源 State version 0，与新产物优先房间一致；负数仍拒绝。
- 构建及 61 项离线测试通过，含“空讨论历史恰好两次 mock 供应商调用并完成受审阅 12 天产物”的行为测试；lint 通过。完整类型检查仍只有三项既有 Cloudflare 声明错误。

## 停止与下一证据

停止，不点击 `Build missing plan days`。新的真实运行最多会再发出两次供应商调用，而历史 13 的一次 Sol 可能已经启动，因此需要刷新费用/调用授权。最终热更新后重新连接会话 Key，只再运行一次，并归档有效天数、审阅、诊断及供应商报告用量；不做同请求自动重试。
