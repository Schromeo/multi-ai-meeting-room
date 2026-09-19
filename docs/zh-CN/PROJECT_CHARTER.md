# 项目章程

## 使命

打造一个由人主持、可以审计的多 AI 协作空间，让模型之间的差异转化为更好的决定，并在得到明确授权后转化为经过验证的行动。

产品需要清晰展示：

> 目标 → 主张 → 证据 → 异议 → 修订 → 决定 → 行动 → 结果

真正的价值不是聊天数量，而是一个可以追溯其推理、分歧、批准与验证过程的结果。

## 三种权限

- **Discuss**：提出方案、批判、修订与总结。
- **Research**：在 Discuss 上增加检索、引用和事实核查。
- **Execute**：在 Research 上增加经过授权的工具与编码代理。

它们是同一个产品的权限等级，不是三个产品。

## 任务模式

Review、Decide / Plan、Explore、Create 和未来 Play Pack 定义要完成的工作，并与权限等级分离。例如 Review 可以运行在 Discuss 或 Research；Execute 增加权限，但不会变成另一个产品。

交互深度从 Solo 逐步进入 Quick Council／**Ask the Room**、Deep Council 和任务形 Pack。各产品线继续以有限纵向 Task Pack 生长在共享核心上。[产品方向](PRODUCT_DIRECTION.md)定义已批准策略，[详细开发里程碑](DEVELOPMENT_MILESTONES.md)决定当前开发顺序。

## 不可偏离的原则

1. 人类始终是主持人与最终负责人。
2. 角色与模型供应商分离。
3. 需要多样性时，先独立回答，再互相审阅。
4. 分歧必须被解决、否决或明确保留，不能被总结偷偷抹掉。
5. 多模型共识不能代替证据。
6. 每一轮必须改变产物、解决分歧或停止。
7. 工具采用最小权限，关键动作必须批准。
8. 用质量、时间、成本和人工投入与强单模型基线比较。
9. 共享抽象必须由产品证据驱动；没有明确纵向用例，不扩建基础设施。

## 当前重点

已实现基础包括真实供应商 adapter、会话 BYOK、可组合 Seat、有限 streaming、cross-review、Human Gate、usage 估算、不保存凭证的 IndexedDB Event Store、严格 Turn Envelope、确定性 Canonical Meeting State、可恢复编排、预算、中断恢复、Observer、定向 Dispute 回合、Review Artifact 版本，以及结构化 Plan 路径。Review 与 Plan 证据仍不完整并继续保留。根据 D-064，当前前向工作是 DP-0 产品真实性与第一分钟体验，随后是 Quick Council／Ask the Room 和有限 Review 证据。没有命名 Pack 证明需求前，通用编排扩建继续暂停。

## 第一阶段不做

无限自治、模型与工具市场、计费、企业管理、广泛多人协作，以及在会议协议尚未验证前建设通用自动化。

## 系统边界

网页是控制面，负责会议、权限、批准与审计。代码和其他高权限执行放在独立的本地连接器或隔离云环境中。

## 成功标准

当用户会为普通或有趣工作反复主动选择独立 AI 视角，并且有后果的 Task Pack 能在可接受成本、延迟和人工投入下产生强单模型遗漏、且最终被接受的重要改进时，项目才算成功。Research、Play、Project Room 与 Execute 只有在各自验证证明必要时才增加专属状态、工具或权限。
