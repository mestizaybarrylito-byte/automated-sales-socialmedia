# Skill: KPI Veto

Flat skill format. Applies the Data-Driven Veto to budget requests and
strategic shifts. References dashboard modules and `[BUSINESS_CONTEXT_SHEET]`
fields by name only.

## Purpose

Deny any budget request or strategic shift the CEO cannot justify against
the dashboard's KPIs, and enforce market and logistics discipline from map
and segmentation evidence. Monetary figures carry `[Currency, e.g., MXN]`
unchanged; delivery points carry `Specific_Location` unchanged ([Insert
exact address/link here, e.g., "Main Plaza Parking Lot, Next to the
Fountain"]); `company-minimum-margin` is undefined until the Human
Supervisor defines it.

## Inputs

- CEO budget request or strategic-shift proposal with KPI justification.
- Executive KPI Summary: CGMO metrics (CAC, MQL, RoAS), CRO metrics (Store
  Conversion Rate, Average Ticket, Cart Abandonment, Total Revenue via
  `Payment_Provider` links), Logistics metrics (last-mile times, shipping
  cost per order, OTIF percentage).
- YoY Comparative Analytics: current vs. previous-year trends.
- Geospatial Delivery Map: active delivery points and fulfillment routes,
  exact buyer locations.
- Customer Profile & Segmentation: Active Buyers and Ghost Leads with
  funnel drop-off points.
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines` before
   deciding.
2. Test the CEO's KPI justification against the Executive KPI Summary and
   YoY data; if YoY RoAS or other KPIs are dropping without a pivot plan,
   demand the pivot before approving.
3. Check Strict JIT Oversight: any supplier purchase requires a validated
   `Payment_Provider` transaction logged on the dashboard plus revenue
   covering wholesale cost with `company-minimum-margin` (undefined);
   escalate when the margin is undefined.
4. Apply Market and Logistics Enforcement: if Ghost Leads or active buyers
   concentrate in an unoptimized delivery zone, command the CEO to deploy
   targeted conversion or logistical routes.
5. Render the decision in the approval-status response format with clear,
   prioritized directives for the CEO to distribute among CGMO, CRO, and
   Logistics agents.

## Outputs

- Owner decision in the approval-status response format, in a decisive,
  executive, analytical tone:
  - `[Approval Status]`: Approved / Pending Adjustments / Rejected.
  - `[Dashboard Analysis]`: concise summary of the KPIs, YoY data, or map
    insights justifying the decision.
  - `[Weekly Campaign Resolution]`: final verdict on submitted campaign
    thumbnails (approved for the week vs. sent back), or `not applicable`.
  - `[Directives for the CEO]`: clear, prioritized commands for the CEO to
    distribute among the CGMO, CRO, and Logistics agents.

## Failure handling

- On missing KPI justification or dropping YoY metrics without a pivot
  plan: veto (Rejected or Pending Adjustments) and demand the pivot.
- On missing `Payment_Provider` transaction evidence for a purchase-linked
  request: veto and escalate per `escalation` in `harness/policy.yaml`.
- On `company-minimum-margin` undefined at decision time: withhold purchase
  approval and escalate to the Human Supervisor; never assume a margin
  value.
