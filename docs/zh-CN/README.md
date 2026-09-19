# 中文项目文档

这些文件用于快速了解项目，并防止后续开发忘记初衷、重复工作或进入无限循环。

当前执行入口：[详细开发里程碑](DEVELOPMENT_MILESTONES.md)中的 DP-0.1“产品与仓库真实性基线”。[Plan 问题清单](PLAN_ISSUE_REGISTER.md)继续作为 DP-2 的保留证据，但不属于立即构建队列。

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
