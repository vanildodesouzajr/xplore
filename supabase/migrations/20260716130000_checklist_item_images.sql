-- Optional per-step image for checklist items, uploaded to Supabase Storage.
-- Nullable: items without an image render exactly as before.
alter table public.checklist_items
  add column if not exists image_url text;

-- Public bucket for checklist step images. Public read keeps rendering simple —
-- the stable public URL is stored in checklist_items.image_url.
insert into storage.buckets (id, name, public)
values ('checklist-images', 'checklist-images', true)
on conflict (id) do nothing;

-- Storage RLS. Reads are public; writes are limited to authenticated users and
-- only under a top-level folder named after their own uid. Upload paths follow
-- {uid}/{gameId}/{itemId}/{file}, so foldername[1] is the owner's uid.
drop policy if exists "checklist_images_read" on storage.objects;
create policy "checklist_images_read" on storage.objects
  for select to public
  using (bucket_id = 'checklist-images');

drop policy if exists "checklist_images_insert_own" on storage.objects;
create policy "checklist_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'checklist-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "checklist_images_update_own" on storage.objects;
create policy "checklist_images_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'checklist-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'checklist-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "checklist_images_delete_own" on storage.objects;
create policy "checklist_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'checklist-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
