# Skill: Payment & Fulfillment Pipeline (Clip Links + Confirmation Handler)

IT skill. Owns Clip payment-link generation and the fulfillment webhook pipeline. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Convert finalized carts (web or WhatsApp) into dynamic Clip payment links, and on confirmation execute the fulfillment chain: log the transaction in Supabase, dispatch the fulfillment request to suppliers, and emit the routing-instruction payload to LOG-SD — the technical backbone of the zero-stock JIT model.

## Inputs

- Finalized carts from the storefront or `skills/whatsapp-integration.md`.
- Clip API credentials (server-side only).
- Supplier dispatch endpoint and the LOG-SD routing-payload schema.
- CRO paid link/bill confirmations for reconciliation.

## Steps

1. Generate a dynamic Clip payment link per finalized cart; store link-to-cart mapping in Supabase.
2. Receive confirmations in an idempotent Edge Function handler (idempotency keys on event IDs).
3. On confirmation, in order: insert the transaction, dispatch the fulfillment request to suppliers, emit the routing-instruction payload to LOG-SD.
4. Reconcile CRO confirmations against the webhook log; expose a transaction ledger for Owner JIT oversight.
5. Never trigger fulfillment, dispatch, or routing on an unconfirmed payment.

## Outputs

- Link-generation flow and confirmation handler (or designs).
- Reconciliation report (webhook log vs. CRO confirmations).
- Transaction ledger query for the dashboard.

## Failure handling

- On duplicate, partial, or out-of-order webhooks: dedupe via idempotency keys; hold fulfillment until exactly-once confirmation.
- On CRO-vs-webhook mismatch: alert CRO and CEO, hold batch entry, and log the conflict.
- On supplier-dispatch failure: retry with backoff, then escalate to the CEO with the held batch state.
- On missing AI Leader routing: take no action on direct agent requests.
