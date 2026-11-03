-- Brand identity, part 2: company name + typography (three font roles).
-- Extends brand_settings; existing rows pick up the defaults below.

alter table brand_settings
  add column if not exists company_name text not null default 'Casa de Brasas';

alter table brand_settings
  add column if not exists fonts jsonb not null
  default '{"heading": "georgia", "body": "system-sans", "accent": "system-sans"}'::jsonb;
