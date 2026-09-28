# AI 交接说明

## 2026-09-28 — 未配置完整的席位不能切换参与状态（本地）

同一 `seatSetupIssue` 判定同时约束 Agenda／Setup 开关、可运行席位投影和启动。缺少连接／会话密钥、兼容模型、角色或自定义名称／Skill 时显示 `Not set up` 与 Setup 提示；新席位默认 Off，配置完整后才可切换。`pnpm.cmd check` 通过 87/87 项离线测试、构建、lint 和类型检查。无密钥浏览器检查确认两处未配置状态及禁用的 Start。未做真实凭据开关验收、供应商调用或部署。[简报](correction-briefs/2026-09-27-setup-seat-summary-and-completion.md)。

## 2026-09-28 — Agenda 和 Setup 都有席位 On／Off（本地）

用户截图修正了 D-076 过严的只读摘要：Agenda 和 Setup 现在共用同一个 `SeatDraft.enabled` 开关；其余席位编辑仍只在 Setup。Off 保留席位草稿但不计入可运行席位，不改变持久化或 API 合同。`pnpm.cmd check` 通过 86/86 项离线测试、构建、lint 和类型检查。无密钥浏览器检查证实 Agenda→Setup→Agenda 的开关同步，尚未以已配置连接验证就绪数变化。没有供应商调用或部署。[补充简报](correction-briefs/2026-09-27-setup-seat-summary-and-completion.md)。

## 2026-09-27 — 席位编辑归 Setup，Agenda 只展示摘要（本地）

针对十二席反馈，席位编辑全部留在 Setup；Agenda Room Composition 改为可用键盘聚焦的只读列表，高度上限为 360px／45dvh，内部滚动。从 Setup 切换其他阶段时先关闭 Setup，因此两席以上可运行时「①」显示绿色完成态，而不会继续是当前步骤。`pnpm.cmd check` 通过 86/86 项离线测试、构建、lint 和类型检查。本地 390×700 浏览器检查确认十二席摘要和内部滚动；绿色就绪态只做了源码／CSS 检查，未用凭据触发。没有供应商调用或部署。[简报](correction-briefs/2026-09-27-setup-seat-summary-and-completion.md)。

## 2026-09-27 — 普通会议可配置 Setup（本地）

用户批准的普通 Decide 纠错已在未提交工作区实现：Setup 变为页面而非连接弹窗；2–12 席可设置有界的自定义名称和职责；Lite／Medium／Extended 分别提供每席发言与最终 Memo 的 token 滑块。所选有限上限贯穿请求校验、供应商输出上限、房间输出额度、会议保存及完整 Markdown 导出。Review／Plan 保持最多三席，不接受这些自定义输出设置。读取旧房间时不补造设置或 P2 证据。发言解析器和 Canonical State 为容纳 12 席扩大了明确的有限容量。

`pnpm.cmd check` 通过构建、85/85 项离线测试、lint 和类型检查。本地 390×700 浏览器检查确认 Setup 控件可滚动到达、阶段导航正常；未进行真实供应商调用、已保存会议浏览器回放、远程 CI、提交、推送或部署。token 上限不保证篇幅，也不是账单上限。任何真实模型校准前先按[纠错简报](correction-briefs/2026-09-27-configurable-ordinary-room-setup.md)执行。DP-0.3 仍未结束。

## 2026-09-27 — 编号步骤栏选中态（本地）

过去只要就绪席位少于两个，Setup 就持续高亮，即使当前页面已切换。桌面／移动共用步骤栏现根据连接弹窗是否打开或可见工作区阶段确定唯一当前项，完成态另算。`pnpm.cmd check` 通过 82/82 测试、构建、lint 和类型检查。尚未手动验收浏览器点击／布局；无供应商调用、提交、推送或部署。[简报](correction-briefs/2026-09-27-stage-navigation-active-state.md)。

## 2026-09-27 — 可读会议和含正文导出（本地）

