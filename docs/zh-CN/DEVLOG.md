# 开发日志

## 2026-09-18 - 产品开发计划与详细里程碑已批准

- 项目所有者批准 D-064：一个由人主持的 Multi-AI 工作空间，以 **Ask the Room** 为反复出现的窄入口；Review 是第一个信任 Pack 而不是产品边界；通过一条有限队列交替验证“习惯”和“信任”；占星／游戏／编码上下文先走有时间上限的 Lab；Codex／VS Code 在 Execute 前保持只读。
- 把中英文[产品开发计划](PRODUCT_DEVELOPMENT_PLAN.md)从草案提升为已批准，并新增 canonical 中英文[详细开发里程碑](DEVELOPMENT_MILESTONES.md)。后者定义 DP-0 到 DP-9、65 个子里程碑、依赖、规模预算、用户交付、验收证据、非目标以及停止／简化决定。
- 同步更新 Product Direction、Project Charter、Roadmap、Decisions、Handoff、文档索引与中文镜像。历史 M0-M5 实现／评测记录继续有效，但前向优先级改由 DP-0 到 DP-9 决定。
- DP-0.0 方向与里程碑批准已完成。DP-0.1“产品与仓库真实性基线”为当前里程碑；精确下一步是在改代码前先写 Correction Brief 并进行只读真实性盘点。
- 本轮仅改文档：没有产品代码、依赖、供应商调用、费用、浏览器记录、部署或 Execute 动作。批准不会恢复保存 Plan 的 Reviewer 调用；Live010-014 保留给 DP-2 证据。

## 2026-08-30 - 当前供应商 API Key 前缀提示

- D-063把API key前缀推断抽到纯本地模块，新增当前Gemini授权型key的`AQ.`识别，同时保留`AIza`、Anthropic `sk-ant-`及既有受支持OpenAI `sk-`形式。由于两个家族前缀重叠，Anthropic必须先于OpenAI判断。未知或大小写不符的格式保持未决，必须由用户明确选择供应商。
- 前缀推断只是一项便利提示，绝不是凭证验证。它只读取内存中的字符串，不发送、不持久化，也绝不跨多个供应商试探。用户提交Setup后，模型发现仍只调用用户选定或高置信本地推断出的唯一供应商。
- 构建、63项离线测试和lint通过。回归覆盖两种Gemini格式、Anthropic顺序、OpenAI project/service-account/admin/legacy形式、首尾空白、未知格式及大小写。类型检查仍只有三项既有Cloudflare ambient类型错误。零供应商调用、零花费、零浏览器记录改动、零部署。
- [纠错简报](correction-briefs/2026-08-30-provider-key-prefix-detection.md)；备份`/private/tmp/meeting-room-before-provider-prefix-detection-20260830.tar.gz`。Google正在把Gemini从标准key迁移到授权key，因此规则必须保持隔离且易修改。下一项有限产品动作仍是另行确认的含Gemini三席位review smoke；模型列表质量是独立问题，本轮不夹带修复。

## 2026-08-30 - PLAN-06 阶段请求回执本地收尾

- D-062在既有Plan产物中为每个付费Builder或Reviewer阶段增加有限生命周期回执。供应商调用前，路由先发出严格`started`尝试，记录请求ID、阶段、输出上限、请求reasoning档位，并明确finish/usage未知。接受、拒绝或供应商错误的终态回执会原位替换同一请求/阶段，不会看起来像另一通调用。
- Reviewer只有Builder已接受后才会出现回执。因此保存Plan可以区分“Reviewer从未启动”和“Reviewer已启动但结果/用量未知”。客户端按顺序持久化这些检查点；原始输出、私有推理和凭证继续排除。未知用量绝不转换为零或退款。
- 构建、62项离线测试和lint通过。测试覆盖严格started解析、历史往返、终态不能倒退为started、原位替换、Builder/Reviewer事件顺序、未启动Reviewer无回执及供应商错误替换。类型检查仍只有三项既有Cloudflare ambient类型错误。零真实供应商调用、零花费。
- [纠错简报](correction-briefs/2026-08-29-plan-stage-request-receipts.md)；备份`/private/tmp/meeting-room-before-plan-stage-receipts-20260829.tar.gz`。PLAN-06对新Plan请求已验证；历史未知调用继续未知，供应商账单仍权威。本轮不增加通用计费账本或脱离页面的运行器。下一项证据仍是在连接恢复后，单独授权一次保存产物Fable Reviewer-only调用。

## 2026-08-29 - PLAN-11 停止与恢复真实性本地收尾

- D-061为 stopped 协议快照增加向后兼容的可选`stopReason`。预算Gate保存`budget`，用户明确停止保存`human`；没有来源的旧 stopped 房间显示中性停止状态，不再错误归因为Human Chair。恢复或完成协议时清除旧停止原因。
- 结构上符合资格的保存Plan恢复，现在会先用保留的输入/输出用量评估，再启用任一恢复控件。额度已耗尽时已完成工作继续保留可见，但动作会说明不可恢复原因、保持禁用且不能启动供应商调用；handler仍保留独立预算检查。
- 构建、62项离线测试和lint通过。测试覆盖预算/人工/旧停止往返、非法原因组合、恢复清理、恢复预算接线及两处预算停止调用。类型检查仍只有三项既有Cloudflare ambient类型错误。零供应商调用、零费用、零记录迁移、零界面重设计。
- [纠错简报](correction-briefs/2026-08-29-plan-stop-and-recovery-truth.md)；备份`/private/tmp/meeting-room-before-plan-stop-reason-20260829.tar.gz`。PLAN-11已本地验证并关闭；D-062随后关闭新Plan请求的PLAN-06，历史歧义与PLAN-12后台持续运行仍独立存在。下一项产品证据仍是一次单独授权的保存产物Fable Reviewer-only调用。

## 2026-08-29 - PLAN-13 Reviewer契约本地收尾

- D-060仅在调用方明确提供schema且模型家族受支持时启用Anthropic原生结构化输出。初始实际产物Plan Reviewer提供窄审阅schema，覆盖Fable 5；不受支持Anthropic ID和无关OpenAI/Gemini请求保持不变，也不猜测`thinking`参数。
- 本地`parsePlanReview`继续决定日期范围、长度和集合上限。整份响应只有一个JSON Markdown围栏时可归一化；说明文字夹带JSON仍拒绝。拒绝、不完整输出、传输失败、schema失败和语义失败都直接停止，不自动重试。
- 构建、62项离线测试和lint通过。覆盖Fable请求形状、不支持模型省略字段、OpenAI payload不变、严格围栏处理、语义拒收，以及完整保存Plan只调用一次Reviewer。类型检查仍仅三项既有Cloudflare ambient type错误。零供应商调用、API花费、Plan重生成或浏览器记录改动。
- 见[纠错简报](correction-briefs/2026-08-29-plan-reviewer-structured-output.md)；备份`/private/tmp/meeting-room-before-plan-reviewer-structured-20260829.tar.gz`。PLAN-13变为本地修复（真实未验证）；PLAN-10继续待处理，因为还没有真实意见、修改、复核或人工采用通过。下一项证据是另行授权的一次Fable Reviewer-only调用，读取保留的Live014产物，绝不重跑Sol。

## 2026-08-29 - 产物优先Plan真实实验014，草稿完整/审阅失败

- 在刷新授权的额外两调用/1美元/不重试边界下，固定Sol Builder -> Fable Reviewer房间恰好调用两次。Sol在78秒完成全部12天：1,111输入、7,766输出、3,057 reasoning、14,655可见字符、零拒收。这真实验证D-059两调用产物优先机械链路及PLAN-17/18。
- Fable读取完整产物并在86秒结束：9,388输入、5,191输出、2,720可见字符。审阅JSON非法，因而整份拒绝；没有意见、修改、批准或多模型改进被采纳。12天Builder产物全部保留，没有重试。
- 已归档[真实实验014评估](evaluations/2026-08-29-plan-artifact-first-live-014.md)、[完整可读Plan](../evaluations/artifacts/plan-artifact-first-014/01-plan-readable.md)和[诊断](../evaluations/artifacts/plan-artifact-first-014/02-attempt-diagnostics.txt)。按报告token估算清单价约0.51美元，不是账单；历史13不确定中止请求不在其中。
- 产物审计：具体进阶、间隔重做和Day12闭卷有用；每天恰好占满360分钟、补课日未排程、疲劳阈值及元数据未验证仍是重要问题。完整草稿未被独立审阅或人工批准。下一步只处理Reviewer契约可靠性，先离线；不重生成Plan、不加席、不再花费。

