# 详细开发里程碑

状态：已批准
批准日期：2026-09-18
当前阶段：DP-0 - 产品真实性与第一分钟体验
当前里程碑：DP-0.3 - 首次使用信息架构

本文档是已批准[产品开发计划](PRODUCT_DEVELOPMENT_PLAN.md)的 canonical 前向开发顺序。历史 `M0` 到 `M5` 路线继续保存已实现和未完成工作的证据；当它与本文冲突时，不再决定下一项开发顺序。

## 1. 计划模型

### 阶段、里程碑和切片

- **阶段**（`DP-x`）代表一个用户价值 Gate，可包含多个里程碑。
- **里程碑**（`DP-x.y`）只交付一个可检查的用户或工程结果。
- **实现切片**是推进一个里程碑所需的最小 Correction Brief、代码变化、评测和收尾。
- 任何时候只允许一个实现切片处于活动状态。

### 状态词汇

- **已完成：** 已有退出证据，并记录限制。
- **当前：** 唯一可以驱动下一份实现 Brief 的里程碑。
- **就绪：** 依赖已满足，但尚未启动。
- **计划中：** 已排序，但仍依赖更早证据。
- **Lab：** 有时间上限的探索，不拥有 Shared Core 决策权。
- **暂缓：** 明确不在活动开发列车中。
- **移除：** 证据否定该工作，但保留历史。

### 里程碑规模预算

- **S：** 一个有限行为，通常一到三个可检查 commit。
- **M：** 多个互相依赖的切片；实现前必须继续拆分。
- 任何里程碑都不能以 **L** 规模进入实现，必须先拆解。
- 面向供应商的里程碑遵循：本地 fixture → 单阶段 replay → 短 smoke → 真实 benchmark。
- 付费调用、对外发布和 Execute 动作始终需要当时单独授权。

### 完成定义

只有满足以下条件，里程碑才算完成：

1. 用户 Artifact 或可观察行为确实存在；
2. 确定性验收检查通过；
3. 必需的人工 rubric 已评分；
4. 适用时记录成本、延迟、阅读负担和失败行为；
5. 与声明的基线完成比较；
6. 已知限制和被否定的主张仍清晰可见；
7. Roadmap、Devlog、Handoff、必要的 Decisions 以及中文镜像都已更新；
8. 以 Continue、Repair、Simplify、Archive、Defer 或 Remove 明确收尾。

## 2. 产品开发列车

```text
DP-0 产品真实性与第一分钟体验
  -> DP-1 Quick Council / Ask the Room
  -> DP-2 Review 信任证据
  -> DP-3 Pack contract 与自适应首页
  -> DP-4 Explore 与 Create
  -> DP-5 Research 与情景预测
  -> DP-6 Play Pack 证明
  -> DP-7 只读 Project Room
  -> DP-8 受控 Execute
  -> DP-9 产品化与选择性扩张
```

只有 Lab 具备固定 fixture、小预算、不增加 Shared Core 抽象，并明确以 Promote／Repeat／Archive 结束时，才可以穿插在阶段之间。

## 3. 现有能力台账

### 现在直接复用

- 供应商 adapter、会话 BYOK、Connection、Model、Role、Seat；
- 有限 streaming、请求回执、预算、中断恢复和重复防护；
- 本地优先 RoomStore、event、snapshot、artifact、version、usage；
- Human Chair 决定和精确批准快照；
- Review Change Set lineage 与 Plan 可寻址记录经验。

### 保留，但没有证据前不扩建

- Observer 与 Round Brief；
- 通用 cross-review 和 targeted debate；
- LeetCode 专属 Plan schema 与恢复策略；
- 超出已验证契约的供应商原生 structured output；
- 广泛 Role、Skill、routing 与 autonomy 框架。

### 在 DP-0 修复

- 过期产品、版本和状态文案；
- package 身份和 package-manager 歧义；
- 切换模式时 Objective 串线；
- 没有免 key 的价值查看路径；
- 缺少导出；
- TypeScript ambient 声明和 Windows 源码测试可移植性；
- 公共端点认证、限流与 workspace key 政策歧义；
- 只在 DP-0／DP-1 实际触及的边界上处理巨型 page 与 route 的职责分离。

