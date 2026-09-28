import type { SourceAttempt, ReportedCount } from "../lib/source-attempt";

const countLabel = (count: ReportedCount) => count.value === null ? "unknown" : String(count.value);

export function SourceAttemptView({ receipts }: { receipts: SourceAttempt[] }) {
  if (!receipts.length) return null;
  const latest = new Map<string, SourceAttempt>();
  receipts.forEach(receipt => latest.set(receipt.attemptId, receipt));
  return (
    <details className="source-attempts">
      <summary>Traces <span>{latest.size}</span></summary>
      <div className="source-attempts-panel">
        <h3>Call traces</h3>
        <p>Local application observations, not billing or answer quality. Configured model is not a verified served model.
          Envelope validation excludes later task/reducer checks. Missing evidence is not zero.</p>
        {[...latest.values()].map(receipt => (
          <article key={receipt.attemptId}>
            <h4>{receipt.phase} · {receipt.configuredModel}</h4>
            <p>Call: {receipt.callStatus} · Provider finish: {receipt.providerFinish} ({receipt.providerReason}) ·
              Envelope: {receipt.validation}</p>
            {receipt.lifecycle === "started" ? <p>Terminal receipt missing — outcome and usage unresolved.</p> : null}
            {receipt.validationCode ? <p>{receipt.validationCode} at {receipt.validationPath}</p> : null}
            <p>Input: {countLabel(receipt.inputTokens)} · Output: {countLabel(receipt.outputTokens)} ({receipt.outputTokenBasis}) ·
              Reasoning: {countLabel(receipt.reasoningTokens)} tokens</p>
            <p>Source start: <time>{receipt.startedAt}</time> · End: {receipt.endedAt ?? "unknown"} ·
              Elapsed: {receipt.elapsedMs === null ? "unknown" : receipt.elapsedMs + " ms"}</p>
            <small>Request {receipt.requestId} · Attempt {receipt.attemptId} · {receipt.captureVersion}</small>
          </article>
        ))}
      </div>
    </details>
  );
}