## 2026-08-29 - 产物优先Plan入口与负面真实实验012

- D-059让Detailed Plan从用户要的产物开始：一个Builder，随后一个独立实际产物Reviewer。新Plan预检和协议预算严格为两次调用/22K输出，不含通用提案、交叉审阅、Observer或自动重试；普通Decide/Review不变。
- 真实实验012使用固定12天/10MEU/360分钟案例、Sol Builder和Fable Reviewer，用户批准1美元/两次调用。历史12暴露旧通用synthesis历史Gate，供应商调用为零；历史13暴露客户端拒绝合法version-zero Plan checkpoint，取消前Sol可能已启动，因此用量未知。Fable和产物质量未运行。
- 已修复两项契约：Plan synthesis不再需要通用context turns，Plan产物允许Canonical State version0且仍拒绝负数。空历史路由测试恰好两次mock调用完成受审阅12天产物。构建、61项测试和lint通过；类型检查仍只有三项既有Cloudflare声明错误。备份：`/private/tmp/meeting-room-before-artifact-first-plan-20260829.tar.gz`。
- 已归档双语[纠错简报](correction-briefs/2026-08-29-plan-artifact-first-live-012.md)、[评估](evaluations/2026-08-29-plan-artifact-first-live-012.md)及PLAN-17/18。这是负面机械证据，不是Sol/Fable质量或PLAN-03因果证据。停止且不使用恢复；由于一次Sol调用不确定，新的两调用真实运行需要刷新费用授权。

## 2026-08-29 - PLAN-03分阶段推理，仅本地

- D-058只改失败Plan案例的一个变量：已识别原始GPT-5 Builder由`medium`改为`low`；实际Plan Reviewer/Editor/Recheck继续`medium`，普通讨论仍`minimal`。Anthropic、Gemini及未识别模型保持供应商默认。不改输出上限、模型、prompt、校验、调用预算或重试。
- 初始Plan尝试诊断把请求档位和实际报告reasoning token分开保存；严格解析兼容无档位旧记录、拒绝未知值。Plan视图显示两者，不保存私有推理，也不送入模型上下文。
- 实际mock payload测试覆盖OpenAI Builder/Reviewer、Anthropic/Gemini不发送不兼容控制、仅推理耗尽、部分天数、历史兼容及界面披露。构建、59项测试和lint通过；`tsc --noEmit --incremental false`仍只有三项既有Cloudflare worker声明错误。本地3001返回200。备份：`/private/tmp/meeting-room-before-plan-reasoning-20260829.tar.gz`。
- 零真实API调用/费用、浏览器交互、部署或归档迁移。纠错简报参考当前官方供应商文档，但不扩大模型兼容性推断。
- 产品Gate：PLAN-03仍处理中。本地payload正确不证明完整输出、教学质量或成本价值。下一步需要新的明确授权，以相同模型/契约/上限进行一次Builder阶段验证并明确清洁上下文，检查结束、请求档位、报告reasoning/output及有效天数后停止；不沿用010授权、不自动重试。

## 2026-08-27 - Plan问题清单与前两项本地修复

- 新增中英文[16项问题清单](PLAN_ISSUE_REGISTER.md)及[纠错简报](correction-briefs/2026-08-27-plan-diagnostics-scope.md)。PLAN-01/02标本地修复，完整Plan质量仍未验证；D-057记录有界范围，不开平台新里程碑。
- 初始Builder/Reviewer在既有产物检查点/历史保存已报告结束状态、可为空的用量、有效部分天数和具体拒收分类。最近四次尝试，每次前十二条拒收明细；不存原始响应、私有推理或秘密。缺结束事件或传输失败不能被当成功审阅，不自动重试。Plan折叠诊断不进入模型上下文。
- 新增显式格式专用Chair指令，限定阶段/轮次，覆盖实际供应商prompt构建。普通及旧需求保留，保存成功后重置一次性格式选项；不迁移归档010/011旧correction及冻结Plan上下文。
- 最终构建、59项离线测试、lint通过，保留三项既有Cloudflare声明错误；本地HTTP200。本轮无浏览器交互/IndexedDB故障测试。零真实API调用，不换模型、不改输出额度、不部署、不改归档。备份：`/private/tmp/meeting-room-before-plan-diagnostics-20260827.tar.gz`。
- 纠错Gate：本地机械/历史及prompt作用域通过，新诊断界面只有渲染测试。语义/产物质量、实际计划审阅、人工采用及比较价值没有新增证据，不声称付费经济性改善。下一项PLAN-03有据处理推理/输出，不在上下文和预算授权未明确时又跑011。修改/复核诊断、真实调用记账仍待处理。

## 2026-08-27 - Plan等待恢复与负面续接011

- D-056取消Plan生成/审阅/修改/复核的应用硬时间截止及累计Plan时间停止；普通讨论仍90秒。保留输入/输出额度、人工取消、来源/席位校验、不自动重试。界面显示当前视图等待时间，不假装展示思考进度；供应商/宿主/网络限制不在此政策内。
- 显式保存计划恢复先存额度再调用，只补缺失天及审阅，最多两次。保留旧预留及token用量，不退款、不在第二次产物尝试后再次续额。浏览器发现fixture缺口后修正：生产stopProtocol是stopped/complete，不是stopped/paused；已完成产物仍不可恢复。
- 用户重绑会话key，匹配原GPT-5/Opus4.7席位后重开010记录，没新建会议。仅一次Builder请求返回，无新接受天数，实际计划审阅未调用。116秒内观察到失败，不是实际超过180秒完成。未继续付费重试或修改；010/011累计已知七次请求，仍原累计$5授权，精确账单及本次失败细节不可得。
- 六天/77条任务、标题、复盘/完成说明及调整文本均与010留档匹配。历史11，无删除或批准。[011报告、界面证据及有序待办](evaluations/2026-08-27-plan-wait-continuation-011.md)已归档，010负面原记录不改。剩余输出46K->37K是取整显示，不是准确回执。当前错误仍混合不完整输出、格式、校验失败，不宣称已证实推理token耗尽。
- 最终构建、54项离线测试、lint通过；长等待fixture推进真实适配器包装600秒，验证取消及普通90秒策略；恢复用生产stopProtocol并保留额度/历史。保留三项已知Cloudflare类型声明错误，无部署。备份：`/private/tmp/meeting-room-before-plan-wait-20260827.tar.gz`。
- 纠错Gate：时间/恢复本地机械通过；完整产物、语义质量、人工采用、差异化价值未通过。新增一次付费却无新增有效内容，是经济性负面结果。此切片停止，下一步只做有限结束/拒收诊断及Chair指令阶段作用域，再有据调整推理/输出空间。不加席、不扩建UX或账本平台。

## 2026-08-27 - Plan质量实测010，部分交付已留档

- 新授权$5，允许推理模型并要求成果留档；启动后允许加席，但没有为此重开。GPT-5快照+Opus4.7，两席单轮检查点，12天/10MEU/360分钟。GPT讨论minimal、Plan medium，Claude默认，不宣称所有模型都深度思考。
- 实际6次请求：Claude交叉审阅JSON失败，缩短并改变输入后恢复一次；GPT Builder随后180秒超时，保住六个完整日记录。补缺失天数被拦截，零新增调用：初始8次额度只剩1个名额，组合恢复需要2个。实际计划审阅、修改、复核及人工批准均未运行。
- [报告和原稿](evaluations/2026-08-27-plan-quality-live-010.md)、中英文总结、原始界面文本及可读六天草稿已归档。历史10->11，无刷新、删除、密钥读取、运行代码修改或部署。失败用量/实际扣费未知，不编造账单。
- 产品Gate失败：只交付6/12天；Day1替换规则违反3Easy=1Medium，#53难度标错。这是尚未复审的草稿审计，不是未运行Reviewer的漏检。长时间0/12、Overview不显示计划进度、恢复不可用仍存在。加席不能解决这些阻塞；M2.13仍当前，M2.12暂缓。
- 下一步离线复现部分计划边界，避免前置重试挤占产物恢复额度，区分预留/实际调用并保存中断回执，让生成单元适配超时。保留已完成天数，剩余额度明确后只补缺失内容及实际计划审阅。本轮只改留档文档，不重复跑测试套件；已有52项离线测试不是新增真实质量证据。

## 2026-08-27 - Plan 质量闭环，本地实现

