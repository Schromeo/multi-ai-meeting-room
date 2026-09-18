import type { ProviderId, RoleId } from "./discuss-protocol";
import type { MeetingState, ReviewFindingSource, ReviewFindingSourceKind } from "./meeting-state";
import type { MeetingProtocolState } from "./meeting-orchestrator";

export const reviewArtifactLimits = {
  maxChanges: 12,
  maxArtifactV2: 20_000,
  maxEditorOutputTokens: 6_000,
  maxVerifierOutputTokens: 1_200,
} as const;

export type ReviewChangeBasis = "artifact" | "reference" | "inference";
export type ReviewVerificationStatus = "supported" | "unsupported" | "unverifiable";

export type ReviewChange = {
  id: string;
  findingIds: string[];
  location: string;
  before: string;
  after: string;
  rationale: string;
  basis: ReviewChangeBasis;
};

export type ReviewVerificationCheck = {
  changeId: string;
  status: ReviewVerificationStatus;
  lineage: ReviewVerificationStatus;
  semantics: ReviewVerificationStatus;
  note: string;
};

export type ReviewModelSnapshot = {
  seatId: string;
  provider: ProviderId;
  model: string;
  role: RoleId;
};

export type ReviewVerification = {
  verdict: "pass" | "needs_revision";
  summary: string;
  checks: ReviewVerificationCheck[];
  unresolved: string[];
};

type ReviewResultBase = {
  schemaVersion: 1;
  sourceStateVersion: number;
  changeSet: ReviewChange[];
  // Legacy storage field; version 1 stores the exact retained original.
  artifactV2: string;
  createdAt: string;
};

export type ReviewArtifactResult = ReviewResultBase & ({
  artifactVersion: 2;
  verification: ReviewVerification;
  editor: ReviewModelSnapshot;
  verifier: ReviewModelSnapshot;
} | {
  artifactVersion: 1;
  outcome: "kept_original";
  verification: Omit<ReviewVerification, "verdict"> & { verdict: "not_run" };
  editor: null;
  verifier: null;
});

export type ReviewEditCheckpoint = {
  schemaVersion: 1;
  sourceStateVersion: number;
  changeSet: ReviewChange[];
  artifactV2: string;
  editor: ReviewModelSnapshot;
  createdAt: string;
};

