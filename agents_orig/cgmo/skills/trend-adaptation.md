# Skill: Trend Adaptation

Flat skill format. Identifies weekly industry trends and adapts them to
the brand editorial line. References `Company_Type`,
`Trend_Adaptation_Rule`, `Products`, and `Brand_Design_Guidelines` by
field name only.

## Purpose

Track consumer trends in the `Company_Type` category and competitor
content strategies, identify the top 5 weekly industry trends, and
adapt them per `Trend_Adaptation_Rule` so every trend execution links
back to the core brand message without sacrificing premium perception
for cheap virality.

## Inputs

- Consumer-trend feed for the `Company_Type` category and competitor
  content observations.
- `Trend_Adaptation_Rule` (core-message link-back requirement).
- `Products` (product desire triggers, usage ideas, demonstrations).
- `Brand_Design_Guidelines` (`Visual_Identity`, `Logo_Placement`,
  `Typography`).
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`
   before researching trends.
2. Track consumer trends in the `Company_Type` category and competitor
   content strategies for the week.
3. Select the top 5 weekly industry trends with the strongest fit to
   `Products` and the seasonal/social calendar.
4. Adapt each trend per `Trend_Adaptation_Rule`, linking its core
   message back to the required brand themes; drop any trend that
   cannot link back.
5. Draft the adapted content (hooks, scripts, post copy) and request
   supporting visuals from BID.
6. Submit every draft for Brand Harness audit; rewrite on
   `[BRAND_HARNESS: FAILED]` until `[BRAND_HARNESS: PASSED]`.
7. Submit passing drafts to the AI Leader with the compact report
   (new clients captured, traffic sources, content drafts) and obtain
   authorization before publishing or scheduling.

## Outputs

- Top 5 weekly industry trends with per-trend adaptation notes tied
  to `Trend_Adaptation_Rule`.
- Adapted content drafts, each carrying `[BRAND_HARNESS: PASSED]`.
- Dropped-trend list with the link-back reason, or `none`.
- Compact AI Leader report awaiting `authorization_gates` approval.

## Failure handling

- On `[BRAND_HARNESS: FAILED]` for any draft: block it, return the
  rejection ticket to the draft, and rewrite before resubmission.
- On a trend that cannot satisfy `Trend_Adaptation_Rule`: drop the
  trend rather than diluting premium perception; never force the fit.
- On `Trend_Adaptation_Rule` ambiguity: stop and escalate per
  `escalation` in `harness/policy.yaml`.
