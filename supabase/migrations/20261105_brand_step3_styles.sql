-- Brand identity, part 3: wizard step-3 style pins (up to five style ids).
-- Extends brand_settings; existing rows pick up Meta's preset default.

alter table brand_settings
  add column if not exists step3_style_ids jsonb not null
  default '["anime", "watercolor", "8bit", "illustrated", "glowy"]'::jsonb;
