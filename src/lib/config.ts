// Constantes de jeu, à calibrer après 2-3 semaines d'usage réel.
import type { Difficulty, Loot } from './types';

export const XP_BASE = { easy: 10, medium: 20, hard: 40 } as const;
export const TIER_FACTOR = { min: 0.5, normal: 1, excellent: 1.5 } as const;

export const XP_REWARDS = {
	chapter: 300,
	campaign: 1000,
	weeklyReview: 50,
	monthlyReview: 150
} as const;

// Butin de base par difficulté (× facteur du palier). Alliage = tout, Cellules = effort moyen, Cristaux = rare.
export const LOOT_BASE: Record<Difficulty, Loot> = {
	easy: { metal: 2 },
	medium: { metal: 2, energy: 1 },
	hard: { metal: 3, energy: 2, crystal: 1 }
};

export const LOOT_REWARDS: Record<string, Loot> = {
	quest: { metal: 2, energy: 2 },
	boss: { energy: 2, crystal: 2 },
	chapter: { crystal: 3 },
	campaign: { crystal: 10 },
	weeklyReview: { energy: 3 },
	monthlyReview: { energy: 5, crystal: 1 },
	orbitSector: { metal: 1 }, // par secteur de l'orbite allumé, versé à l'amarrage (revue hebdo)
	orbitPerfect: { crystal: 2 } // 7 secteurs sur 7
};

// Bonus des modules du vaisseau et des compétences du pilote, par niveau.
export const EFFECTS = {
	reactorXp: 0.06, // Réacteur : +6 % d'XP
	hullShield: 0.1, // Coque : −10 % de Motivation perdue par raté
	antennaInspiration: 0.2, // Antenne : +20 % d'Inspiration gagnée
	thrustersOrbit: 0.25, // Propulseurs : +25 % de butin d'orbite
	recoveryPull: 0.05, // Second souffle : retour vers 50 plus rapide
	logisticsTask: 0.25, // Logistique : +25 % d'XP et de butin sur les tâches
	enduranceMin: 0.1, // Endurance : le palier minimum vaut 0,1 de plus
	engineeringCost: 0.08 // Ingénierie : −8 % sur le coût des améliorations
} as const;

export const MODULE_MAX_LEVEL = 5;
export const SKILL_MAX_LEVEL = 3;

// XP pour passer du niveau n au niveau n+1 = LEVEL_BASE × n^LEVEL_EXPONENT
export const LEVEL_BASE = 100;
export const LEVEL_EXPONENT = 1.5;

export const GAUGES = {
	disciplineWindowDays: 28,
	motivationStart: 50,
	inspirationStart: 50,
	motivation: {
		obligatoryDone: 5,
		bonusDone: 3,
		questDone: 10,
		obligatoryMissed: -8,
		dailyPullToward: 50,
		dailyPullRatio: 0.1 // part de l'écart à 50 rattrapée chaque jour
	},
	inspiration: {
		weeklyReview: 25,
		chapterDone: 15,
		campaignDone: 30,
		newChallenge: 10,
		idleCampaignPerDay: -2
	},
	minimumModeBelow: 30,
	momentumFrom: 80
} as const;

export const DANCE_XP_DIFFICULTY = 'medium' as const;