- 实现 D-055：Chair 最多选三条意见，授权一次修改和一次不同席位复核。Editor 逐条明确修改或拒绝；只能改受影响天，整份派生 Plan 仍需通过题量/时间/跨日检查。复核可否定原批评，也可保留争议，不强制修改或共识。
- 原始每日内容/审阅不变。后续调用前先持久化草稿、意图和阶段；保存后才发布。失败即停止；已保存且未调用的复核可以显式继续，其他失败/中断可放弃修改、保留原版。每份 Plan 不重复循环。这是本地客户端边界，不是服务端账单/幂等保证。
- 经复核改动进入详细交付，不挤入短 canonical context；保留未选/未解决意见。原版对照、修改依据、复核、完整复制和来源绑定批准都可检查；后续人工改动不冒充模型复审。
- Plan prompt 分配课程安排、可行性、批判审阅、编辑和改动复核职责。保留用户模型，已识别 GPT-5/mini/nano 的质量调用用 medium，其余默认。Builder <=16K、审阅6K、修改12K、复核6K，超时180秒；不声称所有模型都已深度思考。Gemini 思考 token 纳入输出用量，OpenAI Plan 不完整响应保留已报告用量。
- 验证：构建、52 项离线测试和 lint 通过。包含实际 mock API 路由、第 2 天实质改动且其他天不动、拒绝错误批评、未解决意见、来源/批准/历史往返、客户端保存/调用失败、有界调用及静态控件渲染。类型检查只剩三处既有 Cloudflare 声明错误；localhost:3001 返回200。未做真实浏览器/IndexedDB 故障、供应商质量、账单验证或部署。
- 产品 Gate：本地机械闭环成立；教学质量、真实采用、延迟、成本价值和多模型优势仍未证明。开发零真实调用。到此停止扩展，下一步是新预算授权的一次真实质量案例，不是更多 UI 或评测基础设施。见[纠错简报](correction-briefs/2026-08-27-plan-quality-closure.md)。

## 2026-08-27 - 核心闭环检查，Gate 未通过

- 按用户要求停止扩建功能，只运行一项已有定向离线测试。脚本 Reviewer 明确要求修改 Day 2，但所有 Builder 日期保持原样；Plan 路径只附加评论。测试通过代表复现成功，“批评促成修订”产品 Gate 未通过。
- 历史 Review 005 有真实修改但存在语义失败，Plan 007 交付失败，S1 009 不是配对比较。没有新增质量/优势结论，见[核心闭环检查](evaluations/2026-08-27-core-closure-check.md)。
- 零付费调用、不改运行时/界面。本次审计收尾，不是产品完成。下一项只补有界 Plan 意见 -> 受影响天修订 -> 复核 -> 人工决定，冻结体验/配置/评测工具扩建，不重跑会议证明已知缺口。真实验证仍需新授权。

## 2026-08-27 - 逐天人工修订计划

- 补齐采用缺口：Plan 等待 Human Gate 决定时，Chair 可以修改某一天的题目、模型给定难度/新题重做标签、时间分配、完成标准和调整规则。实时小计与现有整份计划校验遵守不变的天数/MEU/时间契约，检查同日唯一和跨日一致性。其他天不变；保存恢复原始一天后，移除该天人工修改。
- 原始 AI Plan 和原审阅保持不变。带来源的 `PlanHumanRevision` 保存修改过的天及原产物身份；按天视图可对照原版、显示修改天数和准确审阅范围，完整复制也附带范围说明。这是零调用人工编辑，不是 AI 修订循环或经过独立验证的改进。
- 保存成功后才发布修订。写入失败保留草稿和旧版；保存中阻止旧自动保存覆盖，未保存编辑阻止批准和替换房间。批准准确冻结修订内容与修订身份，已批准/拒绝计划只读。不含凭证的本地快照/产物可恢复修订，不新增数据库 store。未保存草稿只在当前页面中，刷新不能恢复。
- 构建和 48 项离线测试通过：整份计划约束、多天修改/恢复、过期/伪造来源、原版不可变、准确批准、历史往返、视图/编辑器渲染，以及对真实保存处理函数注入存储失败。localhost:3001 返回 200。这不是真实浏览器/IndexedDB 故障或可用性测量；全量类型检查仍有三处既有 Cloudflare 声明错误，本切片无新增错误。
- 产品结果：机械上的产物采用路径改善；语义/教学正确性、实际采用、阅读负担与模型比较优势未验证。零真实 API 调用，不改供应商 prompt、模型预算、轮数、依赖或部署。记录 D-054 和中英文[校正简报](correction-briefs/2026-08-27-plan-human-revision.md)。
- 备份：`/private/tmp/meeting-room-before-plan-human-edit-20260827.tar.gz`。到此停止，M2.13 仍为当前。下一步验证真实浏览器逐天编辑/历史，再做明确新授权且有信息增益的供应商质量检查；证据到来前不增加自治修订、通用编辑框架或评测工具。

## 2026-08-27 - 详细 LeetCode 计划本地纵向切片

- Decide / Plan 新增主动选择的 **Detailed LeetCode plan**：10-15 天，明确每日最低 MEU 与时间上限，默认 12 天 / 10 MEU / 360 分钟。讨论限一轮，复用现有席位；最终产物由 Builder 生成、另一席位审阅，不一定是不同模型家族。
- 每天保存具体题号/题名、模型给定难度、新题/重做、时间块、复习时间、完成检查和调整规则。JSONL 传输让前面完整有效的天不因后面缺失、格式错误或截断而丢失。界面显示按天记录而非原始 JSON，不随新输出自动切换所选日期。
- 程序用整数三分单位计算 MEU，拒绝同日重复题号、重复标成新题及同题难度前后不一致，检查日期覆盖、每日时间与工作量。但不核实题目身份、真实难度、教学质量或完成时间是否现实。
- 另一席位审阅实际完整计划，返回关联具体天的关注点与假设。显式恢复只补缺失/无效天；天数已完整则只恢复审阅。审阅结果已保存但结束边界丢失时可本地收尾。有效天不被隐式改写。语义意见的逐项处理/编辑尚未实现，风险保持可见供用户决定。
- 部分/完整计划与准确的批准快照独立于短摘要保存到不含凭证的房间存储。未完成或未审阅计划不能批准；契约、工作状态、模型不一致时恢复在供应商调用前被拒绝。生成后冻结契约，改变需求当前需新建房间。
- 预算：产物正常两次调用，加一次显式恢复额度（最多再两次），配置页展示；Builder 输出最多 16,000 tokens，审阅最多 1,800。不自动重试或花旧预算；中断调用用量可能不完整，估价不等于账单上限。本轮开发零真实供应商调用。
- 验证：构建及 45 项离线测试通过，覆盖模拟供应商完成、缺 Day 2 恢复、仅审阅恢复、伪造/过期快照、记录/批准解析、按天渲染。样例使用合成题目数据验证机械行为，不是教学质量参考答案。未做真实浏览器 IndexedDB 故障注入、滚动/剪贴板验收、真实供应商 JSONL 或语义质量验证。localhost:3001 返回 HTTP 200。
- 修复四处已有代码类型错误：只读回放 Finding ID、可空 Editor checkpoint、Observer transition 类型扩大、上下文上限字面量。全量类型检查仍有三处 Cloudflare 声明错误，位于 `db/index.ts` 和 `worker/index.ts`。不改依赖、不部署、不扩账号或共享数据库。
- 前端备份：`/private/tmp/meeting-room-before-plan-20260827.tar.gz`。记录 D-053；M2.13 进入当前阶段而非完成。下一步先验收浏览器中的主动选择流程，再按需要新授权运行一次真实计划。先判断实际交付质量，不扩编排或 Task Pack；M2.12 对照继续暂缓。

## 2026-08-27 - Review 不再强迫用户接受修改才能结束

- 按用户要求收尾评测工具扩建，修复主流程卡点：拒绝所有 Finding 后，不再必须接受无用修改才能继续。完成审阅并明确处置全部 Finding 后，**Keep original** 逐字保留 Artifact v1，直接进入现有 Human Gate，不调用 Editor/Verifier。
- 结果记录空 Change Set、无模型署名及 `not_run`，不冒充 `pass`。输入解析和历史保留原文格式；批准冻结准确 v1 快照，被拒绝 Finding 仍可追溯。先保存再展示结果；请求下一轮时，先保存续接状态再清除当前待批准原文结果，历史产物记录保留。
- 构建、42 项测试和 lint 通过。本地覆盖资格、待决定/已接受 Finding、原文一致性、伪造来源、批准、历史解析及下一轮。先保存后显示、零调用处理器经过源码检查，未进行浏览器存储故障注入。localhost:3001 返回 HTTP 200；没有真实供应商调用、主动刷新或部署。
- 全量 `tsc --noEmit --incremental false` 仍未通过，剩余问题不在本切片：API route 三项类型错误（只读 Finding ID、可空 Editor checkpoint、字面量上下文预算参数），编排 transition 一项，以及缺失 Cloudflare worker 类型三项。本轮顺手修复了所改 Artifact parser 中两处类型收窄错误。构建通过不等于类型检查全通过。
- 产品纠偏：改善机械、本地产物和 Human Gate 路径；未新增语义正确性、真实用户采用、阅读负担或多模型比较优势证据。本操作新增 API 费用为零，M3/R6 仍未运行。记录 D-052 及[校正简报](correction-briefs/2026-08-27-review-keep-original.md)。
- 下一步转详细 Plan 主流程：针对用户 LeetCode 案例，先实现按天寻址的产物及完整性/工作量检查。不再为清空清单而扩建评测工具或调用模型。M2.12 是暂缓而非完成；更广的 Task Pack 扩展仍需证据。

