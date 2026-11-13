-- BY CARS V5 — Maintient public.admins.email synchronisé avec Supabase Auth.
-- Aucun mot de passe dans SQL : modification uniquement via l'interface admin.
-- À exécuter une fois dans Supabase > SQL Editor. Compatible avec les données existantes.

create or replace function public.sync_bycars_admin_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.admins
  set email = new.email
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_bycars on auth.users;
create trigger on_auth_user_email_bycars
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_bycars_admin_email();

-- Recalage immédiat des adresses déjà confirmées :
update public.admins as a
set email = u.email
from auth.users as u
where a.user_id = u.id
  and a.email is distinct from u.email;
