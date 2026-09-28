# P1 — 精确 Turn Envelope 校验诊断

收口：[验收与边界](../evaluations/2026-09-27-p1-turn-validation-diagnostics.md)。


状态：本地实现已交付；全仓检查仍被基线失败阻塞。用户于 2026-09-27 要求按已采用的 SledTrace P1 计划开发。
这是 DP-0.3 旁的一次有界修正，不另起产品路线，也不代表完成 DP-0/Plan。

- 已观察失败：MAMR 四次真实调用后因格式校验暂停；statement/card 合并错误不能定位字段。
  历史无效输出不可用，不推测具体原因，不重跑会议。
- 用户产物：现有错误界面与历史记录显示字段级原因，不泄露原文或私密字段名。
- 基线：parseTurnEnvelope 返回粗粒度字符串，agent.format_error.message 已流入
  transcript.formatError 和保存记录。
- 最小假设：只在原字符串追加有版本的原因码、固定字段路径、类型/长度摘要；
  保留原消息前缀、接受/拒绝语义、事件结构、持久化 schema、prompt 和请求行为。
- 信息增益：区分缺失、类型、空值、超长、结构错误；无需付费调用，不能重建旧失败。
- 验收：离线边界/隐私样本、合法归一化不变、路由错误/用量/无重试、历史记录读回、
  现有显示链路、build/type/lint 和全套测试的真实限制。
- 费用边界：零供应商调用，不读密钥，不改用户数据，不部署、commit/push/release。
- 停止：安全诊断传到原错误/记录路径即收口；不开始 P2 原生采集、bundle 导入、
  公共事件字段扩展、自动修复或放松校验，不改 prompt/model。

收口时同步双语 Devlog/Roadmap/Handoff，持久选择记录于 Decisions。
