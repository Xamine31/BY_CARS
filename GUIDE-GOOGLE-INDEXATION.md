# BY CARS — Apparaître sur Google

## 1. Publier les fichiers sur GitHub
Décompresser ce ZIP puis envoyer tout son contenu à la racine du dépôt GitHub utilisé pour by-cars.fr. Vérifier dans Actions que le site est déployé. Cette mise à jour n'affecte pas la base Supabase. Avant l'upload, recopier vos paramètres actuels de `config.js` dans le `config.js` fourni si nécessaire.

## 2. Contrôler les pages
Ouvrir :
- https://www.by-cars.fr/
- https://www.by-cars.fr/robots.txt
- https://www.by-cars.fr/sitemap.xml

Si le site n'apparaît pas, vérifier Settings > Pages > Custom domain dans GitHub : www.by-cars.fr.

## 3. Google Search Console (gratuit)
- Aller à https://search.google.com/search-console
- Ajouter une propriété **Domaine**, saisir **by-cars.fr** (sans www)
- Copier le code TXT fourni par Google, sous la forme `google-site-verification=...`
- Dans OVHcloud, ouvrir la zone DNS de by-cars.fr. Ajouter TXT à la racine du domaine (`@` ou champ sous-domaine vide), avec exactement la valeur Google. **Ne pas toucher aux A, CNAME, MX, SPF ou DKIM existants.**
- Patienter si nécessaire puis cliquer sur **Valider** dans Google Search Console.

## 4. Déclarer le sitemap
Dans Google Search Console > Indexation > Sitemaps, fournir :
`sitemap.xml`

## 5. Demander une indexation
Dans Inspection d'URL, tester puis demander l'indexation de :
- https://www.by-cars.fr/
- https://www.by-cars.fr/stock.html
- https://www.by-cars.fr/export.html
- https://www.by-cars.fr/a-propos.html
- https://www.by-cars.fr/contact.html

Google ne garantit ni la date de l'indexation, ni le classement. Vérifier les rapports d'indexation dans les jours/semaines suivants.

## À propos des annonces de véhicules
Le site charge les fiches depuis Supabase via JavaScript. Les URLs des véhicules ne figurent pas dans le sitemap statique car leurs IDs changent selon le stock. Elles peuvent être découvertes via la page Stock et l'exécution JavaScript par Google, mais l'indexation de chaque véhicule n'est pas garantie. Pour une indexation plus fiable de tout le stock, envisager ensuite une génération de sitemap automatisée depuis Supabase.

## Ce qui a été ajouté
- `robots.txt` et `sitemap.xml` à la racine du site
- Balises canonical, Open Graph, description et title améliorées sur les pages publiques
- Données structurées `AutoDealer` sur l'accueil avec l'adresse et le téléphone principal
- `noindex` sur l'administration, la 404 et les crédits photos
- Métadonnées dynamiques uniques pour chaque fiche véhicule
- Aucun changement SQL nécessaire
