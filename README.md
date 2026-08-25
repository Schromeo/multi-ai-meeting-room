# Multi-AI Meeting Room

A human-chaired workspace where independent AI perspectives challenge consequential differences and produce inspectable artifacts, decisions, and eventually verified actions.

The current local version is v0.10c. It includes provider-neutral OpenAI, Anthropic, and Gemini adapters; session BYOK and model discovery; reusable Seats; independent proposals and cross-review; a human-chaired resumable protocol; bounded context and usage; IndexedDB room history; an optional Observer; and one Chair-selected Dispute-targeted path. The latest protocol still needs one bounded real-provider smoke evaluation. The next product slice is an artifact-centered Review Task Pack, not further generic-orchestrator expansion.

## Product Structure

Task Packs define the job: **Review**, **Decide / Plan**, **Explore**, **Create**, and future **Play**.

Permission levels define authority:

- **Discuss**: deliberation, critique, synthesis, and decision artifacts.
- **Research**: Discuss plus retrieval, sources, and claim verification.
- **Execute**: Research plus permissioned tool or coding-agent actions.

## Project Documents

- [Project charter](docs/PROJECT_CHARTER.md)
- [Product direction](docs/PRODUCT_DIRECTION.md)
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

```bash
npm install
npm run dev
npm run build
```
