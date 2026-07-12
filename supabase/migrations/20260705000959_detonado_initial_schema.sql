create extension if not exists pgcrypto;

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  platform text not null,
  cover_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index games_created_by_idx on public.games(created_by);

create table public.checklist_categories (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index checklist_categories_game_id_idx on public.checklist_categories(game_id);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.checklist_categories(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index checklist_items_category_id_idx on public.checklist_items(category_id);

create table public.user_game_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (user_id, game_id)
);
create index user_game_progress_user_id_idx on public.user_game_progress(user_id);
create index user_game_progress_game_id_idx on public.user_game_progress(game_id);

create table public.user_item_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.checklist_items(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, item_id)
);
create index user_item_progress_user_id_idx on public.user_item_progress(user_id);
create index user_item_progress_item_id_idx on public.user_item_progress(item_id);

alter table public.games enable row level security;
alter table public.checklist_categories enable row level security;
alter table public.checklist_items enable row level security;
alter table public.user_game_progress enable row level security;
alter table public.user_item_progress enable row level security;

create policy "games_select_authenticated" on public.games for select to authenticated using (true);
create policy "games_insert_authenticated" on public.games for insert to authenticated with check (true);
create policy "games_update_authenticated" on public.games for update to authenticated using (true) with check (true);

create policy "checklist_categories_select_authenticated" on public.checklist_categories for select to authenticated using (true);
create policy "checklist_categories_insert_authenticated" on public.checklist_categories for insert to authenticated with check (true);
create policy "checklist_categories_update_authenticated" on public.checklist_categories for update to authenticated using (true) with check (true);

create policy "checklist_items_select_authenticated" on public.checklist_items for select to authenticated using (true);
create policy "checklist_items_insert_authenticated" on public.checklist_items for insert to authenticated with check (true);
create policy "checklist_items_update_authenticated" on public.checklist_items for update to authenticated using (true) with check (true);

create policy "user_game_progress_select_own" on public.user_game_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_game_progress_insert_own" on public.user_game_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_game_progress_update_own" on public.user_game_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_game_progress_delete_own" on public.user_game_progress
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "user_item_progress_select_own" on public.user_item_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_item_progress_insert_own" on public.user_item_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_item_progress_update_own" on public.user_item_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_item_progress_delete_own" on public.user_item_progress
  for delete to authenticated using ((select auth.uid()) = user_id);
