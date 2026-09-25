# Detailed Development Milestones

Status: Approved
Approved: 2026-09-18
Current stage: DP-0 - Product Truth and First-Minute Experience
Current milestone: DP-0.2 - Engineering Portability Baseline

This document is the canonical forward development sequence for the approved [Product Development Plan](PRODUCT_DEVELOPMENT_PLAN.md). The historical `M0` through `M5` roadmap remains evidence of implemented and incomplete work; it no longer determines the next build order where it conflicts with this document.

## 1. Planning Model

### Stage, milestone, and slice

- A **stage** (`DP-x`) is one user-value gate and may contain several milestones.
- A **milestone** (`DP-x.y`) produces one inspectable user or engineering outcome.
- An **implementation slice** is the smallest Correction Brief, code change, evaluation, and closeout that advances one milestone.
- Only one implementation slice is active at a time.

### Status vocabulary

- **Complete:** exit evidence exists and limitations are recorded.
- **Current:** the only milestone allowed to drive the next implementation brief.
- **Ready:** dependencies are met, but the milestone is not active.
- **Planned:** sequenced but still depends on earlier evidence.
- **Lab:** time-boxed exploration with no Shared Core authority.
- **Deferred:** intentionally outside the active train.
- **Removed:** evidence rejected the work; history remains.

### Milestone size budget

- **S:** one bounded behavior, normally one to three inspectable commits.
- **M:** several dependent slices; must be split before implementation.
- No milestone may enter implementation as **L**. It must first be decomposed.
- A provider-facing milestone follows local fixture -> one-stage replay -> short smoke -> realistic benchmark.
- Paid calls, external publication, and Execute actions always require their own current authority.

### Definition of Done

A milestone is complete only when:

1. its user artifact or observable behavior exists;
2. deterministic acceptance checks pass;
3. any required human rubric is scored;
4. cost, latency, reading burden, and failure behavior are recorded where applicable;
5. the result is compared with its stated baseline;
6. known limitations and rejected claims remain visible;
7. Roadmap, Devlog, Handoff, Decisions when durable, and Chinese mirrors are current;
8. the milestone closes as Continue, Repair, Simplify, Archive, Defer, or Remove.

## 2. Product Train

```text
DP-0 Product truth and first-minute experience
  -> DP-1 Quick Council / Ask the Room
  -> DP-2 Review trust evidence
  -> DP-3 Pack contract and adaptive home
  -> DP-4 Explore and Create
  -> DP-5 Research and scenario forecasting
  -> DP-6 Play Pack proof
  -> DP-7 Read-only Project Room
  -> DP-8 Controlled Execute
  -> DP-9 Productization and selective scale
```

Labs may run between stages only when they have a fixed fixture, a small budget, no new Shared Core abstraction, and an explicit Promote / Repeat / Archive decision.

## 3. Existing Capability Ledger

### Reuse now

- provider adapters, session BYOK, Connections, Models, Roles, and Seats;
- bounded streaming, request receipts, budgets, interruption recovery, and duplicate guards;
- local-first RoomStore, events, snapshots, artifacts, versions, and usage records;
- Human Chair decisions and exact approved snapshots;
- Review Change Set lineage and Plan addressable-record lessons.

### Preserve but do not expand without evidence

- Observer and Round Brief machinery;
- generic cross-review and targeted debate;
- LeetCode-specific Plan schema and recovery policy;
- provider-native structured output beyond its verified contract;
- broad role, skill, routing, and autonomy frameworks.

### Repair in DP-0

- stale product/version/status language;
- package identity and package-manager ambiguity;
- mode-switch objective leakage;
- no keyless path to inspect product value;
- missing export;
- TypeScript ambient declarations and Windows source-test portability;
- public endpoint authentication, rate-limit, and workspace-key policy ambiguity;
- large-page and large-route ownership boundaries only where DP-0/DP-1 changes touch them.

