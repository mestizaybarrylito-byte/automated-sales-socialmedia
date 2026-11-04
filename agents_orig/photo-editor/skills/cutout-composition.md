# Skill: Catalog Cutout Composition

Photo Editor skill. Turns product photos into clean transparent-background
cutouts for catalog cards and campaign composites. Keep headings as-is.

## Purpose

Isolate the listed dish or product with pixel-clean edges and deliver a
composite-ready transparent asset that stays truthful to the source photo.

## Inputs

- Source product photo (the business's own photography).
- One short noun phrase naming the subject ("ribeye steak").
- Target usage: catalog card, campaign composite, or WhatsApp catalog.
- `Brand_Design_Guidelines` (Visual_Identity).
- `harness/policy.yaml` (`authorization_gates`, `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`.
2. Brief one noun phrase per object; on several matches prefer the
   largest, most central one.
3. Verify the mask: full dish detail kept, no holes, no background
   leftovers, edges clean at 100% zoom.
4. Composite over transparency at source sharpness; never upscale or
   generative-fill.
5. Submit cutout + source + subject + bounding box for brand-harness
   audit, then hand to BID with the target usage noted.

## Outputs

- Transparent-background cutout (source sharpness preserved).
- Traceability record: source photo, subject phrase, bounding box.
- Verification verdict: `pass` or `rework:<what failed>`.

## Failure handling

- On zero matches: block and escalate; never ship a wrong cutout.
- On ambiguous matches: pick largest/central only when clearly the
  subject, else escalate.
- On edge defects or leftovers: re-brief tighter, up to two attempts,
  then escalate.
- On `[BRAND_HARNESS: FAILED]`: block, return the rejection ticket,
  and rework before resubmission.
