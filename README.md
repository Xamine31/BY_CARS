# BY CARS — version multipage moderne, sans build

Cette version est conçue pour être déposée directement sur GitHub Pages.

## Pages publiques

- `index.html` — accueil
- `stock.html` — catalogue + recherche + filtres
- `vehicule.html?id=...` — fiche individuelle de chaque véhicule
- `export.html` — page dédiée export France → Algérie
- `contact.html` — formulaire de contact

L'administration est volontairement absente de la navigation publique.
Accès privé : `admin.html`

## Aucun build

Il n'y a pas de Vite, npm, Node ou TypeScript à lancer. GitHub Pages publie directement les fichiers.

Le workflow est déjà inclus : `.github/workflows/deploy.yml`.

## Connexion Supabase

1. Ouvrez `supabase/schema.sql` dans Supabase > SQL Editor et exécutez le script.
2. Créez votre utilisateur dans Authentication > Users.
3. Ajoutez cet utilisateur dans la table `admins` comme indiqué en bas du fichier SQL.
4. Ouvrez `config.js` et renseignez :

```js
window.BY_CARS_CONFIG = {
  supabaseUrl: 'https://VOTRE-PROJET.supabase.co',
  supabaseAnonKey: 'VOTRE_CLE_PUBLIQUE',
  phoneDisplay: '06 18 17 59 11',
  phoneIntl: '33618175911',
  city: 'Marseille, France'
}
```

Utilisez uniquement la clé publique `anon` / `publishable`. Ne mettez jamais une clé `service_role` dans un site public.

## Mise en ligne GitHub

Décompressez le ZIP puis copiez tout son contenu à la racine du dépôt GitHub.
Dans Settings > Pages, sélectionnez GitHub Actions.

Le site fonctionne en mode démonstration tant que Supabase n'est pas configuré.
