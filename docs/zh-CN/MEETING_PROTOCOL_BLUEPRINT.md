# 会议协议蓝图 v1

状态：已批准设计；已实现至 M2.10c 由 Chair 选择的定向辩论
日期：2026-08-22

## 目的

本蓝图定义 v0.9 可恢复编排基础之后的 Discuss 房间架构：把有限模型调用变成由人主持、可以恢复、可以控制费用的决策协议，并避免把不断增长的完整 transcript 当成所有模型的共享记忆。

系统必须保留这条链：

> 目标 -> 提案 -> 主张 -> 异议 -> 修订 -> 决定 -> 追问

完整原始记录继续供人查看和审计；模型只获得完成当前任务所需的有限工作上下文。

## 范围边界

本文是已经实现的 Discuss 决策协议，也是可复用 Shared Core 能力的来源；它不是所有 Task Pack 必须照抄的统一阶段顺序。Review、Explore、Create、Research、Execute 和未来 Play Pack 可以定义不同状态记录、角色安排、可见性与 phase transition，同时复用供应商接入、持久化、预算、上下文隔离、来源链和 Human Gate。产品线顺序以[产品方向定稿](PRODUCT_DIRECTION.md)为准。

## 当前事实

### 截至 v0.10c 已实现

- OpenAI、Anthropic、Gemini 直接流式适配。
- 当前页面 BYOK 与工作区托管凭证。
- 供应商验证和兼容模型发现。
- 可复用 Connection，以及逐席选择 Model、Role 的供应商中立 Seat。
- 2～3 个参与席位。
- 独立提案、指定交叉审阅、一次综合和一次可选的全员修订轮。
- 人工批准、拒绝与请求修订。
- 停止控制和逐房间 token、延迟、估算费用。
- 发言聚焦和完整总览。
- 不含凭证的浏览器本地 `RoomStore`：带版本的 IndexedDB store 保存 room、参与者快照、只追加的完成/失败 turn 事件、状态快照、memo artifact、用量和迁移 metadata。
- 严格的跨供应商 JSON Turn Envelope、不自动重试的显式 `turn.format_failed` 事件，以及带来源链、版本、幂等、active-state 上限和有限上下文渲染的确定性 Canonical Reducer。
- Canonical Meeting State 持久化，并向后兼容恢复结构化状态之前创建的房间。
- 通过同一个持久协议状态机拆分 proposal、review 与 synthesis 请求。
- Auto、Checkpoints 与 Turn by turn 三种控制模式；Checkpoints 仍是默认模式。
- 在下一个安全边界 Raise Hand、限定范围的只追加 Chair Directive，以及用户选择 1～3 轮、协议硬上限 5 轮。
- 幂等 transition 日志、调用前状态持久化、已完成 turn 重复防护、显式中断恢复，以及不自动重试供应商请求。
- 向后兼容的 Meeting Budget、精确调用前 turn 限制、已观测 token/时间边界停止，以及已知失败 turn 用量统计。
- 带来源的确定性 Process Report；可逆的低进度、重复分歧与过早同质化警告会保存为只追加事件。
- 缓冲式 Turn 呈现：结构化原始 delta 不上舞台，只显示 Thinking、Generating、Validating；会议完成后等待用户主动打开 Decision。
- 不占参与 Seat 的可选用户指定 Observer Connection 与 Model；每个启用轮次一次计入预算、可恢复的 Review 后调用。
- Observer 上下文隔离到有限 Canonical State、确定性 Process Report 与引用白名单；严格验证带来源 Round Brief，不修改 state，也不自动重试。
- 不含凭证的 Observer 快照、只追加 `round.brief` 事件和 Round Brief artifact。
- Human Chair 在 Review checkpoint 选择一个开放 Dispute，并保存带来源的 targeted-debate plan。
- 确定性路由最多两个相关 Seat，不增加付费路由模型调用。
- 可恢复 targeted-debate transition 只使用明确 Dispute、关联 Claim、active Chair Directive 与有限来源 Message ID；不重放 transcript 或 prior Memo。
- 与 Review 兼容的定向增量最多 250 transport output tokens，随后生成仅针对该增量的 Process Report 与可选第二份 Round Brief。
- 十八项自动测试和生产构建通过。

### 本蓝图已批准但尚未实现

