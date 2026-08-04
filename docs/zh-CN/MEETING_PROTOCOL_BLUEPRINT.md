# 会议协议蓝图 v1

状态：已批准设计；M2.7 持久化基础已实现
日期：2026-08-03

## 目的

本蓝图定义 v0.7 持久化基础之后的 Discuss 房间架构：把有限模型调用变成由人主持、可以恢复、可以控制费用的决策协议，并避免把不断增长的完整 transcript 当成所有模型的共享记忆。

系统必须保留这条链：

> 目标 -> 提案 -> 主张 -> 异议 -> 修订 -> 决定 -> 追问

完整原始记录继续供人查看和审计；模型只获得完成当前任务所需的有限工作上下文。

## 当前事实

### 截至 v0.7 已实现

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
- 七项自动测试和生产构建通过。

### 本蓝图已批准但尚未实现

- Auto、Checkpoints、Turn by turn 三种主持模式。
- Raise Hand 暂停和 append-only Chair Directive。
- 用户选择最大讨论轮数与多维会议预算。
- 结构化 Turn Envelope 和由代码拥有的 Canonical Meeting State。
- 系统级 Observer / Recorder 和单独选择的 Final Synthesizer。
- 对重复、偏题、过早同质化和循环的流程监测。
- 每轮 Round Brief，以及只针对分歧的后续辩论。
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
- Observer：最多 150 output tokens。
- Final Memo：600～900 output tokens。

界面以卡片为主，公开原文仍可为审计展开。用户针对一个 Claim 或 Seat 请求细节，而不是让整个房间提高 verbosity。

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

### 当前 v0.6

会议历史是有限的浏览器 `localStorage` 记录，适合产品验证，但不足以承担事件账本、大型原始输出、版本化产物、事务和 schema migration。

### 下一本地层

引入 `RoomStore` 接口并使用浏览器 IndexedDB 实现。初始持久集合包括：

- Rooms。
- Participant snapshot。
- Append-only room event。
- Canonical state snapshot。
- Round Brief 与 Decision Memo artifact。
- Usage ledger entry。

流式 delta 留在内存。完成时，一个 `turn.completed` 事件保存最终公开原文与 Turn Envelope；中断时保存 `turn.failed` 和有限部分文本。成功 Reduce 后和每轮边界写 State Snapshot。

### 未来服务端层

仓库已有 Drizzle SQLite/D1 骨架，但没有启用 schema 或 D1 binding。基于 D1 的 `ServerRoomStore` 必须等待身份、所有权、加密 Secret 边界和同步策略，不能成为所有访问者共享的匿名会议数据库。

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
7. 把单次流式请求拆成可暂停恢复的房间状态机。
8. 加入 Chair 模式、Raise Hand、Directive 和预算预检。
9. 加入 Observer、Round Brief、Monitor 软停止和定向辩论路由。
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

- 各供应商的精确结构化输出适配与 fallback。
- IndexedDB 选用库还是小型原生封装。
- 第一次真实供应商测量后的 token 上限。
- Observer 提取 fallback 默认开启还是仅由 Chair 批准。
- Export 格式，以及从 IndexedDB 迁移到账号存储的路径。
