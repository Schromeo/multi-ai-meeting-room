# 开发日志

## 2026-08-25 - 产品方向基线 - 以 Artifact 为中心的 Task Pack

### 已完成

- 对照最初多模型 Critical Review 假设与 v0.10c 实现，确认出现了基础设施先行的顺序偏移：会议引擎成熟度已经超过“用户是否获得更好 Artifact”的证据。
- 拍板一个产品内相互独立的任务模式与权限等级。Review、Decide / Plan、Explore、Create 和未来 Play 是 Task Pack；Discuss、Research 与 Execute 继续定义权限。
- 选择由产品线驱动的纵向切片，不建设猜测性的万能平台，也不复制成多个独立应用。新增 Rule of Two，限制抽象进入 Shared Core。
- 选择 Review 作为第一条以 Artifact 为中心的产品线：Artifact v1、用户来源与真实性边界、独立 Finding、有限交叉审阅、Change Set、Artifact v2、改动核验和逐项 Human Gate。
- 定义产品校正节奏：不连续进行两个纯基础设施里程碑；每个产品里程碑有一个真实案例和基线；每个新增付费调用写明预期信息增量；证据弱时简化或删除。
- 定义多 Agent 边界：Review 与 Decide 继续使用确定性多模型编排；只有 Research 或 Execute 具有独立有用子任务、不同工具或私有上下文、合并契约与验证时，才加入真正多 Agent。
- 新增[产品方向定稿](PRODUCT_DIRECTION.md)，并同步更新章程、决策记录、路线图、协议范围、模型/Agent 组合、文档索引和仓库阅读顺序及英文版本。

### 产品事实

- 本规划里程碑没有修改运行代码、发起供应商请求、使用 API Key、改动本地房间或数据库、部署或产生付费调用。
- v0.10c 仍是本地产品版本。最后 Gate 是一间由用户明确批准预算的真实 Observer + 定向辩论烟雾房间。
- 完成烟雾评测后，通用 Observer、路由、自治和基础设施扩建退出关键路径。M2.11 现在是 Review Task Pack，不再是大范围会议界面扩建。

### 下一动作

保留可恢复的 v0.10c 源码点，在用户明确批准预算后运行一次有限真实烟雾评测并记录语义与费用证据，然后实现最小端到端 Review benchmark，不增加无关平台抽象。

## 2026-08-22 - v0.10c - 由 Chair 选择的定向辩论

### 已完成

- 新增持久化 `TargetedDebatePlan`，保存一个开放 Dispute、来源 State version、有限来源 Message ID、路由 Seat、轮次与创建时间；旧协议快照默认读取为空列表。
- 在 Review checkpoint 增加 Human Chair 操作。Chair 选择开放 Dispute 后，确定性应用路由最多唤醒两个相关 Seat，优先异议提出者与目标 Claim 的反对/支持席位；不增加付费路由模型调用。
- 新增可恢复 `targeted_debate` transition，消耗下一轮预算，支持 Turn by turn 子集，在供应商工作前持久化，并沿用显式中断与不自动重试边界。
- 每个定向请求只包含明确 Dispute、关联 Claim、最多四条 active Chair Directive 与最多八个来源 Message ID；不接收 transcript 或 prior Memo。它继续使用标准 Review Envelope，禁止新 Claim，最多一个 Claim update 与一个 objection，transport 输出上限 250 tokens。
- 定向增量继续进入确定性 Canonical Reducer。随后 Process Report 只读取该定向轮已完成 turn；若启用 Observer，则再创建恰好一份只评估该增量的 Round Brief，然后回到 Review checkpoint，或在 Auto 中进入 synthesis。
- 加入精简 checkpoint Dispute 选择器并显示路由 Seat；进入 synthesis 仍是另一项独立 Chair 选择。
- 记录 D-032：后续付费辩论回合必须明确并路由一个未解决 Dispute。

### 验证

- 使用内置 Node runtime 的生产构建、ESLint、`git diff --check` 与全部十八项自动测试通过。
- 新编排测试覆盖确定性路由、来源链、最大轮数拒绝、持久化解析、中断恢复、Checkpoints 完成与 Turn by turn 席位子集。
- 新供应商 fixture 证明：只发生两次路由调用、输出上限 250 tokens、不泄漏 prior Memo 或 transcript、每个 prompt 都含明确 Dispute/来源 ID、使用标准 Review 归并，并发出 `targeted_debate` 完成边界。
- 全新浏览器会话在桌面与 390x844 手机宽度下没有横向溢出或 console warning/error。没有真实供应商调用、凭证传输、付费模型使用、数据库删除或部署。

### 当前限制

- 当前确定性相关性使用异议提出者、目标 Claim 支持/反对来源，并以参与者顺序兜底；它不是语义 router，需要真实房间评测后再决定是否增加复杂度。
- 模型可以建议修订 Claim，但只有应用规则与 Human Chair 能在后续把 Dispute 标记为 resolved；显式 Dispute 解决 UX 属于 Whiteboard/Follow-up 工作。
- 组合后的定向辩论 + 第二次 Observer 在真实供应商上的格式可靠性、语义价值、延迟与费用尚未验证。
- 活跃供应商工作仍依赖当前页面生命周期；离开页面继续属于显式中断，不是后台继续。

