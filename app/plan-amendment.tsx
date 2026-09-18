"use client";

import { useState } from "react";
import type { PlanArtifact } from "../lib/plan-artifact";

export function PlanAmendmentPanel({ plan, busy, disabled, onStart, onRecheck, onDismiss }: {
  plan: PlanArtifact; busy: boolean; disabled: boolean;
  onStart: (selected: number[]) => void; onRecheck: () => void; onDismiss: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const amendment = plan.amendment;
  const concerns = plan.review?.concerns ?? [];
  if (!concerns.length && !amendment) return null;
  return <section className="plan-amendment" aria-label="Plan amendment">
    <h3>Review to revision</h3>
    {!amendment ? <>
      <fieldset disabled={disabled || busy}><legend>Concerns to address (up to 3)</legend>
        {concerns.map((concern, index) => <label key={index}>
          <input type="checkbox" checked={selected.includes(index)} disabled={!selected.includes(index) && selected.length >= 3}
            onChange={(event) => setSelected((current) => event.target.checked ? [...current, index] : current.filter((item) => item !== index))} />
          <span>Day {concern.day}: {concern.message}</span>
        </label>)}
      </fieldset>
      <p className="plan-limit-note">Additional API usage beyond the original meeting allowance: at most 2 calls, output caps 12,000 + 6,000 tokens. Estimates are not invoice limits. No automatic retry.</p>
      <button type="button" disabled={disabled || busy || !selected.length} onClick={() => onStart(selected)}>Amend selected &amp; recheck</button>
    </> : <>
      <p role="status">{amendment.status === "complete" ? "Amendment checked · Human decision required"
        : amendment.status === "dismissed" ? "Amendment dismissed · Original retained"
        : busy ? amendment.status === "amending" ? "Assessing concerns and amending affected days..." : "Checking actual changes..."
        : amendment.status === "amended" ? "Amendment saved · Recheck pending" : "Attempt stopped · No automatic retry"}</p>
      <details open><summary>Selected concerns and responses</summary>
        {amendment.selected.map((index) => {
          const response = amendment.draft?.responses.find((item) => item.concernIndex === index);
          const check = amendment.recheck?.checks.find((item) => item.concernIndex === index);
          return <div key={index}><p><strong>Day {concerns[index].day}</strong>: {concerns[index].message}</p>
            {response ? <p>{response.action === "amended" ? "Editor changed" : "Editor declined"}: {response.reason}</p> : null}
            {check ? <p><strong>{check.verdict === "resolved" ? "Reviewer: resolved" : check.verdict === "invalid_concern" ? "Reviewer: original concern unsupported" : "Reviewer: unresolved"}</strong>: {check.reason}</p> : null}
          </div>;
        })}
      </details>
      {amendment.draft?.days.length ? <details><summary>Proposed day changes</summary>{amendment.draft.days.map((day) => <div key={day.day}>
        <h4>Day {day.day}: {day.topic}</h4><ul>{day.tasks.map((task) => <li key={task.problemId}>#{task.problemId} {task.title} | {task.difficulty} | {task.mode} | {task.minutes} min</li>)}</ul>
        <p>Review: {day.reviewMinutes} min · {day.completion}</p><p>{day.adjustment}</p>
      </div>)}</details> : null}
      {amendment.status === "amended" ? <button type="button" disabled={disabled || busy} onClick={onRecheck}>Run saved amendment recheck (1 call)</button> : null}
      {amendment.status !== "dismissed" ? <button type="button" disabled={disabled || busy} onClick={onDismiss}>Keep original plan</button> : null}
    </>}
    {plan.builder.provider === plan.reviewer.provider && plan.builder.model === plan.reviewer.model ? <p className="plan-limit-note">Separate Seats, same model. This is not model-family diversity.</p> : null}
  </section>;
}
