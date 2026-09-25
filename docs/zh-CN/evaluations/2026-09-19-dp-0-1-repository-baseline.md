# DP-0.1 仓库真实性基线

日期：2026-09-19

平台：Windows NT 10.0.26200.0，PowerShell 7.6.5

运行时：Node.js 24.19.0，pnpm 11.19.0

源码基线：DP-0.1 工作区补丁前为干净`main`、`a9a8638`

供应商调用／部署：无

## 已建立仓库政策

- 私有 package 身份：`multi-ai-meeting-room@0.0.0-development`。
- 当前没有 release tag。源码以 Git commit、存在时的 dirty state 与 active DP 里程碑标识；历史 v0.x 标签是开发快照。
- pnpm 11.19.0 与`pnpm-lock.yaml`是唯一 package-management 路径；`package-lock.json`已移除。
- 在`pnpm-workspace.yaml`中显式允许已锁定的`esbuild`、`sharp`、`unrs-resolver`与`workerd`安装脚本；占位许可已删除。
- License 状态为`UNLICENSED`并保留所有权利，不暗示任何开源授权。
- Session BYOK 继续只存在于页面内存。DP-0.6 验证认证、调用／请求限制、rate limit 与滥用防护前，公共部署不得携带工作区付费供应商 key。
- 2026-09-19 对文档所列线上 URL 的未认证只读请求返回 HTTP 401。未查看部署内容版本；较早部署说明只属历史记录，不是已确认当前状态。

## 命令矩阵

| 命令 | 结果 | 证据 |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | **通过** | 锁文件不变；复用 491 个 package；四类明确允许的安装脚本均完成；pnpm 11.19.0 报告`Done` |
| `pnpm build` | **失败** | vinext build 前即停止，因为 Windows `cmd`把`WRANGLER_LOG_PATH=.wrangler/wrangler.log`当作命令：`'WRANGLER_LOG_PATH' is not recognized...` |
| `pnpm test` | **失败** | 标准 test script 先调用`pnpm run build`，在同一 Windows 环境变量问题处停止 |
| `node --test tests/rendered-html.test.mjs tests/review-evaluation.test.mjs` | **失败：62/63 通过** | `source contains real streaming adapters and credential-free structured rooms`无法抽取`updateSeatHandler`；Git 跟踪 LF，但 Windows 工作区为 CRLF，源码正则分隔符要求裸 LF |
| `pnpm lint` | **通过** | ESLint 完成且没有报告 finding |
| `pnpm exec tsc --noEmit --incremental false` | **失败：3 项错误** | `db/index.ts`与`worker/index.ts`缺少`cloudflare:workers`、`Fetcher`和`D1Database` ambient 声明 |
| `git diff --check` | **通过** | DP-0.1 补丁无空白错误 |

第一次非交互 install 还暴露 Codex sandbox 的 store 可见性差异：受限进程选择仓库内 store，无法共享 host 用户 store。最终基线使用普通用户级 pnpm store 与`CI=true`完成；该环境事实不计作产品失败。生成的仓库内`.pnpm-store`已移除并加入 ignore。

## Correction Gate 结果

- **机械：** 仓库身份、单锁文件、固定 package manager、明确安装许可、限制性 license 状态及当前状态扫描通过；上述命令失败可独立复现。
- **语义／Artifact：** meeting、Review、Plan、持久化与供应商行为均未改变。用户产物是真实仓库指引与本命令矩阵。
- **Human Gate：** 不适用；没有批准模型产物或外部动作。
- **体验：** 根入口现说明真实产品方向、支持的 package 路径、已知 Windows 失败与凭证边界；未声明浏览器可用性通过。
- **经济性：** 零供应商调用、零 API 支出、零部署、不升级依赖。线上站点检查为只读，没有改变外部状态。
- **差异化价值：** 未评估。DP-0.1 证明仓库真实性，不证明多模型优于单模型。

## 决定

DP-0.1 完成，因为退出条件是状态真实且可复现，不是工程矩阵全绿。DP-0.2 为当前里程碑，精确负责 Windows script 语法、CRLF-safe 源码测试、Cloudflare ambient 声明与跨环境确定性命令分类。不得把首次使用 UX 或供应商工作混入该纠错。

见[纠错简报](../correction-briefs/2026-09-19-dp-0-1-repository-truth.md)与[决策记录](../DECISIONS.md)中的 D-065。
