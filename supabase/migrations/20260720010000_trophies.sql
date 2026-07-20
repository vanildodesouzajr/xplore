-- Trophy tracking: a second, independent per-game list (PSN/Xbox/Steam-style
-- Bronze/Silver/Gold/Platinum tiers) that a player checks off separately from
-- the detonado checklist. Deliberately not integrated with
-- checklist_categories/checklist_items — own tables, own progress, own RLS,
-- mirroring that pair closely so the two systems stay consistent.
create table public.trophies (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  key text,
  title text not null,
  title_i18n jsonb not null default '{}'::jsonb,
  description text,
  description_i18n jsonb not null default '{}'::jsonb,
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index trophies_game_key_uniq
  on public.trophies (game_id, key)
  where key is not null;

alter table public.trophies enable row level security;

create policy "trophies_select_authenticated" on public.trophies
  for select to authenticated using (true);

create policy "trophies_insert_own_game" on public.trophies
  for insert to authenticated
  with check (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ));

create policy "trophies_update_own_game" on public.trophies
  for update to authenticated
  using (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ));

create table public.user_trophy_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trophy_id uuid not null references public.trophies(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, trophy_id)
);

alter table public.user_trophy_progress enable row level security;

create policy "user_trophy_progress_select_own" on public.user_trophy_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_trophy_progress_insert_own" on public.user_trophy_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_trophy_progress_update_own" on public.user_trophy_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_trophy_progress_delete_own" on public.user_trophy_progress
  for delete to authenticated using ((select auth.uid()) = user_id);
