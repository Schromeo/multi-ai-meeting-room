# Decision Record

Durable product and architecture choices live here. New entries are append-only. Superseded decisions remain visible and point to the replacement.

## D-001 - Human-Chaired System

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** the human controls objectives, approvals, permissions, budgets, and final acceptance.
- **Reason:** multi-model consensus can still be wrong and cannot own human consequences.

## D-002 - One Product, Three Permission Levels

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Discuss, Research, and Execute are room permission levels inside one product.
- **Reason:** they share the same deliberation and audit model while differing mainly in tool authority.

## D-003 - Auditability Over Model Aggregation

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** optimize for traceable claims, disputes, decisions, actions, and results rather than the number of simultaneous models.
- **Reason:** side-by-side answers are easy to copy; a reliable decision process is the differentiated value.

## D-004 - Roles Are Provider-Neutral

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Strategist, Critic, Researcher, Builder, Reviewer, and Chair are role configurations, not fixed provider identities.
- **Reason:** model capabilities and availability change; room protocols should remain stable.

## D-005 - Build Order

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** implement real Discuss first, Research second, and Execute third.
- **Reason:** each level validates the shared core before adding more authority and operational risk.

## D-006 - Separate Control and Execution Planes

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** the web application owns rooms and approvals; a local connector or isolated cloud worker owns privileged execution.
- **Reason:** the hosted interface should not receive unrestricted access to a user's machine or repository.

## D-007 - Bounded Deliberation

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** rooms have explicit round, retry, cost, permission, and stop boundaries.
- **Reason:** more model activity is not automatically more useful and can create loops, duplicate actions, and review theater.

## D-008 - Server-Side Provider Secrets

- **Status:** Superseded by D-011
- **Date:** 2026-08-03
- **Decision:** provider API keys are stored only as server runtime secrets and are never entered into or returned to the browser.
- **Reason:** the private UI does not need access to long-lived provider credentials.

## D-009 - No Automatic Provider Retry In M2

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** a failed or interrupted provider stream is surfaced to the room without an automatic retry.
- **Reason:** retrying a partially generated stream can duplicate cost and mix two different answers. Deliberate retry policy belongs in the later orchestrator.

## D-010 - Provider-Level Streaming Protocol

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** M2 uses direct provider streaming APIs behind one normalized NDJSON room event protocol.
- **Reason:** this preserves provider diversity while keeping the client independent of vendor-specific SSE formats and credentials.

## D-011 - Two-Tier Connection Secrets

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** workspace-managed keys remain server runtime secrets; user-entered BYOK credentials may be held only in current-page memory and sent to the same-origin meeting endpoint for immediate use until authenticated encrypted storage exists.
- **Reason:** users need in-product connection setup, but pretending to persist secrets without identity, encryption, revocation, and ownership boundaries would create a larger security failure. Session credentials are never written to browser storage, URLs, logs, transcripts, or API responses.

## D-012 - Connection, Model, Role, Skill, and Seat Are Separate

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** a Connection owns credentials and provider settings; a Model is an engine available through a connection; a Role defines responsibility; a Skill defines a work method; and a Seat combines them for one room.
- **Reason:** this supports mixed providers, repeated providers, model comparison, reusable expert presets, and future local or OpenAI-compatible endpoints without binding product behavior to vendor names.

## D-013 - Bounded Agent Adaptation

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** an agent may update its working position, assumptions, confidence, and unresolved questions inside a room, but cannot silently rewrite its durable role, skills, or cross-room memory.
- **Reason:** useful deliberation requires changing a view when criticism is valid; durable self-modification without human review creates drift, contamination, and an unauditable source of behavior.

## D-014 - Stage-Focused Meeting Interface

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** the primary interface follows Setup, Agenda, Meeting, and Decision stages. Configuration and project history are hidden after use, live speech owns the main visual focus, and full transcripts remain available as a compact overview.
- **Reason:** the product should direct attention like a real chaired meeting instead of making users scroll through every control and artifact at once.

## D-015 - Named Backup Before Major Interface Rework

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** create a named Git backup tag before any major interface rewrite and record it in the development log.
- **Reason:** frontend exploration is iterative; a clear restoration point protects validated behavior without freezing experimentation.

## D-016 - Explicit Verification Before Model Discovery

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** session connections use an explicitly selected provider or a high-confidence local key-prefix suggestion, followed by one user-triggered server-side model-list request. Ambiguous keys are never sent to multiple providers for detection.
- **Reason:** provider inference is convenient but not an authentication standard. Explicit verification keeps credential routing inspectable, prevents unnecessary third-party disclosure, and gives seats only model IDs actually returned for that connection.

## D-017 - One Connection Library, Seat-Level References

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** Setup owns one reusable Connection Library. Seats select a named Connection, one of its discovered Models, and a Role; seat-level Manage opens the same library instead of creating a second credential editor. Stored keys are never displayed or edited in place, only transactionally replaced after verification.
- **Reason:** credentials belong to billing and provider connections, not meeting participants. One source of truth supports repeated providers and shared keys without duplicating secrets or confusing a reused connection with multiple credentials.

