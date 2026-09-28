# Correction Brief — stage navigation active state

- Observed failure: the owner sees Setup highlighted in the numbered header/bottom navigation even after selecting another page. The source ties Setup `active` to fewer than two ready Seats, independently of `stage`.
- User artifact: exactly one current step highlighted in the shared desktop/mobile navigation; Setup is current while its Connection dialog is open, otherwise Agenda/Meeting/Decision follows the visible page. Seat readiness still has a separate completed indicator.
- Baseline: with fewer than two ready Seats, Setup and the selected stage can both receive `active`.
- Smallest hypothesis: derive all four active classes from one current UI location (`connectionOpen` or `stage`) instead of readiness.
- Expected information gain: deterministic UI-state and source checks only; no provider calls.
- Acceptance: no double-active state on Agenda, Meeting or Decision with 0–2 ready Seats; opening/closing Setup changes only current highlight; existing completed/disabled navigation behavior remains; project check passes.
- Cost boundary: one page-component expression change and focused test; no model calls, persistence change or new dependency.
- Stop condition: stop after selected-state behavior is correct; do not redesign navigation or stage routing.
