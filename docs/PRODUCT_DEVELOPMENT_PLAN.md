# Product Development Plan: Human-Chaired Multi-AI Workspace

Status: Approved
Approved: 2026-09-18

The owner approved this direction on 2026-09-18. [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md) is canonical for the staged execution sequence. Historical implementation and evaluation evidence remains valid; this plan changes forward priority rather than rewriting past results.

## Executive Thesis

Build one human-chaired multi-AI workspace that can begin as an ordinary conversation, escalate into independent model challenge when one answer is not enough, and then become a task-shaped room for review, creation, research, play, or controlled execution.

The product is not only a professional Review tool, a multi-model answer grid, or an autonomous AI company. Its durable promise is:

> When one answer is not enough, ask the room. Preserve useful differences, let the human direct them, and turn them into a better conversation, artifact, decision, or verified action.

The destination is broad. The initial repeated action is narrow: **Ask the Room**.

## Why Replan Now

### Observed mismatch

The current roadmap correctly narrowed engineering around Review and artifact quality, but the sequencing can be read as if professional document review is the product boundary. The intended product also includes everyday discussion, entertainment, brainstorming, creation, research, games, and eventually project-level agent work through Codex or VS Code.

### Existing assets to preserve

- real OpenAI, Anthropic, and Gemini adapters;
- session BYOK, Connections, Models, Roles, and Seats;
- independent proposals, cross-review, targeted disagreement, budgets, interruption recovery, and Human Gates;
- local-first room, event, state, artifact, and usage persistence;
- Review versions, source-linked changes, verification, and immutable approval;
- structured Plan generation, partial recovery, review, amendment, and exact approval.

### Baseline

The current product asks the user to configure a comparatively deep room before its value is visible. Review has the strongest artifact mechanics, but comparative advantage is still unproven. The generic Discuss path is powerful but too heavy to be the default experience for casual use.

### Smallest planning hypothesis

A single escalation action can connect the daily and professional product:

1. start with a normal answer or supplied artifact;
2. invoke **Ask the Room** only when diversity is useful;
3. show the consequential differences rather than several full transcripts;
4. let the human stop, ask one targeted follow-up, or promote the work into a deeper Task Pack.

### Information gain

This sequence tests two independent questions without building the full platform:

- **habit value:** do ordinary users repeatedly invoke a second perspective?
- **trust value:** does a structured Pack produce accepted improvements that a strong single model missed?

### Stop condition

If Quick Council produces mostly duplicate prose, becomes slower or harder to read than the value it adds, or users do not deliberately invoke it again, it remains an optional comparison action instead of becoming the default interaction. If Review does not produce accepted high-impact improvements over a strong baseline, simplify it to a single-model workflow with an optional challenger rather than expanding the protocol.

## Product Shape

### One product, four interaction depths

| Depth | User intent | Default behavior | Output |
| --- | --- | --- | --- |
| Solo | “Help me now.” | One model, ordinary conversation | Direct answer |
| Quick Council | “Check this from more than one angle.” | Two or three independent views, no full debate | Difference Map and recommended next step |
| Deep Council | “This matters; challenge the important disagreement.” | Bounded cross-review, Chair checkpoint, optional targeted round | Decision, artifact, or unresolved question set |
| Task Pack | “Use the right workflow for this job.” | Pack-specific roles, truth policy, state, artifact, and Human Gate | Review, plan, research brief, creation, game state, or action result |

The user should never need to understand this architecture before receiving value. Depth is progressive: one answer can become a Council, and a Council can become a Pack without restarting the task.

### The narrow entry is a moment, not a profession

The initial wedge is not “people who review PRDs.” It is the recurring moment:

> I have an answer, idea, choice, or artifact, but I do not want one model's blind spot to decide the outcome.

That moment appears in casual chat, astrology and reflective entertainment, purchases, travel, writing, brainstorming, document review, company analysis, financial scenarios, and software development. The shared user action is narrow even though the eventual audience is broad.

### One kernel, many truth modes

Different experiences must not share one universal “everyone speaks, then summarize” protocol. They may share infrastructure, but each Pack declares how truth and success are judged.

