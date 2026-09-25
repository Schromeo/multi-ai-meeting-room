# DP-0.3 首次使用入口纠错简报

日期：2026-09-24
状态：当前；首个本地入口／Solo 切片已实现，里程碑验收尚未完成
原 UI 备份：本地分支`backup/dp-0-3-pre-ui-2026-09-24`，指向`97b865a`

- **已观察失败：** 源码层的新 session fixture 默认打开 Review 和 Review 专用 Objective；顶部是 Setup → Agenda → Meeting → Decision，Agenda 只有 Review 与 Decide / Plan。每种模式的`canStart`都要求至少两个已就绪 Seat。切换这两种模式只改变`taskMode`，仍沿用上一模式的 Objective。见[首次使用基线](../evaluations/2026-09-24-dp-0-3-first-run-baseline.md)。
- **用户产物：** 第一屏清楚提供 Chat、Ask the Room、Drop an Artifact、Browse Packs 入口；一个可用 Connection 可以开始 Solo 对话；各模式使用自己的 Objective 草稿，不继承其他模式的任务文字。既有 Review 与 Plan 记录仍可读取。
- **基线：** 提交`97b865a`已有可用的有界多 Seat Review／Decide room 与 session Connections，但没有 Solo protocol 或四入口。当前界面与状态路径是源码 fixture，尚非新用户走查或浏览器无障碍通过的证据。
- **最小假设：** 先于 room composer 选择用户意图、隔离模式草稿，并加入有界单 Connection Solo 路径，可让初次使用者无需先理解 Seats 就到达有用输入。既有多 Seat 协议继续用于深度工作。
- **预期信息增益：** 本地流程与浏览器检查会说明第一屏困惑和 Objective 串用是否来自当前入口与共享状态。验证布局、路由、状态隔离及禁止调用边界不需要供应商调用。Solo 实际价值与 Quick Council 重复使用属于后续证据 Gate。
- **验收检查：** 全新入口真实展示四条命名路径及其可用状态；Chat 用一个 Connection 到达 Solo 输入；只有 Council 或既有多 Seat Pack 才要求第二个 Seat；模式切换恢复该模式自己的草稿，不携带其他模式 Objective；既有 Review／Plan 保存房间重新打开时保留原 Objective；build、既有 63 项及定向状态／流程测试、lint、type check、桌面／移动端第一屏检查和`git diff --check`通过。不可用入口不得伪装成可用操作。
- **费用与安全边界：** 开发和验证期间零付费模型调用、零部署、不新增供应商、不持久化凭证、不作大范围视觉重设计、不建通用 Pack runtime、不自动发起 Council。保留 session BYOK 与房间历史。前端改动前为原 UI 提交建立命名且可恢复的备份。
- **停止条件：** 若首个切片无法在不改既有 Review／Plan 持久化或供应商安全边界的情况下提供 Solo，则停在基线并重定切片。不能只凭源码测试宣称 DP-0.3 完成；必须有第一屏浏览器检查与模式切换验证。
