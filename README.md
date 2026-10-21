# BY CARS — Site production GitHub Pages + Supabase

Site statique multipage prêt à publier sur GitHub Pages, avec Supabase pour le stock, les photos et l'authentification de l'espace administrateur. Le formulaire de contact ouvre directement WhatsApp sur le numéro configuré dans `config.js`.

## Pages

- `index.html` : accueil
- `stock.html` : catalogue et recherche
- `vehicule.html?id=...` : fiche détaillée d'un véhicule
- `export.html` : export vers l'Algérie, le Maroc et la Tunisie
- `contact.html` : formulaire de contact
- `admin.html` : espace privé de gestion (aucun lien admin sur le site public)

## 1. Créer le projet Supabase

1. Créez un nouveau projet Supabase.
2. Ouvrez **SQL Editor**.
3. Exécutez `supabase/schema.sql`.
4. Pour préremplir le stock, exécutez ensuite `supabase/seed.sql`.

Le fichier `schema.sql` crée :

- `vehicles`
- `admins`
- les règles RLS
- le bucket public `vehicle-photos`
- les règles d'upload réservées aux administrateurs

## 2. Créer le compte administrateur

1. Dans Supabase, ouvrez **Authentication > Users**.
2. Créez un utilisateur avec l'adresse e-mail et le mot de passe souhaités.
3. Ouvrez `supabase/add-admin.sql`.
4. Remplacez `VOTRE-EMAIL@EXEMPLE.FR` par l'e-mail du compte.
5. Exécutez cette requête dans **SQL Editor**.

L'utilisateur pourra ensuite se connecter sur :

`https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/admin.html`

## 3. Connecter le site à Supabase

Dans Supabase, récupérez :

- le **Project URL**
- la **Publishable key** (`sb_publishable_...`)

Modifiez `config.js` :

```js
window.BY_CARS_CONFIG = {
  supabaseUrl: 'https://VOTRE-PROJET.supabase.co',
  supabasePublishableKey: 'sb_publishable_VOTRE_CLE',
  phoneDisplay: '06 18 17 59 11',
  phoneIntl: '33618175911',
  city: 'Marseille, France'
}
```

La publishable key est faite pour être utilisée dans le navigateur. Ne mettez jamais de clé `sb_secret_...` ni de clé legacy `service_role` dans GitHub ou dans le site.

## 4. Configuration Auth Supabase

Dans **Authentication > URL Configuration** :

- **Site URL** : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/`
- ajoutez aussi cette URL dans les Redirect URLs si vous activez plus tard la récupération de mot de passe ou des connexions par lien.

L'authentification e-mail/mot de passe est utilisée par `admin.html`.

## 5. Publier sur GitHub Pages

1. Créez un dépôt GitHub.
2. Envoyez **le contenu de ce dossier** à la racine du dépôt.
3. Vérifiez que `.github/workflows/deploy.yml` est présent.
4. Dans GitHub : **Settings > Pages > Source > GitHub Actions**.
5. Faites un commit/push sur `main`.
6. Ouvrez l'onglet **Actions** et attendez que le workflow soit vert.

Le site sera publié à une URL du type :

`https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/`

## 6. Utilisation admin

Depuis `admin.html`, un administrateur peut :

- ajouter/modifier/supprimer un véhicule
- saisir marque, modèle, finition, prix HT, état, année et kilométrage
- renseigner motorisation, boîte, moteur, puissance, couleur, portes et places
- ajouter plusieurs photos avec aperçu avant enregistrement
- laisser le prix vide pour afficher **Sur devis**
- publier/dépublier un véhicule
- marquer un véhicule disponible/indisponible
- choisir les véhicules mis en avant sur l'accueil

Les photos sont prévisualisées dans l'interface avant l'enregistrement, puis envoyées dans Supabase Storage, bucket `vehicle-photos`.

Le formulaire `contact.html` n'enregistre pas la demande en base : il prépare le message et ouvre WhatsApp vers `phoneIntl` défini dans `config.js`.

## Important avant mise en ligne publique

Le fichier `supabase/seed.sql` sert uniquement à préremplir le catalogue. Vérifiez que les véhicules, prix, kilométrages et photos correspondent à votre stock réel avant de communiquer le site à des clients.


## Mise à jour d'une base déjà créée

Si vous aviez déjà exécuté une ancienne version de `schema.sql`, exécutez une fois :

`supabase/migration-prix-sur-devis.sql`

Cette migration rend `price_ht` facultatif. Quand le champ Prix HT est laissé vide dans l'admin, le site affiche **Sur devis**.

## Image d'accueil

Le visuel `assets/hero-showroom.webp` est affiché sans recadrage destructif. Sur mobile, l'image est présentée en format 16:9 complet au-dessus du contenu du hero afin de rester entièrement visible.
