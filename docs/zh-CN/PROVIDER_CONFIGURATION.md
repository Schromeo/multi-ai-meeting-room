# 模型供应商配置

M2 至少需要两个供应商。所有密钥都只能作为服务端 secret 保存，不能提交到仓库或返回浏览器。

| 供应商 | Secret 名称 | 默认模型 |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | `gpt-5.6-luna` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-5` |
| Google | `GEMINI_API_KEY` | `gemini-3.6-flash` |

可以使用 `OPENAI_MODEL`、`ANTHROPIC_MODEL`、`GEMINI_MODEL` 替换默认模型，不影响角色配置。

成本估算使用各供应商返回的输入/输出 token，并读取对应的 `*_INPUT_USD_PER_MTOK` 与 `*_OUTPUT_USD_PER_MTOK`。价格或模型变化后需要更新；该数字只是估算，不是账单。

本地开发从 `.env.example` 复制名称到被忽略的 `.env.local`。线上值通过 Sites 环境配置保存，API Key 必须标记为 secret，修改后需要重新部署。

第一次真实评测建议只配置两个供应商，先保存单模型基线，再完成一次不追加修订的提案、交叉审阅和 memo，记录延迟、估算成本、有价值的异议、未支持主张和人工偏好。
