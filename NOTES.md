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

### Approche générale

Je traite les **règles métier comme le cœur du test** (le sujet le souligne lui-même). Elles sont isolées dans une fonction pure, testable sans serveur ni HTTP, et réutilisée par le contrôleur. Cette séparation permet de tester la logique d'enchère indépendamment du transport.

### Hypothèses posées

- **Format d'erreur unique** : toutes les erreurs renvoient `{ code, message, details? }`. Le `code` est un identifiant stable destiné au client (ex. `MONTANT_TROP_BAS`), le `message` est destiné à l'affichage. Le frontend ne doit jamais avoir à parser un message pour décider de son comportement.
- **404 pour une annonce introuvable** : la ressource n'existe pas, indépendamment de toute logique métier.
- **Tri de l'historique** : effectué sur une copie du tableau, pour ne pas réordonner les données du dépôt à chaque lecture.

## Ce que je n'ai pas eu le temps de faire (et comment je l'aurais fait)

*(à compléter)*

## Difficultés rencontrées

*(à compléter)*

## Réponses aux questions ouvertes

### 1. Enchères simultanées

*(à compléter)*

### 2. Passage à l'échelle

*(à compléter)*