- 超出当前推导式 turn/token/时间边界的用户可编辑多维限制与权威费用执行。
- 单独选择的 Final Synthesizer。
- 超出确定性 fixture 的 Observer 语义偏题与非精确重复判断真实供应商评测。
- Claim 级追问和版本化 Decision Memo。
- 基于账号的 D1 持久化、同步与协作。

## 核心不变量

1. 人类在整场会议中都是 Chair，不只在最终 Gate 出现。
2. 多个模型重复同一观点不能自动成为证据。
3. Raw Transcript、Canonical Meeting State 和逐代理工作上下文相互分离。
4. 模型只能提交事件与状态变更建议；应用代码拥有 Canonical Meeting State。
5. 每个 Claim、Dispute、Round Brief 和 Memo 段落都保留来源 ID。
6. 修正通过新事件追加，不能静默重写审计历史。
7. 任何付费系统角色都必须出现在预检调用数与费用估算中。
8. 恢复房间不能恢复凭证，也不能偷偷用无关席位继续运行。
9. 每轮必须新增信息、改变立场、解决明确分歧、询问 Chair 或停止。
10. 质量指标不能替人批准 Decision。

## 角色模型

### Human Chair

拥有目标、约束、Chair Directive、预算变更、停止覆盖和最终批准权。

### Participant Seats

负责实质提案、异议、修订和专业判断，与供应商身份保持分离。

### Observer / Recorder

不占参与席位数量的系统角色。每轮完成后读取确定性指标与有限 Meeting State，生成短 Round Brief 和流程建议，但不能修改 Canonical State 或决定结果。

用户显式选择其 Connection 与 Model。界面可以建议低成本模型，但在没有权威价格时不能声称自动选出了最便宜模型。

### Final Synthesizer

不占参与席位数量的系统角色。用户显式选择 Connection 与 Model，也可以复用某个参与席位的模型。它读取最终状态、各轮 Round Brief、未解决分歧、Chair Directive 和少量高影响原文。

它可以组织 Recommendation，但不能删除分歧、把未验证主张升级为事实、修改 Chair Directive 或批准自己的 Memo。

## Chair 控制模式

### Auto

会议自动运行到硬停止或最终综合。Monitor 软停止会转入综合，不再自动开启全员轮次；最终仍需人工批准。

### Checkpoints - 默认

独立提案后和每轮辩论后暂停。Chair 可以继续、添加 Directive、要求定向辩论或进入综合。

### Turn by Turn

调度器每次只运行一个参与者，并在每次发言完成后暂停。控制最强，但延迟更高。

### Raise Hand

在 Auto 或 Checkpoints 中，Raise Hand 要求调度器在下一个安全边界暂停。它不会追溯修改已完成调用，也不会偷偷重发正在运行的调用。

## 协议状态机

```text
Setup
  -> Agenda
  -> Independent Proposals
  -> Assigned Cross-review
  -> Canonical Reduce
  -> Observer / Round Brief
  -> Optional Chair Checkpoint
  -> Targeted Debate on open Disputes
  -> Canonical Reduce
  -> Observer / Round Brief
  -> 在预算内重复或停止
  -> Final Synthesis
  -> Human Gate
  -> Follow-up or Amendment
```

第一轮在任何共享综合前保留独立提案。后续轮只把明确的未解决分歧交给相关席位。Final Synthesis 默认只运行一次；若被批准的追问改变结论，再生成新 Memo 版本。

## 数据契约

### RoomConfig

```ts
interface RoomConfig {
  objective: string;
  constraints: string[];
  controlMode: "auto" | "checkpoints" | "turn_by_turn";
  outputDepth: "concise" | "standard" | "deep";
  participants: SeatConfig[];
  observer: SystemModelConfig;
  finalSynthesizer: SystemModelConfig;
  budget: MeetingBudget;
}
```

持久化 RoomConfig 只保存 provider、model、role 和策略快照，不保存 API Key 或带凭证能力的会话 Connection ID。

### TurnEnvelope

