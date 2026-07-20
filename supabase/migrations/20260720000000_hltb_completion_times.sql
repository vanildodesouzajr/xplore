-- HowLongToBeat completion-time estimates, cached on the game row by the
-- curated content importer (scripts/games/sync.mjs) so the app never has to
-- call the (unofficial, undocumented) HLTB API at request time.
--
-- Idempotent (if not exists) so it is safe to apply via the dashboard SQL
-- editor and still be re-run harmlessly by `supabase db push` afterwards.
alter table public.games
  add column if not exists hltb_id text,
  add column if not exists hltb_main_hours numeric,
  add column if not exists hltb_main_extra_hours numeric,
  add column if not exists hltb_completionist_hours numeric;
