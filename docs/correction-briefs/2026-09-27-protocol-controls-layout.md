# DP-0.3 — Meeting control layout correction

- **Observed failure:** the owner's screenshot shows Chair Control, Round Allowance, and Output Budget overlapping inside the narrow Seat composer. The composer is a desktop grid column, but `.protocol-setup` always assigns three equal columns; each segmented control needs substantially more width than one column receives. The viewport-only single-column rule does not activate when a desktop viewport contains a narrow sidebar.
- **User artifact:** three readable, non-overlapping control groups in the same meeting setup, with unchanged labels and behavior.
- **Baseline:** at a roughly 370px composer, three columns leave about 110px each; Chair Control alone has three buttons. The supplied screenshot is the visual fixture.
- **Smallest hypothesis:** let the three control groups wrap according to their own available width, without changing any state or policy behavior.
- **Expected information gain:** a narrow-width visual check can confirm whether the collision is solely a layout sizing issue. No provider call is needed.
- **Acceptance:** labels, buttons, select and help text stay inside their groups; no horizontal overflow or overlap at the supplied narrow width; wider layouts remain usable; existing build/lint/tests/typecheck pass.
- **Cost boundary:** CSS-only implementation, no model calls, dependency changes, or deployment.
- **Stop:** if wrapping alone does not resolve the collision, inspect measured widths before changing component structure. Do not redesign the surrounding Seat composer.

## Result

- `.protocol-setup` now wraps by its own available width. No component logic, labels, or protocol settings changed.
- In the local browser at a 1280px viewport, the 369px composer displays three separate full-width rows; measured controls stay within their groups and visual inspection found no collision. At a 390px viewport, the groups remain separate and the document has no horizontal overflow.
- `pnpm.cmd check` exits 0: build, 75/75 tests, lint, and typecheck pass. Wrangler emitted a non-blocking sandbox log-write warning during type generation. No provider call or deployment.
