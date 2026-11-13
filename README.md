# BY CARS — Site officiel (GitHub Pages + Supabase)

Site vitrine automobile multipage pour **SARL BY Cars, Marseille**. La navigation, les coordonnées et la bannière principale fonctionnent sur mobile et ordinateur. Le stock, les comptes administrateurs, les paramètres du site et les photos sont gérés dans Supabase.

## Pages et contenu

- `index.html` : accueil, texte de présentation, bannière personnalisable et stock à la une.
- `stock.html` : recherche et catalogue public.
- `vehicule.html?id=...` : fiche d'un véhicule et galerie photos.
- `export.html` : export vers **l'Algérie, le Maroc et la Tunisie**.
- `a-propos.html` : présentation, histoire (2019) et partenaires internationaux.
- `contact.html` : coordonnées, réseaux sociaux et formulaire e-mail vers `info@by-cars.fr`.
- `admin.html` : administration privée (connexion par e-mail et mot de passe).

Le formulaire Contact est destiné à **`info@by-cars.fr`**. Sans service d'envoi installé, il ouvre le logiciel e-mail du visiteur : l'envoi doit être confirmé dans ce logiciel. Avec la fonction Supabase/Resend activée (voir `GUIDE-EMAIL-ET-ADMIN.md`), l'envoi est effectué directement depuis le formulaire. Le contact WhatsApp direct et les appels restent sur `+33 6 18 17 59 11`.

## Nouveau dans la V5

- Les mentions « société automobile » sont remplacées par « vendeur automobile » avec les accords grammaticaux adaptés.
- Le formulaire Contact est adressé à **info@by-cars.fr**, plus au numéro WhatsApp du formulaire.
- L'admin inclut **Mon compte administrateur** : changement de mot de passe et demande de changement de l'e-mail de connexion vers `contact@by-cars.fr`.
- La sécurisation de l'envoi e-mail direct est expliquée dans **`GUIDE-EMAIL-ET-ADMIN.md`** ; une fonction Supabase Edge et la migration anti-spam sont fournies.

## Nouveau dans cette version

- Catalogue et fiches améliorés pour mobiles (320 à 1440 px), y compris si les modèles, finitions ou statuts sont longs.
- Un statut d'annonce supplémentaire **« Disponible prochainement »**, distinct des options **Disponible** et **Indisponible**. Ce statut est affiché sur les cartes, les fiches, et dans la liste admin. Il est **indépendant de Publié** : une annonce marquée « Disponible prochainement » peut être visible ou non selon l'interrupteur « Publié ».
- Textes publics harmonisés autour de « vendeur automobile » plutôt que l’ancienne terminologie.

## Mise en place de Supabase — NOUVELLE BASE

1. Créez un projet sur https://supabase.com ; choisissez un mot de passe sécurisé pour la base.
2. Ouvrez **SQL Editor** et exécutez **`supabase/schema.sql`** dans son intégralité.
3. Créez votre compte avec email + mot de passe depuis **Authentication > Users**.
4. Ouvrez **`supabase/add-admin.sql`**, remplacez `VOTRE-EMAIL@EXEMPLE.FR` et exécutez le SQL dans l'éditeur. La création d'un utilisateur Auth seule ne donne **pas** les droits administrateur ; cette étape est nécessaire.
5. Si vous souhaitez afficher des exemples, vous pouvez exécuter **`supabase/seed.sql`**. **Ce sont des données de démonstration : à remplacer par votre vrai stock, vos vrais prix et vos vraies photos avant diffusion commerciale.**

Le SQL crée `vehicles`, `admins`, `contact_requests`, **`site_settings`**, ainsi que les buckets publics `vehicle-photos` et **`site-media`**, avec des politiques RLS limitant les modifications aux administrateurs.

## Mise à jour — BASE SUPABASE DÉJÀ CRÉÉE

Ne recréez pas les tables ni les comptes. Dans Supabase > SQL Editor, exécutez **uniquement** :

**`supabase/migration-site-settings.sql`** (si votre installation ne dispose pas encore de cette table)

Pour la nouvelle option de disponibilité, exécutez **`supabase/migration-disponibilite-prochainement.sql`**. C’est indispensable **avant de publier la nouvelle version**, afin que l’admin puisse enregistrer le statut. Cette migration conserve vos véhicules existants, ainsi que leur état Disponible/Indisponible.

La migration des paramètres crée la table de paramètres (`site_settings`), insère les réglages par défaut, crée le bucket `site-media` et protège l'édition par des règles RLS. Le texte « Sur devis » reste supporté depuis la version V2. Si votre base est plus ancienne que V2, exécutez aussi **`supabase/migration-prix-sur-devis.sql`**.

### Valeurs par défaut de la migration

