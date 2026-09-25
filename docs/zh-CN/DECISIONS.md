# 决策记录

## D-001 人类主持 - 已接受

人类控制目标、权限、预算和最终验收。多模型共识仍可能错误，不能替人承担后果。

## D-002 一个产品，三种权限 - 已接受

Discuss、Research、Execute 是同一个产品内的权限等级，共用审议与审计内核。

## D-003 审计优先于模型聚合 - 已接受

优化可追踪的主张、分歧、决定、行动与结果，而不是同时显示多少模型。

## D-004 角色与供应商解耦 - 已接受

Strategist、Critic、Researcher、Builder、Reviewer、Chair 是角色配置，不绑定某个供应商。

## D-005 开发顺序 - 已接受

先做真实 Discuss，再做 Research，最后做 Execute；逐步验证共同内核并控制风险。

## D-006 控制面与执行面分离 - 已接受

网页负责会议和批准，本地连接器或隔离云环境负责高权限执行，网页不直接获得用户机器的无限权限。

## D-007 有限审议 - 已接受

房间必须有轮次、重试、成本、权限和停止边界，防止循环、重复动作与无效审阅表演。

## D-008 服务端供应商密钥 - 已由 D-011 取代

API Key 只保存在服务端运行时环境，不能输入或返回浏览器。

## D-009 M2 不自动重试供应商 - 已接受

失败或中断的流直接显示给会议，不自动重试，避免重复扣费和混合两次不同答案。

## D-010 统一供应商流协议 - 已接受

服务端直接接入各供应商流式 API，再转换成统一 NDJSON 会议事件，使客户端不依赖供应商 SSE 格式和密钥。

## D-011 两级连接密钥 - 已接受

工作区密钥继续作为服务端运行时 Secret；用户 BYOK 密钥在没有登录与加密存储前，只能保存在当前页面内存，并通过同源会议请求即时使用。不得写入浏览器存储、URL、日志、会议记录或 API 响应。

## D-012 分离 Connection、Model、Role、Skill 与 Seat - 已接受

Connection 管理凭证与供应商设置，Model 是连接提供的引擎，Role 定义职责，Skill 定义工作方法，Seat 将它们组合成本场会议参与者。这样才能支持混合供应商、重复供应商、模型比较、专家预设和未来的本地模型。

## D-013 有限代理适应 - 已接受

代理可以在一场会议内更新立场、假设、置信度和待解决问题，但不能静默修改长期角色、技能或跨房间记忆。长期变化必须经过人类审阅。

## D-014 阶段聚焦的会议界面 - 已接受

主界面遵循“设置、议题、会议、决定”四个阶段。配置和项目历史完成后收起，AI 发言占据主要视觉焦点，完整记录通过缩略总览随时查看。

## D-015 大型前端修改前建立命名备份 - 已接受

每次大型界面重构前创建 Git 备份标签，并在开发日志中记录恢复点，允许持续探索而不丢失已经验证的版本。

## D-016 模型发现前必须显式验证 - 已接受

会话连接只能使用用户明确选择的供应商，或高置信度的本地 Key 前缀提示，然后由用户触发一次服务端模型列表请求。无法判断的 Key 不得发给多家供应商试探。这样可以让凭证去向可检查，避免不必要的第三方披露，并确保席位只选择该连接实际返回的模型 ID。

## D-017 一个连接库，席位只保存引用 - 已接受

Setup 维护唯一的可复用 Connection Library。Seat 选择命名 Connection、该连接发现的一个 Model 和一个 Role；逐席 Manage 进入同一个连接库，不能复制第二套凭证编辑器。已保存的 Key 不回显、不原地编辑，只能在新 Key 验证成功后事务式替换。这样可以支持重复供应商和共享 Key，同时避免复制 Secret 或把复用连接误认为多枚凭证。

## D-018 会议内容与凭证使用不同生命周期 - 已接受

把浏览器本地的有限会议记录作为 M2.5 连续性切片，保存目标、发言、memo、决定、用量和供应商/模型/角色摘要；绝不保存 API Key、Connection ID 或包含凭证的连接记录。从恢复记录发起修订前，当前可用席位的供应商、模型和角色必须与原会议匹配。用户需要在新建会议后仍能查看旧推理，但会话 BYOK 仍必须在刷新时清除；将长期产物与临时权限分开，可以避免历史恢复偷偷恢复凭证，或用无关席位继续旧会议。

## D-019 Human Chair 权限贯穿整个房间 - 已接受

Discuss 房间支持 Auto、Checkpoints、Turn by turn 和 Raise Hand 暂停请求。人类输入追加为有范围、可审计的 Chair Directive，不能重写目标或旧消息；默认模式为 Checkpoints。只有最终批准按钮并不等于由人主持，用户需要在有限边界内添加约束、纠正、优先级、问题或 veto，同时不能为每条指令强制所有参与者付费回复“收到”。

## D-020 Canonical State 与 Transcript、模型上下文分离 - 已接受

公开原始回复供人和审计保存；确定性应用代码拥有有限 Canonical Meeting State；每个 agent 只接收相关状态和来源片段。模型只能提交经过验证的 Turn Envelope 与状态变更建议，不能直接拥有 canonical state。这样可以避免不断重放 transcript 带来的费用、延迟、重复和上下文退化，同时通过来源链保留 Claim、Dispute、假设、立场变化和人工选择。

## D-021 系统角色显式且计费可见 - 已接受

