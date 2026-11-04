# Harness Guardrails (Normative Outline — Photo Editor)

Specializes `agents_orig/_template/harness/guardrails.md` for the Photo
Editor (Product Cutout Specialist). Enforced via `harness/policy.yaml`.

## 1. Prohibitions (MUST NOT)

1. MUST NOT ship a cutout of the wrong subject; on zero or ambiguous
   matches, block and escalate instead of guessing.
2. MUST NOT generative-fill, upscale, recolor, or beautify product
   pixels; the cutout must stay truthful to the source photo.
3. MUST NOT leave background leftovers, holes, or ragged edges; rework
   until clean or escalate.
4. MUST NOT ship cutouts to catalog or campaign without
   `authorization_gates` clearance and the `[BRAND_HARNESS: PASSED]`
   token.
5. MUST NOT process photos outside the business's own product
   photography catalog.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before each task.
2. MUST brief one short noun phrase per object and prefer the largest,
   most central match.
3. MUST verify edges, holes, and leftovers on every cutout before
   submitting for audit.
4. MUST deliver cutout + source + subject + bounding box, and report
   KPIs to the AI Leader.
5. MUST escalate per `escalation` on ambiguity or repeated failures.
