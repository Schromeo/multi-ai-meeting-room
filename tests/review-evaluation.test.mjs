import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { buildBaselinePrompt, loadReviewCases, reviewTaskPayload } from "../scripts/review-evaluation.mjs";

const cases = await loadReviewCases();
const oracle = JSON.parse(await readFile(new URL("./fixtures/review-evaluation/oracle.json", import.meta.url), "utf8"));
const artifactSource = await readFile(new URL("../lib/review-artifact.ts", import.meta.url), "utf8");
const artifactOutput = ts.transpileModule(artifactSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { parseReviewEditDraft, validateReviewFindingSource } = await import(
  `data:text/javascript;base64,${Buffer.from(artifactOutput).toString("base64")}`
);

test("evaluation public inputs and answer keys have matching unique versioned case IDs", () => {
  assert.equal(cases.length, 3);
  assert.equal(oracle.schemaVersion, 1);
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.deepEqual(oracle.cases.map((item) => item.caseId).sort(), cases.map((item) => item.id).sort());
  for (const fixture of cases) {
    assert.match(fixture.id, /-v1$/);
    assert.deepEqual(Object.keys(fixture).sort(), ["id", "objective", "reviewInput", "title"]);
    assert.deepEqual(Object.keys(fixture.reviewInput).sort(), ["artifact", "references", "truthConstraints"]);
    for (const value of Object.values(fixture.reviewInput)) assert.equal(typeof value, "string");
  }
});

test("model-facing prompt exports exact public input and excludes evaluator-only data", () => {
  for (const fixture of cases) {
    const prompt = buildBaselinePrompt({ ...fixture, oracle: "DO_NOT_SEND_ANSWER_KEY" });
    const task = JSON.parse(prompt.split("TASK INPUT:\n")[1]);
    assert.deepEqual(task, reviewTaskPayload(fixture));
    assert.deepEqual(task.reviewInput, fixture.reviewInput);
    assert.doesNotMatch(prompt, /DO_NOT_SEND_ANSWER_KEY|goldenArtifact|goldenChanges|protectedText/);
    assert.match(prompt, /complete revised artifact/);
    assert.match(prompt, /No special JSON response schema/);
  }
});

for (const fixture of cases) {
  test(`${fixture.id}: source anchors and golden corrections use the production artifact contract`, () => {
    const expected = oracle.cases.find((item) => item.caseId === fixture.id);
    const ids = expected.issues.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(expected.falsePositiveTrap.length > 0);
    assert.ok(expected.remainingChecks.length > 0);
    for (const issue of expected.issues) {
      assert.ok(["blocking", "material", "minor"].includes(issue.severity));
      assert.ok(issue.acceptance.length > 0);
      for (const evidence of issue.evidence) {
        assert.equal(validateReviewFindingSource(fixture.reviewInput, evidence).ok, true);
      }
    }
    // Golden acceptance is a test fixture, not a recorded Human Chair decision.
    const result = parseReviewEditDraft(JSON.stringify({ changes: expected.goldenChanges }), fixture.reviewInput.artifact, ids);
    assert.equal(result.ok, true, result.error);
    assert.equal(result.artifactV2, expected.goldenArtifact);
    for (const text of expected.protectedText) {
      assert.ok(fixture.reviewInput.artifact.includes(text));
      assert.ok(result.artifactV2.includes(text));
    }
  });
}

test("golden artifact checks reject a missing issue, a stale anchor, and an unauthorized finding", () => {
  const fixture = cases[0];
  const expected = oracle.cases[0];
  const ids = expected.issues.map((item) => item.id);
  for (const changes of [
    expected.goldenChanges.slice(1),
    expected.goldenChanges.map((item, i) => i ? item : { ...item, before: "STALE_ANCHOR_NOT_IN_ARTIFACT" }),
    expected.goldenChanges.map((item, i) => i ? item : { ...item, findingIds: ["unknown-finding"] }),
  ]) {
    assert.equal(parseReviewEditDraft(JSON.stringify({ changes }), fixture.reviewInput.artifact, ids).ok, false);
  }
});

test("the offline CLI exports a task without a server and rejects an unknown case", () => {
  const cli = fileURLToPath(new URL("../scripts/review-evaluation.mjs", import.meta.url));
  const output = execFileSync(process.execPath, [cli, "task", cases[0].id], { encoding: "utf8" });
  assert.deepEqual(JSON.parse(output), reviewTaskPayload(cases[0]));
  assert.throws(() => execFileSync(process.execPath, [cli, "task", "../oracle.json"], { stdio: "pipe" }));
});
