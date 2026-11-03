# Supabase backend (scaffold — Step 1)

Versioned migrations, seed data, and Edge Functions (Deno) land here in later
steps per `agents_orig/external/it/skills/supabase-backend.md`:

- `migrations/` — PostgreSQL schema with Row Level Security on every table
  (orders, payments, fulfillment events, webhook log, campaign slots).
- `functions/` — Edge Functions: WhatsApp webhook receiver, Clip confirmation
  handler, storefront/dashboard API routing.
- Secrets stay in environment variables; service-role key is server-side only.

Current state: `client.ts` is a config stub that fails loudly when env vars are
missing. See `web/.env.example`.