### 下一动作

在用户明确批准预算后，运行一间全新 Checkpoints 房间，依次完成 Proposal、Review、Observer、一次由 Chair 选择的目标 Dispute、第二份 Observer Brief 与 synthesis。记录实际调用、第二份 Brief 是否只评估明确增量、Dispute 是否更适合决策，以及总 token、延迟和提示性费用，然后再开始 M2.11。

## 2026-08-22 - v0.10b - 显式 Observer 与 Round Brief

### 已完成

- 加入不占参与席位数量的可选 Round Observer。Setup 要求用户显式选择可复用 Connection 与 Model；预检会为每个配置轮次准确增加一次有限调用。
- 在完成 Review 后加入可恢复的 `observer` transition。每轮最多运行一次，供应商工作前先持久化；完成后回到 Review checkpoint，Checkpoints 等待用户继续，Auto 才进入 synthesis。
- Observer 输入只包含 5,000 字符以内的 Canonical State、确定性 Process Report 和显式引用白名单，不接收 raw transcript 或参与者 context turns。
- 加入严格、最多 300 output tokens 的 Round Brief 契约，包含来源 State version、Process Report ID、Turn ID、收敛/循环/偏题信号与流程建议。未知或已关闭引用会显式失败且不重试，也不能修改 Canonical State。
- 持久化不含凭证的 Observer 快照、只追加 `round.brief` 事件、Round Brief artifact 和协议快照。修正 RoomStore 读取过滤，避免流程事件被误作 transcript，也避免 Round Brief artifact 覆盖 Decision Memo。
- 增加精简的 Observer 设置、运行状态和 Review checkpoint Brief，不改变以发言内容为中心的 Meeting 工作区。

### 验证

- 使用内置 Node runtime 的生产构建、ESLint、`git diff --check` 和全部十六项自动测试通过。
- 模拟供应商测试证明：Observer 只调用一次、transport 上限 300 tokens、不泄漏 transcript、来源链精确、不修改 Canonical State、预算保守计数、中断可恢复，并向后兼容没有 Observer 字段的旧房间。
- 1440x1000 桌面和 390x844 移动端浏览器检查未发现 Observer 控件重叠；Observer 配置不完整时 Start 会保持禁用。
- 没有真实供应商调用、凭证传输、付费模型使用、数据库删除或部署。

### 当前限制

- Observer 的语义质量只通过确定性 fixture 验证；真实付费房间仍需单独批准预算。
- Observer 建议只是提示，尚不会路由参与者、执行软停止或选择 Final Synthesizer。
- 活跃 fetch 仍由当前页面持有；付费调用期间离开页面仍属于可显式恢复但费用不确定的中断。

### 下一动作

只实现一条 Dispute 定向继续路径：Chair 选择一个开放 Dispute，router 只唤醒相关 Seat，请求只携带该 Dispute 与有限来源上下文，再由第二份 Round Brief 只评估这次增量。不要在同一切片加入 embedding、Role Pack、Whiteboard 重做或 durable runner。

## 2026-08-22 - v0.10a - 验证后 Turn 呈现

### 已完成

- 不再把供应商 JSON 半成品显示成实时发言。`agent.delta` 只推进有限的 Generating 状态，不再写入 `TranscriptItem.text`；只有通过验证的 `agent.done` statement 会公开。
- 在发言舞台和会议时间线加入 Thinking、Generating、Validating、Ready、Posted、Stopped。最近发生实质状态变化的 Seat 成为实时焦点；用户选择的旧发言保持固定，直到主动 Follow Live。
- 移除逐 token 强制滚动。新选择的 Turn 从开头显示；用户在 Overview 离开底部后，自动跟随会停止。
- `room.done` 后继续保留 Meeting 画面，由 Human Chair 通过 `Open decision` 主动进入 Decision。
- 记录 D-028～D-031：验证后呈现、与上下文大小独立的 Artifact 深度、任务自适应且房间内稳定的 Role Pack，以及未来 durable transition runner。

### 验证

- 生产构建、十四项自动测试、ESLint 与 `git diff --check` 均通过。
- 供应商 fixture 断言每个完成 Turn 都有一个 Validating 事件，并防止未来把 `agent.delta` 重新拼进可见文本，或让 `room.done` 直接跳转 Decision。
- 1280x800 与 390x844 浏览器检查没有横向溢出；保存的 interrupted 房间正常恢复，时间线状态清楚，控制台没有 warning/error。
- 没有真实供应商请求、API Key 传输、付费模型调用、数据库删除或发布。

### 当前限制

- 并行进度行为已有确定性事件 fixture 覆盖，但还没有在一间全新的真实供应商房间中做视觉观察。
- 任务自适应 Role Pack、独立 Final Synthesizer、任务化详细 Artifact 与跨导航后台执行仍只是批准设计。
- 当前页面仍拥有进行中的 fetch；离开页面后供应商计费可能不确定，恢复保持显式且绝不自动重试。

### 下一步

