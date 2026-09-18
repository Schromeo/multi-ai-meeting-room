"use client";

import { useEffect, useState } from "react";
import { dayMinutes, dayWorkloadThirds, missingPlanDays, planRejectionLabels, type PlanArtifact, type PlanDay } from "../lib/plan-artifact";

export function PlanView({ plan, work, approved = false, editedDays = [], original, onEdit, initialDay = 1 }: { plan: PlanArtifact; work?: string | null; approved?: boolean; editedDays?: number[]; original?: PlanArtifact; onEdit?: (day: PlanDay) => void; initialDay?: number }) {
  const [selected, setSelected] = useState(initialDay);
  const day = plan.days.find((item) => item.day === selected);
  const missing = missingPlanDays(plan);
  const previousDay = original?.days.find((item) => item.day === selected);
  const originalDay = previousDay && JSON.stringify(previousDay) !== JSON.stringify(day) ? previousDay : undefined;
  return <section className="plan-view" aria-label="Detailed LeetCode plan">
    <header className="plan-heading">
      <div><h2>{plan.request.days}-day LeetCode plan</h2><p>{plan.days.length}/{plan.request.days} days ready · {plan.request.dailyMeu} MEU/day · {plan.request.dailyMinutes} min/day</p></div>
      <label>Day<select aria-label="Plan day" value={selected} onChange={(event) => setSelected(Number(event.target.value))}>
        {Array.from({ length: plan.request.days }, (_, index) => index + 1).map((number) => <option key={number} value={number}>Day {number}{missing.includes(number) ? " · pending" : ""}</option>)}
      </select></label>
    </header>
    {(work === "building" || work === "reviewing") && !approved && !editedDays.length ? <PlanWorkStatus key={work} work={work} /> : <p className="plan-status" role="status">{approved ? "Approved plan snapshot" : editedDays.length ? "Chair revision · Human decision required" : missing.length ? `Pending days: ${missing.join(", ")}` : plan.review ? "Plan reviewed · Human decision required" : "Daily tasks complete · Review pending"}</p>}
    {editedDays.length ? <p className="human-revision-notice">Chair-edited days: {editedDays.join(", ")}. Model review covers the version before these human edits.</p> : null}
    {original?.amendment?.status === "complete" ? <p className="plan-limit-note">Model-amended days: {original.amendment.draft?.days.map((item) => item.day).join(", ") || "none"}. Changed material was rechecked; remaining concerns still require your judgment.</p> : null}
    {day ? <div className="plan-day-body">
      <h3>Day {day.day} · {day.topic}</h3>
      {onEdit && plan.review && !approved ? <button type="button" onClick={() => onEdit(day)}>Edit day</button> : null}
      <div className="plan-day-metrics"><span>{(dayWorkloadThirds(day) / 3).toFixed(2)} MEU</span><span>{dayMinutes(day)} min total</span><span>{day.tasks.filter((task) => task.mode === "new").length} new / {day.tasks.filter((task) => task.mode === "redo").length} redo</span></div>
      <div className="plan-task-scroll"><table className="plan-task-table"><thead><tr><th>Problem</th><th>Difficulty</th><th>Work</th><th>Minutes</th></tr></thead>
        <tbody>{day.tasks.map((task) => <tr key={task.problemId}><td>#{task.problemId} {task.title}</td><td>{task.difficulty}</td><td>{task.mode}</td><td>{task.minutes}</td></tr>)}</tbody></table></div>
      <p><strong>Review · {day.reviewMinutes} min</strong><br />{day.completion}</p>
      <p><strong>Adjustment</strong><br />{day.adjustment}</p>
      {originalDay ? <details className="plan-original-day"><summary>Original Day {selected}</summary>
        <h3>{originalDay.topic}</h3><ul>{originalDay.tasks.map((task) => <li key={task.problemId}>#{task.problemId} {task.title} | {task.difficulty} | {task.mode} | {task.minutes} min</li>)}</ul>
        <p>Review: {originalDay.reviewMinutes} min</p><p>{originalDay.completion}</p><p>{originalDay.adjustment}</p>
      </details> : null}
      {plan.review?.concerns.filter((item) => item.day === day.day).map((item, index) => <p className={`plan-concern ${item.severity}`} key={index}><strong>{item.severity === "warning" ? "Review concern" : "Review note"}</strong><br />{item.message}</p>)}
    </div> : <div className="plan-day-pending">Day {selected} is not ready. Completed days remain available.</div>}
    {plan.review ? <details className="plan-review-summary" open><summary>{editedDays.length ? "Original plan review" : "Independent review"} · {plan.reviewer.model}</summary>
      <p>{plan.review.summary}</p>
      {plan.review.concerns.length ? <ul>{plan.review.concerns.map((item, index) => <li key={index}>Day {item.day}: {item.message}</li>)}</ul> : <p>No additional concerns reported.</p>}
      <h3>Assumptions to confirm</h3><ul>{plan.review.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </details> : null}
    <details className="plan-review-summary"><summary>Plan diagnostics · {plan.attempts?.length ?? 0} recorded attempts</summary>
      {!plan.attempts?.length ? <p>No diagnostics recorded for this saved plan.</p> : plan.attempts.map((attempt, index) => <div key={`${attempt.requestId}-${attempt.stage}-${index}`}>
        <h3>{attempt.stage === "building" ? "Builder" : "Reviewer"} · {attempt.outcome}</h3>
        <p>Provider completion: {attempt.finish} · Reason: {attempt.reason} · {Math.round(attempt.latencyMs / 1000)}s</p>
        <p>Requested reasoning: {attempt.reasoningSetting ?? "not recorded"} · Reported input: {attempt.inputTokens ?? "unknown"} · Output: {attempt.outputTokens ?? "unknown"} · Reasoning: {attempt.reasoningTokens ?? "unknown"} · Output cap: {attempt.outputLimit}</p>
        <p>Text received: {attempt.outputCharacters} characters · Accepted days: {attempt.acceptedDays.join(", ") || "none"} · Rejected records: {attempt.rejectedLines}</p>
        {attempt.rejections.length ? <ul>{attempt.rejections.map((item, row) => <li key={row}>Line {item.line}{item.day ? ` / Day ${item.day}` : ""}: {planRejectionLabels[item.code]}</li>)}</ul> : null}
        {attempt.rejectedLines > attempt.rejections.length ? <p>First {attempt.rejections.length} rejected records shown.</p> : null}
        <p>Attempt: {attempt.requestId} · {attempt.createdAt}</p>
      </div>)}
      <p>Reported tokens are not a provider invoice. Unknown usage is not zero. Raw responses and private reasoning are not stored here.</p>
    </details>
    <p className="plan-limit-note">MEU: Hard = 2 Medium; 3 Easy = 1 Medium. Problem identities and difficulties are model-supplied, not externally verified. Review is advisory. Interrupted-call usage may be incomplete.</p>
  </section>;
}

function PlanWorkStatus({ work }: { work: "building" | "reviewing" }) {
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);
  return <p className="plan-status" role="status">{work === "building" ? "Building daily tasks" : "Independent plan review"} · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} in this view · No app deadline{elapsed >= 180 ? " · Long-running request" : ""}</p>;
}
