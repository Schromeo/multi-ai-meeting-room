# 路线图

状态：`已完成`、`当前`、`计划中`、`暂缓`。

## 当前定位

- **DP-0.2 工程可移植性已完成（D-066，2026-09-24）：** 仓库自带 vinext launcher、CRLF-safe 源码测试、固定 Wrangler 生成与 inactive D1 可选类型通过 canonical `pnpm check`。[首次 CI](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076814165)在两个平台上均于安装前被 Corepack 签名校验拦截；改用官方固定版本 pnpm action 后，`97b865a`上的 [Ubuntu 与 Windows job](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748)全部通过。DP-0.3 现处于 Correction Brief 与基线 Gate。见[验证](evaluations/2026-09-19-dp-0-2-local-portability.md)。
- **DP-0.1 仓库真实性已完成（D-065，2026-09-19）：** package 身份为`multi-ai-meeting-room@0.0.0-development`；pnpm 11.19.0 与`pnpm-lock.yaml`是唯一 package 路径；四项锁定 native build 依赖有明确安装许可；私有仓库为`UNLICENSED`并保留所有权利。README 与当前状态文案现指向 DP 开发列车，不再沿用过期 v0.10c／未提交说法。[命令基线](evaluations/2026-09-19-dp-0-1-repository-baseline.md)记录 install 与 lint 通过，以及现归 DP-0.2 处理的 Windows script、CRLF 测试与 Cloudflare 类型失败。零供应商调用、零部署。
- **开发计划重构已批准（D-064，2026-09-18）：** [产品开发计划](PRODUCT_DEVELOPMENT_PLAN.md)定义一个宽广、由人主持的 Multi-AI 工作空间，以 **Ask the Room** 为窄入口，在“习惯”和“信任”证据之间交替推进，并分阶段进入 Explore、Create、Research、Play、Project Room 与受控 Execute。[详细开发里程碑](DEVELOPMENT_MILESTONES.md)决定前向构建顺序。DP-0 为当前阶段；仅批准方向不授权付费调用、发布或 Execute 动作。
- **供应商key提示已更新（D-063）：** Setup现在除`AIza`外也识别Gemini `AQ.`授权key，同时保留Anthropic/OpenAI有序判断及明确手选回退。规则只在本地运行，绝不跨供应商试探。构建、63项测试和lint通过，零真实调用。当前Gemini自动识别缺陷已关闭；这不验证凭证，也不增加供应商。
- **PLAN-06新Plan请求回执已关闭（D-062）：** 每个Builder/Reviewer阶段现在会在供应商工作前记录usage未知的`started`，并由终态原位替换。没有Reviewer回执表示未进入该阶段；保存的started表示可能产生用量，不能当成零。构建、62项测试和lint通过，零真实调用。历史歧义与供应商账单权威不变；没有增加通用计费平台。
- **PLAN-11恢复真实性已关闭（D-061）：** stopped快照现在区分预算停止和人工停止，旧房间保持中性。保存Plan在保留输入/输出用量已耗尽时，会在执行前禁用恢复；两个控件都不能启动供应商调用。构建、62项测试和lint通过，零真实调用。D-062另行关闭新Plan阶段回执；PLAN-12持久运行仍待处理。
- **PLAN-13本地契约收尾（D-060）：** 受支持Anthropic实际Plan Reviewer现使用原生JSON Schema，任务语义仍由本地权威决定。严格围栏/说明文字及不支持模型兼容测试通过；构建、62项测试及lint通过，零真实调用。PLAN-13为本地修复（真实未验证），不是完成；PLAN-10继续待处理。下一步最多单独授权一次Fable Reviewer-only调用读取已保存Live014 Plan，绝不再生成Builder。
- **产物优先真实实验014，草稿完整/审阅拒绝：** 刷新的两调用授权下，Sol与Fable各运行一次。Sol交付12/12有效天；Fable完成但返回非法JSON，因此审阅/Human Gate/多模型改进失败，完整草稿仍保存。见[评估及产物](evaluations/2026-08-29-plan-artifact-first-live-014.md)。D-059及PLAN-17/18机械验证通过；D-060现已本地修复PLAN-13，PLAN-10和真实验证仍待处理。
- **产物优先真实实验012，机械失败后本地修复（D-059）：** Detailed Plan现直接按Sol Builder -> Fable实际产物Reviewer启动，首次严格两调用/22K预算。历史12被旧通用synthesis Gate在供应商前拒绝；历史13拒绝合法version-zero空checkpoint，Sol是否启动/计费未知，Fable未运行。两项契约现通过构建、61项离线测试和lint。见[评估](evaluations/2026-08-29-plan-artifact-first-live-012.md)和18项问题清单。再次两调用需刷新授权，不作质量声明。
- **PLAN-03本地配置，待证据（D-058）：** 已识别原始GPT-5 Builder请求low，Plan语义判断继续medium，其他供应商/模型保持默认；请求档位与用量分开保存。构建、59项测试和lint通过，零真实调用。退出证据仍是一次新授权Builder阶段结果；M2.13继续当前。
- **PLAN-01/02本地修复（D-057）：** 有限初始Plan尝试诊断、新格式指令阶段/轮次作用域。构建、59项离线测试、lint通过，零真实调用。见[16项问题清单](PLAN_ISSUE_REGISTER.md)；011历史证据仍缺失、旧correction未改，M2.13质量仍为当前。
- **最新续接011失败：** D-056等待/恢复修复通过构建、54项离线测试及lint。同一010记录新增一次GPT调用，没有新有效天数，审阅未运行；保留6/12天，历史11。本次不是时间截止，输出耗尽还是解析拒收仍不可观察。见[011报告及有序待办](evaluations/2026-08-27-plan-wait-continuation-011.md)。未新增$5授权或自动重试。
- **最新Plan Gate失败：** [质量实测010](evaluations/2026-08-27-plan-quality-live-010.md)在新授权$5下实际调用GPT-5/Opus4.7共6次。一次格式恢复通过，但Builder在180秒超时，仅6/12天；补缺失天数被共享调用预留额度拦截，未新增请求。实际计划审阅及D-055修改未测。已归档原稿与失败，历史11条，实际账单/失败用量不全。
- **源码身份：** 当前是无 tag 的私有预发布版本。源码以 Git commit、存在时的 dirty state 及 active DP 里程碑标识；历史 v0.x 标签代表保存的开发快照，不是 release。
- **可运行基线：** 真实流式 Discuss、可复用模型席位、会话 BYOK、人工决定 Gate、不含凭证的 IndexedDB Event Store、确定性 Canonical Meeting State，以及持久化、由人主持的可恢复编排器。
- **真实证据 Gate：** 已于 2026-08-04 使用 OpenAI `gpt-5-mini` 与 Anthropic `claude-haiku-4-5-20251001` 完成；见[真实基线 001](evaluations/2026-08-04-v0.6-live-baseline.md)。
- **立即证据 Gate：** [Artifact v2 Benchmark 005](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md) 以六次混合供应商调用和 `$0.046` 应用估算到达待决定 Human Gate。机械路径通过，但质量 Gate 失败：明确指标约束被漏掉，Verifier 又通过了语义薄弱的改写。不扩建其他范围。
- **Decide / Plan 预览证据：** [Smoke 006](evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md) 以 $0.044 总估算完成协议恢复，但遗漏具体题目，产物质量 Gate 仍为失败；新结构化路径只有离线证据。
- **详细 Plan 证据：** [Smoke 007](evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md) 拒绝了一份缺少 Day 2 的 2,092-token synthesis。按天寻址 Plan、逐天校验/检查点、另一席位审阅实际计划、只补缺失天，以及不可变批准现已本地实现。真实供应商质量和浏览器验收尚未验证。
- **最新有限证据：** [Verifier v2 Stage Replay 008](evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md) 在恰好一次 Anthropic Haiku 调用中通过双重 lineage/semantics 契约：597 input tokens、224 output tokens、3.1 秒和 `$0.0034` 应用估算。Meeting History 保持 10 条。
- **校正 Gate：** [开发校正循环](DEVELOPMENT_CORRECTION_LOOP.md) 现在是实现、付费评测和里程碑收尾前的强制流程。最近失败会分别按机械、语义、Artifact、Human Gate、体验、经济性和差异化价值记录。
- **M2.12 证据：** [Review 对照包](evaluations/M2.12_REVIEW_COMPARISON.md) 已有三个固定案例及已评分的 [S1 简历基线 009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md)：修复 3/3，可用性 2/2，人工核实项偏弱，回执元数据不全。一次调用标准价估算 $0.00547，页面通用估价 $0.0038。M3/R6 和其他案例未运行，比较优势未知。
- **已批准产品方向：** 一个 Council Kernel 通过经过验证的 Task Pack 生长。Ask the Room 是日常窄入口，Review 是第一个以 Artifact 为中心的信任 Pack；见[产品方向](PRODUCT_DIRECTION.md)。
- **保留的 M2.13 证据路径（D-060/D-061/D-062）：** Live014提供保存的完整产物，Reviewer格式可靠性、恢复控件真实性及新阶段回执已本地通过；saved-artifact Fable review仍未运行，M2.13质量／价值仍不完整。D-064已把它移出立即队列；只有DP-2命名信息增益并获得新付费调用授权时才可恢复。不重生成Plan，也不自动重试。

