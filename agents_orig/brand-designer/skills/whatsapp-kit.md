# Skill: WhatsApp Kit

Flat skill format. Creates WhatsApp Business visuals and
post-purchase print assets. References `Products`,
`Payment_Provider`, and `Brand_Design_Guidelines` (`Visual_Identity`,
`Logo_Placement`, `Typography`) by field name only.

## Purpose

Create the WhatsApp Business visual kit (catalog headers, collection
icons, product stickers, rich-media cards) for conversational
commerce, and design packaging labels, product tags, thank-you notes,
and automated receipts triggered after a `Payment_Provider`
confirmation, all inside the core visual system at 80% core corporate
image / 20% current trends.

## Inputs

- CGMO or CRO brief (kit pieces needed, sales-flow placement).
- `Products` (product line names, sub-brand icons, featured items).
- `Payment_Provider` confirmation trigger for automated receipts.
- `Brand_Design_Guidelines` (`Visual_Identity`, `Logo_Placement`,
  `Typography`, `Trend_Adaptation_Rule`).
- TI asset delivery specs and CRO sales-flow visual requirements.
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before designing.
2. Design the WhatsApp kit pieces (catalog headers, collection icons,
   product stickers, rich-media cards) enforcing exact hex codes from
   `Visual_Identity`, the type scale from `Typography`, and placement
   from `Logo_Placement`.
3. Design packaging labels, product tags, and thank-you notes in the
   same system, and receipt layouts bound to the `Payment_Provider`
   confirmation trigger.
4. Hold 80% core identity / 20% trend across the kit and verify every
   trend element against `Trend_Adaptation_Rule`.
5. Submit all visuals for Brand Harness audit; rewrite on
   `[BRAND_HARNESS: FAILED]` until `[BRAND_HARNESS: PASSED]`.
6. Deliver the kit in the four-part response structure and hand
   receipt and WhatsApp kit visuals to the CRO for sales flows.

## Outputs

- Four-part response: `[Design Concept]`, `[Technical Asset
  Specifications]`, `[Dashboard Preview Payload]`, `[Brand Harness
  Check]`, as defined for BID creative responses.
- WhatsApp Business visual kit plus packaging, tags, notes, and
  `Payment_Provider`-triggered receipt layouts, each carrying
  `[BRAND_HARNESS: PASSED]`.

## Failure handling

- On `[BRAND_HARNESS: FAILED]` for any visual: block it from CRO
  handoff, and rewrite before resubmission.
- On a trend element violating `Trend_Adaptation_Rule` or the 80/20
  rule: cut the element and re-balance toward the core identity.
- On a missing `Payment_Provider` trigger definition or TI spec
  mismatch: stop and escalate per `escalation` in
  `harness/policy.yaml`.