Participant Seat 负责实质贡献；Observer / Recorder 和 Final Synthesizer 是不占参与席位数量的独立系统角色，各自由用户选择 Connection 与 Model。Observer 只报告流程并创建 Round Brief，不能修改状态；Final Synthesizer 只组织版本化 Memo，不能删除分歧或批准 Memo。这样行政模型工作不会吞掉一个参与视角，也不会隐藏费用、供应商偏差和责任。

## D-022 本地优先的 Append-only Room Store - 已接受

用供应商无关 RoomStore 替换当前有限 localStorage 档案，第一实现使用浏览器 IndexedDB，保存 Room metadata、参与者快照、append-only Event、Canonical State Snapshot、Artifact 与 Usage。只有具备身份、房间所有权、删除、加密和同步策略后才加入 D1 Server Store。可恢复协议需要事务、schema version、事件恢复、来源链和产物版本；直接启用共享匿名服务端数据库会制造所有权与隐私问题。

## D-023 最大轮数是边界，不是工作配额 - 已接受

用户选择最大轮数而不是必须跑满的轮数。默认 2，普通范围 1～3，Advanced 硬上限 5。round、turn、token、time 和可运行席位等硬限制自动停止；重复、偏题、过早同质化和低 novelty 是 Monitor 软条件，在人工模式暂停，Auto 模式进入综合，但永远不能批准 Decision。这样既防止无限消耗，又避免一个可能出错的 Monitor 把正常收敛误判为循环并静默结束会议。

## D-024 先使用跨供应商 JSON Envelope，再评估供应商专用结构化输出 - 已接受

M2.8 通过三家供应商的普通文本生成 API 请求同一个有限 JSON Turn Envelope，再由应用拥有的严格 validator 处理。应用可以确定性移除包住整个响应的一层 `json` code fence，并把省略的 `newClaims`、`claimUpdates` 或 `objections` collection 归一为空数组；但响应前后存在说明文字、无效 JSON、额外字段、未知 Claim 引用或 active-state 超限仍会产生显式失败事件，不能自动发起提取或供应商重试。只有测量过能力与流式差异后，才可以在 adapter 内增加供应商原生 structured-output 模式。这样 OpenAI、Anthropic 与 Gemini 使用同一 canonical 规则，供应商 API 不能拥有会议状态，也不会由隐藏修复调用额外花钱或改变原始答案。

## D-025 持久化 Phase Transition 与显式中断恢复 - 已接受

供应商工作以明确的 proposal、review 与 synthesis transition 运行。客户端在每次调用前先持久化协议状态，分配稳定 transition ID，记录已完成 turn ID，并只在安全边界暂停。刷新后仍显示 running 的 transition 会转换为 `interrupted`，绝不自动恢复或重试；Chair 显式恢复时会创建新的 transition，并提示此前未确认的请求可能已经产生费用。

浏览器本地 BYOK 客户端没有服务端幂等账本，无法在刷新或未知网络故障后保证账单 exactly once。持久意图、完成项重复防护和由人控制的诚实恢复，可以阻止自动重复调用，同时不假装不确定的请求从未到达供应商。

## D-026 修订请求不能归档 Claim - 已接受

AI 提交的 `revise` update 会保留被引用 Claim，将其标记为 contested，并记录审阅席位反对当前表述；只有明确的 `withdraw` update 才能归档 Claim。后续由 Chair 决策或带来源链的替代 Claim 解决或取代它。

并行审阅者基于同一份 Canonical State 生成结果。若允许先处理的审阅者归档共享 Claim，后续原本有效的引用就会依赖处理顺序，而且会把本应属于 Human Chair 的权限交给 AI Reviewer。

## D-027 先建立确定性安全信号，再加入付费 Observer - 已接受

编排器先拥有向后兼容的 Meeting Budget 和带来源的 Process Report，再加入付费 Observer。已经启动的供应商 transition 会保守计入精确 turn 上限，包括 interrupted 工作。已观测的 input token、output token 与模型时间会在下一个安全边界阻止新 transition；进行中的 transition 仍可能越过这些观测上限。格式失败与语义归并失败的已知用量也必须计入。确定性结构指标只能建议一个可逆的 Chair 暂停，不能修改 Canonical State、批准 Decision 或声称完成语义验证。

调用次数限制和结构化增量不需要另一个模型。先建立确定性底线，可以让未来 Observer 判断更便宜、更可审计，也不能用另一条付费意见掩盖基本预算或循环缺陷。

## D-028 只有验证后的 Turn 才能占据舞台 - 已接受

供应商 delta 属于传输与潜在审计数据，不是面向用户的发言。生成期间，Meeting 舞台只显示有限进度状态；只有通过验证的 Turn Envelope statement 与 card 才成为公开会议内容。若策略选择保留原始输出，它也只能在显式 Audit 界面或失败记录中提供。

可移植 JSON Envelope 是机器接口。把它的半截字节直接渲染出来会暴露实现细节、造成滚动抖动，也会让一个正常但较慢的流在完成验证前看起来像故障。

## D-029 用户交付物深度与工作上下文大小相互独立 - 已接受

每个房间可以同时生成精简 Executive Brief 和符合任务类型的详细用户 Artifact；后续模型调用仍只接收有限 Canonical State、Round Brief 与选定来源。详细 Artifact 默认不会重新塞回 agent 上下文。

精简模型记忆用于控制成本，但不能因此强迫用户只得到浅薄结果。用户可以把阅读负担交给会议，并获得完整计划、审阅或决策包。

## D-030 任务自适应 Role Pack，房间内职责稳定 - 已接受

