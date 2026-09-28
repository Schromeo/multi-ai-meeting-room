# Correction Brief — Setup ownership and bounded Agenda composition

Status: Implemented and locally validated; credentialed ready-state browser check remains open. Zero provider calls.

1. **Observed failure:** With twelve Seats, Agenda Room Composition grows into a long repeated form. Its Skill fields duplicate Setup. Clicking Agenda from Setup can leave Setup selected because the Setup page is not closed.
2. **User artifact:** A fixed-height, internally scrollable read-only Seat summary in Agenda; Seat addition, removal, model, role, name, and Skill edits live in Setup. A completed, runnable Setup shows a green numbered completion mark after switching to Agenda.
3. **Baseline:** Agenda currently renders every Seat's selectors and Skill textarea; `.workspace-frame:has(.entry-switcher) .seat-list` forces visible overflow. Stage navigation chooses Setup whenever `connectionOpen` remains true.
4. **Smallest hypothesis:** Replace only Agenda's Seat editor with a compact summary, cap that list's height, and close Setup when another stage is selected. Keep the shared Seat draft, validation, provider path, and saved-room schema unchanged.
5. **Expected information gain:** Offline component/source checks and a local narrow-window walkthrough show whether twelve Seats remain inspectable without growing the Agenda page or hiding a Seat.
6. **Acceptance checks:** Twelve Seat summaries scroll within a bounded list; Agenda cannot edit Skills; Setup still edits them; direct Setup→Agenda navigation selects Agenda and marks Setup complete only when at least two Seats are runnable; narrow windows have no horizontal overflow; `pnpm.cmd check` passes.
7. **Cost boundary:** No model calls, new dependencies, persistence changes, or external publication.
8. **Stop condition:** If this requires changing role semantics or meeting execution, stop at the presentation boundary and report the issue.

Local evidence: `pnpm.cmd check` passed build, 86/86 tests, lint and types. Twelve Setup Seats appeared as twelve read-only Agenda summaries; at 390×700 the list scrolled internally and the Start control remained reachable. The valid-ready green state was checked in source/CSS tests without credentials.

## Owner follow-up: Seat participation exception

- **Observed failure / user artifact:** The owner screenshot shows an Off Seat in the Agenda summary, but the summary cannot turn it back On; Setup also offers only Add/Remove, not On/Off.
- **Baseline / smallest hypothesis:** `SeatDraft.enabled` already controls runnable Seats and budgets; expose that same switch in both surfaces without editing any other Seat field in Agenda or changing execution semantics.
- **Information gain / acceptance:** offline checks and a no-key browser pass confirm both controls exist, remain synchronized through one state field, disable while running, and leave an Off Seat configured but excluded from runnable count.
- **Cost / stop:** zero provider calls and no schema change; stop if toggling requires a second state copy or hidden retry.

## Owner follow-up: configuration gate before participation

- **Observed failure / user artifact:** An incomplete Seat can currently display On or Off even with no API Connection/model, or with a Custom role missing its name or Skill. The owner requests “Not set up” and no participation switch until configuration is complete.
- **Baseline / smallest hypothesis:** Derive one configuration verdict independently of `enabled`, then use it for both controls, the Agenda label, runnable Seats, and the launch guard. Keep the draft while incomplete.
- **Information gain / acceptance:** cover missing Connection/API key, incompatible/missing model, invalid role, Custom name/Skill, completed Off/On, and completion-regression after clearing a field. No provider call starts from an incomplete enabled Seat.
- **Cost / stop:** zero provider calls, no saved-schema or role-protocol change; stop if the existing Connection metadata cannot express a reliable configuration verdict.

Local evidence for the configuration gate: `pnpm.cmd check` passed build, 87/87 offline tests, lint and types. A no-key browser check showed `Not set up` on Agenda and Setup, no participation switches for those Seats, and disabled Start. A credentialed completion-to-toggle walkthrough remains open. No provider call, commit, push or deployment.
