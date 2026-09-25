# DP-0.3 Local Entry/Solo Slice

Date: 2026-09-24
Status: Local implementation and simulated-provider verification; DP-0.3 remains Current

- Fresh sessions now show Chat, Ask the Room, Drop an Artifact, and Browse Packs before the existing Seat composer. Chat is the initial surface, its session-only Connection manager is explicit, and it does not auto-open a setup modal. Ask the Room currently opens the existing two/three-Seat Decide room; it is not yet the later Quick Council runtime. Browse Packs exposes only the existing Review and Decide/Plan packs.
- Solo uses one session BYOK Connection, a selected model, at most 12 context messages / 24,000 characters, one 1,600-output-token provider request, no automatic retry, and no meeting-history write. The API refuses workspace-funded credentials on this path. Switching Connections clears the in-page conversation to avoid carrying its context to a different provider.
- Review and Decide each retain their own objective draft during entry/task-mode switching. A new session has no prefilled Review fixture. The existing saved-room restore still assigns the saved mode and exact objective; this is source-level evidence, not yet an old-record browser replay.
- Local `pnpm check` passes: build, 65 tests (including Solo validation and a one-call mocked provider response), lint, and type check. `git diff --check` passes. No live provider call, credential, deployment, or remote write was used for this slice.
- Browser checks on local `pnpm dev`: four entries and Solo input appear without a setup overlay; Decide draft survives a switch to Review and back; at 390px width all four entry cards are visible and document width equals viewport width. This is a narrow layout/state pass, not a usability study or a live Solo quality result.
- A separate local `pnpm start` check returned HTML but 404 for its generated `/assets/*.css` path, producing an unstyled page. The same CSS loaded under `pnpm dev`. This production-start asset behavior is unresolved and is not counted as a passed production visual gate.

Remaining DP-0.3 gates: old Review/Plan record reopening in a browser, full desktop interaction pass, resolution or explicit classification of the production CSS issue, and one separately authorized real-provider Solo usability check if required by the milestone. Do not claim Quick Council repeat use or model-quality value from the mocked call.
