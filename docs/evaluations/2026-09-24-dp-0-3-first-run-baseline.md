# DP-0.3 First-run Source Baseline

Date: 2026-09-24
Source commit: `97b865a` on draft PR #1
Method: read-only source and state-path inspection; no browser session or provider request

| Fresh-user fixture | Current observable source path | Result |
| --- | --- | --- |
| Open an empty session | `taskMode` initializes to `review`; `objective` initializes to a Review instruction; header starts at Setup | The initial surface assumes a professional review task before user intent is known. |
| Seek an ordinary answer | Agenda exposes Review and Decide / Plan only; room composer and Seat controls occupy the first task surface | There is no Chat/Solo entry or one-Connection direct-answer path. |
| Add one usable Connection | `canStart` requires `seats.length >= 2` for both modes; the callout asks for two model Seats | A single Seat cannot start even the simplest interaction. One Connection may be reused by two Seats, but that is still a two-Seat room. |
| Switch Review ↔ Decide / Plan | Both mode buttons call only `setTaskMode`; the single `objective` state remains unchanged | A Review objective can appear inside Decide / Plan and vice versa. |
| Start a new meeting | `createNewMeeting` clears the objective and resets mode to Review | New work returns to the Review-first surface. |
| Reopen saved work | `restoreMeeting` sets the saved objective and mode from the record | Existing room restoration has an exact objective to preserve during the correction. |

No fresh-user comprehension, keyboard path, narrow-screen layout, Solo model response, or repeated Ask the Room use was measured. These are acceptance targets, not baseline successes. The next step is the [Correction Brief](../correction-briefs/2026-09-24-dp-0-3-first-run-entry.md), a named pre-UI backup, and one bounded entry/Solo slice.