Decide、Plan、Review、Research、Build 等 Agenda 模板可以推荐参与者 Role Pack 和逐轮任务；角色保持供应商无关，并在房间内稳定。独立配置的 Final Synthesizer 仍位于参与席位数量之外；复用参与者做综合是显式省钱模式，不是默认架构。

三个通用角色无法为所有目标制造同样有效的张力。任务化职责可以改善覆盖，同时避免角色随意漂移，也不会隐藏综合偏差与费用。

## D-031 Durable Transition 必须超越单个页面生命周期 - 已接受目标

M2 之后的本地架构会把供应商 transition 执行移到 durable runner 边界之后，UI 通过已持久化事件与 cursor 重连。离开页面只会断开视图，不会暂停工作；状态不明的进行中请求绝不会被静默重启，也不会被伪装成已经完成、可无风险恢复的 transition。

React 页面生命周期不适合可靠拥有耗时且可能计费的工作。基于事件的重连可以提供连续性，同时保留 D-025 已建立的诚实中断和重复计费边界。

## D-032 后续回合必须明确并路由一个 Dispute - 已接受

初始提案与交叉审阅完成后，只有 Human Chair 选择一个开放 Dispute，才能启动额外辩论回合。应用代码确定性路由最多两个相关 Seat，并在供应商工作前记录 Dispute、来源 State version、来源 Message ID 与路由 Seat；每个 Seat 只提交有限 Review 增量。本路径不增加路由模型调用，也不重放完整 transcript。

最大轮数是一条权限边界，不是重跑全员会议的理由。明确未解决问题可以让每次额外调用都能归因，限制上下文与阅读负担，并让中断恢复继续遵守诚实的计费语义。

## D-033 任务模式与权限等级相互独立 - 已接受

Review、Decide / Plan、Explore、Create 和未来 Play 是同一个产品内的 Task Pack。Discuss、Research 与 Execute 继续作为决定可用工具和权限的等级。每个 Task Pack 采用足以完成工作的最低权限。

用户要完成的工作和房间拥有的权限是两件事。将它们分开，可以在不拆分产品、也不授予多余工具的情况下支持创作、分析、研究、执行和模拟工作流。

## D-034 产品线驱动共享核心生长 - 已接受

在精简 Shared Core 上一次开发一条端到端 Task Pack。只有至少两个经过验证的 Task Pack 都需要某个抽象时，才把它提升到 Shared Core；否则保留在具体 Pack 内。

脱离用户证据设计通用平台会制造猜测性抽象并推迟可用结果，而多个完全独立产品又会重复供应商接入、持久化、预算与批准边界。Rule of Two 在避免再次基础设施先行的同时保留复用。

## D-035 Review 是第一条以 Artifact 为中心的纵向切片 - 已接受

完成一次有限真实供应商 v0.10c 验证后，下一个产品里程碑是 Review Task Pack。它接收目标、Artifact v1、用户提供的来源和真实性边界，生成独立 Finding、有限交叉审阅、结构化 Change Set、Artifact v2、独立改动核验，以及逐项 Human Gate 决定。简短摘要与详细 Artifact 分开输出。

Review 可以直接验证结构化模型差异是否产生单个强模型遗漏、且用户最终接受的重要改进。它把现有会议机器转化为用户可感知结果，并能在简历、产品文档和技术计划 benchmark 上评测。

## D-036 多 Agent 自治必须具有明确任务拆分优势 - 已接受

多个模型 Seat 默认不会变成自治 Agent。只有子任务彼此独立有用、参与者需要不同工具或私有上下文、输出具有明确合并契约且结果可以验证时，才加入多 Agent 行为。Research 是第一个计划候选；Execute 必须等待隔离工具和 Human Gate。

额外自治循环会成倍增加费用、协调失败、权限和恢复复杂度。Review 与 Decide 首先使用确定性编排；通用 Agent 平台不是产品价值的前置条件。

## D-037 产品证据约束基础设施工作 - 已接受

不连续进行两个纯基础设施里程碑。每个产品里程碑以真实案例和保存的基线结束；每个新增付费模型调用必须写明预期信息增量；证据不足的功能应被简化、改成可选或删除。

项目此前让编排器成熟度超过了用户结果。显式校正规则确保工程可靠性服务于被接受的 Artifact 改进，而不是把协议完成误当作产品成功。

## D-038 并行 Phase 容量与契约由代码强制 - 已接受

Canonical State 必须在并行 phase 开始前为该有限 phase 的所有合法结果预留容量。Proposal、Review、targeted debate、Observer 与 synthesis 的上限必须由应用 parser 和专用 schema 强制，不能只写在 prompt 中。Targeted debate 使用最小增量 Envelope，而不是通用 Review Envelope。

真实烟雾评测证明：当第一份已接受结果占用共享 State 容量后，原本各自合法的并行 Review 会依赖完成顺序；同时，让一个小型定向 turn 序列化无关的空字段也会耗尽输出预算。由应用强制最坏情况容量和任务专用契约，可以让付费结果与完成顺序无关、可归因，同时保持调用有限。

## D-039 Review 来源属于任务输入，Finding 属于 Canonical Record - 已接受

Review 将目标、Artifact v1、用户参考资料和真实性边界保存为有限、不含凭证、与 transcript 分离的 Task Pack。独立 reviewer 收到同一 Task Pack，并把 Finding 发布为带来源的 canonical Claim。交叉 Review 可以再次读取 Task Pack，但 synthesis 只接收 Canonical Findings 和有限 turn 摘要，不接收原始 Artifact。Artifact v1 保持不可变，直到显式 Editor phase 生成 Change Set 和 Artifact v2。

