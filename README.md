# BY CARS — GitHub Pages + Supabase

Version statique et mobile-first du showroom BY CARS. Elle est conçue pour fonctionner directement sur GitHub Pages **sans npm, sans Node, sans Vite et sans étape de build**.

## Mise en ligne

1. Décompresse le ZIP.
2. Envoie **tout le contenu** à la racine de ton dépôt GitHub.
3. Dans `Settings > Pages`, choisis **GitHub Actions** comme source.
4. Fais un commit sur `main`.

Le workflow `.github/workflows/deploy.yml` publie directement les fichiers statiques. Il n'exécute aucune commande `npm`.

## Adresse admin

Il n'y a aucun bouton Administration sur le site public. L'accès direct est :

`https://TON-COMPTE.github.io/TON-DEPOT/admin.html`

L'adresse n'est pas une sécurité à elle seule : l'accès réel est protégé par Supabase Auth + RLS.

## Connexion Supabase

Exécute `supabase/schema.sql` dans le SQL Editor de Supabase. Ensuite crée ton utilisateur dans `Authentication > Users`, copie son UUID et ajoute-le dans la table `public.admins` avec l'exemple fourni à la fin du script SQL.

Dans `config.js`, renseigne :

```js
window.BY_CARS_CONFIG = {
  supabaseUrl: 'https://TON-PROJET.supabase.co',
  supabaseAnonKey: 'TA_CLE_PUBLIQUE',
  phoneDisplay: '06 18 17 59 11',
  phoneIntl: '33618175911',
  city: 'Marseille, France'
}
```

Utilise uniquement la clé **anon / publishable**. Ne mets jamais une clé `service_role` dans le site.

## Fonctions admin

L'espace privé permet d'ajouter, modifier et supprimer des véhicules, de saisir marque, modèle, finition, prix HT, neuf/occasion, année, kilométrage, carburant/motorisation, boîte, moteur, puissance, couleur, portes, places, description, disponibilité, publication et mise à la une. Plusieurs photos peuvent être envoyées en une fois dans Supabase Storage.

## Mobile

Le site est responsive, avec menu mobile, cartes une colonne, filtres adaptés, barre Appeler/WhatsApp fixe et galerie photo balayable au doigt.
