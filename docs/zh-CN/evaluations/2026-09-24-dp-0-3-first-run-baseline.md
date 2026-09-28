# DP-0.3 首次使用源码基线

日期：2026-09-24
源码提交：草稿 PR #1 中的`97b865a`
方法：只读源码与状态路径检查；没有浏览器 session 或供应商请求

| 新用户 fixture | 当前可观察源码路径 | 结果 |
| --- | --- | --- |
| 打开空 session | `taskMode`初始化为`review`，`objective`初始化为 Review 指令，顶部从 Setup 开始 | 用户尚未选择意图，第一屏就预设专业审阅任务。 |
| 寻找日常回答 | Agenda 只有 Review 与 Decide / Plan；room composer 与 Seat 控件占据首个任务面 | 没有 Chat／Solo 入口或单 Connection 直接回答路径。 |
| 添加一个可用 Connection | 两种模式的`canStart`均要求`seats.length >= 2`；callout 要求两个模型 Seat | 单 Seat 无法开始最简单的交互。一个 Connection 虽可复用于两个 Seat，仍是双 Seat room。 |
| 在 Review ↔ Decide / Plan 间切换 | 两个按钮都只调用`setTaskMode`；单个`objective`状态不变 | Review Objective 可出现在 Decide / Plan 中，反向亦然。 |
| 新建 Meeting | `createNewMeeting`清空 Objective 并重设为 Review | 新任务回到 Review-first 界面。 |
| 重开保存的工作 | `restoreMeeting`从记录设置保存的 Objective 与模式 | 纠错时必须保留既有房间的准确 Objective。 |

尚未测量新用户理解、键盘路径、窄屏布局、Solo 模型回答或 Ask the Room 重复使用。这些是验收目标，并非基线通过。下一步是[纠错简报](../correction-briefs/2026-09-24-dp-0-3-first-run-entry.md)、命名的原 UI 备份及一个有界入口／Solo 切片。
