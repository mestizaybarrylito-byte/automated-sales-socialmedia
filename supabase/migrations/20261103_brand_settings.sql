-- Brand identity: logo, suggested palette and active theme (single row).
-- The web app reads/writes id='default' via PostgREST (anon key) with a
-- localStorage fallback, so the prototype works offline and persists across
-- devices once Supabase env vars are configured.

create table if not exists brand_settings (
  id text primary key,
  logo_data_url text,
  palette jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table brand_settings enable row level security;

-- Prototype policies: authenticated (owner/CEO portal) full access.
create policy "owner full access" on brand_settings
  for all to authenticated using (true) with check (true);

-- Public storefront reads the brand row (header logo + theme).
create policy "public brand read" on brand_settings
  for select to anon using (true);

-- Seed the default rust/charcoal identity so first paint matches the guide.
insert into brand_settings (id, logo_data_url, palette, theme)
values (
  'default',
  null,
  '["#9a5f3b", "#563526", "#1a1c1e", "#232527", "#f7f2ea", "#c2410c"]'::jsonb,
  '{"primary": "#9a5f3b", "primaryDeep": "#563526", "dark": "#1a1c1e", "surface": "#232527", "background": "#f7f2ea", "accent": "#c2410c"}'::jsonb
)
on conflict (id) do nothing;