当前基础足以支持已批准产品开发列车。没有明确 Task Pack 需求，不再启动通用协议、Observer、路由、Agent 自治或广泛界面基础设施工作。任何大型前端修改前仍必须创建命名备份。

## Canonical 开发列车

- **DP-0 - 当前：** 产品／仓库真实性、工程可移植性、首次使用信息架构、免凭证 Demo、导出、公共 API 安全、第一分钟验收。
- **DP-1 - 计划中：** Quick Council／Ask the Room 日常使用证据。
- **DP-2 - 计划中：** 有限 Review 信任证据与简化决定。
- **DP-3 - 计划中：** 从两个已验证消费者形成 Pack contract。
- **DP-4 到 DP-9 - 计划中：** Explore／Create、Research、Play proof、只读 Project Room、受控 Execute、选择性产品化。

DP-0.0 至 DP-0.2 均已完成。DP-0.3“首次使用信息架构”是唯一当前实现里程碑。具体子里程碑、依赖、预算、验收和停止规则见[详细开发里程碑](DEVELOPMENT_MILESTONES.md)。

## 保留的旧校正路径

以下条目继续保存 Review 与 Plan 证据，只有 DP 开发列车明确命名时才恢复；它们不再覆盖 DP-0 的立即构建顺序。

1. **M2.11 收尾：** 逐项编辑、Artifact v3、不可变批准及有限 Verifier v2 供应商 Gate 已完成。Keep original 补齐零已接受 Finding 的结束路径，保留准确 v1、明确未验证并等待人工批准。更广 Review 机器仍冻结。
2. **M2.12 产品对照 - 暂缓：** 保留 S1 和既有工具包，不扩建工具或自动跑 M3/R6。明确新的信息增益并获新预算后再返回；这不等于比较成功。
3. **M2.13 Artifact-first 进入，保留／未关闭：** 结构化 Plan、恢复、人工编辑、显式模型修改/复核现已实现。D-060不重生成保存Plan，已本地关闭Fable审阅格式边界。脚本化第2天意见能只改第2天，并保留原版、拒绝理由与剩余意见。DP-2 后续可证明一份有据真实审阅，再进入修改/复核及人工采用；不扩展通用编辑器/配置或新评测平台。离线闭环不代表教学质量和比较成功。
4. **模型证据：** 在每次只改变一个变量的前提下，对比强单模型、有限多模型路径、较强独立 Artifact Builder 和分阶段 reasoning 设置。
5. **体验阶段：** Artifact 路径通过后，显示阶段进度和已完成 Artifact 单元，不暴露流式传输 JSON。广泛视觉重设计不属于本次校正路径。

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

