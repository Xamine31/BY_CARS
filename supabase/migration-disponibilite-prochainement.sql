-- BY CARS - MISE A JOUR POUR UNE BASE SUPABASE EXISTANTE
-- Lancez une seule fois dans Supabase > SQL Editor.
-- Aucune annonce existante n'est supprimee ou recreee.

alter table public.vehicles
  add column if not exists availability_status text;

-- Conserve l'etat disponible / indisponible des anciennes annonces.
update public.vehicles
set availability_status = case
  when available is false then 'unavailable'
  else 'available'
end
where availability_status is null;

alter table public.vehicles
  alter column availability_status set default 'available';

alter table public.vehicles
  alter column availability_status set not null;

alter table public.vehicles
  drop constraint if exists vehicles_availability_status_check;

alter table public.vehicles
  add constraint vehicles_availability_status_check
  check (availability_status in ('available', 'coming_soon', 'unavailable'));

-- 3 valeurs : disponible / disponible prochainement / indisponible.
-- 'published' reste independant : une annonce a venir peut etre publique.