Focus／Overview 现用安全 GFM 而非纯文本显示发言。独立的 `Export full .md` 主动入口将一间已保存房间及 Chair 事件投影为含正文记录；不能与 P3 脱敏诊断 JSON 混为一谈。供应商／模型标签只是配置，不是 API 凭据。人工指令尽可能锚定前一条发言；缺失的单轮时间和无法锚定的事件明确说明。已保存 Plan／Review 完整产物也包含在内。`pnpm.cmd check` 通过 81/81 测试、构建、lint 和类型检查。无浏览器下载／布局验收、付费调用、远程 CI、提交、推送或部署。[简报](correction-briefs/2026-09-27-readable-meeting-record.md)。

## 2026-09-27 — 普通创作会议 Live 001 已记录，尚非基准测试

用户的一轮中文 Decide 房间已[归档至项目私有仓库](evaluations/2026-09-27-ordinary-creative-meeting-live-001.md)：精确白名单诊断导出、用户提供的完整 Memo、十二张截图及[按会场顺序转录的截图可见发言](../evaluations/artifacts/ordinary-creative-live-001/visible-meeting-record.zh-CN.md)。用户明确批准此次归档；未经另行决定，不在该仓库之外发布或复用小说构思与完整 Memo。案例证据已提交为 `37cc250`，并获用户授权推送至项目私有仓库。九次真实供应商调用在一次 JSON 格式失败和另一次 Canonical State 归约失败经明确的新尝试后，得到人工批准的 Memo。一条 Anthropic 总结用时 103,659 ms 且完成；下文“没有超过 90 秒的真实验证”只是较早快照，现仅对这一调用失效。记录用户认可，但导出质量字段仍为 `not_evaluated`；平台事实、账单、实际服务模型身份和相对单模型增益均未验证。证据记录未新增供应商调用或代码修改。

## 2026-09-27 — DP-0.3 普通会议超时纠错

用户的 P2 提案回执触及本地 90 秒计时器。普通参与者／总结调用现按 Lite／Medium／Uncapped 设有限的 180／240／300 秒截止时间，并对齐房间时间额度。其他调用族保持 90 秒，Plan 仍无应用计时器；Stop 与不重试政策不变。`pnpm.cmd check` 通过 79/79 离线测试、构建、lint 与生成类型检查。无真实供应商／浏览器验收、付费调用、推送或部署；供应商能否完成及账单仍未知。[简报](correction-briefs/2026-09-27-ordinary-meeting-provider-timeout.md)。

## 2026-09-27 — DP-0.3 普通会议发言档位纠错

所选 Lite／Medium／Uncapped 现指导一次性与可恢复普通会议的提案、交叉审阅、具名分歧 statement 深度，既有传输上限继续生效。Medium 保留旧目标；严格 Turn Envelope／Card／来源合同、最终 Memo 与结构化 Plan 分开。`pnpm.cmd check` 通过 78/78 离线测试、构建、lint 与生成类型检查。Prompt 遵从、真实供应商质量、浏览器 Meeting 布局及历史档位选择未验证；旧房间不回填。无付费调用、推送或部署。[Brief](correction-briefs/2026-09-27-meeting-speech-output-profiles.md)。

## 2026-09-27 — P3 单间诊断导出本地 Gate

P1/P1B/P2 已单独提交为 `4d16c9c`。`lib/meeting-diagnostic-export.ts` 是唯一 v1 导出契约：对一间已保存普通 Decide 房间做纯白名单投影。历史列表提供单行下载；三份脱敏 fixture 与 75/75 测试验证确定性 JSON、隐私及不补造 P2 回执。不做 Plan／Review／Observer／Solo 导出或导入／SDK。浏览器点击／下载与远程 CI 尚未验收；未推送或部署。[P3 简报](correction-briefs/2026-09-27-p3-one-room-diagnostic-export.md)。

## 2026-09-27 — P2 源头证据本地验收完成

普通 `runAgent` 会议调用现有严格的开始／终态回执，失败时保留已上报用量，
区分调用状态、provider 结束原因和 Turn Envelope 校验。本地历史和可展开
证据面板保留未知；配置模型不等于实际服务模型。暂不覆盖 Plan、Observer、
Solo、Review Editor/Verifier，也没有 SledTrace 导出／导入。
[批准范围、实现与验收](correction-briefs/2026-09-27-p2-source-attempts.md)。
下文 P2 未实现的描述是旧检查点。仅本地验收：无付费调用、提交／推送、
远程 CI 或部署；不代表 DP-0.3 完成。

