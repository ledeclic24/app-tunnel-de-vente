-- Vendeko — migration 004 : stockage d'images + brand kit
-- A executer dans Supabase > SQL Editor.

-- ============ Brand kit par tunnel ============
alter table public.funnels add column if not exists brand jsonb not null default '{}'::jsonb;

-- ============ Stockage des images importées (hero, image, logo) ============
insert into storage.buckets (id, name, public)
values ('funnel-assets', 'funnel-assets', true)
on conflict (id) do nothing;

drop policy if exists "funnel-assets public read" on storage.objects;
create policy "funnel-assets public read" on storage.objects
  for select using (bucket_id = 'funnel-assets');

drop policy if exists "funnel-assets owner insert" on storage.objects;
create policy "funnel-assets owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "funnel-assets owner update" on storage.objects;
create policy "funnel-assets owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "funnel-assets owner delete" on storage.objects;
create policy "funnel-assets owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = auth.uid()::text);
