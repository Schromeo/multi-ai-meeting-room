# PLAN-03 推理与产物空间纠错简报

- **已观察失败：** 续接011的Builder上限为9,600 token，没有接受新天数。历史结束/用量没有保存，所以“耗尽”只是猜测，不能追溯成事实。新离线诊断能够表达OpenAI把整个上限用于推理、没有可见正文的响应。
- **用户产物：** 所有请求天数的合法JSONL，再由独立席位审阅实际完整Plan。
- **基线：** 当前已识别GPT-5的Plan Builder、Reviewer、修改、复核均用medium；Anthropic和Gemini保持供应商默认。既有讨论及归档六天不改。
- **最小假设：** 结构化Builder需要规划，但不应与实际产物判断使用同样深度。只把OpenAI Builder调为low，Reviewer/Editor/Recheck继续medium；其他输出上限和供应商默认不变。
- **信息增益：** 在实际reasoning/可见用量及结束状态旁保存“请求的推理档位”。下一次获准的单阶段Builder验证可在不改模型、prompt契约、天数或输出上限时，区分low仍截断与完整交付。
- **验收：** 实际mock OpenAI Builder payload为low，Reviewer/修改为medium；已识别GPT-5普通讨论仍minimal。Anthropic/Gemini不发送不兼容thinking参数并记录provider default。Plan尝试/历史兼容旧记录、拒绝未知档位。界面分开显示请求档位和实际报告reasoning token。输出限制、JSON错误、部分天数行为不变。
- **费用与停止：** 零真实调用，不改输出上限/模型/供应商/轮数，不自动重试，不迁移010/011。构建、回归、lint后停止。这里只能标本地修复；真实完整交付及教学质量仍待单独授权证据。

## 收尾

已实现本地分阶段配置及请求档位诊断。构建、59项离线测试、lint通过；完整类型检查仍仅三项既有Cloudflare worker声明错误。本地HTTP返回200。无真实调用、浏览器操作或部署。PLAN-03继续处理中；下一步是上述一次获准Builder阶段证据，不再扩代码。
