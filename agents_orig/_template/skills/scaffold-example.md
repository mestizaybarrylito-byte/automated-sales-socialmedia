# Skill: Batch-Readiness Check (Scaffold Example)

Flat skill format example. Copy this file per skill; keep headings as-is.

## Purpose

Determine whether Pending Batch Items are ready to propose as a supplier
purchase batch, without releasing any order. References
`Batch_Rules_and_Triggers`, `Payment_Provider`, and
`Logistics_Pickup_Schedule` by field name only.

## Inputs

- Pending Batch Items list with per-order `Payment_Provider` clearance state.
- `Batch_Rules_and_Triggers` (`Global_Cart_Threshold`, `Time_Cutoff_Rule`).
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`).
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and confirm the active
   `Batch_Rules_and_Triggers` and `Logistics_Pickup_Schedule` values.
2. Filter Pending Batch Items to `Payment_Provider`-cleared orders only;
   exclude uncleared orders from totals.
3. Evaluate whether a `Batch_Rules_and_Triggers` trigger is met
   (threshold or cutoff), citing which named trigger matched.
4. Cross-check fulfillment against `Logistics_and_Delivery` and
   `Logistics_Pickup_Schedule`; flag cold-chain or capacity conflicts.
5. Draft a proposal only (no release); route through `authorization_gates`
   and `brand_harness` where applicable.

## Outputs

- `ready: true|false` with the matched `Batch_Rules_and_Triggers` name.
- Cleared-order count and revenue total tied to `Payment_Provider`.
- Conflict list tied to `Logistics_Pickup_Schedule` /
  `Logistics_and_Delivery`, or `none`.
- Proposal draft awaiting `authorization_gates` approval.

## Failure handling

- On `Payment_Provider` clearance mismatch or trigger ambiguity: stop,
  mark `ready: false`, and escalate per `escalation` in
  `harness/policy.yaml`.
- On `Logistics_Pickup_Schedule` conflict or cold-chain risk: block the
  proposal and escalate to CEO/COO then Human Supervisor.
- On `[BRAND_HARNESS: FAILED]` for any attached asset: block, return the
  rejection ticket, and rewrite before resubmission.
