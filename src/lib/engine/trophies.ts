// Trophées : conditions évaluées sur les données, jamais perdus une fois gagnés.
import { addDays } from '../dates';
import { SHIP_MODULES } from '../universe';
import type { AppData, ISODate, Loot } from '../types';
import { moduleLevel } from './effects';
import { perfectStreak, totalXp, xpByDomain } from './progress';
import { moduleTotal, orbit, sectorsLit } from './ship';
import { levelInfo } from './xp';

export interface TrophyContext {
	data: AppData;
	level: number;
	streak: number;
	habitLogs: number;
	danceLogs: number;
	tasksDone: number;
	bossesDone: number;
	chaptersDone: number;
	campaignsDone: number;
	weeklyReviews: number;
	perfectOrbits: number;
	bestStatLevel: number;
	bestModule: number;
	moduleTotal: number;
}

export interface TrophyDef {
	id: string;
	name: string;
	lore: string;
	hint: string;
	reward: { xp?: number; loot?: Loot };
	test: (c: TrophyContext) => boolean;
}

export function trophyContext(data: AppData, asOf: ISODate): TrophyContext {
	const byDomain = xpByDomain(data);
	const quests = data.campaigns.flatMap((c) => c.chapters.flatMap((ch) => ch.quests));
	return {
		data,
		level: levelInfo(totalXp(data)).level,
		streak: perfectStreak(data, asOf),
		habitLogs: data.habitLogs.length,
		danceLogs: data.danceLogs.length,
		tasksDone: data.tasks.filter((t) => t.done).length,
		bossesDone: quests.filter((q) => q.boss && q.done).length,
		chaptersDone: data.campaigns.reduce((s, c) => s + c.chapters.filter((ch) => ch.done).length, 0),
		campaignsDone: data.campaigns.filter((c) => c.done).length,
		weeklyReviews: data.reviews.filter((r) => r.type === 'weekly').length,
		perfectOrbits: data.reviews.filter(
			(r) => r.type === 'weekly' && sectorsLit(orbit(data, r.periodStart, addDays(r.periodStart, 6))) === 7
		).length,
		bestStatLevel: Math.max(1, ...data.domains.filter((d) => !d.parentId).map((d) => levelInfo(byDomain[d.id] ?? 0).level)),
		bestModule: Math.max(0, ...SHIP_MODULES.map((m) => moduleLevel(data, m.id))),
		moduleTotal: moduleTotal(data)
	};
}

