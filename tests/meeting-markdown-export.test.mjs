import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ts from "typescript";

const source = await readFile(new URL("../lib/meeting-markdown-export.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { serializeMeetingMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const record = {
  id: "room-1", taskMode: "decide", objective: "中文议程", stage: "decision", decision: "approved",
  createdAt: "2026-09-27T12:00:00.000Z", updatedAt: "2026-09-27T12:01:00.000Z", iteration: 1,
  participants: [{ provider: "openai", providerName: "OpenAI", model: "gpt-fixture", role: "strategist" }],
  transcript: [
    { id: "agenda", provider: "host", providerName: "Human Chair", role: "host", model: "", phase: "agenda", status: "done", text: "中文议程" },
    { id: "turn-1", seatId: "seat-1", round: 1, provider: "openai", providerName: "OpenAI", role: "strategist", model: "gpt-fixture", phase: "proposal", status: "done", text: "# 提议\n\n| A | B |\n| - | - |\n| 1 | 2 |", usage: { inputTokens: 10, outputTokens: 20, latencyMs: 3500, estimatedUsd: 0.0123 } },
    { id: "turn-2", seatId: "seat-1", round: 1, provider: "openai", providerName: "OpenAI", role: "strategist", model: "gpt-fixture", phase: "review", status: "error", text: "SECRET_EXCEPTION", formatError: "SECRET_EXCEPTION" },
  ],
  memo: "# 最终建议\n\n保留争议。", usage: { inputTokens: 20, outputTokens: 25, latencyMs: 4000, estimatedUsd: 0.02 },
  protocolState: { status: "complete" }, apiKey: "SECRET_API_KEY", prompt: "SECRET_PROMPT",
};
const events = [
  { type: "chair.directive", createdAt: "2026-09-27T12:00:12.000Z", payload: { id: "d-1", kind: "correction", target: "all", text: "请改方向", status: "active", createdAfterMessageId: "turn-1" } },
  { type: "chair.directive", createdAt: "2026-09-27T12:00:15.000Z", payload: { id: "d-2", kind: "constraint", target: ["seat-1"], text: "限制范围", status: "active", createdAfterMessageId: "missing" } },
];

test("full Markdown export preserves speech order, human directions and result without credentials", () => {
  const result = serializeMeetingMarkdown(record, events);
  assert.equal(result, serializeMeetingMarkdown(record, events));
  assert.ok(result.indexOf("# 提议") < result.indexOf("请改方向"));
  assert.ok(result.indexOf("请改方向") < result.indexOf("### 3."));
  assert.match(result, /3\.5 s/);
  assert.match(result, /\$0\.0123/);
  assert.match(result, /未记录 \/ Not recorded/);
  assert.match(result, /无法精确插入发言顺序的人工指令/);
  assert.match(result, /# 最终建议/);
  assert.doesNotMatch(result, /SECRET_API_KEY|SECRET_PROMPT|SECRET_EXCEPTION/);
  assert.match(serializeMeetingMarkdown({ ...record, reviewInput: { artifact: "原稿", references: "参考", truthConstraints: "边界" } }, events, "完整修订稿"), /原稿[\s\S]*参考[\s\S]*边界[\s\S]*完整修订稿/);
  const withReceipt = serializeMeetingMarkdown({ ...record, transcript: [{ ...record.transcript[2], envelope: { statement: "有效发言但状态归约失败" } }], sourceAttempts: [{ turnId: "turn-2", lifecycle: "terminal", startedAt: "2026-09-27T12:00:10.000Z", endedAt: "2026-09-27T12:00:15.000Z", elapsedMs: 5000, inputTokens: { value: 11 }, outputTokens: { value: null } }] });
  assert.match(withReceipt, /有效发言但状态归约失败/);
  assert.match(withReceipt, /Call started: 2026-09-27T12:00:10/);
  assert.match(withReceipt, /Model time: 5\.0 s/);
  assert.match(withReceipt, /Input tokens: 11/);
  assert.doesNotMatch(withReceipt, /SECRET_EXCEPTION/);
});

test("safe GFM renderer displays headings and tables but not raw HTML", async () => {
  const component = await readFile(new URL("../app/meeting-markdown.tsx", import.meta.url), "utf8");
  assert.match(component, /remarkPlugins=\{\[remarkGfm\]\}/);
  assert.match(component, /skipHtml/);
  const html = renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], skipHtml: true }, "# Heading\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))"));
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /<script>|alert\(1\)/);
  assert.doesNotMatch(html, /href="javascript:/);
});
