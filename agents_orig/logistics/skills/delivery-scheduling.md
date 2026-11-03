# Skill: Delivery Scheduling & Pre-Routing

LOG-SD skill. Pre-routes all modalities before supplier arrival and dispatches immediately on receipt. Keep headings as-is.

## Purpose

Coordinate the delivery modalities in `Distribution_Channels` (Local Home
Delivery, Regional Courier, Scheduled Public Meetups) against
`Logistics_Pickup_Schedule`, pre-routing every delivery before the supplier
shipment arrives so cleared product dispatches immediately on receipt with
minimum `Temporary_Holding`. Protect cold chain and delivery timing above
all else; halt and escalate any operation at risk.

## Inputs

- Released batch items with `Payment_Provider` (Clip) clearance and CEO
  dispatch authorization.
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`).
- `Distribution_Channels` modality per order (local, courier, public
  meetup).
- `Products` handling constraints (perishability, temperature control,
  fragility).
- Payment-confirmation webhook routing-instruction payload (read-only;
  IT-owned).
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]`; confirm the active schedule,
   channels, and handling constraints — never hardcode values.
2. Identify `Products` handling constraints and prioritize cold chain and
   delivery timing over every other consideration.
3. Pre-route all deliveries (local, courier, public meetup per
   `Logistics_Pickup_Schedule`) before the supplier shipment arrives,
   resolving slots and locations in advance.
4. Verify each route against `Logistics_Pickup_Schedule` and
   `Logistics_and_Delivery`; confirm cleared payment plus authorization
   before releasing any product or route.
5. On supplier receipt, sort and dispatch immediately, minimizing
   `Temporary_Holding`; track delivery turnaround, shipping cost per
   order, and OTIF for the dashboard and daily CEO report.
6. Monitor cold chain, route, and availability through final handoff; halt
   any operation at integrity risk and escalate to the AI Leader (CEO).

## Outputs

- Pre-route plan per modality with slots/locations from
  `Logistics_Pickup_Schedule`.
- Dispatch schedule tied to cleared, authorized batch items.
- Delivery turnaround, shipping cost per order, and OTIF inputs for the
  dashboard.
- Cold-chain, route, and availability alerts, or `none`.

## Failure handling

- On missing `Payment_Provider` (Clip) clearance or CEO authorization:
  release no product and schedule no route; escalate per `escalation`.
- On cold-chain or product-integrity risk: halt the affected operation
  immediately and escalate to CEO/COO then Human Supervisor; resume only
  when authorized.
- On `Logistics_Pickup_Schedule` conflict or supplier shortage: block the
  affected routes and alert the AI Leader (CGMO pauses ads for depleted
  items).
- On webhook payload anomaly: report to IT through the CEO; never modify
  system data directly.
