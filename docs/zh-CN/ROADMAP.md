# 路线图

状态：`已完成`、`当前`、`计划中`、`暂缓`。

## 当前定位

- **本地产品版本：** v0.7。
- **可运行基线：** 真实流式 Discuss、可复用模型席位、会话 BYOK、人工决定 Gate 和不含凭证的 IndexedDB Event Store。
- **真实证据 Gate：** 已于 2026-08-04 使用 OpenAI `gpt-5-mini` 与 Anthropic `claude-haiku-4-5-20251001` 完成；见[真实基线 001](evaluations/2026-08-04-v0.6-live-baseline.md)。
- **最近实现 Gate：** M2.7 已完成；下一步实现 M2.8 Turn Envelope 验证与 Canonical Meeting State。
- **已批准下一架构：** 会议协议蓝图 v1 的 M2.7 持久化基础已实现，结构化协议仍在计划中。
- **关键路径：** 真实基线 -> 本地 Event Store（已完成）-> Canonical Meeting State -> 可恢复的 Chair 编排器 -> Observer 与定向辩论 -> Whiteboard 与 Follow-up -> 比较评测。

协议重构不能从大型界面重写开始。先固定存储和状态契约；任何大型前端修改前必须创建命名备份。

## M0 产品机会与主张 - 已完成

明确“由人主持的结构化多 AI 审议”不同于并排比较模型答案。

## M1 交互原型 - 已完成

完成议题输入、角色选择、有限轮次、批判控制和决策产物。当前所有 AI 消息仍是模拟文本。

## M1.1 可见开发日志 - 已完成

在产品中展示当前能力边界、里程碑和 harness 假设。

## M1.2 项目连续性系统 - 已完成

加入项目章程、AI 交接、路线图、决策记录、中英文开发日志以及仓库级代理规则。

## M2 真实 Discuss 房间 - 当前

交付：统一模型适配器、2–3 个真实模型、流式独立提案、指定交叉审阅、有限追加轮次、保留异议的决策 memo，以及 token、延迟和成本报告。

完成条件：一个目标可以在没有模拟回复、重复调用和人工修数据库的情况下走完整个 Discuss 流程。

实现进度：产品和协议功能已完成，并通过模拟端到端流式测试。2026-08-04，真实 OpenAI + Anthropic 房间完成提案、交叉审阅、综合、用量报告、保存和 Human Gate。OpenAI 适配器现在会省略不兼容的可选生成参数，会议历史已迁入 IndexedDB。M2 在扩大比较证据并实现已批准结构化协议期间保持“当前”。

## M2.1 连接与费用护栏 - 已完成

交付：程序内会话级 BYOK、工作区连接状态、统一连接库、显式供应商选择、本地供应商提示、凭证验证、兼容模型发现、连接命名、事务式 Key 替换、模型刷新、确认断开、连接来源标识、调用次数预检和明确的不持久化说明。

完成条件：用户无需改代码即可连接两家供应商，清楚费用归属，完成有限会议，并且刷新后不存在被持久化的用户密钥。

## M2.2 可组合模型席位 - 当前

分离 Connection、Model、Role、Skill 和 Seat；允许重复供应商、逐席位模型、指定综合者，并显示供应商、模型与角色多样性。

已实现可复用连接、重复供应商席位、逐席连接管理、逐席模型和供应商中立角色。指定综合者、Skill 组合与多样性指标仍未完成。

## M2.3 角色与 Skill 库 - 计划中

加入有限角色宪法、可复用 Skill、本场工作状态、立场变化记录，以及由人批准后才能进入长期记忆的学习。

## M2.4 自定义连接 - 计划中

支持 OpenAI-compatible 与本地连接，并加入 HTTPS/主机策略、SSRF 防护、认证头配置、能力探测和未知价格降级。

## M2.5 持久化房间 - 当前

保存房间、事件、产物与导出；刷新或重新打开浏览器后可以继续会议。

实现进度：会议发言、memo、人工决定、用量、参与者快照、只追加的完成/失败 turn 事件、状态快照和 memo artifact 已保存到有数量上限的浏览器本地 IndexedDB 档案。用户可以新建房间而不删除旧记录、重新打开记录，并以事务方式删除记录。凭证不会进入档案。账号归属、服务端同步、导出和跨设备恢复仍未完成。

## M2.6 会议协议蓝图 v1 - 已完成

结果：在修改运行协议前，定义下一版有限 Discuss 架构。

已交付：Human Chair 控制模式、Chair Directive、Participant/Observer/Recorder/Final Synthesizer 边界、Turn Envelope、Canonical Meeting State、Round Brief、Process Report、Follow-up、版本化 Memo、上下文策略、输出上限、预算与停止策略、本地优先持久化、UX 注意力模型和实施顺序。

完成条件已满足：中英文蓝图明确区分已实现行为与已批准未来行为，并列出剩余开放决定。

## M2.7 本地 Event Store - 已完成

依赖：当前 v0.6 历史和已批准协议蓝图。

交付：供应商无关 `RoomStore`、IndexedDB 实现、schema version、从当前 localStorage 会议记录迁移、Room/参与者快照/append-only Event/State Snapshot/Artifact/Usage 集合、事务式房间删除和支持导出的读取接口。