## D-018 - Meeting Content and Credentials Have Separate Lifecycles

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** persist bounded meeting records in browser-local storage as an M2.5 continuity slice, including the objective, transcript, memo, decision, usage, and provider/model/role summaries. Never include API keys, connection IDs, or credential-bearing connection records. Revisions from a restored room require a currently available provider/model/role composition matching the saved room.
- **Reason:** users need to open a new meeting without losing prior reasoning, while session BYOK must still clear on refresh. Separating durable artifacts from ephemeral authority prevents history recovery from silently restoring credentials or running an old room with unrelated seats.

## D-019 - Human Chair Authority Exists Throughout the Room

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** Discuss rooms support Auto, Checkpoints, and Turn-by-turn control modes plus a Raise Hand pause request. Human input is appended as scoped, auditable Chair Directives rather than rewriting the objective or prior messages. The default mode is Checkpoints.
- **Reason:** a final approval button alone does not make the room human-chaired. The user needs bounded opportunities to add constraints, corrections, priorities, questions, or vetoes without forcing every participant to acknowledge each instruction in a new paid call.

## D-020 - Canonical State Is Separate From Transcript and Model Context

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** preserve raw published responses for people and audit, maintain a bounded Canonical Meeting State owned by deterministic application code, and build each agent request from only the relevant state and source excerpts. Models submit validated Turn Envelopes and proposed deltas; they never directly own canonical state.
- **Reason:** replaying a growing transcript creates unnecessary cost, latency, repetition, and context degradation. A source-linked structured state preserves Claims, Disputes, assumptions, position changes, and human choices without erasing the original record.

## D-021 - System Roles Are Explicit and Billable

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** Participant Seats remain substantive contributors. Observer / Recorder and Final Synthesizer are separate system roles outside the participant Seat count, each with a user-selected Connection and Model. The Observer reports on process and creates a Round Brief but cannot mutate state; the Final Synthesizer organizes a versioned Memo but cannot remove disputes or approve it.
- **Reason:** administrative model work must not consume a participant perspective or hide its cost. Explicit system roles keep responsibility, provider bias, and billing visible.

## D-022 - Local-First Append-Only Room Store

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** replace the current bounded localStorage archive with a provider-independent RoomStore backed first by browser IndexedDB. Persist Room metadata, participant snapshots, append-only Events, Canonical State Snapshots, Artifacts, and Usage entries. Add a D1-backed server store only after identity, room ownership, deletion, encryption, and synchronization policies exist.
- **Reason:** the new resumable protocol requires transactions, schema versions, event recovery, source lineage, and artifact versions that a flat localStorage record cannot safely provide. Enabling a shared unauthenticated server database would create an ownership and privacy failure.

## D-023 - Maximum Rounds Are Bounds, Not Work Quotas

- **Status:** Accepted
- **Date:** 2026-08-03
- **Decision:** the user selects a maximum round budget, not a required number of rounds. The default is two, the standard range is one to three, and the advanced hard maximum is five. Hard round, turn, token, time, and runnable-seat limits stop automatically. Repetition, drift, premature homogenization, and low novelty are soft Monitor conditions that pause for the Chair or advance Auto mode to synthesis; they never approve a Decision.
- **Reason:** more deliberation is not automatically better. Explicit hard limits prevent unbounded spend, while reversible soft stops avoid confusing legitimate convergence with a loop or letting a fallible Monitor silently end a valuable debate.

## D-024 - Portable JSON Envelope Before Provider-Specific Structured Output

- **Status:** Accepted
- **Date:** 2026-08-04
- **Decision:** M2.8 asks every provider for the same bounded JSON Turn Envelope through its normal text-generation API, then applies one strict application-owned validator. A single whole-response `json` code-fence wrapper may be removed deterministically, and omitted `newClaims`, `claimUpdates`, or `objections` collections normalize to empty arrays. Surrounding prose, invalid JSON, unsupported fields, unknown Claim references, or active-state overflow still produce explicit failure events and never trigger an automatic extraction or provider retry. Provider-native structured-output modes may be added later behind the adapter only when their capability and streaming differences are measured.
- **Reason:** one portable contract lets OpenAI, Anthropic, and Gemini participate under identical canonical rules without letting provider APIs own meeting state. Deferring provider-specific modes keeps format behavior inspectable during the first reducer evaluation and prevents a hidden repair call from consuming money or changing the original answer.

## D-025 - Persisted Phase Transitions and Explicit Interruption Recovery

- **Status:** Accepted
- **Date:** 2026-08-08
- **Decision:** provider work runs as explicit proposal, review, and synthesis transitions. The client persists protocol state before every call, assigns a stable transition ID, records completed turn IDs, and pauses only at safe boundaries. A transition restored as still running becomes `interrupted`; it is never automatically resumed or retried. Explicit Chair resume creates a new transition and warns that the earlier in-flight request may already have incurred cost.
- **Reason:** a browser-local BYOK client has no server-side idempotency ledger and cannot promise exactly-once billing across a refresh or unknown network failure. Durable intent, duplicate-completion guards, and honest human-controlled recovery prevent automatic duplicate calls without pretending the ambiguous request never reached the provider.

## D-026 - Revision Requests Do Not Archive Claims

- **Status:** Accepted
- **Date:** 2026-08-08
- **Decision:** an AI `revise` update keeps the referenced Claim published, marks it contested, and records the reviewing Seat as opposing the current wording. Only an explicit `withdraw` update archives a Claim. A later Chair decision or source-linked replacement may resolve or supersede it.
- **Reason:** parallel reviewers generate against the same Canonical State. Allowing the first processed reviewer to archive a shared Claim makes later valid references order-dependent and grants an AI reviewer authority that belongs to the Human Chair.