Reviewer 需要共同证据才能产生有意义的分歧，而后续阶段需要稳定结论，不需要反复读取整份文档。分离来源材料、Finding 和生成 Artifact，可以保留审计链、限制上下文增长，并避免总结模型悄悄改写用户原稿。

## D-040 Human Chair 的 Finding 决定是有约束力的记录 - 已接受

日期：2026-08-26

Review Finding 的 Accept/Reject 是类型化 Human Choice，不是自由文本 prompt 提示。它会把 Canonical Claim 更新为 `accepted_by_chair` 或 `rejected_by_chair`，解决关联 Dispute，并作为 append-only `human.choice` 事件持久化。后续模型的支持、反对或 objection 可以增加审计来源，但不能覆盖该决定。每个 Review prompt 都会收到可信应用日期。最终 Review synthesis 读取 Canonical State，把 rejected Claim 作为必须排除项、accepted Claim 作为必须纳入项，并必须通过 D-038 中由代码强制的 Review Brief 契约。

Review Benchmark 001 表明，多个模型可能自信地重复同一错误推断，也可能忽略自由文本 Chair 纠正。第二次运行证明，确定性的逐项决定可以阻止该错误重新进入 canonical 结果。因此，人类权限必须体现在状态和校验中，而不能只写进下一次模型请求。

## D-041 Artifact v2 由带来源 Change Set 确定性生成 - 已接受

日期：2026-08-26

Review Editor 只能针对不可变 Artifact v1 提交数量有限、互不重叠的精确替换，并且每个替换必须引用一个或多个 Human Chair 已接受的 Finding ID。应用代码负责校验并应用声明的替换，生成 Artifact v2；模型不能直接提交不透明的整篇改写。独立 Verifier 只接收用户来源、真实性边界、已接受 Finding 和声明的改动内容，并对每项 Change 恰好返回一条检查。详细 Artifact、Change Set、验证结果和确定性 Executive Brief 保持为独立 Artifact。在独立系统角色配置得到证据支持前，显式复用两个可见参与 Seat 作为 Editor 与 Verifier，并计入预检。

自由改写容易隐藏无依据修改，而核验整篇文档会重新造成上下文增长，并削弱修改归因。由应用确定性应用 Change，可以保留未修改文本、精确 Finding 来源链、有限 Verifier 上下文和可审计 Human Gate，同时不必为了压缩模型工作记忆而牺牲用户交付物深度。

## D-042 独立完成的付费子阶段必须有 Durable Receipt - 已接受

日期：2026-08-26

当一个付费子阶段生成了后续付费子阶段需要的已验证 Artifact，应用必须在后续调用前持久化该结果，并且只恢复失败的子阶段。Review Editor 完成后创建带来源版本的 `ReviewEditCheckpoint`；Verifier 恢复必须匹配同一 Artifact v1、已接受 Finding、State 版本和 Editor 快照，并且只路由 Verifier。预检最多预留一次有限 Verifier 恢复调用。没有匹配 receipt 的 interrupted transition 不能声称支持子阶段恢复。

Artifact v2 Benchmark 002 中 Editor 已完成，但 Verifier 格式失败。旧组合 transition 消耗两个 agent turn，显示 Resume，随后却因预算停止；若增加预算，还会重复已经成功的 Editor。Durable receipt 让恢复承诺真实、阻止重复费用，并让审计边界与独立有用的工作保持一致。

## D-043 付费评测采用分阶段成本阶梯 - 已接受

日期：2026-08-26

供应商相关修改按四级 Gate 评测：零成本确定性测试、一次固定单阶段真实供应商探针、一次短合成端到端烟雾测试，然后才是一次真实完整 benchmark。Stage Replay 接受显式 connection 和 model，使用服务端持有的匿名 fixture，在阶段专属输出上限内最多调用一次，不重试，也不创建或修改 Meeting。后续阶段的缺陷不能成为重新构建已验证付费子阶段的理由。

完整 Review 运行在诊断 Verifier 格式边界时，会重复支付 proposal、cross-review 和 Editor 成本。隔离最小不确定阶段，既保留正式供应商 adapter 的真实性，也降低 token 成本、延迟、重复工作，以及陷入无关协议优化的诱因。

## D-044 Chair Finding 修正必须带来源，验证必须拆成两个维度 - 已接受

日期：2026-08-26

在 Review checkpoint，Human Chair 只有通过追加一条新的已接受 Claim，才能补充遗漏 Finding 或 supersede 现有 Finding；新 Claim 必须包含来自 Artifact v1、用户参考资料或真实性边界的精确原文。旧 Claim 会以 superseded 状态保留在历史中。改动部分 Verifier 分别判断授权来源链和语义正确性；Chair 接受 Finding 并不能证明其前提或改写质量。应用代码负责推导整体状态，并把所有 unsupported 或 unverifiable Change 确定性加入 Remaining Human Checks。

Benchmark 005 表明，两个模型可能同时漏掉显式约束，Verifier 也可能因为某项改动能追溯到已接受 Finding，就错误放行质量不足的改写。人类修正必须进入 canonical Artifact 流水线且不能静默篡改历史，而验证必须足够独立，能够质疑已经授权但前提错误的修改。

## D-045 工作 Turn 与用户产物使用独立契约 - 已接受

日期：2026-08-27

