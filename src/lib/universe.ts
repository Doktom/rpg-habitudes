// Univers et lore : tout ce qui est écrit en dur côté « fiction ». Noms provisoires, voir docs/univers.md.
import { EFFECTS, GAUGES, TIER_FACTOR } from './config';
import type { Material, ModuleId, SkillId } from './types';

export const SHIP_NAME = 'Le Sillage';
export const PLANET_NAME = 'Kronos';

export const INTRO =
	"Tu t'éveilles à bord du Sillage, un vaisseau en orbite basse autour de Kronos, la planète-horloge. Ses cartes de navigation sont corrompues. " +
	"Chaque révolution complète, sept jours, te fait repasser sept secteurs et recalibre un fragment de la carte. " +
	"Boucle les orbites, ramasse de quoi réparer le vaisseau, et trace enfin ta route vers les systèmes qui t'attendent.";

export const MATERIALS: Record<Material, { name: string; glyph: string; lore: string }> = {
	metal: { name: 'Alliage', glyph: '▰', lore: 'Débris de coque récupérés partout, le nerf de toute réparation.' },
	energy: { name: 'Cellule', glyph: '⚡', lore: "Cellules d'énergie, issues des efforts soutenus." },
	crystal: { name: 'Cristal', glyph: '◆', lore: 'Cristaux de navigation, rares : boss, chapitres et exploits.' }
};

// Les sept secteurs de l'orbite, du lundi au dimanche.
export const SECTORS = [
	{ name: 'Aube', lore: "Premier passage devant l'étoile : on rallume les systèmes." },
	{ name: 'Forge', lore: 'Les ateliers tournent à plein régime.' },
	{ name: 'Zénith', lore: 'Point le plus proche de Kronos, mi-orbite.' },
	{ name: 'Jonction', lore: 'Croisement des routes commerciales.' },
	{ name: 'Éclat', lore: 'Dernière ligne droite avant le calme.' },
	{ name: 'Dérive', lore: 'Zone silencieuse, on laisse flotter.' },
	{ name: 'Havre', lore: "Station d'amarrage : revue de bord, orbite bouclée." }
] as const;

export interface ModuleDef {
	id: ModuleId;
	name: string;
	role: string;
	lore: string;
	costFactor: number;
	effect: (level: number) => string;
}

const pct = (x: number) => `${Math.round(x * 100)} %`;

export const SHIP_MODULES: ModuleDef[] = [
	{
		id: 'reactor',
		name: 'Réacteur à fusion',
		role: 'XP',
		lore: 'Le cœur du Sillage : plus il tourne fort, plus chaque effort pèse.',
		costFactor: 1,
		effect: (l) => `+${pct(l * EFFECTS.reactorXp)} d'XP`
	},
	{
		id: 'hull',
		name: 'Coque renforcée',
		role: 'Motivation',
		lore: "Les mauvais jours cognent moins fort sur un blindage solide.",
		costFactor: 1,
		effect: (l) => `−${pct(l * EFFECTS.hullShield)} de Motivation perdue par raté`
	},
	{
		id: 'thrusters',
		name: 'Propulseurs ioniques',
		role: 'Orbite',
		lore: "Une orbite stable rapporte plus quand on pousse dans le bon sens.",
		costFactor: 1,
		effect: (l) => `+${pct(l * EFFECTS.thrustersOrbit)} de butin d'orbite`
	},
	{
		id: 'antenna',
		name: 'Antenne longue portée',
		role: 'Inspiration',
		lore: "Elle capte les signaux lointains : idées, élans, envies.",
		costFactor: 0.8,
		effect: (l) => `+${pct(l * EFFECTS.antennaInspiration)} d'Inspiration gagnée`
	}
];

export interface SkillDef {
	id: SkillId;
	name: string;
	lore: string;
	effect: (level: number) => string;
}

export const SKILLS: SkillDef[] = [
	{
		id: 'recovery',
		name: 'Second souffle',
		lore: 'Le pilote revient plus vite à son niveau de base.',
		effect: (l) => `Motivation : retour vers 50 de ${pct(GAUGES.motivation.dailyPullRatio + l * EFFECTS.recoveryPull)} par jour`
	},
	{
		id: 'logistics',
		name: 'Logistique',
		lore: 'Les colis et corvées de bord rapportent davantage.',
		effect: (l) => `+${pct(l * EFFECTS.logisticsTask)} d'XP et de butin sur les tâches`
	},
	{
		id: 'endurance',
		name: 'Endurance',
		lore: "Même un petit effort compte vraiment.",
		effect: (l) => `Palier minimum : ×${(TIER_FACTOR.min + l * EFFECTS.enduranceMin).toFixed(2)} d'XP`
	},
	{
		id: 'engineering',
		name: 'Ingénierie',
		lore: 'Moins de déchets à l\'atelier, plus de pièces pour le chantier.',
		effect: (l) => `−${pct(l * EFFECTS.engineeringCost)} sur le coût des améliorations`
	}
];

// Classe du vaisseau selon la somme des niveaux de ses modules (4 modules × 5 niveaux = 20).
export const SHIP_CLASSES = [
	{ from: 0, name: 'Épave' },
	{ from: 3, name: 'Navette' },
	{ from: 7, name: 'Corvette' },
	{ from: 12, name: 'Frégate' },
	{ from: 17, name: 'Croiseur' },
	{ from: 20, name: 'Vaisseau-amiral' }
];
