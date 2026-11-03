# Skill: Campaign Asset Pack

Flat skill format. Designs the weekly campaign asset wave for Meta
Ads. References `Products`, `Brand_Design_Guidelines`
(`Visual_Identity`, `Logo_Placement`, `Typography`,
`Trend_Adaptation_Rule`), and the 80/20 core-image-to-trends rule by
name only.

## Purpose

Design banners, carousels, stories, and video covers for each campaign
wave, blending current trends with the textures and style defined in
`Visual_Identity` while holding 80% core corporate image / 20%
current trends, and generate high-fidelity thumbnails and copy
mockups for the Weekly Campaign Approval Hub.

## Inputs

- CGMO creative brief (campaign theme, trend direction, copy, platform
  targets).
- `Products` (product line names, sub-brand icons, featured items).
- `Brand_Design_Guidelines` (`Visual_Identity`, `Logo_Placement`,
  `Typography`, `Trend_Adaptation_Rule`).
- TI asset delivery specs (dimensions, formats, payload format).
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before designing.
2. Confirm the brief carries product, trend, and platform targets;
   clarify with the CGMO when any are missing.
3. Design the asset wave (banners, carousels, stories, video covers)
   at 80% core identity / 20% trend, enforcing exact hex codes from
   `Visual_Identity`, the type scale from `Typography`, and watermark
   placement from `Logo_Placement`.
4. Verify every trend element satisfies `Trend_Adaptation_Rule`; cut
   any element that dilutes the core identity.
5. Generate high-fidelity thumbnails and copy mockups for the
   Approval Hub plus the dashboard preview payload per TI specs.
6. Submit all assets for Brand Harness audit; rewrite on
   `[BRAND_HARNESS: FAILED]` until `[BRAND_HARNESS: PASSED]`.
7. Deliver the pack in the four-part response structure and feed
   thumbnails to the Weekly Campaign Approval Hub for AI Leader /
   Business Owner review per `authorization_gates`.

## Outputs

- Four-part response per creative request: `[Design Concept]` (2
  sentences: artistic direction, behavioral triggers, color harmony),
  `[Technical Asset Specifications]` (dimensions, formats, hex codes,
  font families, platform targets per TI specs and
  `Brand_Design_Guidelines`), `[Dashboard Preview Payload]` (JSON or
  rendering instructions), `[Brand Harness Check]` (how the asset
  preserves core identity while adapting to the trend).
- Campaign asset wave files plus Approval Hub thumbnails and copy
  mockups, each carrying `[BRAND_HARNESS: PASSED]`.

## Failure handling

- On `[BRAND_HARNESS: FAILED]` for any asset: block it from the Hub,
  and rewrite before resubmission.
- On a trend element violating `Trend_Adaptation_Rule` or the 80/20
  rule: cut the element and re-balance toward the core identity.
- On a brief missing product or platform targets, or a TI spec
  mismatch: stop and escalate per `escalation` in
  `harness/policy.yaml`.