## 2026-08-27 - M2.12 回执访问与估价来源

- 新增默认折叠的 Evidence receipt：完整可选中 JSON、复制按钮及剪贴板失败后的手动选中回退。下载保留，回执仍只在页面内存，不增加存储或接口。
- 新 S1 回执（含部分失败）和已返回的 Verifier probe 记录实际输入/输出费率及各自默认/运行时覆盖来源，明确仍是供应商通用估价，不是已验证模型价或账单。旧回执来源未知，不改写历史值或估价算术。
- 构建、40 项测试及 ESLint 通过。新增测试覆盖完整回执与转义、额外字段、复制成功/失败/不可用，以及默认、混合、非法、零费率覆盖和模拟估价算术。focus/select 为源码检查，非真实浏览器验证。既有 localhost:3001 返回 HTTP 200；未主动刷新浏览器或调用付费模型。额外开发服务已停止，保留原服务。
- 产品纠偏：本轮只收尾 009 暴露的两项证据访问问题，不证明语义质量或比较优势。009 证据及缺失服务器元数据的限制不变。零 API 花费，不加 agent、价格目录、部署或完整房间，记录 D-051。
- 下一步回到产品问题：第二个独立审阅是否能对已保存 S1 增加有依据的修正或更具体的人工核实项。M3/R6 仍未运行；新调用前明确增益并获得新预算，低价值比较可跳过，不继续加基础设施。

## 2026-08-27 - M2.12 S1 简历基线 009

### 已完成

- 先写中英文付费运行纠错简报，再使用用户本轮 $0.10 授权，只调用一次 OpenAI `gpt-4.1-2025-04-14` S1。公开输入/提示不变，2,400 输出上限，不含 oracle，不重试，不写 Meeting。
- 保存完整可见候选、结果面板、重建的预期输入/提示和来源清单。[基线 009](evaluations/2026-08-27-m2.12-s1-resume-baseline-009.md) 中英双语记录逐问题评分与回执限制。
- 更新对照结果表、路线图及交接。不改运行时，不跑完整房间，不部署，不自动消费剩余预算。

### 分开判定结果

- 机械：一次成功响应，543 输入 / 548 输出 token，显示 6.0 秒。Meetings 保持 10，未观察到截断；供应商结束状态仍未记录。
- 语义/产物：3 个预设问题全发现并修复（权重 8/8），4/4 项受保护含义保留，没有无依据实质 Finding 或有害修改。简历按既定规则为 2/2；评分非盲评、评分者与出题者不独立，小型已知案例不能推广为一般证明。
- Human Gate/体验：没有真实用户采纳、修改或阅读时间测量。模型重复解释占位符删除，待人工核实项偏泛，未明确给出恢复相关声明前所需证据。
- 费用：页面估算 $0.0038，按 GPT-4.1 官方标准价重算 $0.00547，账单未知。源码使用供应商通用默认估价，可解释页面差异，但未验证环境覆盖。
- 证据限制：内置浏览器取回下载超时，content export 不支持。完整可见输出已保留；服务器回执、请求 ID、准确时间、服务器哈希比对不可用。重建哈希不冒充已核验的传输回执，未读取隐藏状态或 key。
- 差异化：未知。M3/R6 和其他案例未运行；S1 已修好的事实问题，后续重复不能计为交叉审阅独有收益。

### 下一动作

停止付费测试，不为补元数据重跑 009。下一小步零调用处理不依赖下载的回执访问和明确估价来源。未来对照需明确未解问题及新批准；M2.11 扩建继续冻结，M2.12 仍为当前阶段。本次仅文档/证据变更，不重跑全量构建测试；此前实现的 38 项通过结果不变。

## 2026-08-27 - M2.12 固定 S1 Replay 入口

### 已完成

- 编辑前在中英文校正简报记录单模型执行入口缺失：普通 Review 会花多次调用，既有 Verifier probe 则执行不同任务。
- 只在现有开发 Replay 选择器增加 S1 `resume-truth-v1`。服务端持有公开 fixture 和 2,400 输出 token 上限；任意 probe 字段在供应商调用前拒绝。不涉及 oracle、通用提示编辑器、新依赖或 Meeting 写入。
- 把不变的离线提示构造器移至纯共享模块，保证 CLI 和应用一致。既有 Verifier 行为仍由原测试覆盖。
- 可下载的不含凭证回执记录准确公开输入和 system/user 提示、SHA-256 哈希、所选模型及实际请求设置、原始输出和已知用量。回复未评分；部分失败保留脱敏文本、用量标未知，不重试。当前适配器不记录供应商结束状态，回执明确保留这个限制。
- 配置继续留在会议主视图之外，只给开发面板增加选择器和证据下载动作，不属于大型前端改版。

### 验证与限制

- Build、38 项测试和 ESLint 通过。新增模拟案例覆盖恰好一次调用、提示一致、回执哈希、字段注入拒绝、部分失败和凭证脱敏。零真实 API 调用、零 API 支出。
- 本地浏览器检查发现零 Connection，已显示 S1 选择器，并确认无连接时运行按钮禁用。未读取 key、未提交验证请求、未运行 Meeting。
- 语义质量、真实供应商 S1 兼容性、人工阅读负担和比较优势仍未知。收到文本不代表产物验收；token 上限不是权威美元上限，切换 probe 或刷新前需保存页面内存中的回执。

### 下一动作

请用户重新连接并提供新的单调用预算。选定并记录准确强模型和生成配置，随后只运行一次 S1，先保存回执再评分。不自动跑 M3/R6/Plan，也不再跑 Verifier probe。

## 2026-08-27 - M2.12 离线 Review 对照包

### 已完成

- 先写中英文校正简报，再固定三个合成案例：简历真实性、产品需求、技术恢复。公开输入与评测专用问题锚点、误报陷阱、应保留含义和完整参考产物分开存放。
- 新增仅本地的 `review:case` 命令，打印任务或基线提示，不读取 oracle、不使用凭证、不调用供应商、不写 Meeting。
- 新增七项离线测试，覆盖 fixture/来源完整性、通过生产解析器准确应用参考修改、缺失/过期/未授权修改，以及公开输入导出；纳入正常测试命令。
- 新增中英文 [M2.12 Review 对照包](evaluations/M2.12_REVIEW_COMPARISON.md)：S1 强单模型、M3 人工转贴、R6 现有应用流程，分开的发现/修复/误报评分、人工干预计量和因果归功规则。所有真实结果仍标未运行。
- 记录 D-050，M2.12 进入当前阶段。M2.11 运行时扩建继续冻结；没有修改产品运行时、UI、依赖、凭证或部署。

### 验证与产品结果

- 机械：production build、全部三十六项测试和 ESLint 通过。七项新测试也可以独立运行，无需构建或服务器。
- 语义/产物：本包提供人工参考示例和基于证据的验收规则；本地解析通过不等于模型质量得分。同样合理的修改也可以接受。
- Human Gate/体验：运行行为不变；尚未在这些案例上测量采用、阅读时间和人工修改负担。
- 经济性：零供应商调用、零 API 支出；既有测试使用模拟供应商。没有操作浏览器/API 会话。
- 差异化：未知。尚未生成单模型、人工转贴或配对多模型输出；参考答案和历史诊断报告不能填入基线结果格。

### 方向决定与下一动作

继续取得证据，不扩建会议基础设施。用固定公开提示准备一次 S1 `resume-truth-v1` 基线，明确准确模型/reasoning/输出配置和预算，调用前取得新授权。先保存结果，再判断 M3 是否增加信息。不自动运行 R6、另一轮 Verifier replay 或 Plan 房间。

## 2026-08-27 - Verifier v2 Stage Replay 008

### 已完成

