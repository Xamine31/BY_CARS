-- BY CARS : coordonnées, réseaux et visuel d'accueil.
-- Nouvelle installation : inclus automatiquement dans schema.sql.
-- Base existante : exécuter UNE SEULE FOIS migration-site-settings.sql dans SQL Editor.

create table if not exists public.site_settings (
  id integer primary key default 1 check (id=1),
  phone_display text not null default '06 18 17 59 11',
  phone_intl text not null default '33618175911',
  form_whatsapp_intl text not null default '33615100628',
  email text not null default '',
  address text not null default '54 Rue de la Joliette, Marseille',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  youtube_url text not null default '',
  linkedin_url text not null default '',
  hero_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, phone_display, phone_intl, form_whatsapp_intl, address)
values (1,'06 18 17 59 11','33618175911','33615100628','54 Rue de la Joliette, Marseille')
on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon,authenticated;
grant insert, update on public.site_settings to authenticated;

drop policy if exists "Public read site settings" on public.site_settings;
drop policy if exists "Admins insert site settings" on public.site_settings;
drop policy if exists "Admins update site settings" on public.site_settings;

create policy "Public read site settings" on public.site_settings
  for select to anon,authenticated using (true);
create policy "Admins insert site settings" on public.site_settings
  for insert to authenticated with check (
    exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
  );
create policy "Admins update site settings" on public.site_settings
  for update to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

insert into storage.buckets (id,name,public)
values ('site-media','site-media',true)
on conflict (id) do update set public = true;

drop policy if exists "Public read site media" on storage.objects;
drop policy if exists "Admins upload site media" on storage.objects;
drop policy if exists "Admins update site media" on storage.objects;
drop policy if exists "Admins delete site media" on storage.objects;

create policy "Public read site media" on storage.objects
  for select to anon,authenticated using (bucket_id='site-media');
create policy "Admins upload site media" on storage.objects
  for insert to authenticated with check (
    bucket_id='site-media' and exists (
      select 1 from public.admins a where a.user_id = (select auth.uid())
    )
  );
create policy "Admins update site media" on storage.objects
  for update to authenticated using (
    bucket_id='site-media' and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
  ) with check (
    bucket_id='site-media' and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
  );
create policy "Admins delete site media" on storage.objects
  for delete to authenticated using (
    bucket_id='site-media' and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
  );
