-- BY CARS — MIGRATION PRIX SUR DEVIS
-- À exécuter UNE FOIS uniquement si votre base a déjà été initialisée avec une ancienne version.

alter table public.vehicles
  alter column price_ht drop not null;

alter table public.vehicles
  drop constraint if exists vehicles_price_ht_check;

alter table public.vehicles
  add constraint vehicles_price_ht_check
  check (price_ht is null or price_ht >= 0);