```ts
interface TurnEnvelope {
  statement: string;
  card: {
    stance: "propose" | "support" | "oppose" | "revise" | "no_new_information";
    thesis: string;
    newClaims: Array<{ text: string; assumptionLevel: "low" | "medium" | "high" }>;
    claimUpdates: Array<{
      claimId: string;
      action: "support" | "oppose" | "revise" | "withdraw";
      reason: string;
    }>;
    objections: Array<{
      targetClaimId?: string;
      text: string;
      severity: "minor" | "material" | "blocking";
    }>;
    questionForChair?: string;
    recommendedAction?: string;
    confidence: { level: "low" | "medium" | "high"; reason: string };
  };
}
```

默认限制为一段短 statement、最多三个新 Claim、三个 Claim update、两个 objection 和一个 Chair question。Novelty 由系统计算，不能让模型自己给自己打分。

### Canonical MeetingState

```ts
interface MeetingState {
  version: number;
  objective: string;
  constraints: string[];
  activeChairDirectives: ChairDirective[];
  claims: Claim[];
  disputes: Dispute[];
  assumptions: Assumption[];
  openQuestions: OpenQuestion[];
  humanChoices: HumanChoice[];
  round: number;
  phase: MeetingPhase;
  usage: UsageSummary;
  remainingBudget: MeetingBudget;
}
```

Discuss 中的 Claim 默认未验证。状态区分 proposed、contested、provisionally supported、由 Chair 接受或拒绝，以及 superseded。模型一致不能存成事实验证。

初始容量限制：

- 8 个活跃提案。
- 12 个活跃 Claim。
- 6 个活跃 Dispute。
- 6 个活跃 assumption。
- 4 个未解决 human choice。
- 8 条活跃 Chair Directive。
- 渲染后约 1,200～1,500 个工作上下文 token。

已解决或被替代内容移出活跃上下文，但在持久历史中保留紧凑 ID 和来源链。

### ChairDirective

```ts
interface ChairDirective {
  id: string;
  kind: "constraint" | "correction" | "question" | "priority" | "veto";
  target: "all" | string[];
  text: string;
  status: "active" | "satisfied" | "superseded";
  createdAfterMessageId?: string;
  supersededBy?: string;
}
```

模型可以报告 Directive 看起来已经满足。只有人类或确定性协议规则可以改变其状态，只有人类可以 supersede 人类 Directive。

### RoundBrief 与 ProcessReport

```ts
interface RoundBrief {
  round: number;
  stateVersion: number;
  newClaimIds: string[];
  changedClaimIds: string[];
  resolvedDisputeIds: string[];
  remainingDisputeIds: string[];
  chairQuestionIds: string[];
  processReport: {
    convergence: "low" | "healthy" | "premature";
    loopRisk: "low" | "medium" | "high";
    driftRisk: "low" | "medium" | "high";
    recommendation: "continue" | "targeted_debate" | "ask_human" | "synthesize";
    reason: string;
  };
}
```

应用代码验证所有引用 ID。Observer 不能创建或删除 canonical record。

### FollowUp

Follow-up 可以指向 Message、Claim、Dispute、Round Brief 或 Decision Memo；受众可以是作者、选定席位、整个房间或 Final Synthesizer。Clarification 使用一次定向 turn；Targeted debate 消耗 turn 预算；重新开放广泛讨论才消耗 round。

附加在已批准 Memo 上的解释不能修改原 Memo。改变结论的答案生成版本化 Amendment 或 Decision Memo v2，并再次经过 Human Gate。

### DecisionMemo

每个 Memo 都保存自身版本、来源 MeetingState 版本、Synthesizer 的 provider/model/role 快照、引用的 Claim 与 Dispute ID、未解决假设、人工选择、下一步和批准状态。绝不持久化会话 Connection ID 或 API Key。

## 上下文策略

```text
Independent proposal:
  objective + constraints + active Chair Directives + role

Assigned review:
  objective + one target Turn Card + relevant Claims

Targeted debate:
  one Dispute + participant positions + bounded source excerpts

Observer:
  Canonical State + deterministic process metrics

Final Synthesizer:
  Canonical State + Round Briefs + high-impact source excerpts

Follow-up:
  user question + target lineage + relevant current state
```

默认没有任何 prompt 获得完整 transcript。稳定角色与协议指令放在动态上下文前，以便可用时利用供应商 prompt cache；缓存不能替代上下文选择。

## 输出策略

等待真实模型验证的默认输出上限：

