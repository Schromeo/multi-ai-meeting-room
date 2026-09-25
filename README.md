# Multi-AI Meeting Room

A human-chaired workspace where independent AI perspectives challenge consequential differences and produce inspectable artifacts, decisions, and eventually verified actions.

This repository is a private, pre-release development build. It has no release tags; current source is identified by the Git commit and the active `DP-*` milestone. Historical `v0.x` labels in evaluations describe preserved development snapshots, not published package releases. The package therefore uses `0.0.0-development` until the owner deliberately creates a tagged release.

The implemented foundation includes OpenAI, Anthropic, and Gemini adapters; session-only BYOK; reusable model Seats; bounded discussion, Review, and structured Plan paths; Human Gates; and credential-free browser-local room history. The canonical forward queue is the [Detailed Development Milestones](docs/DEVELOPMENT_MILESTONES.md). Product quality evidence remains incomplete: Review and Plan have useful mechanical evidence and known semantic failures, so this repository does not claim that multi-model review is already superior to one strong model.

## Product Structure

Task Packs define the job: **Review**, **Decide / Plan**, **Explore**, **Create**, and future **Play**.

Permission levels define authority:

- **Discuss**: deliberation, critique, synthesis, and decision artifacts.
- **Research**: Discuss plus retrieval, sources, and claim verification.
- **Execute**: Research plus permissioned tool or coding-agent actions.

## Project Documents

- [Project charter](docs/PROJECT_CHARTER.md)
- [Product direction](docs/PRODUCT_DIRECTION.md)
- [Product development plan](docs/PRODUCT_DEVELOPMENT_PLAN.md)
- [Detailed development milestones](docs/DEVELOPMENT_MILESTONES.md)
- [Development correction loop](docs/DEVELOPMENT_CORRECTION_LOOP.md)
- [AI handoff](docs/AI_HANDOFF.md)
- [Roadmap](docs/ROADMAP.md)
- [Development log](docs/DEVLOG.md)
- [Decision record](docs/DECISIONS.md)
- [Meeting protocol blueprint](docs/MEETING_PROTOCOL_BLUEPRINT.md)
- [Model and agent blueprint](docs/MODEL_AND_AGENT_BLUEPRINT.md)
- [Provider configuration](docs/PROVIDER_CONFIGURATION.md)
- [Chinese quick-read index](docs/zh-CN/README.md)

Any agent working in this repository must follow [AGENTS.md](AGENTS.md).

## Local Development

The only supported package-manager path is pnpm. The repository pins pnpm 11.19.0 in `package.json` and tracks only `pnpm-lock.yaml`. Use Node.js 22.13 or newer.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm check
```

### One-click start on Windows

After installing Node.js 22.13+ and pnpm 11.19.0, double-click `start-meeting-room.cmd` in the repository root. The launcher changes to the repository directory, installs the locked dependencies only when `node_modules` is missing, starts the development server on port 3000, waits for a healthy HTTP response, and opens `http://localhost:3000` in the default browser.

In VS Code, run `Start Meeting Room` from **Terminal > Run Task**. The command-line equivalent is `pnpm launch`. Stop the task with the terminal stop control; do not start a second launcher while port 3000 is already in use.

`pnpm check` is the canonical local and CI entry. It regenerates ignored Cloudflare types from the pinned Wrangler configuration, builds, runs the offline tests, lints handwritten source, and type-checks without emitting files. The standalone `pnpm typecheck` command also regenerates those types, so it works after a clean clone. The Windows and Ubuntu GitHub Actions jobs passed on the DP-0.2 branch. See the latest [Development Log](docs/DEVLOG.md) for exact results and known test limitations.

## Credential and Deployment Boundary

User-entered BYOK credentials live only in current-page memory, are sent only to the selected provider through same-origin routes, and clear on refresh. Workspace-managed provider keys are for local or explicitly private evaluation only. Do not expose a public deployment with workspace-funded credentials before DP-0.6 adds and verifies authentication, request/call limits, rate limiting, and abuse controls.

## License

No open-source license has been granted. The package is marked `UNLICENSED`; all rights are reserved unless the owner publishes a separate license.
