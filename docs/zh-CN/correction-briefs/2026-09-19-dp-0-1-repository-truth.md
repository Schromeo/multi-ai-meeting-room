# DP-0.1 产品与仓库真实性纠错简报

- **已观察失败：** 已提交仓库仍以`site-creator-vinext-starter`作为 package 名并标记为`0.1.0`，同时跟踪 npm 与 pnpm 两份锁文件；工作区实际以 pnpm 组织，但根 README 只给 npm 命令。README 仍把本地状态写成 v0.10c，并把 Review 当作下一切片；Roadmap 与 Handoff 又把已经提交的工作描述为未提交工作区。仓库没有声明 license 状态。当前验证结论散落在多份文档中，没有一组可复现命令基线。
- **用户产物：** 用户从根 README 与 canonical 项目文档即可理解仓库名称、开发版本政策、唯一 package-manager 政策、license 状态、当前里程碑、凭证边界和精确本地验证状态，无需重建项目历史。
- **基线：** 本 Brief 前，`main`的 HEAD 为`a9a8638`，没有 tag，工作区干净。`package.json`虽为 private，但仍使用 starter 名称和`0.1.0`；`package-lock.json`与`pnpm-lock.yaml`同时跟踪；存在`pnpm-workspace.yaml`；没有跟踪`LICENSE*`文件。README 声称 v0.10c 并使用 npm 命令。DP-0.1 是唯一 Current 前向里程碑。最近记录称 build、63 项测试与 lint 通过，仍有三项 Cloudflare ambient 类型错误，但必须在当前 checkout 重新运行确认。
- **最小假设：** 只修改仓库元数据与当前状态文档，选定 pnpm 为唯一 package manager，明确代码为 private 且未授权开源，并记录一份新的命令矩阵，就能消除错误项目状态，而不改变运行时行为或历史证据。
- **预期信息增益：** 新的 install、build、test、lint 与 type-check 结果会区分当前可复现事实和沿用说法，也会显示 DP-0.2 是否应先处理 package script 可移植性或类型环境。无需调用任何模型／供应商。
- **改动边界：** package 更名为`multi-ai-meeting-room`；在所有者创建带 tag 的 release 前使用非发布开发版本；写明精确`packageManager`；pnpm 成为唯一当前 package-manager 路径；移除 npm 锁文件；声明`UNLICENSED`／保留所有权利而不擅自选择开源 license；更新当前 README、metadata、Roadmap、Handoff、里程碑状态、Decisions、Devlog 及中文镜像。历史评估报告及其中原有命令／版本标签保持不变。
- **验收检查：** 当前文件不再出现 starter 身份，也不再把已提交工作称为未提交；根目录设置只使用 pnpm；只保留一份 canonical 锁文件；明确未授予开源许可；当前源码以里程碑和 commit 标识，不捏造 release；凭证说明明确 session BYOK 是临时的，DP-0.6 前公共部署不得暴露工作区付费 key；重新运行`pnpm install --frozen-lockfile`、build、tests、lint、type check 和`git diff --check`并记录精确结果。
- **费用边界：** 零供应商调用、零 API 支出、不修改浏览器记录、不部署、不升级依赖、不改外部账号或服务。运行时行为、Review／Plan 产物与历史评估证据保持不变。
- **停止条件：** 完成最小真实性补丁和命令基线后停止。本切片不修 Cloudflare 类型、跨平台 shell 语法、首次使用 UX、公共 API 强制策略或历史 Artifact。license 授权或 release 号需要所有者意图时，记录限制性／未发布状态，不自行猜测。