| Truth mode | Example | Required behavior |
| --- | --- | --- |
| Conversational | daily chat, advice | expose assumptions; do not manufacture certainty |
| Entertainment | astrology, roleplay | label the experience as interpretive or fictional; optimize for coherence and delight |
| Divergent | brainstorming | maximize useful variety before critique; preserve outliers |
| Evidence-constrained | document or project review | bind findings to supplied sources and distinguish inference from evidence |
| Research / forecast | company context, financial scenarios | cite dated sources, separate fact from assumption, express scenarios and uncertainty |
| Rule-bound | board games and simulations | application-owned legal actions, private state, seeded randomness, and replay |
| Execution | code or workspace changes | scoped permissions, isolated work, tests, approval, receipts, and rollback boundaries |

Entertainment output must never borrow the authority language of evidence-constrained Review. Research or financial scenario output must never be presented as guaranteed prediction. Model agreement is not verification in any mode.

## Shared Architecture

### Council Kernel

The Council Kernel is the reusable product core:

- Connection, Model, Role, Skill, and Seat composition;
- independent and selectively shared context;
- Human Chair controls, budgets, stop rules, and approval;
- request receipts, interruption recovery, and duplicate-call protection;
- room, event, state, artifact, version, and usage persistence;
- disagreement and uncertainty preservation;
- source lineage, permission boundaries, and export;
- promotion from Solo to Quick Council to a deeper Pack.

The current implementation already supplies much of this kernel. It should be extracted or generalized only when an active product slice needs the boundary. The Rule of Two still applies.

### Task Pack contract

After two validated Packs need the same boundary, a reusable Pack contract may own:

- entry intent and input schema;
- recommended Seat and Role composition;
- truth mode and source policy;
- phase protocol and context visibility;
- pack-local state and artifact schema;
- Human Gate and permission level;
- evaluation rubric, budget, and stop rule.

A Pack is not a prompt preset. It is a bounded behavior and artifact contract.

### Surfaces

- **Web:** primary conversation, room, artifact, history, and Pack discovery surface.
- **VS Code / Codex:** later project-context surface; begin read-only, then propose, then execute with approval.
- **Documents and project workspaces:** sources and artifacts, not automatic authority grants.
- **Local connector:** future execution plane separated from the hosted control plane.

## Development Strategy

### Two value tracks, one build queue

The product needs both of these evidence tracks:

- **Habit track:** Quick Council, Explore, entertainment, Create, and Play test frequency, delight, and sharing.
- **Trust track:** Review, Research, Plan, and Project Rooms test accuracy, adoption, and willingness to rely on the result.

They do not authorize two uncontrolled implementation streams. Only one bounded slice is active at a time. The tracks alternate evidence and share the Council Kernel only after demonstrated reuse.

### Experimental lab

Small experiments may explore the broad vision without entering the critical path:

- one astrology or reflective-entertainment template;
- one multi-agent board-game prototype;
- one prompt/context critique against a saved coding task.

Each lab is time-boxed, isolated from Shared Core, makes no platform claim, and ends with Promote, Repeat, or Archive. A successful lab may become a Task Pack only after users complete it and ask to use it again.

## Milestone Sequence

These are evidence gates, not calendar promises. Approval of this plan does not authorize paid provider calls, external publishing, or Execute actions.

### DP-0 - Product truth and first-minute experience

**Goal:** make the current product understandable and safely inspectable before adding another protocol.

**Deliverables:**

- align product identity, version/status language, and mode-specific default objectives;
- clearly distinguish Solo, Quick Council, Deep Council, and Packs in information architecture;
- let one usable Connection start Solo; require another independent Seat only when the user escalates to Ask the Room;
- add a credential-free replay/demo that shows an existing useful multi-model result;
- add artifact and room export before account synchronization;
- close public-endpoint authentication/rate-limit ambiguity before workspace-funded production use;
- make CI, TypeScript environment declarations, package-manager policy, and source-text tests portable;
- preserve the current Review and Plan records unchanged.

**Exit criteria:** a new user can explain the product after the first screen, inspect a representative result without supplying a key, enter the intended mode without inheriting another mode's objective, and export the result. Build, lint, tests, and type checking have an explicit truthful status.

**Non-goals:** visual redesign for its own sake, new agents, new providers, account sync, billing, or a generic plugin system.

### DP-1 - Quick Council MVP: Ask the Room