回到 M2.10 主线：每个完成 Review round 后加入一次显式、由用户选择的 Observer 调用，只输入确定性指标与有限 Canonical State；随后加入一条 Dispute 定向继续路径。Role Pack、详细 Artifact 与 durable runner 分成后续独立切片。

## 2026-08-21 - v0.10a - Anthropic Adaptive Thinking 兼容修复

### 已完成

- 定位真实 Anthropic turn 失败：当前 adaptive-thinking 模型以 HTTP 400 拒绝适配器显式发送的 `thinking.type: "disabled"`。
- 从普通 Anthropic 会议请求中删除可选 `thinking` 字段，沿用供应商声明的默认行为；不启用需要额外预算的 extended thinking，也不引入模型名兼容表。
- 新增供应商边界回归断言，确保所有 Anthropic fixture 请求都省略 `thinking`。

### 验证

- 使用内置 Node runtime，生产构建与全部十四项自动测试通过。
- 未再次请求供应商或进行付费重试；原失败 turn 保持可审计。

### 范围

- 这是窄范围供应商兼容修复，不改变 M2.10 roadmap，不启用 extended thinking，也不增加新的会议行为。

## 2026-08-10 - v0.10a - 确定性预算与进度 Gate

### 已完成

- 在持久 protocol snapshot 中加入向后兼容的 `MeetingBudget`。新房间根据 Seat、phase 与最大轮数推导精确 agent-turn 上限，并从现有上下文、输出和供应商 timeout 上限推导保守的 input token、output token 与模型时间边界；旧房间在解析时推导默认值并保持可读。
- 新增 transition 前预算 Gate。每个已启动 transition 都会保守计数，包括 interrupted 工作；若新 transition 会超过 agent-turn 上限，会在供应商调用前停止。已观测 token 或模型时间耗尽也会在下一个安全边界阻止 transition。由于价格不权威，估算 USD 仍只作提示。
- 格式失败与语义归并失败的供应商响应现在计入已知用量；未知供应商失败仍不会伪造 token 或费用。
- 每个完成的 Review round 后生成确定性、带来源的 `ProcessReport`，测量 Claim、update、objection、open dispute、open question、no-new-information 和精确归一化 thesis 的结构变化。连续两个结构空窗口、未更新且重复的 Dispute，或 assumption 未解决时 thesis 完全同质化，会产生可逆的 Chair 暂停建议。
- 报告保存为只追加 `process.report` 事件，不能修改 Canonical State 或批准 Decision。Setup 显示推导的最大调用/输出/模型时间，Meeting 显示剩余预算，Review Checkpoint 显示最新报告。
- 记录 D-027：先建立确定性预算与结构安全信号，再加入付费 Observer 判断。

### 验证

- 使用内置 Node runtime，生产构建、ESLint、`git diff --check` 和全部十四项自动测试通过。
- 新测试覆盖精确调用前 turn 耗尽、已观测 token 耗尽、预算字段之前的旧 protocol snapshot 向后兼容解析，以及只有连续两个无进度窗口才建议软暂停。
- 浏览器验证在没有凭证的情况下重新打开 D-027 之前的 interrupted 房间，显示推导后的剩余预算，且控制台无 warning/error。1280x800 桌面和 390x844 移动端均无横向溢出，Chair checkpoint 与会议 footer 不重叠。
- 没有供应商请求、付费 Observer 调用、凭证变更、数据库删除或部署。

### 当前限制

- Token 与模型时间上限根据已观测用量在 transition 边界判断，已经在途的 transition 仍可能越过边界；本切片中只有精确调用次数是完全调用前硬预算。
- 精确归一化 thesis 只是确定性同质化信号，不是语义相似度。偏题与改写重复留给显式 Observer；embedding 被有意推迟。
- 预算默认值由系统推导，用户暂时不能编辑；模型价格未知时仍不能执行权威费用硬停止。
- M2.10 尚未完成：还没有用户选择 Observer、付费 Round Brief 或 Dispute 定向继续。

### 下一步

把 M2.10b 限制为一个显式 Observer 系统角色，并在每个完成 Review round 后最多调用一次。只向它提供确定性 Process Report 与有限 Canonical State，保存带来源 Round Brief，把调用计入预检，并禁止修改 state；随后增加一条最窄的 Dispute 定向继续路径。不要加入 embedding，也不要开始 Meeting Whiteboard 重做。

## 2026-08-08 - v0.9 - 由人主持的可恢复编排器

### 已完成

