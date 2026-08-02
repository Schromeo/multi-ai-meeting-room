# Multi-AI Meeting Room

A human-chaired workspace where multiple AI participants can discuss, audit, decide, research, and eventually execute approved actions.

The current release is an interactive concept prototype. Its agent messages are simulated; live provider APIs, persistence, evidence verification, and coding-agent execution have not been implemented yet.

## Product Modes

- **Discuss**: deliberation, critique, synthesis, and decision artifacts.
- **Research**: Discuss plus retrieval, sources, and claim verification.
- **Execute**: Research plus permissioned tool or coding-agent actions.

## Project Documents

- [Project charter](docs/PROJECT_CHARTER.md)
- [AI handoff](docs/AI_HANDOFF.md)
- [Roadmap](docs/ROADMAP.md)
- [Development log](docs/DEVLOG.md)
- [Decision record](docs/DECISIONS.md)
- [Chinese quick-read index](docs/zh-CN/README.md)

Any agent working in this repository must follow [AGENTS.md](AGENTS.md).

## Local Development

```bash
npm install
npm run dev
npm run build
```