## 4. 阶段总览

| 阶段 | 发布结果 | 主要证据 | 阶段退出条件 |
| --- | --- | --- | --- |
| DP-0 | 可检查 Foundation | 首次使用理解度与干净工程基线 | 用户能理解、演示、开始 Solo 并安全导出 |
| DP-1 | Daily Council Alpha | Ask the Room 重复使用 | 独特有效增量值得额外成本和阅读 |
| DP-2 | Trust Pack Beta | 匹配 Review 对照 | 被接受的重要改进胜过简单基线 |
| DP-3 | Pack Platform Beta | 两个已证明消费者加一个内部 spike | 共享 contract 不会抹平 Pack 协议 |
| DP-4 | Expressive Workspace Beta | 被保留的点子与保留声音的修改 | Explore／Create 证明不只会纠错 |
| DP-5 | Grounded Research Beta | 有来源 Claim 覆盖与矛盾处理 | 被采用简报可检查并保留不确定性 |
| DP-6 | Play Proof | 完整可回放 session | 一个游戏没有规则或隐藏状态泄漏 |
| DP-7 | Project Room Alpha | 更好的任务／上下文表述 | 只读项目 Council 改善保存的编码案例 |
| DP-8 | Execute Preview | 有范围、可验证的 Patch | 获批动作不越权并通过检查 |
| DP-9 | v1 Candidate | 留存、信任、安全与经济可行性 | 只扩张或变现有证据的能力 |

## 5. DP-0 - 产品真实性与第一分钟体验

**目的：** 暴露已有价值，移除误导状态，在新增协议前建立安全基线。

**进入条件：** 已批准 D-064 方向及本文里程碑计划。

**阶段预算：** 不需要付费模型调用，不做广泛视觉重设计，现有 Room 历史必须继续可读。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-0.0 方向与里程碑批准 | 已完成／S | 已批准 Product Direction、D-064、中英文详细里程碑、历史路线到新路线映射 | 已记录所有者批准；文档一致指向 DP-0 为当前阶段 |
| DP-0.1 产品与仓库真实性基线 | 已完成／S | 真实 app/package 名称与版本策略、唯一 package-manager 政策、明确 license 状态、当前 README／状态文案、完整 build/test/type 基线 | starter 身份与过期 uncommitted 说法已移除；已记录准确 Windows install/build/test/lint/type 结果及交给 DP-0.2 的失败 |
| DP-0.2 工程可移植性基线 | 已完成／S | CI 检查、Cloudflare ambient 类型声明、CRLF-safe 源码测试、确定性测试命令，以及干净 build/lint/type/test 报告 | Windows 本地检查及`97b865a`上的 Windows／Ubuntu CI job 均通过；首次 Corepack 设置失败已在不改变测试契约的情况下修复 |
| DP-0.3 首次使用信息架构 | 当前／M——待简报和基线 | Chat、Ask the Room、Drop an Artifact、Browse Packs 入口；一个 Connection 可开始 Solo；各模式独立默认 Objective | 新用户无需先被 Connection Library 遮住产品；切换模式绝不继承其他模式 Objective |
| DP-0.4 免凭证 Demo 与回放 | 计划中／S | 一个内置只读 Room replay，展示独立视角、有效分歧、Human Chair 选择、最终结果和成本来源 | 无需 key 或供应商调用即可理解差异化循环；Demo 明确标为非实时 |
| DP-0.5 Artifact 与 Room 导出 | 计划中／S | 带版本的 Markdown 与 JSON 导出，包含摘要、Artifact、lineage、decision、usage、schema version，排除凭证 | 导出 fixture 可通过验证往返；secret scanner 找不到 key 或 authorization 字段 |
| DP-0.6 公共 API 安全边界 | 计划中／S | 明确 BYOK-only 或带认证 workspace 付费政策、请求大小／调用限制、rate limit、安全错误和部署清单 | 未认证调用者不能静默消耗 workspace 付费凭证；政策有测试和文档 |
| DP-0.7 第一分钟验收 | 计划中／S | 五名新用户走查，以及 Setup、Demo、Solo、模式切换、导出的 accessibility／responsive 检查 | 至少四人无需指导即可说明产品并到达有用界面；阻塞困惑转成命名 DP-0 repair |

