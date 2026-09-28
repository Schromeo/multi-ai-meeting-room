# DP-0.2 工程可移植性纠错简报

- **已观察失败：** DP-0.1 Windows 基线有四类可独立复现失败。`dev`／`build`／`start`使用 POSIX-only 行内环境变量，标准 build 与 test 在 vinext 前停止。一项源码检查测试假设裸 LF，但 Git 产生 CRLF Windows 工作区。TypeScript 缺少`cloudflare:workers`、`Fetcher`与`D1Database`的 Cloudflare runtime／module 声明。仓库没有一条统一命令或仓库内 CI 矩阵，来一致分类 install、build、tests、lint 与 types。
- **用户产物：** 一条跨平台仓库验证路径，开发者或 CI runner 无需翻译命令或解释遗留失败即可运行，同时仍真实表明 D1 基础设施未激活且为可选。
- **基线：** Windows NT 10.0.26200.0、Node 24.19.0、pnpm 11.19.0 下，frozen install 与 lint 通过；`pnpm build`和`pnpm test`停在`WRANGLER_LOG_PATH=...`；直接测试 62/63，`updateSeatHandler`因 CRLF 抽取失败；`pnpm exec tsc --noEmit --incremental false`精确报告[DP-0.1 基线](../evaluations/2026-09-19-dp-0-1-repository-baseline.md)中的三项 Cloudflare 声明错误。
- **最小假设：** 仓库自带 vinext 启动器可以跨平台设置日志路径而无需新依赖；换行统一可让源码断言跨平台且不削弱语义检查；Wrangler 生成 runtime types 再加极窄可选 D1 binding augmentation 可准确描述实际配置；一条有顺序的`pnpm check`可由本地与双 OS GitHub Actions 矩阵共用。
- **预期信息增益：** 完整本地检查会说明这四项缺陷是否足以解释 Windows 非全绿矩阵。仓库内 workflow 会明确 CI contract；远程 runner 的实际证据仍须等 workflow 被提交并运行。
- **改动边界：** 新增一个小型 vinext launcher；在 canonical check 开始时，按固定 Wrangler／config compatibility date 重新生成被忽略的 Cloudflare runtime 声明；只补 inactive scaffold 实际需要的可选`DB`类型；在受影响源码测试内统一换行；把`test`与`build`分离；新增`typecheck`、`check`与 worker 类型生成 script；增加 Node 22.13／pnpm 11.19 的 Windows 加 Ubuntu workflow。不改变应用行为、依赖、供应商代码、D1 配置、UI、Review／Plan Artifact 或部署。
- **验收检查：** frozen install 保持不变；Windows checkout 上`pnpm build`、`pnpm test`、`pnpm lint`、`pnpm typecheck`和`pnpm check`全部通过；测试仍为 63/63，不删除也不弱化；worker types 会在 TypeScript 消费前重新生成；CI YAML 可解析并调用完全相同的`pnpm check`；不恢复 npm 命令或第二锁文件；`git diff --check`通过。
- **费用与安全边界：** 零供应商调用、零 API 支出、不新增 package、不升级依赖、不改浏览器记录、不部署、不提供公共凭证、不写外部仓库／账号。生成类型来自已固定的本地 Wrangler package 与已纳入版本控制的配置。
- **停止条件：** 本地矩阵与 workflow contract 清洁后停止。除非存在真实 CI 证据，或里程碑明确记录 CI 待验证，否则不把 DP-0.2 标为 Complete；不借本次可移植性切片开始 DP-0.3 界面工作。
