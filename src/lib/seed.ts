import type { AppData, Habit, ISODate } from './types';

const tiers = (min: string, normal: string, excellent: string) => ({ min, normal, excellent });

// Configuration de départ issue du cahier des charges. Le contenu des routines se remplit au fil de l'eau.
export function seed(today: ISODate): AppData {
	const habits: Habit[] = [
		{
			id: 'reveil',
			name: 'Réveil musculaire',
			form: 'routine',
			kind: 'obligatory',
			frequency: { type: 'daily' },
			tiers: tiers('1 min', '3-5 min', '5 min + gainage'),
			moment: 'morning',
			difficulty: 'easy',
			domains: [
				{ domainId: 'mobilite', weight: 70 },
				{ domainId: 'sport', weight: 30 }
			],
			routine: [{ from: today, exercises: [] }],
			createdAt: today
		},
		{
			id: 'kine-matin',
			name: 'Kiné matin',
			form: 'routine',
			kind: 'obligatory',
			frequency: { type: 'daily' },
			tiers: tiers('Étirements seuls', 'Étirements + renfos', 'Tout + 1 série en plus'),
			moment: 'morning',
			difficulty: 'medium',
			domains: [{ domainId: 'mobilite', weight: 100 }],
			routine: [{ from: today, exercises: [] }],
			createdAt: today
		},
		{
			id: 'kine-soir',
			name: 'Kiné soir',
			form: 'routine',
			kind: 'obligatory',
			frequency: { type: 'daily' },
			tiers: tiers('Étirements seuls', 'Étirements + renfos', 'Tout + 1 série en plus'),
			moment: 'evening',
			difficulty: 'medium',
			domains: [{ domainId: 'mobilite', weight: 100 }],
			routine: [{ from: today, exercises: [] }],
			createdAt: today
		},
		{
			id: 'mini-seance',
			name: 'Mini-séance sport',
			form: 'simple',
			kind: 'bonus',
			frequency: { type: 'daily' },
			tiers: tiers('5 min', '15 min', '25 min'),
			moment: 'day',
			difficulty: 'easy',
			domains: [{ domainId: 'sport', weight: 100 }],
			createdAt: today
		},
		{
			id: 'salle',
			name: 'Salle',
			form: 'program',
			kind: 'obligatory',
			frequency: { type: 'weekly', times: 3 },
			tiers: tiers('Séance courte', 'Séance complète', 'Séance + record'),
			moment: 'day',
			difficulty: 'hard',
			domains: [{ domainId: 'sport', weight: 100 }],
			sessions: ['Séance A', 'Séance B', 'Séance C'],
			createdAt: today
		},
		{
			id: 'trading-analyse',
			name: 'Analyse / journal de trading',
			form: 'simple',
			kind: 'obligatory',
			frequency: { type: 'days', days: [1, 2, 3, 4, 5] },
			tiers: tiers('Lecture du marché 5 min', 'Analyse + journal', 'Analyse + journal + étude'),
			moment: 'day',
			difficulty: 'medium',
			domains: [{ domainId: 'trading', weight: 100 }],
			campaignId: 'camp-trading',
			createdAt: today
		}
	];

	return {
		version: 1,
		domains: [
			{ id: 'danse', name: 'Danse', stat: 'Rythme', color: '#db2777' },
			{ id: 'salsa', name: 'Salsa', stat: 'Salsa', color: '#e11d48', parentId: 'danse' },
			{ id: 'bachata', name: 'Bachata', stat: 'Bachata', color: '#c026d3', parentId: 'danse' },
			{ id: 'kizomba', name: 'Kizomba', stat: 'Kizomba', color: '#9333ea', parentId: 'danse' },
			{ id: 'sport', name: 'Sport', stat: 'Force', color: '#ea580c' },
			{ id: 'mobilite', name: 'Mobilité / kiné', stat: 'Souplesse', color: '#0d9488' },
			{ id: 'trading', name: 'Trading', stat: 'Stratégie', color: '#2563eb' },
			{ id: 'projets', name: 'Projets perso', stat: 'Créativité', color: '#ca8a04' },
			{ id: 'bienetre', name: 'Bien-être', stat: 'Sérénité', color: '#16a34a' }
		],
		habits,
		habitLogs: [],
		danceClasses: [],
		danceParties: [],
		vacations: [],
		danceLogs: [],
		campaigns: [
			{
				id: 'camp-trading',
				name: 'Système de trading',
				intent: 'Construire un système de trading rigoureux, fondé sur un process plutôt que sur les résultats.',
				domainId: 'trading',
				status: 'active',
				chapters: [
					{ id: 'ch-t1', name: 'Définir ma stratégie', quests: [] },
					{ id: 'ch-t2', name: 'Backtester', quests: [] },
					{ id: 'ch-t3', name: 'Trader en démo', quests: [] },
					{ id: 'ch-t4', name: 'Passer en réel avec un plan', quests: [] }
				]
			},
			{
				id: 'camp-maison',
				name: 'Aménagement et déco de la maison',
				intent: 'Aménager la maison pièce par pièce, à mon rythme.',
				domainId: 'projets',
				status: 'active',
				chapters: [{ id: 'ch-m1', name: 'Première pièce (à définir)', quests: [] }]
			}
		],
		tasks: [],
		reviews: [],
		events: [],
		restDays: [],
		minimumModeDays: [],
		lastProcessedDay: undefined,
		ship: { modules: {} },
		skills: {},
		trophies: {}
	};
}

// Complète des données plus anciennes (importées ou déjà stockées) avec les champs ajoutés depuis.
export function withDefaults(data: AppData): AppData {
	data.ship ??= { modules: {} };
	data.ship.modules ??= {};
	data.skills ??= {};
	data.trophies ??= {};
	return data;
}