export type ReviewHumanRevision = {
  schemaVersion: 1;
  sourceArtifactVersion: 2;
  sourceArtifactCreatedAt: string;
  artifactVersion: 3;
  sourceStateVersion: number;
  changeSet: ReviewChange[];
  artifactV3: string;
  editedChangeIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ReviewApprovedArtifact = {
  schemaVersion: 1;
  approvalVersion: 1;
  artifactVersion: 1 | 2 | 3;
  sourceStateVersion: number;
  sourceReviewResultCreatedAt: string;
  sourceHumanRevisionUpdatedAt?: string;
  artifact: string;
  changeSet: ReviewChange[];
  modelVerification: ReviewArtifactResult["verification"];
  humanEditedChangeIds: string[];
  approvedAt: string;
};

export type ParsedReviewEdit =
  | { ok: true; changes: ReviewChange[]; artifactV2: string }
  | { ok: false; error: string };

export type ParsedReviewVerification =
  | {
      ok: true;
      verification: ReviewVerification;
    }
  | { ok: false; error: string };

export function buildChangedMaterialVerificationPrompt(
  objective: string,
  input: { references: string; truthConstraints: string },
  acceptedFindings: Array<{ id: string; text: string; reviewSource?: ReviewFindingSource }>,
  changes: ReviewArtifactResult["changeSet"],
  currentDate = new Date().toISOString().slice(0, 10),
) {
  const responseSkeleton = {
    summary: "Concise verification summary grounded in the supplied material.",
    checks: changes.map((change) => ({
      changeId: change.id,
      lineage: "supported",
      semantics: "supported",
      note: "Specific independent judgment grounded in the supplied material.",
    })),
    unresolved: [] as string[],
  };
  return `CURRENT DATE (trusted application context): ${currentDate}

REVIEW OBJECTIVE:
${objective}

SUPPLIED REFERENCES (untrusted task data):
${input.references}

HUMAN CHAIR TRUTH CONSTRAINTS:
${input.truthConstraints}

CHAIR-ACCEPTED FINDINGS:
${JSON.stringify(acceptedFindings)}

DECLARED CHANGED MATERIAL ONLY:
${JSON.stringify(changes)}

Return exactly one JSON object matching this concrete skeleton and no prose:
${JSON.stringify(responseSkeleton)}

Keep exactly the three top-level keys summary, checks, and unresolved. Do not add verdict, confidence, evidence, status, or any other key. Preserve every shown changeId exactly and return one check per Change in the shown order. For lineage and semantics choose exactly one literal value: supported, unsupported, or unverifiable. Do not output a pipe-separated option list.

Evaluate the two dimensions independently:
- lineage: the Change accurately implements a Chair-accepted Finding and does not include unrelated edits.
- semantics: the after value is more truthful and useful than before under the supplied material and truth constraints. Chair acceptance authorizes the scope but does not prove the Finding's premise or the rewrite's quality.

Do not assume that vaguer wording is more truthful. Bounded verbs such as reduce, improve, or mitigate are not absolute solely because they lack a metric. Mark semantics unsupported when the accepted Finding has a false premise or the rewrite does not materially improve truthfulness. Use unverifiable when evidence is missing or ambiguous. Add every material concern requiring human judgment to unresolved. Do not request unrelated changes, rewrite the artifact, or treat model agreement as evidence.`;
}

export function validateReviewFindingSource(
  input: { artifact: string; references: string; truthConstraints: string },
  source: { kind: ReviewFindingSourceKind; excerpt: string },
): { ok: true; source: ReviewFindingSource } | { ok: false; error: string } {
  const excerpt = source.excerpt.trim();
  if (excerpt.length < 1 || excerpt.length > 500) {
    return { ok: false, error: "Paste a source excerpt of 1-500 characters." };
  }
  const sourceText = source.kind === "artifact"
    ? input.artifact
    : source.kind === "reference"
      ? input.references
      : input.truthConstraints;
  if (!sourceText.includes(excerpt)) {
    return { ok: false, error: "The source excerpt must exactly match the selected Review input." };
  }
  return { ok: true, source: { kind: source.kind, excerpt } };
}

export function parseReviewEditDraft(
  raw: string,
  artifactV1: string,
  acceptedFindingIds: string[],
): ParsedReviewEdit {
  const parsed = parseJsonObject(raw);
  if (!parsed || !hasOnlyKeys(parsed, ["changes"]) || !Array.isArray(parsed.changes)) {
    return { ok: false, error: "The Editor output must be a JSON object containing only changes." };
  }
  const accepted = uniqueIdentifiers(acceptedFindingIds);
  if (accepted.length === 0) {
    return { ok: false, error: "Artifact editing requires at least one Chair-accepted Finding." };
  }
  const changes = parseChanges(parsed.changes, new Set(accepted));
  if (!changes.ok) return changes;
  const covered = new Set(changes.changes.flatMap((change) => change.findingIds));
  const missing = accepted.filter((findingId) => !covered.has(findingId));
  if (missing.length > 0) {
    return { ok: false, error: `The Change Set does not address accepted Finding ${missing[0]}.` };
  }
  const applied = applyReviewChanges(artifactV1, changes.changes);
  if (!applied.ok) return applied;
  return { ok: true, changes: changes.changes, artifactV2: applied.artifactV2 };
}

export function parseReviewVerificationDraft(
  raw: string,
  changeIds: string[],
): ParsedReviewVerification {
  const parsed = parseJsonObject(raw);
  if (!parsed) {
    return { ok: false, error: "The Verifier output is not one valid JSON object." };
  }
  const requiredKeys = ["summary", "checks", "unresolved"];
  const missingKey = requiredKeys.find((key) => !(key in parsed));
  if (missingKey) {
    return { ok: false, error: `The Verifier output is missing top-level key ${missingKey}.` };
  }
  const unexpectedKey = Object.keys(parsed).find((key) => !requiredKeys.includes(key));
  if (unexpectedKey) {
    return { ok: false, error: `The Verifier output has unexpected top-level key ${unexpectedKey}.` };
  }
  if (!isBoundedString(parsed.summary, 8, 1_200)) {
    return { ok: false, error: "The Verifier summary must contain 8-1,200 characters." };
  }
  if (!Array.isArray(parsed.checks)) {
    return { ok: false, error: "The Verifier checks field must be an array." };
  }
  if (!Array.isArray(parsed.unresolved)) {
    return { ok: false, error: "The Verifier unresolved field must be an array." };
  }
  if (
    parsed.unresolved.length > 8 ||
    !parsed.unresolved.every((item) => isBoundedString(item, 1, 500))
  ) {
    return { ok: false, error: "The Verifier unresolved field may contain at most eight bounded strings." };
  }
  const expected = uniqueIdentifiers(changeIds);
  if (expected.length !== changeIds.length || parsed.checks.length !== expected.length) {
    return { ok: false, error: "Verification must contain exactly one check for every Change." };
  }
  const checks: ReviewVerificationCheck[] = [];
  for (const [index, candidate] of parsed.checks.entries()) {
    if (!isRecord(candidate)) {
      return { ok: false, error: `Verification check ${index + 1} must be an object.` };
    }
    if (!hasOnlyKeys(candidate, ["changeId", "lineage", "semantics", "note"])) {
      return { ok: false, error: `Verification check ${index + 1} must contain only changeId, lineage, semantics, and note.` };
    }
    if (!isIdentifier(candidate.changeId) || !expected.includes(candidate.changeId)) {
      return { ok: false, error: `Verification check ${index + 1} references an unknown Change.` };
    }
    if (!isVerificationStatus(candidate.lineage) || !isVerificationStatus(candidate.semantics)) {
      return { ok: false, error: `Verification check ${index + 1} has an invalid lineage or semantics status.` };
    }
    if (!isBoundedString(candidate.note, 4, 800)) {
      return { ok: false, error: `Verification check ${index + 1} note must contain 4-800 characters.` };
    }
    const status = combinedVerificationStatus(candidate.lineage, candidate.semantics);
    checks.push({
      changeId: candidate.changeId,
      status,
      lineage: candidate.lineage,
      semantics: candidate.semantics,
      note: candidate.note.trim(),
    });
  }
  if (new Set(checks.map((check) => check.changeId)).size !== expected.length) {
    return { ok: false, error: "Verification must reference every Change exactly once." };
  }
  const unresolved = [...new Set([
    ...(parsed.unresolved as string[]).map((item) => item.trim()),
    ...checks
      .filter((check) => check.status !== "supported")
      .map((check) => `${check.changeId}: ${check.note}`),
  ])].slice(0, reviewArtifactLimits.maxChanges);
  const verdict = checks.every((check) => check.status === "supported") && unresolved.length === 0
    ? "pass" as const
    : "needs_revision" as const;
  return {
    ok: true,
    verification: {
      verdict,
      summary: parsed.summary.trim(),
      checks,
      unresolved,
    },
  };
}

export function applyReviewChanges(
  artifactV1: string,
  changes: ReviewChange[],
): { ok: true; artifactV2: string } | { ok: false; error: string } {
  const ranges: Array<{ start: number; end: number; change: ReviewChange }> = [];
  for (const change of changes) {
    const start = artifactV1.indexOf(change.before);
    if (start < 0) {
      return { ok: false, error: `Change ${change.id} does not match Artifact v1 exactly.` };
    }
    if (artifactV1.indexOf(change.before, start + change.before.length) >= 0) {
      return { ok: false, error: `Change ${change.id} matches Artifact v1 more than once.` };
    }
    ranges.push({ start, end: start + change.before.length, change });
  }
  const ordered = [...ranges].sort((left, right) => left.start - right.start);
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].start < ordered[index - 1].end) {
      return { ok: false, error: `Change ${ordered[index].change.id} overlaps another Change.` };
    }
  }
  let artifactV2 = artifactV1;
  for (const range of [...ordered].sort((left, right) => right.start - left.start)) {
    artifactV2 = `${artifactV2.slice(0, range.start)}${range.change.after}${artifactV2.slice(range.end)}`;
  }
  if (artifactV2 === artifactV1) {
    return { ok: false, error: "The Change Set does not modify Artifact v1." };
  }
  if (artifactV2.length > reviewArtifactLimits.maxArtifactV2) {
    return { ok: false, error: "Artifact v2 exceeds the application size limit." };
  }
  return { ok: true, artifactV2 };
}