## D-027 - Deterministic Safety Signals Precede Paid Observation

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision:** the orchestrator owns a backward-compatible Meeting Budget and source-linked Process Reports before adding a paid Observer. Started provider transitions count conservatively against the exact turn limit, including interrupted work. Observed input tokens, output tokens, and model time stop new transitions at the next safe boundary; an in-flight transition may cross those measured ceilings. Format and semantic-reduction failures count known usage. Deterministic structural metrics may recommend a reversible Chair pause, but cannot mutate Canonical State, approve a Decision, or claim semantic verification.
- **Reason:** call-count enforcement and structural deltas do not require another model. Establishing a deterministic floor makes future Observer judgment cheaper, auditable, and unable to hide basic budget or loop failures behind another paid opinion.

## D-028 - Validated Turns, Not Transport Streams, Own the Stage

- **Status:** Accepted
- **Date:** 2026-08-22
- **Decision:** provider deltas are transport and potential audit data, not user-facing speech. During generation the Meeting stage shows bounded progress states; only the validated Turn Envelope statement and card become published room content. Raw output, when retained by policy, is available only through explicit audit surfaces or failure records.
- **Reason:** the portable JSON envelope is machine-facing. Rendering its partial bytes exposes implementation detail, produces unstable scrolling, and can make a healthy slow stream look broken before validation is possible.

## D-029 - User Artifact Depth Is Independent From Working Context Size

- **Status:** Accepted
- **Date:** 2026-08-22
- **Decision:** each room may produce a compact executive brief and a detailed, task-shaped user artifact while future model calls continue to receive bounded Canonical State, Round Briefs, and selected sources. The detailed artifact is not replayed into agent context by default.
- **Reason:** concise model memory controls cost, but it must not force a shallow result for a user who wants the meeting to do the reading and return a complete plan, review, or decision package.

## D-030 - Task-Adaptive Role Packs With Stable Room Responsibilities

- **Status:** Accepted
- **Date:** 2026-08-22
- **Decision:** Agenda templates such as Decide, Plan, Review, Research, and Build may recommend a participant Role Pack and per-round assignments. Roles remain provider-neutral and stable for the room; the independently configured Final Synthesizer remains outside the participant count. Reusing a participant for synthesis is an explicit savings mode, not the default architecture.
- **Reason:** three generic roles do not create the same useful tension for every objective. Task-shaped responsibilities improve coverage without making roles mutate opportunistically or hiding synthesis bias and cost.

## D-031 - Durable Transitions Outlive a Page View

- **Status:** Accepted target
- **Date:** 2026-08-22
- **Decision:** the post-M2 local architecture moves provider-transition execution behind a durable runner boundary and lets the UI reconnect through persisted events and a cursor. Navigating away detaches the view rather than pausing work. An ambiguous in-flight request is never silently restarted or presented as a completed resumable transition.
- **Reason:** a React page lifecycle cannot reliably own paid long-running work. Event-based reconnection preserves continuity while retaining the honest interruption and duplicate-billing boundaries established by D-025.

## D-032 - Later Rounds Must Name and Route a Dispute

- **Status:** Accepted
- **Date:** 2026-08-22
- **Decision:** after the initial proposal and cross-review round, an extra debate round starts only when the Human Chair selects one open Dispute. Application code deterministically routes at most two relevant Seats, records the Dispute, source State version, source Message IDs, and routed Seats before provider work, and asks each routed Seat for a bounded Review delta. No routing-model call or full-transcript replay is allowed in this path.
- **Reason:** a maximum-round setting is a permission boundary, not a reason to rerun the whole room. Naming the unresolved issue makes every extra call attributable, keeps context and reading effort bounded, and lets interruption recovery preserve honest billing semantics.

## D-033 - Task Modes Are Orthogonal To Permission Levels

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** Review, Decide / Plan, Explore, Create, and future Play are Task Packs inside one product. Discuss, Research, and Execute remain permission levels that determine available tools and authority. Any Task Pack uses the lowest permission level sufficient for its job.
- **Reason:** the user's job and the room's authority are different concerns. Keeping them separate supports creative, analytical, research, execution, and simulation workflows without splitting the product or granting unnecessary tools.

## D-034 - Product Lines Drive Shared Core Growth

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** develop one end-to-end Task Pack at a time over a small Shared Core. Promote an abstraction into Shared Core only after at least two validated Task Packs require it; otherwise keep it local to the Pack.
- **Reason:** a generic platform designed ahead of user evidence creates speculative abstractions and delays useful outcomes, while separate standalone products duplicate provider access, persistence, budgets, and approval boundaries. The Rule of Two preserves reuse without repeating the infrastructure-first drift.

## D-035 - Review Is The First Artifact-Centered Vertical Slice

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** after one bounded real-provider v0.10c verification, the next product milestone is a Review Task Pack. It accepts an objective, Artifact v1, supplied sources, and truth constraints; produces independent Findings, bounded cross-review, a structured Change Set, Artifact v2, independent change verification, and item-level Human Gate decisions. A concise brief and detailed Artifact are separate outputs.
- **Reason:** Review directly tests whether structured model diversity produces accepted improvements that one strong model missed. It turns the current meeting machinery into a user-visible result and can be evaluated on resume, product-document, and technical-plan benchmarks.

