# Skill: Campaign Review

Flat skill format. Resolves the Weekly Campaign Approval Hub queue. References
`Brand_Design_Guidelines` and dashboard modules by name only.

## Purpose

Scrutinize the weekly ad thumbnails, copy previews, and ad formats submitted
by the CGMO in the Weekly Campaign Approval Hub, and approve, reject, or
request changes. Every approved asset must strictly align with the premium,
traditional, artisanal brand identity before deployment is authorized.

## Inputs

- Weekly Campaign Approval Hub queue: thumbnails, copy previews, ad formats.
- `Brand_Design_Guidelines` (`Visual_Identity`, `Logo_Placement`,
  `Typography`, `Trend_Adaptation_Rule`).
- `brand_harness` token per asset (`[BRAND_HARNESS: PASSED]` or
  `[BRAND_HARNESS: FAILED]` with rejection ticket).
- Executive KPI Summary and YoY Comparative Analytics for context on
  current performance.
- `harness/policy.yaml` (`authorization_gates`, `escalation`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines` before
   reviewing.
2. Reject without further review any asset lacking
   `[BRAND_HARNESS: PASSED]`; return its rejection ticket via the CEO for
   rewrite.
3. Scrutinize each passing asset against the Creative Brand Guard: premium
   perception, visual consistency, tone consistency, and trend integrity.
4. Resolve each item as Approved, Pending Adjustments (request changes with
   precise corrections), or Rejected.
5. Authorize deployment only for Approved items; record the verdict per item.

## Outputs

- Per-item verdicts: Approved / Pending Adjustments / Rejected, with
  brand-rule citations for anything not approved.
- `[Weekly Campaign Resolution]`: final verdict stating which thumbnails
  are approved for the week and which are sent back.
- Full owner response in the approval-status response format:
  `[Approval Status]`, `[Dashboard Analysis]`,
  `[Weekly Campaign Resolution]`, `[Directives for the CEO]`, in a
  decisive, executive, analytical tone.

## Failure handling

- On `[BRAND_HARNESS: FAILED]` for any asset: block it from deployment,
  return the rejection ticket via the CEO, and require rewrite before
  resubmission.
- On hub queue missing previews or tokens: mark affected items Pending
  Adjustments and escalate per `escalation` in `harness/policy.yaml`.
- On cold-chain, oversell, or schedule risk tied to a campaign (e.g.
  promoting unavailable supply): reject the affected items and direct the
  CEO to realign with LOG-SD data.