**非目标：** 新供应商、新 Agent 循环、账号同步、计费、插件 marketplace 或 semantic routing。

**阶段决定：** 只有产品无需凭证即可检查、且一个 Connection 能开始使用，才进入 DP-1。否则 Repair DP-0，不能用新 Council 功能掩盖激活失败。

## 6. DP-1 - Quick Council／Ask the Room

**目的：** 验证日常窄动作：把一个回答、想法或选择升级为独立挑战。

**进入条件：** DP-0 退出通过；已有强单模型基线。

**阶段预算：** 包含已有回答在内共两到三个视角；最多一次 Difference Map 调用和一次显式定向追问；默认不启用 Observer，也不自动第二轮。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-1.0 Quick Council 评测包 | 计划中／S | 十二个固定案例，覆盖日常选择、反思娱乐、创意发散、实用规划；单模型回答；novelty、usefulness、uncertainty、阅读、延迟、成本 rubric | 协议调优前冻结 fixture 与评分 |
| DP-1.1 Solo 对话路径 | 计划中／M | 单模型 thread、选中上下文边界、本地持久化、停止／取消、可见模型与 usage 身份 | 一个 Connection 可完成并恢复有限 Chat，不必构建完整 Meeting |
| DP-1.2 Ask the Room 升级 | 计划中／M | 已有回答是视角一；一到两个独立提示 Challenger 只接收用户目标与选中来源，不接收第一个模型结论 | Prompt 证明独立；不复制无关 transcript 或私有状态；preflight 声明最大调用数 |
| DP-1.3 Difference Map | 计划中／M | 紧凑呈现共识、关键差异、隐藏假设、置信限制和建议下一步，并链接完整视角 | 每个映射项可追溯到视角；无来源事实共识不会升级为已验证事实 |
| DP-1.4 Human Chair 动作 | 计划中／S | 选择方向、合并选中元素、提一次定向追问、升级 Deep Council／Pack 或停止 | 每个动作调用影响有限，并持久化可检查 Choice |
| DP-1.5 Quick Council 持久化与导出 | 计划中／S | 恢复、重命名、复制为模板，并导出问题、视角、Difference Map、Chair Choice、usage | 刷新不重复付费调用；无需 transcript 顺序也能理解导出结果 |
| DP-1.6 日常使用评测 | 计划中／S | 对冻结基线运行十二案例和五人第二任务试用 | 至少 6/12 案例产生被接受独特增量，至少五名试用者主动发起第二任务，且无不受支持事实被当成已验证 |

**非目标：** 完整辩论、通用共识投票、自动选模型、长期个人记忆或社交 Feed。

**停止／简化：** 有效独特增量低于 4/12，或阅读／成本不可接受，就把 Ask the Room 保留为可选 compare card，不设为首页默认，也不增加模型数。

## 7. DP-2 - Review 信任 Pack

**目的：** 证明结构化挑战能比简单流程产生可采用的重要改进。

**进入条件：** DP-1 已建立轻量挑战模式；现有 Review Artifact 和冻结 comparison kit 保持不变。

