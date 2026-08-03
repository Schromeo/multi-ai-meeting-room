# Provider Configuration

M2 requires at least two configured providers. All secrets are server-side runtime values and must never be committed or returned to the browser.

## Required Secret Keys

| Provider | Secret | Default model |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | `gpt-5.6-luna` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-5` |
| Google | `GEMINI_API_KEY` | `gemini-3.6-flash` |

The model defaults can be overridden with `OPENAI_MODEL`, `ANTHROPIC_MODEL`, and `GEMINI_MODEL` without changing role assignments.

## Cost Estimate Values

The UI estimates cost from provider-reported input and output tokens. Rates are display-only and configurable through:

- `OPENAI_INPUT_USD_PER_MTOK` and `OPENAI_OUTPUT_USD_PER_MTOK`
- `ANTHROPIC_INPUT_USD_PER_MTOK` and `ANTHROPIC_OUTPUT_USD_PER_MTOK`
- `GEMINI_INPUT_USD_PER_MTOK` and `GEMINI_OUTPUT_USD_PER_MTOK`

Refresh these values when pricing or the configured model changes. They are estimates, not billing records.

## Local and Hosted Values

- Copy the names from `.env.example` into an ignored `.env.local` for local work.
- Store hosted values through Sites environment configuration and mark API keys as secrets.
- Deploy again after hosted values change so the new environment revision applies.
- Use the provider-status endpoint or the seat labels to confirm configuration; it returns only booleans and model IDs, never key values.

## First Live Evaluation

1. Configure exactly two providers first to limit cost and isolate failures.
2. Use one representative objective with a clear decision criterion.
3. Save the single-model baseline before starting the room.
4. Complete one proposal, cross-review, and memo cycle without requesting revision.
5. Record latency, cost estimate, useful objections, unsupported claims, and human preference in the development log.
