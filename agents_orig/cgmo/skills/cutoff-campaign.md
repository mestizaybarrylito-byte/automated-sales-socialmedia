# Skill: Cutoff Campaign

Flat skill format. Builds scarcity campaigns tied to the batch cutoff
and schedules them inside verified delivery zones. References
`Time_Cutoff_Rule`, `Batch_Rules_and_Triggers`,
`Logistics_Pickup_Schedule`, and `Logistics_and_Delivery` by field
name only.

## Purpose

Create scarcity/cutoff campaigns tied to `Time_Cutoff_Rule` that urge
ordering before the weekly batch closes, run paid distribution only
in verified delivery zones, and schedule publication at AI
Leader-approved times aligned with the campaign calendar.

## Inputs

- `Time_Cutoff_Rule` and `Batch_Rules_and_Triggers`
  (`Global_Cart_Threshold`, `Time_Cutoff_Rule`).
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`).
- `Logistics_and_Delivery` zones, modalities, and Distribution_Channels.
- LOG-SD supply alerts and overstock notices, if any.
- Engagement data for publication-time proposals.
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and confirm the active
   `Time_Cutoff_Rule` and `Logistics_Pickup_Schedule` values.
2. Check LOG-SD supply alerts and overstock notices; if supply is
   constrained, pause or redirect planned ads instead of launching.
3. Draft cutoff copy tied to `Time_Cutoff_Rule` (ordering window
   closing, current batch urgency) without inventing cutoff days or
   times beyond the named field values.
4. Restrict paid distribution to the zones and modalities in
   `Logistics_and_Delivery` and `Logistics_Pickup_Schedule`; exclude
   unverified zones.
5. Plan weekly A/B variants on thumbnails, hooks, and offer copy, and
   propose optimal publication times from engagement data.
6. Submit all copy and variants for Brand Harness audit; rewrite on
   `[BRAND_HARNESS: FAILED]` until `[BRAND_HARNESS: PASSED]`.
7. Submit the campaign with the compact report to the AI Leader and
   obtain authorization per `authorization_gates` before scheduling
   or publishing.

## Outputs

- Cutoff campaign drafts tied to `Time_Cutoff_Rule`, each carrying
  `[BRAND_HARNESS: PASSED]`.
- Zone plan restricted to verified `Logistics_and_Delivery` /
  `Logistics_Pickup_Schedule` zones and modalities.
- A/B variant list (thumbnails, hooks, offer copy) with success
  metrics.
- Publication schedule proposal awaiting AI Leader authorization.

## Failure handling

- On a LOG-SD supply alert or overstock notice: pause or redirect
  affected ads and escalate per `escalation` in
  `harness/policy.yaml`.
- On `[BRAND_HARNESS: FAILED]` for any draft: block it and rewrite
  before resubmission.
- On `Time_Cutoff_Rule` ambiguity or `Logistics_Pickup_Schedule`
  conflict: stop, mark the campaign unscheduled, and escalate to the
  CEO/COO then Human Supervisor.
