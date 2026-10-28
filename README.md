# BY CARS — Site officiel (GitHub Pages + Supabase)

Site vitrine automobile multipage pour **SARL BY Cars, Marseille**. La navigation, les coordonnées et la bannière principale fonctionnent sur mobile et ordinateur. Le stock, les comptes administrateurs, les paramètres du site et les photos sont gérés dans Supabase.

## Pages et contenu

- `index.html` : accueil, texte de présentation, bannière personnalisable et stock à la une.
- `stock.html` : recherche et catalogue public.
- `vehicule.html?id=...` : fiche d'un véhicule et galerie photos.
- `export.html` : export vers **l'Algérie, le Maroc et la Tunisie**.
- `a-propos.html` : présentation, histoire (2019) et partenaires internationaux.
- `contact.html` : coordonnées, liens réseaux sociaux et formulaire WhatsApp.
- `admin.html` : administration privée (connexion par e-mail et mot de passe).

Le formulaire Contact prépare un message WhatsApp, puis **le visiteur confirme l'envoi dans WhatsApp**. Il utilise par défaut `+33 6 15 10 06 28`, distinct du numéro direct appels/WhatsApp `+33 6 18 17 59 11`.

## Mise en place de Supabase — NOUVELLE BASE

1. Créez un projet sur https://supabase.com ; choisissez un mot de passe sécurisé pour la base.
2. Ouvrez **SQL Editor** et exécutez **`supabase/schema.sql`** dans son intégralité.
3. Créez votre compte avec email + mot de passe depuis **Authentication > Users**.
4. Ouvrez **`supabase/add-admin.sql`**, remplacez `VOTRE-EMAIL@EXEMPLE.FR` et exécutez le SQL dans l'éditeur. La création d'un utilisateur Auth seule ne donne **pas** les droits administrateur ; cette étape est nécessaire.
5. Si vous souhaitez afficher des exemples, vous pouvez exécuter **`supabase/seed.sql`**. **Ce sont des données de démonstration : à remplacer par votre vrai stock, vos vrais prix et vos vraies photos avant diffusion commerciale.**

Le SQL crée `vehicles`, `admins`, `contact_requests`, **`site_settings`**, ainsi que les buckets publics `vehicle-photos` et **`site-media`**, avec des politiques RLS limitant les modifications aux administrateurs.

## Mise à jour — BASE SUPABASE DÉJÀ CRÉÉE

Ne recréez pas les tables ni les comptes. Dans Supabase > SQL Editor, exécutez **uniquement** :

**`supabase/migration-site-settings.sql`**

Cette migration crée la table de paramètres (`site_settings`), insère les réglages par défaut, crée le bucket `site-media` et protège l'édition par des règles RLS. Le texte « Sur devis » reste supporté depuis la version V2. Si votre base est plus ancienne que V2, exécutez aussi **`supabase/migration-prix-sur-devis.sql`**.

### Valeurs par défaut de la migration

- Adresse : `54 Rue de la Joliette, Marseille`
- Appels / WhatsApp direct : `06 18 17 59 11` (international : `33618175911`)
- WhatsApp du formulaire Contact : `+33 6 15 10 06 28` (international : `33615100628`)
- E-mail et liens de réseaux sociaux vides — à renseigner dans l'admin.
- Image d'accueil par défaut : `assets/hero-showroom.webp`.

## Relier GitHub Pages à Supabase

1. Depuis Supabase **Project Settings > API Keys** (l'emplacement peut varier), récupérez le **Project URL** et la clé **publishable** (préfixe `sb_publishable_`).
2. Dans `config.js`, remplacez les deux valeurs d'exemple :

```js
window.BY_CARS_CONFIG = {
  supabaseUrl: 'https://VOTRE_PROJET.supabase.co',
  supabasePublishableKey: 'sb_publishable_VOTRE_CLE_PUBLIQUE',
  phoneDisplay: '06 18 17 59 11',
  phoneIntl: '33618175911',
  formWhatsappIntl: '33615100628',
  city: 'Marseille, France'
}
```

**N'utilisez jamais** la clé `service_role` ou `sb_secret_...` dans ce fichier ! La clé publishable est conçue pour être publique. Les permissions sont protégées par **RLS** et Supabase Auth.

3. Dans **Authentication > URL Configuration**, indiquez l'URL finale GitHub Pages comme Site URL : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/` (et ajoutez-la aux Redirect URLs pour les authentifications par lien).
4. Décompressez le ZIP et envoyez **le contenu** (pas le ZIP) à la racine du dépôt GitHub, en conservant les dossiers `assets`, `supabase` et `.github`.
5. Dans **Settings > Pages > Build and deployment > Source**, choisissez **GitHub Actions**.
6. Faites un commit/push sur `main`, puis contrôlez dans l'onglet **Actions** que `Deploy BY CARS to GitHub Pages` est terminé.
7. Site public : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/`. Admin : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/admin.html`.

Le projet **n'exige aucun build, npm, Node.js ou serveur backend** sur GitHub Pages. L'URL admin n'est pas affichée publiquement, mais sa sécurité est assurée surtout par Auth + RLS.

## Utilisation de l'espace admin

1. Connectez-vous via `admin.html` avec l'adresse e-mail du compte Supabase et son mot de passe.
2. **Véhicules** : créez, modifiez et supprimez le stock, gérez les images (prévisualisées avant envoi), le prix HT (ou « Sur devis »), l'état, les caractéristiques, la publication et la mise en avant.
3. **Coordonnées & personnalisation** : modifiez le téléphone affiché, le numéro international direct, le WhatsApp du formulaire, l'e-mail, l'adresse et les liens Instagram/Facebook/TikTok/YouTube/LinkedIn.
4. Choisissez une nouvelle photo d'accueil (JPG/PNG/WEBP, 8 Mo maximum), visualisez l'aperçu, puis enregistrez ; ou cochez « Revenir à l'image d'origine ».
5. Actualisez le site public pour constater les changements, **sans nouveau commit**. Les images d'accueil sont stockées dans le bucket public `site-media`.

Les réseaux sociaux non renseignés et l'e-mail absent ne seront pas affichés publiquement.

## À savoir

- Les modifications du contenu fixe (textes de l'accueil, page À propos, page Export) nécessitent un commit GitHub ; les coordonnées et la bannière sont enregistrées dans Supabase et modifiables depuis l'admin.
- Si la base n'est pas connectée, le site reste consultable mais le stock n'est pas chargé et l'admin n'est pas utilisable.
- Si vous rencontrez une erreur « relation site_settings does not exist », exécutez la migration SQL indiquée plus haut.
- Le site n'envoie pas automatiquement de messages WhatsApp : le visiteur doit confirmer dans l'application WhatsApp.
- Les visuels de véhicules et les informations fournies par `seed.sql` ne garantissent pas la disponibilité réelle d'un véhicule.