- 将原先一次性的会议请求拆成明确的 proposal、review 与 synthesis phase，同时保留旧 endpoint 路径以兼容既有调用。
- 新增持久化 `MeetingProtocolState`：支持 Auto、Checkpoints 与 Turn by turn，稳定 transition ID，phase/round/status 追踪，安全边界暂停与恢复，以及解析层 1～5 轮硬上限。
- Checkpoints 成为默认模式；Setup 可选择 1～3 轮并预检最大调用数；旧房间继续保持原有两轮范围，不会在恢复时偷偷扩张。
- 新增下一个安全边界 Raise Hand、限定范围的只追加 Chair Directive、Checkpoint 继续、Human Gate 请求下一轮，以及事务式持久化批准/拒绝操作。
- 将 protocol transition 与 Chair Directive 保存为独立 RoomStore event。已完成 transition ID 与 turn ID 提供确定性重复防护；刷新恢复会把未完成的 running 工作转换为 `interrupted`，不会再次调用供应商。
- 拆分后的 API 会在供应商调用前验证 protocol phase、有限上下文和请求的 seat ID；已经完成的 transition 会在进入 provider adapter 前被拒绝。
- 修复第一次 M2.9 真实预检暴露的缺陷：transcript 与 usage ref 现在会在严格持久化前同步更新，初始 recovery snapshot 不再与 React state 调度竞态。原失败启动在任何供应商请求前已被拦截。
- 随后的第一次付费拆分 phase 探针在没有自动重试的情况下暴露了两种跨供应商输出失败：Anthropic 用完整 `json` fence 包住了原本有效的 Envelope；OpenAI `gpt-5-mini` 在关闭 JSON 前耗尽 1,200-token 输出预算。Validator 现在只移除包住整个响应的一层 fence；OpenAI adapter 只对原始 GPT-5、GPT-5 mini 与 GPT-5 nano 标识条件式请求 `reasoning.effort: minimal`，输出上限保持不变。
- 第二次有限 Proposal transition 已接受 OpenAI，并在只剩 Anthropic 待完成时暂停。Anthropic 归一化后的 JSON 省略了 `claimUpdates`；Validator 现在会把省略的 collection 字段视为空数组，但不会放宽语义字段、引用、容量或响应前后文字检查。
- 客户端 phase boundary 现在会保留流中的 `room.error`，不再用通用的缺失 completion 错误覆盖它，使不触发供应商调用的协议校验失败仍可诊断。
- 第一次拆分 Review transition 在任何供应商调用前暴露并修复：构建 Proposal target 时曾修改共享 Review work object，把新的 Review ID 替换成已归并的 Proposal ID。Target 现在使用不可变副本；拆分 Proposal→Review fixture 会断言新增两次供应商调用和 Review completion boundary。
- 第一次付费 Review transition 随后在零条审阅被接受时停止：OpenAI 在关闭 JSON 前耗尽输出上限；Anthropic 超过两条 objection 上限，并在 Research 关闭时仍把外部例子当作事实支持。Review prompt 现在要求 statement 不超过 120 词、最多 1 条新 Claim、2 条 update、2 条 objection、字段各一整句，并禁止引入 Canonical State 之外的外部证据。没有发起 synthesis 调用。
- 一次有限 Review 重试额外发起了 2 次供应商调用。两家供应商都返回格式有效的精简 Envelope，第一条 Review 成功归并；第二条被拒绝，因为第一条 Review 的 `revise` update 归档了两位并行审阅者在共享输入状态中都能看到的 Claim。Reducer 现在把 `revise` 视为建议性争议而不是归档，只有 `withdraw` 才归档 Claim；回归测试确认第二位并行审阅者仍可引用该 Claim。
- 随后在已经持久化的 D-026 修复前房间快照上，显式批准并运行了 1 次只针对待处理席位的 Review。Anthropic 再次返回格式有效的精简 Review，但归并失败，房间在没有 synthesis 或重试的情况下停止。通用 phase error 曾覆盖此前更具体的 agent 语义错误；客户端现在会把第一条格式、归并或供应商错误保留为主要中断信息，不再被 phase 汇总替换。由于该房间的 Canonical State 已经按旧归档规则发生变异，它不能作为干净的修复后验证样本，也不应再次付费重试。
- 记录 D-025：不确定的在途工作由 Chair 显式恢复，绝不自动重试。
- 记录 D-026：Reviewer 的修订请求会保留已发布 Claim 的身份，直到明确撤回或由人解决。

### 验证

- 使用内置 Node 22 runtime，生产构建、ESLint、`git diff --check` 与全部十三项自动测试通过。
- 新测试覆盖纯编排 transition、完成幂等、刷新中断恢复、Turn by turn 边界、拆分 proposal 执行、`phase.done`，以及在额外供应商调用前拒绝已完成 transition。
- 仓库级 `tsc --noEmit` 只报告 `db/index.ts` 与 `worker/index.ts` 中既有的 Cloudflare ambient type 缺失；本轮修改的应用文件没有 TypeScript 错误。
- 第一次 M2.9 真实 proposal 探针发起了两次供应商调用；两个输出都未通过严格验证，因此在 review 与 synthesis 前停止。没有自动重试；后续调用必须由新的显式 transition 发起。
- 本次有限真实会话准确执行了 10 次付费供应商调用：前两次完整 Proposal 尝试共 4 次、一次只针对待完成 Anthropic 席位的 Proposal、以及 5 次 Review。付费 Review 前有两次不触发供应商的 Review start 暴露 immutable-work 缺陷。Synthesis 调用为 0；已有 1 条 Review 被接受，D-026 修复前房间仍在另一条 Review 待完成时中断。第二个批准调用没有使用，因为 Synthesis 以 Review 成功为前提。
- 当前沙箱对开发与生产服务的本地端口绑定都返回 `EPERM`，因此无法完成交互式浏览器验证。Build、服务端渲染、源码与协议测试均通过，但桌面/移动端视觉行为仍需在可运行服务的浏览器里检查。
- 本轮尝试创建 M2.9 前备份 tag 与最终里程碑 commit 时，环境拒绝写入 tag lock 和 `.git/index.lock`。通过验证的 M2.9 修改仍保留在 working tree；准确的修改前恢复 commit 是 `f986b5e`，更早的 `backup/v0.6-live-baseline-2026-08-04` tag 仍然可用。

