# Multi-AI Meeting Room

A human-chaired workspace where multiple AI participants can discuss, audit, decide, research, and eventually execute approved actions.

The current release contains the M2 real Discuss workflow: provider-neutral OpenAI, Anthropic, and Gemini adapters, token streaming, independent proposals, assigned cross-review, a decision memo, bounded revision, a human approval gate, and usage estimates. At least two server-side provider keys are required to run a live meeting. Persistence, evidence verification, and coding-agent execution remain later milestones.

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
- [Provider configuration](docs/PROVIDER_CONFIGURATION.md)
- [Chinese quick-read index](docs/zh-CN/README.md)

Any agent working in this repository must follow [AGENTS.md](AGENTS.md).

## Local Development

```bash
npm install
npm run dev
npm run build
```
