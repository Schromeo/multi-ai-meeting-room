# Correction Brief — readable Meeting and full transcript export

- Observed failure: the owner's saved Chinese creative Meeting shows literal Markdown markers in Focus/Overview, and the existing diagnostics export intentionally omits meeting content. Current room records also keep Chair directives outside the transcript.
- User artifact: a readable Meeting surface and an explicit, downloadable Markdown record for one saved room, available during a meeting or afterward, containing agenda, seat provider/model/role, ordered turns, recorded human directions, usage and final artifact/status.
- Baseline: plain-text rendering; privacy-safe diagnostic JSON only; manual screenshots/copying needed to reconstruct the meeting.
- Smallest hypothesis: render saved speech with safe GFM and project the existing persisted room plus Chair events into a separate Markdown file. Do not change model prompts, meeting protocol, storage schema or diagnostic export.
- Information gain: deterministic UI/export verification only; zero provider calls.
- Acceptance: headings/lists/tables render without raw markers, raw HTML stays inert; a saved room exports one UTF-8 Markdown file with chronological transcript order and human directives anchored after their recorded message; secrets and unsaved/unknown timings are not invented; live and archived controls work; offline tests/build/lint/types pass.
- Cost boundary: no paid calls or automatic retry; one local dependency pair for safe GFM rendering; no new persistent store.
- Stop condition: stop at readable UI and accurate existing-record projection. If old records lack a human event or per-turn time, state the omission; do not reconstruct it from model text or expand into universal SDK/export/import.
