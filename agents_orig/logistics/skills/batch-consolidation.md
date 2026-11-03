# Skill: Batch Consolidation & Supplier Order Trigger

LOG-SD skill. Consolidates cleared orders and triggers the supplier order on threshold OR cutoff. Keep headings as-is.

## Purpose

Manage paid orders as Pending Batch Items and release a supplier purchase
batch only when a `Batch_Rules_and_Triggers` trigger fires (monetary
threshold OR time cutoff), every included order carries
`Payment_Provider` (Clip) clearance, and the CEO has authorized the master
order. Unpaid orders are ignored and excluded from all supplier orders.

## Inputs

- Pending Batch Items list with per-order `Payment_Provider` (Clip)
  clearance state and CRO paid link/bill confirmations.
- Payment-confirmation webhook routing-instruction payload (read-only;
  IT-owned).
- `Batch_Rules_and_Triggers` (`Global_Cart_Threshold`, `Time_Cutoff_Rule`).
- `Logistics_and_Delivery` (`Fulfillment_Trigger`, `Temporary_Holding`,
  `Distribution_Channels`).
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`).
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]`; confirm the active
   `Batch_Rules_and_Triggers`, `Logistics_and_Delivery`, and
   `Logistics_Pickup_Schedule` — never hardcode values.
2. Filter Pending Batch Items to `Payment_Provider` (Clip) cleared orders
   only, cross-checking CRO confirmations against the webhook payload;
   exclude every uncleared order from totals and from the supplier order.
3. Evaluate trigger 1 (monetary threshold): accumulated cleared-order
   revenue reaches `Global_Cart_Threshold`.
4. Evaluate trigger 2 (time cutoff): `Time_Cutoff_Rule` is met; either
   trigger firing (threshold OR cutoff) makes the batch ready to propose.
5. On a fired trigger, compile the master order sheet from cleared items
   only and submit it to the AI Leader (CEO) for supplier-dispatch
   authorization; release nothing before explicit approval.
6. After authorization, hand the released batch to
   `skills/delivery-scheduling.md` for pre-routed dispatch; on no trigger,
   hold cleared items as Pending Batch Items.

## Outputs

- `ready: true|false` with the matched `Batch_Rules_and_Triggers` trigger
  name (threshold, cutoff, or `none`).
- Cleared-order count and cleared revenue total tied to `Payment_Provider` (Clip).
- Master order sheet draft awaiting `authorization_gates` approval, or
  `held` when no trigger fired.
- Conflict list tied to schedule, availability, or cold chain, or `none`.

## Failure handling

- On `Payment_Provider` (Clip) clearance mismatch or trigger ambiguity:
  stop, mark `ready: false`, and escalate per `escalation` in
  `harness/policy.yaml`.
- On `Logistics_Pickup_Schedule` conflict, availability shortfall, or
  cold-chain risk: block the proposal and escalate to CEO/COO then Human
  Supervisor.
- On missing CEO authorization: block supplier dispatch until
  `authorization_gates` clearance.
- On webhook payload anomaly: report to IT through the CEO; never modify
  system data directly.
