-- BY CARS V5 - Quota anti-spam pour le formulaire e-mail.
-- À exécuter une fois dans Supabase > SQL Editor, sans perdre les véhicules.
-- Les empreintes d'adresse IP sont hachées côté fonction Edge.
create table if not exists public.contact_email_attempts (
  id bigint generated always as identity primary key,
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_email_attempts_fingerprint_idx
  on public.contact_email_attempts (fingerprint, created_at desc);

alter table public.contact_email_attempts enable row level security;
revoke all on table public.contact_email_attempts from anon, authenticated;

create or replace function public.claim_contact_email_quota(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if p_fingerprint is null or length(p_fingerprint) <> 64
     or p_fingerprint !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  -- Évite les courses simultanées pour une même empreinte.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_fingerprint, 0));
  select count(*) into recent_count
  from public.contact_email_attempts
  where fingerprint = p_fingerprint
    and created_at > now() - interval '15 minutes';

  if recent_count >= 5 then
    return false;
  end if;
  insert into public.contact_email_attempts(fingerprint) values (p_fingerprint);
  -- Nettoyage opportuniste des traces de plus de 24 heures.
  delete from public.contact_email_attempts
  where created_at < now() - interval '24 hours';
  return true;
end;
$$;

revoke all on function public.claim_contact_email_quota(text) from public, anon, authenticated;
grant execute on function public.claim_contact_email_quota(text) to service_role;
