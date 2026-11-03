# Skill: Promotion Design & Promo-Cost Accounting

CRO skill. Designs profitable bundles and discounts and accounts their cost against margin. Keep headings as-is.

## Purpose

Raise average order value with bundles and profitable promotions while
protecting gross margin and financial health. For every discount or bundle,
calculate and log the Costo de la Promoción, deduct it from gross margin,
and block any promotion that would push net margin below the company
minimum. No promo prices go public without CEO authorization and
brand-harness clearance.

## Inputs

- LOG-SD overstock / shelf-life reports with candidate slow-moving and
  high-margin items.
- Candidate bundle or discount definition (items and proposed mechanics,
  pending authorization).
- Gross-margin baseline and the company minimum net margin (referenced by
  name only; never invent the figure).
- `Batch_Rules_and_Triggers`, `Logistics_Pickup_Schedule`, and
  `Payment_Provider` (Clip).
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).
- `Brand_Design_Guidelines` (tone and brand voice).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`;
   confirm the active batch and schedule fields.
2. Build bundles that pair slow-moving items with high-margin items per
   LOG-SD overstock reports; define loyalty-campaign, mass-discount, or
   seasonal-promo mechanics as drafts only.
3. Calculate the Costo de la Promoción for each discount or bundle and
   deduct it from gross margin; verify net margin stays at or above the
   company minimum.
4. Draft the financial impact report (promo cost, margin effect, expected
   frequency and order-value lift stated qualitatively unless the sheet
   provides figures).
5. Submit the report plus all promo copy for brand-harness audit and then
   for CEO authorization per `authorization_gates`; keep promo prices
   non-public until explicit approval.
6. After authorization, log the approved promo cost, publish through
   approved channels only, and report resulting closed sales with source
   assets to CGMO.

## Outputs

- Promo proposal draft with item mechanics.
- Costo de la Promoción log with gross-to-net margin effect.
- Margin check: `pass` (at or above company minimum) or `fail`.
- Financial impact report and `authorization_gates` approval state.
- Published prices only after authorization, or `blocked`.

## Failure handling

- On margin below the company minimum: block the promotion and escalate
  per `escalation`; never publish.
- On missing CEO authorization: block all public promo prices until
  `authorization_gates` clearance.
- On `[BRAND_HARNESS: FAILED]` for promo copy: block, return the rejection
  ticket, and rewrite before resubmission.
- On `Payment_Provider` (Clip) clearance mismatch for promo-attributed
  orders: exclude them from batch totals and escalate.
