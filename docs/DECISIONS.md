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
