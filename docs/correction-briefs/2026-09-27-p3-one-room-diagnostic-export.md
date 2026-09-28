# P3 — One saved ordinary-meeting diagnostic export

Status: Locally validated. P1/P1B/P2 were separately committed at `4d16c9c` after local `pnpm.cmd check` passed 71/71 tests; no push or deployment.

- **Observed failure:** saved ordinary meetings and P2 source receipts can be inspected in the browser but not exported as a bounded diagnostic artifact. Copying the room record would disclose objective, prompts/answers, memo, and arbitrary error text; old rooms have no P2 receipt to reconstruct.
- **User artifact:** one repeatable versioned JSON download for one selected saved ordinary Decide meeting, plus three sanitized offline examples: completed, Turn Envelope contract rejection with interruption, and unresolved started receipt.
- **Baseline:** `MeetingRecord` v1 has stable room/transcript IDs, decision and protocol state; optional `sourceAttempts` contains P2 receipts. Existing history has no diagnostic download. P2 capture is browser-local and can miss a terminal receipt.
- **Smallest hypothesis:** a pure projection with explicitly enumerated fields, selected from an already parsed saved record, can preserve known/unknown source evidence and outcomes without exporting task text or inventing history.
- **Expected information gain:** deterministic tests and three examples reveal whether the available records are sufficient for downstream failure localization. No provider call or new agent role is necessary.
- **Acceptance:** same saved input yields byte-identical JSON; only allowlisted keys appear, including nested receipt fields; source timestamps and reported/unknown token provenance survive; old absent P2 remains absent/not-recorded; contract rejection, interrupted workflow, human decision, and unevaluated quality are separate; one selected history row downloads one file; non-Decide, Plan, Observer, and Solo are excluded; poisoned text fixtures never appear. Existing 71 tests and canonical check remain green.
- **Cost boundary:** zero paid calls, zero dependency, no credential or remote access, no import/SDK/sync, no record mutation. JSON only, one room at a time. Do not include objectives, prompts, raw responses, transcript/memo text, keys, arbitrary exception text, or inferred billing.
- **Stop:** if classification needs raw content or inferred P2 evidence, emit unknown/absent instead. Do not expand to Plan, Review, Observer, Solo, or SledTrace import.

## Local result

- One history-row action serializes only the selected saved ordinary Decide room. The pure export projection has schema version 1, explicit room/workflow/task/outcome/turn/source-receipt fields, and no generated timestamp. It deliberately omits configured model strings as well as all task and error text.
- Three checked-in sanitized JSON examples exactly match deterministic projections. Tests also cover repeated generation, nested allowlist, unknown versus reported zero, absent legacy P2, recorded-empty P2, terminal without start, started without terminal, excluded modes, and poisoned extra fields. The three page save paths now preserve absence of `sourceAttempts` on a legacy room instead of adding an empty collection.
- `pnpm.cmd check` exits 0: build, 75/75 tests, lint, and type check. `git diff --check` exits 0. No live provider call, browser-history mutation, remote CI, push, or deployment. The actual history-row click/download was not separately browser-automated; this is a local implementation/test gate, not product-usage evidence.
- Turn Envelope rejection means only P2 validator rejection. Later task-specific contract failures may be reflected by `formatFailureObserved` from the stored transcript without its message. `qualityEvaluation` remains `not_evaluated`; a completed provider call or approved human decision does not imply quality.