- 在调用前写好中英文付费评测 Correction Brief，并保持一次调用、600 输出 token、无重试、不写 Meeting 的边界。
- 沿用既有 Anthropic Haiku 证据路径，使用 `claude-haiku-4-5-20251001` 与固定匿名 Review Verifier fixture v2。
- 供应商为 `change-replay-1` 返回一项有效 check；独立的 `lineage` 与 `semantics` verdict 均为 `supported`，`unresolved` 为空。
- 把中英文结果保存为 [Verifier v2 Stage Replay 008](evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md)。

### 验证

- 恰好一次供应商调用使用 597 input tokens 与 224 output tokens，耗时 3.1 秒，应用估算 `$0.0034`，低于用户授权的 `$0.01` 上限。供应商账单仍是权威依据。
- Replay 前后 Meeting History 都显示 10 条。没有修改 Meeting、API Key、部署、仓库或外部 workspace。
- 达到成功条件后付费运行立即结束；没有重试、切换模型，也没有运行完整 Review 或 Plan 房间。

### Gate 结果

Verifier v2 真实供应商 Gate 通过。M2.11 的供应商格式不确定性已经关闭；本结果不能证明 Review 的产品优势、Finding recall 或 cross-review 价值。

### 下一动作

冻结新增 Review 机器并进入 M2.12 证据路径。先定义一套共享 Review rubric，并保存强单模型/人工 copy-review baseline，再授权下一次付费多模型对照。

## 2026-08-27 - v0.11j 不可变 Review 批准 Snapshot

### 已完成

- 新增中英文不可变批准 Correction Brief，并把实现限制在现有 Review Human Gate，零供应商工作。
- 新增严格 `ReviewApprovedArtifact`，冻结当前可见 Artifact v2 或 Human Revision v3、准确 Change Set、来源 State 与 Review-result 身份、原模型 verification、人工编辑 Change ID 和批准时间。
- 批准现在会先创建 snapshot，再完成房间，并通过同一个 durable save 边界持久化。存储失败时 snapshot、决定和协议状态一起回滚；拒绝不会创建 snapshot。
- 把批准结果作为独立、不含凭证的 `review.approved_artifact` 持久化，并从 Meeting History 恢复。没有 snapshot 的旧 approved 房间继续可读。
- Decision 视图显示冻结版本和批准时间，同时继续把模型 Verification 限定在 Artifact v2。
- 记录 D-049。

### 验证

- Production build、ESLint、`git diff --check` 和全部二十九项自动测试通过。
- 测试覆盖 v2/v3 批准、准确 Human Revision 绑定、当前可见 v3 时拒绝过期 v2 snapshot，以及拒绝被修改的模型 verification。
- 1280x800 与 390x844 浏览器检查没有 viewport 溢出或控制台警告。没有供应商请求、凭证、付费 token、部署或外部服务变化。
- 刷新后的浏览器没有已保存 Review result，因此交互式 approved-result 恢复留给下一次自然本地 fixture，不作为付费重跑理由。

### Gate 结果

不可变本地采用边界通过。M2.11 在证据前不再需要更多批准 UI 或通用 Artifact 基础设施；下一 Gate 是已规划的有限 Verifier v2 供应商检查，随后进入 Review 对照，而不是继续扩功能。

### 下一动作

准备现有 Verifier v2 Stage Replay Gate，只在单次供应商调用前即时请求用户明确预算。不要为这个隔离契约运行完整 Review 或 Plan 房间。

## 2026-08-27 - v0.11i 人工编辑 Review Artifact v3

### 已完成

- 实现前新增中英文 M2.11 Correction Brief，并把范围限制在现有 Human Gate，零供应商调用。
- 新增 Review Change replacement 文本的逐项编辑。Change 身份、Finding ID、位置、来源原文、理由和 basis 保持不可变。
- 应用代码针对 Artifact v1 重新校验完整有限 Change Set 并派生 Artifact v3；未知 ID、未改变编辑、超长 replacement、来源不匹配、歧义和重叠均在本地失败。
- 新增带来源的 `ReviewHumanRevision`、不含凭证的 Meeting History 持久化与恢复、独立 `review.human_revision` 和 `review.artifact.v3` Artifact，以及恢复模型原文操作。
- Decision UI 标记 Chair 编辑过的 Change，区分 Artifact v3，并明确现有模型 verification 只覆盖 v2，不覆盖人工 revision。
- 记录 D-048。

### 验证

- Production build、ESLint、`git diff --check` 和全部二十九项自动测试通过。
- 新 regression 覆盖确定性 v3 派生、不可变 lineage、未知 Change 拒绝、未改变编辑拒绝与已保存 revision 解析。
- 1280x800 与 390x844 浏览器检查没有 viewport 溢出或控制台警告。没有供应商请求、API 凭证、付费 token、部署或外部服务变化。
- 刷新后的本地浏览器没有保存的 Review result，因此没有为了布置 v3 截图而创建付费房间；下一次自然存在合适本地 fixture 时再进行有限 Decision 页面恢复检查。

### Gate 结果

逐项编辑假设在本地通过。M2.11 采用控制得到改善，没有增加编排或模型成本。不可变最终批准仍是独立边界：当前批准会记录房间决定，但尚未发布一份独立不可变的已批准 Artifact snapshot。

### 下一动作

为当前可见 v2 或 v3 Artifact 的不可变批准编写下一份 M2.11 Correction Brief，复用 revision record 且不调用供应商。不要启动新的付费 Plan 房间，也不要扩大 Review UI。

## 2026-08-27 - 强制开发校正循环

### 已完成

- 将 Live Baseline 001、Review Benchmark 001、Artifact v2 Benchmarks 002/005、Stage Replay 003、Mechanical Smoke 004 和 Plan Smokes 006/007 的失败合并为一条因果诊断。
- 新增中英文[开发校正循环](DEVELOPMENT_CORRECTION_LOOP.md)，包含实现前强制 Correction Brief、六个开发 Gate、分开的产品结果维度、不能重复的评测错误，以及停止/简化/删除/暂缓结果。
- 在 `AGENTS.md`、文档阅读顺序、产品方向、AI 交接、路线图和 D-047 中把该流程设为强制规则。
- 将模糊下一步改为 Artifact-first 校正路径：有限完成 M2.11、进行 M2.12 对照与简化，再为 M2.13 先建立 golden fixture 与结构化、可按日期寻址的 `PlanArtifact`，完成前不再运行完整付费 Plan。

### 方向结果

项目不需要推倒重来，也不会同时修复所有 concern。继续冻结通用编排扩建和完整付费 Plan 重跑。下一次实现必须对应一个已观察失败并推进一个验收边界；模型强度、reasoning 设置与界面进度只在其服务的 Artifact 契约存在后测试。

### 验证

- 英文 canonical 文档和中文快速阅读镜像同步更新。
- 本轮校正不修改运行代码，不进行供应商请求，不传输 API 凭证，不改变 Meeting 记录、部署或外部服务。

### 下一动作

先写 M2.11 收尾 Correction Brief，只覆盖最小剩余采用/评测边界。不要从下一次完整 Plan 房间或通用协议/UI 修改开始。

## 2026-08-27 - v0.11h 详细 Plan 工作量契约

### 已完成

- 新增 MEU 感知的 Plan 验收：每个请求日期必须包含至少四个具体 LeetCode 题号、MEU 小计、分离的新题与重做/复习任务，以及分钟级时间分配。
- 把有限 Decide synthesis transport 提高到 4,800 output tokens，并把 synthesis statement 上限提高到 24,000 字符；预检仍只保留一次显式恢复。
- 运行一场已授权的混合供应商详细计划案例。Anthropic review 首次格式失败后，通过一次输入已改变的 Human Chair 纠正成功；没有原样重试。
- 最终 synthesis 使用 2,092 output tokens、26 秒和 `$0.017` 估算，却遗漏 Day 2；应用在 Human Gate 前正确拒绝。
- 证据保存为 [Detailed Plan Smoke 007](evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md)。

### Gate 结果

更严格契约作为安全边界通过，自由文本详细 Plan 产物失败。模型远未达到 transport cap 就停止，因此继续提高上限不是下一修复。M2.13 需要结构化 `PlanArtifact`、独立校验 day record，以及只恢复缺失日期的机制。

### 验证

- 真实运行前，Production build、ESLint、`git diff --check` 与全部二十八项自动测试通过。
- synthesis 失败后没有新增调用；房间保持 interrupted，可供审计。

### 下一步

不要重复同一 synthesis。M2.11 继续保持当前；把 Smoke 007 作为未来结构化 M2.13 Plan Task Pack 的已批准设计输入。

