# Provider Configuration

M2 requires at least two configured providers. Workspace credentials remain server runtime secrets. A user may also enter a session BYOK credential in the product; it is held only in current-page memory, sent in the same-origin meeting request, and cleared on refresh. No credential may be committed, written to browser storage, logged, added to a URL or transcript, or returned by an API response.

## Required Secret Keys

| Provider | Secret | Default model |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | `gpt-5.6-luna` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-5` |
| Google | `GEMINI_API_KEY` | `gemini-3.6-flash` |

The model defaults can be overridden with `OPENAI_MODEL`, `ANTHROPIC_MODEL`, and `GEMINI_MODEL` without changing role assignments.

## In-Product Session Connections

The Connections dialog accepts a provider API key and model ID. This is an evaluation bridge, not durable secret storage:

- the browser keeps the key only in React page memory;
- the key is sent over the same-origin meeting request only for active seats;
- the server uses it for immediate provider calls and does not persist or echo it;
- refreshing or closing the page clears it;
- durable BYOK is blocked on authentication, encrypted storage, ownership checks, rotation, and deletion.

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
- Use the provider-status endpoint or the connection labels to confirm workspace configuration; it returns only booleans and model IDs, never key values.

## First Live Evaluation

1. Configure exactly two providers first to limit cost and isolate failures.
2. Use one representative objective with a clear decision criterion.
3. Save the single-model baseline before starting the room.
4. Complete one proposal, cross-review, and memo cycle without requesting revision.
5. Record latency, cost estimate, useful objections, unsupported claims, and human preference in the development log.