安全边界：API Key、认证 header 和带凭证的 Connection record 不进入存储；系统角色和席位只保存 provider/model/role 快照。

完成条件已满足：`RoomStore` 初始化带版本的七个 IndexedDB store，事务迁移经过验证的旧 localStorage 记录，只持久化已完成或失败的 turn，在刷新后重建房间，把档案实际裁剪到 30 个房间，并且不会恢复凭证。浏览器验证迁移并重新打开了 3 个旧房间；两次刷新后 memo 和用量仍完整。

## M2.8 结构化 Meeting State - 计划中

依赖：M2.7。

交付：Turn Envelope 验证、短 statement 与 card 上限、Claim/Dispute/Assumption/Chair Directive/Human Choice/Follow-up record、确定性 Canonical Reducer、来源链、活跃状态 token cap、状态版本，以及无自动付费重试的 format-error 处理。

完成条件：模型输出只能通过验证事件更新房间；每个活跃状态项都能追溯到来源消息；渲染后的模型工作状态保持在配置上限内。

## M2.9 由人主持的可恢复编排器 - 计划中

依赖：M2.8。

交付：显式房间状态机、Auto/Checkpoints/Turn by turn、Raise Hand、append-only Chair Directive、安全边界暂停与恢复、用户选择最大轮数、定向额外 turn、幂等 transition ID 和中断恢复。

完成条件：Chair 可以在安全边界暂停、添加有范围的指令、继续且不产生重复供应商调用，并在刷新后恢复同一协议状态。

## M2.10 Observer、预算与定向辩论 - 计划中

依赖：M2.9。

交付：用户选择 Observer 模型、确定性 novelty/progress 指标、每完成一轮最多一次 Observer 调用、带来源 Round Brief、循环/偏题/过早同质化报告、round/turn/token/time 硬限制、价格未知时的提示性费用上限、启动前最大调用数，以及后续轮只路由到明确未解决分歧。

完成条件：每个额外 turn 都对应具体未解决问题；硬限制自动终止；软质量停止对 Chair 可见且可覆盖；Observer 不能修改状态或批准 Decision。

## M2.11 Decision Whiteboard 与 Follow-up - 计划中

依赖：M2.10。

交付：用户选择 Final Synthesizer；展示 Claim、立场变化、Dispute、assumption、Chair question 的 Meeting Whiteboard；卡片优先的实时发言；可展开原始审计；带来源 Round Brief；版本化 Decision Memo；Ask Author/Seat/Room/Synthesizer；定向修订；Memo amendment 再次进入 Human Gate。

完成条件：用户无需阅读完整 transcript 即可理解当前决定；每个重要 Memo 段落都能追溯来源；可以在不重开全员会议的情况下发起有范围追问；只能批准不可变 Memo 版本。

## M2.12 Discuss v1 评测与收束 - 计划中

依赖：M2.11；第一次基线测量在 M2.7 前完成。

基线进度：真实基线 001 已完成，发现跨模型有效增量、输出过长、任意生成阈值进入 memo、仅最终阶段有人类控制，以及 OpenAI 模型参数兼容缺口。

交付：保存单模型基线；当前 v0.6 与 Protocol v1 对比；代表性的产品、计划与架构问题；循环和同质化 fixture；中断与恢复测试；上下文增长测量；调用、token、延迟、费用和人工阅读负担报告；失败分类。

完成条件：证据说明结构化多模型协议在哪些情况下增加决策价值、何时应提前停止，以及费用和阅读负担是否可接受。未通过评测的功能在 Research 前被简化或移除。

## M3 审计账本 - 计划中

建立 Claim、Evidence、Dispute、Decision、Action、Artifact 和 Evaluation；最终决定可以追溯到依据、异议、修订和人工批准。

与 M2.8 的关系：M2.8 建立 Discuss 协议需要的本地房间记录；M3 在其上扩展证据感知、可查询审计实体，不重新开始数据模型。

## M3.5 Research 房间 - 计划中

加入检索、来源保存、核查队列、引用与时效信息；关键事实被标记为支持、矛盾或未解决。

## M4 Harness 编排器 - 计划中

加入状态机、上下文隔离、预算、停止规则、防重复调用和评测接口；每个额外轮次都必须对应一个明确未解决问题。

与 M2.9 的关系：M2.9 验证有限讨论状态机；M4 将同一控制模型扩展到工具调用、工作区修改、Executor/Reviewer 分离、确定性检查和 Action 幂等。

## M4.5 Execute 房间 - 计划中

优先本地执行连接器，加入最小权限、批准门、编码代理、独立 Reviewer 与确定性检查。

## M5 评测与加固 - 计划中

建立单模型基线、结果评分、回归场景、成本/延迟数据和失败恢复，证明多代理在哪些情况下有效或无效。

暂缓：多人协作、平台代付计费、模型市场、移动端、无人自治、广泛外部集成和云执行基础设施。

基于账号的 D1 房间同步也暂缓到具备身份、房间所有权、删除语义、加密边界和冲突策略之后。空 Drizzle/D1 骨架不算已实现持久化。