- Adresse : `54 Rue de la Joliette, Marseille`
- Appels / WhatsApp direct : `06 18 17 59 11` (international : `33618175911`)
- Le numéro WhatsApp direct reste `+33 6 18 17 59 11`. Le formulaire Contact utilise désormais l’adresse e-mail `info@by-cars.fr`.
- E-mail professionnel par défaut : `info@by-cars.fr` (les réseaux sociaux se renseignent dans l’admin).
- Image d'accueil par défaut : `assets/hero-by-cars.webp`.

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
  contactEmailDelivery: 'mailto', // mettre 'supabase' après installation de la fonction e-mail
  city: 'Marseille, France'
}
```

**N'utilisez jamais** la clé `service_role` ou `sb_secret_...` dans ce fichier ! La clé publishable est conçue pour être publique. Les permissions sont protégées par **RLS** et Supabase Auth.

3. Dans **Authentication > URL Configuration**, indiquez votre domaine actuel comme Site URL : `https://www.by-cars.fr/` et autorisez `https://www.by-cars.fr/admin.html` dans les URL de redirection (et votre ancienne URL GitHub Pages si nécessaire).
4. Décompressez le ZIP et envoyez **le contenu** (pas le ZIP) à la racine du dépôt GitHub, en conservant les dossiers `assets`, `supabase` et `.github`.
5. Dans **Settings > Pages > Build and deployment > Source**, choisissez **GitHub Actions**.
6. Faites un commit/push sur `main`, puis contrôlez dans l'onglet **Actions** que `Deploy BY CARS to GitHub Pages` est terminé.
7. Site public : `https://www.by-cars.fr/`. Admin : `https://www.by-cars.fr/admin.html`.

Le site sur GitHub Pages **n'exige aucun build, npm ni Node.js**. Pour un envoi e-mail automatique, déployez séparément la fonction Supabase Edge (elle ne tourne pas sur GitHub). L'URL admin n'est pas affichée publiquement, mais sa sécurité est assurée surtout par Auth + RLS.

## Utilisation de l'espace admin

1. Connectez-vous via `admin.html` avec l'adresse e-mail du compte Supabase et son mot de passe.
2. **Véhicules** : créez, modifiez et supprimez le stock, gérez les images (prévisualisées avant envoi), le prix HT (ou « Sur devis »), l'état, les caractéristiques, la publication et la mise en avant.
3. **Coordonnées & personnalisation** : modifiez le téléphone affiché, le numéro international direct, l'e-mail professionnel, l'adresse et les liens Instagram/Facebook/TikTok/YouTube/LinkedIn.
4. Sous « Mon compte administrateur », demandez un changement d’e-mail ou modifiez votre mot de passe après vérification du mot de passe actuel.
5. Choisissez une nouvelle photo d'accueil (JPG/PNG/WEBP, 8 Mo maximum), visualisez l'aperçu, puis enregistrez ; ou cochez « Revenir à l'image d'origine ».
6. Actualisez le site public pour constater les changements, **sans nouveau commit**. Les images d'accueil sont stockées dans le bucket public `site-media`.

Les réseaux sociaux non renseignés ne sont pas affichés publiquement. L’adresse e-mail de contact par défaut est `info@by-cars.fr`.

## À savoir

- Les modifications du contenu fixe (textes de l'accueil, page À propos, page Export) nécessitent un commit GitHub ; les coordonnées et la bannière sont enregistrées dans Supabase et modifiables depuis l'admin.
- Si la base n'est pas connectée, le site reste consultable mais le stock n'est pas chargé et l'admin n'est pas utilisable.
- Si vous rencontrez une erreur « relation site_settings does not exist », exécutez la migration SQL indiquée plus haut.
- En mode `mailto`, le visiteur valide l’envoi dans son application e-mail ; en mode `supabase`, le formulaire transmet directement la demande grâce à la fonction Edge configurée.
- Les visuels de véhicules et les informations fournies par `seed.sql` ne garantissent pas la disponibilité réelle d'un véhicule.


## Version V3 — affichage ordinateur et mobile

- **Contact** : formulaire « Votre demande » placé à côté des coordonnées sur les écrans d'ordinateur (à partir de 850 px), et sous les coordonnées sur tablette étroite et téléphone. Le formulaire est désormais prévu pour l’envoi e-mail.
- **Administration mobile** : barre supérieure compacte, navigation tactile « Stock / Ajouter / Paramètres », tableau du stock lisible avec prix et statut, boutons plus grands, champs sur une colonne, aperçus photo responsives.
- **Supabase V3** : les mises en page V3 ne nécessitaient pas de migration. Pour la V5, voir `GUIDE-EMAIL-ET-ADMIN.md` (migrations facultative de synchronisation de l’e-mail et nécessaire pour l’envoi direct via Edge Function).

### Mettre à jour une base existante (étapes rapides)

1. Supabase → **SQL Editor** → nouveau script.
2. Copiez-collez `supabase/migration-disponibilite-prochainement.sql`, puis cliquez **Run**.
3. Sur GitHub, remplacez les fichiers du site avec ceux de cette archive (conservez votre `config.js` personnalisé).
4. Dans `admin.html`, ouvrez un véhicule → **Publication → Disponibilité du véhicule** → choisissez **Disponible prochainement** → **Enregistrer**.
5. Le badge orange « Disponible prochainement » apparaît sur la fiche et sur le catalogue si le véhicule est **Publié**.

**Ne réexécutez pas `seed.sql` sur votre vrai stock**, car les données d'exemple pourraient écraser des annonces portant les mêmes identifiants. Les annonces existantes restent intactes lors de la migration.
