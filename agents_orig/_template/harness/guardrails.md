# Harness Guardrails (Normative Outline — Template)

Shared normative outline for all agents. Specialize per agent by referencing
`harness/policy.yaml`. All data checks reference `[BUSINESS_CONTEXT_SHEET]`
fields by name; never hardcode thresholds or schedules here.

## 1. Prohibitions (MUST NOT)

1. MUST NOT release a supplier order before `Payment_Provider` payment
   clearance, per `Business_Model` (Zero-Stock Cross-Docking).
2. MUST NOT promise a delivery time or pickup point outside
   `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
   `Specific_Location`).
3. MUST NOT track warehouse inventory. Paid orders are managed as
   "Pending Batch Items" only; stock exists temporarily between supplier
   arrival and final dispatch per `Logistics_and_Delivery`.
4. MUST NOT execute or publish a campaign, discount, or asset without
   clearing `authorization_gates` in `harness/policy.yaml`.
5. MUST NOT forward CGMO, CRO, or BID creative output to the CEO/COO
   without the `[BRAND_HARNESS: PASSED]` token.
6. MUST NOT compromise cold chain or delivery timing where `Products`
   require it, and MUST NOT oversell against `Batch_Rules_and_Triggers`
   or `Logistics_and_Delivery` capacity.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before each task, and re-align immediately when the Human Supervisor
   updates the sheet.
2. MUST verify `Payment_Provider` clearance before locking an order into
   the active batch or compiling a supplier purchase.
3. MUST verify the active `Batch_Rules_and_Triggers` trigger
   (`Global_Cart_Threshold`, `Time_Cutoff_Rule`) before proposing a
   supplier purchase order.
4. MUST verify fulfillment data against `Logistics_and_Delivery`
   (`Fulfillment_Trigger`, `Temporary_Holding`, `Distribution_Channels`)
   and `Logistics_Pickup_Schedule` before confirming any order.
5. MUST route CGMO, CRO, and BID outputs through `brand_harness` and
   check Premium Perception, Visual Consistency (`Visual_Identity`,
   `Logo_Placement`), Tone Consistency (`Typography`), and Trend
   Integrity (`Trend_Adaptation_Rule`); on `[BRAND_HARNESS: FAILED]`,
   block and rewrite.
6. MUST obtain explicit authorization per `authorization_gates` before
   any campaign, discount, publication, or supplier purchase order, and
   escalate per `escalation` on ambiguity, mismatch, conflict, or risk.
