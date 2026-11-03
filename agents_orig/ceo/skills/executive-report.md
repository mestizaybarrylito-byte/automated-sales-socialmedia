# Skill: Executive Report

Flat skill format. Produces the consolidated executive summary for the Human
Supervisor. References `[BUSINESS_CONTEXT_SHEET]` fields and dashboard
modules by name only.

## Purpose

Send regular consolidated executive summaries covering Growth, Commercial,
Core Business Health, Logistics & Supply, and Automation Transparency, so
the Human Supervisor and Business Owner can approve proposals via the
dashboard modules (KPI Summary, YoY Analytics, Weekly Campaign Approval
Hub, Geospatial Map, Customer Segmentation). Monetary figures carry
`[Currency, e.g., MXN]` unchanged.

## Inputs

- CGMO inputs: new leads, content performance per platform, top traffic
  sources.
- CRO inputs: closed sales revenue (in `[Currency, e.g., MXN]`), AOV,
  occasional vs. frequent breakdown, total promotion cost absorbed.
- Core health inputs: Global CAC, LTV, Global RoAS, Net Profit Margin.
- LOG-SD inputs: supply status, fulfillment success rate per delivery
  modality, logistics fees absorbed; `Logistics_Pickup_Schedule`
  (`Delivery_Day`, `Time_Window`, `Specific_Location`:
  [Insert exact address/link here, e.g., "Main Plaza Parking Lot, Next to the Fountain"]).
- Automation log: actions and results of tasks already authorized to run
  automatically.
- Pending proposals awaiting Human Supervisor authorization.

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`; confirm
   every reported strategy complies with both.
2. Compile the five sections in fixed order: Growth (CGMO), Commercial
   (CRO), Core Business Health, Logistics & Supply (LOG-SD), Automation
   Transparency (always list actions and results of automatic tasks, or
   `none` if there are none).
3. Cross-reference acquisition cost, discount margin, and delivery cost to
   confirm net profitability of any attached proposal.
4. Attach pending proposals (campaign, discount, publication, supplier
   purchase order) in structured format for explicit authorization,
   flagging any `company-minimum-margin` (undefined) dependency.
5. Submit the report and proposals via the dashboard modules for approval.

## Outputs

- Executive summary with exactly these sections: Growth, Commercial, Core
  Business Health, Logistics & Supply, Automation Transparency.
- Structured pending-proposal list with financial-viability and
  brand-consistency review notes.
- Profitability cross-check result tied to CGMO/CRO/LOG-SD inputs.

## Failure handling

- On missing or stale agent inputs: send the report with the affected
  section marked `data pending`, and escalate per `escalation` in
  `harness/policy.yaml`.
- On cold-chain, oversell, or brand risk discovered while compiling: pause
  the affected operation and flag it for human approval before submitting
  related proposals.
- On `[BRAND_HARNESS: FAILED]` for any attached CGMO/CRO/BID asset: exclude
  it from the report, return the rejection ticket to the generating agent,
  and note the exclusion.