### 当前限制

- 真实供应商 Checkpoints 运行已经验证 Proposal 恢复与 1 条成功 Review，但仍需完成待处理 Review、Review Checkpoint 和 Synthesis/Human Gate；Gemini 尚未验证。
- 浏览器本地 BYOK 无法保证刷新时在途请求的账单 exactly once。界面会诚实提示这种不确定性，绝不自动重试，并要求创建新的显式 transition 才能继续。
- 当前最大轮数与调用数边界还不是完整的 token、turn、时间或权威美元预算。
- M2.10 尚未加入 Observer / Recorder、Round Brief、循环与偏题监测、以及仅路由给相关 Dispute 参与者的机制。当前已接受 phase statement 虽然有限，仍比最终逐代理上下文设计更宽。
- M2.11 尚未用 Turn Card、Meeting Whiteboard、来源关联追问和版本化 Memo amendment 替换当前以 transcript 为中心的实时界面。

### 下一步

不要重试已经污染的 D-026 修复前房间。只有在新的真实预算合理时，才新建一间严格限额的 D-026 修复后 Checkpoints 房间，并要求两条 Review 都到达 Review Checkpoint 后再授权 Synthesis。随后实现 M2.10 Observer、Round Brief、Monitor 软停止与 Dispute 定向路由；不要在同一里程碑启动更大的 M2.11 界面重做。

## 2026-08-04 - v0.8 - 结构化 Meeting State

### 已完成

- 新增供应商中立 Turn Envelope 契约：严格 JSON 解析、精确字段验证、按 phase 限制 statement、有限 card，以及显式 `no_new_information` 规则。
- 新增确定性的 Claim、Dispute、Assumption、Open Question、Chair Directive、Human Choice 与 Follow-up 契约。稳定 ID 和来源消息链由应用代码生成，不交给模型。
- 实现原子 Canonical Reducer，包含 state version、重复 turn 防护、未知引用拒绝、active cap、归档 ID 和累计用量。
- 在服务端 phase 边界和客户端重放路径使用同一个 Reducer。语义归并失败的 proposal 或 review 会发出 `agent.reduction_error`，并从所有后续 review 或 synthesis prompt 中排除。
- 新增默认 6,000 字符硬上限的有效 JSON 上下文渲染。超限集合通过 omitted 数量明确显示，不截断 JSON，也不静默删除持久事件。
- 三家供应商 prompt 统一返回同一个跨供应商 JSON Envelope。格式错误发出 `agent.format_error`、保存为 `turn.format_failed`，并且该 turn 不自动重试；语义归并失败保存为 `turn.reduction_failed`。
- 在现有 IndexedDB state snapshot 中保存 Canonical Meeting State，同时继续读取 M2.8 之前创建的房间。
- 开发热更新重新执行存储初始化时保留现有 room ID 与创建时间，防止被保留的 transcript 复制到新房间。
- 记录 D-024：先使用一个跨供应商 JSON 契约，再评估供应商专用 structured-output API。

### 验证

- 生产构建与全部十一项自动测试通过。新增测试覆盖 Envelope 解析、来源链、幂等、未知引用、原子 12-Claim 超限、有限且有效的 JSON context、格式错误时正好两次 proposal 调用且没有 review/synthesis/retry，以及从后续 synthesis 上下文中排除语义归并失败的 review。
- ESLint 与聚焦严格 TypeScript 检查通过。
- 浏览器刷新恢复了最初全部 3 个 M2.8 之前的房间，最新真实会议可以打开到 Decision Memo；恢复凭证数为 0，控制台无 warning 或 error。反复开发热更新在加入 guard 前暴露了 room-ID remount 缺陷。
- 没有发起真实供应商请求或付费模型调用。

### 当前限制

- 跨供应商 JSON 遵循率目前只用确定性 fixture 验证。还需要有限真实评测，才能声称 OpenAI、Anthropic 与 Gemini 的格式可靠性达到生产要求。
- 生成期间，现有实时 transcript 可能短暂显示原始 JSON，直到 `agent.done` 用经过验证的 statement 替换。Card-first 流式界面属于 M2.11。
- 当前一次性 route 已把有限 Canonical State 与 Claim ID 发布给 review 和 synthesis prompt，但仍会在同一请求中发送所有已接受的 proposal/review statement。M2.9 会在安全边界拆分 phase；M2.10 再把后续 turn 只路由给明确 Dispute。
- Chair Directive、Human Choice 与 Follow-up record 已定义并验证，但运行时流程分别从 M2.9 与 M2.11 开始。
- 获得人类明确批准后，修复前热更新创建的 5 条英文基线房间副本已从本地档案删除。最新一条英文基线和原有两条中文会议均保留，档案恢复为 3 条记录。
- 仓库级 `tsc --noEmit` 仍需要既有的 Cloudflare ambient type；本次修改文件通过聚焦严格检查。