Proposal 与 cross-review statement 继续作为简短、有限的工作上下文。Decide / Plan synthesis 是独立用户产物，拥有更大的输出与显式恢复预算、固定顺序段落，以及针对任务形态的验收检查。Synthesis 不能通过管理性质的 Claim delta 修改 Canonical State。恢复 phase context 时，使用保存 transcript 与 Canonical State 的交集，排除废弃 transcript 分支；在 provider 启动前发生的本地拒绝不消耗 provider 调用额度。日程计划必须覆盖每个请求单元；LeetCode 目标明确要求建议题目时，必须给出具体题号，不能只给类别标签。

Smoke 006 证明协议可以完成，但最终计划仍可能没有满足用户请求。简短模型工作记忆不能迫使用户产物同样浅薄，transport 成功与模型共识也不能代替产物验收。

## D-046 详细计划需要可寻址 Record，而不是单个自由文本 Memo - 已接受

日期：2026-08-27

详细日程属于结构化 Plan Artifact；每个请求单元由应用代码独立校验和渲染。MEU 等工作量算式是显式字段，不是 prose 建议。简短 Decision memo 可以概括 Plan，但不能成为它的唯一表示。恢复只针对缺失或无效单元，不能重放有效单元、proposal 或 review。

Smoke 007 把 synthesis 上限提高到 4,800 tokens，但模型在 2,092 tokens 时结束并遗漏 Day 2。契约正确拒绝了产物，证明 transport 容量不能让单个自由文本响应自动成为可靠的多单元交付物。

## D-047 每个开发切片都必须经过产品校正 Gate - 已接受

日期：2026-08-27

每个开发切片在扩大实现前，必须记录已观察失败、用户 Artifact、baseline、最小假设、预期信息增量、验收检查、成本边界与停止条件。评测必须分别报告机械完成、语义可靠性、Artifact 可用性、Human Gate 采用、体验、经济性和交叉审阅独有改进。用户 Artifact 失败时，机械通过不能成为继续打磨通用编排的理由。供应商相关工作继续遵循本地测试、stage replay、短 smoke、真实 benchmark 阶梯。强制流程以 `DEVELOPMENT_CORRECTION_LOOP.md` 为准，并写入仓库 Agent 指令。

最近多次运行持续改善协议恢复、格式拒绝与 transport 上限，但最终 Review 或 Plan Artifact 仍然浅薄、语义薄弱或不完整。如果没有强制校正点，每个局部修复都会扩大一条产品价值尚未证明的流程。书面假设和停止条件让简化、删除与暂缓成为正式结果，而不是默认继续增加实现。

## D-048 人工 Review 编辑创建新 Artifact 版本，不能继承模型 Verification - 已接受

日期：2026-08-27

在 Review Human Gate，Chair 只能编辑已声明 Change 的 `after` 值。Change ID、Finding 来源链、位置、原文、理由和 basis 保持不可变。应用代码把完整有限 Change Set 重新应用到不可变 Artifact v1，并把结果保存为 Artifact v3，同时记录被编辑的 Change ID 和准确的来源 Artifact v2 身份。原 Verifier 结果继续属于 v2；界面不能把它表述为已经验证人工编辑文本。本操作不调用供应商。

整体批准迫使用户在接受薄弱模型改写和付费再开一轮之间选择。保留 Change 身份并把人工 replacement 版本化，可以在不伪造 verification、不削弱 lineage、也不增加 token 成本的情况下提供直接控制和审计。

## D-049 Review 批准把当前可见 Artifact 发布为不可变 Snapshot - 已接受

日期：2026-08-27

批准 Review 会创建一份不含凭证的 `ReviewApprovedArtifact`，精确绑定当前可见 Artifact v2 或 Human Revision v3、来源 State version、Review result 身份、Change Set、原模型 verification、人工编辑 Change ID 与批准时间。批准 snapshot 和房间决定通过同一个保存边界持久化；失败时两者与协议完成状态一起回滚。拒绝不会创建 approved snapshot。本地不可变表示由应用校验版本身份并在批准后禁止编辑，不代表加密签名或跨设备权限。

仅有房间级 `approved` 标记无法证明 Chair 接受的是哪份 Artifact 文本和 revision。冻结准确可见结果可以闭合本地审计链，同时保持诚实 verification scope，也不会过早引入身份、签名或同步基础设施。

## D-050 Review 对照分开公开输入、评测答案与因果归功 - 已接受

日期：2026-08-27

M2.12 用固定版本公开来源包对照强单模型、人工转贴审阅与现有 Review 流程。评测专用问题锚点和人工参考产物不得进入模型上下文或评分中的 Chair 干预；缺失基线继续标未运行。发现、产物修复、误报、人工前后采用和经济性分别评分；只有有依据的反对促成实质、被接受且可比较基线未有的修改，才归功交叉审阅。必须披露调用次数不同，不能单凭不同次数证明模型多样性优势。

否则格式通过、模型一致、改措辞或人工补正都可能被误认为产品差异化价值。小型离线包让下一次付费调用可解释，无需另造评测平台或修改会议运行时。

## D-051 回执不依赖下载，估价披露来源 - 已接受

日期：2026-08-27

现有 S1 回执通过完整可选中 JSON、复制和下载访问，不增加供应商调用。新 Replay 估价记录实际供应商通用费率及各项默认/运行时覆盖来源；默认值或人工覆盖都不等于已验证模型价格。缺失历史来源保持未知，不暗示账单、持久化回执或追溯验证。

S1 009 暴露了下载取回失败和看似精确的通用估价。开放现有证据及实际费率依据即可解决，不重跑付费工作，也不引入价格市场。