## 4. Stage Summary

| Stage | Release outcome | Primary evidence | Stage exit |
| --- | --- | --- | --- |
| DP-0 | Inspectable Foundation | first-run comprehension and clean engineering baseline | a user can understand, demo, start Solo, and export safely |
| DP-1 | Daily Council Alpha | repeated Ask the Room use | useful unique deltas justify the added cost and reading |
| DP-2 | Trust Pack Beta | matched Review comparison | accepted high-impact improvements beat simpler baselines |
| DP-3 | Pack Platform Beta | two proven consumers plus one internal spike | shared contract works without flattening Pack protocols |
| DP-4 | Expressive Workspace Beta | retained ideas and voice-preserving edits | Explore/Create create value beyond correction |
| DP-5 | Grounded Research Beta | sourced claim coverage and contradiction handling | adopted briefs remain inspectable and uncertainty-aware |
| DP-6 | Play Proof | complete replayable sessions | one game works without rule or hidden-state leakage |
| DP-7 | Project Room Alpha | better task/context framing | read-only project council improves saved coding cases |
| DP-8 | Execute Preview | scoped verified patches | approved actions stay inside authority and pass checks |
| DP-9 | v1 Candidate | retention, trust, safety, and viable economics | only evidenced capabilities are scaled or monetized |

## 5. DP-0 - Product Truth and First-Minute Experience

**Purpose:** expose the value already built, remove misleading state, and establish a safe baseline before adding another protocol.

**Entry:** approved D-064 direction and this milestone plan.

**Stage budget:** no paid model calls are required. No broad visual redesign. Existing Room history must remain readable.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-0.0 Direction and milestone ratification | Complete / S | approved Product Direction, D-064, detailed bilingual milestones, and historical-to-new roadmap mapping | owner approval is recorded; docs agree on DP-0 as current |
| DP-0.1 Product and repository truth baseline | Complete / S | truthful app/package name and version policy, one package-manager policy, explicit license state, current README/status language, and a recorded build/test/type baseline | starter identity and stale uncommitted claims removed; exact Windows install/build/test/lint/type results recorded, including DP-0.2 failures |
| DP-0.2 Engineering portability baseline | Current / S - local pass, CI pending | CI checks, Cloudflare ambient type declarations, CRLF-safe source tests, deterministic test command, and clean build/lint/type/test reporting | Windows `pnpm check` passes locally; the Windows/Ubuntu workflow needs its first remote run before both paths can be declared equivalent |
| DP-0.3 First-run information architecture | Planned / M | entry surface for Chat, Ask the Room, Drop an Artifact, and Browse Packs; one Connection is enough for Solo; mode-specific objective defaults | a fresh user reaches the intended input without the Connection Library obscuring the product; switching modes never leaks another mode's objective |
| DP-0.4 Credential-free demo and replay | Planned / S | one bundled, read-only room replay showing independent views, meaningful disagreement, Human Chair choice, final result, and cost provenance | a user can understand the differentiated loop without a key or provider call; demo is visibly non-live |
| DP-0.5 Artifact and room export | Planned / S | versioned Markdown plus JSON export for room summary, artifacts, lineage, decisions, usage, and schema version, excluding credentials | exported fixtures round-trip through validation; secret scanners find no key or authorization field |
| DP-0.6 Public API safety boundary | Planned / S | explicit BYOK-only or authenticated workspace-funded policy, request size/call limits, rate limiting, abuse-safe errors, and deployment checklist | an unauthenticated caller cannot silently spend workspace-funded credentials; policy is tested and documented |
| DP-0.7 First-minute acceptance | Planned / S | five fresh-user walkthroughs and one accessibility/responsive pass over Setup, demo, Solo entry, mode switch, and export | at least four users can describe the product and reach a useful surface without coaching; blocking confusion becomes a named DP-0 repair |