## D-036 - Multi-Agent Autonomy Requires A Concrete Decomposition Advantage

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** multiple model Seats do not become autonomous agents by default. Add multi-agent behavior only when subtasks are independently useful, participants require distinct tools or private contexts, outputs have an explicit merge contract, and results can be verified. Research is the first planned candidate; Execute follows behind isolated tools and Human Gates.
- **Reason:** additional autonomous loops multiply cost, coordination failures, permissions, and recovery complexity. Review and Decide can first use deterministic orchestration; a general agent platform is not a prerequisite for product value.

## D-037 - Product Evidence Gates Infrastructure Work

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** do not run two consecutive infrastructure-only milestones. Every product milestone ends with a realistic case and saved baseline; every new paid model call names its expected information gain; and weak evidence causes a feature to be simplified, made optional, or removed.
- **Reason:** the project previously made the orchestrator more mature than the user outcome. Explicit correction gates keep engineering reliability in service of accepted artifact improvements rather than treating protocol completion as product success.

## D-038 - Parallel Phase Capacity and Contracts Are Code-Enforced

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** Canonical State must reserve capacity for every valid result in a bounded parallel phase before that phase starts. Proposal, Review, targeted debate, Observer, and synthesis limits are enforced by application parsers and dedicated schemas, not only described in prompts. Targeted debate uses a minimal delta Envelope instead of the general Review Envelope.
- **Reason:** the live smoke showed that individually valid parallel Reviews became order-dependent when the first accepted result consumed shared State capacity. It also showed that asking a small targeted turn to serialize unrelated empty fields can exhaust its output budget. Application-enforced worst-case capacity and task-specific contracts make paid results attributable and independent of completion order while keeping calls bounded.

## D-039 - Review Sources Are Task Inputs, Findings Are Canonical Records

- **Status:** Accepted
- **Date:** 2026-08-25
- **Decision:** Review stores its objective, Artifact v1, supplied references, and truth constraints as a bounded credential-free Task Pack, separate from the transcript. Independent reviewers receive the same Task Pack and publish Findings as source-linked canonical Claims. Cross-review may read the Task Pack again, but synthesis receives Canonical Findings and bounded turn summaries rather than the raw Artifact. Artifact v1 remains immutable until an explicit Editor phase creates a Change Set and Artifact v2.
- **Reason:** reviewers need shared evidence to disagree usefully, while later stages need stable conclusions rather than repeated full-document context. Separating source material, Findings, and generated artifacts preserves auditability, limits context growth, and prevents a summary model from silently rewriting the user's original.

## D-040 - Human Chair Finding Decisions Are Binding Records

- **Status:** Accepted
- **Date:** 2026-08-26
- **Decision:** a Review Finding Accept/Reject action is a typed Human Choice, not a free-text prompt hint. It updates the Canonical Claim to `accepted_by_chair` or `rejected_by_chair`, resolves related disputes, and persists as an append-only `human.choice` event. Later model support, opposition, or objections may add audit sources but cannot override that decision. Every Review prompt receives the trusted application date. Final Review synthesis reads Canonical State, treats rejected Claims as binding exclusions and accepted Claims as binding inclusions, and must pass the code-enforced Review Brief contract from D-038.
- **Reason:** Review Benchmark 001 showed that multiple models can confidently repeat the same false inference and ignore a free-text Chair correction. The second run showed that a deterministic item-level decision prevents that error from re-entering the canonical result. Human authority must therefore be represented in state and validation, not merely phrased in the next model request.

## D-041 - Artifact v2 Is Derived From A Source-Linked Change Set

- **Status:** Accepted
- **Date:** 2026-08-26
- **Decision:** the Review Editor may submit only bounded, non-overlapping exact replacements against immutable Artifact v1, and every replacement must reference one or more Human Chair-accepted Finding IDs. Application code validates and applies the declared replacements to create Artifact v2; the model cannot submit an opaque rewritten document. A distinct Verifier receives supplied sources, truth constraints, accepted Findings, and only the declared changed material, then returns exactly one check per Change. The detailed Artifact, Change Set, verification result, and deterministic executive Brief remain separate artifacts. Until independent system-role configuration is justified, two visible participant Seats are reused explicitly as Editor and Verifier and counted in preflight.
- **Reason:** a free-form rewrite can hide unsupported edits, while verification over the entire document recreates context growth and makes attribution weak. Deterministic application preserves unchanged text, exact Finding lineage, bounded verifier context, and an auditable Human Gate without forcing the user-facing deliverable to be as short as model working memory.

## D-042 - Independently Completed Paid Substages Need Durable Receipts

- **Status:** Accepted
- **Date:** 2026-08-26
- **Decision:** when one paid substage creates a validated artifact needed by a later paid substage, the application persists that result before the later call and resumes only the failed substage. Review Editor completion creates a source-versioned `ReviewEditCheckpoint`; Verifier recovery must match the same Artifact v1, accepted Findings, State version, and Editor snapshot, and routes only the Verifier. Preflight reserves at most one bounded Verifier recovery call. An interrupted transition without a matching receipt cannot claim substage recovery.
- **Reason:** Artifact v2 Benchmark 002 completed the Editor but failed Verifier formatting. The old composite transition consumed both agent turns, offered Resume, then stopped on budget; with more budget it would have repeated the successful Editor. A durable receipt makes recovery truthful, prevents repeated cost, and keeps the audit boundary aligned with independently useful work.