**阶段预算：** 使用现有三个 benchmark 类别。不建新评测平台，不广泛重写 Review，也不为诊断后续失败重跑已有效 Builder／Editor。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-2.0 证据盘点与冻结 | 计划中／S | 把现有 Review 代码、Live 001-008、S1 baseline、缺失 arm、未解决语义失败放入一张 truth table | 每个拟议调用只回答一个命名未知；历史失败不改写 |
| DP-2.1 Saved-artifact Reviewer 收尾 | 计划中／S | 只运行或本地替换仍不确定的 saved-artifact review 边界，使用已有回执，不重生成已接受前序工作 | 一份有据 review 被接受，或供应商契约被否定并保留诊断 |
| DP-2.2 面向采用的 Review 界面 | 计划中／M | Artifact-first 输入、source／truth constraints、Finding decision、Change 对比、verification scope、Keep original、edit、approve、export，不依赖 transcript | 用户能完成流程，并解释哪些文本经模型验证、人工编辑或仍未解决 |
| DP-2.3 匹配对照运行 | 计划中／M | 在简历、产品／需求文档、技术计划 fixture 上运行强单模型、手工双模型、结构化 Review | 输入、模型、预算、输出、仅 evaluator 可见 anchor 和人工决定可比较归档 |
| DP-2.4 价值与失败分析 | 计划中／S | 评分独特被接受 Change、False Finding、重复、人工 edit distance、采用、延迟、成本、阅读负担 | 因果归因区分独立挑战带来的改进与 evaluator／最终 Author 带来的改进 |
| DP-2.5 Review 架构决定 | 计划中／S | 对 clustering、通用 cross-review、targeted debate、Observer、Editor、Verifier、参与者复用选择 Retain／Simplify／Remove | 只有证据支持的功能进入前向路径 |

**非目标：** 企业文档管理、任意文件格式、账号协作，或靠增加 Reviewer 弥补弱证据。

**阶段退出：** 至少两个 benchmark 类别出现强单模型没有、且被接受的重要改进，同时 False Finding 和投入受控；否则简化为一个 Author 加可选独立 Challenger。

## 8. DP-3 - Pack Contract 与自适应首页

**目的：** 只把 Quick Council 与 Review 共同证明的边界提升为可复用 Pack 系统。

**进入条件：** DP-1 与 DP-2 已完成架构决定。

**阶段预算：** 不建公开 marketplace、远程代码加载、通用插件权限或 Pack 自管凭证。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-3.0 共享边界证据图 | 计划中／S | 并列映射真正共享与 Pack-local 的 input、state、phase、artifact、gate、budget、evaluation | 每个共享字段有两个已验证消费者；推测字段保留本地 |
| DP-3.1 Pack manifest v1 | 计划中／M | 静态版本化 manifest，包含 intent、input schema、推荐 roles、truth mode、permission、context policy、artifact、Human Gate、budget、rubric | 非法或越权 manifest 本地失败；Pack 不能注入 credential 或 code |
| DP-3.2 Pack runtime 与持久化 | 计划中／M | 确定性 Pack 选择、state namespace、artifact 注册、版本迁移、resume、export hook | Quick Council 与 Review 通过共享边界运行，但保留各自 phase protocol |
| DP-3.3 自适应首页与升级 | 计划中／M | Chat、Ask the Room、Drop an Artifact、Browse Packs、最近工作；对话可用选中上下文升级 Pack | 升级保留 source lineage，不重放整段 transcript |
| DP-3.4 第三个 Pack 内部 spike | Lab／S | 仅使用文档化 Pack 边界构建一个非生产 Explore 骨架 | 无需修改 provider、secret、RoomStore 基础或核心协议 switch |
| DP-3.5 Contract 决定 | 计划中／S | 冻结 v1、修复命名缺口或回滚过度泛化字段 | Contract 文档与测试只匹配有真实消费者的行为 |

**阶段退出：** 两个生产 Pack 和一个内部 spike 使用该边界，不发生协议扁平化或权限泄漏。

## 9. DP-4 - Explore 与 Create

**目的：** 证明工作空间能扩展并塑造想法，同时保留人的品味与作者声音。

**进入条件：** Pack contract v1 足够稳定，可承载一个新消费者。

