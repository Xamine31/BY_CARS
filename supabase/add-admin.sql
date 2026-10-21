-- BY CARS — AJOUT DU COMPTE ADMIN
-- 1) Créez d'abord l'utilisateur avec email + mot de passe dans Supabase Authentication > Users.
-- 2) Remplacez l'email ci-dessous par l'email du compte créé.
-- 3) Exécutez cette requête dans SQL Editor.

insert into public.admins (user_id, email)
select id, email
from auth.users
where lower(email) = lower('admin@bycars.fr')
on conflict (user_id) do update set email = excluded.email;
