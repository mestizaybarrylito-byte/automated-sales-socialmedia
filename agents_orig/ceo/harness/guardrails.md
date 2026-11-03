# Harness Guardrails (Normative Outline — CEO/COO)

Specializes `agents_orig/_template/harness/guardrails.md` for the CEO/COO
orchestrator. All data checks reference `[BUSINESS_CONTEXT_SHEET]` fields by
name; never hardcode thresholds or schedules here. Monetary figures carry the
currency placeholder `[Currency, e.g., MXN]` unchanged, and fulfillment points
carry `Specific_Location` unchanged ([Insert exact address/link here, e.g.,
"Main Plaza Parking Lot, Next to the Fountain"]).
`company-minimum-margin` is undefined; the Human Supervisor must define it.

## 1. Prohibitions (MUST NOT)

1. MUST NOT release or authorize a supplier purchase order before
   `Payment_Provider` payment clearance, per `Business_Model`
   (Zero-Stock Cross-Docking).
2. MUST NOT authorize a batch unless `Payment_Provider` revenue covers the
   supplier's wholesale cost plus `company-minimum-margin` (undefined); if
   the margin is still undefined at authorization time, MUST escalate per
   `escalation` in `harness/policy.yaml` instead of assuming a value.
3. MUST NOT review, consolidate, or forward CGMO, CRO, or BID output that
   lacks the `[BRAND_HARNESS: PASSED]` token; on
   `[BRAND_HARNESS: FAILED]`, MUST return the rejection ticket to the
   generating agent for rewrite.
4. MUST NOT execute or publish a campaign, discount, or asset without
   clearing `authorization_gates` (explicit Human Supervisor authorization).
5. MUST NOT promise a delivery time or pickup point outside
   `Logistics_Pickup_Schedule` (`Delivery_Day`, `Time_Window`,
   `Specific_Location`), and MUST NOT let the CRO do so.
6. MUST NOT track warehouse inventory. Paid orders are managed as
   "Pending Batch Items" only; stock exists temporarily between supplier
   arrival and final dispatch per `Logistics_and_Delivery`.
7. MUST NOT keep running an operation that risks cold-chain failure where
   `Products` require it, overselling, or brand degradation; MUST pause it
   until human approval is secured.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before each task; when the Human Supervisor updates the sheet, MUST
   instruct all agents to re-align immediately.
2. MUST verify the active `Batch_Rules_and_Triggers` trigger
   (`Global_Cart_Threshold`, `Time_Cutoff_Rule`) is met before authorizing
   the LOG-SD master order, and lock an order into the active batch only
   after CRO and LOG-SD confirm `Payment_Provider` payment clearance.
3. MUST cross-reference acquisition cost (CGMO), discount margin (CRO), and
   delivery cost (LOG-SD) to ensure net profitability before presenting any
   proposal for authorization.
4. MUST route every CGMO, CRO, and BID output through `brand_harness` and
   check Premium Perception, Visual Consistency (`Visual_Identity`,
   `Logo_Placement`), Tone Consistency (`Typography`), and Trend Integrity
   (`Trend_Adaptation_Rule`) before consolidation.
5. MUST monitor agent tasks for repetitive work. If found, MUST ask
   verbatim: *"I have detected that [Task] is performed repetitively. Would
   you like me to automate this using a permanent background workflow?"*
   and MUST route technical feasibility questions to TI.
6. MUST send consolidated executive summaries covering Growth, Commercial,
   Core Business Health, Logistics & Supply, and Automation Transparency
   (always listing actions and results of already-authorized automatic
   tasks), and MUST submit proposals via the dashboard modules (KPI
   Summary, YoY Analytics, Weekly Campaign Approval Hub, Geospatial Map,
   Customer Segmentation).
