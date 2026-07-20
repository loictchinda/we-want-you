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

*(à compléter au fil du développement)*

## Ce que je n'ai pas eu le temps de faire (et comment je l'aurais fait)

*(à compléter)*

## Difficultés rencontrées

*(à compléter)*

## Réponses aux questions ouvertes

### 1. Enchères simultanées

*(à compléter)*

### 2. Passage à l'échelle

*(à compléter)*