## D-043 - Paid Evaluation Uses A Stage-Gated Cost Ladder

- **Status:** Accepted
- **Date:** 2026-08-26
- **Decision:** evaluate provider-facing changes in four gates: zero-cost deterministic tests, one fixed single-stage real-provider probe, one short synthetic end-to-end smoke, and only then one realistic full benchmark. A Stage Replay accepts an explicit connection and model, uses a server-owned anonymized fixture, makes at most one call with a stage-specific output cap, performs no retry, and does not create or mutate a Meeting. A later-stage defect does not justify rebuilding already validated paid substages.
- **Reason:** full Review runs repeatedly paid for proposals, cross-review, and Editor work while diagnosing a Verifier-format boundary. Isolating the smallest uncertain stage preserves production adapter fidelity while reducing token cost, latency, duplicate work, and the temptation to optimize unrelated protocol machinery.

## D-044 - Chair Finding Amendments Are Source-Linked and Verification Is Two-Dimensional

- **Status:** Accepted
- **Date:** 2026-08-26
- **Decision:** at a Review checkpoint, the Human Chair may add a missed Finding or supersede an existing Finding only by appending a new accepted Claim with an exact excerpt from Artifact v1, supplied references, or truth constraints. The old Claim remains in history as superseded. The changed-material Verifier evaluates authorization lineage and semantic correctness independently; Chair acceptance does not prove a Finding premise or rewrite quality. Application code derives the overall status and promotes every unsupported or unverifiable Change into Remaining Human Checks.
- **Reason:** Benchmark 005 showed both models can miss an explicit constraint and that a Verifier can rubber-stamp a weak rewrite because it traces to an accepted Finding. Human correction must enter the canonical artifact pipeline without silent mutation, while verification must remain independent enough to challenge an authorized but faulty premise.

## D-045 - Working Turns and User Deliverables Have Separate Contracts

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** Proposal and cross-review statements remain concise bounded working context. A Decide / Plan synthesis is a separate user artifact with its own larger output and explicit recovery budget, required ordered sections, and task-shaped acceptance checks. Synthesis cannot mutate Canonical State through administrative Claim deltas. Restored phase context is the intersection of saved transcript turns and Canonical State; abandoned transcript branches are excluded. A local rejection before a provider starts does not spend a provider-call slot. Schedule plans must cover every requested unit, and a LeetCode objective explicitly requesting suggested problems must include concrete problem IDs rather than category labels.
- **Reason:** Smoke 006 proved that a protocol can complete while the delivered plan still fails the user's request. Concise model working memory must not force a shallow user artifact, and transport success or model agreement cannot substitute for artifact acceptance.

## D-046 - Detailed Plans Need Addressable Records, Not One Free-Form Memo

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** a detailed schedule belongs in a structured Plan Artifact whose requested units are independently validated and rendered by application code. Workload equations such as MEU are explicit fields, not prose suggestions. A short Decision memo may summarize the Plan but cannot be its only representation. Recovery targets only missing or invalid units and never replays valid units, proposals, or reviews.
- **Reason:** Smoke 007 increased the synthesis cap to 4,800 tokens, yet the model stopped at 2,092 tokens and omitted Day 2. The contract correctly rejected the artifact, proving that transport capacity does not make one free-form response a reliable multi-unit deliverable.

## D-047 - Every Development Slice Must Pass A Product Correction Gate

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** before implementation expands, every development slice records an observed failure, user artifact, baseline, smallest hypothesis, expected information gain, acceptance checks, cost boundary, and stop condition. Evaluation reports mechanical completion, semantic reliability, artifact usability, Human Gate adoption, experience, economics, and improvements unique to cross-review as separate dimensions. A mechanical pass cannot authorize generic orchestration polish when the user artifact failed. Provider-facing work follows the existing local-test, stage-replay, short-smoke, realistic-benchmark ladder. The required procedure is canonical in `DEVELOPMENT_CORRECTION_LOOP.md` and is part of repository agent instructions.
- **Reason:** recent runs repeatedly improved protocol recovery, formatting rejection, and transport limits while the final Review or Plan artifact remained shallow, semantically weak, or incomplete. Without a mandatory correction point, each local fix can enlarge a workflow whose product value is still unproven. A written hypothesis and stop condition make simplification, removal, and deferral first-class outcomes instead of treating more implementation as the default.

## D-048 - Human Review Edits Create A New Artifact Version Without Inheriting Model Verification

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** at the Review Human Gate, the Chair may edit only the `after` value of a declared Change. Change ID, Finding lineage, location, original text, rationale, and basis remain immutable. Application code reapplies the complete bounded Change Set to immutable Artifact v1 and stores the result as Artifact v3 with the edited Change IDs and exact source Artifact v2 identity. The existing Verifier result remains attached to v2; the interface must not present it as verification of human-edited text. This operation makes no provider call.
- **Reason:** whole-artifact approval forced the user to accept a weak model rewrite or spend another broad round. Preserving Change identity while versioning the human replacement provides direct control and auditability without inventing verification, weakening lineage, or increasing token cost.