## 2026-09-27 — P1B 本地验收基线恢复

已解决 P1 继承的检查阻塞，未改变运行时预算、prompt 或校验规则。
`pnpm.cmd check` 退出 0：构建、68/68 测试、lint、类型检查全过。
无真实调用、远程 CI、提交／推送或部署。
[原因、改动与准确证据](correction-briefs/2026-09-27-p1b-validation-baseline.md)。
P2 未实现；该修正不代表 DP-0.3 产品验收完成。下文 P1 的失败描述是此前树的历史。

## 2026-09-27 — P1 安全校验诊断（仅本地）

- 在既有错误字符串中细分 Turn Envelope 原因码、路径和结构摘要；
  没有 schema、prompt、接受条件、重试或模型变化。
- 三个新增离线测试通过，1,107 组基线对照保持判定／归一化；build/lint 通过。
  全检查失败：67/68，已有 Solo 502；类型检查失败：41 条，与 HEAD 校验器源码完全相同。
- 无付费调用、历史 trace 改写、提交／推送或部署。这是 DP-0.3 旁的有界修正，
  不代表该产品阶段完成。
- [验收、实际样例与边界](evaluations/2026-09-27-p1-turn-validation-diagnostics.md)。
  P2 采集／导入未实现；宣称全绿集成前，应另片处理基线检查失败。


最后更新：2026-09-27

## 当前状态

- **最新本地纠错（2026-09-25／DP-0.3）：** Meeting 输出档位现在控制供应商上限、房间总预算和 unlimited synthesis 指令。Unlimited 使用普通 turn 12K、synthesis 16K 上限；创作／规划提示要求匹配用户语言并展开为可执行交付。请求下一轮时把旧 Canonical State 记录压缩为一个 summary Claim，同时保留 transcript 历史。供应商中断会保留上一轮 memo 并提供 interrupted round 恢复。Lint/build 通过；离线测试仍为 64/65，因为既有 Solo session-key 测试返回 502。零真实调用、零部署。