export function createReviewHumanRevision(
  result: ReviewArtifactResult,
  artifactV1: string,
  edits: Record<string, string>,
  now = new Date().toISOString(),
  previous?: ReviewHumanRevision,
): { ok: true; revision: ReviewHumanRevision } | { ok: false; error: string } {
  const knownIds = new Set(result.changeSet.map((change) => change.id));
  const unknownId = Object.keys(edits).find((changeId) => !knownIds.has(changeId));
  if (unknownId) return { ok: false, error: `Human revision references unknown Change ${unknownId}.` };
  if (!isIsoDate(now)) return { ok: false, error: "Human revision requires a valid timestamp." };

  const changeSet = result.changeSet.map((change) => ({
    ...change,
    after: Object.prototype.hasOwnProperty.call(edits, change.id) ? edits[change.id] : change.after,
  }));
  const parsed = parseChanges(changeSet);
  if (!parsed.ok) return parsed;
  const editedChangeIds = parsed.changes
    .filter((change, index) => change.after !== result.changeSet[index].after)
    .map((change) => change.id);
  if (editedChangeIds.length === 0) {
    return { ok: false, error: "Change at least one replacement before saving a human revision." };
  }
  const applied = applyReviewChanges(artifactV1, parsed.changes);
  if (!applied.ok) return applied;
  return {
    ok: true,
    revision: {
      schemaVersion: 1,
      sourceArtifactVersion: 2,
      sourceArtifactCreatedAt: result.createdAt,
      artifactVersion: 3,
      sourceStateVersion: result.sourceStateVersion,
      changeSet: parsed.changes,
      artifactV3: applied.artifactV2,
      editedChangeIds,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    },
  };
}

