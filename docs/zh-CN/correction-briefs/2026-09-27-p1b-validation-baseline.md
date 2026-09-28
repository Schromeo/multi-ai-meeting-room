# P1B — 恢复验收基线

状态：本地验收通过，2026-09-27。用户在 P1 后要求继续，执行 DP-0.3 旁的有界
基线修正，不开始 P2，也不代表 DP-0.3 完成。

- 观察：Solo fixture 应 200、实 502；类型检查 41 条错误，均早于 P1。
  保留所有尚未提交的 P1 代码／文档。
- 产物：为选定的 MAMR 测试对象恢复可信的本地 canonical check。
- 基线：Solo 默认上限 1200，mock 内仍断言 1600，异常被当成 provider 错误。
  阶段校验实际返回 ok/value，但类型漏 value/objective；两处 Review 调用
  传入了既有函数忽略的 output profile 参数。
- 最小修正：补齐返回类型，移除无效实参；测试对齐现有档位，将请求断言移到
  mock 外，避免断言错误再次伪装成应用失败。
- 不做：预算／prompt／模型／校验／provider 行为变化、新 schema、重试、
  P2、依赖升级、部署或无关清理。
- 验收：复现失败，覆盖省略／lite／medium／unlimited Solo 档位；
  每请求仅一次模拟调用，返回／usage／隐私正确；typecheck、完整
  pnpm.cmd check、P1 回归和 diff 检查。
- 费用：零真实调用，不读取凭据或修改用户数据。
- 停止：完整门槛通过，或新实质原因需要另作决策。本片不提交／推送／发布。
  更新双语日志／路线图／交接，历史失败证据保留；P2 另片开发。

## 收口 — 本地通过

- 复现基线：`node --test --test-name-pattern='Solo makes' tests/rendered-html.test.mjs`
  退出 1（502 vs 200）；`pnpm.cmd typecheck:generated` 退出 2（41 条诊断）。
- 原因：fetch mock 内断言旧上限 1600，实际默认 1200，断言被 route catch 当成
  provider 错误；阶段返回类型漏已有 value 包装／objective，触发连锁报错；
  Review 第三个实参在运行时本就被忽略。
- 仅修返回类型、移除两个无效 Review 实参，并将旧 Solo 测试改为
  省略／lite／medium／unlimited 四组 fixture（1200/600/1200/12000）。
  请求断言移到 mock 外；每组验证恰好一次请求、输出／usage、返回不含凭据。
- `pnpm.cmd typecheck:generated`：退出 0。
- `node --test --test-name-pattern='Solo|P1' tests/rendered-html.test.mjs`：
  退出 0，5/5（四个 Solo 档位在同一测试中逐一断言）。
- `pnpm.cmd check`：退出 0；worker types、生产构建、68/68 测试、lint、
  typecheck 全部通过，包含此前 P1 改动。
- `git -c safe.directory=C:/Users/spour/OneDrive/Desktop/Multi-AI-MeetingRoom diff --check`：
  退出 0。未跳过测试、压制类型错误或修改依赖。
- 自检未发现引入的阻塞问题；Review 原预算刻意保持不变，本片没有新增其按档位调预算的行为。
- 边界：没有付费调用、浏览器／IndexedDB 验收、远程 CI、提交、推送、发布或部署。
  构建已有的 unknown-route 分类提示仍在，不阻塞检查。本地工程全绿不代表模型
  质量提升或 DP-0.3 完成。
- 决定：下一产品片为 P2，须先确定源头证据契约与门槛；本轮未实现。
  P1 早先失败报告保留为历史，仅“当前检查门槛”由本片结果更新。