### 下一步

实现 M2.9 由人主持的可恢复编排器：显式持久协议状态、默认 Checkpoints、安全边界暂停/恢复、只追加 Chair Directive、幂等 transition 和刷新恢复。暂不加入 Observer 调用，也不重做 Meeting UI。

## 2026-08-04 - v0.7 - IndexedDB 本地 Event Store

### 已完成

- 移除 OpenAI 请求里无条件发送的 `reasoning.effort` 与 `text.verbosity`；会话 BYOK 回归用例改用 `gpt-4.1-mini`，并断言不会发送这两个可选字段。
- 在改变持久化之前，用 commit `3298d40` 和 tag `backup/v0.6-live-baseline-2026-08-04` 保存 v0.6 真实基线。
- 新增严格且不含凭证的 `MeetingRecord` 解析器，以及由 IndexedDB schema version 1 支撑、供应商无关的 `RoomStore`。
- 创建 `rooms`、`participants`、`events`、`stateSnapshots`、`artifacts`、`usage` 和 `metadata` store。已完成和失败的 turn 成为只追加事件；状态快照、版本化 memo artifact、用量和参与者快照通过事务更新。
- 对通过验证的 `multi-ai-meeting-room.history.v1` localStorage 记录执行一次性迁移；只有 IndexedDB 事务提交后才删除旧 key。
- 将房间加载、保存、删除与实际 30 房间上限裁剪迁入异步 store。API Key 和带凭证的 Connection record 仍只存在于当前页面会话。

### 验证

- 使用内置 Node 22 runtime，生产构建、全部七项自动测试、ESLint、聚焦严格 TypeScript 检查和 `git diff --check` 均通过。
- 浏览器迁移恢复了 3 场旧会议。最新房间的 Decision Memo 和精确的 2,437 input / 3,424 output / $0.032 / 54 秒用量在两次刷新后仍完整。
- 刷新后没有恢复任何供应商连接，浏览器控制台也没有 warning 或 error。
- 仓库级 `tsc --noEmit` 仍只被 `db/index.ts` 与 `worker/index.ts` 中既有的 Cloudflare ambient type 缺失阻挡；本次修改的前端与存储文件通过聚焦严格检查。

### 当前限制

- 持久化只属于当前浏览器 profile；导出、账号归属、服务端同步、冲突处理和跨设备恢复尚未实现。
- 当前事件保存 agenda 与完成/失败的原始 transcript turn；M2.8 尚未加入经过验证的 Turn Envelope、Claim、Dispute 和确定性 Canonical Reducer。
- 流式生成中的 delta 只在内存中。崩溃可能丢失正在生成的半句，但不会把它冒充成已完成事件。
- 事务式删除已有实现与源码断言；浏览器迁移测试为了保留用户的 3 条真实记录，没有实际删除其中一条。

### 下一步

实现 M2.8 结构化 Meeting State：Turn Envelope 验证、有限 card、带来源 record，以及运行在 M2.7 事件流上的确定性 Canonical Reducer。暂不开始大型界面重做。

## 2026-08-04 - 证据基线 - 第一次真实双供应商会议

### 已完成

- 使用真实 OpenAI 与 Anthropic 凭证验证会话 BYOK 和模型发现，Key 没有出现在房间或 transcript 中。
- 用 OpenAI `gpt-5-mini` Strategist 与 Anthropic `claude-haiku-4-5-20251001` Critical Reviewer 走通 v0.6：两个独立提案、两个定向审阅、一次 OpenAI 综合、用量报告、本地历史和 Human Gate。
- 将 OpenAI 独立提案作为内容基线并与跨模型 memo 对比。Anthropic 与定向审阅新增了重复决策类别约束、角色不对称、Chair 能力风险、可测量 pilot、经验性主张警告和保留分歧。
- Human Gate 保持待决定，没有替用户批准、拒绝或消耗付费 revision。
- 详细中英文报告保存为[真实基线 001](evaluations/2026-08-04-v0.6-live-baseline.md)。

### 验证

- 成功会议共 5 次供应商调用、2,437 input tokens、3,424 output tokens、54 秒模型时间和 $0.032 提示性费用估算。
- 最终 memo 保留了席位数、联网、初始范围和 Chair 能力方面的分歧。
- 完成后浏览器控制台没有 warning 或 error。
- `gpt-4.1-mini` 失败探针显示供应商错误，在提案阶段后停止，没有自动重试、审阅或综合。

### 当前限制

- OpenAI 适配器无条件发送 `reasoning.effort` 与 `text.verbosity`；虽然模型发现列出 `gpt-4.1-mini`，它至少拒绝 reasoning 参数。
- 对一个很短的目标，房间生成的 output 多于 input，阅读负担过高。
- Chair 经验与响应时间等生成阈值没有证据，却进入了最终 memo。
- v0.6 不能显式配置 Final Synthesizer，因此综合默认复用 OpenAI Strategist。
- 独立提案可以作为内容控制组，但不是单独计时的 standalone API 请求。

### 下一步