export function parseReviewHumanRevision(
  value: unknown,
  artifactV1: string,
  result: ReviewArtifactResult,
): ReviewHumanRevision | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    value.sourceArtifactVersion !== 2 ||
    value.sourceArtifactCreatedAt !== result.createdAt ||
    value.artifactVersion !== 3 ||
    value.sourceStateVersion !== result.sourceStateVersion ||
    !Array.isArray(value.changeSet) ||
    !isBoundedString(value.artifactV3, 1, reviewArtifactLimits.maxArtifactV2) ||
    !Array.isArray(value.editedChangeIds) ||
    !value.editedChangeIds.every(isIdentifier) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) return null;
  const parsed = parseChanges(value.changeSet);
  if (!parsed.ok || parsed.changes.length !== result.changeSet.length) return null;
  const identitiesMatch = parsed.changes.every((change, index) =>
    sameReviewChangeIdentity(change, result.changeSet[index]),
  );
  if (!identitiesMatch) return null;
  const expectedEditedIds = parsed.changes
    .filter((change, index) => change.after !== result.changeSet[index].after)
    .map((change) => change.id);
  const storedEditedIds = value.editedChangeIds;
  if (
    expectedEditedIds.length === 0 ||
    expectedEditedIds.length !== storedEditedIds.length ||
    expectedEditedIds.some((changeId, index) => changeId !== storedEditedIds[index])
  ) return null;
  const applied = applyReviewChanges(artifactV1, parsed.changes);
  if (!applied.ok || applied.artifactV2 !== value.artifactV3) return null;
  return {
    schemaVersion: 1,
    sourceArtifactVersion: 2,
    sourceArtifactCreatedAt: result.createdAt,
    artifactVersion: 3,
    sourceStateVersion: result.sourceStateVersion,
    changeSet: parsed.changes,
    artifactV3: applied.artifactV2,
    editedChangeIds: expectedEditedIds,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function createReviewApprovedArtifact(
  result: ReviewArtifactResult,
  artifactV1: string,
  revision: ReviewHumanRevision | null,
  approvedAt = new Date().toISOString(),
): { ok: true; artifact: ReviewApprovedArtifact } | { ok: false; error: string } {
  if (!isIsoDate(approvedAt)) return { ok: false, error: "Approval requires a valid timestamp." };
  if (result.artifactVersion === 1 && !parseReviewArtifactResult(result, artifactV1)) {
    return { ok: false, error: "The retained original no longer matches Artifact v1." };
  }
  const parsedRevision = revision
    ? parseReviewHumanRevision(revision, artifactV1, result)
    : null;
  if (revision && !parsedRevision) {
    return { ok: false, error: "The Human Revision no longer matches Artifact v2." };
  }
  const source = parsedRevision ?? result;
  return {
    ok: true,
    artifact: {
      schemaVersion: 1,
      approvalVersion: 1,
      artifactVersion: parsedRevision ? 3 : result.artifactVersion,
      sourceStateVersion: result.sourceStateVersion,
      sourceReviewResultCreatedAt: result.createdAt,
      ...(parsedRevision ? { sourceHumanRevisionUpdatedAt: parsedRevision.updatedAt } : {}),
      artifact: parsedRevision ? parsedRevision.artifactV3 : result.artifactV2,
      changeSet: source.changeSet.map((change) => ({ ...change, findingIds: [...change.findingIds] })),
      modelVerification: {
        ...result.verification,
        checks: result.verification.checks.map((check) => ({ ...check })),
        unresolved: [...result.verification.unresolved],
      },
      humanEditedChangeIds: parsedRevision ? [...parsedRevision.editedChangeIds] : [],
      approvedAt,
    },
  };
}

export function parseReviewApprovedArtifact(
  value: unknown,
  artifactV1: string,
  result: ReviewArtifactResult,
  revision?: ReviewHumanRevision,
): ReviewApprovedArtifact | null {
  if (result.artifactVersion === 1 && !parseReviewArtifactResult(result, artifactV1)) return null;
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      "schemaVersion",
      "approvalVersion",
      "artifactVersion",
      "sourceStateVersion",
      "sourceReviewResultCreatedAt",
      ...(value.artifactVersion === 3 ? ["sourceHumanRevisionUpdatedAt"] : []),
      "artifact",
      "changeSet",
      "modelVerification",
      "humanEditedChangeIds",
      "approvedAt",
    ]) ||
    value.schemaVersion !== 1 ||
    value.approvalVersion !== 1 ||
    (value.artifactVersion !== 1 && value.artifactVersion !== 2 && value.artifactVersion !== 3) ||
    value.sourceStateVersion !== result.sourceStateVersion ||
    value.sourceReviewResultCreatedAt !== result.createdAt ||
    !isBoundedString(value.artifact, 1, reviewArtifactLimits.maxArtifactV2) ||
    !Array.isArray(value.changeSet) ||
    !isRecord(value.modelVerification) ||
    !Array.isArray(value.humanEditedChangeIds) ||
    !value.humanEditedChangeIds.every(isIdentifier) ||
    !isIsoDate(value.approvedAt)
  ) return null;

  const sourceRevision = value.artifactVersion === 3 && revision
    ? parseReviewHumanRevision(revision, artifactV1, result)
    : null;
  if (
    (value.artifactVersion === 3 && !sourceRevision) ||
    (value.artifactVersion !== 3 && (Boolean(revision) || value.artifactVersion !== result.artifactVersion)) ||
    (sourceRevision && value.sourceHumanRevisionUpdatedAt !== sourceRevision.updatedAt)
  ) return null;
  const sourceChanges = sourceRevision?.changeSet ?? result.changeSet;
  const parsedChanges = result.artifactVersion === 1 && value.changeSet.length === 0
    ? { ok: true as const, changes: [] as ReviewChange[] }
    : parseChanges(value.changeSet);
  if (
    !parsedChanges.ok ||
    parsedChanges.changes.length !== sourceChanges.length ||
    !parsedChanges.changes.every((change, index) => sameReviewChange(change, sourceChanges[index]))
  ) return null;
  const applied = result.artifactVersion === 1
    ? { ok: true as const, artifactV2: artifactV1 }
    : applyReviewChanges(artifactV1, parsedChanges.changes);
  if (!applied.ok || applied.artifactV2 !== value.artifact) return null;
  const verification = result.artifactVersion === 1
    ? parseKeptOriginalVerification(value.modelVerification)
    : parseStoredVerification(value.modelVerification, result.changeSet.map((change) => change.id));
  if (!verification || JSON.stringify(verification) !== JSON.stringify(result.verification)) return null;
  const expectedEditedIds = sourceRevision?.editedChangeIds ?? [];
  const storedEditedIds = value.humanEditedChangeIds;
  if (
    storedEditedIds.length !== expectedEditedIds.length ||
    expectedEditedIds.some((changeId, index) => changeId !== storedEditedIds[index])
  ) return null;
  return {
    schemaVersion: 1,
    approvalVersion: 1,
    artifactVersion: value.artifactVersion,
    sourceStateVersion: result.sourceStateVersion,
    sourceReviewResultCreatedAt: result.createdAt,
    ...(sourceRevision ? { sourceHumanRevisionUpdatedAt: sourceRevision.updatedAt } : {}),
    artifact: applied.artifactV2,
    changeSet: parsedChanges.changes,
    modelVerification: verification,
    humanEditedChangeIds: [...expectedEditedIds],
    approvedAt: value.approvedAt,
  };
}

