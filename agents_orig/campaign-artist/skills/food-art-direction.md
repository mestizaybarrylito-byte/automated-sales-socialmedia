# Skill: Food Art Direction for AI Campaign Imagery

Campaign Artist skill. Turns product + trend + narrative + photo style into
precise, on-brand image prompts. Keep headings as-is.

## Purpose

Produce reproducible prompt recipes that render the real dish in the
requested photo style under the brand visual identity, with no baked-in
text and no misrepresentation.

## Inputs

- Product name and category from `[BUSINESS_CONTEXT_SHEET]` Products.
- Trend hook and narrative from CGMO.
- Catalog photo style id (anime, watercolor, 8-bit, illustrated, glowy…).
- Canvas format (feed square, 4:5, 9:16, landscape).
- `Brand_Design_Guidelines` (Visual_Identity, Logo_Placement).
- `harness/policy.yaml` (`authorization_gates`, `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`.
2. Name the dish exactly as listed; pick plating, surface (dark wood,
   slate, cast iron), and warm directional light to match Visual_Identity.
3. Append the style fragment for the requested photo style (e.g. anime →
   "clean cel shading, bold outlines, warm palette"; watercolor → "soft
   watercolor washes, paper texture, warm palette").
4. Add negative constraints: no text, no logos, no people, no
   cold-dominant or neon scenes, single hero dish.
5. Emit the recipe as one paragraph plus the negative constraints; keep
   it under 600 characters so it survives prompt budgets.
6. After generation, verify dish match, palette, and absence of baked
   text; refine with a scoped edit on failure.

## Outputs

- Prompt recipe (paragraph + negative constraints).
- Verification verdict: `pass` or `refine:<what failed>`.

## Failure handling

- On dish mismatch or off-brand palette: refine with a scoped edit, up
  to two attempts, then escalate.
- On baked text or artifacts: regenerate with strengthened negatives.
- On `[BRAND_HARNESS: FAILED]`: block, return the rejection ticket, and
  rewrite the recipe before resubmission.