实现进度：产品和协议功能已完成，并通过模拟端到端流式测试。2026-08-04，真实 OpenAI + Anthropic 房间完成提案、交叉审阅、综合、用量报告、保存和 Human Gate。OpenAI 适配器会省略不兼容的可选生成参数，会议历史已迁入 IndexedDB，经过验证的 Turn Envelope 会进入有上限的 Canonical Reducer，由 Chair 控制的可恢复协议也已实现。M2 只在完成有限 v0.10c 真实检查并转入第一条 Review 产品切片期间保持“当前”。

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

实现进度：会议发言、memo、人工决定、用量、参与者与 Observer 快照、只追加的完成/失败 turn、协议 transition、Chair Directive、Process Report 与 Round Brief 事件、状态/协议快照，以及 Memo/Round Brief artifact 已保存到有数量上限的浏览器本地 IndexedDB 档案。用户可以新建房间而不删除旧记录、重新打开记录、恢复暂停或中断的协议状态，并以事务方式删除记录。凭证不会进入档案。账号归属、服务端同步、导出和跨设备恢复仍未完成。

## M2.6 会议协议蓝图 v1 - 已完成

结果：在修改运行协议前，定义下一版有限 Discuss 架构。

已交付：Human Chair 控制模式、Chair Directive、Participant/Observer/Recorder/Final Synthesizer 边界、Turn Envelope、Canonical Meeting State、Round Brief、Process Report、Follow-up、版本化 Memo、上下文策略、输出上限、预算与停止策略、本地优先持久化、UX 注意力模型和实施顺序。

