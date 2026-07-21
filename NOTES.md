# Notes du candidat

## Stack choisie

- [ ] Option A : C# / .NET + React
- [x] **Option B : Node.js + Vue 3 (TypeScript)**

| Couche | Choix | Pourquoi |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Framework minimaliste, adapté à une API REST de 3 endpoints. TypeScript pour typer les règles métier, qui sont le cœur du test. |
| Frontend | Vue 3 (Composition API) + TypeScript + Vite | Réactivité simple, peu de code pour 2 écrans. Vite pour le démarrage instantané. |
| Stockage | JSON chargé en mémoire au démarrage | Le sujet ne demande pas de base de données. Un dépôt en mémoire garde le projet lançable en deux commandes, sans installation côté évaluateur. |
| Tests | Runner natif `node:test` | Aucune dépendance supplémentaire. Suffisant pour couvrir la logique métier. |

## Lancer le projet

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173

# Tests
cd backend
npm test
```

## Choix techniques et hypothèses

### Tests

17 tests sur `validerEnchere`, exécutables via `npm test` (runner natif `node:test`, aucune dépendance ajoutée). Ils couvrent les cinq règles de refus, les cas limites (montant exactement au minimum, instant exact de la date de fin) et l'ordre de priorité des vérifications.

Ces tests ne démarrent ni serveur ni base : la validation étant une fonction pure recevant l'instant en paramètre, elle se teste directement. C'est la raison principale de l'avoir extraite des routes.

### Approche générale

Je traite les **règles métier comme le cœur du test** (le sujet le souligne lui-même). Elles sont isolées dans une fonction pure, testable sans serveur ni HTTP, et réutilisée par le contrôleur. Cette séparation permet de tester la logique d'enchère indépendamment du transport.

### Hypothèses posées

- **Format d'erreur unique** : toutes les erreurs renvoient `{ code, message, details? }`. Le `code` est un identifiant stable destiné au client (ex. `MONTANT_TROP_BAS`), le `message` est destiné à l'affichage. Le frontend ne doit jamais avoir à parser un message pour décider de son comportement.
- **404 pour une annonce introuvable** : la ressource n'existe pas, indépendamment de toute logique métier.
- **Tri de l'historique** : effectué sur une copie du tableau, pour ne pas réordonner les données du dépôt à chaque lecture.

- **Codes HTTP différenciés** : 400 pour une requête malformée (pseudo vide, montant non numérique), 409 pour un conflit d'état (annonce terminée), 422 pour une règle métier non satisfaite sur une requête pourtant bien formée, 404 pour une ressource inexistante. Un 400 uniforme aurait été plus simple mais aurait empêché le client de distinguer « corrige ta saisie » de « trop tard » ou de « propose plus cher ».
- **`MONTANT_TROP_BAS` et `PAS_ENCHERE_NON_RESPECTE` sont distincts** bien que la seconde règle englobe la première, afin de renvoyer un message actionnable. Le champ `details.montantMinimum` permet au frontend de pré-remplir le formulaire.
- **Validation dans une fonction pure** (`domain/enchere.ts`), sans dépendance à Express ni à l'horloge (l'instant est injecté) : la logique métier est testable sans démarrer de serveur.
- **Montant strictement typé `number`** : un montant transmis en chaîne est refusé, pour éviter les coercitions silencieuses.

## Ce que je n'ai pas eu le temps de faire (et comment je l'aurais fait)

- **Persistance des enchères.** Elles sont perdues au redémarrage du serveur. J'aurais écrit le JSON sur disque après chaque enchère, avec une écriture atomique (fichier temporaire puis renommage) pour ne pas corrompre le fichier en cas d'interruption. Je ne l'ai pas fait car cela introduit un `await` dans la section critique et donc le risque de concurrence décrit en question 1 : le faire correctement demandait plus de temps que le bénéfice pour un prototype.
- **Tests du frontend.** J'ai concentré l'effort de test sur les règles métier, qui sont le cœur du sujet. J'aurais ajouté des tests de composant sur `AnnonceDetailView` (affichage d'erreur, pré-remplissage du montant minimum) avec Vitest et Testing Library.
- **Tests d'intégration de l'API.** Les tests actuels portent sur la fonction de validation. J'aurais ajouté quelques tests bout en bout sur les routes Express pour vérifier le mapping vers les codes HTTP, avec un dépôt réinitialisé entre chaque test.
- **Filtre et tri des annonces** (bonus du sujet) : je les aurais implémentés côté serveur dès le départ, pour rester cohérent avec la pagination évoquée en question 2.

## Difficultés rencontrées

- **Choix des codes HTTP.** C'est la décision qui m'a demandé le plus de réflexion. Tout renvoyer en 400 était tentant, mais empêchait le client de distinguer une saisie à corriger d'une enchère arrivée trop tard. J'ai finalement séparé 400 (requête malformée), 409 (conflit d'état) et 422 (règle métier non satisfaite), en documentant le raisonnement plus haut.
- **Deux règles qui se recouvrent.** « Montant inférieur ou égal à la meilleure enchère » est englobée par « progression d'au moins le pas ». J'ai hésité à n'en garder qu'une, puis j'ai conservé les deux avec des codes distincts : le message renvoyé n'est pas le même, et c'est ce qui aide réellement l'utilisateur.
- **Fins de ligne CRLF.** Mes premiers commits faisaient apparaître des fichiers entiers comme modifiés, y compris `SUJET.md` que je n'avais pas touché. Cause : Windows réécrivait les fichiers en CRLF alors que le dépôt les stockait en LF. Résolu par un `.gitattributes` avec `* text=auto eol=lf` et un `git add --renormalize`.

## Réponses aux questions ouvertes

### 1. Enchères simultanées

**Mon implémentation gère-t-elle ce cas ? Oui, mais par une propriété du runtime, pas par une protection explicite.**

Dans `POST /api/annonces/:id/encheres`, la séquence lecture → validation → écriture est **entièrement synchrone** : aucun `await` ne sépare `trouverAnnonce`, `validerEnchere` et `ajouterEnchere`. Node.js étant mono-thread, ce bloc s'exécute d'un seul tenant sur la boucle d'événements : une seconde requête ne peut pas s'y intercaler. Elle sera traitée après, et lira donc la meilleure enchère déjà mise à jour.

Concrètement, si deux utilisateurs envoient 4 000 € au même instant sur une annonce à 3 900 € (pas de 100) : la première requête passe, la seconde est rejetée avec `MONTANT_TROP_BAS`. Aucune enchère n'est perdue silencieusement.

**Cette garantie est fragile et je la considère comme accidentelle.** Elle disparaît dès que :

- j'introduis une persistance asynchrone (`await fs.writeFile`) entre la validation et l'écriture — une autre requête peut alors s'exécuter pendant l'attente ;
- je lance plusieurs instances du serveur (cluster, conteneurs) : chacune a son propre état en mémoire, il n'y a plus de source de vérité unique.

**En production, avec une vraie base de données**, je ne compterais pas sur le runtime. Trois options, par ordre de préférence :

1. **Écriture conditionnelle atomique** — la plus simple et la plus robuste :
```sql
   UPDATE annonces
   SET meilleure_enchere = :montant
   WHERE id = :id
     AND statut = 'en_cours'
     AND date_fin > NOW()
     AND :montant >= meilleure_enchere + pas_enchere;