**阶段预算：** 一个 Explore、一个 Create、一个娱乐 Lab；不建通用长期记忆或模板 marketplace。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-4.0 创意评测 fixture | 计划中／S | 固定脑暴和修改案例，以及 novelty、usefulness、diversity、voice、coherence、人工选择 rubric | 调角色前冻结 baseline 与 evaluator 规则 |
| DP-4.1 Explore Idea Board | 计划中／M | 独立发散角色、有限 idea record、聚类、离群保留、可见 provenance | 聚类后有用离群点仍保留；重复项不虚增多样性 |
| DP-4.2 人工筛选与收敛 | 计划中／S | pin、merge、reject、annotate、一次 surprise round，并把选中想法升级成 brief | 模型不能静默重引入已拒绝想法；选中 lineage 保留在导出中 |
| DP-4.3 Create Artifact Memory | 计划中／M | 一个 Author、有限编辑角色、版本化章节、voice／continuity 约束，只检索相关章节 | 修改提升 rubric，但不抹平声音或丢失不可变旧版本 |
| DP-4.4 反思型娱乐 Lab | Lab／S | 一个明确解释型的占星式模板，包含趣味角色、用户 framing、可分享输出 | 用户理解这是娱乐；不存在事实权威或确定预测语言 |
| DP-4.5 创意价值决定 | 计划中／S | 与单模型 baseline 比较保存结果并记录复用意图 | 只保留能带来 baseline 没有、且用户保留的点子或修改的流程 |

**阶段退出：** Explore 产生被保留的非重复点子，Create 产生被采用、保留声音的修改；用户检查能理解娱乐标签。

## 10. DP-5 - Research 与情景预测

**目的：** 加入外部证据、freshness 和保留不确定性的情景工作。

**进入条件：** source lineage、Pack truth policy 与 export 可靠。

**阶段预算：** 从一种 connector 和一份有限 research brief 开始；不自动金融行动、不做无授权抓取或无限浏览。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-5.0 Research 威胁与来源模型 | 计划中／S | source type、permission、freshness、citation snapshot、license／retention、prompt injection、claim status schema | 不可信来源文本不能变成指令；不受支持来源保持明确分类 |
| DP-5.1 Retrieval connector v1 | 计划中／M | 用户触发检索、有限来源保存、时间、标题、URL／identity、excerpt limit、失败报告 | 每个来源可检查；缺失访问或 freshness 不隐藏 |
| DP-5.2 并行研究角色 | 计划中／M | Lead 拆问题、Search Worker 使用不同有限 scope、确定性 merge queue | 并行覆盖不重叠问题，并在预期信息增益耗尽时停止 |
| DP-5.3 Claim verification queue | 计划中／M | supported、contradicted、inferred、outdated、unresolved，配 Citation Checker 与 Human Gate | 每个被采用重要事实 Claim 有来源状态；模型同意不能升级状态 |
| DP-5.4 公司与金融情景 Pack | 计划中／M | current-state brief、assumption、scenario、probability／range、trigger、反证、更新时间 | 事实与预测视觉分离；不确定性与非建议边界明确 |
| DP-5.5 Research benchmark | 计划中／S | 固定问题对比一个强 research 模型与手工研究 | 评分 citation 正确性、coverage、矛盾可见性、时间、成本、不受支持 Claim |

**阶段退出：** 被采用简报可逐 Claim 审计，冲突证据可见，系统能带未解决问题停止。

## 11. DP-6 - Play Pack 证明

**目的：** 在确定性规则和隐私边界下验证可回放的 Multi-Agent 娱乐。

**进入条件：** Pack runtime 支持 Pack-local state 与 visibility policy。

**阶段预算：** 只做一个游戏；必须小到可以实现完整确定性引擎。回放 session 通过前不建通用游戏平台。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-6.0 游戏选择与正式规格 | 计划中／S | 选定游戏、state machine、legal action、胜负／停止、公开／私有字段、随机性、回合上限、测试 fixture | 每条规则无需模型判断即可表达；编码前消除歧义 |
| DP-6.1 确定性游戏引擎 | 计划中／M | 应用拥有 reducer、合法动作校验、seeded randomness、stop condition、scripted player | 完整脚本游戏可复现完成；非法动作不改变状态 |
| DP-6.2 私有 Seat 状态 | 计划中／M | per-Seat view、服务端／客户端 visibility enforcement、redacted event、reconnect、spectator boundary | 对抗测试证明 prompt、UI、export、log、其他 Seat event 均无隐藏信息 |
| DP-6.3 AI 回合 Adapter 与 Personality | 计划中／M | 模型只能从合法动作选择，并可附有限角色化表现 | 非法模型输出不能改规则；Personality 与动作有效性分离 |
| DP-6.4 回放与 Human Host | 计划中／S | 完整状态变更回放、暂停、替换 Seat、处理 timeout、结束 session | Host 动作 append-only；回放得到相同公开结果 |
| DP-6.5 Playtest 决定 | 计划中／S | 多次真人 session，测完成、泄漏、规则错误、延迟、趣味和重玩意图 | 用户主动重玩；零隐藏状态泄漏、零接受非法动作 |