## D-052 保留原文也是有效的人工审阅结果 - 已接受

日期：2026-08-27

完成 Review 检查点、没有进行中任务、已接受 Finding 或待决定的活跃 Finding 时，Chair 可逐字保留 Artifact v1。结果先持久化，保持待批准、空 Change Set、无 Editor/Verifier 署名及 `not_run` 状态。不证明事实正确、不自动批准，也不把原文标成 v2。既有人工批准冻结 v1；明确请求下一轮时先保存再清除当前结果，保留历史产物。先保存原文结果再展示界面。

旧流程必须接受至少一个 Finding 才能结束，反而鼓励无用修改。用户权威也包含拒绝全部修改而不额外付费或伪造验证通过。

开发顺序：按用户要求关闭评测工具扩建，M2.12 余下对照暂缓，不视为通过。可以继续有明确边界的主流程修正，下一项处理已知详细 Plan 交付失败，不等更多工具或付费对照。不授权新增模型花费、广泛 Task Pack 扩张或比较优势结论。

## D-053 计划保留有效日期，并审阅真实产物 - 已接受

日期：2026-08-27

主动选择 LeetCode Plan 后采用固定天数/MEU/时间契约、独立校验的 JSONL 日记录，以及不进入 Canonical State 的详细产物。Builder 恢复只请求缺失/无效天，不覆盖已接受日期。另一席位读取实际完整计划，返回关联日期的关注点和未解决假设，不颁发正确性证明。产物初始两次调用、一次显式恢复额度，不自动重试。完整且已审阅计划由用户批准为准确快照；本切片生成后改契约需新房间。

旧自由文本摘要能发现缺天，却保不住其他有用结果。按天保存和对实际交付物的审阅直接处理这个失败，不新增通用 runner。整数工作量和时间检查只是机械检查，题目身份/难度和教学质量仍未核实；语义改写留给未来显式由人控制的路径，不自动应用。

## D-054 人工修改计划保留原审阅范围 - 已接受

日期：2026-08-27

完整且经过审阅的 Plan 在批准前允许显式人工逐天修改，不调用供应商、不改变契约。应用重新校验完整派生产物，并在不可变原版之外保存带来源的人工修订，只替换修改过的天。保存后才显示成功，失败保留草稿和旧版；批准冻结准确派生 Plan 与修订身份。界面、历史和复制均区分原模型审阅与尚未复审的人工改动，不把人工贡献归功于模型或暗示自动复审。

整份批准/拒绝让有效审阅意见无法落实。有界人工修正支持直接采用，不必再开付费会议，也不静默修改已接受日期或把人改的内容当作模型验证。自动语义改写和改契约重生成继续暂缓。

## D-055 - 质量优先的 Plan 修改与复核

- **状态：** 已接受
- **日期：** 2026-08-27
- **决定：** 优先交付可采用的产物，不再一律最低配置。当前 Plan Pack 由用户最多选三条原意见，明确授权一次编辑及一次不同席位改动复核。只改对应天，每条意见都有修改或有据拒绝及复核。保留原版、未解决意见，不自动重试/批准或开启第二轮修改。中断/失败可保留原版；已保存但尚未调用的复核可继续一次。后续人工改动不继承模型验证。
- **质量边界：** 现在修改任务化 prompt 与足够的 Plan 输出预算，不自动换模型或普遍开最高推理。已识别 GPT-5 系列交付调用用 medium，其他模型/厂商保留默认。初始会议额度与显式追加修改额度分开，都不是权威账单封顶。
- **原因：** 核心负面检查证明批评没有改变 Plan。这条有界路径检验真实改进链；角色扮演、长记录或测试数量不构成产品价值证明。真实质量与比较优势仍需证据。

## D-056 - Plan 等待政策与显式产物恢复

- **状态：** 已接受
- **日期：** 2026-08-27
- **决定：** Plan生成、实际计划审阅、修改及复核不设应用硬时间截止。累计模型时间只作统计，预算值0表示不因累计时间停止。保留普通讨论90秒截止、显式取消、输入/输出限额、来源校验、不自动重试。供应商/传输/宿主仍可能中断；取消应用定时器不保证完成，也不保证取消后供应商零收费。
- **恢复：** 未审阅且只有一次中断产物transition的Plan，可显式先保存一次恢复额度，只补缺失天数及审阅，或只审阅。保留旧预留及token用量，仅补足最多两次调用所需的最小名额。不在读取记录时静默续额，不退还估算消耗；已有第二次产物尝试后不能再续额。停止协议可能是status complete，并不等于交付物完成。这是本地边界，不是服务端计费幂等。
- **原因：** Live010正常产出的长请求在180秒被截断，随后承诺的恢复又不可用。保住有效内容，由人、token和调用额度决定停止，而不是让所有深度任务迎合任意定时器。详细状态仅显示当前视图等待时间，不冒充可观测的模型思考过程。

## D-057 - 有界Plan诊断与显式格式作用域

- **状态：** 已接受
- **日期：** 2026-08-27
- **决定：** 初始Builder/Reviewer检查点最多保存四次尝试摘要，每次最多十二条逐行逐天拒收明细及拒收总数。供应商报告的结束/用量与校验结果分开；缺失用量是未知而非零。不保存原始响应、密钥、私有推理，诊断元数据不进入Plan模型prompt。不重建历史缺失证据；修改/复核回执及权威计费另行处理。
- **指令作用域：** 新格式专用Chair指令须绑定当前proposal/review/synthesis阶段及轮次，只送入该阶段。长期需求和旧correction保留原语义，不静默迁移归档或冻结Plan上下文。保存成功后重置一次性格式选项。
- **原因：**011通用失败无法定位，010临时格式要求确实进入后续上下文。补足证据、防止新增跨阶段泄漏，不假装知道旧失败根因、不放宽产物校验、不改模型额度、不增加付费重试。

