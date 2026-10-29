# App RPG d'habitudes

Webapp perso (mobile + PC) de suivi d'habitudes, de planification hebdo/mensuelle et de projets au long cours, avec des mécaniques de RPG et de gamification.

Statut : **V0 prototype**. Les données sont stockées dans le navigateur (localStorage), avec export/import JSON depuis l'écran Personnage.

- [Cahier des charges](docs/cahier-des-charges.md)
- [Journal des sessions](docs/journal-sessions.md)

## Lien de test

Version en ligne (privée, à partager depuis le menu Partager de la page) : https://claude.ai/artifact/DQ5iFZruSWtsrguVE7pd4x

Pour la mettre à jour : `npm run build:artifact`, puis republier `build/artifact.html` et le dossier `build/app/` sur ce même lien (Claude le fait en fin de session).

## Lancer en local

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm test` | Tests du moteur (XP, niveaux, jauges, planning) |
| `npm run check` | Vérification TypeScript / Svelte |
| `npm run build` | Build statique dans `build/` (SPA) |

## Écrans de la V0

- **Aujourd'hui** : habitudes par moment de la journée, paliers min / normal / excellent, routines avec exercices, séances de salle, cours et soirées de danse, tâches du jour, mode minimum, jour de repos.
- **Planning** : listes (aujourd'hui, semaine, mois, un jour) et agenda de la semaine avec glisser-déposer.
- **Campagnes** : chapitres, quêtes (dont boss), tâches liées, pause, clôture.
- **Personnage** : niveau, stats et sous-compétences, jauges, journal de progression, export/import.
- **Habitudes** : création et édition, fréquences, stats alimentées, routines versionnées.
- **Danse** : cours fixes hebdomadaires, vacances, annulation d'une séance, soirées à l'avance.
- **Revue** : bilan de la semaine, trois questions, trois priorités, archive.

## Structure

```
src/lib/config.ts        constantes de jeu (XP, jauges) à calibrer
src/lib/engine/          moteur pur et testé : xp.ts, progress.ts, schedule.ts
src/lib/store.svelte.ts  état de l'app + persistance (à remplacer par Supabase)
src/lib/seed.ts          configuration de départ
src/routes/              un dossier par écran
```

Stack : SvelteKit 3 (Svelte 5), Tailwind 4, Vitest. La config SvelteKit est dans `vite.config.ts` et les imports internes passent par `#lib/...` (subpath imports de `package.json`). Le routage se fait par hash (`#/planning`) pour fonctionner sur n'importe quel hébergement statique.
