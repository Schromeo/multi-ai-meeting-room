# P2 — 源头调用证据

状态：本地已验收；未提交／推送。2026-09-27 用户明确批准 SledTrace CURRENT_TASK 中的新增事件／
本地记录契约。保留 P1/P1B 全部改动。

- 失败：普通失败调用可能丢失已上报 usage 与源头时序；历史时间代表保存时间。
- 产物：runAgent 普通会议调用的可查看开始／结束记录；provider 终止与
  Turn Envelope 校验分开。后续任务／reducer 拒绝仍由原事件说明，不冒充任务成功。
- 复用：已有 ID、provider 元数据解析、本地事件存储／历史；不套用 Plan 专用字段。
- 范围：严格版本化元数据、可空上报用量、单调耗时、可选历史集合、
  source.attempt 事件；兼容旧记录。
- 隐私：固定字段／原因码，不增加 prompt、原始回答、异常原文、密钥／header、
  Connection 名称或私有思维记录；随房间删除。
- 验收：离线成功／拒绝／不完整／错误／取消／未知和部分用量；生命周期顺序、
  去重／冲突、持久化读回／旧记录、秘密 fixture、可查看展示、pnpm.cmd check。
- 不做：Plan／Observer／Solo／Review-work 采集、行为／预算／prompt 变更、
  SledTrace 导入、新报警、重试、真实调用、发布或推送。
- 停止：源头边界验证并记录局限；断连可能丢终态，started 不证明 provider 已计费，
  不声称服务端持久执行或精确一次计费。

## 本地验收 — 2026-09-27

- 工程：最终 `pnpm.cmd check` 退出 0，71/71，构建／lint／类型检查通过。
  mock 路由执行覆盖 OpenAI／Anthropic／Gemini；Gemini 后续无 usage 的事件
  不得抹掉已上报可见输出。只有真实上报才记零，不从文本推算 reasoning。
- 存储：真实浏览器 IndexedDB 的读回、重复保存去重、冲突事务回滚、
  旧记录兼容、未决开始、删除及复用房间 ID 均通过。JSON 字段顺序不造成假冲突，
  无数据库版本变更。
- 产物／体验：真实 SourceAttemptView 展示读回的合成记录；provider 完成与
  invalid_type at card 分开展示，缺终态显示未知。这是隔离组件／存储验收，
  不是真实完整会议。运行 `node scripts/preview-source-attempt.mjs`，
  打开 `http://127.0.0.1:4398` 点击 Run storage acceptance 可复核；结束删除夹具房间。
- 语义／任务质量：未评估，不做自动修复或质量声明。回执仅覆盖 Turn Envelope；
  下游任务合同、reducer、Human Gate 不被标成通过。
- Human Gate／采用：未评估。经济性：零付费调用；未测账单准确性或阅读负担。
  跨模型审阅优势：未评估。交付是更好的失败证据，不是更好的模型答案。
- 自检：有界范围内无剩余阻塞项。定时超时分支、真实 provider stream、
  断连竞争及完整会议页面／刷新未验证；父级取消和缺终态已覆盖。
- 方向：P2 本地收口；下一候选为 P3 导出／隐私／原子导入设计，未启动。
  未提交／推送／发布／部署。

## 保存契约和限制

`SourceAttempt` v1 使用 `mamr-turn-v1` 和 `turn-envelope/v1`，
记录应用 request／turn／attempt／seat ID、配置 provider／model、phase／round／
输出上限、源头墙钟时间及单调耗时；调用／provider 结束／校验相互独立。
用量含 value 与 reported／unknown 来源；Gemini 可见输出和 thought 分列，
其他 provider 的输出可能已含 reasoning，不能盲目相加。不声明费用或实际服务模型。

`source.attempt` 新增开始／终态传输事件，`MeetingRecord.sourceAttempts`
为可选集合，上限 1,024 条。本地事件身份为 room + attempt + lifecycle；
相同保存去重，冲突使事务回滚。旧缺失不补造；允许只有终态而不虚构开始。
达上限显示证据错误，不触发 provider 重试。旧超时策略和用量总计保持不变。

浏览器接到回执后保存，不是服务端持久审计。started 代表应用发起，
不确认 provider 接收或计费；丢终态保持未决。固定码／路径不新增原输入、
回答、任意异常、Connection 标签、header 或私有思维。配置标识有界，
但不是未来任意导出的通用脱敏器；P3 仍需 opt-in 白名单和隐私检查。