- Proposal：300～450 output tokens。
- Review：200～300 output tokens。
- Targeted debate turn：150～250 output tokens。
- Observer：严格 JSON envelope 的 transport output 上限为 300 tokens；可见 summary 仍保持 2～4 句。
- Final Memo：600～900 output tokens。

界面以卡片为主。供应商 delta 属于传输数据，绝不能作为实时发言显示；在验证后的 statement 准备好前，舞台只显示有限的 Thinking、Generating 与 Validating 状态。公开原文仍可为审计展开。

面向用户的深度与工作上下文大小相互独立。房间可以同时发布 Executive Brief 和符合任务类型的详细 Artifact。详细 Artifact 保存给用户与审计，但默认不会重新塞入后续 agent prompt；定向追问只检索与问题相关的来源链和片段。

无法解析的结构化输出保存为 format failure 原始事件，不能进入 Canonical State；不自动付费重试。Chair 可以显式重试，或授权一次有限提取调用。

## 预算与停止策略

### 用户可见限制

- 最大讨论轮数：默认 2，普通范围 1～3，Advanced 硬上限 5。
- 最大 agent turn：根据席位数量与协议预计算；三参与者、两轮房间默认上限 12。
- 上述逐阶段输出上限。
- 房间 input-token 与 output-token 上限。
- 最大模型时间，建议默认 15 分钟。
- 只有存在权威模型价格时才提供最大估算美元硬限制。
- 启动前显示最大调用数。

如果逐模型价格未知，token、turn、round 和时间仍是权威限制；估算美元只能提示，不能假装是保证停止的账单金额。

### 硬停止

用户停止、轮数/turn/token/时间预算耗尽、没有可运行 Seat、协议状态非法，或超过显式重试规则的连续供应商错误，都会让编排器自动停止。

### 软停止

连续两个评估窗口没有新增 Claim 或立场变化、同一 Dispute 原样重复、未解决问题不变但费用增长、参与者只复述当前 Memo，或讨论偏离目标时，Monitor 建议暂停。

过早相似不能视为健康收敛。在尚未经历独立挑战、假设仍未解决时出现高度相似，应触发一次定向独立反对或 Chair Checkpoint。

Checkpoints 与 Turn by turn 中，软停止交给 Chair；Auto 中，软停止进入最终综合。它永远不能批准结果。

## 持久化架构

### 截至 v0.8 已实现

会议历史使用不含凭证的 IndexedDB `RoomStore`。旧的有限 `localStorage` 记录只迁移一次，并且无需凭空补造 Canonical State 也能继续读取。

### 截至 v0.9 已实现

每个 room snapshot 现在也保存 `MeetingProtocolState`。开始、完成与中断一个 phase 都会追加稳定 transition event；限定范围的 Chair Directive 追加独立审计 event。刷新后发现仍在 running 的 transition 会被转换为 `interrupted`，绝不自动恢复，必须由 Chair 显式操作；凭证仍然不进入持久化。

### 截至 v0.10a 已实现

`MeetingProtocolState` 还保存向后兼容的推导预算与有限确定性 Process Report。每份报告保留来源 State version 和 Turn ID，并持久化为只追加 `process.report` 事件。报告仍是流程产物，不能修改 Canonical State，也没有 Decision 权限。

### 截至 v0.10b 已实现

协议快照还保存 Observer 是否启用，并为每轮最多保存一份通过验证的 Round Brief。Observer transition 在供应商工作前持久化，计为一个系统 turn；中断恢复不会静默重试，并回到 Review checkpoint。不含凭证的 Observer provider/model 快照、只追加 `round.brief` 事件与 Round Brief artifact 保留来源 State、Process Report 与 Turn ID。旧房间解析时默认关闭 Observer，Brief 列表为空。

### 截至 v0.10c 已实现

协议快照还最多保存五条 `TargetedDebatePlan`。每条 plan 在供应商请求前记录一个开放 Dispute、来源 State version、有限来源 Message ID、路由 Seat ID 与消耗轮次。定向 transition 沿用现有 interrupted 恢复契约，绝不自动重试；旧房间解析时 targeted-debate 列表为空。

### 已实现本地层

供应商无关的 `RoomStore` 使用浏览器 IndexedDB，持久集合包括：

- Rooms。
- Participant snapshot。
- Append-only room event。
- Canonical state snapshot。
- Round Brief 与 Decision Memo artifact。
- Usage ledger entry。

