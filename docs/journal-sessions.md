# Journal des sessions

Entrées les plus récentes en haut.

## 2026-10-29 (nuit, suite) — Calibrage avec le mode test

**Méthode** : scénario de 12 semaines généré par le mode test (utilisateur simulé à ~75 % de réussite), mesures semaine par semaine (XP, matériaux par source, niveaux, trophées, jauge Motivation), puis rejeu des mêmes journées avec des réglages candidats pour la Motivation.

**Constats**

- XP : ~1 200 par semaine, niveau 10 vers la semaine 6 (en partie grâce aux quêtes du scénario), cohérent avec le cahier ; rien à changer.
- Matériaux : environ 90 Alliages, 31 Cellules, 4 à 6 Cristaux par semaine ; les coûts de départ donnaient un vaisseau complet en ~13 semaines en Alliages, mais 19 en Cristaux.
- Motivation : moyenne 83, saturée (≥ 95) un jour sur quatre, sous 30 seulement 2 jours sur 87 : la jauge ne servait presque à rien.
- Orbite : en moyenne 2 secteurs allumés et 4 à moitié par semaine ; l'amarrage rapportait 1 à 7 Alliages, trop peu pour être la boucle centrale.
- Les compétences (3 niveaux × 4) s'épuisaient au niveau 13 du pilote.

**Réglages**

- Motivation : +3 obligatoire (était +5), +2 bonus (+3), +6 quête (+10), retour vers 50 de 15 % (10 %). Résultat : moyenne 70, aucun jour saturé, 5 % des jours sous 30.
- Orbite : un secteur à moitié fait (≥ 50 % des obligations) compte pour un demi-secteur ; 4 Alliages par secteur (1), 3 Cristaux pour l'orbite parfaite (2). Une semaine rapporte maintenant 8 à 26 Alliages.
- Cristaux : coût ⌈1,5(n−1)⌉ au lieu de 2(n−1), pour que les trois ressources arrivent ensemble.
- Compétences : 5 niveaux au lieu de 3 (20 points, niveau 21 du pilote), effets par niveau réduits en conséquence.

**Tests** : 21 au vert, types au vert.

**À vérifier à l'usage** : le simulateur joue plus de tâches qu'un utilisateur moyen ; la Motivation de départ (50) et la difficulté d'allumer un secteur sont à confirmer en vrai.

## 2026-10-29 (nuit, suite) — Univers spatial, récompenses, mode test

**Demandes** : détailler les tâches ; rendre visibles dans la todo du jour celles de la semaine et du mois ; faire récompenser toutes les tâches ; mécanique de trophées et de récompenses ; mode test avec simulation sur plusieurs semaines ; univers futuriste spatial avec un vaisseau qui orbite en 7 jours, avec XP, matériaux et compétences pour le faire évoluer.

**Décisions**

- Univers : le **Sillage** en orbite autour de **Kronos**. Une orbite = une semaine ; un secteur par jour, allumé quand les obligations sont faites ; l'amarrage au Havre (revue hebdo) boucle l'orbite et verse du butin. Détail dans `docs/univers.md`.
- Trois matériaux (Alliage, Cellule, Cristal). Toute action (habitude, danse, tâche, quête, revue) rapporte de l'XP et du butin selon sa difficulté.
- Quatre modules du vaisseau (Réacteur, Coque, Propulseurs, Antenne) et quatre compétences du pilote (1 point par niveau). 19 trophées.
- Le principe « pas d'économie » du cahier est remplacé : les matériaux ne se perdent jamais, ils se dépensent sur une amélioration choisie.
- Mode test dans un stockage séparé, avec une horloge simulée ; recharge de la page à chaque saut de date.

**Réalisé** : tâches détaillées (note, effort, échéance, sous-tâches), todo du jour enrichie, écran Vaisseau, bandeau et scénario du mode test. Tests passés de 10 à 20, vérification de types au vert, build GitHub Pages au vert ; mode test essayé dans le navigateur (génération, amélioration d'un module, compétence, validation, saut d'une semaine).

**Calibrage** : le scénario de test rapporte ~96 Alliage par semaine, trop pour les coûts de départ (tout le vaisseau en un mois) ; les coûts ont été multipliés par 2,5 pour viser environ 3 mois. À revoir après usage réel.

**Pas fait** : équipage, carte de la galaxie, événements d'orbite, renommer ou archiver une catégorie, habillage graphique.

## 2026-10-29 (suite) — La carte mentale devient l'outil de pilotage

**Décision** : la carte mentale sert d'outil de pilotage et d'interface d'échange, en plus du chat.

**Réalisé** : branche « Échanges » dans la carte, avec « Pour Claude » (demandes de l'utilisateur) et « Réponses de Claude » (comptes rendus). Règles de début et de fin de session ajoutées dans CLAUDE.md.

## 2026-10-29 (suite) — Carte mentale

**Objectif** : un outil visuel pour construire et imaginer les modules et mécaniques.

**Décisions**

- Carte mentale interactive hébergée sur claude.ai (privée), avec base de données partagée : l'utilisateur l'édite, Claude la lit et l'écrit d'une session à l'autre.
- Statuts : en place, prévu, à explorer, abandonné. Types : module, mécanique, idée, question.
- Copie lisible versionnée dans `docs/carte-mentale.md`.

**Réalisé**

- Page `tools/carte-mentale.html` : arbre horizontal, zoom et déplacement, glisser un nœud sur un autre pour le rattacher, replier les branches, filtres par statut, recherche, raccourcis clavier, export Markdown.
- Carte remplie avec l'état du projet (55 nœuds), dont 4 idées de mécaniques suggérées à trier : combos entre habitudes, défi de la semaine, titres de personnage, bonus d'équilibre.
- Script `tools/carte-export.mjs` et règles dans CLAUDE.md.

**Prochaine étape** : l'utilisateur trie les idées et en ajoute ; la session suivante part de la carte pour choisir quoi développer.

## 2026-10-29 (suite) — GitHub Pages

**Décisions** : le dépôt devient public (Pages n'est pas disponible sur un dépôt privé avec le compte gratuit) ; le site est déployé automatiquement à chaque push.

**Réalisé** : workflow GitHub Actions (tests, build avec `BASE_PATH`, déploiement Pages) ; site vérifié en ligne sur https://doktom.github.io/rpg-habitudes/.

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