## 2026-08-27 - v0.11g Decide / Plan 交付边界

### 已完成

- 在用户批准的 `$0.10` 上限内运行一次真实混合供应商 12 天 LeetCode 规划房间。Proposal、cross-review、显式恢复、synthesis、持久化、用量报告和 Human Gate 均完成。
- 分离简短工作 turn 与用户产物：Decide synthesis 现在拥有 2,400 output-token 上限、自包含 `# Deliverable`，以及一次界面可见的有限恢复额度。
- Synthesis 会忽略管理性质的 Claim delta；这些 delta 不能修改 Canonical State，也不能让原本可用的 memo 失效。
- 恢复 phase context 时，现在只选择同时存在于 Canonical State 的 transcript turn，并去重 ID；废弃 transcript 分支不能再污染恢复 prompt。
- 在 provider 启动前发生的本地请求拒绝，不再消耗最后一次 provider 调用额度。
- 新增由代码执行的 Decide memo 契约。日程计划必须覆盖每个请求日期；明确要求题目的 LeetCode 计划必须给出具体题号，不能用类别标签代替。
- 记录 D-045；完整证据见 [Decide / Plan Smoke 006](evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md)。

### 验证

- Production build、ESLint、`git diff --check` 和全部二十八项自动测试通过。
- 最终成功 synthesis 使用 1,585 output tokens、22 秒和 `$0.013` 应用估算。房间显示总计 11K input tokens、3,974 output tokens、71 秒和 `$0.044` 估算；供应商账单仍是权威依据。
- 浏览器 QA 打开恢复后的 Decision artifact；当前视口下 memo 与 Human Gate 正常渲染，无横向溢出。

### Gate 结果

协议与恢复 Gate 通过。产物质量 Gate 失败：真实 memo 覆盖 12 天安排、时间、checkpoint、调整、休息和假设，却遗漏明确要求的具体 LeetCode 题单。新的本地契约可以抓住该遗漏；没有运行第二次付费 benchmark。

### 当前限制

- 更严格的 Plan 契约目前只有 mock 证据，不能据此声称 M2.13 完成。
- 旧房间仍显示废弃 transcript 卡片，虽然它们已不会进入模型上下文。
- 语言一致性仍只靠 prompt；一条 Anthropic review 使用了英文。

### 下一步

回到 M2.11 证据路径。把本次 Plan 失败保留为 M2.13 的进入证据；该里程碑开始时，先建立明确 Plan Task Pack 和单阶段 artifact probe，再运行另一场完整付费房间。

## 2026-08-26 - v0.11f Chair Finding 补充与语义验证

### 已完成

- 在 Review checkpoint 新增 Chair composer：可以补充模型漏掉的 Finding，也可以为已有 Finding 创建可追溯替代项。修订会追加一个新的已接受 Claim，并把旧 Claim 标记为 superseded，不会重写审计历史。
- 每条 Chair Finding 都保存来自 Artifact v1、参考资料或真实性约束的精确摘录。客户端保存前校验，服务器在任何付费 Review phase 前再次校验。
- 把每项 Verifier 检查拆成独立的 `lineage` 与 `semantics` 判断，由应用代码合成总状态；Chair 接受只代表授权范围，不再被当作语义正确的证明。
- 明确告诉 Verifier：`reduce`、`improve`、`mitigate` 等有限动词不会仅因缺少指标就变成绝对主张；更模糊的改写仍必须真正提升真实性。
- 即使模型返回空 unresolved，任何 unsupported 或 unverifiable Change 也会被应用确定性加入 Remaining Human Checks。
- 把仅开发环境可见的 Verifier fixture 升级到 v2，同时保持一次调用、600 output-token、无重试、无 Meeting 写入边界。
- 记录 D-044：Chair 修订是追加式带来源记录，verification 必须分离授权来源与语义正确性。

### 验证

- Production build、ESLint、`git diff --check` 和全部二十七项自动测试通过。
- 新回归覆盖：精确来源匹配、拒绝错误来源选择、Chair Finding 幂等新增、supersede 已有 Finding、持久化状态解析、双维 Verifier 解析、自动提升人工检查、有限动词 prompt 规则，以及服务器在供应商调用前拒绝无效 Chair 来源。
- 浏览器在当前视口与 390x844 下恢复已有真实 Artifact v2；新 verification 维度无横向溢出、console warning 或 console error。
- 本实现切片没有供应商请求、API key 传输、付费 token、Meeting 修改、部署或数据库删除。

### 当前限制

- 新 Verifier v2 供应商契约目前只有确定性与 mock 证据，还没有通过真实 Stage Replay。
- 浏览器历史里没有一条可以不调用供应商就测试新 Chair composer 的实时暂停 Review checkpoint。状态转换与来源校验已有本地覆盖，最终 checkpoint 视觉证据留到下一次有限 smoke。
- 逐项编辑 Change 与不可变已批准 Artifact 版本仍是 M2.11 未完成项。

### 下一步

获得用户新的明确预算后，通过现有单调用 Gate 恰好运行一次 Verifier fixture v2 Stage Replay。供应商契约通过后，再运行一次短合成 Review smoke；此前不重跑 proposal、不增加 Agent，也不扩建通用编排。

## 2026-08-26 - v0.11e 真实 Artifact v2 Benchmark

### 证据

- 使用 OpenAI `gpt-4.1-mini` 与 Anthropic `claude-haiku-4-5-20251001` 完成替代简历 Review：1 轮、Checkpoints、Observer 关闭。恰好六次调用完成，没有重试或恢复。
- Chair 接受六条 Finding 中的两条，拒绝四条无依据、重复或无需操作的 Finding。Editor 生成三项精确 Change，Verifier 通过，详细 Artifact 在没有 rejected-Finding 泄漏的情况下到达待决定 Human Gate。
- 界面显示 14K 输入 tokens、3,057 输出 tokens、48 秒模型时间和 `$0.046` 应用估算，低于批准的 `$0.10` 上限；供应商账单仍是权威依据。
- 本次运行暴露语义可靠性失败：两名 Reviewer 都漏掉明确受约束的 `~50%` 指标；一名 Reviewer 错误地把 `reduce` 归类为绝对措辞；Verifier 没有独立质疑，反而重复了这个前提。
- 房间仍在 Meeting History 中保持未批准。完整证据见 [Artifact v2 Benchmark 005](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md)。

### Gate 结果

真实完整 Review 路径在机械层面通过，但没有通过“用户委托后只看最终结果”的质量 Gate。M2.11 保持当前：带来源 Artifact 已能到达 Human Gate，但 Chair 还不能补充漏掉的 Finding，Verifier 仍可能机械通过语义薄弱的已接受 Finding。

### 下一步

下一次付费完整 benchmark 前，在交叉审阅 checkpoint 加入有限的 Chair Finding 补充/修订，并让 changed-material verification 独立判断改写的真实性。先为漏掉明确指标和错误的 `reduce` 绝对措辞判断增加本地回归；不扩建通用编排，也不优先做费用优化。

## 2026-08-26 - v0.11e 机械 Review Smoke

### 证据

- 使用两个 Anthropic Haiku Seat、一个复用 session connection、Checkpoints 模式和关闭的 Observer 运行正常单轮 Review 路径。恰好六次调用完成，没有重试。
- Editor 工作前，Human Chair 接受一项有明确来源的 Summary Finding，并拒绝五项更宽泛或无依据 Finding。
- Editor 生成一项精确带来源替换，应用代码保留未修改文本，Verifier 通过该 Change，房间到达待决定 Human Gate。
- 用量为 7,144 input tokens、2,666 output tokens、32 秒和 `$0.041` 应用估算，超过此前预测的 `$0.02-$0.03`；供应商账单仍是权威依据。
- 房间在 Meeting History 中保持未批准。证据保存为 [Mechanical Review Smoke 004](evaluations/2026-08-26-v0.11-mechanical-review-smoke-004.md)。

### Gate 结果

正常 Editor/checkpoint/Verifier 机械 Gate 通过。该结果尚不能证明真实 Artifact 价值或成本效益；费用预测偏差已加入下一 benchmark rubric。

### 下一步

不要根据这个两行 fixture 开启费用微优化支线。挂载所需 session connection 后，在现有 `$0.10` 完整运行上限内执行一次替代简历 benchmark，并比较被接受价值、阅读投入、tokens、延迟和费用，再决定简化什么。

## 2026-08-26 - v0.11e 真实 Verifier 单阶段探针

### 证据

