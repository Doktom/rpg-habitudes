// Constantes de jeu, à calibrer après 2-3 semaines d'usage réel.

export const XP_BASE = { easy: 10, medium: 20, hard: 40 } as const;
export const TIER_FACTOR = { min: 0.5, normal: 1, excellent: 1.5 } as const;

export const XP_REWARDS = {
	task: 10,
	chapter: 300,
	campaign: 1000,
	weeklyReview: 50,
	monthlyReview: 150
} as const;

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
