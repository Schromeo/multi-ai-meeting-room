import type { MeetingRecord } from "./meeting-record";
import type { ChairDirective, HumanChoice } from "./meeting-state";

export type RecordedHumanEvent =
  | { type: "chair.directive"; createdAt: string; payload: ChairDirective }
  | { type: "human.choice"; createdAt: string; payload: HumanChoice };

const unknown = "未记录 / Not recorded";

function inline(value: string) {
  return value.replace(/\s+/g, " ").replace(/[\\`*_{}\[\]<>|]/g, "\\$&");
}

function cell(value: string) {
  return inline(value);
}

function money(value: number) {
  return `$${value.toFixed(4)}`;
}

function duration(value: number) {
  return `${(value / 1000).toFixed(1)} s`;
}

function humanDirective(event: Extract<RecordedHumanEvent, { type: "chair.directive" }>) {
  const item = event.payload;
  return [
    `### 人工指令 / Chair direction (${inline(item.kind)})`,
    "",
    `- 记录时间 / Recorded: ${inline(event.createdAt)}`,
    `- 目标 / Target: ${item.target === "all" ? "all seats" : item.target.map(inline).join(", ")}`,
    `- 记录时状态 / Status when recorded: ${inline(item.status)}`,
    "",
    item.text.trim(),
    "",
  ];
}

export function serializeMeetingMarkdown(record: MeetingRecord, humanEvents: RecordedHumanEvent[] = [], resultArtifact?: string) {
  const lines = [
    `# 会议记录 / Meeting record`,
    "",
    `> 本文件由用户主动导出，包含议程、发言和最终产物，可能含私人信息。不要公开分享。成本为应用估算，非供应商账单。`,
    "",
    `- Room ID: ${inline(record.id)}`,
    `- Mode: ${inline(record.taskMode)}`,
    `- Created: ${inline(record.createdAt)}`,
    `- Last saved: ${inline(record.updatedAt)}`,
    `- Stage: ${inline(record.stage)}`,
    `- Human decision: ${inline(record.decision)}`,
    `- Round: ${record.iteration}`,
    "",
    "## 议程 / Agenda",
    "",
    record.objective.trim() || unknown,
    "",
    ...(record.reviewInput ? [
      "### Review input artifact", "", record.reviewInput.artifact, "",
      "### Supplied references", "", record.reviewInput.references || unknown, "",
      "### Human truth constraints", "", record.reviewInput.truthConstraints || unknown, "",
    ] : []),
    "## 席位 / Seats",
    "",
    "| # | API provider | Configured model | Role / Seat name | Skill / responsibility |",
    "| --- | --- | --- | --- | --- |",
    ...record.participants.map((seat, index) => `| ${index + 1} | ${cell(seat.providerName)} (${cell(seat.provider)}) | ${cell(seat.model)} | ${cell(seat.roleName ?? seat.role)} | ${cell(seat.skill ?? "—")} |`),
    ...(record.outputProfile ? [``, `- Output depth: ${inline(record.outputProfile === "unlimited" ? "Extended" : record.outputProfile)}`] : []),
    ...(record.outputLimits ? [`- Per-Seat turn ceiling: ${record.outputLimits.turnTokens} output tokens`, `- Final Memo ceiling: ${record.outputLimits.synthesisTokens} output tokens`] : []),
    "",
    "> 这里只记录供应商与配置的模型标识，不包含 API key、连接凭据或请求提示词。",
    "",
    "## 会议过程 / Transcript",
    "",
    "> 顺序取自已保存的发言列表。仅有对应 P2 回执时才列出调用开始/结束时间；旧记录不补造时间。进行中的当前发言可能尚未持久化。",
    "",
  ];

  const directives = humanEvents.filter((event): event is Extract<RecordedHumanEvent, { type: "chair.directive" }> => event.type === "chair.directive");
  const emitted = new Set<string>();
  record.transcript.forEach((item, index) => {
    const receipt = record.sourceAttempts?.find((attempt) => attempt.turnId === item.id && attempt.lifecycle === "terminal");
    const started = receipt ?? record.sourceAttempts?.find((attempt) => attempt.turnId === item.id && attempt.lifecycle === "started");
    lines.push(`### ${index + 1}. ${item.provider === "host" ? "Human Chair" : inline(item.role)} · ${inline(item.phase)}`, "");
    lines.push(`- Turn ID: ${inline(item.id)}`);
    lines.push(`- Seat: ${item.seatId ? inline(item.seatId) : unknown}`);
    lines.push(`- Provider / model: ${inline(item.providerName)}${item.model ? ` / ${inline(item.model)}` : ""}`);
    lines.push(`- Round: ${item.round ?? unknown}`);
    lines.push(`- Status: ${inline(item.status)}`);
    if (item.target) lines.push(`- Reviews: ${inline(item.target)}`);
    if (started) lines.push(`- Call started: ${inline(started.startedAt)}`);
    if (receipt?.endedAt) lines.push(`- Call ended: ${inline(receipt.endedAt)}`);
    lines.push(`- Input tokens: ${item.usage ? item.usage.inputTokens : receipt?.inputTokens.value ?? unknown}`);
    lines.push(`- Output tokens: ${item.usage ? item.usage.outputTokens : receipt?.outputTokens.value ?? unknown}`);
    lines.push(`- Estimated cost: ${item.usage ? money(item.usage.estimatedUsd) : unknown}`);
    lines.push(`- Model time: ${item.usage ? duration(item.usage.latencyMs) : receipt?.elapsedMs === null || receipt?.elapsedMs === undefined ? unknown : duration(receipt.elapsedMs)}`);
    lines.push("", item.status === "error"
      ? item.envelope?.statement?.trim() || "_此轮失败；异常原文不导出。_"
      : item.text.trim() || "_无已保存发言正文。_", "");
    for (const event of directives) {
      if (event.payload.createdAfterMessageId === item.id && !emitted.has(event.payload.id)) {
        lines.push(...humanDirective(event));
        emitted.add(event.payload.id);
      }
    }
  });
  const unanchored = directives.filter(event => !emitted.has(event.payload.id));
  if (unanchored.length) {
    lines.push("## 无法精确插入发言顺序的人工指令 / Unanchored directions", "", "> 原记录缺少可匹配的前一条发言 ID；以下保留记录时间但不猜测发言位置。", "");
    for (const event of unanchored) lines.push(...humanDirective(event));
  }
  const choices = humanEvents.filter((event): event is Extract<RecordedHumanEvent, { type: "human.choice" }> => event.type === "human.choice");
  if (choices.length) {
    lines.push("## 人工选择 / Human choices", "");
    for (const event of choices) {
      lines.push(`- ${inline(event.createdAt)} · ${inline(event.payload.question)} — ${inline(event.payload.choice ?? event.payload.status)}`);
    }
    lines.push("");
  }
  lines.push(
    "## 最终结果 / Result", "",
    `- Human decision: ${inline(record.decision)}`,
    `- Protocol status: ${record.protocolState ? inline(record.protocolState.status) : unknown}`,
    "",
    record.memo.trim() || "_尚无已保存的最终 Memo。_", "",
    ...(resultArtifact ? ["### 完整结果产物 / Full result artifact", "", resultArtifact, ""] : []),
    "## 房间用量 / Room usage", "",
    `- Input tokens: ${record.usage.inputTokens}`,
    `- Output tokens: ${record.usage.outputTokens}`,
    `- Estimated cost: ${money(record.usage.estimatedUsd)}`,
    `- Model time: ${duration(record.usage.latencyMs)}`,
    "",
  );
  return lines.join("\n");
}
