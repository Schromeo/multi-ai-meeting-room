# PLAN-03 Reasoning and Artifact Headroom Correction Brief

- **Observed failure:** continuation011 used a9,600-token Builder ceiling and accepted no new days. Historical finish/usage details were not retained, so exhaustion is a hypothesis, not a reconstructed fact. New offline diagnostics can represent an OpenAI response that spends the whole ceiling on reasoning and returns no visible text.
- **User artifact:** all requested Plan days as valid JSONL, followed by independent review of the actual complete Plan.
- **Baseline:** the current recognized GPT-5 Plan path uses medium reasoning for Builder, reviewer, amendment and recheck. Anthropic and Gemini receive provider defaults. The completed discussion and six archived days remain unchanged.
- **Smallest hypothesis:** structured Builder assembly needs some planning but less semantic deliberation than actual-artifact judgment. Request OpenAI low reasoning for Builder only; retain medium for reviewer/editor/recheck. Preserve output ceilings and provider defaults elsewhere.
- **Expected information gain:** persist the requested reasoning setting beside reported reasoning/visible usage and finish state. The next authorized one-stage Builder check can distinguish a low-setting truncation from a completed artifact without changing model, prompt contract, days or output cap.
- **Acceptance:** actual mocked OpenAI Builder payload requests low and reviewer/amendment request medium; ordinary discussion remains minimal on recognized GPT-5. Anthropic/Gemini send no unsupported thinking controls and record provider default. Plan attempt/history parsers accept old records and reject unknown settings. UI labels requested setting separately from reported reasoning tokens. Output-limit, malformed and partial-day behavior remains unchanged.
- **Cost and stop:** zero live calls, no output-cap/model/provider/round change, no automatic retry and no migration of010/011. Stop after build, regression suite and lint. This becomes a local fix only; live completion and teaching quality stay open until separately authorized evidence exists.

## Closeout

Implemented the local profile and requested-setting diagnostics. Build,59 offline tests and lint pass; full type checking retains only three known Cloudflare worker declaration errors. Local HTTP returns200. No live call, browser action or deployment. PLAN-03 remains In progress; its next step is the single authorized Builder-stage evidence named above, not another code expansion.
