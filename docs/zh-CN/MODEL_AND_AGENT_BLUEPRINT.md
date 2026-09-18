# 模型与代理蓝图

会议编排、结构化状态、上下文选择、预算、持久化和追问行为见[会议协议蓝图](MEETING_PROTOCOL_BLUEPRINT.md)。本文继续作为连接、模型、角色、技能和席位组合方式的基准。

## 产品原则

会议室编排的是可追责的不同视角，而不是供应商 Logo。连接、模型引擎、专家行为和会议状态必须分离，避免产品退化成模型市场。

Task Pack 会为具体用户工作组合这些对象。Review、Decide / Plan、Explore、Create 和未来 Play 可以推荐不同 Role Pack 与协议，而不改变 Connection 或 Model 所有权。

### 当前Plan诊断（D-057）

初始Builder/Reviewer适配器保留有界结束/用量元数据，不保存响应正文或私有推理。OpenAI完成/不完整事件及推理token字段参考[推理指南](https://developers.openai.com/api/docs/guides/reasoning)，Anthropic结束分类参考[stop reason文档](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)。未报告字段保持未知；传输失败或缺结束事件不能变成完成审阅。诊断不进入Plan prompt，不是权威账单、新账本，也不证明011耗尽额度。本轮不换模型或改输出上限，见[Plan问题清单](PLAN_ISSUE_REGISTER.md)。

## 核心对象

- **Connection**：管理供应商类型、密钥引用、可选 Base URL、允许的模型、费用承担者和能力信息。
- **Model**：某个 Connection 可调用的具体引擎。价格与能力是元数据，不能仅凭 API Key 判断免费层。
- **Role**：定义职责与决策视角，例如战略、批判、产品、技术、怀疑者和综合者；不绑定供应商。
- **Skill**：定义可重复的工作方法，例如假设审计、反例搜索、需求拆解、证据分类、实施规划和决策综合。
- **Seat**：本场会议中的一个参与者，由 Connection、Model、Role 和 Skills 组合；Seat ID 不能等于供应商 ID。
- **Room**：管理议题、席位、协议、轮次与费用预算、工具权限、记录、产物和人类决定。
- **Task Pack**：为一条产品线定义 Agenda schema、推荐 Role Pack、协议 phase、上下文策略、Artifact 类型、Human Gate 与评测 rubric。Task Pack 复用 Shared Core，并遵守[产品方向定稿](PRODUCT_DIRECTION.md)中的 Rule of Two。

## 多 Agent 边界

带 Role 的 Seat 不会自动成为自治 Agent。Agent 行为还需要任务所有权、独立状态或上下文、工具或行动、有限循环，以及可验证完成条件。只有任务拆分产生明确价值时才加入。Review 与 Decide 首先采用确定性编排；并行 Research 和隔离 Execute 是最先计划的多 Agent 候选。

## 准确描述多样性

产品分别显示供应商、模型、角色和 Skill 多样性。三个席位使用同一个 GPT 可以形成角色多样性，但不能包装成三个独立模型家族。

## 有限适应

每个席位可以维护本场工作状态：当前建议、假设、待解决问题、置信度、证据状态、接受或拒绝的批评，以及相对上一轮的变化原因。

固定角色宪法和 Skill 定义不得自动重写。跨房间记忆必须等到用户能够审阅、批准、删除并限定每一条学习的作用范围后再实现。

## 连接演进

1. 当前私人评测使用工作区运行时 Secret。
2. M2.1 加入仅保存在页面内存、刷新即清除的会话 BYOK。
3. 永久 BYOK 必须具备身份、加密存储、所有权检查、轮换、删除和日志脱敏。
4. 平台代付与积分计费继续暂缓。

## 界面阶段

- **设置**：建立至少两个可用连接，并说明费用归属。
- **议题**：定义必须做出的决定，组合席位，不暴露密钥控件。
- **会议**：突出当前发言者、阶段、审阅目标和实时输出，完整记录以缩略总览存在。
- **决定**：突出 memo、未解决异议、用量、修订预算和人类批准。

当 Artifact 需要时，Task Pack 可以重命名或替换“会议”和“决定”界面。Review 突出 Finding、Change Set、Artifact 版本与逐项接受；Create 突出当前章节和编辑修改；Play 未来需要公共与私有状态。连接可用后，Setup 应保持安静。

## 已实现的 Plan 质量配置（D-055）

当前 Plan Pack 使用课程安排、可行性与批判审阅的任务职责，不只依赖通用角色名。Builder 交付完整逐日记录，Reviewer 审阅实际计划，显式 Editor 只改选中意见对应天数，另一席位同时复核批评前提及修改效果。这仍是有界角色，不是自治 Agent；不会悄悄替换用户所选厂商/模型。

D-058规定：现有能力匹配范围内的`gpt-5`、`gpt-5-mini`、`gpt-5-nano`及日期快照，结构化Builder使用`low`；实际Plan Reviewer、修改、复核继续`medium`，普通讨论仍`minimal`。其他OpenAI ID及Anthropic/Gemini保留供应商默认，不保证各厂商推理强度一致或启用深度思考。请求档位是诊断证据，不代表已观察内部行为；不增加通用配置界面。

输出上限：Builder16K、Reviewer6K、显式修改12K、复核6K。D-056取消这些Plan调用的应用硬时间截止及累计Plan时间截止，普通讨论仍90秒。保留人工取消、token/调用额度及不自动重试；供应商/传输/宿主限制是另一层。Builder恢复仍只补缺失天；用户启动前披露独立修改额度。这些是上限，不是消耗目标或可见输出保证。OpenAI推理共用输出预算，不完整Plan响应保留已报告用量；[GPT-5模型页](https://developers.openai.com/api/docs/models/gpt-5)列出minimal/low/medium/high。Anthropic/Gemini thinking控制随模型而变，本轮不推断。

Gemini 输出统计包含 `candidatesTokenCount` 和 `thoughtsTokenCount`，thought 部分不会被当成交付 JSON；见 [Gemini 思考用量](https://ai.google.dev/gemini-api/docs/generate-content/thinking#pricing)。应用仍使用既有厂商通用估价，不是权威模型账单。仅为明确质量问题选择更强模型；实现配置不等于授权付费测试。

D-060规定：初始实际产物Plan Reviewer向明确受支持的Anthropic模型家族传入窄JSON Schema，包含Fable 5。不支持的ID省略`output_config`，也不推断`thinking`字段。供应商结构只控制传输形状；现有本地Plan validator继续执行请求特定语义边界，格式或语义失败永不自动重试。该能力尚未推广到Builder、修改、复核、普通Turn Envelope、OpenAI或Gemini。

## 暂缓扩展

任意端点市场、通用自治 Agent 平台、角色自主永久变异、隐藏长期记忆、把供应商多样性当成正确性，以及不受限制的代理执行。
