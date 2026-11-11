# Site de mariage — Camille & Thomas

Site statique (HTML/CSS/JS pur, zéro dépendance, zéro base de données) : rapide, gratuit à héberger, facile à faire évoluer.

## Pages

| Page | Contenu |
|---|---|
| `index.html` | Accueil : photo, mots de bienvenue en calligraphie, compte à rebours |
| `programme.html` | Programme du weekend (mairie, cocktail, animation surprise, dîner, soirée dansante, brunch) |
| `plan.html` | Plan du domaine + carrousel des hôtels (prix, distance, photo) |
| `questionnaire.html` | Formulaire RSVP (nom, accompagnants, enfants/âges, moments, allergies, commentaires) |
| `cagnotte.html` | Cagnotte pour le voyage de noces + mention de l'urne le jour J |

## Avant la mise en ligne — checklist

1. **Noms, dates, textes** : remplacer « Camille & Thomas », les dates, et les textes entre `[crochets]` dans les pages.
2. **Photo d'accueil** : remplacer `assets/photo-couple.svg` par une vraie photo (garder le même nom, ou mettre à jour le `src` dans `index.html`).
3. **Plan du domaine** : remplacer `assets/plan-domaine.svg` par le plan réel, et mettre le bon lien Google Maps dans `plan.html`.
4. **Hôtels** : modifier les 3 cartes dans `plan.html` (nom, prix, distance, photo, lien carte). Pour ajouter un hôtel, dupliquer un bloc `<article class="hotel-carte">…</article>`.
5. **Formulaire** : voir « Activer l'envoi des réponses par email » ci-dessous.
6. **Cagnotte** : dans `js/main.js`, renseigner `CONFIG.lienCagnotte` avec l'URL de votre cagnotte (Leetchi, Lyf, Mariages.net…).
7. **Compte à rebours** : dans `js/main.js`, ajuster `CONFIG.dateMariage` (format `AAAA-MM-JTHH:MM:SS`).

## Activer l'envoi des réponses par email

**Sans aucune configuration technique**, le formulaire fonctionne déjà en mode e-mail : quand un invité clique sur « Envoyer ma réponse », son logiciel email s'ouvre avec toutes ses réponses pré-remplies, adressées à `CONFIG.emailDestinataire` (à modifier dans `js/main.js`).

Pour une expérience plus fluide ( envoi direct depuis le site + confirmation automatique à l'invité ), brancher un service de formulaires gratuit :

- **Formspree** (recommandé, gratuit jusqu'à 50 soumissions/mois) :
  1. Créer un compte sur formspree.io, créer un formulaire, copier l'ID.
  2. Dans `js/main.js`, remplacer `VOTRE_ID_FORMSPREE` dans `CONFIG.endpointFormulaire`.
  3. Dans le tableau de bord Formspree : activer l'email de confirmation à l'invité (autoresponse) — chaque réponse vous est envoyée par email.
- Alternatives gratuites : **Getform**, **Web3Forms** (même principe, remplacer l'endpoint).

Tant que l'endpoint Formspree n'est pas renseigné, le site utilise automatiquement le mode e-mail pré-rempli ; en cas d'échec du service une fois configuré, il retombe aussi sur ce mode.

## Hébergement gratuit (recommandé : GitHub Pages)

1. Créer un dépôt GitHub et y pousser ce dossier.
2. Dans le dépôt : Settings → Pages → Source : branche `main`, dossier racine.
3. **Sous-domaine** : dans Settings → Pages → Custom domain, saisir `mariage.votredomaine.fr`, puis chez votre registrar ajouter un enregistrement DNS :
   - `CNAME` : `mariage` → `votrecompte.github.io`
   - Cocher « Enforce HTTPS » une fois le certificat émis (automatique et gratuit).
4. Le QR code des faire-part pointe vers `https://mariage.votredomaine.fr`.

Alternatives également gratuites : Netlify Drop (glisser-déposer le dossier, sous-domaine personnalisé en 2 minutes) ou Cloudflare Pages.

## Générer le QR code

Une fois le site en ligne, générer un QR code gratuit (par ex. via l'API `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https://mariage.votredomaine.fr`) et l'imprimer sur les faire-part.

## Faire évoluer le site

- Tout est en HTML/CSS/JS standard : modifiable avec n'importe quel éditeur.
- Pour ajouter une page : copier une page existante, changer le contenu et marquer le lien `.actif` dans la navigation.
- Aucun serveur à maintenir, aucun coût tant que le trafic reste raisonnable.
