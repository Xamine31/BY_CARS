# BY CARS — site multipage moderne, GitHub Pages sans build

Version conçue pour être copiée directement dans un dépôt GitHub Pages : aucun npm, Vite, Node ou TypeScript à lancer.

## Pages

- `index.html` — accueil moderne
- `stock.html` — catalogue, recherche et filtres
- `vehicule.html?id=...` — fiche individuelle de chaque véhicule
- `export.html` — export France → Algérie · Maroc · Tunisie
- `contact.html` — formulaire / WhatsApp
- `admin.html` — gestion des véhicules, volontairement absente de la navigation publique

Le vrai logo BY CARS fourni est intégré dans `assets/logo-bycars-clean.png`.

## Administration avant Supabase

Tant que Supabase n'est pas configuré, `admin.html` s'ouvre automatiquement en **mode démonstration local**.

Vous pouvez :
- ajouter / modifier / supprimer des véhicules ;
- remplir prix HT, marque, modèle, année, motorisation, etc. ;
- ajouter plusieurs photos ;
- voir immédiatement ces véhicules sur le site public dans le même navigateur.

Les données de démonstration sont stockées uniquement dans le navigateur (`localStorage`). Elles ne sont donc pas partagées entre plusieurs téléphones/ordinateurs.

Dès que Supabase est renseigné dans `config.js`, l'administration repasse automatiquement en mode sécurisé avec connexion Supabase Auth et table `admins`.

## Connexion Supabase

1. Exécutez `supabase/schema.sql` dans Supabase > SQL Editor.
2. Créez votre utilisateur dans Authentication > Users.
3. Ajoutez cet utilisateur dans la table `admins` comme indiqué dans le fichier SQL.
4. Ouvrez `config.js` et renseignez l'URL + la clé publique :

```js
window.BY_CARS_CONFIG = {
  supabaseUrl: 'https://VOTRE-PROJET.supabase.co',
  supabaseAnonKey: 'VOTRE_CLE_PUBLIQUE',
  phoneDisplay: '06 18 17 59 11',
  phoneIntl: '33618175911',
  city: 'Marseille, France'
}
```

N'utilisez jamais une clé `service_role` dans le site.

## GitHub Pages

1. Décompressez le ZIP.
2. Copiez **tout le contenu** à la racine du dépôt GitHub.
3. Faites un commit.
4. GitHub > Settings > Pages > Source : **GitHub Actions**.
5. Le workflow `.github/workflows/deploy.yml` publie directement les fichiers statiques.

Accès admin : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/admin.html`


## Photos de démonstration
Les 6 véhicules de démonstration utilisent chacun 2 photos réelles de leur modèle, chargées depuis Wikimedia Commons. Les attributions et licences sont regroupées dans `credits-photos.html`. Les images sont illustratives et non contractuelles.

## Export
Le site présente uniquement les destinations Algérie, Maroc et Tunisie.