**阶段退出：** 一个游戏完整、可回放且用户愿意再玩；否则 Archive Lab，不建通用 engine。

## 12. DP-7 - 面向 Codex 与 VS Code 的只读 Project Room

**目的：** 在授予写权限前，先改善项目表述、提示词上下文和审阅。

**进入条件：** Research 来源边界和 Pack 权限已经证明。

**阶段预算：** 只读 filesystem／project snapshot；不执行命令、不应用 Patch、不修改 Git、不上传 secret scan、不运行后台 Agent loop。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-7.0 Project 威胁与上下文契约 | 计划中／S | path scope、exclusion、secret、binary／large-file、ignore rule、snapshot identity、用户同意、retention | fixture 证明拒绝 traversal 与 excluded path；prompt 只有获批上下文 |
| DP-7.1 只读项目快照 | 计划中／M | file tree、选中文件、允许时的 Git metadata、用户 pin、content hash、change detection | 快照可复现，绝不读取获批 root 外部 |
| DP-7.2 Context Critic | 计划中／M | 检测缺失约束、过期假设、冲突指令、无关上下文，并建议增删 context | 每项建议引用项目证据或提出用户问题；不声称读取私有推理 |
| DP-7.3 Project Council 角色 | 计划中／M | Planner、Context Critic、Builder-proposer、Reviewer、Tester-planner，使用隔离的任务形上下文 | 每个角色有可检查贡献；synthesis 保留未解决风险 |
| DP-7.4 Plan 与 Patch proposal Artifact | 计划中／M | 实现计划、拟议 diff／文件级 Change Set、测试、风险、rollback、Human Gate，不应用修改 | Proposal 对 snapshot identity 验证，并明确显示未应用 |
| DP-7.5 Codex 与 VS Code Adapter | 计划中／M | 使用文档接口和用户选中上下文的显式 import／export 或 connector contract | Adapter 不假设能读模型私有推理，不能静默扩大项目 scope |
| DP-7.6 Project benchmark | 计划中／S | 保存编码任务，对比原单 Agent framing 与 Project Room 输出 | 捕获重要缺失约束或缺陷，上下文受控，不修改任何文件 |

**阶段退出：** 在多个保存案例中，只读 Project Room 改善被接受的任务 framing 或发现重要问题，同时不暴露无关文件。

## 13. DP-8 - 受控 Execute

**目的：** 把获批 Project Room Artifact 转化为可验证的有限行动。

**进入条件：** DP-7 通过；执行威胁模型和用户明确授权仍有效。

**阶段预算：** 一个仓库、一个有限任务、一个隔离 branch／worktree 或等价物、一份执行计划、不允许无人递归。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-8.0 授权与动作模型 | 计划中／S | read、write、command、network、secret、external service、commit、publish 类型权限，以及过期和撤销 | 每个动作映射到显式 authority；默认拒绝 |
| DP-8.1 隔离本地 Connector | 计划中／M | 认证本地控制 channel、有限 workspace、sandbox profile、resource limit、cancel、append-only receipt | 托管控制面无法获得无限机器访问；Connector 拒绝越界 path／action |
| DP-8.2 获批执行计划 | 计划中／S | 精确 file／action／test／limit／rollback 与预期 diff，经 Human Chair 确认 | 没有匹配 approved plan version 就不开始 mutation |
| DP-8.3 Executor 与确定性检查 | 计划中／M | 有限变更应用、command／test runner、artifact、stdout／stderr limit、idempotency key | 恢复不会重复已完成动作；失败保留可检查状态 |
| DP-8.4 独立 Review 与 Amendment | 计划中／M | Reviewer 查看结果 diff 与声明测试，不继承 Executor 私有推理；最多一轮有限修改 | Finding 可追溯到 diff／test；未解决高风险阻止批准 |
| DP-8.5 Rollback 与最终 Human Gate | 计划中／M | 可恢复 checkpoint、rollback、精确最终 diff、test report、receipt，分开 approve／reject／publish | reject／rollback 回到声明边界；approve 不等于 publish |
| DP-8.6 Execute 评测 | 计划中／S | 固定低风险任务，测 scope、正确性、恢复、人工投入、成本、安全失败 | 一个完整任务在零越界修改下通过所有声明检查，才扩大 preview |