```
   Si `affectedRows = 0`, une autre enchère est passée entre-temps : on rejette. La condition et l'écriture sont évaluées dans la même instruction, donc indivisibles. Pas de verrou explicite à gérer.

2. **Verrou pessimiste** — `SELECT ... FOR UPDATE` dans une transaction, qui verrouille la ligne le temps de lire, valider et écrire. Plus lisible quand la validation est complexe, mais sérialise les accès à une même annonce et peut créer de la contention sur un lot très disputé.

3. **Verrou optimiste** — colonne `version` incrémentée à chaque écriture, avec `WHERE version = :versionLue`. Utile si la lecture et l'écriture sont séparées par une interaction utilisateur, ce qui n'est pas le cas ici.

Je retiendrais l'option 1 : une seule instruction, aucun état de transaction à maintenir, et elle reste correcte quel que soit le nombre d'instances de l'API.

### 2. Passage à l'échelle

Avec des milliers d'annonces et d'utilisateurs, voici ce que je traiterais en premier, dans cet ordre.

**1. Remplacer le stockage en mémoire par une base de données.** C'est le blocage principal : aujourd'hui l'état vit dans le processus, donc impossible de lancer deux instances, et tout est perdu au redémarrage. Une base relationnelle convient bien ici (données fortement structurées, contraintes d'intégrité entre annonces et enchères, besoin de transactions). Elle rend au passage possible l'écriture conditionnelle atomique décrite en question 1.

**2. Paginer et filtrer `GET /api/annonces`.** L'endpoint renvoie actuellement la totalité du catalogue. À 5 annonces c'est indolore, à 5 000 la réponse devient lourde et le frontend inutilisable. J'ajouterais `?page=&taille=` et des filtres serveur (statut, tri par date de fin ou par prix), plutôt que de filtrer côté client sur un jeu complet.

**3. Supprimer le calcul de la meilleure enchère à la lecture.** `meilleureEnchere()` fait un `Math.max` sur tout l'historique, à chaque annonce et à chaque requête. C'est O(n) par annonce, et ça se dégrade avec le nombre d'enchères. En base, je stockerais la meilleure enchère dans une colonne dénormalisée sur l'annonce, mise à jour par la même instruction atomique qui insère l'enchère. L'historique complet resterait consultable via un index `(annonce_id, montant DESC)`, mais seulement sur la page de détail.

**4. Découpler la lecture de l'écriture.** La liste des annonces est massivement lue et rarement modifiée : elle se prête bien à un cache (Redis, ou simplement des en-têtes HTTP `Cache-Control` avec une courte durée). Les enchères, elles, doivent rester en lecture directe.

**5. Rendre l'API réellement sans état pour scaler horizontalement.** Une fois l'état sorti du processus, plusieurs instances derrière un répartiteur de charge deviennent possibles. Il faudrait alors traiter les tâches planifiées (clôture des annonces expirées) hors de l'API — worker dédié ou tâche planifiée externe — pour éviter que chaque instance ne les exécute en double.

**Ensuite, dans un second temps :** limitation du débit sur le placement d'enchère (une annonce très disputée est une cible évidente de spam), remplacement du rechargement manuel par du temps réel côté client (SSE ou WebSocket plutôt que du polling, qui multiplierait les requêtes par le nombre de visiteurs), et mise en place d'observabilité — journalisation structurée et métriques sur le taux de rejet par code d'erreur, très parlant sur ce domaine métier.