- 在用户明确授权后，通过新增固定 Verifier Stage Replay 恰好调用一次 Anthropic `claude-haiku-4-5-20251001`。
- 修正后的契约通过：461 input tokens、163 output tokens、2.3 秒模型时间，应用估算 `$0.0026`。供应商账单仍是权威依据。
- 响应恰好保留所需顶层字段，保留 `change-replay-1`，返回单一字面值 `supported`，并把说明锚定到用户来源。
- Meeting History 保持六条记录。没有重试、Editor、proposal、cross-review、room 修改、数据库写入或额外供应商调用。
- 完整有限结果已保存为 [Verifier Stage Replay 003](evaluations/2026-08-26-v0.11-verifier-stage-replay-003.md)。

### Gate 结果

Verifier 供应商格式 Gate 通过。Artifact 质量、正常房间路径中的 checkpoint 恢复和 Human Gate 是否有用仍未证明。

### 下一步

通过 Editor -> 持久化 checkpoint -> Verifier 路径运行一次短合成机械 Review smoke。若通过，再进行一次替代 Artifact v2 简历 benchmark 并判断用户 Artifact。此前不新增其他 replay stage 或通用评测基础设施。

## 2026-08-26 - v0.11e - 单调用 Review Stage Replay

### 已完成

- 新增由服务端持有的匿名 Review Verifier fixture；它复用正式 changed-material prompt、供应商 adapter 和严格 parser，但不会创建或修改 Meeting。
- Replay 被限制为恰好一次供应商调用和 600 output tokens。它没有重试路径，不写入 room、event 或数据库；即使模型输出被拒绝，也会返回用量和字段级校验诊断。
- 在 Connection Library 中加入仅开发环境可见的 Stage Replay 面板。它复用当前页面内存中的 BYOK connection，允许显式选择模型，并显示规范化结果、建议用量和可展开的供应商原始输出，便于诊断。
- 记录 D-043：付费评测按“本地测试 -> 单阶段探针 -> 短烟雾测试 -> 完整 benchmark”阶梯推进；只为测试后续阶段时，不重新构建已经完成的阶段。

### 验证

- Production build、ESLint、`git diff --check` 和全部二十六项自动测试通过。
- 新增供应商边界 fixture 断言只有一次 Anthropic 请求、600-token 传输上限、不会发送不兼容的 `thinking` 字段、严格保留 Change ID，并且结果中没有 Meeting 身份。
- 在当前 603px 视口与 390x844 视口完成浏览器检查：Replay 控件在可滚动 Connection Library 内始终可达，页脚保持固定，不存在横向溢出、console warning 或 console error。
- 本切片没有真实供应商请求、API key 传输、付费 token、Meeting 修改、部署或数据库删除。

### 当前限制

- Stage Replay 当前只支持 Review Verifier v1 fixture。它有意不做成通用评测平台，也不会持久化结果。
- 固定 fixture 验证供应商格式与 parser 兼容性，不评估简历质量、Artifact 质量、交叉审阅价值或 Human Gate 是否有用。
- 目前仍没有真实模型通过修正后的 Verifier 契约；Benchmark 002 仍是最新付费证据。

### 下一步

重新连接一个会话供应商，并为最多一次 Verifier replay 授予小额明确上限，目标为 `$0.01-$0.02`。若通过，再运行一次短合成机械烟雾测试，然后才进行替代完整 Artifact v2 benchmark；若失败，使用精确诊断，不以相同输入重跑。

## 2026-08-26 - v0.11d - Verifier 失败收据与真实恢复

### 已完成

- 在用户批准的 `$0.10` 运行上限内完成 [Artifact v2 Benchmark 002](evaluations/2026-08-26-v0.11-artifact-v2-benchmark-002.md)。六次供应商调用产生 3,537 个可见输出 tokens，模型时间 54 秒。Editor 已完成，但 Anthropic Verifier 返回无效结构化输出；房间没有到达 Human Gate，也没有重新创建房间。
- 用字段级诊断替代笼统 Verifier mismatch，并提供包含真实 Change ID、恰好三个顶层 key 和逐项单一 status 字面值的具体响应骨架。
- Editor 完成后新增经过验证并持久化的 `ReviewEditCheckpoint`，包含来源 State 版本、Change Set、应用生成的 Artifact v2、Editor 快照和时间戳。
- 显式恢复现在只把匹配 checkpoint 路由到 Verifier Seat。State 过期、Finding 改变、Artifact v1 改变或 Editor 快照不同都会拒绝恢复请求。
- Review 预检新增一次可见且有限的 Verifier 恢复额度。正常成功仍使用六次调用；最多允许一次失败 Verifier 使用第七次调用，且不重复 Editor。
- 记录 D-042：任何能独立完成的付费组合子阶段都必须有 durable receipt，并且只能从失败子阶段恢复。

### 验证

- 生产构建、ESLint、`git diff --check` 与全部二十五项自动测试通过。
- 集成测试证明首个 Artifact transition 调用 Editor+Verifier、发出 Editor checkpoint，而携带该 checkpoint 的恢复请求只调用 Verifier。
- 真实 Verifier 失败、失败的 Resume 尝试以及实现修正后都没有新增供应商调用。

### 当前限制

- Benchmark 002 没有生成最终 Artifact v2、verification verdict、汇总输入 tokens 或汇总应用费用估算；供应商账单仍是权威依据。
- 已停止的真实房间早于新 checkpoint 事件，无法retroactively恢复。
- Artifact 质量与阅读负担评测仍未完成。在替代运行前，没有证据支持增加其他 Review 功能。

### 下一动作

获得新一轮明确预算并重新挂载 session connection 后，只重跑同一简历案例一次。确认直接完成或一次 Verifier-only 恢复，记录汇总用量，然后先判断 Artifact v2 质量，再决定任何后续实现。

## 2026-08-26 - v0.11c - 带来源链的 Artifact v2

### 已完成

- 新增严格 Review Editor 契约：只能提交数量有限、互不重叠、精确替换的修改，并且每项修改必须引用 Human Chair 已接受的 Finding ID。Artifact v1 保持不可变，由应用代码而不是模型应用 Change Set，确定性生成 Artifact v2，从而阻止未声明改动。
- 新增独立 Verifier 调用。它只接收已接受 Finding、用户参考资料、真实性边界和声明的改动内容，不接收完整 transcript 或 Artifact 中未修改的文本；每项修改恰好一条检查，应用据此确定性生成总体验证结论。
- 在这条有限切片中，显式复用两个可见参与 Seat 分别承担 Editor 与 Verifier。预检、预算、实时工作状态、中断错误和进度事件都会计算两次调用；Editor 格式错误会直接可见失败，并且不会自动调用 Verifier 或重试。
- 新增 Artifact v2、Change Set、Verification 和 Executive Brief 四个独立结果视图。Review 结果不含凭证地保存到 Meeting History，并可随房间恢复。
- 记录 D-041：Artifact v2 必须由带来源 Change Set 确定性派生，详细用户交付物与有限模型工作上下文保持分离。

### 验证

- 生产构建、ESLint、`git diff --check` 与全部二十五项自动测试通过。新增 fixture 覆盖确定性替换、已接受 Finding 完整覆盖、拒绝未知或 rejected Finding、修改不重叠、Verifier 仅接收改动上下文、持久化解析，以及 Editor 格式错误后不自动重试。
- 在 `http://localhost:3001/` 完成浏览器验收：恢复后的 Setup 和 Meeting History 抽屉正常显示，控制台没有 warning 或 error。当前浏览器控制接口未暴露视口调整，因此本轮不声称新增移动端截图或真实 Artifact v2 视觉样例。
- 本实现切片没有真实供应商请求、API Key 传输、付费调用、部署或数据库删除。

### 当前限制

- Editor 与 Verifier 暂时由确定性选择的参与 Seat 复用。独立系统角色配置，以及显式的成本/质量选择仍待实现。
- 精确替换会有意拒绝歧义或不存在的原文。逐项编辑 Change、不可变已批准 Artifact 版本和批量 Finding 操作尚未实现。
- Editor 与 Verifier 当前共用一个可恢复 synthesis transition。若 Editor 完成后发生中断，显式重启 transition 可能重复 Editor 成本；系统不会自动重试。
- Artifact v2 质量、Verifier 价值、阅读负担和供应商格式可靠性目前只有模拟证据，三案例 Review 评测尚未开始。

### 下一动作

用明确预算运行一次完整简历 Review Artifact v2 benchmark。对照 Artifact v1、已接受 Finding、Change Set、验证项、最终 Artifact v2、无依据修改、人工 edit distance、费用、延迟和阅读负担。完成后只做证据要求的修正，再运行另外两个 Review 案例。