完成条件已满足：中英文蓝图明确区分已实现行为与已批准未来行为，并列出剩余开放决定。

## M2.7 本地 Event Store - 已完成

依赖：当前 v0.6 历史和已批准协议蓝图。

交付：供应商无关 `RoomStore`、IndexedDB 实现、schema version、从当前 localStorage 会议记录迁移、Room/参与者快照/append-only Event/State Snapshot/Artifact/Usage 集合、事务式房间删除和支持导出的读取接口。

安全边界：API Key、认证 header 和带凭证的 Connection record 不进入存储；系统角色和席位只保存 provider/model/role 快照。

完成条件已满足：`RoomStore` 初始化带版本的七个 IndexedDB store，事务迁移经过验证的旧 localStorage 记录，只持久化已完成或失败的 turn，在刷新后重建房间，把档案实际裁剪到 30 个房间，并且不会恢复凭证。浏览器验证迁移并重新打开了 3 个旧房间；两次刷新后 memo 和用量仍完整。

## M2.8 结构化 Meeting State - 已完成

依赖：M2.7。

交付：Turn Envelope 验证、短 statement 与 card 上限、Claim/Dispute/Assumption/Chair Directive/Human Choice/Follow-up record、确定性 Canonical Reducer、来源链、活跃状态 token cap、状态版本，以及无自动付费重试的 format-error 处理。

完成条件已满足：所有供应商 turn 必须解析成严格、有限的 JSON Turn Envelope，之后才能发出 `agent.done`；格式错误会发出 `agent.format_error`、保存为 `turn.format_failed`，且不自动重试。确定性 Reducer 会原子拒绝未知引用与状态超限，生成稳定且带来源的 record ID，忽略重复 turn ID，为每次成功归并增加版本，并把有效 JSON 工作上下文限制在 6,000 字符内。Canonical snapshot 保存到 IndexedDB，旧的无 state 房间仍可读取。

