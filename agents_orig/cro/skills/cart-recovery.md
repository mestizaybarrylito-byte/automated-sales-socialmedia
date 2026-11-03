# Skill: Cart Recovery & Segment Playbooks

CRO skill. Converts CGMO leads and recovers abandoned carts via WhatsApp and email sequences. Keep headings as-is.

## Purpose

Recover abandoned carts and run segment follow-ups (new inbound leads,
occasional customers, frequent/VIP customers) that convert to
`Payment_Provider` (Clip) cleared payments. Communicate the batch model on
every touch and lock items into the batch only after `Payment_Provider` (Clip) clearance plus
CEO authorization. All values filled from `Batch_Rules_and_Triggers` and
`Logistics_Pickup_Schedule` by field name only.

## Inputs

- Abandoned-cart / lead list with segment tag (new inbound, occasional,
  frequent/VIP) and purchase history.
- Per-order `Payment_Provider` (Clip) link state (sent, cleared,
  uncleared).
- `Batch_Rules_and_Triggers` (`Global_Cart_Threshold`, `Time_Cutoff_Rule`).
- `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
  `Specific_Location`).
- LOG-SD availability, shipping quotes, and open meetup slots/locations.
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).
- `Brand_Design_Guidelines` (tone and brand voice).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`;
   confirm the active `Batch_Rules_and_Triggers` and
   `Logistics_Pickup_Schedule`.
2. Select the segment playbook: new inbound leads get instant engagement
   resolving product, attribute, delivery-time, and shipping-cost doubts;
   occasional customers get reactivation suggestions from purchase history;
   frequent/VIP customers get priority allocation, early batch access,
   satisfaction follow-ups, and exclusive benefits; fire a loyalty alert
   when a frequent buyer nears a reward.
3. Obtain LOG-SD availability, shipping quotes, and open meetup
   slots/locations before quoting anything; never quote or promise outside
   `Logistics_Pickup_Schedule` and `Batch_Rules_and_Triggers`, and never
   promise next-day or immediate delivery.
4. Send the WhatsApp/email recovery sequence using the sheet-filled scripts
   below, adapted to `Brand_Design_Guidelines` tone; submit all scripts for
   brand-harness audit before the AI Leader.
   - Batch Model Explanation: "Thank you for choosing us! To guarantee the
     best quality, our [Products] are fulfilled per our [Business_Model].
     We consolidate orders every [Time_Cutoff_Rule day]. Your order will
     be ready on [Delivery_Day] between [Time_Window] at
     [Specific_Location]. We lock in your items as soon as your
     [Payment_Provider] payment link is cleared!"
   - Payment Link: "Perfect! Your selection is ready. Here is your secure
     [Payment_Provider] payment link: [Insert Link]. Once completed, our
     Logistics Agent will allocate your selection into this week's batch.
     Looking forward to serving you!"
5. Lock items into the active batch only after `Payment_Provider` (Clip)
   clearance; confirm each clearance to LOG-SD so the order enters the
   batch.
6. Report closed sales with their source assets to CGMO (feedback loop);
   route any attached promo pricing through `skills/promo-costing.md` and
   `authorization_gates` first.

## Outputs

- Recovery attempts per segment with cleared-payment count.
- `Payment_Provider` (Clip) cleared orders confirmed to LOG-SD for batch
  entry.
- Closed-sales report with source assets for CGMO.
- Blocked items awaiting clearance, authorization, or brand-harness
  rewrite, or `none`.

## Failure handling

- On `Payment_Provider` (Clip) clearance mismatch: stop, keep the order
  out of the batch and fulfillment, and escalate per `escalation` in
  `harness/policy.yaml`.
- On `Logistics_Pickup_Schedule` conflict: block the promise and escalate
  to CEO/COO then Human Supervisor.
- On `[BRAND_HARNESS: FAILED]` for any script: block, return the rejection
  ticket, and rewrite before resubmission.
- On missing authorization for promo pricing: block public prices until
  `authorization_gates` clearance.