修复 OpenAI 可选参数兼容性并增加回归断言，创建命名 v0.6 基线备份，然后开始 M2.7 `RoomStore` 与 IndexedDB。除非用户点名要解决的异议，不消耗剩余 revision。

## 2026-08-03 - 规划基线 - 会议协议蓝图 v1

### 已完成

- 分开记录当前产品事实与已批准的未来协议：可运行产品仍是 v0.6，新会议架构明确标记为尚未实现。
- 新增中英文会议协议蓝图，覆盖全程人类主持、结构化会议状态、有限轮次、观察员与综合者、定向上下文、追问、用量记账和本地持久化。
- 将路线图扩展到 M2.12，使存储、状态归并、编排、监测、综合、界面和评估都有明确顺序与退出条件。
- 记录人类主持权、规范状态与原始记录分离、显式计费的系统角色、只追加本地存储和预算感知停止等长期决策。
- 选择以 `RoomStore` 为边界的浏览器 IndexedDB 作为第一版本地数据库。在身份、房间所有权、删除、加密和同步语义确定前，不启用服务端 D1。
- 确立关键路径：真实 v0.6 基线、本地事件存储、规范状态、可恢复编排、聚焦会议界面，最后评估与收敛。

### 验证

- 英文基准文档与中文快速阅读镜像同步更新。
- 核对路线图状态，以及“已经实现”和“已批准但待实现”的边界。
- 本规划里程碑没有修改运行代码、API 行为、数据库绑定、供应商账号、部署或产生付费模型调用。

### 当前限制

- 人类主持模式、规范 claim/dispute 状态、观察员、轮次简报、循环监测、token 预算、定向追问和 IndexedDB 持久化都只是已批准设计，并非当前产品行为。
- 精确 token 与费用默认值仍需真实供应商调用测量。
- 各供应商结构化输出策略和 IndexedDB 辅助库仍留到实现时选择。
- 线上地址仍是较旧的部署版本；本地 v0.6 才是当前实现基线。

### 下一步

先用 OpenAI 与 Anthropic 跑一场不追加修订的 v0.6 真实会议，并对同一题目保留单模型基线；记录有效反对意见、memo 质量、延迟、token 用量、估算费用和供应商错误，再开始 M2.7。

## 2026-08-03 - v0.6 - 本地会议记录

### 已完成

- 增加顶层 `Meetings` 入口与聚焦的左侧档案栏，没有把历史重新塞回需要滚动的工作区。
- 会议开始后，自动在当前浏览器保存目标、完整发言、决策 memo、人工决定、用量、轮次和供应商/模型/角色摘要。
- `New meeting` 会创建新房间并保留旧记录；已保存房间可以重新打开或显式删除。
- 切换和重置房间前会立即保存，并把档案限制为最近 30 条。
- 凭证与档案分离：API Key、可复用连接和 Connection ID 都不会被序列化进会议记录。
- 恢复的待决定房间只有在当前席位与原供应商、模型和角色匹配时才可请求追加修订。

### 验证

- 生产构建和 lint 通过。
- 在 1280x720 检查空档案抽屉，没有横向溢出或控件裁切。
- 源码回归检查覆盖历史入口、存储命名空间、档案样式和不含凭证的记录类型。

### 当前限制

- 历史仅属于一个浏览器配置；尚无账号身份、服务端同步、跨设备恢复或协作房间所有权。
- 浏览器存储配额不等于数据库保障；导出和持久事件存储仍属于 M2.5。
- 流式文本通过短暂防抖保存，浏览器进程突然崩溃时可能丢失尚未写入的最新 token。
- 会话 API Key 仍按设计在刷新后清除；恢复房间要再运行模型轮次前必须重新连接。

### 下一决定

先完成第一次真实双供应商会议，再决定 M2.5 下一切片优先做导入导出还是基于账号的服务端持久化。

## 2026-08-03 - v0.5 - 已验证连接与可复用席位

### 已完成

- 在最后记录的 v0.4 提交创建 `backup/pre-reusable-connections-2026-08-03` 备份标签。
- 将固定供应商凭证行改为添加连接流程：手选供应商或接受高置信度的本地前缀提示，输入一个 API Key，再显式验证并加载兼容模型 ID。
- 为 OpenAI、Anthropic、Gemini 加入服务端模型发现，具有超时、密钥脱敏、无自动重试和不回显凭证的边界。
- 将连接凭证与席位分离：一个连接可以为 2–3 个席位复用，每个席位独立选择模型和角色。
- 新验证的连接只填入第一个空席位；是否在其他席位复用始终由用户明确选择。
- 将 Setup 升级为统一 Connection Library，支持可选命名、模型刷新、事务式 Key 替换、席位占用提示和确认断开。
- 增加逐席 Manage 与 `Add new connection` 入口，复用同一个连接库，并可把现有或新验证的连接分配给发起操作的席位。
- 修复 Human Gate 按钮的 CSS 优先级冲突，避免批准文字显示成白底白字；批准与拒绝后会保留明确的状态文字。
- 移除每个供应商只能占一个席位的限制，同时保留 2–3 席位和最多两轮的边界。

### 验证