## M2.9 由人主持的可恢复编排器 - 已完成

依赖：M2.8。

交付：显式房间状态机、Auto/Checkpoints/Turn by turn、Raise Hand、append-only Chair Directive、安全边界暂停与恢复、用户选择最大轮数、定向额外 turn、幂等 transition ID 和中断恢复。

完成条件已满足：客户端在每个供应商 phase 前持久化显式协议状态，把 proposal/review/synthesis 拆成独立请求，默认 Checkpoints，同时支持 Auto 与 Turn by turn；Raise Hand 在下一安全边界暂停；带范围 Chair Directive 追加到 Canonical State 与 Event Store；用户选择最大轮数；transition ID 幂等记录。若 turn ID 已存在，重复的已完成 transition 会在供应商调用前被拒绝；刷新恢复到运行中的 transition 会标记为 interrupted，并要求人类显式恢复。进行中供应商调用是否已计费天然存在不确定性，恢复前会明确提示。确定性 phase fixture 与恢复测试通过；有限真实供应商验证是 M2.10 的第一个 Gate。

## M2.10 Observer、预算与定向辩论 - 当前

依赖：M2.9。

交付：用户选择 Observer 模型、确定性 novelty/progress 指标、每完成一轮最多一次 Observer 调用、带来源 Round Brief、循环/偏题/过早同质化报告、round/turn/token/time 硬限制、价格未知时的提示性费用上限、启动前最大调用数，以及后续轮只路由到明确未解决分歧。

完成条件：每个额外 turn 都对应具体未解决问题；硬限制自动终止；软质量停止对 Chair 可见且可覆盖；Observer 不能修改状态或批准 Decision。

实现进度：M2.10a 已加入向后兼容的 Meeting Budget、精确调用前 agent-turn Gate、已观测 token/时间边界停止、失败 turn 用量、带来源 Process Report、可逆结构警告和精简预算显示；验证后 Turn 呈现会把原始 JSON 留在舞台之外。M2.10b 已加入不占 Seat 的可选用户指定 Observer、每个启用轮次恰好一次可恢复的 Review 后调用、5,000 字符 Canonical State + Process Report 上下文边界、严格来源引用校验、不自动重试的 300 output-token 上限、带来源 Round Brief、预检计数，以及不含凭证的 event/artifact 持久化。M2.10c 已加入 Human Chair Dispute 选择器、最多两个相关 Seat 的确定性路由、持久化且可恢复的 targeted-debate plan，以及只使用明确 Dispute、关联 Claim、active Directive 与有限来源 ID 的专用 400-output-token 最小 targeted Envelope；随后仍生成只针对该轮增量的新 Process Report 和可选 Round Brief。逐 phase parser 上限与最坏情况 Canonical State 容量现在可容纳完整有限三席 Proposal/Review 批次。旧房间会安全默认新增字段并保持可读。2026-08-25 烟雾评测验证了混合供应商 Proposal/Review，但未完成最终 targeted-debate/Observer/synthesis 链。真实语义质量评测、用户可编辑多维限制和权威费用执行仍未完成。

**范围冻结：** 通用 M2.10 扩建已经结束。第一项小型 M2.11 Review benchmark 可以恰好验证一次修正后的最小 targeted Envelope；成功则关闭证据 Gate，再次失败则把 targeted debate 降为 Review Pack 可选项，而不是开启新的编排里程碑。更广泛的 Observer 语义、语义路由、embedding novelty、权威价格和更多预算控制继续退出关键路径。

## M2.11 Review Task Pack - 进行中

依赖：M2.10。

产品案例：根据目标、参考资料和明确真实性边界，审阅一份用户提供的 Artifact。

交付：Review Agenda；Artifact v1 和来源包保存；任务自适应审阅 Role Pack；独立 Finding card；保留冲突的重复聚类；一个明确高影响交叉审阅；独立配置 Editor 或显式参与者复用省钱模式；结构化 Change Set；Artifact v2；改动部分核验；分离的 Executive Brief 与详细 Artifact；逐项接受、拒绝或编辑；不可变已批准 Artifact 版本；可展开审计来源链。

