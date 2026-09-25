# DP-0.3 本地入口／Solo 切片

日期：2026-09-24
状态：本地实现与模拟供应商验证；DP-0.3 仍为 Current

- 新 session 先展示 Chat、Ask the Room、Drop an Artifact、Browse Packs，再进入既有 Seat 编排。Chat 是默认界面，session-only Connection 管理入口明确，Setup 弹窗不再自动盖住首屏。Ask the Room 目前进入既有双／三 Seat Decide room，尚非后续 Quick Council 运行时。Browse Packs 只列出当前已有的 Review 与 Decide/Plan。
- Solo 使用一个 session BYOK Connection、选定模型、最多 12 条／24,000 字符上下文、一次最多 1,600 输出 token 的供应商请求；无自动重试，不写会议历史。API 拒绝此路径使用 workspace 出资凭据。切换 Connection 会清空页面内对话，避免把上下文带给另一供应商。
- Review 与 Decide 在入口／任务模式切换时各自保留 Objective 草稿。新 session 不再预填 Review 测试文字。既有存档恢复仍设置原模式和精确 Objective；这目前是源码证据，尚未完成旧记录浏览器回放。
- 本地 `pnpm check` 通过：构建、65 项测试（含 Solo 参数边界与一次模拟供应商调用）、lint 和类型检查。`git diff --check` 通过。本切片没有真实供应商调用、凭据、部署或远程写入。
- 本地 `pnpm dev` 浏览器检查：四入口与 Solo 输入可见且无 Setup 遮罩；Decide 草稿切换 Review 再返回仍保留；390px 宽度四入口均可见，文档宽度等于视口。这是有限的布局／状态验证，不是可用性研究或 Solo 真实质量结果。
- 另行检查本地 `pnpm start` 时，HTML 正常返回，但生成的 `/assets/*.css` 路径为 404，页面失去样式；相同 CSS 在 `pnpm dev` 中正常载入。生产启动资源问题尚未解决，不能算作生产视觉验收通过。

DP-0.3 剩余 Gate：在浏览器重开既有 Review／Plan 记录、完整桌面交互检查、解决或明确归类生产 CSS 问题，以及如果里程碑要求则另获授权进行一次真实供应商 Solo 可用性检查。模拟调用不能证明 Quick Council 复用或模型质量价值。