## D-049 - Review Approval Publishes The Exact Visible Artifact As An Immutable Snapshot

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** approving a Review creates one credential-free `ReviewApprovedArtifact` bound to the exact visible Artifact v2 or Human Revision v3, source State version, Review result identity, Change Set, original model verification, human-edited Change IDs, and approval time. The approved snapshot and room decision persist through the same save boundary; failure rolls back both and protocol completion. Rejection creates no approved snapshot. Local immutability means application-validated version identity and disabled post-approval editing, not a cryptographic signature or cross-device authority claim.
- **Reason:** a room-level `approved` flag alone does not prove which Artifact text and revision the Chair accepted. Freezing the exact visible result closes the local audit chain while preserving honest verification scope and avoiding premature identity, signing, or synchronization infrastructure.

## D-050 - Review Comparisons Separate Public Inputs, Evaluator Oracles, and Causal Credit

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** M2.12 compares fixed versioned public source packs across a strong single model, manual copy/review, and the existing Review workflow. Evaluator-only issue anchors and hand-authored golden artifacts never enter model context or scored Chair interventions. Missing baselines remain unrun. Score discovery, artifact repair, false positives, pre/post-human adoption, and economics separately; credit cross-review only when an evidenced objection causes a material accepted change absent from the comparable baseline. Different call counts must be disclosed and cannot alone establish a model-diversity advantage.
- **Reason:** a format pass, model agreement, cosmetic rewrite, or human-supplied correction can otherwise be mistaken for the product's differentiated value. A small offline kit makes the next paid call interpretable without building another evaluation platform or modifying the meeting runtime.

## D-051 - Replay Evidence Is Accessible Without Download and Estimates Disclose Their Basis

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** the existing S1 receipt is available verbatim as selectable JSON and through clipboard/download, without a second provider call. New Replay estimates record effective provider-wide rates and per-rate default/runtime-override sources. Neither defaults nor operator overrides establish verified model pricing. Missing historical provenance stays unknown; no invoice, persisted receipt, or retroactive verification is implied.
- **Reason:** S1 009 exposed an inaccessible download and a misleadingly precise generic cost estimate. Exposing existing evidence and its actual rate basis resolves those defects without rerunning paid work or introducing a price marketplace.

## D-052 - Retaining The Original Is A Valid Human Review Outcome

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** after a completed Review checkpoint with no in-flight work, no accepted Findings, and no undecided active Findings, the Chair may retain exact Artifact v1. This creates a persisted pending result with no Changes or Editor/Verifier attribution and verification `not_run`. It does not prove factual correctness, auto-approve, or label the original v2. Existing human approval freezes v1; explicit continuation clears the active result after saving, while historical artifacts remain. The original-result transition is saved before it appears in the UI.
- **Reason:** the previous flow required at least one accepted Finding to finish, rewarding unnecessary edits. Human authority includes rejecting every proposed change without paying for an Editor or manufacturing a verification pass.
- **Sequencing:** at the user's request, evaluation-tool expansion is closed and remaining M2.12 comparisons are deferred, not passed. Bounded main-flow corrections may proceed to the known detailed-Plan artifact failure without waiting on more tooling or paid comparisons. This does not authorize new model spend, broad Task Pack expansion, or comparative-value claims.

## D-053 - Plans Persist Valid Days and Review The Actual Artifact

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** the opt-in LeetCode Plan owns a fixed day/MEU/time contract, independently validated JSONL day records, and a separate detailed Artifact outside Canonical State. Builder recovery requests missing/invalid days only and cannot overwrite accepted days. A distinct Review Seat reads the actual complete Plan and returns day-linked concerns and unresolved assumptions, not a correctness certificate. Initial artifact work is bounded to two calls and one explicit recovery allowance; no automatic retry. Complete reviewed plans require human approval into an exact snapshot. Changed contracts after generation require a new room in this first slice.
- **Reason:** the previous free-form memo contract detected missing days without retaining useful partial results. Day-level persistence and review of the real deliverable address that failure without a new generic runner. Integer workload and time checks are mechanical; problem identity/difficulty and pedagogical quality remain unverified. No semantic rewrite is applied without a future explicit human-controlled path.

## D-054 - Human Plan Edits Preserve Original Review Scope

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** a complete reviewed Plan may receive explicit human day edits before approval, without provider calls or changing the contract. Application code revalidates the complete derived Plan and stores a source-bound human revision separate from the immutable original. Only changed days are replaced. Persist before showing success; failed storage retains the draft and old version. Approval freezes the exact derived Plan and revision identity. The UI, history and copy distinguish original model review from unreviewed human edits; the model does not receive credit or automatic re-review attribution.
- **Reason:** whole-plan approve/reject left useful review concerns unactionable. A bounded manual correction path permits adoption without another paid meeting, silently rewriting accepted days or treating human changes as model-verified. Automatic semantic rewriting and changed-contract regeneration remain deferred.

