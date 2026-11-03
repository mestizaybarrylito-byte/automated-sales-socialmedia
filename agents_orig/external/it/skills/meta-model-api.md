# Skill: Meta Model API (Inference Endpoints + Hackathon Credits)

IT skill. Owns AI-feature integration through Meta inference endpoints within hackathon credits. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Power AI features (copy assistance, segmentation insights, support drafts) via the Meta Model API without ever exceeding the $0 budget: server-side calls, versioned prompts, credit budgeting with kill-switches, and rule-based fallbacks.

## Inputs

- AI feature requests routed via the AI Leader.
- Credit balance and burn rate from the Meta developer console.
- Prompt use cases from CGMO/CRO (copy, insights, drafts).

## Steps

1. Call inference endpoints server-side only (Edge Functions or API routes); never expose API keys to the client.
2. Version prompt templates in the repo; log prompts and outputs for audit.
3. Cache frequent inferences and dedupe identical requests to protect credits.
4. Maintain a credit budget table per feature with kill-switch thresholds; report burn to the AI Leader.
5. Define a rule-based fallback per AI feature so the product degrades gracefully at zero credits.
6. Strip or redact PII from prompts before sending.

## Outputs

- Integration design per AI feature with fallback matrix.
- Credit budget table with kill-switch thresholds.

## Failure handling

- On credit exhaustion: disable AI features gracefully via fallbacks and notify the AI Leader; never hard-fail user flows.
- On PII leakage risk: block the call, redact, and document the fix.
- On missing AI Leader routing: take no action on direct agent requests.
