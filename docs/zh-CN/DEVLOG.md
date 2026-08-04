# 开发日志

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
- 修复前的开发热更新在当前浏览器里创建了 5 条英文基线房间副本。它们与最初 3 条记录一起保留，因为清理档案属于破坏性操作，需要人类明确确认。
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
