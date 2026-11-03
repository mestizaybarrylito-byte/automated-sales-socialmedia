# Skill: WhatsApp Integration (Cloud API + Catalog + Native Cart)

IT skill. Owns conversational commerce via the Meta WhatsApp Cloud API backed by Supabase webhooks. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Run the WhatsApp sales channel end to end: webhook receiver, catalog sync, multi-product messages, and native cart — handing finalized carts to `skills/payment-fulfillment.md` for Clip-link generation, inside the 24-hour messaging rules.

## Inputs

- Product catalog (meats, sauces, bundles) and availability signals.
- Cloud API credentials (server-side only) and approved message templates.
- Webhook contract from `skills/supabase-backend.md`.

## Steps

1. Verify and subscribe the webhook; validate every inbound signature in the Edge Function receiver.
2. Sync the catalog on schedule and on availability alerts from LOG-SD.
3. Serve multi-product messages and native cart flows; persist cart state in Supabase.
4. Hand finalized carts to the payment-fulfillment flow; never generate payment links inside this skill.
5. Enforce the 24-hour customer-service window; use approved templates outside it; honor opt-outs immediately.

## Outputs

- Webhook handler (or design) with signature validation.
- Message templates and catalog-sync report.
- Window-compliance and opt-out handling notes.

## Failure handling

- On signature mismatch: reject, log raw payload, and alert; never process unverified events.
- On template rejection: rewrite via the Brand Harness path and resubmit.
- On window expiry mid-conversation: switch to approved templates only.
- On missing AI Leader routing: take no action on direct agent requests.
