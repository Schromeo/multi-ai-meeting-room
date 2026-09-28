# DP-0.1 Repository Truth Baseline

Date: 2026-09-19

Platform: Windows NT 10.0.26200.0, PowerShell 7.6.5

Runtime: Node.js 24.19.0, pnpm 11.19.0

Source basis: clean `main` at `a9a8638` before the DP-0.1 working-tree patch

Provider calls / deployment: none

## Repository Policy Established

- Private package identity: `multi-ai-meeting-room@0.0.0-development`.
- No release tags exist. Git commit, dirty state when present, and active DP milestone identify source; historical v0.x labels are development snapshots.
- pnpm 11.19.0 and `pnpm-lock.yaml` are the sole package-management path. `package-lock.json` was removed.
- The pinned `esbuild`, `sharp`, `unrs-resolver`, and `workerd` install scripts are explicitly allowed in `pnpm-workspace.yaml`; placeholder permissions were removed.
- License state is `UNLICENSED`, all rights reserved. No open-source grant is implied.
- Session BYOK remains page-memory only. A public deployment must not carry workspace-funded provider keys until DP-0.6 verifies authentication, call/request limits, rate limiting, and abuse controls.
- An unauthenticated read-only request to the documented live URL returned HTTP 401 on 2026-09-19. The deployed content version was not inspected; older deployment notes are historical, not confirmed current state.

## Command Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | **Pass** | lockfile unchanged; 491 packages reused; all four explicitly allowed install-script families completed; pnpm 11.19.0 reported `Done` |
| `pnpm build` | **Fail** | command stops before vinext build because Windows `cmd` treats `WRANGLER_LOG_PATH=.wrangler/wrangler.log` as a command: `'WRANGLER_LOG_PATH' is not recognized...` |
| `pnpm test` | **Fail** | standard test script calls `pnpm run build` first and stops at the same Windows environment-variable failure |
| `node --test tests/rendered-html.test.mjs tests/review-evaluation.test.mjs` | **Fail: 62/63 pass** | `source contains real streaming adapters and credential-free structured rooms` cannot extract `updateSeatHandler`; tracked files are LF but the Windows working tree is CRLF, while the source-regex separator requires bare LF |
| `pnpm lint` | **Pass** | ESLint completed with no reported finding |
| `pnpm exec tsc --noEmit --incremental false` | **Fail: 3 errors** | missing `cloudflare:workers`, `Fetcher`, and `D1Database` ambient declarations in `db/index.ts` and `worker/index.ts` |
| `git diff --check` | **Pass** | no whitespace error in the DP-0.1 patch |

The first non-interactive install attempt also exposed a Codex sandbox store-visibility difference: the restricted process selected a repository-local store and could not share the host user store. The final baseline ran with the normal user-level pnpm store and `CI=true`; this environment fact is not counted as a product failure. The generated repository-local `.pnpm-store` was removed and is now ignored.

## Correction Gate Result

- **Mechanical:** repository identity, one lockfile, pinned package manager, explicit install permissions, restrictive license state, and current status scans pass. The exact command failures above are independently reproducible.
- **Semantic / artifact:** no meeting, Review, Plan, persistence, or provider behavior changed. The user-facing artifact is truthful repository guidance plus this command matrix.
- **Human Gate:** not applicable; no model artifact or external action was approved.
- **Experience:** root onboarding now exposes the real product direction, supported package path, known Windows failures, and credential boundary. No browser usability claim was made.
- **Economic:** zero provider calls, zero API spend, no deployment, and no dependency upgrade. The live-site check was read-only and changed no external state.
- **Differentiated value:** not evaluated. DP-0.1 is repository truth, not evidence that multi-model work beats one model.

## Decision

DP-0.1 is complete because its exit condition is truthful, reproducible status rather than a green engineering matrix. DP-0.2 is Current and owns exactly the Windows script syntax, CRLF-safe source test, Cloudflare ambient declarations, and deterministic cross-environment command classification. Do not fold first-run UX or provider work into that correction.

See the [Correction Brief](../correction-briefs/2026-09-19-dp-0-1-repository-truth.md) and D-065 in the [Decision Record](../DECISIONS.md).
