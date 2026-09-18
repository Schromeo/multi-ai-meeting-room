# Detailed Plan Delivery

Status: Local slice implemented; real-provider and browser acceptance pending

Observed failure: Smoke 006 omitted concrete problems; Smoke 007 omitted Day 2 despite a larger memo cap. The user needs a complete 10-15 day LeetCode plan, with at least 10 Medium-equivalent units daily (Hard=2, Easy=1/3), not another short summary.

Smallest hypothesis: explicit day/workload/time settings, independently parseable day records, deterministic completeness and workload checks, and an independent review of the actual completed plan produce an inspectable artifact. Preserve valid days on interruption; an explicit recovery requests only missing/invalid days, or only the reviewer when all days exist. Do not replay proposals or valid days for generation. Detailed output stays outside canonical working memory.

Boundary: opt-in LeetCode Plan inside Decide, one discussion round; two synthesis calls (builder and distinct review Seat), plus one explicit recovery allowance. No automatic retry, provider change, paid test, general planning framework, or externally verified question catalog. Mechanical validation does not establish pedagogical quality or problem difficulty accuracy. Persist partial/complete plans and exact human approval; incomplete/unreviewed plans cannot be approved.

Offline acceptance: 12-day complete fixture, workload arithmetic, duplicate problems, missing day, malformed/truncated line, reviewer failure/resume, stale input rejection, budget accounting, history/approval integrity, readable day view. Existing Review/Decide behavior remains compatible. Frontend recovery backup: `/private/tmp/meeting-room-before-plan-20260827.tar.gz`.

Stop after the bounded path and local tests. Report semantic quality, real-provider compatibility, and comparative value as untested. Do not consume a previous budget.

Result: the opted-in Plan now builds/resumes day records, independently reviews the actual artifact, renders daily work, and saves exact human approval. Build and 45 tests pass; the missing-Day-2 and review-only recovery cases use mocked providers. Synthetic problem fixtures establish mechanical completeness, not a pedagogical golden answer. Storage/browser fault behavior remains untested; live provider compatibility, adoption and differentiated value are unknown. Four existing typing defects fixed; three Cloudflare declaration errors remain. Zero real calls. Stop implementation here and inspect this flow before broadening it.