## D-055 - Quality-First Plan Amendment and Recheck

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** prioritize adoptable artifacts over all-minimal settings. Within the current Plan Pack, a human selects up to3 original concerns and explicitly authorizes one editor call plus one distinct-Seat changed-material recheck. Only affected days may change; every selected concern receives an amendment or justified decline and a recheck. Original and unresolved concerns persist, no automatic retry/approval or second amendment cycle. An interrupted/failed attempt can retain the original; saved but unattempted verification may continue once. Later human edits do not inherit model verification.
- **Quality boundary:** task-shaped prompts and sufficient Plan output budgets change now, without a model switch or universal high-reasoning default. Existing recognized GPT-5-family artifact calls use medium effort; other providers/models retain defaults. The initial meeting budget and explicit additional amendment allowance are separate, neither an authoritative invoice cap.
- **Reason:** the negative core check showed criticism did not change the Plan. This bounded path tests an actual improvement chain; roleplay, longer transcripts or test counts do not establish product value. Real quality and comparative advantage still require evidence.

## D-056 - Plan Wait Policy and Explicit Artifact Recovery

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** Plan Builder, actual-plan review, amendment and recheck have no application wall-clock deadline. Plan cumulative elapsed time is telemetry, with budget value zero meaning no cumulative cutoff. Keep ordinary discussion's90s deadline, explicit cancellation, output/input limits, source validation and no automatic retries. Provider/transport/host limits may still stop work; removing our timer does not guarantee completion or stop provider charges on cancellation.
- **Recovery:** an unreviewed Plan with exactly one interrupted artifact transition can explicitly save a single recovery allowance before requesting only missing days and review, or just review. Keep all old reservations and token usage; raise only the minimum call-slot ceiling needed for at most two calls. Do not silently renew on record load, refund estimated usage, or permit another renewal after a second artifact attempt. A stopped protocol may have status complete; it is not a completed deliverable. This local guard is not server-side billing idempotency.
- **Reason:** Live010 lost an otherwise productive long generation at180s, then could not use its advertised artifact recovery. Preserve good work and make stopping a human/token/call decision instead of adapting all deep work to an arbitrary timer. Detailed wait status is honest about elapsed time in the current view, not proof of model reasoning.

## D-057 - Bounded Plan Diagnostics and Explicit Format Scope

- **Status:** Accepted
- **Date:** 2026-08-27
- **Decision:** initial Builder/reviewer checkpoints retain at most four attempt summaries, each with at most twelve line/day rejection details and total rejection count. Preserve reported finish/usage separately from validation outcome; absent usage is unknown, not zero. No raw response, key or private reasoning is retained, and diagnostic metadata is excluded from Plan model prompts. Missing historical evidence is never reconstructed. Amendment/recheck receipts and authoritative billing remain separate work.
- **Instruction scope:** new format-only Chair directions must name the current proposal/review/synthesis phase and round. Only that phase receives them. Ordinary lasting requirements and legacy corrections retain their meaning; old archived/frozen Plan contexts are not silently migrated. Reset the one-shot format selection after a successful save.
- **Reason:**011's generic failure made targeted correction impossible, and010's temporary format instruction was visible in later context. Capture enough evidence and prevent new cross-phase leakage without pretending to know the old failure's cause, relaxing artifact validation, changing model budgets or introducing another paid retry.

## D-058 - Reasoning Depth Follows Plan Responsibility

- **Status:** Accepted locally; live evidence required
- **Date:** 2026-08-29
- **Decision:** for recognized original GPT-5 IDs, structured Plan Builder requests low reasoning while actual-plan review, amendment and recheck retain medium. Ordinary discussion remains minimal. Anthropic, Gemini and unrecognized models retain provider defaults; do not guess incompatible thinking controls. This supersedes D-055 only for Builder effort. Models, output ceilings, prompts, validators, call budgets and retry policy remain unchanged.
- **Evidence contract:** initial Plan attempt diagnostics may retain the requested bounded setting separately from provider-reported reasoning tokens. Historical records without the field remain valid. A requested setting is not proof of effective internal behavior, quality, cost or visible-output reservation.
- **Reason:** artifact assembly and semantic judgment have different responsibilities. The smallest testable response to011's possible reasoning pressure is one lower Builder setting, not globally minimal reasoning or a larger cap. Local payload tests establish configuration only; PLAN-03 remains in progress until an explicitly authorized one-stage result completes usable days with finish/usage evidence.

## D-059 - Detailed Plans Start With The Requested Artifact

- **Status:** Accepted; mechanical live path verified, review quality open
- **Date:** 2026-08-29
- **Decision:** a fresh Detailed Plan skips generic proposal and cross-review phases and starts directly with one designated Builder followed by one independent actual-artifact Reviewer. The initial protocol and preflight reserve exactly those two calls, 16,000 plus 6,000 output tokens, no Observer and no automatic retry. A Builder failure ends before review. Any recovery or changed run requires an explicit human action and fresh applicable cost authority; an advisory dollar estimate is not a provider invoice cap.
- **Compatibility:** ordinary Decide and Review retain their existing discussion-history gates. A fresh Plan may bind its artifact to Canonical State version zero. The route still validates the Plan contract, exact Builder/Reviewer composition, state identity, day records and review schema before completion.
- **Reason:** the user's product is valuable only when critical review examines the requested deliverable. Spending four generic calls before the Plan exists added cost and shared framing without producing artifact evidence. Live012 also proved that reusing old synthesis and artifact-version assumptions blocked the new entry path before quality could be evaluated.

## D-060 - Plan Review Uses Provider-Native Structure Without Surrendering Local Validation