## D-058 - 推理深度服从Plan职责

- **状态：** 本地接受，需真实证据
- **日期：** 2026-08-29
- **决定：** 对已识别原始GPT-5 ID，结构化Plan Builder请求low，实际计划Reviewer、修改、复核继续medium；普通讨论仍minimal。Anthropic、Gemini及未识别模型保留供应商默认，不猜测不兼容thinking参数。仅Builder档位取代D-055对应描述；模型、输出上限、prompt、校验、调用预算及重试政策不变。
- **证据契约：** 初始Plan尝试诊断可以把请求档位与供应商实际报告reasoning token分开保存；缺字段的旧记录继续有效。请求档位不证明内部实际行为、质量、费用或为可见正文预留空间。
- **原因：** 产物组装与语义判断职责不同。针对011可能的推理压力，最小可测改动是只降Builder一档，不是全局minimal或盲目加上限。本地payload测试只证明配置；PLAN-03仍处理中，直到显式授权的单阶段结果以结束/用量证据完整交付可用天数。

## D-059 - Detailed Plan 先生成用户要的产物

- **状态：** 已接受；真实机械链路通过，审阅质量仍待解决
- **日期：** 2026-08-29
- **决定：** 新 Detailed Plan 跳过通用 proposal 与 cross-review，直接由指定 Builder 生成完整产物，再由一个独立实际产物 Reviewer 审阅。首次协议和预检恰好预留这两次调用、16,000 加 6,000 输出 token，不调用 Observer、不自动重试。Builder 失败即在审阅前停止。任何恢复或改动后的运行都必须由人显式触发，并具有适用的新费用授权；页面美元估算不是供应商账单上限。
- **兼容：** 普通 Decide 和 Review 保留既有讨论历史 Gate。新 Plan 可以把产物绑定到 Canonical State version 0。路由仍在完成前校验 Plan 契约、精确 Builder/Reviewer 组成、状态身份、逐天记录和审阅结构。
- **原因：** 只有批判真正检查用户要的交付物，产品才有价值。在 Plan 出现前花四次通用调用增加费用和共同框架，却没有产物证据。真实实验 012 还证明，沿用旧 synthesis 与产物版本假设会在评估质量前阻断新入口。

## D-060 - Plan 审阅使用供应商原生结构，但本地校验不让权

- **状态：** 本地接受，真实验证待进行
- **日期：** 2026-08-29
- **决定：** 只有 adapter 与准确模型家族明确支持时，实际 Plan Reviewer 才可请求供应商原生 JSON Schema 输出。Anthropic Fable 5 及文档列明的兼容 Claude 家族接收 Plan 审阅用 `output_config.format`；不受支持的 Anthropic ID 与无关调用都省略该字段。日期范围、字段长度、集合上限和 Plan 语义仍由应用决定。应用可剥掉“整份响应只有一个 JSON Markdown 围栏”的外壳，但会拒绝说明文字中夹带 JSON。拒绝、截断、传输失败、schema 失败或语义失败都不会自动付费重试。
- **原因：** 真实实验 014 证明 Fable 可以完成昂贵的实际产物审阅，而仅靠通用 prompt 的 JSON 仍可能无法通过机器契约。供应商原生结构能减少传输格式波动，但不能验证批评是否有据，也不能把 canonical 权限交给供应商 schema。这是窄 adapter 能力，不是重写所有 Turn Envelope。

## D-061 - 停止协议保存来源，恢复必须真实可执行

- **状态：** 已接受并完成本地验证
- **日期：** 2026-08-29
- **决定：** stopped协议快照可携带可选`stopReason`，值为`human`或`budget`。预算Gate保存`budget`，用户明确停止保存`human`；没有来源的旧 stopped 快照仍有效并显示中性标签。任何离开 stopped 的转换都会清除原因。保存Plan恢复只有在结构契约成立且保留用量允许准确待执行调用时才可用；不可恢复时仍显示原因并禁用，handler独立重复检查同一预算。
- **原因：** 恢复控件是在承诺系统能执行下一动作。只检查结构会把已知预算失败伪装成可操作项，而把所有 stopped 状态归因于Human Chair会污染审计记录。本决定不推断供应商账单、不退还用量、不迁移旧记录，也不解决脱离页面的后台持续运行。

## D-062 - 每个付费 Plan 阶段只有一条生命周期回执

- **状态：** 已接受，并对新Plan请求完成本地验证
- **日期：** 2026-08-30
- **决定：** Plan Builder或Reviewer调用供应商前，路由先发出严格的`started` `PlanAttempt`，记录请求身份、阶段、上限和请求reasoning档位，finish与usage保持未知。接受、拒绝或供应商错误的终态会原位替换同一请求/阶段；终态不能倒退为started。没有Reviewer回执表示未进入Reviewer阶段；保留started回执表示供应商用量可能未知，绝不能当成零。
- **原因：** 外层双席synthesis transition只表示预留工作，无法真实说明哪个付费阶段已经开始。小型阶段回执能关闭这处审计缺口，同时不暴露秘密、不保存模型原始输出、不虚构用量、不退还未知调用、不改写历史证据，也不建设通用计费账本。

## D-063 - 供应商前缀识别是本地提示，不是验证

