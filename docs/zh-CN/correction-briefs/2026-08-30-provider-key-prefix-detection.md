# API Key 供应商前缀识别纠错简报

- **已观察失败：** 当前以`AQ.`开头的Gemini授权型key会保持“未知”，因为Setup只识别较旧的`AIza`标准key前缀。即使格式已知，用户仍必须手动选择Google Gemini。
- **用户产物：** Connection Setup应对当前已支持且高置信的key前缀给出本地供应商提示，同时让所有未知格式继续由用户明确手选。
- **最小假设：** 为三家已支持供应商建立有顺序、纯函数、可离线测试的前缀规则即可。Anthropic与OpenAI都使用`sk-`族，因此必须先判Anthropic；Gemini同时识别`AIza`与`AQ.`；未知格式保持未决。
- **改动边界：** 把前缀推断从页面抽到一个纯模块，增加Gemini `AQ.`识别，保留现有Anthropic与OpenAI形式，并补离线回归测试。不添加尚未支持的供应商，也不从模型名称猜供应商。
- **验收：** `AQ.`和`AIza`映射到Gemini；`sk-ant-`优先于通用`sk-`并映射Anthropic；已支持的OpenAI形式映射OpenAI；忽略首尾空白；未知格式与错误大小写保持`null`；推断不明确时，Setup仍必须先由用户手选供应商才会发起验证。
- **安全、费用与停止边界：** 识别只读取本地前缀，绝不把key发送到任何地方。验证仍只调用用户明确选择或本地推断出的唯一供应商；不跨供应商试探、不重试、不调用真实模型、不持久化凭证。离线build、测试、lint、类型检查和双语文档完成即停止。
- **当前来源依据：** Google在[Gemini API key文档](https://ai.google.dev/gemini-api/docs/api-key)中说明正从标准key迁移到授权key；[Google AI Developers Forum回复](https://discuss.ai.google.dev/t/api-key-to-start-with-aiza/169453)把新的授权key家族标为`AQ`，当前示例使用`AQ.`。前缀不是稳定协议，只是实现提示，供应商变化时必须及时修订。