**阶段退出：** 有限获批任务产生可检查 Patch 和已验证结果且不越权。任何 scope 或 permission breach 都停止阶段并触发安全审查。

## 14. DP-9 - 产品化与选择性扩张

**目的：** 只扩张已经证明重复习惯或信任价值的能力。

**进入条件：** 至少一个 Habit Pack 与一个 Trust Pack 有重复使用；非执行型 v1 不强制要求 DP-8。

| 里程碑 | 状态／规模 | 交付 | 退出证据 |
| --- | --- | --- | --- |
| DP-9.0 v1 证据复盘 | 计划中／S | 留存、采用、信任、成本、安全、Pack 证据及明确 keep／remove 决定 | v1 不包含只因沉没成本而保留的功能 |
| DP-9.1 Identity 与加密同步 | 计划中／M | account ownership、deletion、encrypted secret policy、device／session、conflict、local-only option | 跨用户访问测试通过；本地 Room 不会静默上传 |
| DP-9.2 Billing 与 Limits | 计划中／M | BYOK／平台付费边界、quota、可用时权威 receipt、budget alert、abuse control | 用户知道谁付费；建议估算不冒充账单 |
| DP-9.3 Collaboration | 计划中／M | invitation、role permission、共享 Artifact 决定、审计身份、conflict handling | 一名用户不能无权限批准或暴露另一人的保护材料 |
| DP-9.4 精选 Pack 分发 | 计划中／M | 签名／版本化／审阅 Pack、声明权限、兼容性、卸载、provenance | 不运行远程任意代码、不隐藏 credential access；每个 Pack 有维护者与 rubric |
| DP-9.5 发布加固 | 计划中／M | 安全审查、accessibility、performance、backup／export／import、support runbook、data policy、release checklist | Release candidate 通过公开 support matrix 与 rollback 演练 |

**阶段退出：** 产品具备重复使用、可辩护信任证据、可持续单位经济，以及与已启用权限匹配的安全边界。

## 15. Lab 队列

Lab 永远不能抢占当前里程碑。每个 Lab 只有一个 fixture、一个用户可见输出、不抽取 Shared Core，最多一个实现切片加一个评测切片。

| Lab | 最早进入 | 问题 | 只有满足以下条件才 Promote |
| --- | --- | --- | --- |
| LAB-A 反思型占星 | DP-1.3 后 | 多个解释型声音能否产生更有吸引力、但不冒充权威的反思 Artifact？ | 用户保存／分享，理解娱乐标签，并主动要求复用 |
| LAB-B 桌游纸面协议 | DP-3.2 后 | 极小确定性游戏能否在严格私有状态下产生有趣模型互动？ | 脚本规则通过，用户要求第二次 session |
| LAB-C 编码上下文审计 | DP-2.4 后 | 在任何仓库 Connector 前，独立上下文批判能否改善保存的编码任务？ | 在多个 fixture 上发现被接受的缺失约束 |

## 16. 立即有序队列

1. **DP-0.3 首次使用信息架构：** 编写 Correction Brief 并记录当前首次使用基线，建立要求的命名备份，再实现单 Connection Solo 入口和模式正确 Objective。
2. **DP-0.4 Demo／Replay：** 复用已保存证据，零供应商调用。
3. **DP-0.5 Export** 与 **DP-0.6 API Safety：** 在邀请更广泛公开使用前完成。
4. **DP-0.7 Acceptance：** 选择 Continue 或 Repair；不能只凭文档信心进入 DP-1。

精确下一步是 DP-0.3 Correction Brief 与首次使用基线。建立命名备份并写明验收检查前，不改界面。
