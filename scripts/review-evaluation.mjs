import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { buildBaselinePrompt, reviewTaskPayload } from "../lib/review-baseline-prompt.mjs";
export { buildBaselinePrompt, reviewTaskPayload } from "../lib/review-baseline-prompt.mjs";

// This exporter deliberately reads only public inputs, never the evaluator oracle.
export async function loadReviewCases() {
  const source = await readFile(
    new URL("../tests/fixtures/review-evaluation/cases.json", import.meta.url),
    "utf8",
  );
  return JSON.parse(source).cases;
}

async function main(args) {
  const [command, caseId, ...extra] = args;
  if (extra.length || !["list", "task", "prompt"].includes(command) ||
      (command === "list" ? Boolean(caseId) : !caseId)) {
    throw new Error("Usage: npm run review:case -- list | task CASE_ID | prompt CASE_ID");
  }
  const cases = await loadReviewCases();
  if (command === "list") {
    process.stdout.write(`${cases.map((item) => `${item.id}: ${item.title}`).join("\n")}\n`);
    return;
  }
  const fixture = cases.find((item) => item.id === caseId);
  if (!fixture) throw new Error("Unknown case ID. Use list to see the frozen inputs.");
  process.stdout.write(`${command === "task"
    ? JSON.stringify(reviewTaskPayload(fixture), null, 2)
    : buildBaselinePrompt(fixture)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