**Non-goals:** new providers, new agent loops, account synchronization, billing, plugin marketplace, or semantic routing.

**Stage decision:** Continue to DP-1 only when the product can be inspected without credentials and started with one Connection. Otherwise Repair DP-0; do not hide activation failure under new Council features.

## 6. DP-1 - Quick Council / Ask the Room

**Purpose:** validate the narrow daily-use action: escalate one answer, idea, or choice to independent challenge.

**Entry:** DP-0 exit passes; one strong single-model baseline is available.

**Stage budget:** two or three total views including the existing answer; at most one Difference Map call and one explicit targeted follow-up; no default Observer or automatic second round.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-1.0 Quick Council evaluation pack | Planned / S | twelve fixed cases across daily choice, reflective entertainment, creative exploration, and practical planning; single-model answers; rubric for novelty, usefulness, uncertainty, reading burden, latency, and cost | fixtures and scoring are frozen before protocol tuning |
| DP-1.1 Solo conversation path | Planned / M | one-model threaded conversation, selected-context boundary, local persistence, stop/cancel, and visible model/usage identity | one Connection completes and restores a bounded chat without constructing a full meeting |
| DP-1.2 Ask the Room escalation | Planned / M | existing answer becomes view one; one or two independently prompted Challengers receive the user objective and selected source context, not the first model's conclusion | prompts prove independence; no irrelevant transcript or private state is copied; preflight names maximum calls |
| DP-1.3 Difference Map | Planned / M | compact agreement, consequential differences, hidden assumptions, confidence limits, and recommended next step with links to full views | every mapped item traces to a view; unsupported factual agreement is not promoted to verified fact |
| DP-1.4 Human Chair actions | Planned / S | choose a direction, combine selected elements, ask one targeted follow-up, promote to Deep Council or a Pack, or stop | every action has a bounded call effect and persists an inspectable choice |
| DP-1.5 Quick Council persistence and export | Planned / S | restore, rename, duplicate-as-template, and export the question, views, Difference Map, Chair choice, and usage | refresh never repeats a paid call; exported result remains understandable without transcript order |
| DP-1.6 Daily-use evaluation | Planned / S | run the twelve fixed cases and five-person second-task trial against the frozen baseline | at least 6/12 cases produce a user-accepted unique delta, at least five trial users deliberately invoke a second task, and no unsupported fact is presented as verified |

**Non-goals:** full debate, generic consensus voting, automatic model selection, long-term personal memory, or a social feed.

**Stop / simplify:** below 4/12 useful unique deltas, or unacceptable added reading/cost, retain Ask the Room as an optional comparison card. Do not make it the default home action or add more models.

## 7. DP-2 - Review Trust Pack

**Purpose:** prove that structured challenge creates adoptable high-impact improvements over simpler workflows.

**Entry:** DP-1 establishes the lightweight challenge pattern; existing Review artifacts and frozen comparison kit remain intact.

**Stage budget:** use the existing three benchmark classes. No new evaluation platform, no broad Review rewrite, and no rerun of a valid Builder/Editor stage to diagnose a later failure.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-2.0 Evidence inventory and freeze | Planned / S | map existing Review code, Live 001-008 evidence, S1 baseline, missing arms, and unresolved semantic failures into one truth table | every proposed call answers one named unknown; historical failures remain unchanged |
| DP-2.1 Saved-artifact Reviewer closure | Planned / S | run or locally replace only the still-uncertain saved-artifact review boundary, using existing receipts and no regeneration of accepted prior work | one grounded review is accepted or the provider contract is rejected with preserved diagnostics |
| DP-2.2 Adoption-focused Review surface | Planned / M | artifact-first input, source/truth constraints, Finding decisions, Change comparison, verification scope, Keep original, edit, approve, and export without transcript dependence | a user completes the flow and can explain which text is model-verified, human-edited, or unresolved |
| DP-2.3 Matched comparison runs | Planned / M | strong single-model, manual two-model, and structured Review arms for resume, product/requirements document, and technical plan fixtures | inputs, models, budgets, outputs, evaluator-only anchors, and human decisions are archived comparably |
| DP-2.4 Value and failure analysis | Planned / S | score unique accepted changes, false findings, duplication, human edit distance, adoption, latency, cost, and reading burden | causal credit identifies which accepted improvements came from independent challenge rather than the evaluator or final author |
| DP-2.5 Review architecture decision | Planned / S | choose Retain, Simplify, or Remove for clustering, generic cross-review, targeted debate, Observer, Editor, Verifier, and participant reuse | only features supported by evidence remain on the forward path |