## 2026-08-26 - v0.11b - 真实 Review Benchmark 与有约束力的人类决定

### 已完成

- 使用 OpenAI `gpt-4.1-mini` 与 Anthropic `claude-haiku-4-5-20251001` 运行两次严格限额的“简历对照职位描述”Review。共十次供应商调用，输入 27K tokens、输出 6,010 tokens、耗时 96 秒，应用合计估算 `$0.087`，低于用户批准的 `$0.10` 上限；供应商账单仍是权威依据。
- 第一次运行暴露共同错误推断：因为缺少可信当前日期，两名 Reviewer 都把简历中的 2024/2025 日期当成未来日期。Chair 的自由文本纠正没有约束后续 Agent 或 synthesis。
- 为所有 Review 任务上下文加入可信应用日期，并为 canonical Finding 增加逐项 Accept/Reject。Chair 决定现在会写入 append-only `human.choice`，把 Claim 改为 `accepted_by_chair` 或 `rejected_by_chair`，解决关联 Dispute，且后续模型支持、反对或 objection 不能覆盖它。
- Review synthesis 改为读取 Canonical State，不再读取原始 proposal/review statement。被拒绝 Finding 是必须排除项，被接受 Finding 是必须纳入项。
- 增加应用层 Review Brief 校验器，强制五个顺序固定且非空的部分：Priority Findings、Supported Findings、Contested Findings、Missing Evidence、Recommended Next Step。格式错误会清晰失败，不会自动触发付费重试。
- 完整案例、证据、限制和 Gate 结果记录在 [Review Benchmark 001](evaluations/2026-08-25-v0.11-review-benchmark-001.md) 与 D-040。

### 验证

- 第二次真实运行不再产生“未来日期”错误。Anthropic 提出的另一项薄弱时间线推断被 Chair 拒绝；即使 cross-review 重复该观点，Canonical State 仍保留拒绝决定，synthesis 也将其排除。
- 第二次运行仍未通过产品 Gate：brief 缺少所有必需标题，对委托完整审阅的用户过于浅薄，并加入了无依据的 GitHub 链接建议。新的 parser 回归 fixture 用五次模拟调用复现该失败，并证明不会重试。
- 二十三项自动测试与生产构建全部通过。

### 当前限制

- 当前 Review Brief 是控制层的 executive artifact，不是详细用户交付物。Editor、结构化 Change Set、Artifact v2 与仅核验改动内容的 verifier 尚未实现。
- 已有逐项 Accept/Reject，但批量决定、修订备注和更丰富的 Finding schema 不属于本切片。
- 因原职位页面不可用，本次 benchmark 使用了存档 JD 摘要；资格与当前职位状态被明确保留为未解决项。

### 下一步

实现 Editor 切片：把已接受 Finding 转换为带来源的 Change Set 与详细 Artifact v2，再在 Human Gate 前只核验发生改变的内容。下一次付费简历 benchmark 比较 Artifact v2 质量、无依据改动、人类编辑距离、费用和阅读负担；不再付费测试只有 v1 brief 的流程。

## 2026-08-25 - v0.11a - Review Agenda 与独立 Finding

### 已完成

- M2.11 从最小 Artifact 纵向切片开始，不继续扩建通用编排器。Setup 现在提供 Review/Decide 任务选择器，并把 Review 作为初始产品路径。
- 新增有限 Review 输入：目标、Artifact v1、用户参考资料和 Human Chair 真实性边界。Task Pack 在 API 边界校验，在不保存凭证的前提下写入 `RoomStore`，可从 Meeting History 恢复，并向后兼容旧 Decide 记录。
- 每个独立 Proposal reviewer 收到相同、明确标记为不可信内容的来源包和 Review 专用 Finding 契约。交叉 Review 根据同一来源包核查指定 Seat 的 Finding，并必须把缺少支持的内容标记为未验证。
- 在 Review checkpoint 将 Proposal phase 的独立 Finding 显示为带来源的 canonical Claim 行。本切片保持 Artifact v1 不变。
- 新增 Review Brief synthesis 契约，包含 Priority、Supported、Contested、Missing Evidence 和 Next Step。Synthesis 只接收 Canonical Findings 和有限 turn statement，不接收原始 Artifact、参考资料或真实性边界文本。
- 记录 D-039：Review 来源属于 Task input，Finding 属于 canonical record，只有显式 Editor phase 才能修改 Artifact。

### 验证

- 使用内置 Node runtime 的生产构建通过。
- 二十一项自动测试全部通过。新 API fixture 证明：不完整 Review Task Pack 会在任何供应商调用前停止；四次 reviewer 调用收到共同来源包；最终 synthesis prompt 不包含任何原始来源 marker。
- 在 1440x1000 与 390x844 下完成内置浏览器验证，并发现和修复两个响应式问题：桌面自动聚焦会隐藏 Task Pack 选择器，嵌套 objective 滚动会让手机 Agenda 收缩。修正后没有 body 级横向溢出，模式切换正常，浏览器控制台无 warning/error。
- 没有真实供应商请求、API Key 传输、付费模型调用、数据库删除、部署、Editor、Change Set 或 Artifact v2。

### 当前限制

- Reviewer 仍使用现有通用 Seat role；任务自适应 Review Role Pack 尚未实现。
- Finding 文本遵守精简契约，但尚未把严重度、位置、建议与证据拆成独立字段，也没有重复聚类。
- Review Brief 只组织 Finding，不生成详细修订稿。逐项 Human Gate 留给 Editor 切片。
- Review 输入有意限制为 Artifact 与参考资料各 12,000 字符、真实性边界 2,000 字符。检索与长文档分块要等待后续产品证据。

### 下一动作

运行一次有明确预算的“简历对照职位描述”benchmark。只有出现关键开放 Dispute 时才最多使用一次 targeted debate。实现 Editor、Change Set 和 Artifact v2 前，保存原始 Artifact、Finding、Review Brief、接受/拒绝项、用量和阅读负担。

## 2026-08-25 - v0.10c 真实烟雾评测 - 容量与 Envelope 校正

### 已完成

- 在用户批准的 `$0.10` 上限内运行一次 OpenAI + Anthropic 烟雾序列。有限证据运行后没有再创建新房间，没有原样重试失败请求，中断房间继续保留供审计。
- 确认 Anthropic Haiku 与 OpenAI `gpt-4.1-mini` 可以完成独立 Proposal 和交叉 Review。首批付费 Review 暴露的是依赖处理顺序的 Canonical State 超限，不是某一家供应商特有问题。
- 将 active-state 容量校正到有限三席协议的最坏情况，并在 parser 中强制 Proposal/Review 的逐 phase 增量上限，不再只依靠 prompt 文字。新的三席最坏情况 fixture 证明完整有限批次可在 targeted debate 之前进入 State。
- 压缩 Observer 契约：在原 300-token 上限内只允许一到两句、最多两个 focus Claim、两个 remaining Dispute 和一个 Chair question。
- 将 targeted debate 的完整 Review schema 替换为专用最小 Envelope，并设置 400-token 上限。它只包含定向立场、thesis、最多一个 Claim update、可选 Chair question 与 confidence，不能新增 Claim 或 objection。
- Observer 的格式错误和供应商错误现在会显示在房间错误区。
- 记录 D-038：并行 phase 容量与逐 phase 契约属于应用不变量，而不是 prompt 建议。

### 证据

- 容量修复后，新混合供应商房间完成两份 Proposal 和两份交叉 Review，达到 Canonical State v4，没有再次出现顺序依赖拒绝。
- 同一房间随后暴露两个真实边界：初次 Observer 的严格 JSON 响应过大而失败；第一轮定向响应在旧完整 Review Envelope 下失败。提高 transport 上限后只做了一次显式、输入已变化的恢复；Anthropic 仍返回无效 JSON，OpenAI 在完成前中断。没有第二次重试。
- 代码现已使用由该失败推导出的更小 targeted schema，但最终 schema 只有确定性 fixture 证据。组合后的定向辩论、第二份 Observer 与 synthesis 路径尚不能宣称真实走通。
- 生产构建、ESLint、`git diff --check` 和十九项自动测试全部通过。程序没有跨供应商权威账单总额；可见估算与有限调用保持在批准上限内，但中断调用仍可能出现在供应商账单中。

### 下一动作

不再继续通用编排扩建。开始 M2.11 时，用一个小型 Review benchmark 恰好验证一次新的最小 targeted Envelope。若成功，则记录 M2.10 证据 Gate 完成并继续 Review 纵向切片；若仍失败，就把 targeted debate 降为可选，继续核心 Review Pack，不再进入基础设施循环。

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