首批 benchmark：简历对照职位描述、产品或需求文档，以及技术计划。

实现进度：v0.11a 新增 Review Task 输入与 canonical 独立 Finding；v0.11b 新增可信时间、有约束力的 Chair 决定和 canonical-only synthesis；v0.11c 新增严格 Change Set、由应用生成的 Artifact v2、改动部分验证、结果视图、预算/进度处理和恢复。Benchmark 002 随后证明 Editor 成功，但 Verifier 格式和组合恢复失败。v0.11d 新增具体 Verifier 响应骨架、字段诊断、持久化 `ReviewEditCheckpoint`、Verifier-only Resume 和一项预检可见恢复额度。v0.11e 新增仅开发环境可见的固定 Verifier Stage Replay，以单调用、无重试、无持久化边界验证格式兼容。Stage Replay 003 与 Mechanical Smoke 004 已通过，真实 Benchmark 005 也到达 Human Gate，同时暴露漏掉 Finding 与 Verifier 独立性失败。v0.11f 加入追加式带来源 Chair Finding 新增/supersede、客户端与服务器来源校验、lineage/semantics 双维检查，以及确定性 Remaining Human Checks。v0.11i 新增零调用逐项 replacement 编辑、由应用派生的 Artifact v3、不可变模型 lineage、明确的 v2 verification scope 与不含凭证的 revision 持久化。v0.11j 新增带来源的不可变批准 snapshot 与原子决定回滚。Stage Replay 008 在一次有限 Anthropic Haiku 调用中通过 v2 双重 lineage/semantics 契约。独立系统角色配置和 Finding 聚类保留为待 M2.12 证据支持的提案，不会自动进入实现。

完成条件：用户可以提供 Artifact v1 与来源，获得关键独立 Finding 和详细 Artifact v2；每个被接受修改都能追溯到 Finding 以及来源或明确推断；用户逐项决定改动；无需阅读完整 transcript，也不把整个详细 Artifact 重放给每个模型请求。

Durable transition runner 保持在本切片之外，除非页面导航导致有限 Review 案例无法完成。任何“离开页面后付费工作仍安全继续”的承诺前必须实现它，但它不能替代 Artifact 结果成为本里程碑目标。

## M2.12 Review 评测与 Shared Core 收束 - 暂缓

依赖：M2.11。

基线进度：真实基线 001 已完成，发现跨模型有效增量、输出过长、任意生成阈值进入 memo、仅最终阶段有人类控制，以及 OpenAI 模型参数兼容缺口。

准备完成：现有三个案例、离线导出、S1 入口、回执访问及估价来源已经够用。009 已评分，没有第二个配对分组。D-052 关闭工具扩建，暂缓对照，先修正有明确边界的主流程失败；不因格式通过就宣称 M2.11 产品完成。

S1 已完成但有限制：[009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md) 用一次固定 GPT-4.1 调用修复全部预设问题。完整可见输出已保存，服务器回执元数据不全，人工核实项偏弱，通用估价不同于模型价格。零调用回执修正不追溯补齐元数据。M3/R6 未运行，后续对照需明确信息增益和新授权。

交付：保存单模型基线；记录一份手动 GPT-to-Claude 式复制审阅基线；在三个 benchmark 上运行 Review Task Pack；任务 rubric；交叉审阅独有且被接受的修改；被拒绝或无依据的 Finding；人工 edit distance；调用、token、延迟、费用和阅读负担；协调失败分类；低价值协议功能的删除或简化决定。

完成条件：证据识别出结构化交叉审阅独有且被接受的重要改进，说明它们是否值得成本和投入，并只留下 Review 与至少一个明确第二使用者需要的抽象。未通过评测的功能被简化、改成可选或删除。