**Non-goals:** enterprise document management, arbitrary file formats, account collaboration, or adding more reviewers to compensate for weak evidence.

**Stage exit:** at least two benchmark classes show an accepted high-impact improvement absent from the strong single-model result, with bounded false findings and acceptable effort. Otherwise simplify to one author plus an optional independent Challenger.

## 8. DP-3 - Pack Contract and Adaptive Home

**Purpose:** promote only the boundaries demonstrated by Quick Council and Review into a reusable Pack system.

**Entry:** DP-1 and DP-2 have completed architecture decisions.

**Stage budget:** no public marketplace, remote code loading, generic plugin permissions, or Pack-defined credential handling.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-3.0 Shared-boundary evidence map | Planned / S | side-by-side map of genuinely shared versus Pack-local inputs, state, phases, artifacts, gates, budgets, and evaluation | every shared field has two validated consumers; speculative fields stay local |
| DP-3.1 Pack manifest v1 | Planned / M | versioned static manifest for intent, input schema, recommended roles, truth mode, permission level, context policy, artifact type, Human Gate, budget, and rubric | malformed or over-privileged manifests fail locally; Packs cannot inject credentials or code |
| DP-3.2 Pack runtime and persistence | Planned / M | deterministic Pack selection, state namespace, artifact registration, version migration, resume, and export hooks | Quick Council and Review run through the boundary without changing their distinct phase protocols |
| DP-3.3 Adaptive home and promotion | Planned / M | Chat, Ask the Room, Drop an Artifact, Browse Packs, recent work, and promotion from conversation to Pack using selected context only | promotion preserves source lineage without replaying an entire transcript |
| DP-3.4 Third-Pack internal spike | Lab / S | one non-production Explore skeleton built only with the documented Pack boundary | spike completes without editing provider, secret, RoomStore foundation, or core protocol switch logic |
| DP-3.5 Contract decision | Planned / S | freeze v1, repair named gaps, or roll back over-generalized fields | contract documentation and tests match only behavior with real consumers |

**Stage exit:** two production Packs and one internal spike use the boundary without protocol flattening or privilege leakage.

## 9. DP-4 - Explore and Create

**Purpose:** demonstrate that the workspace can expand and shape ideas while preserving human taste and authorial voice.

**Entry:** Pack contract v1 is stable enough for one new consumer.

**Stage budget:** one Explore workflow, one Create workflow, and one entertainment Lab. No general long-term memory or template marketplace.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-4.0 Creative evaluation fixtures | Planned / S | fixed brainstorming and revision cases with novelty, usefulness, diversity, voice, coherence, and human-selection rubrics | baseline outputs and evaluator rules are frozen before role tuning |
| DP-4.1 Explore Idea Board | Planned / M | independent divergent roles, bounded idea records, clustering, outlier preservation, and visible provenance | useful outliers remain available after clustering; duplicates do not inflate diversity |
| DP-4.2 Human curation and convergence | Planned / S | pin, merge, reject, annotate, request one surprise round, and promote selected ideas into a brief | models cannot silently reintroduce rejected ideas; selected lineage survives export |
| DP-4.3 Create artifact memory | Planned / M | one Author, bounded editorial roles, versioned sections, voice/continuity constraints, and retrieval of relevant sections instead of full-manuscript replay | revision improves the rubric without flattening voice or losing immutable earlier versions |
| DP-4.4 Reflective entertainment Lab | Lab / S | one explicitly interpretive astrology-style template with playful roles, user framing, and shareable output | users understand it is entertainment; factual authority and deterministic prediction language are absent |
| DP-4.5 Creative value decision | Planned / S | compare saved outputs with single-model baselines and record reuse intent | retain only workflows that yield user-kept ideas or edits absent from the baseline |

