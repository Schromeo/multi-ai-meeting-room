# DP-0.3 — Windowed layout access correction

- **Observed failure:** in a 1280×720 local browser window, the Agenda form is 1,133px tall while its workspace is only 556px high. The workspace and app hide overflow, so the room controls and Start meeting action below the fold cannot be reached by scrolling. At 1024×600, the header stage navigation also crowds the Meetings actions. The owner reports needing full screen to see the whole page.
- **User artifact:** every Setup/Agenda control and action remains reachable in an ordinary window without zooming or maximizing; the focused Meeting view keeps its existing stage layout.
- **Baseline:** the captured local Ask the Room screen cuts off at Seat 3. The Start meeting action begins below the viewport at about 1,218px; document/body scroll height remains 720px.
- **Smallest hypothesis:** give the entry/Agenda workspace one vertical scroll path and let its form size to content, while keeping the live Meeting stage's bounded layout. Move header stages to the existing bottom navigation earlier, before they collide with header actions. Where the Decision rail is taller than the window, let that rail scroll internally.
- **Expected information gain:** viewport measurements and visual checks at windowed desktop, tablet, and phone sizes distinguish clipping from width overflow. No provider call is needed.
- **Acceptance:** at 1280×720, 1024×600 and narrower representative viewports, Agenda's bottom action is scroll-reachable, header/entry/mode controls remain usable, and no horizontal overflow or overlapping controls appear. Chat and Browse Packs remain accessible. Existing checks pass.
- **Cost boundary:** CSS-only; no dependency, state, provider, paid call, or deployment change.
- **Stop:** if this does not make the controls reachable, measure the failing scroll container before changing page structure. Do not redesign the Meeting protocol or Task Packs.

## Result

- Entry/Agenda/Chat/Packs now use the workspace as one vertical scroll container. Agenda and Solo content size to their contents; the Seat list no longer creates a competing scroll area. Live Meeting layout is unchanged. A too-tall Decision rail now has its own vertical scroll boundary.
- The stage navigation switches to its existing bottom placement at 1180px instead of 980px. At 1181px, measured header groups have no overlap; at 1024×600 the navigation is separated from the header actions.
- Local browser checks: at 1280×720, 1024×600, 900×650 and 390×700, the Agenda bottom action is reachable by scrolling and the document has no horizontal overflow. At 390×700, Chat's Send action is reachable through the same workspace scroll; Browse Packs is visible. A 1024×600 Connection dialog remains within the viewport with its own content scroll.
- `pnpm.cmd check` exits 0: build, 75/75 tests, lint and typecheck pass. Wrangler emitted a non-blocking sandbox log-write warning during type generation. No provider call, stored-room mutation, remote CI or deployment.
- **Limit:** the live Meeting and restored Decision surfaces were not browser-exercised because this local browser had no configured Connection or saved room. Decision-rail scrolling is a CSS boundary check, not a completed end-to-end acceptance claim.
