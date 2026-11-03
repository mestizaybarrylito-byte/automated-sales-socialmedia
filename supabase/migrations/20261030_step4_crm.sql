-- Step 4 prototype schema: customers, products, sales, transactions.
-- Mirrors the lib/store.ts mock entities 1:1 (the Store interface is the seam).
-- RLS enabled on every table; service-role key stays in Edge Functions only.

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  notes text,
  created_at date not null default current_date
);

create table if not exists products (
  slug text primary key,
  name text not null,
  price_mxn integer not null check (price_mxn >= 0),
  price_placeholder boolean not null default true,
  description text not null default '',
  image text not null default '',
  category text not null check (category in ('corte', 'salsa', 'paquete')),
  active boolean not null default true
);

create table if not exists sales (
  id text primary key,
  customer_id text not null references customers (id) on delete restrict,
  items jsonb not null default '[]'::jsonb,
  total_mxn integer not null check (total_mxn >= 0),
  channel text not null check (channel in ('web', 'whatsapp')),
  clip_status text not null default 'sin_link'
    check (clip_status in ('sin_link', 'link_generado', 'pagado', 'surtido')),
  clip_link text,
  created_at date not null default current_date
);

-- Transaction ledger for Clip confirmations (payment-fulfillment skill).
-- One row per webhook event; idempotency_key dedupes duplicate/out-of-order
-- deliveries so fulfillment runs exactly once, only on confirmed payment.
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  sale_id text not null references sales (id) on delete restrict,
  clip_event_id text not null,
  idempotency_key text not null unique,
  amount_mxn integer not null check (amount_mxn >= 0),
  status text not null check (status in ('link_generado', 'pagado', 'reembolsado', 'conflicto')),
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

alter table customers enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table transactions enable row level security;

-- Prototype policies: authenticated (owner/CEO portal) full access.
-- Tighten per-role before production.
create policy "owner full access" on customers for all to authenticated using (true) with check (true);
create policy "owner full access" on products for all to authenticated using (true) with check (true);
create policy "owner full access" on sales for all to authenticated using (true) with check (true);
create policy "owner full access" on transactions for all to authenticated using (true) with check (true);

-- Public storefront reads the active catalog only.
create policy "public catalog read" on products for select to anon using (active = true);