- **状态：** 已接受并完成本地验证
- **日期：** 2026-08-30
- **决定：** Connection Setup只能从一小组当前高置信且有顺序的前缀推断三家已支持供应商：Anthropic `sk-ant-`、Gemini `AIza`或`AQ.`，以及既有受支持OpenAI `sk-`形式。由于前缀家族重叠，Anthropic先于OpenAI判断。未知格式保持未决，要求用户明确选择。前缀推断绝不验证有效性、所有权、权限范围、计费、模型访问或地区资格。
- **安全边界：** 浏览器只在本地推断，绝不能把同一凭证提交给多个供应商来猜身份。只有明确选择或本地推断出唯一供应商后，模型发现才接收key并只调用该供应商。供应商格式会变化，因此规则必须隔离并有测试。
- **原因：** Google正在把Gemini API从标准key迁移到授权key，新的AI Studio key可能使用`AQ.`。把易变的便利格式当成证明会同时产生可靠性与秘密暴露风险。保守本地提示可以减少Setup摩擦，又不会扩大受支持供应商范围。

## D-064 - Ask the Room 是宽广 Multi-AI 工作空间的窄入口

- **状态：** 已接受
- **日期：** 2026-09-18
- **决定：** 产品终点是一个由人主持的 Multi-AI 工作空间，覆盖普通对话、Review、Explore、Create、Research、规则约束 Play、只读 Project Room，以及后续受控 Execute。反复出现的窄入口是 **Ask the Room**：把已有回答、想法、选择或 Artifact 提升给一到两个独立提示的 Challenger，保留影响结果的差异，再由 Human Chair 停止、追问或进入 Task Pack。Review 继续作为第一个信任 Pack，但不是产品边界。开发通过一条有限构建队列，在“习惯”和“信任”证据之间交替推进。占星、游戏和编码上下文想法先作为有时间上限的 Lab；Codex 与 VS Code 集成在任何执行权限前先保持只读。
- **顺序：** [详细开发里程碑](DEVELOPMENT_MILESTONES.md)决定前向优先级：DP-0 产品真实性、DP-1 Quick Council、DP-2 Review 证据、DP-3 Pack contract、DP-4 Explore／Create、DP-5 Research、DP-6 Play proof、DP-7 只读 Project Room、DP-8 受控 Execute、DP-9 选择性产品化。历史 `M0` 到 `M5` 条目继续保存证据与实现状态；发生冲突时不再决定前向开发顺序。
- **原因：** 把受众收窄成专业文档审阅会丢失独立模型挑战在日常、创意、娱乐和项目工作中的原始价值；但同时实现所有场景又会形成失控平台。一个窄用户动作加逐步加深的交互层，既保留宽野心，也让每个开发切片可测试、可回退、受证据 Gate 约束。

## D-065 - 仓库身份使用开发事实，不捏造 release 主张

- **状态：** 已接受
- **日期：** 2026-09-19
- **决定：** 仓库与私有 package 统一命名为`multi-ai-meeting-room`。在所有者有意创建带 tag 的 release 前，`package.json`使用`0.0.0-development`；当前源码以 Git commit、存在时的 dirty state 与 active DP 里程碑标识。历史 v0.x 标签继续作为开发快照名，不是 release。pnpm 11.19.0 与`pnpm-lock.yaml`是唯一支持的 package-management 路径；明确允许锁文件中的`esbuild`、`sharp`、`unrs-resolver`与`workerd`安装脚本。仓库为`UNLICENSED`并保留所有权利，直到所有者另行授予 license。
- **安全边界：** 用户 BYOK 继续只存在于当前页面内存。工作区管理的供应商凭证只用于本地／私有评估；DP-0.6 实现并验证认证、请求／调用限制、rate limit 与滥用防护前，公共部署不得暴露这些凭证。
- **原因：** starter 元数据、双锁文件、占位 build 许可及过期工作区／版本文案让复现性、法律与安全预期含糊。明确非 release 版本与限制性 license 状态无需猜测所有者意图；单一固定 package 路径让后续可移植性失败可归因。

## D-066 - 本地与 CI 可移植性共用一条固定 Check Contract

- **状态：** 已接受；本地及 Windows／Ubuntu CI 均已验证
- **日期：** 2026-09-19
- **决定：** `pnpm check`是唯一有序工程契约：由固定 Wrangler 与`wrangler.jsonc`重新生成 worker types，通过仓库自带跨平台 vinext launcher 构建，运行完整离线测试，lint 手写源码，并进行不输出文件的 type check。GitHub Actions 用`pnpm/action-setup@v6`安装固定 pnpm 11.19.0，再于 Windows 与 Ubuntu 的 Node 22.13.0 环境执行 frozen install 与同一检查。确定性生成 declaration 被 ignore；inactive D1 binding 继续作为显式 optional augmentation，不进入 runtime 配置。
- **边界：** 生成 declaration 不手改、不提交，也不当作手写代码 lint；每次完整 check 前重新创建，随后立即由 TypeScript 验证。本决定不新增 package、不升级依赖、不调用供应商、不部署、不配置 D1，也不开始首次使用界面工作。
- **原因：** 分离的平台命令让 Windows shell 语法、CRLF 假设、缺失 runtime 声明和过期成功说法发生漂移。首次远程运行暴露两个 OS 上安装前的 Corepack 签名 key 不匹配；官方 pnpm 安装步骤修复了这一 runner 差异。随后`97b865a`上的两项 job 在[CI 运行 36076954748](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748)中通过。