export function parseReviewArtifactResult(
  value: unknown,
  artifactV1?: string,
): ReviewArtifactResult | null {
  if (isRecord(value) && value.artifactVersion === 1) {
    if (
      value.schemaVersion !== 1 || value.outcome !== "kept_original" ||
      !Number.isInteger(value.sourceStateVersion) || Number(value.sourceStateVersion) < 1 ||
      artifactV1 === undefined || !isBoundedString(artifactV1, 1, reviewArtifactLimits.maxArtifactV2) ||
      value.artifactV2 !== artifactV1 || !Array.isArray(value.changeSet) || value.changeSet.length !== 0 ||
      value.editor !== null || value.verifier !== null || !isIsoDate(value.createdAt) ||
      !isRecord(value.verification)
    ) return null;
    const verification = parseKeptOriginalVerification(value.verification);
    if (!verification) return null;
    return {
      schemaVersion: 1, artifactVersion: 1, outcome: "kept_original",
      sourceStateVersion: Number(value.sourceStateVersion), artifactV2: artifactV1, changeSet: [],
      editor: null, verifier: null, verification, createdAt: value.createdAt,
    };
  }
  if (!isRecord(value) || value.schemaVersion !== 1 || value.artifactVersion !== 2) return null;
  if (
    !Number.isInteger(value.sourceStateVersion) ||
    Number(value.sourceStateVersion) < 1 ||
    !Array.isArray(value.changeSet) ||
    !isBoundedString(value.artifactV2, 1, reviewArtifactLimits.maxArtifactV2) ||
    !isRecord(value.verification) ||
    !isReviewModelSnapshot(value.editor) ||
    !isReviewModelSnapshot(value.verifier) ||
    !isIsoDate(value.createdAt)
  ) return null;
  const changes = parseChanges(value.changeSet);
  if (!changes.ok) return null;
  if (artifactV1 !== undefined) {
    const applied = applyReviewChanges(artifactV1, changes.changes);
    if (!applied.ok || applied.artifactV2 !== value.artifactV2) return null;
  }
  const verification = parseStoredVerification(value.verification, changes.changes.map((item) => item.id));
  if (!verification) return null;
  return {
    schemaVersion: 1,
    artifactVersion: 2,
    sourceStateVersion: Number(value.sourceStateVersion),
    changeSet: changes.changes,
    artifactV2: value.artifactV2.trimEnd(),
    verification,
    editor: { ...value.editor } as ReviewModelSnapshot,
    verifier: { ...value.verifier } as ReviewModelSnapshot,
    createdAt: value.createdAt,
  };
}

