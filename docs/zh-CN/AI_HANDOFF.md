# AI 交接说明

最后更新：2026-08-25

## 当前状态

- 阶段：v0.10c 已完成 M2.1 连接护栏、M2.2 可复用席位核心、M2.7 本地 Event Store、M2.8 结构化 Meeting State、M2.9 由人主持的可恢复编排器，以及 M2.10 的确定性安全、显式 Observer 与 Dispute 定向切片。2026-08-04，真实基线 001 已用 OpenAI + Anthropic 走通 M2.8 之前的 Human Gate 路径。2026-08-25 方向基线决定：一次有限 v0.10c 烟雾评测后冻结通用编排扩建，并把 Review 作为第一条以 Artifact 为中心的 Task Pack。
- 产品：一个由人主持的多 AI 工作空间，包含 Review、Decide / Plan、Explore、Create 和未来 Play Task Pack，并横跨 Discuss、Research 与 Execute 权限等级。
- 已完成：三家统一适配；工作区 Secret 与当前页面 BYOK；显式供应商选择；凭证验证与兼容模型发现；统一连接库；可复用供应商中立席位；token 流式输出；独立提案；交叉审阅；综合；人工决定；用量估算；停止控制；分阶段工作区和 transcript 模式；用 Thinking/Generating/Validating 隐藏结构化原始 delta 的验证后 Turn 呈现；用户固定焦点与手动 Overview 跟随；会议完成后由用户主动进入 Decision；不含凭证的 IndexedDB `RoomStore`；事务迁移与删除；只追加房间、协议 transition、Chair Directive、Process Report 与 Round Brief 事件；严格的跨供应商 JSON Turn Envelope；不自动重试的格式失败事件；服务端和客户端双重确定性 Canonical Reducer gate；Claim、Dispute、Assumption、Chair Directive、Human Choice 与 Follow-up 契约；幂等 turn 归并；active-state 上限；有限上下文渲染；canonical snapshot；显式逐 phase 请求；持久化 Auto/Checkpoints/Turn by turn；安全边界 Raise Hand；用户可选 1～3 轮且协议硬上限 5 轮；中断后显式恢复；transition 恢复与重复调用防护；向后兼容 Meeting Budget；精确调用前 turn Gate；已观测 token/时间边界停止；失败 turn 用量统计；确定性带来源 Process Report 与可逆结构警告；用户显式配置 Observer；每个启用轮次一次可恢复的 Review 后 Observer 调用；严格、带来源的 Round Brief；不含凭证的 Observer 快照与 artifact；由 Chair 选择开放 Dispute；确定性路由至最多两个相关 Seat；持久化、计入预算且可恢复的 targeted-debate transition；不重放 transcript、最多 250 output tokens 的定向回应；十八项自动测试。
- 已批准但未实现：Review Agenda 和来源包、任务自适应审阅 Role Pack、Finding 聚类、独立配置 Editor、结构化 Change Set、Artifact v2 与改动核验、分离的 Executive Brief 与详细 Artifact、逐项 Human Gate、三案例 Review 评测；后续 Decide / Plan、Explore、Create、Research、Execute 与 Play Task Pack；带 event cursor 重连的 durable transition runner、导出、账号同步，以及身份完成后的 D1 持久化。
- 真实证据：OpenAI `gpt-5-mini` 与 Anthropic `claude-haiku-4-5-20251001` 完成 5 次供应商调用，共 2,437 input tokens、3,424 output tokens、54 秒模型时间和 $0.032 提示性估算。Human Gate 仍待用户决定；报告见 `evaluations/2026-08-04-v0.6-live-baseline.md`。
- 已修复真实缺陷：OpenAI 适配器不再无条件发送可选 `reasoning.effort` 或 `text.verbosity`。Anthropic 适配器不再发送新版 adaptive-thinking 模型会拒绝的 `thinking.type: "disabled"`；普通会议省略 `thinking` 并沿用供应商默认值。回归断言覆盖两家请求边界；原失败房间仍证明系统会安全停止且不自动重试。
- 其他未完成：生产 API Key、加密永久 BYOK、Skill 包、多样性指标、导出、证据系统、执行连接器和广泛比较评测。
- 当前里程碑：M2.10 最后证据 Gate，随后进入 M2.11 Review Task Pack。
- 下一动作：先保留可恢复 v0.10c 源码点，再在用户单独批准预算后运行一间全新 Checkpoints 房间：形成开放 Dispute，由 Chair 选择一次定向回合，只运行路由 Seat 与一次 Observer，再进入综合。记录费用、延迟、格式可靠性与明确 Dispute 是否更适合决策。记录有限证据后，开始最小端到端 Review benchmark；不继续通用 Observer、路由、自治或界面基础设施工作。
- 恢复点：commit `f986b5e` 是 M2.9 之前的精确源码状态，现有 tag `backup/v0.6-live-baseline-2026-08-04` 保存更早的真实基线。当前 M2.9 修改仍在 working tree 中，因为本环境拒绝写入 `.git/index.lock` 与 tag lock，所以无法 stage、commit 或创建新的备份 tag。
- 线上地址：`https://multi-ai-meeting-room.schromeo.chatgpt.site`
- 发布状态：线上仍为上一版本。v0.4 源码已推送并保存，但 Sites 自动生成的 `nodejs_compat` 标记与 2026-08-04 生效的平台默认值冲突；输入不变时不要重复部署。

