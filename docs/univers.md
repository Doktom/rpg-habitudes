# Univers et récompenses

Document de référence du lore et des mécaniques spatiales. Tous les noms sont provisoires. Le visuel viendra plus tard : pour l'instant tout est du texte et des symboles.

## Le lore

Tu t'éveilles à bord du **Sillage**, un vaisseau de classe Épave en orbite basse autour de **Kronos**, la planète-horloge. Ses cartes de navigation sont corrompues et la route est perdue. Une seule chose est fiable : Kronos tourne, et chaque révolution complète dure **sept jours**.

À chaque révolution, le Sillage repasse les mêmes sept secteurs. Boucler une orbite recalibre un fragment de la carte. En récoltant des matériaux et en entraînant le pilote, on remet le vaisseau en état et on finit par tracer sa route vers les systèmes qui attendent.

### Correspondances avec l'app

| Dans l'app | Dans l'univers |
| --- | --- |
| La semaine de 7 jours | Une orbite de Kronos |
| Un jour | Un secteur de l'orbite |
| Habitudes et routines | Routines de bord |
| Revue hebdo | Amarrage au Havre, orbite bouclée |
| Stats | Disciplines du pilote |
| Campagnes | Destinations : des systèmes à rejoindre (Trading : la Ceinture des Marchés ; Maison : la Colonie du Havre) |
| Boss | Monstres de l'espace, ou avaries majeures |
| Jauges | Discipline : cohésion de l'équipage ; Motivation : énergie du réacteur ; Inspiration : portée de l'antenne (à habiller plus tard) |

### Les sept secteurs

| Jour | Secteur | Ambiance |
| --- | --- | --- |
| Lundi | Aube | Premier passage devant l'étoile, on rallume les systèmes |
| Mardi | Forge | Les ateliers tournent à plein régime |
| Mercredi | Zénith | Point le plus proche de Kronos, mi-orbite |
| Jeudi | Jonction | Croisement des routes commerciales |
| Vendredi | Éclat | Dernière ligne droite avant le calme |
| Samedi | Dérive | Zone silencieuse, on laisse flotter |
| Dimanche | Havre | Station d'amarrage : revue de bord |

## Ressources

| Ressource | Rôle | Source principale |
| --- | --- | --- |
| **XP** | Niveau du pilote et des stats | Toute action |
| **Alliage** | Réparations, base de toute amélioration | Toute action |
| **Cellule** | Améliorations intermédiaires | Efforts moyens et difficiles, quêtes, revues |
| **Cristal** | Rare : améliorations avancées | Efforts difficiles, boss, chapitres, campagnes, trophées |
| **Points de compétence** | Compétences du pilote | 1 par niveau du pilote |

### Butin d'une action

Chaque habitude, danse, tâche ou quête rapporte de l'XP **et** du butin. Le butin dépend de la difficulté (l'effort pour une tâche) et du palier, comme l'XP.

| Difficulté | Butin de base |
| --- | --- |
| Facile | 2 Alliage |
| Moyenne | 2 Alliage, 1 Cellule |
| Difficile | 3 Alliage, 2 Cellules, 1 Cristal |

Autres sources : quête 2 Alliage + 2 Cellules ; boss 2 Cellules + 2 Cristaux ; chapitre 3 Cristaux ; campagne 10 Cristaux ; revue hebdo 3 Cellules ; revue mensuelle 5 Cellules + 1 Cristal.

## L'orbite hebdomadaire

La semaine est vue comme sept secteurs. Un secteur est **allumé** quand toutes les obligations du jour sont faites ; un jour de repos compte aussi. Le vaisseau avance d'un secteur par jour.

À l'amarrage (la revue hebdo), l'orbite est bouclée et verse **1 Alliage par secteur allumé**, plus **2 Cristaux** si les sept le sont (orbite parfaite). Les Propulseurs augmentent ce butin.

C'est la boucle de répétition : chaque lundi on repart sur une orbite neuve, quel que soit le résultat de la précédente.

## Le vaisseau

Quatre modules, cinq niveaux chacun. Un niveau coûte `base × niveau` : Alliage 20n, Cellules 8n, et Cristaux 2(n−1) à partir du niveau 2. L'Antenne coûte 20 % de moins.

| Module | Rôle | Effet par niveau |
| --- | --- | --- |
| Réacteur à fusion | XP | +6 % d'XP |
| Coque renforcée | Motivation | −10 % de Motivation perdue par raté |
| Propulseurs ioniques | Orbite | +25 % de butin d'orbite |
| Antenne longue portée | Inspiration | +20 % d'Inspiration gagnée |

**Classe du vaisseau** selon la somme des niveaux : Épave (0), Navette (3), Corvette (7), Frégate (12), Croiseur (17), Vaisseau-amiral (20).

## Les compétences du pilote

1 point par niveau de pilote gagné, trois niveaux par compétence.

| Compétence | Effet par niveau |
| --- | --- |
| Second souffle | Motivation : retour vers 50 plus rapide (+5 points de pourcentage par jour) |
| Logistique | +25 % d'XP et de butin sur les tâches |
| Endurance | Le palier minimum vaut 0,1 de plus (0,5 → 0,8) |
| Ingénierie | −8 % sur le coût des améliorations |

## Les trophées

19 trophées pour la V0, débloqués automatiquement et jamais perdus. Chacun rapporte de l'XP et du butin. Ils suivent : les premières fois (première habitude, première tâche), les volumes (10 et 50 tâches, 100 habitudes, 10 danses), les séries (7 et 30 jours sans faille), les orbites (première, quatre, parfaite), les niveaux (5, 10, stat au niveau 5), les campagnes (boss, chapitre, campagne) et le vaisseau (module niveau 3, 10 niveaux au total).

La liste complète est dans `src/lib/engine/trophies.ts`.

## Principes de calibrage

- On ne perd jamais d'XP, de niveau, de trophée ni de module. Seul le butin se dépense, et uniquement quand on choisit une amélioration.
- Viser environ 3 mois pour finir tout le vaisseau avec une pratique régulière. Les coûts sont dans `engine/ship.ts`, les gains dans `config.ts`.
- À recalibrer après 2 à 3 semaines d'usage réel.

## Pistes à explorer

Équipage (personnages qui donnent des bonus), carte de la galaxie pour les campagnes, événements d'orbite (météorites, éruptions solaires) qui ajoutent un défi de la semaine, missions hebdomadaires, nom définitif du vaisseau et de l'univers, habillage graphique.
