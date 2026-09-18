# Plan Reviewer Structured Output Correction Brief

- **Observed failure:** Live 014 preserved a complete, valid 12-day Sol Plan, then Fable completed the independent review request but returned text that failed exact JSON parsing. The review was rejected atomically and no automatic retry followed.
- **User artifact:** the archived Live 014 Plan is the immutable source artifact for this correction. It must not be regenerated, amended, or replaced while Reviewer transport reliability is being repaired.
- **Smallest hypothesis:** the immediate failure is the Reviewer output contract, not evidence that Fable lacked useful criticism. Supported Anthropic models can enforce a JSON Schema at generation time, while local parsing remains responsible for task-specific limits.
- **Change boundary:** enable Anthropic native structured outputs only for supported models and only when a caller explicitly supplies a schema. The initial Plan Reviewer supplies the Plan review schema. Builder prompts, model assignments, reasoning policy, output caps, amendment/recheck behavior, provider count, and automatic-retry policy do not change.
- **Compatibility boundary:** Fable 5 is explicitly supported by Anthropic structured outputs. Unsupported Anthropic model IDs omit the new request field. OpenAI and Gemini payloads remain unchanged. No `thinking` field is added; provider-default/adaptive thinking remains intact.
- **Validation boundary:** JSON Schema constrains object shape, required fields, enums, and unknown properties. Existing local `parsePlanReview` validation remains authoritative for day range, text lengths, concern count, and assumption count. A strict transport normalizer may accept one complete `json` Markdown fence with surrounding whitespace, but rejects prose plus embedded JSON.
- **Acceptance:** offline tests prove the Fable request contains `output_config.format.type = json_schema`, the schema avoids unsupported numeric/string bound keywords, unsupported Anthropic models omit the field, other provider payloads are unchanged, a sole fenced object is accepted, prose wrappers are rejected, semantic-invalid reviews still fail, and a complete saved Plan causes exactly one Reviewer call.
- **Cost and stop boundary:** zero real provider calls in this slice. Stop after build, offline tests, lint, type checking, and documentation. A Reviewer-only live validation against the saved Plan requires separate explicit authorization and still permits no automatic retry.

## Sources

- [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Anthropic Messages API](https://platform.claude.com/docs/en/api/http/messages)
