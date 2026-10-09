-- BY CARS - Supabase schema
-- Execute this file in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  trim text,
  price_ht numeric(12,2) not null check (price_ht >= 0),
  condition text not null check (condition in ('neuf','occasion')),
  year integer not null check (year between 1990 and 2100),
  mileage integer not null default 0 check (mileage >= 0),
  fuel text not null,
  transmission text not null,
  engine text,
  power_hp integer,
  color text,
  doors integer,
  seats integer,
  description text,
  photos text[] not null default '{}',
  featured boolean not null default false,
  available boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_touch_updated_at on public.vehicles;
create trigger vehicles_touch_updated_at before update on public.vehicles
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins enable row level security;
alter table public.vehicles enable row level security;
alter table public.inquiries enable row level security;

-- admins: a user can only see whether their own account is an admin.
drop policy if exists "admin can read own admin row" on public.admins;
create policy "admin can read own admin row" on public.admins for select to authenticated
using (user_id = auth.uid());

-- vehicles: public sees published stock; admins have full CRUD.
drop policy if exists "public can view published vehicles" on public.vehicles;
create policy "public can view published vehicles" on public.vehicles for select to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "admins can insert vehicles" on public.vehicles;
create policy "admins can insert vehicles" on public.vehicles for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update vehicles" on public.vehicles;
create policy "admins can update vehicles" on public.vehicles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins can delete vehicles" on public.vehicles;
create policy "admins can delete vehicles" on public.vehicles for delete to authenticated
using (public.is_admin());

-- Contact form: anyone can create a request; only admins can read it.
drop policy if exists "public can submit inquiry" on public.inquiries;
create policy "public can submit inquiry" on public.inquiries for insert to anon, authenticated
with check (char_length(name) between 1 and 120 and char_length(phone) between 3 and 40 and char_length(message) between 1 and 4000);

drop policy if exists "admins can read inquiries" on public.inquiries;
create policy "admins can read inquiries" on public.inquiries for select to authenticated
using (public.is_admin());

-- Public bucket for showroom photos. Upload/delete stays admin-only through Storage RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view vehicle images" on storage.objects;
create policy "public can view vehicle images" on storage.objects for select to public
using (bucket_id = 'vehicle-images');

drop policy if exists "admins can upload vehicle images" on storage.objects;
create policy "admins can upload vehicle images" on storage.objects for insert to authenticated
with check (bucket_id = 'vehicle-images' and public.is_admin());

drop policy if exists "admins can update vehicle images" on storage.objects;
create policy "admins can update vehicle images" on storage.objects for update to authenticated
using (bucket_id = 'vehicle-images' and public.is_admin()) with check (bucket_id = 'vehicle-images' and public.is_admin());

drop policy if exists "admins can delete vehicle images" on storage.objects;
create policy "admins can delete vehicle images" on storage.objects for delete to authenticated
using (bucket_id = 'vehicle-images' and public.is_admin());

-- After creating a user in Supabase Auth, promote it with:
-- insert into public.admins (user_id, email) values ('USER_UUID_HERE', 'admin@example.com');