## M2.13 Decide / Plan Task Pack - 当前

依赖：广泛 Task Pack 扩展仍依赖 M2.12。D-052 允许在对照暂缓时修正已观察到的详细 Plan 失败，不代表 M2.12 完成。

本地实现：默认12天/10 MEU/360分钟；产物优先Builder后接独立实际计划Reviewer，有界缺天/Reviewer-only恢复。D-054加入人工逐天编辑和准确批准；D-055加入显式受影响天模型修改/复核、不可变来源/审计、拒绝依据、剩余意见和任务化质量配置；D-060仅对明确受支持的Anthropic Plan Reviewer使用原生JSON Schema，同时保留本地语义校验和不重试。真实Reviewer接受、教学质量、修改/复核采用、浏览器/存储及更广案例仍未验证。见[质量闭环简报](correction-briefs/2026-08-27-plan-quality-closure.md)。

交付：Decision 与 Plan Agenda 变体；推荐 Role Pack；备选路径、成立条件、风险、checkpoint 和反转触发条件；详细决策包或可执行计划；有范围追问；符合 Artifact 的 Human Gate。

完成条件：一个真实决定和一个受约束计划端到端完成，证明 Review 中哪些抽象确实可复用，并根据 Rule of Two 而不是猜测收束 Task Pack 契约。

## M3 审计账本 - 计划中

建立 Claim、Evidence、Dispute、Decision、Action、Artifact 和 Evaluation；最终决定可以追溯到依据、异议、修订和人工批准。

与 M2.8 的关系：M2.8 建立 Discuss 协议需要的结构化本地房间记录；M3 在其上扩展证据感知、可查询审计实体，不重新开始数据模型。

## M3.1 Explore Task Pack - 计划中

交付：发散优先 Role Pack、想法聚类、保留有用离群想法、用户策展、可选 surprise round 和 Idea Board Artifact。

完成条件：房间在批判前扩大有用可能性，避免过早收敛，并允许用户选择方向，而不把脑暴变成决策协议。

## M3.2 Create Task Pack - 计划中

交付：一个指定 Author、编辑角色、版本化章节、Artifact Memory、任务化上下文检索、连续性状态和局部修订审阅。

完成条件：长篇 Artifact 保持统一声音和连续性，同时不在每轮向所有 Seat 广播完整手稿或 transcript。

## M3.5 Research 房间 - 计划中

加入检索、来源保存、核查队列、引用与时效信息；关键事实被标记为支持、矛盾或未解决。

## M4 Harness 编排器 - 计划中

加入状态机、上下文隔离、预算、停止规则、防重复调用和评测接口；每个额外轮次都必须对应一个明确未解决问题。

与 M2.9 的关系：M2.9 验证有限讨论状态机；M4 将同一控制模型扩展到工具调用、工作区修改、Executor/Reviewer 分离、确定性检查和 Action 幂等。

## M4.5 Execute 房间 - 计划中

优先本地执行连接器，加入最小权限、批准门、编码代理、独立 Reviewer 与确定性检查。

## M4.8 Play Task Pack - 延后

交付：确定性 Game Pack 接口、公共与私有 Seat state、合法动作 schema、带 seed 随机、可见性规则、有限回合和回放。

完成条件：一场有明确规则的模拟不泄漏隐藏信息，也不让模型拥有规则执行权。Play 延后到工作型 Task Pack 证明产品价值之后。

## M5 评测与加固 - 计划中

建立单模型基线、结果评分、回归场景、成本/延迟数据和失败恢复，证明多代理在哪些情况下有效或无效。

暂缓：多人协作、平台代付计费、模型市场、移动端、无人自治、广泛外部集成和云执行基础设施。

基于账号的 D1 房间同步也暂缓到具备身份、房间所有权、删除语义、加密边界和冲突策略之后。空 Drizzle/D1 骨架不算已实现持久化。