export function parseReviewEditCheckpoint(
  value: unknown,
  artifactV1: string,
  acceptedFindingIds: string[],
): ReviewEditCheckpoint | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Number.isInteger(value.sourceStateVersion) ||
    Number(value.sourceStateVersion) < 1 ||
    !Array.isArray(value.changeSet) ||
    !isBoundedString(value.artifactV2, 1, reviewArtifactLimits.maxArtifactV2) ||
    !isReviewModelSnapshot(value.editor) ||
    !isIsoDate(value.createdAt)
  ) return null;
  const parsed = parseReviewEditDraft(
    JSON.stringify({ changes: value.changeSet }),
    artifactV1,
    acceptedFindingIds,
  );
  if (!parsed.ok || parsed.artifactV2 !== value.artifactV2) return null;
  return {
    schemaVersion: 1,
    sourceStateVersion: Number(value.sourceStateVersion),
    changeSet: parsed.changes,
    artifactV2: parsed.artifactV2,
    editor: { ...value.editor } as ReviewModelSnapshot,
    createdAt: value.createdAt,
  };
}

export function buildReviewExecutiveBrief(result: ReviewArtifactResult) {
  if (result.artifactVersion === 1) {
    return [
      "# Review Outcome", "Original Artifact v1 retained without changes by the Chair.",
      "# Applied Changes", "None. No Finding was accepted for editing.",
      "# Changed-Material Verification", result.verification.summary,
      "# Remaining Human Checks", ...result.verification.unresolved,
      "# Recommended Next Step", "Inspect the original and the rejected Findings, then approve or reject Artifact v1.",
    ].join("\n\n");
  }
  const supported = result.verification.checks.filter((check) => check.status === "supported").length;
  const attention = result.verification.checks.length - supported;
  const applied = result.changeSet
    .map((change) => `- ${change.id} · ${change.location} · ${change.rationale}`)
    .join("\n");
  const unresolved = result.verification.unresolved.length > 0
    ? result.verification.unresolved.map((item) => `- ${item}`).join("\n")
    : "- None recorded by the changed-material verifier.";
  return [
    "# Review Outcome",
    `Artifact v2 applies ${result.changeSet.length} source-linked change${result.changeSet.length === 1 ? "" : "s"}. Verification: ${result.verification.verdict === "pass" ? "pass" : "needs revision"}.`,
    "# Applied Changes",
    applied,
    "# Changed-Material Verification",
    `${supported} supported; ${attention} require attention. ${result.verification.summary}`,
    "# Remaining Human Checks",
    unresolved,
    "# Recommended Next Step",
    result.verification.verdict === "pass"
      ? "Inspect Artifact v2 and the Change Set, then approve or reject the artifact."
      : "Inspect the flagged Changes before approving, or reject the artifact and start a scoped revision.",
  ].join("\n\n");
}

