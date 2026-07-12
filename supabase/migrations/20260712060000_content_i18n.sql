-- Bilingual content: JSONB locale maps like {"en": "...", "pt": "..."} alongside
-- the existing single-language text columns, which remain as the fallback value.
alter table public.games
  add column title_i18n jsonb not null default '{}'::jsonb;

alter table public.checklist_categories
  add column title_i18n jsonb not null default '{}'::jsonb;

alter table public.checklist_items
  add column title_i18n jsonb not null default '{}'::jsonb,
  add column description_i18n jsonb not null default '{}'::jsonb;
