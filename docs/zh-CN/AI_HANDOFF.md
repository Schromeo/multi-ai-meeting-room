# AI 交接说明

最后更新：2026-08-04

## 当前状态

- 阶段：v0.8 已完成 M2.1 连接护栏、M2.2 可复用席位核心、M2.7 本地 Event Store 和 M2.8 结构化 Meeting State。2026-08-04，真实基线 001 已用 OpenAI + Anthropic 走到 Human Gate。
- 已完成：三家统一适配；工作区 Secret 与当前页面 BYOK；显式供应商选择；凭证验证与兼容模型发现；统一连接库；可复用供应商中立席位；token 流式输出；独立提案；交叉审阅；综合；一次追加修订；人工决定；用量估算；停止控制；分阶段工作区和 transcript 模式；不含凭证的 IndexedDB `RoomStore`；事务迁移与删除；只追加房间事件；严格的跨供应商 JSON Turn Envelope；不自动重试的格式失败事件；服务端和客户端双重确定性、带来源的 Canonical Reducer gate；Claim、Dispute、Assumption、Chair Directive、Human Choice 与 Follow-up 契约；幂等 turn 归并；active-state 上限；有限上下文渲染；canonical snapshot 持久化；十一项自动测试。
- 已批准但未实现：Auto/Checkpoints/Turn by turn 编排、Raise Hand 与运行时 Chair Directive、用户选择 Observer 与 Final Synthesizer、Round Brief、流程监测、最大轮数与多维预算、定向辩论、Meeting Whiteboard、带来源 Follow-up 流程、版本化 Memo、导出、账号同步，以及身份完成后的 D1 持久化。
- 真实证据：OpenAI `gpt-5-mini` 与 Anthropic `claude-haiku-4-5-20251001` 完成 5 次供应商调用，共 2,437 input tokens、3,424 output tokens、54 秒模型时间和 $0.032 提示性估算。Human Gate 仍待用户决定；报告见 `evaluations/2026-08-04-v0.6-live-baseline.md`。
- 已修复真实缺陷：OpenAI 适配器不再无条件发送可选 `reasoning.effort` 或 `text.verbosity`；`gpt-4.1-mini` 回归测试断言这两个字段不存在。原失败房间仍证明系统会安全停止且不自动重试。
- 其他未完成：生产 API Key、加密永久 BYOK、Skill 包、多样性指标、导出、证据系统、执行连接器和广泛比较评测。
- 当前里程碑：M2.9 由人主持的可恢复编排器。
- 下一动作：把一次性请求拆成显式房间状态机，加入安全边界暂停/恢复、默认 Checkpoints、只追加 Chair Directive、幂等 transition ID 和刷新恢复。暂不加入 Observer 调用，也不重做 Meeting UI。
- 恢复点：commit `3298d40` 与 tag `backup/v0.6-live-baseline-2026-08-04` 保存了 M2.7 之前的真实基线。
- 线上地址：`https://multi-ai-meeting-room.schromeo.chatgpt.site`
- 发布状态：线上仍为上一版本。v0.4 源码已推送并保存，但 Sites 自动生成的 `nodejs_compat` 标记与 2026-08-04 生效的平台默认值冲突；输入不变时不要重复部署。

## 每次开始工作前

1. 阅读项目章程、本文件、决策记录、路线图、会议协议蓝图、模型与代理蓝图和最新开发日志。
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

## 已批准 Protocol v1 目标

M2.7 持久化与 M2.8 结构化状态已完成；按顺序实现 M2.9～M2.12。先实现编排器，最后重做界面。目标是让人类 Chair 在会议中持续控制，加入显式付费 Observer 与 Final Synthesizer，并让后续 turn 只路由到明确分歧。未来设计以 `MEETING_PROTOCOL_BLUEPRINT.md` 为准。

## 每次结束工作前

代码有变化时保持可构建；说明做了什么、验证了什么、还缺什么和下一项决定。同步更新开发日志、路线图、决策记录和中文版本。不能因为时间或预算用完就把未完成工作标记为完成。