流式 delta 只存在于传输层，不保存进 `TranscriptItem`。完成时，一个 `turn.completed` 事件保存最终公开 statement 与通过验证的 Turn Envelope；中断时保存 `turn.failed` 和有限失败说明。格式错误保存为 `turn.format_failed`，语义归并失败保存为 `turn.reduction_failed`。成功归并后的 Canonical snapshot 通过房间自动保存路径写入。

### 未来服务端层

仓库已有 Drizzle SQLite/D1 骨架，但没有启用 schema 或 D1 binding。基于 D1 的 `ServerRoomStore` 必须等待身份、所有权、加密 Secret 边界和同步策略，不能成为所有访问者共享的匿名会议数据库。

在产品声称可以跨页面导航连续运行之前，供应商 transition 必须移到 durable runner 边界之后。客户端通过 room event cursor 重连，可以断开视图而不取消已确认工作。状态未知的进行中调用保留 ambiguous 状态，并要求 Chair 显式选择恢复方式；重连绝不等于静默重试供应商请求。

无论本地还是服务端存储，都不能包含 API Key、认证 header 或带凭证的 Connection record。显式删除房间会删除本地 event、snapshot、artifact、raw response 和 usage record。

## UX 注意力模型

- Setup 聚焦 Connection、Seat、Observer、Final Synthesizer、控制模式和预算预检。
- Agenda 聚焦目标、约束、预期产物和停止条件。
- 实时发言聚焦一段短 statement 与 Turn Card。
- Checkpoint 聚焦 Meeting Whiteboard：新 Claim、立场变化、开放 Dispute 和 Chair question。
- 每轮完成聚焦 Round Brief 与 Process Report。
- Decision 聚焦版本化 Memo 与 Human Gate。
- Audit 与 Overview 保留可展开原文和来源链。

Human Gate 操作变为 Approve、Add Chair Direction、Request Targeted Revision 和 Reject。

## 实施顺序

1. 固定本蓝图与中英文决策记录。
2. 完成当前有限协议的第一次真实双供应商基线评测。
3. 协议和界面大修前创建命名备份。
4. 加入 RoomStore 契约和从当前本地历史迁移到 IndexedDB。
5. 加入 append-only Event、Snapshot、Artifact 与 Usage record。
6. 实现 Turn Envelope 验证与确定性 Canonical Reducer。
7. 把单次流式请求拆成可暂停恢复的房间状态机。**已完成。**
8. 加入 Chair 模式、Raise Hand、Directive 和轮数/调用数预检。**已完成。**
9. 加入 Observer、Round Brief 与一条由 Chair 选择的 Dispute 定向路由。**已通过确定性 fixture。** 下一步用一间明确预算的真实供应商房间验证组合路径；更广泛的 Monitor 执行仍待实现。
10. 加入 Final Synthesizer 选择、版本化 Memo 与来源关联 Follow-up。
11. 围绕 Turn Card 与 Meeting Whiteboard 重做 Meeting UI。
12. 运行费用、质量、循环、中断、持久化和单模型基线评测。

## 评测 Gate

协议不能因为能运行就算完成，必须证明：

- 比强单模型基线产生更多决策有效异议或更好的解决方案。
- 上下文增长低于 transcript replay。
- 在声明边界内稳定终止。
- 不静默丢失少数意见或 Chair Directive。
- 刷新或中断后正确恢复但不恢复凭证。
- 最大调用数透明，费用估算不误导。
- 每阶段用户都能读懂，不必阅读完整 transcript。

## 明确暂缓

- 在结构化状态行为验证前加入语义 embedding 与 vector search。
- 没有权威价格时自动选择“最便宜模型”。
- 身份和所有权前做跨设备或多人同步。
- 认证和加密前做永久 API Key 存储。
- 自动接受 Decision。
- 在第一次协议重构中同时加入 Research 证据检索和 Execute 工具。

## 剩余开放决定

- 供应商原生 structured-output 模式是否能显著提高可靠性，值得在逐供应商 adapter 内替换跨供应商 JSON prompt。
- 第一次真实供应商测量后的 token 上限。
- Observer 提取 fallback 默认开启还是仅由 Chair 批准。
- Export 格式，以及从 IndexedDB 迁移到账号存储的路径。