- **已批准产品开发列车（D-064，2026-09-18）：** [产品开发计划](PRODUCT_DEVELOPMENT_PLAN.md)把 **Ask the Room** 设为日常窄入口，Review 保留为第一个信任 Pack 而不是产品边界，并通过 DP-0 到 DP-9 排列整个工作空间。[详细开发里程碑](DEVELOPMENT_MILESTONES.md)决定前向工作。DP-0.0 至 DP-0.2 已完成；DP-0.3“首次使用信息架构”为当前里程碑。该状态不授权付费调用、发布或 Execute 动作。
- **最新工程 Gate（D-066／DP-0.2）：** Windows `pnpm check`重新生成 Cloudflare runtime types、完成 vinext build、通过 63/63 离线测试、lint 与 type check。首次远程运行在两个 OS 的安装前均因 Corepack 签名校验失败。只替换为官方固定版本 pnpm action 后，`97b865a`上的 [Ubuntu 与 Windows CI](https://github.com/Schromeo/multi-ai-meeting-room/actions/runs/36076954748)均通过。DP-0.2 已完成。见[验证](evaluations/2026-09-19-dp-0-2-local-portability.md)。
- **最新仓库基线（D-065／DP-0.1）：** package 为私有、无 tag 的`multi-ai-meeting-room@0.0.0-development`；pnpm 11.19.0 与`pnpm-lock.yaml`是唯一 package 路径；锁定的 native build 依赖使用显式 allowlist；仓库为`UNLICENSED`并保留所有权利。过期 v0.10c／未提交说法已移除。[基线证据](evaluations/2026-09-19-dp-0-1-repository-baseline.md)：frozen install 与 lint 通过；Windows build/test script、一项 CRLF 敏感源码测试与三项 Cloudflare ambient 声明稳定失败并归 DP-0.2。零供应商调用、零部署。
- **最新本地纠错（D-063）：** Connection Setup现在除`AIza`外也识别当前Gemini `AQ.`授权key；Anthropic会先于前缀重叠的OpenAI `sk-`族判断，未知格式保留手选。识别只作本地提示：不持久化、不跨供应商试探，也不宣称已验证凭证。构建、63项测试和lint通过；仍只有三项既有Cloudflare ambient错误。零真实调用。见[简报](correction-briefs/2026-08-30-provider-key-prefix-detection.md)。已准备的含Gemini三席位smoke尚未运行，执行时仍需明确确认。
- **最新本地纠错（D-062 / PLAN-06）：** 新Plan的Builder/Reviewer阶段会在供应商工作前保存严格的usage未知`started`回执，再由同请求/阶段终态原位替换。没有Reviewer回执表示该阶段未启动；保留下来的started表示可能存在未知供应商用量，绝不等于零。构建、62项测试和lint通过；仍只有三项既有Cloudflare ambient错误。零真实调用。不重写历史歧义，也不建设计费账本。见[简报](correction-briefs/2026-08-29-plan-stage-request-receipts.md)。
- **最新本地纠错（D-061 / PLAN-11）：** stopped协议快照现在保存`budget`或`human`来源，旧房间保持中性。保存Plan恢复会在控件启用前按保留用量评估；额度耗尽的恢复仍可见但禁用，且不能调用供应商。构建、62项测试和lint通过；类型检查仍只有三项既有Cloudflare ambient错误。零真实调用、零记录迁移。PLAN-11已本地验证；D-062另行关闭新Plan回执，PLAN-12持久连续性仍待处理。见[简报](correction-briefs/2026-08-29-plan-stop-and-recovery-truth.md)。
- **最新本地纠错（D-060 / PLAN-13）：** 初始实际产物Plan Reviewer现在只向明确受支持的Anthropic家族发送原生JSON Schema，包含Fable 5。本地日期/长度/数量语义继续权威；可接受单独JSON围栏，说明文字包裹仍失败，也未增加重试或原文保留。构建、62项测试及lint通过；类型检查仅三项既有Cloudflare ambient错误。零真实调用，保存的Live014 Plan未动。PLAN-13为本地修复/真实未验证，PLAN-10继续待处理。下一步最多单独授权一次Fable Reviewer-only调用读取保存产物，绝不再生成Sol。见[简报](correction-briefs/2026-08-29-plan-reviewer-structured-output.md)。
- **最新真实结果（014）：** 刷新授权后恰好运行一次Sol Builder和一次Fable Reviewer。Sol交付12/12有效Plan天；Fable完成但审阅未通过JSON校验，所以完整草稿保留，独立意见和Human Gate未完成。见[评估](evaluations/2026-08-29-plan-artifact-first-live-014.md)、[Plan](../evaluations/artifacts/plan-artifact-first-014/01-plan-readable.md)及诊断。D-059/PLAN-17/18机械验证通过；D-060随后已在不重生成Plan或付费重试的情况下本地修复Reviewer契约。
- **最新纠错与负面真实证据（D-059 / 真实实验012）：** Detailed Plan现在严格按首次两调用/22K预算，直接由一个Builder生成，再由一个实际产物Reviewer审阅。历史12在供应商前发现旧通用synthesis Gate；历史13发现version-zero产物解析错位，Sol可能但未确认启动，Fable未调用。两项均已本地修复；构建、61项测试和lint通过。见[评估](evaluations/2026-08-29-plan-artifact-first-live-012.md)和[18项问题清单](PLAN_ISSUE_REGISTER.md)。产品质量仍未运行；再进行两调用需要刷新授权。
- **最新本地纠错（D-058 / PLAN-03处理中）：** 已识别原始GPT-5 Plan Builder现在请求low；实际审阅/修改/复核继续medium，其他供应商/模型保持默认。尝试诊断分开保存请求档位和实际报告reasoning用量。构建、59项测试及lint通过，零真实调用。这只证明配置，仍需新的明确授权进行一次Builder阶段结果验证。见[问题清单](PLAN_ISSUE_REGISTER.md)。
- **最新本地纠错（D-057）：** [Plan问题清单](PLAN_ISSUE_REGISTER.md)跟踪16项。PLAN-01初始Builder/Reviewer保存有限结束/用量及拒收诊断，不存原始响应；PLAN-02新格式指令显式限定阶段/轮次。59项离线测试、构建、lint通过，零真实调用。010/011缺失诊断仍未知，旧correction不迁移。真实Plan质量未通过。
- **最新续接011：** [报告](evaluations/2026-08-27-plan-wait-continuation-011.md)。D-056取消Plan应用截止/累计时间停止，增加一次显式保存产物恢复。续接010同一房间，只新增一次GPT调用，没有新有效天数，审阅未启动。原77条任务及六天与留档一致，历史11；无重试/修改/批准。剩余输出46K->37K为取整显示，原始失败/结束/用量未暴露。仍为原累计$5，不追加$5。构建、54项离线测试、lint通过，保留三项既有Cloudflare类型错误。完整可用Plan及真实超过180秒完成仍未证实；D-056替代下方D-055历史180秒政策。
- **最新实测010：** 新授权$5，GPT-5/Opus4.7未完成完整交付。实际6次供应商请求：交叉审阅JSON失败后改变输入恢复一次，随后medium推理Builder在180秒超时，保住Day1-6。补缺失天数因只剩1个预留调用名额被拦截，没有新增请求；实际计划审阅/修改/复核/批准均未运行。历史11条，[质量实测010](evaluations/2026-08-27-plan-quality-live-010.md)已归档原稿与失败。失败用量/实际账单不全，不得说花完$5或质量通过。
- 阶段：DP-0.3 中的私有无 tag 预发布版本。历史 v0.x 名称标识保存的开发快照，不是当前 release 版本。评测工具扩建已收尾；M2.12 对照暂缓而非通过，通用编排继续冻结。
- 产品：一个由人主持的多 AI 工作空间，包含 Review、Decide / Plan、Explore、Create 和未来 Play Task Pack，并横跨 Discuss、Research 与 Execute 权限等级。
- 已完成：Review、BYOK、本地历史与准确批准；结构化详细 LeetCode Plan、有界生成/恢复、实际计划审阅、零调用人工编辑及 D-055 显式修改/复核。DP-0.2 的本地与远程 Windows／Ubuntu 命令矩阵均通过；真实 Plan 质量仍未证明。
- 已批准但未实现：任务自适应审阅 Role Pack、Finding 聚类、独立配置 Editor 与 Verifier、批量 Finding 操作、三案例 Review 评测；更完整的 Decide / Plan、Explore、Create、Research、Execute 与 Play Task Pack；带 event cursor 重连的 durable transition runner、导出、账号同步，以及身份完成后的 D1 持久化。
- 真实证据：Review Benchmark 001 使用 Anthropic Haiku 与 OpenAI `gpt-4.1-mini` 运行两次：十次调用、27K 输入 tokens、6,010 输出 tokens、96 秒，应用合计估算 `$0.087`，低于批准的 `$0.10` 上限。Run A 暴露共同的错误未来日期推断，并证明自由文本 Chair 纠正没有约束力。Run B 消除了该错误，证明被拒绝 Finding 在 cross-review 与 synthesis 中仍保持拒绝，但格式错误且浅薄的最终 brief 未通过产品 Gate。见 `docs/zh-CN/evaluations/2026-08-25-v0.11-review-benchmark-001.md`；供应商账单仍是权威依据。
- 最新真实证据：Artifact v2 Benchmark 002 使用六次调用、3,537 个可见输出 tokens 和 54 秒。Editor 成功；Anthropic Verifier 未通过 changed-material 契约。旧组合 transition 随后在 Resume 前耗尽 turn budget。没有生成最终 Artifact，失败后没有新增调用。见 `docs/zh-CN/evaluations/2026-08-26-v0.11-artifact-v2-benchmark-002.md`。
- 最新阶段证据：Verifier v2 Stage Replay 008 恰好调用一次 Anthropic Haiku，并以 597 input tokens、224 output tokens、3.1 秒和 `$0.0034` 应用估算通过双重 lineage/semantics 契约。Meeting History 保持 10 条。见 `docs/zh-CN/evaluations/2026-08-27-v0.11-verifier-v2-stage-replay-008.md`；供应商账单仍是权威依据。
- 最新机械证据：Mechanical Review Smoke 004 恰好使用六次 Anthropic Haiku 调用，以一项 Chair 已接受 Change 和通过的 verification 到达待决定 Human Gate。用量为 7,144 input tokens、2,666 output tokens、32 秒和 `$0.041` 应用估算，高于预测的 `$0.02-$0.03`。见 `docs/zh-CN/evaluations/2026-08-26-v0.11-mechanical-review-smoke-004.md`。
- 最新真实 Artifact 证据：Artifact v2 Benchmark 005 恰好使用六次 OpenAI/Anthropic 调用，以三项带来源 Change 到达待决定 Human Gate。界面显示 14K 输入 tokens、3,057 输出 tokens、48 秒和 `$0.046` 应用估算。删除占位符与弱化 `eliminate` 有价值，但两名 Reviewer 都漏掉明确受约束的 `~50%` 指标；一名 Reviewer 错误地把 `reduce` 当作绝对措辞，Verifier 又重复了这个前提。见 `docs/zh-CN/evaluations/2026-08-26-v0.11-artifact-v2-benchmark-005.md`。
- 最新 Decide / Plan 证据：Smoke 006 完成一场恢复后的混合供应商 12 天 LeetCode 房间。最终 synthesis 使用 1,585 output tokens、22 秒和 `$0.013`；房间显示总计 11K input、3,974 output、71 秒和 `$0.044` 估算。协议恢复通过，但产物因遗漏具体题名/题号而未通过 Gate。见 `docs/zh-CN/evaluations/2026-08-27-v0.11-decide-plan-smoke-006.md`。
- 最新详细 Plan 证据：Smoke 007 新增每天 10 MEU 契约。一次输入已改变的 Anthropic review 恢复通过；最终 OpenAI synthesis 使用 2,092 output tokens、26 秒和 `$0.017`，随后因缺少 Day 2 被拒绝。没有继续重试。见 `docs/zh-CN/evaluations/2026-08-27-v0.11-detailed-plan-smoke-007.md`。
- 已修复真实缺陷：供应商可选参数兼容、席位模型选择崩溃、Canonical State 容量不足导致依赖顺序的 Review 拒绝、只写在 prompt 中的 phase 上限、Observer 选择输出过大、targeted debate 使用完整 Review schema 的负担、不可见 Observer 失败原因、缺少可信日期、Claim 决定无约束力、被拒绝 Claim 泄漏进 synthesis、只依靠 prompt 的 Review Brief 结构、synthesis card 污染、Decide 产物输出不足，以及废弃 transcript turn 破坏显式恢复。原失败房间保留供审计。
- 其他未完成：生产 API Key、加密永久 BYOK、Skill 包、多样性指标、导出、证据系统、执行连接器和广泛比较评测。
- 当前重点：DP-0.3 首次使用信息架构。保留现有 Review、Plan Artifact 及未解决质量证据；除非后续 DP 里程碑明确命名信息增益并获得新授权，不恢复任何付费 Plan 或 Review 调用。
- 强制校正流程：每个实现切片现在都必须以 Correction Brief 开始，并按照[开发校正循环](DEVELOPMENT_CORRECTION_LOOP.md)分别记录机械、语义、Artifact、Human Gate、体验、经济性和差异化价值结果。
- 最新本地修正：待决定 Plan Gate 人工逐天编辑，整份重新校验，保存后发布，失败留草稿，恢复原始一天、历史和准确修订批准。原 AI Plan/审阅保持不变，复制/视图注明人工修改未经模型复审。不调用付费模型，不改 prompt/预算，不增加数据库 store。仍有三处既有 Cloudflare 声明错误。
- 最新实现（D-055）：每份原计划最多选三条意见，一次修改和一次不同席位复核，允许有据拒绝，保留未解决意见。调用前保存意图/草稿；失败停止，完成或放弃后 UI 不可重复循环。原天数/审阅不变，精确批准包含来源与修改；人工编辑需在完成或放弃后进行，且不冒充模型复审。Plan 交付调用对已有识别范围内 GPT-5 使用 medium，其余保留供应商默认，不更换用户模型。上限：Builder16K、审阅6K、修改12K、复核6K，Plan 超时180秒。Gemini 思考计入输出用量；OpenAI Plan 不完整响应保留已报告用量。
- 下一动作：DP-0.3 [纠错简报](correction-briefs/2026-09-24-dp-0-3-first-run-entry.md)、[源码基线](evaluations/2026-09-24-dp-0-3-first-run-baseline.md)与本地备份分支`backup/dp-0-3-pre-ui-2026-09-24`均已就绪。实现最小的单 Connection Solo 和模式 Objective 校正，检查第一屏并保留既有 Review／Plan 房间。本步骤不包含供应商调用或部署。
- 恢复点：`241affd`关闭 v0.10c 并锁定早期产品方向；`d844b40`是历史席位模型崩溃修复；`a9a8638`是进入 DP-0.1 时的干净提交基线。必须检查当前 HEAD 与工作区状态，不能把这些历史 hash 当成完整当前源码。
- 线上地址：`https://multi-ai-meeting-room.schromeo.chatgpt.site`
- 发布状态：2026-09-19 的未认证只读检查返回 HTTP 401，因此 DP-0.1 没有查看或确认已部署内容版本。较早 v0.4／`nodejs_compat`说明只保留为历史证据，不再当作已确认当前状态。不得发布或附带工作区付费凭证；部署工作必须等待输入变化及 DP-0.6 安全边界。

## 每次开始工作前

1. 阅读项目章程、产品方向、产品开发计划、详细开发里程碑、开发校正循环、本文件、决策记录、路线图、会议协议蓝图、模型与代理蓝图和最新开发日志。
2. 修改前检查工作区，保留用户已有改动。
3. 说明本次工作推进哪个里程碑和完成条件。
4. 确认该任务没有已经完成或被明确否决。
5. 只实现验证当前假设所需的最小端到端范围。
6. 实现前写出当前 Correction Brief；若无法写全，则先建立 fixture、rubric 或 baseline，不扩大代码。

## 防循环与重试规则

- AI 讨论默认最多 **三轮**。只有人类批准，或下一轮能解决一个明确问题时才可增加。
- 工具、API、构建或部署允许一次初始尝试和最多 **两次重试**。
- 只有暂时性故障，或输入、状态、权限、实现发生实际变化时才能重试。
- 同样输入产生同样失败后，禁止原样重复调用。
- 达到成功条件、轮数/重试上限、需要新权限，或下一轮无法改变任何问题时必须停止。
- 禁止创建无人监督的递归 AI 对话。
- 供应商支持时记录 request ID 或幂等键，避免重复动作。

## 必须由人批准

- 新任务进入 Execute 模式。
- 修改真实代码库、账号、外部服务或生产环境。
- 扩大权限、预算、模型数量或最大轮数。
- 扩大网站访问范围或向第三方发送信息。
- 接受尚未解决的高影响风险。

只读检查和模拟讨论不需要 Execute 批准。

## 房间不变量

- 每个房间都必须有目标、约束、预期产物、权限、预算和停止条件。
- 每个参与者都有角色、模型、上下文策略和工具策略。
- 总结必须保留未解决分歧和置信度限制。
- Execute 动作必须引用一个已批准的 Decision。
- Reviewer 默认不继承 Executor 的私有思路。
- 测试等确定性检查不能被模型共识替代。
- 审计事件采用追加记录，纠错通过新记录完成。

## M2 真实验收目标

验证已经实现的 Discuss 流程：用户提交目标，2–3 个模型独立流式提案，互相审阅指定主张，系统展示共识、分歧和未验证假设，最后生成保留异议的 memo，由人接受、修改、拒绝或批准额外一轮。

M2 不包括联网研究、代码执行、通用插件或自治循环。密钥和默认模型见 `PROVIDER_CONFIGURATION.md`。

## 已批准产品目标

M2.7 持久化、M2.8 结构化状态、M2.9 可恢复编排、已实现 M2.10 切片及 Review／Plan Artifact 经验构成当前 Council Kernel。D-064 把 Ask the Room 设为窄入口，Review 设为第一个信任 Pack。前向顺序以 `DEVELOPMENT_MILESTONES.md` 为准；历史 M 里程碑继续表达实现／证据状态。不能把 Discuss 当成万能阶段；`MEETING_PROTOCOL_BLUEPRINT.md` 描述已实现行为，不要求所有 Pack 使用同一 phase 顺序。

## 每次结束工作前

代码有变化时保持可构建；说明做了什么、验证了什么、还缺什么和下一项决定。同步更新开发日志、路线图、决策记录和中文版本。不能因为时间或预算用完就把未完成工作标记为完成。
