# Mini plateforme d'enchères — rendu de Loïc Tchinda

Prototype réalisé pour le test technique. Stack **Node.js + Express + TypeScript** (API) et **Vue 3 + TypeScript** (interface). Données en mémoire, chargées depuis `data/annonces.json`.

> Les choix techniques, les réponses aux questions ouvertes et les limites sont détaillés dans **[NOTES.md](./NOTES.md)**.

## Lancer le projet

Deux terminaux, l'API et l'interface tournent en parallèle.

```bash
# 1. API — http://localhost:3000
cd backend
npm install
npm run dev

# 2. Interface — http://localhost:5173
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
npm test
```

17 tests sur la logique métier de validation d'enchère (runner natif `node:test`).

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/annonces` | Liste : meilleure enchère et statut calculés |
| GET | `/api/annonces/:id` | Détail + historique (plus récent en premier) |
| POST | `/api/annonces/:id/encheres` | Placer une enchère — corps `{ pseudo, montant }` |

**Codes d'erreur :** 400 (requête malformée) · 404 (annonce inexistante) · 409 (annonce terminée) · 422 (règle métier non satisfaite). Chaque erreur renvoie `{ code, message, details? }`.

---

<details>
<summary>Énoncé original du test</summary>

Voir [SUJET.md](./SUJET.md).

</details>