**Stage exit:** Explore produces retained non-duplicate ideas and Create produces adopted, voice-preserving revisions. Entertainment labeling is understood in user checks.

## 10. DP-5 - Research and Scenario Forecasting

**Purpose:** add external evidence, freshness, and uncertainty-aware scenario work.

**Entry:** source lineage, Pack truth policy, and export are reliable.

**Stage budget:** begin with one connector class and one bounded research brief. No automatic financial action, unsupported scraping, or unbounded browsing.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-5.0 Research threat and source model | Planned / S | source types, permission boundary, freshness, citation snapshot, licensing/retention policy, prompt-injection handling, and claim-status schema | untrusted source text cannot become instructions; unsupported sources remain clearly classified |
| DP-5.1 Retrieval connector v1 | Planned / M | user-triggered search/retrieval, bounded source capture, timestamp, title, URL/identity, excerpt limits, and failure reporting | every captured source is inspectable; missing access or freshness is not hidden |
| DP-5.2 Parallel research roles | Planned / M | Lead question decomposition, bounded Search Workers with distinct scopes, and deterministic merge queue | parallelism covers non-overlapping questions and stops when expected information gain is exhausted |
| DP-5.3 Claim verification queue | Planned / M | supported, contradicted, inferred, outdated, and unresolved states with Citation Checker and Human Gate | every adopted material factual claim has source status; model agreement cannot promote it |
| DP-5.4 Company and financial scenario Pack | Planned / M | current-state brief, assumptions, scenarios, probabilities/ranges, triggers, disconfirming evidence, and update date | facts and forecasts are visually distinct; uncertainty and non-advice boundary are explicit |
| DP-5.5 Research benchmark | Planned / S | fixed questions compared with one strong research model and manual research | citation correctness, coverage, contradiction visibility, time, cost, and unsupported claims are scored |

**Stage exit:** an adopted brief can be audited claim by claim, conflicting evidence remains visible, and the system can stop with unresolved questions.

## 11. DP-6 - Play Pack Proof

**Purpose:** validate replayable multi-agent entertainment under deterministic rules and privacy boundaries.

**Entry:** Pack runtime supports Pack-local state and visibility policy.

**Stage budget:** exactly one game. Select a game small enough to implement a complete deterministic engine. No generic game platform until replayed sessions pass.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-6.0 Game selection and formal spec | Planned / S | chosen game, state machine, legal actions, win/stop rules, public/private fields, randomness, turn bound, and test fixtures | every rule is expressible without model judgment; ambiguous rules are resolved before coding |
| DP-6.1 Deterministic game engine | Planned / M | application-owned reducer, legal-action validator, seeded randomness, stop conditions, and scripted players | full scripted games complete reproducibly; illegal actions fail without state mutation |
| DP-6.2 Private Seat state | Planned / M | per-Seat views, server/client visibility enforcement, redacted events, reconnect, and spectator boundary | adversarial tests show no hidden information in prompts, UI, exports, logs, or other Seat events |
| DP-6.3 AI turn adapter and personality | Planned / M | model chooses only from legal actions and may add bounded in-character presentation | invalid model output cannot alter rules; personality remains separable from action validity |
| DP-6.4 Replay and Human Host | Planned / S | complete state-transition replay, pause, remove/replace Seat, resolve timeout, and end session | host actions are append-only and replay reproduces the same public result |
| DP-6.5 Playtest decision | Planned / S | repeated human sessions measuring completion, leakage, rule errors, latency, delight, and replay intent | users voluntarily replay; zero hidden-state leaks and zero accepted illegal actions |