## 每次开始工作前

1. 阅读项目章程、产品方向定稿、本文件、决策记录、路线图、会议协议蓝图、模型与代理蓝图和最新开发日志。
2. 修改前检查工作区，保留用户已有改动。
3. 说明本次工作推进哪个里程碑和完成条件。
4. 确认该任务没有已经完成或被明确否决。
5. 只实现验证当前假设所需的最小端到端范围。

## 防循环与重试规则

- AI 讨论默认最多 **三轮**。只有人类批准，或下一轮能解决一个明确问题时才可增加。
- 工具、API、构建或部署允许一次初始尝试和最多 **两次重试**。
- 只有暂时性故障，或输入、状态、权限、实现发生实际变化时才能重试。
- 同样输入产生同样失败后，禁止原样重复调用。
- 达到成功条件、轮数/重试上限、需要新权限，或下一轮无法改变任何问题时必须停止。
- 禁止创建无人监督的递归 AI 对话。
- 供应商支持时记录 request ID 或幂等键，避免重复动作。

## 必须由人批准

- 新任务进入 Execute 模式。
- 修改真实代码库、账号、外部服务或生产环境。
- 扩大权限、预算、模型数量或最大轮数。
- 扩大网站访问范围或向第三方发送信息。
- 接受尚未解决的高影响风险。

只读检查和模拟讨论不需要 Execute 批准。

## 房间不变量

- 每个房间都必须有目标、约束、预期产物、权限、预算和停止条件。
- 每个参与者都有角色、模型、上下文策略和工具策略。
- 总结必须保留未解决分歧和置信度限制。
- Execute 动作必须引用一个已批准的 Decision。
- Reviewer 默认不继承 Executor 的私有思路。
- 测试等确定性检查不能被模型共识替代。
- 审计事件采用追加记录，纠错通过新记录完成。

## M2 真实验收目标

验证已经实现的 Discuss 流程：用户提交目标，2–3 个模型独立流式提案，互相审阅指定主张，系统展示共识、分歧和未验证假设，最后生成保留异议的 memo，由人接受、修改、拒绝或批准额外一轮。

M2 不包括联网研究、代码执行、通用插件或自治循环。密钥和默认模型见 `PROVIDER_CONFIGURATION.md`。

## 已批准产品目标

M2.7 持久化、M2.8 结构化状态、M2.9 可恢复编排和已经实现的 M2.10 切片构成当前 Shared Core。一次有限真实检查后，先做 M2.11 Review 与 M2.12 证据，再做 M2.13 Decide / Plan。不能把 Discuss 协议当成所有 Task Pack 的统一阶段。产品顺序以 `PRODUCT_DIRECTION.md` 为准；已经实现的 Discuss 协议仍以 `MEETING_PROTOCOL_BLUEPRINT.md` 为准。

## 每次结束工作前

代码有变化时保持可构建；说明做了什么、验证了什么、还缺什么和下一项决定。同步更新开发日志、路线图、决策记录和中文版本。不能因为时间或预算用完就把未完成工作标记为完成。