export const TROPHIES: TrophyDef[] = [
	{ id: 'first-light', name: 'Premier allumage', lore: 'Les systèmes de bord répondent enfin.', hint: 'Valider une première habitude', reward: { xp: 20, loot: { metal: 3 } }, test: (c) => c.habitLogs >= 1 },
	{ id: 'first-task', name: 'Premier colis', lore: 'Une corvée de moins dans la soute.', hint: 'Terminer une première tâche', reward: { xp: 20, loot: { metal: 3 } }, test: (c) => c.tasksDone >= 1 },
	{ id: 'tasks-10', name: 'Cargo en route', lore: 'Dix livraisons, la soute respire.', hint: 'Terminer 10 tâches', reward: { xp: 60, loot: { energy: 3 } }, test: (c) => c.tasksDone >= 10 },
	{ id: 'tasks-50', name: 'Chef de soute', lore: "Cinquante colis passés par tes mains.", hint: 'Terminer 50 tâches', reward: { xp: 200, loot: { crystal: 2 } }, test: (c) => c.tasksDone >= 50 },
	{ id: 'logs-100', name: 'Centurion', lore: 'Cent routines de bord accomplies.', hint: 'Valider 100 habitudes', reward: { xp: 150, loot: { energy: 5, crystal: 1 } }, test: (c) => c.habitLogs >= 100 },
	{ id: 'dance-10', name: 'Rythme galactique', lore: "Dix danses, et même les étoiles suivent le tempo.", hint: 'Valider 10 danses', reward: { xp: 80, loot: { energy: 3 } }, test: (c) => c.danceLogs >= 10 },
	{ id: 'streak-7', name: 'Sept jours sans faille', lore: "Une semaine entière à pleine puissance.", hint: '7 jours de suite avec toutes les obligations faites', reward: { xp: 100, loot: { energy: 4, crystal: 1 } }, test: (c) => c.streak >= 7 },
	{ id: 'streak-30', name: 'Mois stellaire', lore: "Trente jours : même Kronos en est jaloux.", hint: '30 jours de suite avec toutes les obligations faites', reward: { xp: 400, loot: { crystal: 5 } }, test: (c) => c.streak >= 30 },
	{ id: 'orbit-1', name: 'Première orbite', lore: "Tu amarres au Havre pour la première fois.", hint: 'Faire une revue hebdo', reward: { xp: 40, loot: { metal: 5 } }, test: (c) => c.weeklyReviews >= 1 },
	{ id: 'orbit-4', name: 'Quatre orbites', lore: 'Un mois de révolutions, la carte se dessine.', hint: 'Faire 4 revues hebdo', reward: { xp: 120, loot: { energy: 5, crystal: 1 } }, test: (c) => c.weeklyReviews >= 4 },
	{ id: 'orbit-perfect', name: 'Orbite parfaite', lore: 'Sept secteurs allumés, pas un faux pas.', hint: 'Une semaine avec les 7 secteurs allumés', reward: { xp: 150, loot: { crystal: 3 } }, test: (c) => c.perfectOrbits >= 1 },
	{ id: 'level-5', name: 'Pilote confirmé', lore: 'Le cockpit commence à te ressembler.', hint: 'Atteindre le niveau 5', reward: { xp: 0, loot: { energy: 4, crystal: 1 } }, test: (c) => c.level >= 5 },
	{ id: 'level-10', name: 'As du cockpit', lore: "On parle de toi dans les ports de Kronos.", hint: 'Atteindre le niveau 10', reward: { xp: 0, loot: { crystal: 4 } }, test: (c) => c.level >= 10 },
	{ id: 'stat-5', name: 'Spécialiste', lore: 'Une discipline devient ta signature.', hint: 'Une stat au niveau 5', reward: { xp: 100, loot: { energy: 4 } }, test: (c) => c.bestStatLevel >= 5 },
	{ id: 'boss', name: 'Chasseur de monstres', lore: 'Ce qui te faisait peur gît dans le sas.', hint: 'Vaincre un boss', reward: { xp: 80, loot: { crystal: 2 } }, test: (c) => c.bossesDone >= 1 },
	{ id: 'chapter', name: 'Cap franchi', lore: 'Un chapitre de la carte est enfin lisible.', hint: 'Terminer un chapitre de campagne', reward: { xp: 100, loot: { crystal: 1 } }, test: (c) => c.chaptersDone >= 1 },
	{ id: 'campaign', name: 'Destination atteinte', lore: 'Un système entier est désormais sur ta carte.', hint: 'Terminer une campagne', reward: { xp: 300, loot: { crystal: 6 } }, test: (c) => c.campaignsDone >= 1 },
	{ id: 'shipyard', name: 'Chantier naval', lore: "L'atelier ne désemplit pas.", hint: 'Un module au niveau 3', reward: { xp: 60, loot: { metal: 10 } }, test: (c) => c.bestModule >= 3 },
	{ id: 'refit', name: 'Grande refonte', lore: "Le Sillage ne ressemble plus à l'épave du départ.", hint: 'Totaliser 10 niveaux de modules', reward: { xp: 200, loot: { crystal: 3 } }, test: (c) => c.moduleTotal >= 10 }
];

export function newTrophies(data: AppData, asOf: ISODate): TrophyDef[] {
	const pending = TROPHIES.filter((t) => !data.trophies[t.id]);
	if (!pending.length) return [];
	const ctx = trophyContext(data, asOf);
	return pending.filter((t) => t.test(ctx));
}
