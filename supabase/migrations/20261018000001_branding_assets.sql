begin;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('devbhoomi-branding','devbhoomi-branding',true,5242880,array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Admins upload branding assets" on storage.objects;
create policy "Admins upload branding assets" on storage.objects for insert to authenticated with check (bucket_id='devbhoomi-branding' and public.is_admin());
drop policy if exists "Admins update branding assets" on storage.objects;
create policy "Admins update branding assets" on storage.objects for update to authenticated using (bucket_id='devbhoomi-branding' and public.is_admin()) with check (bucket_id='devbhoomi-branding' and public.is_admin());
drop policy if exists "Admins delete branding assets" on storage.objects;
create policy "Admins delete branding assets" on storage.objects for delete to authenticated using (bucket_id='devbhoomi-branding' and public.is_admin());
drop policy if exists "Public read branding assets" on storage.objects;
create policy "Public read branding assets" on storage.objects for select to anon,authenticated using (bucket_id='devbhoomi-branding');
drop policy if exists "Public can read branding settings" on public.site_settings;
create policy "Public can read branding settings" on public.site_settings for select to anon,authenticated using (setting_key in ('site_logo_url','site_name'));
commit;