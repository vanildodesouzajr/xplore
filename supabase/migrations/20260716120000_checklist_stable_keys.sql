-- Stable per-parent keys for curated checklist content so the games importer
-- (scripts/games/sync.mjs) can upsert rows by (parent, key) instead of
-- re-creating them. Re-creating a seeded game changes row ids and cascade-wipes
-- user_game_progress / user_item_progress; matching by a stable key preserves
-- ids, and therefore preserves every user's progress across re-imports.
--
-- Idempotent (if not exists) so it is safe to apply via the dashboard SQL editor
-- and still be re-run harmlessly by `supabase db push` afterwards.
alter table public.checklist_categories
  add column if not exists key text;

alter table public.checklist_items
  add column if not exists key text;

-- Unique per parent, but only when set. Content created by hand through the edit
-- UI leaves key null and is unaffected by this constraint; curated content that
-- flows through the importer always carries a key.
create unique index if not exists checklist_categories_game_key_uniq
  on public.checklist_categories (game_id, key)
  where key is not null;

create unique index if not exists checklist_items_category_key_uniq
  on public.checklist_items (category_id, key)
  where key is not null;