- **Status:** Accepted locally; live verification pending
- **Date:** 2026-08-29
- **Decision:** an actual Plan Reviewer may request provider-native JSON Schema output only when its adapter and exact model family are explicitly supported. Anthropic Fable 5 and the documented compatible Claude families receive `output_config.format` for the Plan review schema; unsupported Anthropic IDs and unrelated calls omit it. The application still owns day bounds, field lengths, collection limits, and Plan semantics. It may unwrap one response consisting solely of a JSON Markdown fence, but rejects prose surrounding embedded JSON. Refusal, truncation, transport failure, schema failure, or semantic failure never triggers an automatic paid retry.
- **Reason:** Live014 proved that Fable can complete an expensive actual-artifact review while portable prompt-only JSON still fails the machine contract. Provider-native structure can remove transport-format variance, but it cannot verify grounded criticism or transfer canonical authority to a vendor schema. This is a narrow adapter capability, not a general rewrite of every Turn Envelope.

## D-061 - Stopped Protocols Preserve Provenance and Recovery Must Be Executable

- **Status:** Accepted and verified locally
- **Date:** 2026-08-29
- **Decision:** stopped protocol snapshots may carry an optional `stopReason` of `human` or `budget`. Budget Gates persist `budget`; explicit host cancellation persists `human`; legacy stopped snapshots without provenance remain valid and receive a neutral label. Any transition out of stopped state clears the reason. A saved Plan recovery is offered only when both its structural contract and the preserved usage budget allow the exact pending calls. An unavailable recovery remains explained and disabled, while the handler independently rechecks the same budget.
- **Reason:** a recovery control is a promise that the system can execute the next action. Structural eligibility alone made a known budget failure look actionable, while collapsing every stopped state into Human Chair attribution corrupted the audit trail. This decision does not infer provider billing, refund usage, migrate legacy records, or solve detached background execution.

## D-062 - Each Paid Plan Stage Has One Lifecycle Receipt

- **Status:** Accepted and verified locally for new Plan requests
- **Date:** 2026-08-30
- **Decision:** before invoking a Plan Builder or Reviewer provider, the route emits a strict `started` `PlanAttempt` containing the request identity, stage, cap and requested reasoning setting while finish and usage remain unknown. The terminal accepted, rejected or provider-error attempt replaces that same request/stage in place. A terminal receipt cannot regress to started. Absence of a Reviewer receipt means the Reviewer stage was not entered; a surviving started receipt means provider usage may be unknown and must never be treated as zero.
- **Reason:** the enclosing two-Seat synthesis transition reserves work but cannot truthfully state which paid stage began. A small stage receipt closes that audit gap without exposing secrets, retaining raw model output, inventing usage, refunding unknown calls, rewriting historical evidence or building a general billing ledger.

## D-063 - Provider Prefix Detection Is A Local Hint, Not Verification

- **Status:** Accepted and verified locally
- **Date:** 2026-08-30
- **Decision:** Connection Setup may infer one of the three supported providers only from a small ordered set of current high-confidence prefixes: Anthropic `sk-ant-`, Gemini `AIza` or `AQ.`, and the existing supported OpenAI `sk-` forms. Anthropic is checked before OpenAI because their prefix families overlap. An unknown format remains unresolved and requires explicit user selection. Prefix inference never verifies validity, ownership, scope, billing, model access or region eligibility.
- **Security boundary:** the browser performs inference locally. It must never discover identity by submitting the same credential to several providers. Model discovery receives the key only after one provider has been explicitly selected or locally inferred; it calls that provider only. Rules stay isolated and tested because vendor formats can change.
- **Reason:** Google is transitioning Gemini API access from standard keys to authorization keys and new AI Studio keys may use `AQ.`. Treating a volatile convenience format as proof would create both reliability and secret-exposure risk. A conservative local hint removes needless Setup friction without broadening the supported provider surface.

## D-064 - Ask The Room Is The Narrow Entry To A Broad Multi-AI Workspace

- **Status:** Accepted
- **Date:** 2026-09-18
- **Decision:** the product destination is one human-chaired Multi-AI workspace spanning ordinary conversation, Review, Explore, Create, Research, rule-bound Play, read-only Project Rooms, and later controlled Execute. The narrow recurring entry is **Ask the Room**: promote an existing answer, idea, choice, or artifact to one or two independently prompted Challengers, preserve consequential differences, and let the Human Chair stop, follow up, or enter a Task Pack. Review remains the first trust Pack, not the product boundary. Development alternates Habit and Trust evidence through one bounded build queue. Astrology, games, and coding-context ideas begin as time-boxed Labs; Codex and VS Code integration begins read-only before any execution authority.
- **Sequencing:** [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md) is canonical for forward priority: DP-0 product truth, DP-1 Quick Council, DP-2 Review evidence, DP-3 Pack contract, DP-4 Explore/Create, DP-5 Research, DP-6 Play proof, DP-7 read-only Project Room, DP-8 controlled Execute, and DP-9 selective productization. Historical `M0` through `M5` entries remain evidence and implementation status, not the forward build order when they conflict.
- **Reason:** narrowing the audience to professional document review would discard the original value of independent model challenge in everyday, creative, entertaining, and project work. Attempting every scenario at once would create an unbounded platform. A narrow user action plus progressive interaction depth preserves the broad ambition while keeping each development slice testable, reversible, and evidence-gated.