**Stage exit:** one game is complete, replayable, and requested again. Otherwise archive the Lab; do not build a generic engine.

## 12. DP-7 - Read-Only Project Room for Codex and VS Code

**Purpose:** improve project framing, prompt context, and review before allowing any write authority.

**Entry:** Research source boundaries and Pack permissions are proven.

**Stage budget:** read-only filesystem/project snapshots only. No command execution, patch application, Git mutation, secret scanning upload, or background agent loop.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-7.0 Project threat and context contract | Planned / S | path scope, exclusions, secret policy, binary/large-file policy, ignore rules, snapshot identity, user consent, and retention | test fixtures prove traversal and excluded-path denial; prompts contain only approved context |
| DP-7.1 Read-only project snapshot | Planned / M | file tree, selected files, Git metadata when allowed, user-pinned context, content hashes, and change detection | snapshot is reproducible and never reads outside the approved root |
| DP-7.2 Context Critic | Planned / M | detect missing constraints, stale assumptions, contradictory instructions, irrelevant context, and proposed context additions/removals | each recommendation cites project evidence or identifies a user question; no private reasoning claim |
| DP-7.3 Project Council roles | Planned / M | Planner, Context Critic, Builder-proposer, Reviewer, and Tester-planner with isolated task-shaped context | each role owns an inspectable contribution; synthesis preserves unresolved risks |
| DP-7.4 Plan and patch proposal artifacts | Planned / M | implementation plan, proposed diff or file-level change set, tests, risks, rollback, and Human Gate without applying changes | proposal validates against snapshot identity and remains visibly unapplied |
| DP-7.5 Codex and VS Code adapters | Planned / M | explicit import/export or connector contracts using documented interfaces and user-selected context | adapters do not assume access to private model reasoning and cannot silently widen project scope |
| DP-7.6 Project benchmark | Planned / S | saved coding tasks comparing original single-agent framing with Project Room output | material missing constraints or defects are caught, context size remains bounded, and no file is modified |

**Stage exit:** read-only Project Room improves accepted task framing or catches a material issue in multiple saved cases without unrelated-file exposure.

## 13. DP-8 - Controlled Execute

**Purpose:** turn an approved Project Room artifact into a verified, bounded action.

**Entry:** DP-7 passes; execution threat model and explicit user authority are current.

**Stage budget:** one repository, one bounded task, one isolated branch/worktree or equivalent, one execution plan, and no unattended recursion.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-8.0 Authorization and action model | Planned / S | typed permissions for read, write, command, network, secret, external service, commit, and publish; expiry and revocation | every action maps to explicit authority; denial is the default |
| DP-8.1 Isolated local connector | Planned / M | authenticated local control channel, scoped workspace, sandbox profile, resource limits, cancellation, and append-only action receipts | hosted control plane cannot gain unrestricted machine access; connector rejects out-of-scope paths/actions |
| DP-8.2 Approved execution plan | Planned / S | exact files/actions/tests/limits/rollback and preflight diff expectation signed off by the Human Chair | no mutation starts without a matching approved plan version |
| DP-8.3 Executor and deterministic checks | Planned / M | bounded change application, command/test runner, artifacts, stdout/stderr limits, and idempotency keys | repeated recovery does not duplicate completed actions; failures preserve inspectable state |
| DP-8.4 Independent review and amendment | Planned / M | Reviewer sees resulting diff and declared tests, not executor private reasoning; one bounded amendment loop | reviewer findings trace to diff/test evidence; unresolved high-impact risk blocks approval |
| DP-8.5 Rollback and final Human Gate | Planned / M | recoverable checkpoint, rollback procedure, exact final diff, test report, receipts, and approve/reject/publish separation | reject or rollback returns to the declared boundary; approval does not imply publication |
| DP-8.6 Execute evaluation | Planned / S | fixed low-risk tasks measuring scope adherence, correctness, recovery, human effort, cost, and security failures | one complete task passes all declared checks with zero out-of-scope change before broader preview |

