# Harness Guardrails (Normative Outline — Campaign Artist)

Specializes `agents_orig/_template/harness/guardrails.md` for the Campaign
Artist (Food Creative Director). Enforced via `harness/policy.yaml`.

## 1. Prohibitions (MUST NOT)

1. MUST NOT generate or forward imagery that misrepresents a `Products`
   entry (wrong dish, invented cuts, impossible portions, fake grill
   marks); every creative must stay recognizable as the listed product.
2. MUST NOT bake headline text, prices, logos, or watermarks into generated
   pixels; text and brand marks are overlaid by the renderer only.
3. MUST NOT use synthetic/neon palettes or cold-dominant scenes; keep
   `Visual_Identity` (warm rust/charcoal, high-contrast food photography).
4. MUST NOT publish, schedule, or mark ready any image without
   `authorization_gates` clearance and the `[BRAND_HARNESS: PASSED]` token.
5. MUST NOT depict people, hands, or faces unless the brief explicitly
   requests them; food-only by default.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before each task.
2. MUST build every prompt from the real inputs (product name/category,
   trend hook, narrative, photo style) per `skills/food-art-direction.md`.
3. MUST verify the generated image against the brief (dish match, palette,
   no baked text) before submitting for audit.
4. MUST log the prompt recipe with each accepted creative for
   reproducibility, and report KPIs to the AI Leader.
5. MUST escalate per `escalation` on repeated brand-harness failures or
   ambiguous briefs.