- 使用工作区 Node 运行时后生产构建通过，lint 通过。
- 七项自动测试通过，包括不回显 Key 的模型过滤、混合供应商 BYOK，以及两个 OpenAI 席位复用一个连接并选择不同模型 ID。
- 桌面与手机视口检查没有发现横向溢出、弹窗或控件遮挡。
- 自动验证没有调用任何真实付费模型生成接口。

### 当前限制

- 用户真实的 OpenAI、Anthropic Key 和返回模型列表尚未测试。
- Key 格式不是通用检测标准，无法判断时必须手选供应商。
- 工作区托管连接目前只在界面暴露配置的默认模型。
- 动态模型列表没有权威价格，成本仍是供应商级估算。
- 指定综合者、Skill 组合和多样性指标仍属于 M2.2。

### 下一项决定

验证两个真实会话 Key，检查返回模型，为混合供应商的两个席位选模型，并完成一轮不追加修订的真实会议。

## 2026-08-03 - v0.4 - 聚焦会议工作台与会话 BYOK

### 已完成

- 在上一个已验证 v0.3 提交创建 `backup/pre-live-workspace-redesign-2026-08-03` 备份标签。
- 将纵向堆叠页面改为固定视口内的设置、议题、会议和决定四阶段工作台。
- 加入实时发言者聚焦、协议进度、缩略时间线、完整记录总览和人工决定界面。
- 在程序内加入 OpenAI、Anthropic、Gemini 会话 API Key 与模型 ID 配置。
- 服务端可以即时使用会话密钥，但不持久化、不回显、不写浏览器存储，也不自动重试。
- 加入角色职责，并新增中英文模型与代理蓝图，分离 Connection、Model、Role、Skill、Seat 和 Room。

### 验证

- 生产构建与 lint 通过。
- 五项自动测试通过，包括完整会话 BYOK 会议和密钥绝不出现在事件流中的断言。

### 当前限制

- v0.4 源码已推送且已保存可部署版本，但 Sites 运行时切换后拒绝其自动生成的 `nodejs_compat` 标记，生产发布因此受阻；线上仍是上一版本。在平台或部署输入没有变化前不要原样重复部署。
- 会话密钥刷新即清除；永久 BYOK 仍需要身份和加密存储。
- 同一供应商暂时只能占一个席位；重复供应商与逐席位模型属于 M2.2。
- 尚未验证真实模型质量、延迟、token 统计和失败表现。
- 成本仍是估算，尚无持久的每日或逐用户预算。

### 下一项决定

只连接两家供应商，完成一次不追加修订的代表性真实会议，并与预先保存的单模型基线比较异议质量和 memo。

## 2026-08-03 - v0.3 - 真实 Discuss 实现

### 已完成

- 用统一流式协议替换预设 AI 回复。
- 接入 OpenAI Responses、Anthropic Messages 和 Gemini 流式 API 适配器。
- 完成独立提案、轮转交叉审阅、综合和一次有限追加修订。
- 加入人工批准/拒绝、停止按钮、token/延迟与成本估算。
- 密钥只保存在服务端，浏览器只能看到是否已配置。
- 角色与供应商解耦，并移除未使用的脚手架依赖。

### 验证

- 生产构建通过，包含 `/api/discuss`。
- 五项自动测试通过，其中包括完整的模拟双供应商提案、审阅和综合流。
- 非法请求会在调用供应商前被拒绝，测试没有产生付费 API 请求。

### 当前限制

- 生产环境尚未配置 API Key，因此真实会议仍不可启动。
- 尚未评测真实延迟、token 统计、输出质量与失败行为。
- 房间没有持久化；价格是可配置估算，不是账单。
- 前端会阻止重复提交，但持久幂等性属于 M4。

### 下一项决定

配置至少两个供应商，运行一个代表性议题，并记录交叉审阅是否比单模型发现了更有价值的异议。

## 2026-08-01 - v0.2 - 项目连续性系统

### 已完成

- 新增 `AGENTS.md`，要求后续编码代理先读取项目上下文。
- 新增项目章程、AI 交接、路线图、决策记录和文档索引。
- 为主要项目文档增加中文速读版本。
- 固定三轮默认上限、最多两次重试、防重复调用、停止条件和人工批准边界。
- 将原始脚手架 README 改为项目入口。

### 当前限制

- 文档本身不能强制运行时行为；M4 需要把规则写入编排器。
- 中英文文件必须在每次重要修改中同步，避免内容漂移。

### 下一项决定

开始编码前，确定 M2 的模型配置、API Key 策略、消息协议和最小 decision memo 数据结构。

## 2026-08-01 - v0.1 - 交互原型

### 已完成

- 上线首个交互会议室原型。
- 完成议题、角色、Brainstorm/Review/Decision 模式、模拟有限轮次和决策面板。
- 在产品页面加入可见开发日志。

### 当前事实

- 所有 AI 回复都是本地预设文本。
- 尚未接入 OpenAI、Anthropic 或 Google API。
- 没有房间持久化、证据核查、执行代理和自动评测。

### 已拍板

- 一个产品包含 Discuss、Research、Execute 三种权限。
- 核心价值是可审计的决定和行动，而不是模型聚合。
- 先做真实 Discuss，再做 Research，最后做 Execute。
