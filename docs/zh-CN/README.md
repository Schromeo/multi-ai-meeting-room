# 中文项目文档

这些文件用于快速了解项目，并防止后续开发忘记初衷、重复工作或进入无限循环。

当前执行入口：[详细开发里程碑](DEVELOPMENT_MILESTONES.md)中的 DP-0.3“首次使用信息架构”。DP-0.0 至 DP-0.2 已完成；DP-0.3 当前聚焦 Chat、Ask the Room、Drop an Artifact、Browse Packs 入口，以及一键启动和首次运行信息真实性。[Plan 问题清单](PLAN_ISSUE_REGISTER.md)继续作为 DP-2 的保留证据，但不属于立即构建队列。

仓库政策：当前是私有、未授权开源的预发布开发版本。当前源码以 commit 和 active DP 里程碑标识；历史`v0.x`标签是开发快照，不是 package release。唯一支持的 package-management 路径是 pnpm 11.19.0 与`pnpm-lock.yaml`。在 DP-0.6 验证访问与滥用防护前，公共部署不得暴露由工作区付费的供应商凭证。

建议阅读顺序：

1. [项目章程](PROJECT_CHARTER.md)：为什么做，以及不能偏离什么。
2. [产品方向定稿](PRODUCT_DIRECTION.md)：产品线策略、第一条纵向切片、多 Agent 边界和方向校正。
3. [产品开发计划](PRODUCT_DEVELOPMENT_PLAN.md)：已批准的 Multi-AI 宽产品方向与 Ask the Room 窄入口。
4. [详细开发里程碑](DEVELOPMENT_MILESTONES.md)：canonical DP-0 到 DP-9 阶段、子里程碑、依赖、验收、预算和停止规则。
5. [开发校正循环](DEVELOPMENT_CORRECTION_LOOP.md)：每次实现、评测和里程碑收尾必须执行的方向 Gate。
6. [AI 交接](AI_HANDOFF.md)：当前状态、下一步和代理工作规则。
7. [决策记录](DECISIONS.md)：已经拍板的事项和原因。
8. [路线图](ROADMAP.md)：当前状态以及历史实现／证据账本。
9. [会议协议蓝图](MEETING_PROTOCOL_BLUEPRINT.md)：已批准的 Discuss 会议状态、编排、预算、持久化和追问设计。
10. [模型与代理蓝图](MODEL_AND_AGENT_BLUEPRINT.md)：连接、模型、角色、技能、席位和有限适应。
11. [开发日志](DEVLOG.md)：已经完成的工作、验证和限制。
12. [模型配置](PROVIDER_CONFIGURATION.md)：密钥名称、默认模型和成本估算。
13. [v0.6 真实基线 001](evaluations/2026-08-04-v0.6-live-baseline.md)：第一次真实 OpenAI + Anthropic 协议证据。

当前评测入口：[M2.12 Review 对照包](evaluations/M2.12_REVIEW_COMPARISON.md)，包含三个固定案例、离线输入导出和仍未运行的基线台账。

英文文档是冲突时的基准版本，但任何重要修改都必须同时更新中文版本。里程碑没有更新日志和状态，就不算完成。

## 本地开发与一键启动

唯一支持的包管理器是 pnpm 11.19.0，Node.js 需要 22.13+。首次安装后，Windows 用户可以双击仓库根目录的 `start-meeting-room.cmd`。它会切换到仓库目录，仅在 `node_modules` 缺失时执行锁定安装，在 3000 端口启动开发服务器，等待 HTTP 服务正常后打开 `http://localhost:3000`。

VS Code 用户可以通过 **Terminal > Run Task** 运行 `Start Meeting Room`；命令行等价入口是 `pnpm launch`。停止任务请使用终端的停止控制；如果 3000 端口已经有服务，不要重复启动第二个 launcher。完整检查使用 `pnpm check`，准确结果与已知测试限制见最新[开发日志](DEVLOG.md)。
