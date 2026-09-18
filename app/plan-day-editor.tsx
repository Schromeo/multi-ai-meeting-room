"use client";

import { dayMinutes, dayWorkloadThirds, parsePlanDay, type PlanDay, type PlanRequest, type PlanReview, type PlanTask } from "../lib/plan-artifact";

export function PlanDayEditor({ draft, request, concerns, saving, error, onChange, onSave, onCancel, onRestore }: {
  draft: PlanDay; request: PlanRequest; concerns: PlanReview["concerns"]; saving: boolean; error: string;
  onChange: (day: PlanDay) => void; onSave: () => void; onCancel: () => void; onRestore: () => void;
}) {
  const updateTask = (index: number, update: Partial<PlanTask>) => onChange({ ...draft, tasks: draft.tasks.map((task, i) => i === index ? { ...task, ...update } : task) });
  const validDay = parsePlanDay(draft, request);
  return <form className="plan-day-editor" aria-label={`Edit Day ${draft.day}`} onSubmit={(event) => { event.preventDefault(); if (!saving && validDay) onSave(); }}>
    <header><h2>Edit Day {draft.day}</h2><span>Chair revision</span></header>
    <p className="plan-limit-note">Model review covers the original plan. Human changes have not been re-reviewed.</p>
    {concerns.length ? <details open><summary>Original review concerns</summary><ul>{concerns.map((item, index) => <li key={index}>{item.message}</li>)}</ul></details> : null}
    <fieldset disabled={saving}>
      <label>Topic<input value={draft.topic} required maxLength={160} onChange={(event) => onChange({ ...draft, topic: event.target.value })} /></label>
      <div className="plan-editor-metrics" role="status">
        <span>{(dayWorkloadThirds(draft) / 3).toFixed(2)} / {request.dailyMeu} minimum MEU</span>
        <span>{dayMinutes(draft)} / {request.dailyMinutes} maximum minutes</span>
      </div>
      <ol className="plan-edit-tasks">
        {draft.tasks.map((task, index) => <li key={index}>
          <div className="plan-edit-task-main">
            <label>Problem ID<input type="number" min={1} max={100000} required value={task.problemId || ""} onChange={(event) => updateTask(index, { problemId: Number(event.target.value) })} /></label>
            <label>Title<input required maxLength={120} value={task.title} onChange={(event) => updateTask(index, { title: event.target.value })} /></label>
            <button type="button" className="plan-icon-button" aria-label={`Remove problem ${index + 1}`} title="Remove problem" disabled={draft.tasks.length <= 1} onClick={() => onChange({ ...draft, tasks: draft.tasks.filter((_, i) => i !== index) })}>&times;</button>
          </div>
          <div className="plan-edit-task-options">
            <label>Difficulty<select value={task.difficulty} onChange={(event) => updateTask(index, { difficulty: event.target.value as PlanTask["difficulty"] })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label>Work<select value={task.mode} onChange={(event) => updateTask(index, { mode: event.target.value as PlanTask["mode"] })}><option value="new">New</option><option value="redo">Redo</option></select></label>
            <label>Minutes<input type="number" min={1} max={240} required value={task.minutes || ""} onChange={(event) => updateTask(index, { minutes: Number(event.target.value) })} /></label>
          </div>
        </li>)}
      </ol>
      <button type="button" className="plan-icon-button" aria-label="Add problem" title="Add problem" disabled={draft.tasks.length >= 30} onClick={() => onChange({ ...draft, tasks: [...draft.tasks, { problemId: 0, title: "", difficulty: "medium", mode: "new", minutes: 25 }] })}>+</button>
      <label>Review minutes<input type="number" min={10} max={120} required value={draft.reviewMinutes || ""} onChange={(event) => onChange({ ...draft, reviewMinutes: Number(event.target.value) })} /></label>
      <label>Completion check<textarea required maxLength={400} value={draft.completion} onChange={(event) => onChange({ ...draft, completion: event.target.value })} /></label>
      <label>Adjustment rule<textarea required maxLength={400} value={draft.adjustment} onChange={(event) => onChange({ ...draft, adjustment: event.target.value })} /></label>
      {!validDay ? <p className="plan-edit-error" role="status">Required fields, unique task IDs, daily minimum workload and daily time limit must all pass.</p> : null}
      {error ? <p className="plan-edit-error" role="alert">{error}</p> : null}
      <footer><button type="button" onClick={onRestore}>Restore original day</button><button type="button" onClick={onCancel}>Cancel</button><button className="primary-small" type="submit" disabled={!validDay}>{saving ? "Saving..." : "Save day"}</button></footer>
    </fieldset>
  </form>;
}