**Goal:** test the daily-use wedge with the lightest useful form of model diversity.

**Deliverables:**

- ordinary single-model conversation as the lowest-friction entry;
- one **Ask the Room** action from an answer, question, or selected context;
- treat the existing answer as the first view, then add one or two independently prompted challengers before any shared synthesis;
- a compact Difference Map: agreement, consequential differences, hidden assumptions, and one suggested next step;
- Chair actions: accept one direction, ask one targeted follow-up, open Deep Council, or stop;
- visible maximum calls and advisory cost before escalation;
- no Observer by default and no automatic second round.

**Evaluation set:** twelve saved cases across daily decisions, reflective/entertainment prompts, creative exploration, and practical planning, each with a strong single-model baseline.

**Initial exit target:** at least half of the cases contain a user-accepted, non-duplicative delta that changes a conclusion, constraint, or next action; the Difference Map is readable without opening every full response; unsupported factual claims remain visibly uncertain; and at least five trial users deliberately invoke Ask the Room again on a second task.

**Stop rule:** below one-third useful unique deltas, or consistently unacceptable added reading/cost, keep it as an optional compare card and do not make it the home-screen default.

### DP-2 - Review as the trust Pack

**Goal:** use the strongest existing artifact pipeline to test whether structured challenge earns trust.

**Deliverables:**

- finish the saved-artifact Reviewer boundary without regenerating known-good work;
- make source-linked Findings, changes, verification scope, and Human Gate understandable without the transcript;
- run matched strong-single-model, manual two-model, and structured Review arms on the frozen benchmark classes;
- add import/export needed to adopt the final artifact outside the app;
- preserve Keep original as a first-class successful human outcome.

**Exit criteria:** in at least two benchmark classes, structured Review produces an accepted high-impact improvement absent from the strong single-model artifact, while rejected findings, cost, latency, and reading effort remain within the frozen rubric. Mechanical completion alone does not pass.

**Stop rule:** if the structured path does not outperform the simpler arms, collapse it to one author plus an optional independent challenger and retain only the artifact/version/Human Gate pieces users adopt.

### DP-3 - Pack contract v1 and adaptive home

**Goal:** consolidate only the boundaries proven by Quick Council and Review.

**Deliverables:**

- the first reusable Pack manifest and runtime boundary under the Rule of Two;
- promotion from a conversation or Council into a Pack without copying the entire transcript;
- pack-specific truth mode, context policy, artifact, Human Gate, budget, and evaluation metadata;
- a home surface organized around Chat, Ask the Room, Drop an Artifact, and Browse Packs;
- saved templates without a public marketplace.

**Exit criteria:** Quick Council and Review use the shared boundary without losing their distinct protocols, and a third internal Pack can be prototyped without editing provider or persistence foundations.

### DP-4 - Explore and Create

**Goal:** prove that the same product can support delight and creative continuity, not only correction.

**Deliverables:**

- Explore Idea Board with divergent roles, clustering, useful-outlier preservation, and human curation;
- Create with one designated Author, editorial roles, versioned sections, and bounded Artifact Memory;
- one clearly labelled entertainment template, such as reflective astrology, implemented as an Explore experience rather than a factual authority;
- shareable, exportable results.

**Exit criteria:** Explore yields ideas users keep that a single-model baseline omitted; Create improves a selected artifact without flattening voice; users understand the entertainment truth boundary.

### DP-5 - Research and scenario forecasting

**Goal:** add grounded external context only after source and artifact boundaries are reliable.

**Deliverables:**

- retrieval connectors, dated source capture, citation inspection, and freshness;
- parallel source investigation with explicit merge and contradiction handling;
- claim states: supported, contradicted, inferred, outdated, or unresolved;
- company/environment and financial scenario templates that separate facts, assumptions, probabilities, triggers, and disconfirming evidence;
- no automatic trading or consequential external action.

**Exit criteria:** every material factual claim in the adopted brief has inspectable source status, conflicting evidence remains visible, and the room can say “unresolved” instead of manufacturing consensus.

### DP-6 - Play Lab to Play Pack

**Goal:** test whether model diversity can create a replayable social experience rather than improvised rule drift.

**Deliverables:**

- one game only;
- deterministic application-owned rules and legal actions;
- public and private Seat state with visibility tests;
- seeded randomness, bounded turns, human host controls, and replay;
- AI personalities as presentation, never as rule authority.

