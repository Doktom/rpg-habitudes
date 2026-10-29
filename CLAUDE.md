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

## Stack prévue

SvelteKit + TypeScript, Tailwind, Supabase (Postgres, Auth, RLS, Edge Functions), PWA avec Web Push. Formules d'XP et de jauges dans un module partagé testé, constantes dans un fichier de config.
