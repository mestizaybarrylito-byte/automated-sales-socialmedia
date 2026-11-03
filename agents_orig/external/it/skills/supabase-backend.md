# Skill: Supabase Backend (PostgreSQL, Auth, Edge Functions)

IT skill. Owns the data, auth, and serverless backend on the Supabase free tier. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Provide a $0 backend: PostgreSQL schema with Row Level Security, auth for the restricted Owner/CEO portal, and Edge Functions for webhooks and API routing. Covers every construct the solution needs — orders, Clip transactions, fulfillment events, webhook log — without paid add-ons.

## Inputs

- Business entities from `[BUSINESS_CONTEXT_SHEET]` (orders, Pending Batch Items, `Payment_Provider` transactions, `Batch_Rules_and_Triggers`).
- Dashboard query needs (KPI hub, YoY, Approval Hub, map, CRM).
- Webhook contracts (WhatsApp Cloud API, Clip confirmations).
- `harness/read-only-policy.yaml` (routing and authorization rules).

## Steps

1. Model tables: orders, payments, fulfillment events, webhook log, campaign slots; migrations versioned under `/supabase`.
2. Enable Row Level Security on every table; service-role key stays server-side (Edge Functions only), never in the client bundle.
3. Implement Edge Functions (Deno) for: WhatsApp webhook receiver, Clip confirmation handler, API routing for the storefront and dashboard.
4. Make every webhook handler idempotent (idempotency keys on event IDs); log raw payloads before processing.
5. Store secrets in environment variables; ship `.env.example` with no real values.
6. Monitor free-tier quotas (DB size, function invocations, bandwidth, auth users) and report headroom to the AI Leader.

## Outputs

- Migration files and ER notes for the schema.
- Edge Function handlers (or detailed designs) for each webhook/route.
- Quota headroom report supporting the infrastructure-cost KPI.

## Failure handling

- On quota-breach risk: stop new scope, propose trims (retention windows, payload pruning), and escalate to the AI Leader.
- On webhook anomaly (signature mismatch, duplicate, out-of-order): reject or dedupe, log, and alert; never mutate business data on an unverified event.
- On missing AI Leader routing: take no action on direct agent requests.
