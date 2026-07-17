# Sujet — Mini plateforme d'enchères

## Contexte

Une collectivité souhaite revendre du matériel dont elle n'a plus l'usage (véhicules, mobilier, matériel informatique...) via un petit site d'enchères en ligne. On te demande de développer un premier prototype.

Les annonces de départ sont fournies dans [`data/annonces.json`](./data/annonces.json).

## Fonctionnalités demandées

### Partie 1 — API (backend)

Développe une API REST qui permet de :

1. **Lister les annonces** : `GET /api/annonces`
   - Chaque annonce expose au minimum : id, titre, description, prix de départ, **meilleure enchère actuelle** (ou prix de départ s'il n'y en a aucune), date de fin, statut (`en_cours` / `terminee`).
2. **Consulter le détail d'une annonce** : `GET /api/annonces/{id}`
   - Inclut l'historique des enchères (montant, pseudo, date), de la plus récente à la plus ancienne.
3. **Placer une enchère** : `POST /api/annonces/{id}/encheres`
   - Corps : `{ "pseudo": "...", "montant": 1250 }`

#### Règles métier (le cœur du test 👀)

Une enchère est **refusée** (avec un code HTTP et un message d'erreur appropriés) si :

- l'annonce n'existe pas ;
- l'annonce est terminée (date de fin dépassée) ;
- le montant est inférieur ou égal à la meilleure enchère actuelle (ou au prix de départ s'il n'y a pas d'enchère) ;
- le montant n'augmente pas d'au moins le **pas d'enchère** de l'annonce (champ `pasEnchere` dans les données) ;
- le pseudo est vide ou le montant invalide (négatif, non numérique...).

À toi de choisir les codes HTTP et le format des erreurs — on en discutera au débrief.

### Partie 2 — Interface (frontend)

Développe une petite interface qui permet de :

1. **Voir la liste des annonces** avec leur meilleure enchère et leur statut.
2. **Consulter le détail d'une annonce** et son historique d'enchères.
3. **Placer une enchère** via un formulaire, avec :
   - affichage clair des erreurs renvoyées par l'API ;
   - mise à jour de l'affichage après une enchère réussie.

### Partie 3 — Bonus (optionnel, dans l'ordre de ton choix)

Uniquement si tu as le temps — ce sont des pistes, pas des obligations :

- 🔍 Filtre ou tri des annonces (par prix, date de fin, statut...) ;
- ⏳ Affichage du temps restant avant la fin de l'enchère ;
- 🧪 Tests supplémentaires (API ou frontend) ;
- 🔄 Rafraîchissement automatique de la meilleure enchère (polling ou autre) ;
- 💡 Toute amélioration que tu juges pertinente (explique-la dans `NOTES.md`).

## Questions ouvertes (à traiter dans `NOTES.md`, pas en code)

Réponds en quelques lignes chacune :

1. Que se passerait-il si **deux utilisateurs enchérissent exactement en même temps** sur la même annonce ? Ton implémentation gère-t-elle ce cas ? Comment le gérerais-tu en production avec une vraie base de données ?
2. Si la plateforme devait gérer **des milliers d'annonces et d'utilisateurs**, quelles seraient selon toi les premières choses à faire évoluer dans ton architecture ?