**Exit criteria:** the game completes without hidden-state leakage or illegal actions, a replay explains every state transition, and users choose to play again. Only then consider a second game or a generic game-pack interface.

### DP-7 - Project Room for Codex and VS Code

**Goal:** turn the Council into a project-level context and prompt optimization layer before granting write authority.

**Deliverables:**

- read-only project snapshot and user-selected context scope;
- Planner, Context Critic, Builder, Reviewer, and Tester responsibilities with isolated views;
- prompt/context audit that identifies missing constraints, stale assumptions, irrelevant context, and proposed context packs;
- plan and patch proposal artifacts with tests and risk notes;
- adapter boundaries for Codex and VS Code without assuming their private reasoning is available.

**Exit criteria:** on saved development tasks, the Project Room improves task framing or catches a material issue absent from the original single-agent attempt, without writing to the repository or leaking unrelated files.

### DP-8 - Controlled Execute

**Goal:** allow verified project action only after read-only Project Rooms create dependable plans and reviews.

**Deliverables:**

- separate local or isolated execution plane;
- least-privilege workspace scope and explicit action approval;
- Planner, Executor, independent Reviewer, and deterministic Tester separation;
- idempotent receipts, patch inspection, rollback boundary, and final Human Gate;
- no unattended recursive agent organization.

**Exit criteria:** one approved bounded task produces an inspectable patch, passes declared checks, reports failures honestly, and makes no external change outside the approved scope.

### DP-9 - Productization and selective scale

**Goal:** add identity, encrypted synchronization, billing, collaboration, curated Pack distribution, and release hardening only for capabilities with demonstrated repeat use or trust value.

**Exit criteria:** the v1 candidate contains no feature retained only because of sunk engineering cost; users know who owns data and pays for calls; local-only use remains available; permissions, deletion, recovery, and release rollback are tested.

## Product and Engineering Metrics

### Habit value

- time to first useful answer;
- Ask the Room invocation and second-task reuse;
- user-kept unique perspectives;
- result saves, exports, and shares;
- reading burden and abandonment.

### Trust value

- accepted high-impact changes unique to challenge;
- unsupported, rejected, and duplicated findings;
- artifact adoption and human edit distance;
- sourced-claim coverage and unresolved-risk visibility;
- user willingness to rely on the result for the stated task.

### Economic and operational value

- calls, tokens, latency, and advisory cost per adopted result;
- failed paid work preserved by stage receipts and partial artifacts;
- recovery success without duplicate calls;
- local storage/export reliability and privacy incidents.

### Platform value

- number of validated Packs, not prompt presets;
- new Pack work that reuses the Kernel without changing it;
- abstractions promoted only after two real consumers;
- permission or context boundary regressions;
- lab experiments promoted, repeated, or archived with evidence.

## Guardrails

- Wide ambition does not mean simultaneous implementation.
- Default to the shallowest interaction depth that can solve the user's job.
- Another model call must name the expected new information.
- Preserve disagreement when it affects the result; hide repetitive transcript volume.
- Truth policy belongs to the Pack and is visible to the user.
- Fun Packs may be playful but may not impersonate evidence.
- Forecasts are scenarios with uncertainty, not guarantees.
- Play rules and private state belong to code, not model memory.
- Project access begins read-only; write authority is a later, explicit permission transition.
- No Shared Core abstraction without two validated consumers.
- Every milestone may end in Continue, Repair, Simplify, Archive, or Defer.

## Approved Direction

The owner approved these four choices on 2026-09-18:

1. **Ask the Room** is the narrow default wedge, while Review remains the first trust Pack rather than the whole product.
2. Product development alternates the Habit and Trust evidence tracks through one bounded build queue.
3. Astrology and board-game ideas begin as time-boxed Labs; success earns Pack status, while failure does not expand Shared Core.
4. Codex and VS Code integration begins as read-only context and prompt review before any execution authority.

The next implementation brief belongs to DP-0, not a new provider call or another generic orchestration feature. Each DP stage and sub-milestone, including dependencies, acceptance, non-goals, budgets, and stop rules, is defined in [Detailed Development Milestones](DEVELOPMENT_MILESTONES.md).
