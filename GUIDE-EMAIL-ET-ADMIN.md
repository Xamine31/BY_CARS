# BY CARS — Formulaire e-mail et changement de compte administrateur

Le site public est hébergé sur **GitHub Pages**, le stock et l'administration sur **Supabase**. Toutes les modifications de véhicules et de coordonnées restent conservées. **Ne relancez pas `seed.sql`** sur un vrai stock.

## A. Modifier l'adresse e-mail de connexion à l'administration

**Adresse visée : `contact@by-cars.fr`**. Changer le code du site ne change **pas** l'e-mail enregistré dans Supabase Authentication.

1. Vérifiez d'abord que **`contact@by-cars.fr` reçoit bien les e-mails**.
2. Exécutez une fois dans **Supabase → SQL Editor** : `supabase/migration-synchronisation-email-admin.sql` (optionnel mais recommandé, pour aligner automatiquement le champ de suivi `public.admins.email`).
3. Dans **Supabase → Authentication → URL Configuration**, assurez-vous d'autoriser `https://www.by-cars.fr/admin.html` parmi les URL de redirection et d'avoir `https://www.by-cars.fr/` comme Site URL si vous utilisez votre domaine OVH.
4. Connectez-vous avec votre **adresse actuelle** sur **https://www.by-cars.fr/admin.html**.
5. Ouvrez **Paramètres → Mon compte administrateur → Modifier l'e-mail de connexion** ; saisissez `contact@by-cars.fr` puis validez.
6. Confirmez les liens reçus sur la nouvelle adresse **et éventuellement l'ancienne** (Supabase Secure Email Change est généralement activé). Une fois le changement confirmé, connectez-vous avec **`contact@by-cars.fr`** et le mot de passe existant.

**Alternative** : si vous n'avez pas accès à l'ancienne boîte, utilisez les contrôles d'administration des utilisateurs depuis **Supabase → Authentication → Users**, plutôt que de supprimer le compte (ce qui pourrait supprimer ses droits). Gardez **le même identifiant utilisateur (UUID)**. Ne tentez pas de modifier `auth.users` en SQL directement pour forcer la confirmation.

## B. Modifier le mot de passe depuis le site

1. Connectez-vous à `admin.html`.
2. Ouvrez **Paramètres → Mon compte administrateur → Modifier le mot de passe**.
3. Renseignez l'ancien mot de passe et deux fois le nouveau (au moins 12 caractères), puis cliquez sur **Enregistrer**.
4. La modification passe par `supabase.auth.updateUser`. Si votre projet exige une réauthentification supplémentaire, Supabase peut demander une confirmation ; suivez alors sa procédure de récupération / réauthentification dans Authentication.

## C. Formulaire de contact vers info@by-cars.fr

Le formulaire n'envoie **plus vers WhatsApp** ; le lien WhatsApp direct reste sur le numéro enregistré dans vos paramètres.

**Mode immédiat, sans service e-mail supplémentaire** : dans `config.js`, gardez `contactEmailDelivery: 'mailto'`. Le formulaire prépare le message adressé à **info@by-cars.fr** et ouvre l'application e-mail du client, qui doit cliquer sur **Envoyer**. Ce mode **ne garantit pas** qu'un message sera envoyé si le client n'a pas d'application de messagerie configurée.

**Mode automatique, recommandé pour un site commercial** : le ZIP comprend une fonction Supabase Edge `send-contact-email` qui transmet les demandes par le service Resend. Ce service nécessite un compte Resend et la vérification de votre domaine `by-cars.fr`.

### Installation du mode automatique (Supabase + Resend)

1. Créez un compte **Resend** sur https://resend.com/ et **vérifiez le domaine `by-cars.fr`**. Resend vous communiquera les enregistrements DNS nécessaires à ajouter chez OVH (ne supprimez pas les enregistrements `MX` et SPF/DKIM existants sans vérifier leur usage ; adaptez SPF selon la configuration existante).
2. Obtenez la clé API **Resend** (elle doit rester secrète).
3. Exécutez `supabase/migration-contact-email.sql` dans **Supabase → SQL Editor** pour créer le quota anti-spam côté serveur.
4. Dans **Supabase → Edge Functions**, créez/déployez une fonction nommée **`send-contact-email`**, avec le contenu de `supabase/functions/send-contact-email/index.ts`. Si vous utilisez la CLI, le dossier `supabase/config.toml` est déjà fourni et vous pouvez utiliser `supabase functions deploy send-contact-email --no-verify-jwt`. La vérification JWT doit être **désactivée pour cette fonction publique** (les utilisateurs du formulaire ne sont pas connectés).
5. Dans **Supabase → Edge Functions → Secrets**, ajoutez :
   - `RESEND_API_KEY` = votre clé Resend (secret, **jamais dans GitHub**).
   - `MAIL_FROM` = `BY CARS <contact@by-cars.fr>` (adresse de départ autorisée pour votre domaine vérifié ; vous pouvez employer `noreply@by-cars.fr` si c'est la bonne adresse chez Resend).
   - `CONTACT_RATE_SALT` = une longue valeur aléatoire (facultative, recommandée pour le hachage anti-spam).
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont habituellement injectées automatiquement dans les fonctions Supabase hébergées. Si elles ne sont pas disponibles, ajoutez-les dans l'environnement **Edge Functions**, **jamais dans `config.js` ni dans un dépôt public**.
6. Dans le `config.js` **du site GitHub**, conservez votre URL Supabase et votre clé publique, puis remplacez uniquement :

   ```js
   contactEmailDelivery: 'mailto',
   ```
   par :
   ```js
   contactEmailDelivery: 'supabase',
   ```
7. Publiez le site sur GitHub et envoyez une demande de test depuis https://www.by-cars.fr/contact.html. Vérifiez la réception à **info@by-cars.fr** et les logs dans **Supabase → Edge Functions** si besoin.

**Le destinataire du formulaire est fixé côté serveur à `info@by-cars.fr`**, pour empêcher un visiteur de détourner les messages. La fonction vérifie les champs, bloque les origines web non autorisées, ajoute un champ anti-spam et impose une limite de 5 tentatives par 15 minutes et par empreinte réseau. Comme tout formulaire public, il peut nécessiter des protections anti-spam complémentaires selon le trafic.

**Important** : sans fonction déployée, laisser `contactEmailDelivery: 'supabase'` provoquera un échec d'envoi automatique (le visiteur aura alors un lien d'envoi de secours via son application e-mail). Garder `mailto` jusqu'à la validation de l'envoi réel.

## D. Publication GitHub

Décompressez le ZIP à la racine du dépôt GitHub puis faites un commit. **Ne remplacez pas votre `config.js` personnalisé par un fichier de démonstration : conservez ses deux valeurs publiques Supabase** (`supabaseUrl`, `supabasePublishableKey`) et ajoutez le réglage `contactEmailDelivery` comme ci-dessus. Ce n'est pas la même chose que les clés Resend et `service_role`, qui restent uniquement dans Supabase.

Cette version n'exige pas npm/Vite sur GitHub Pages. Les migrations SQL peuvent être exécutées sans toucher aux véhicules existants.
