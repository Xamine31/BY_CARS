# BY CARS — Showroom automobile

Site moderne React + Vite + TypeScript, prévu pour un showroom basé à Marseille et spécialisé dans l’export France → Algérie.

## Fonctionnalités

- Design premium moderne aux couleurs BY CARS (bleu nuit + orange)
- Version responsive optimisée téléphone / tablette / ordinateur
- Navigation mobile en panneau coulissant
- Aucun bouton administrateur visible sur le site public
- Catalogue filtrable neuf / occasion / motorisation / prix
- Fiche véhicule détaillée avec galerie photo déroulante et swipe tactile sur mobile
- Prix HT, année, kilométrage, carburant, boîte, moteur, puissance, couleur, portes, places
- Contact téléphone / WhatsApp / formulaire
- Administration protégée par Supabase Auth
- Ajout, modification et suppression de véhicules
- Upload multiple de photos vers Supabase Storage
- Publication, disponibilité et mise en avant des véhicules
- Base de données Supabase avec RLS (Row Level Security)
- Déploiement compatible GitHub Pages grâce au HashRouter

## 1. Installer

```bash
npm install
cp .env.example .env
```

Renseigner ensuite :

```env
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON
```

La clé `anon` peut être utilisée côté navigateur : la sécurité repose sur les policies RLS du fichier SQL. Ne mettez jamais la `service_role` dans le site.

## 2. Préparer Supabase

1. Créer un projet Supabase.
2. Ouvrir **SQL Editor** et exécuter `supabase/schema.sql`.
3. Dans **Authentication > Users**, créer votre compte admin (email + mot de passe).
4. Copier l’UUID du user créé.
5. Dans SQL Editor, exécuter :

```sql
insert into public.admins (user_id, email)
values ('UUID_DU_USER', 'votre@email.fr');
```

Le bucket `vehicle-images` est créé par le script SQL.

## 3. Lancer en local

```bash
npm run dev
```

Puis ouvrir l’URL affichée par Vite. Aucun lien admin n’est affiché publiquement. L’administration est accessible directement avec `#/admin` et reste protégée par Supabase Auth.

## 4. Déployer depuis GitHub

Le repo contient `.github/workflows/deploy.yml`.

Dans **GitHub > Settings > Secrets and variables > Actions**, ajouter :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Puis dans **Settings > Pages**, choisir **GitHub Actions** comme source. Chaque push sur `main` déploiera le site.

## Personnalisation rapide

- Logo modernisé : `src/assets/bycars-logo.svg`
- Photo du garage : `src/assets/showroom.jpg`
- Couleurs : variables CSS au début de `src/styles.css`
- Téléphone : rechercher `06 18 17 59 11` / `33618175911`
- Texte du site : pages dans `src/pages/`

## Remarque

Sans variables Supabase, le site public affiche un petit stock de démonstration pour prévisualiser le design. L’administration indique comment connecter Supabase.


## Lien administrateur sur GitHub Pages

Le lien n’apparaît nulle part dans la navigation publique. Utilisez directement :

```text
https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/#/admin
```

Conservez ce lien dans vos favoris. L’accès reste sécurisé par la connexion Supabase et la table `admins`.