**Stage exit:** a bounded approved task produces an inspectable patch and verified result without exceeding authority. Any scope or permission breach stops the stage and triggers security review.

## 14. DP-9 - Productization and Selective Scale

**Purpose:** scale only capabilities that have demonstrated repeated habit or trust value.

**Entry:** at least one Habit Pack and one Trust Pack have repeat use; DP-8 is not required for a non-execution v1.

| Milestone | Status / size | Deliverable | Exit evidence |
| --- | --- | --- | --- |
| DP-9.0 v1 evidence review | Planned / S | retention, adoption, trust, cost, safety, and Pack evidence with explicit keep/remove decisions | v1 scope contains no feature justified only by implementation sunk cost |
| DP-9.1 Identity and encrypted sync | Planned / M | account ownership, deletion, encrypted secret policy, device/session model, conflict rules, and local-only option | cross-user access tests pass; local rooms are not silently uploaded |
| DP-9.2 Billing and limits | Planned / M | BYOK and platform-funded boundaries, quotas, authoritative receipts where available, budget alerts, and abuse controls | users know who pays; advisory estimates are not presented as invoices |
| DP-9.3 Collaboration | Planned / M | invitation, role permissions, shared artifact decisions, audit identity, and conflict handling | one user cannot approve or expose another user's protected material without permission |
| DP-9.4 Curated Pack distribution | Planned / M | signed/versioned reviewed Packs, declared permissions, compatibility, uninstall, and provenance | no remote arbitrary code or hidden credential access; every Pack has a maintained owner and rubric |
| DP-9.5 Release hardening | Planned / M | security review, accessibility, performance, backup/export/import, support runbook, data policy, and release checklist | release candidate passes the published support matrix and rollback drill |

**Stage exit:** the product has repeat use, defensible trust evidence, sustainable unit economics, and safety boundaries appropriate to the enabled permissions.

## 15. Lab Queue

Labs never pre-empt the Current milestone. Each has one fixture, one user-visible output, no Shared Core extraction, and a maximum of one implementation slice plus one evaluation slice.

| Lab | Earliest entry | Question | Promote only if |
| --- | --- | --- | --- |
| LAB-A Reflective astrology | after DP-1.3 | can multiple interpretive voices create a more engaging reflective artifact without false authority? | users save/share it, understand the entertainment label, and request reuse |
| LAB-B Board-game paper protocol | after DP-3.2 | can a tiny deterministic game produce fun model interaction within strict private-state rules? | scripted rules pass and users request a second session |
| LAB-C Coding context audit | after DP-2.4 | can independent context critique improve a saved coding task before any repository connector exists? | it finds accepted missing constraints on multiple fixtures |

## 16. Immediate Ordered Queue

1. **DP-0.2 Engineering portability baseline** - close the recorded Windows script, CRLF-source-test, Cloudflare ambient-type, and deterministic CI-command failures before changing interaction architecture.
2. **DP-0.3 First-run information architecture** - create the required named backup, then implement one-Connection Solo entry and mode-correct objectives.
3. **DP-0.4 Demo/replay** - reuse saved evidence; make zero provider calls.
4. **DP-0.5 Export** and **DP-0.6 API safety** - complete before inviting broader public use.
5. **DP-0.7 acceptance** - decide Continue or Repair. DP-1 cannot start on documentation confidence alone.

The exact next action is the first checked Windows/Ubuntu workflow run. If both jobs pass the same `pnpm check`, close DP-0.2; otherwise repair only the observed portability delta. Do not begin DP-0.3 on local evidence alone.
