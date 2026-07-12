-- Profiles: one row per user, auto-created on signup.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Auto-create a profile row whenever a new user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tighten catalog write access to the owning user; browsing stays open to all authenticated users.
drop policy "games_insert_authenticated" on public.games;
drop policy "games_update_authenticated" on public.games;

create policy "games_insert_own" on public.games
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "games_update_own" on public.games
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

drop policy "checklist_categories_insert_authenticated" on public.checklist_categories;
drop policy "checklist_categories_update_authenticated" on public.checklist_categories;

create policy "checklist_categories_insert_own_game" on public.checklist_categories
  for insert to authenticated
  with check (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ));
create policy "checklist_categories_update_own_game" on public.checklist_categories
  for update to authenticated
  using (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.games g
    where g.id = game_id and g.created_by = (select auth.uid())
  ));

drop policy "checklist_items_insert_authenticated" on public.checklist_items;
drop policy "checklist_items_update_authenticated" on public.checklist_items;

create policy "checklist_items_insert_own_game" on public.checklist_items
  for insert to authenticated
  with check (exists (
    select 1 from public.checklist_categories c
    join public.games g on g.id = c.game_id
    where c.id = category_id and g.created_by = (select auth.uid())
  ));
create policy "checklist_items_update_own_game" on public.checklist_items
  for update to authenticated
  using (exists (
    select 1 from public.checklist_categories c
    join public.games g on g.id = c.game_id
    where c.id = category_id and g.created_by = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.checklist_categories c
    join public.games g on g.id = c.game_id
    where c.id = category_id and g.created_by = (select auth.uid())
  ));
