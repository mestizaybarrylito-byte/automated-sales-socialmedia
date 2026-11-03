# Skill: Batch Authorization

Flat skill format. Authorizes the LOG-SD master supplier order once a batch
trigger is met. References `Batch_Rules_and_Triggers`, `Payment_Provider`,
and `Logistics_Pickup_Schedule` by field name only.

## Purpose

Review and authorize the master supplier order compiled by LOG-SD once a
trigger in `Batch_Rules_and_Triggers` is met. Verifies that revenue
collected via `Payment_Provider` covers the supplier's wholesale cost and
preserves the required net margin before releasing the purchase order, and
locks orders into the active batch only after payment clearance is
confirmed. Monetary figures carry `[Currency, e.g., MXN]` unchanged;
`company-minimum-margin` is undefined until the Human Supervisor defines it.

## Inputs

- LOG-SD master order draft tied to Pending Batch Items.
- Per-order `Payment_Provider` clearance state (confirmed by CRO and LOG-SD).
- `Batch_Rules_and_Triggers` (`Global_Cart_Threshold`, `Time_Cutoff_Rule`).
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`:
  [Insert exact address/link here, e.g., "Main Plaza Parking Lot, Next to the Fountain"]).
- Supplier wholesale cost for the batch, in `[Currency, e.g., MXN]`.
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and confirm the active
   `Batch_Rules_and_Triggers` and `Logistics_Pickup_Schedule` values.
2. Confirm a `Batch_Rules_and_Triggers` trigger is met (threshold or
   cutoff), citing which named trigger matched; otherwise stop without
   authorizing.
3. Filter the batch to `Payment_Provider`-cleared orders only, confirmed by
   both CRO and LOG-SD; exclude uncleared orders from revenue totals.
4. Verify cleared-order revenue covers the supplier wholesale cost plus
   `company-minimum-margin` (undefined): if the margin is undefined, stop
   and escalate per `escalation` instead of assuming a value.
5. Cross-check fulfillment against `Logistics_and_Delivery` and
   `Logistics_Pickup_Schedule`; flag cold-chain, capacity, or timing
   conflicts.
6. Present the proposal in structured format and obtain explicit Human
   Supervisor authorization per `authorization_gates` before releasing the
   purchase order; lock cleared orders into the active batch only after
   clearance confirmation.

## Outputs

- `authorized: true|false` with the matched `Batch_Rules_and_Triggers`
  name.
- Cleared-order revenue total (in `[Currency, e.g., MXN]`) versus wholesale
  cost plus `company-minimum-margin` (undefined).
- Conflict list tied to `Logistics_Pickup_Schedule` /
  `Logistics_and_Delivery`, or `none`.
- Authorization record awaiting or holding Human Supervisor approval.

## Failure handling

- On trigger ambiguity or `Payment_Provider` clearance mismatch: stop, mark
  `authorized: false`, and escalate per `escalation` in
  `harness/policy.yaml`.
- On margin check failure or `company-minimum-margin` undefined: block the
  purchase order and escalate to the Human Supervisor; never release on an
  assumed margin.
- On `Logistics_Pickup_Schedule` conflict, cold-chain risk, or oversell
  risk: pause the batch and escalate to the Human Supervisor.
