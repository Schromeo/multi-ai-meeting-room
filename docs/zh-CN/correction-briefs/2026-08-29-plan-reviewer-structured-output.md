# Plan Reviewer 结构化输出纠错简报

- **已观察失败：** Live 014 保留了一份完整且合法的 12 天 Sol Plan；随后 Fable 完成独立审阅请求，但返回文本未通过精确 JSON 解析。审阅被原子拒收，且没有自动重试。
- **用户产物：** 已归档的 Live 014 Plan 是本轮纠错不可变的来源产物。修复 Reviewer 传输可靠性期间，不得重新生成、修改或替换它。
- **最小假设：** 眼前失败点是 Reviewer 输出契约，而不是 Fable 没有提出有用批评。受支持的 Anthropic 模型可以在生成时由 JSON Schema 约束，本地解析继续负责任务特定限制。
- **改动边界：** 仅当调用方明确提供 schema 且 Anthropic 模型受支持时，启用供应商原生结构化输出。初始 Plan Reviewer 提供 Plan 审阅 schema。Builder prompt、模型安排、思考策略、输出上限、修改/复核行为、供应商数量与不自动重试政策均不改变。
- **兼容边界：** Anthropic 明确支持 Fable 5 结构化输出。不受支持的 Anthropic 模型 ID 不发送新字段。OpenAI 和 Gemini 请求体保持不变。不添加 `thinking` 字段，保留供应商默认/自适应思考。
- **校验边界：** JSON Schema 约束对象形状、必填字段、枚举和未知属性。现有本地 `parsePlanReview` 继续对日期范围、文本长度、concern 数量和 assumption 数量拥有最终决定权。严格传输归一化可接受仅含一个完整 `json` Markdown 围栏且外围只有空白的响应，但拒绝说明文字夹带 JSON。
- **验收：** 离线测试证明 Fable 请求包含 `output_config.format.type = json_schema`，schema 不使用供应商不支持的数值/字符串范围关键字，不受支持的 Anthropic 模型省略该字段，其他供应商请求体不变，单独围栏对象可接受，说明文字包裹会拒绝，语义不合法审阅仍会失败，完整保存 Plan 只触发一次 Reviewer 调用。
- **费用与停止边界：** 本轮零真实供应商调用。构建、离线测试、lint、类型检查与文档完成后即停止。针对已保存 Plan 的 Reviewer-only 真实验证必须另行明确授权，且仍不允许自动重试。

## 来源

- [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Anthropic Messages API](https://platform.claude.com/docs/en/api/http/messages)
