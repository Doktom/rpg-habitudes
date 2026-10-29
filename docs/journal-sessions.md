# Journal des sessions

Entrées les plus récentes en haut.

## 2026-10-29 (suite) — Mise en ligne de test

**Objectif** : avoir un lien pour tester l'app dans le navigateur.

**Décisions**

- GitHub Pages écarté pour l'instant : il rendrait le site public, à décider explicitement plus tard.
- Lien de test privé hébergé sur claude.ai (partageable depuis le menu Partager) : https://claude.ai/artifact/DQ5iFZruSWtsrguVE7pd4x
- Routage par hash et dossier `app/` pour fonctionner sur n'importe quel hébergement statique.

**Réalisé**

- Script `npm run build:artifact` qui prépare la page publiée.
- Remplacement des `confirm()`/`alert()` par une confirmation dans la page ; ajout d'un bouton « Copier le JSON » (le téléchargement de fichier est bloqué sur le lien de test).
- Vérifié en local avec la page publiée telle quelle ; pas pu ouvrir le lien claude.ai depuis le navigateur de Claude (non connecté).

**Prochaine étape** : tester le lien sur téléphone et PC, remonter les retours.

## 2026-10-29 (suite) — V0 prototype

**Objectif** : ajouter le paramétrage danse au cahier des charges et développer une première version utilisable.

**Décisions**

- Danse : cours fixes hebdomadaires (même horaire chaque semaine, suspendus pendant les vacances), annulation d'une séance précise, soirées ponctuelles saisies à l'avance (bonus).
- Le contenu des routines (kiné, réveil musculaire) sera saisi au fil de l'eau dans l'app.
- V0 sans backend : stockage navigateur + export/import JSON ; Supabase viendra ensuite.
- SvelteKit 3 : config dans `vite.config.ts`, imports internes via `#lib/...`.

**Réalisé**

- Cahier des charges : section « Paramétrage danse » et note V0 dans « Périmètre ».
- Moteur testé (10 tests) : XP, niveaux, répartition entre stats, Discipline sur 28 jours, Motivation et Inspiration rejouées depuis un journal d'événements, clôture des journées passées, calendrier danse avec vacances.
- Écrans : Aujourd'hui, Planning (listes + agenda semaine, glisser-déposer), Campagnes, Personnage, Habitudes (routines versionnées), Danse, Revue hebdo.
- Vérifié dans le navigateur (PC et mobile) : validation d'habitudes, cours et soirée de danse, glisser-déposer d'une tâche, quête qui clôture un chapitre.

**Pas encore fait** : comptes et synchro Supabase, PWA et notifications, vue mois, revue mensuelle, Élan, mode guidé des routines.

**Prochaine étape** : utiliser la V0 au quotidien, saisir les vrais cours de danse et les exercices des routines, puis brancher Supabase et la PWA.

## 2026-10-29 — Cadrage du concept et cahier des charges v1

**Objectif** : affiner le concept avant tout développement.

**Décisions**

- Usage perso d'abord, modèle multi-utilisateur dès le départ ; mobile + PC via une PWA.
- Couche RPG : stats par domaine (Danse avec Salsa / Bachata / Kizomba, Sport, Mobilité/kiné, Trading, Projets perso), XP et niveaux, jamais de perte d'acquis.
- Pas de PV ni de mort : trois jauges Discipline (multiplicateur d'XP), Motivation (mode minimum), Inspiration (Élan).
- Pas d'économie de récompenses pour l'instant.
- Habitudes à paliers (minimum / normal / excellent), types obligatoire / bonus, fréquences souples, jours de repos.
- Routines versionnées (réveil musculaire, kiné matin et soir avec renfos), programme salle 3x/semaine.
- Campagnes fil rouge → chapitres → quêtes → tâches ; exemples Trading, Maison (aménagement et déco), Danse.
- Planification : listes souples + agenda horaire avec glisser-déposer ; pas de synchro Google Agenda.
- Rituel de revue hebdo et mensuel ; notifications push.
- Visuel sobre au départ.
- Stack : SvelteKit + Supabase + Tailwind (choix délégué à Claude).
- L'app salle existante sera intégrée plus tard.

**Réalisé**

- Cahier des charges v1 (doc partagé + `docs/cahier-des-charges.md`).
- Création du dépôt GitHub, `CLAUDE.md` et ce journal.

**Questions ouvertes** : voir la section « Questions ouvertes » du cahier des charges.

**Prochaine étape** : répondre aux questions ouvertes, puis initialiser le projet SvelteKit + Supabase et attaquer le MVP.
