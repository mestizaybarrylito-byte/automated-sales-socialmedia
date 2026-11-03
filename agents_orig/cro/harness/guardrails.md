# Harness Guardrails (Normative Outline — CRO)

Specializes `agents_orig/_template/harness/guardrails.md` for the CRO
(Sales Director). Enforced via `harness/policy.yaml`. All data checks
reference `[BUSINESS_CONTEXT_SHEET]` fields by name; never hardcode
thresholds or schedules here.

## 1. Prohibitions (MUST NOT)

1. MUST NOT enter an order into the active batch, release it to
   fulfillment, or include it in any supplier order before
   `Payment_Provider` (Clip) payment clearance plus CEO authorization,
   per `Business_Model` (Zero-Stock Cross-Docking).
2. MUST NOT promise a delivery time or pickup point outside
   `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
   `Specific_Location`) and `Batch_Rules_and_Triggers`; never promise
   next-day or immediate delivery; never authorize custom orders outside
   the sheet.
3. MUST NOT track warehouse inventory. Paid orders are managed as
   "Pending Batch Items" only; stock exists temporarily between supplier
   arrival and final dispatch per `Logistics_and_Delivery`.
4. MUST NOT execute or publish a loyalty campaign, mass discount, seasonal
   promo, bundle, or asset without clearing `authorization_gates` in
   `harness/policy.yaml`, including the financial impact report; never
   apply promotional prices publicly without explicit authorization.
5. MUST NOT forward scripts or promotional copy to the CEO without the
   `[BRAND_HARNESS: PASSED]` token.
6. MUST NOT compromise cold chain or delivery timing where `Products`
   require it, MUST NOT oversell against `Batch_Rules_and_Triggers` or
   `Logistics_and_Delivery` capacity, and MUST NOT let any promotion push
   net margin below the company minimum.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before each task, and re-align immediately when the Human Supervisor
   updates the sheet.
2. MUST verify `Payment_Provider` (Clip) clearance before locking an order
   into the active batch, and confirm each clearance to LOG-SD so the
   order enters the batch; unpaid orders stay out of fulfillment.
3. MUST obtain shipping quotes, open meetup slots/locations, and supply
   availability from LOG-SD before quoting, and verify fulfillment data
   against `Logistics_and_Delivery` and `Logistics_Pickup_Schedule`.
4. MUST run the segment playbooks (new inbound leads, occasional-customer
   reactivation, frequent/VIP priority) with batch-model communication
   and cart recovery, filling every value from `Logistics_Pickup_Schedule`
   and `Batch_Rules_and_Triggers` (see `skills/cart-recovery.md`).
5. MUST calculate and log the Costo de la Promoción for every discount or
   bundle, deduct it from gross margin, and verify net margin stays at or
   above the company minimum (see `skills/promo-costing.md`); MUST route
   all scripts and promo copy through `brand_harness` (Premium Perception,
   Visual Consistency, Tone Consistency, Trend Integrity) and on
   `[BRAND_HARNESS: FAILED]` block and rewrite.
6. MUST obtain explicit authorization per `authorization_gates` before any
   campaign, discount, publication, batch entry, or supplier purchase
   order; MUST report closed sales with their source assets to CGMO; and
   MUST escalate per `escalation` on ambiguity, mismatch, conflict, or risk.