export function selectReviewArtifactSeatIds<T extends { id: string; role: RoleId }>(seats: T[]) {
  const editor = [...seats].sort((left, right) => editorRank(left.role) - editorRank(right.role))[0];
  const verifier = [...seats]
    .filter((seat) => seat.id !== editor?.id)
    .sort((left, right) => verifierRank(left.role) - verifierRank(right.role))[0];
  return editor && verifier ? [editor.id, verifier.id] : [];
}

function parseChanges(
  value: unknown[],
  allowedFindingIds?: Set<string>,
): { ok: true; changes: ReviewChange[] } | { ok: false; error: string } {
  if (value.length < 1 || value.length > reviewArtifactLimits.maxChanges) {
    return { ok: false, error: `The Change Set must contain 1-${reviewArtifactLimits.maxChanges} Changes.` };
  }
  const changes: ReviewChange[] = [];
  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, ["id", "findingIds", "location", "before", "after", "rationale", "basis"]) ||
      !isIdentifier(candidate.id) ||
      !Array.isArray(candidate.findingIds) ||
      candidate.findingIds.length < 1 ||
      candidate.findingIds.length > 4 ||
      !candidate.findingIds.every(isIdentifier) ||
      !isBoundedString(candidate.location, 1, 240) ||
      !isBoundedString(candidate.before, 1, 4_000) ||
      !isBoundedString(candidate.after, 0, 4_000) ||
      candidate.after === candidate.before ||
      !isBoundedString(candidate.rationale, 4, 800) ||
      !isReviewChangeBasis(candidate.basis)
    ) {
      return { ok: false, error: "A Change does not match the strict Change Set contract." };
    }
    const findingIds = uniqueIdentifiers(candidate.findingIds as string[]);
    if (
      findingIds.length !== candidate.findingIds.length ||
      (allowedFindingIds && findingIds.some((findingId) => !allowedFindingIds.has(findingId)))
    ) {
      return { ok: false, error: `Change ${candidate.id} references a Finding not accepted by the Chair.` };
    }
    changes.push({
      id: candidate.id,
      findingIds,
      location: candidate.location.trim(),
      before: candidate.before,
      after: candidate.after,
      rationale: candidate.rationale.trim(),
      basis: candidate.basis,
    });
  }
  if (new Set(changes.map((change) => change.id)).size !== changes.length) {
    return { ok: false, error: "Change IDs must be unique." };
  }
  return { ok: true, changes };
}

function parseStoredVerification(
  value: Record<string, unknown>,
  changeIds: string[],
): ReviewVerification | null {
  if (
    !hasOnlyKeys(value, ["verdict", "summary", "checks", "unresolved"]) ||
    (value.verdict !== "pass" && value.verdict !== "needs_revision") ||
    !isBoundedString(value.summary, 8, 1_200) ||
    !Array.isArray(value.checks) ||
    !Array.isArray(value.unresolved)
  ) return null;
  const normalizedChecks = value.checks.map((candidate) => {
    if (!isRecord(candidate)) return candidate;
    const dimension = isVerificationStatus(candidate.lineage) && isVerificationStatus(candidate.semantics)
      ? { lineage: candidate.lineage, semantics: candidate.semantics }
      : isVerificationStatus(candidate.status)
        ? { lineage: candidate.status, semantics: candidate.status }
        : { lineage: candidate.lineage, semantics: candidate.semantics };
    return {
      changeId: candidate.changeId,
      ...dimension,
      note: candidate.note,
    };
  });
  const draft = parseReviewVerificationDraft(JSON.stringify({
    summary: value.summary,
    checks: normalizedChecks,
    unresolved: value.unresolved,
  }), changeIds);
  return draft.ok && draft.verification.verdict === value.verdict ? draft.verification : null;
}

function keptOriginalVerification() {
  return {
    verdict: "not_run" as const,
    summary: "Editor and Verifier were not run. The original was retained without changes.",
    checks: [] as ReviewVerificationCheck[],
    unresolved: ["Retaining the original and rejecting Findings do not verify its factual correctness. Human approval is still required."],
  };
}

