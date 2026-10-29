# CLAUDE.md

Webapp perso de suivi d'habitudes, planification hebdo/mensuelle et projets au long cours, avec une couche RPG (stats, XP, jauges Discipline / Motivation / Inspiration, campagnes). Langue du projet : français.

## Documents de référence

- `docs/cahier-des-charges.md` : cahier des charges, source de vérité du produit.
- Doc partagé (Claude Docs) : https://claude.ai/artifact/C8zL86y6JnbN2dSHobDbAi — même contenu, version éditable et commentable.
- `docs/journal-sessions.md` : journal des sessions de travail avec Claude.

## Règles systématiques (à chaque session)

1. **Cahier des charges à jour** : toute décision produit ou technique prise pendant la session est reportée dans le doc partagé ET dans `docs/cahier-des-charges.md` (exporter le doc en markdown pour garder les deux identiques).
2. **Journal de session** : ajouter en haut de `docs/journal-sessions.md` une entrée datée (objectif, décisions, travail réalisé, questions ouvertes, prochaine étape).
3. **Commit + push** sur GitHub en fin de session, avec un message qui résume la session.

## Principes produit à respecter

- On ne perd jamais d'XP ni de niveau ; les conséquences portent sur les jauges.
- Motivation plutôt que punition ; pas d'économie pour l'instant.
- Trading : on récompense le processus, jamais le P&L.
- Visuel sobre d'abord, graphisme ajouté plus tard sans refonte.

## Stack

- En place (V0) : SvelteKit 3 (Svelte 5, runes), TypeScript, Tailwind 4, Vitest, adapter-static en SPA. Données en localStorage via `src/lib/store.svelte.ts`.
- Prévu : Supabase (Postgres, Auth, RLS, Edge Functions), PWA avec Web Push.
- SvelteKit 3 : pas de `svelte.config.js`, la config passe par `sveltekit({...})` dans `vite.config.ts`. Imports internes avec `#lib/...` et l'extension explicite (`#lib/dates.ts`, `#lib/store.svelte.ts`).
- Les règles de jeu vivent dans `src/lib/engine/` (fonctions pures, testées) et les constantes dans `src/lib/config.ts`. XP et jauges sont recalculées depuis le journal `events` : toute action ajoute ou retire des événements, jamais de compteur modifié directement.

- Routage par hash (`router: { type: 'hash' }`) et `appDir: 'app'` : liens internes en `#/...`. Pas de `confirm()`/`alert()` (bloqués dans la page de test), utiliser `ConfirmButton`.

## Commandes

`npm run dev` · `npm test` · `npm run check` · `npm run build` · `npm run build:artifact`

## Lien de test

https://claude.ai/artifact/DQ5iFZruSWtsrguVE7pd4x — à republier en fin de session après `npm run build:artifact` : publier `build/artifact.html` sur cette URL avec tous les fichiers de `build/app/` (chemins publiés `app/...`).
