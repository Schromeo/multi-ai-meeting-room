# DP-0.2 本地工程可移植性验证

日期：2026-09-19

平台：Windows NT 10.0.26200.0，PowerShell 7.6.5

运行时：Node.js 24.19.0、pnpm 11.19.0、Wrangler 4.92.0

源码基线：提交基线`a9a8638`上的 DP-0.1 工作区

供应商调用／部署：无

## 已实现边界

- `scripts/run-vinext.mjs`解析已固定的 ESM vinext CLI，并通过`child_process`环境数据设置`WRANGLER_LOG_PATH`，不使用 shell 语法。`dev`、`build`与`start`共用该启动器，不新增`cross-env`或其他 package。
- 受影响的源码检查测试会在执行原有语义断言前，把读取的页面源码统一成 LF。没有删除断言或测试案例。
- 已固定 Wrangler 会在每次 canonical check 开始时，按`wrangler.jsonc`及其 2026-08-04 compatibility date 重新生成被忽略的`worker-configuration.d.ts`。`cloudflare-env.d.ts`只补 inactive、optional 的`DB` binding；`worker/index.ts`也把该 binding 描述为可选，不假装 D1 已配置。
- 准确的 Cloudflare `Response.json(): unknown`类型暴露一处未声明的 Plan amendment 响应。客户端现声明该响应边界，并在合并前收窄可选 usage；运行时解析与行为不变。
- Package script 现把`test`与`build`分离，加入可在 clean clone 独立运行的`typecheck`、确定性 worker 类型生成及唯一有序`pnpm check`契约。公开 type-check 命令会重新生成声明；canonical check 只生成一次，再调用内部 compiler step。
- `.github/workflows/ci.yml`为`ubuntu-latest`与`windows-latest`定义 Node 22.13.0、pnpm 11.19.0 job；两者都执行 frozen install 与相同`pnpm check`。

## 本地命令矩阵

| 命令 | 结果 | 证据 |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | **通过** | lockfile 已为当前；pnpm 11.19.0 在 283 ms 完成 |
| `pnpm worker:types` | **通过** | 固定 Wrangler 按已纳入版本控制的配置重新生成`worker-configuration.d.ts` |
| `pnpm build` | **通过** | vinext 五个环境全部构建；输出`/`、`/api/connections/models`与`/api/discuss` |
| `pnpm test` | **通过：63/63** | 零失败、跳过、取消或 todo；原 CRLF 抽取失败现通过 |
| `pnpm lint` | **通过** | 零错误零警告；被忽略的生成 declaration 不作为手写 lint 输入，并由重新生成加 TypeScript 验证 |
| `pnpm typecheck` | **通过** | 重新生成被忽略的 worker 声明后，TypeScript 零错误，覆盖显式 Plan amendment 响应边界 |
| `pnpm check` | **通过** | generation／build／test／lint／type 的完整有序契约一次调用成功完成 |
| CI workflow 解析 | **本地通过** | 既有锁定`js-yaml` 4.3.1 成功解析；矩阵精确为 Ubuntu 加 Windows，命令为 frozen install 加`pnpm check` |
| `git diff --check` | **通过** | 合并 DP-0.1／DP-0.2 补丁没有空白错误 |

Wrangler 提示存在新版本。本切片刻意不安装：目标是在固定依赖图上修复可移植性，不把工具升级混入基线。

## Correction Gate 结果

- **机械：** DP-0.1 的四类失败在当前 Windows checkout 全部通过；被忽略的声明会确定性重建，并立即由 TypeScript 消费；统一命令通过。
- **语义／Artifact：** 没有改变供应商 prompt、meeting protocol、Review／Plan contract 或持久化 Artifact 行为。唯一应用源码变化是由准确平台类型暴露的显式 HTTP 响应类型边界。
- **Human Gate：** 不适用；没有批准模型 Artifact 或外部 mutation。
- **体验：** 开发者现有一条命令，不再解释平台差异。未声明浏览器或首次使用产品体验通过。
- **经济性：** 零供应商调用、零 API 支出、不新增／升级依赖、不部署、不写外部仓库／账号。
- **差异化价值：** 未评估；本轮是工程复现性切片。

## 剩余 Gate

CI contract 已加入仓库并在本地解析，但尚未在 GitHub 运行。DP-0.2 继续为**当前——本地通过、CI 待运行**。完成条件是 Windows 与 Ubuntu job 首次同时通过同一`pnpm check`；若存在 runner 差异，只允许一次有界修复。不能凭本地证据开始 DP-0.3。

见[纠错简报](../correction-briefs/2026-09-19-dp-0-2-engineering-portability.md)与[决策记录](../DECISIONS.md)中的 D-066。
