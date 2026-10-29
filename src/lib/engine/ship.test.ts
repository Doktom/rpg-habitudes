import { describe, expect, it } from 'vitest';
import { addDays } from '../dates';
import { seed } from '../seed';
import type { AppData, ISODate } from '../types';
import { missPenalty, tierFactor } from './effects';
import { perfectStreak } from './progress';
import { tasksForDay } from './schedule';
import { canAfford, lootFor, materials, negate, orbit, orbitReward, sectorsLit, skillPoints, upgradeCost } from './ship';
import { newTrophies } from './trophies';

const START = '2026-10-05'; // un lundi

function fresh(): AppData {
	const d = seed(START);
	d.lastProcessedDay = addDays(START, -1);
	return d;
}

// Valide toutes les obligations quotidiennes (réveil, kiné x2, trading en semaine) d'un jour.
function logDay(d: AppData, date: ISODate) {
	for (const id of ['reveil', 'kine-matin', 'kine-soir', 'trading-analyse'])
		d.habitLogs.push({ id: `${id}-${date}`, habitId: id, date, tier: 'normal' });
}

describe('butin et matériaux', () => {
	it('dépend de la difficulté et du palier', () => {
		expect(lootFor('easy')).toEqual({ metal: 2 });
		expect(lootFor('medium')).toEqual({ metal: 2, energy: 1 });
		expect(lootFor('hard')).toEqual({ metal: 3, energy: 2, crystal: 1 });
		expect(lootFor('easy', 0.5)).toEqual({ metal: 1 });
	});

	it('additionne le butin et retranche les dépenses du journal', () => {
		const d = fresh();
		d.events.push({ id: 'a', at: START + 'T10:00', date: START, source: 'x', label: 'gain', loot: { metal: 20, energy: 5 } });
		d.events.push({ id: 'b', at: START + 'T11:00', date: START, source: 'y', label: 'dépense', loot: negate({ metal: 8 }) });
		expect(materials(d)).toEqual({ metal: 12, energy: 5, crystal: 0 });
		expect(canAfford(materials(d), { metal: 12, energy: 5 })).toBe(true);
		expect(canAfford(materials(d), { crystal: 1 })).toBe(false);
	});
});

describe('vaisseau', () => {
	it("le coût augmente avec le niveau, les cristaux arrivent au niveau 2, l'Ingénierie réduit", () => {
		const d = fresh();
		expect(upgradeCost(d, 'reactor')).toEqual({ metal: 20, energy: 8 });
		d.ship.modules.reactor = 2;
		expect(upgradeCost(d, 'reactor')).toEqual({ metal: 60, energy: 24, crystal: 4 });
		d.skills.engineering = 2;
		expect(upgradeCost(d, 'reactor')).toEqual({ metal: 51, energy: 21, crystal: 4 });
		d.ship.modules.reactor = 5;
		expect(upgradeCost(d, 'reactor')).toBeNull();
	});

	it('les effets suivent les niveaux', () => {
		const d = fresh();
		expect(missPenalty(d)).toBe(-8);
		d.ship.modules.hull = 5;
		expect(missPenalty(d)).toBe(-4);
		expect(tierFactor(d, 'min')).toBe(0.5);
		d.skills.endurance = 3;
		expect(tierFactor(d, 'min')).toBeCloseTo(0.8);
		expect(tierFactor(d, 'excellent')).toBe(1.5);
	});

	it('donne un point de compétence par niveau de pilote, moins ceux dépensés', () => {
		const d = fresh();
		expect(skillPoints(d)).toBe(0);
		d.events.push({ id: 'a', at: START + 'T10:00', date: START, source: 'x', label: 'xp', xp: [{ domainId: '', amount: 400 }] }); // 100 + 283 = 383 XP pour le niveau 3
		expect(skillPoints(d)).toBe(2);
		d.skills.logistics = 1;
		expect(skillPoints(d)).toBe(1);
	});
});

describe('orbite', () => {
	it('allume un secteur quand toutes les obligations sont faites', () => {
		const d = fresh();
		logDay(d, START);
		const wed = addDays(START, 2);
		const sectors = orbit(d, START, wed);
		expect(sectors.map((s) => s.state)).toEqual(['lit', 'missed', 'today', 'future', 'future', 'future', 'future']);
		d.restDays.push(addDays(START, 1));
		expect(orbit(d, START, wed)[1].state).toBe('rest');
	});

	it('verse un butin par secteur allumé, plus un bonus pour une orbite parfaite', () => {
		const d = fresh();
		for (let i = 0; i < 7; i++) logDay(d, addDays(START, i));
		const all = orbit(d, START, addDays(START, 6));
		// Samedi et dimanche : seules les habitudes quotidiennes comptent, déjà validées ci-dessus.
		expect(sectorsLit(all)).toBe(7);
		expect(orbitReward(d, all)).toEqual({ metal: 7, crystal: 2 });
		d.ship.modules.thrusters = 4; // +100 %
		expect(orbitReward(d, all)).toEqual({ metal: 14, crystal: 4 });
	});
});

describe('série parfaite', () => {
	it("compte les jours complets et n'est pas cassée par aujourd'hui en cours", () => {
		const d = fresh();
		for (let i = 0; i < 3; i++) logDay(d, addDays(START, i));
		expect(perfectStreak(d, addDays(START, 3))).toBe(3);
		expect(perfectStreak(d, addDays(START, 4))).toBe(0);
		logDay(d, addDays(START, 3));
		expect(perfectStreak(d, addDays(START, 3))).toBe(4);
	});
});

describe('todo du jour', () => {
	it('montre les tâches de la semaine et du mois aujourd\'hui, pas celles de « un jour »', () => {
		const d = fresh();
		d.tasks.push(
			{ id: 'w', title: 'semaine', list: 'week' },
			{ id: 'm', title: 'mois', list: 'month' },
			{ id: 's', title: 'un jour', list: 'someday' },
			{ id: 'old', title: 'reportée', list: 'today', date: addDays(START, -1) },
			{ id: 'later', title: 'planifiée demain', list: 'week', date: addDays(START, 1) },
			{ id: 'due', title: 'échéance', list: 'someday', due: START },
			{ id: 'done', title: 'faite', list: 'week', done: START }
		);
		const ids = (date: ISODate, asOf: ISODate) => tasksForDay(d, date, asOf).map((t) => t.id).sort();
		expect(ids(START, START)).toEqual(['done', 'due', 'm', 'old', 'w']);
		expect(ids(addDays(START, 1), START)).toEqual(['later']);
	});
});

describe('trophées', () => {
	it('se débloquent sur condition', () => {
		const d = fresh();
		expect(newTrophies(d, START)).toEqual([]);
		d.habitLogs.push({ id: 'l', habitId: 'reveil', date: START, tier: 'normal' });
		expect(newTrophies(d, START).map((t) => t.id)).toEqual(['first-light']);
		d.trophies['first-light'] = START;
		expect(newTrophies(d, START)).toEqual([]);
	});
});