function parseKeptOriginalVerification(value: Record<string, unknown>) {
  const expected = keptOriginalVerification();
  return hasOnlyKeys(value, ["verdict", "summary", "checks", "unresolved"]) &&
    value.verdict === expected.verdict && value.summary === expected.summary &&
    Array.isArray(value.checks) && value.checks.length === 0 &&
    Array.isArray(value.unresolved) && value.unresolved.length === 1 &&
    value.unresolved[0] === expected.unresolved[0] ? expected : null;
}

export function prepareKeptOriginalReview(
  artifact: string,
  state: MeetingState,
  protocol: MeetingProtocolState,
  now = new Date().toISOString(),
): { ok: true; result: ReviewArtifactResult; protocol: MeetingProtocolState } | { ok: false; error: string } {
  if (!isIsoDate(now) || !isBoundedString(artifact, 1, reviewArtifactLimits.maxArtifactV2) ||
      !Number.isInteger(state.version) || state.version < 1) {
    return { ok: false, error: "A valid original artifact and timestamp are required." };
  }
  if (protocol.phase !== "review_checkpoint" || protocol.status !== "paused" ||
      protocol.pendingSeatIds.length > 0 || protocol.transitions.some((turn) => turn.status === "running") ||
      !protocol.transitions.some((turn) => turn.round === protocol.round && turn.status === "completed" &&
        (turn.phase === "review" || turn.phase === "targeted_debate")) ||
      state.round !== protocol.round) {
    return { ok: false, error: "Finish the current review before retaining the original." };
  }
  if (state.claims.some((claim) => claim.status === "accepted_by_chair")) {
    return { ok: false, error: "Accepted Findings require the editing path. Reject them explicitly to retain the original." };
  }
  if (state.claims.some((claim) => claim.status !== "rejected_by_chair" && claim.status !== "superseded")) {
    return { ok: false, error: "Accept or reject the remaining Findings before retaining the original." };
  }
  return {
    ok: true,
    result: {
      schemaVersion: 1, artifactVersion: 1, outcome: "kept_original", sourceStateVersion: state.version,
      artifactV2: artifact, changeSet: [], editor: null, verifier: null,
      verification: keptOriginalVerification(), createdAt: now,
    },
    protocol: { ...protocol, phase: "human_gate", status: "paused", pendingSeatIds: [], completedSeatIds: [], updatedAt: now },
  };
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const candidate = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  try {
    const parsed = JSON.parse(candidate) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function editorRank(role: RoleId) {
  return ["synthesizer", "strategist", "product", "technical", "critic", "skeptic"].indexOf(role);
}

function verifierRank(role: RoleId) {
  return ["critic", "skeptic", "technical", "product", "strategist", "synthesizer"].indexOf(role);
}

function uniqueIdentifiers(values: string[]) {
  return [...new Set(values.filter(isIdentifier))];
}

function isReviewModelSnapshot(value: unknown): value is ReviewModelSnapshot {
  if (!isRecord(value)) return false;
  return (
    hasOnlyKeys(value, ["seatId", "provider", "model", "role"]) &&
    isIdentifier(value.seatId) &&
    (value.provider === "openai" || value.provider === "anthropic" || value.provider === "gemini") &&
    isBoundedString(value.model, 1, 200) &&
    ["strategist", "critic", "product", "technical", "skeptic", "synthesizer"].includes(value.role as string)
  );
}

function isReviewChangeBasis(value: unknown): value is ReviewChangeBasis {
  return value === "artifact" || value === "reference" || value === "inference";
}

function isVerificationStatus(value: unknown): value is ReviewVerificationStatus {
  return value === "supported" || value === "unsupported" || value === "unverifiable";
}

function combinedVerificationStatus(
  lineage: ReviewVerificationStatus,
  semantics: ReviewVerificationStatus,
): ReviewVerificationStatus {
  if (lineage === "supported" && semantics === "supported") return "supported";
  if (lineage === "unsupported" || semantics === "unsupported") return "unsupported";
  return "unverifiable";
}

function sameReviewChangeIdentity(left: ReviewChange, right: ReviewChange) {
  return left.id === right.id &&
    left.location === right.location &&
    left.before === right.before &&
    left.rationale === right.rationale &&
    left.basis === right.basis &&
    left.findingIds.length === right.findingIds.length &&
    left.findingIds.every((findingId, index) => findingId === right.findingIds[index]);
}

function sameReviewChange(left: ReviewChange, right: ReviewChange) {
  return sameReviewChangeIdentity(left, right) && left.after === right.after;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key)) && keys.every((key) => key in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,240}$/.test(value);
}

function isBoundedString(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.length >= minimum && value.length <= maximum;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
