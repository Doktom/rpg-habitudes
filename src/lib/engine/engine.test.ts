import { describe, expect, it } from 'vitest';
import { addDays, startOfWeek } from '../dates';
import { seed } from '../seed';
import type { AppData } from '../types';
import { closeDay, daysToClose, discipline, gaugeValue, obligationsOn, xpByDomain } from './progress';
import { danceClassesOn, habitsForDay } from './schedule';
import { actionXp, levelInfo, splitXp, xpToNext } from './xp';

const START = '2026-10-05'; // un lundi

function fresh(): AppData {
	const d = seed(START);
	d.lastProcessedDay = addDays(START, -1);
	return d;
}

describe('xp', () => {
	it('applique base × palier × discipline', () => {
		expect(actionXp('medium', 'normal', 0)).toBe(20);
		expect(actionXp('hard', 'excellent', 30)).toBe(78);
		expect(actionXp('easy', 'min', 100)).toBe(10);
	});

	it('suit la courbe 100 × n^1,5', () => {
		expect(xpToNext(1)).toBe(100);
		expect(xpToNext(5)).toBe(1118);
		expect(xpToNext(10)).toBe(3162);
		expect(levelInfo(0)).toEqual({ level: 1, into: 0, needed: 100 });
		expect(levelInfo(150).level).toBe(2);
		expect(levelInfo(150).into).toBe(50);
	});

	it('répartit sans perdre de points', () => {
		const parts = splitXp(11, [
			{ domainId: 'a', weight: 70 },
			{ domainId: 'b', weight: 30 }
		]);
		expect(parts.reduce((s, p) => s + p.amount, 0)).toBe(11);
		expect(parts[1]).toEqual({ domainId: 'b', amount: 3 });
	});
});

describe('planning', () => {
	it("affiche les habitudes du jour et l'objectif hebdo", () => {
		const data = fresh();
		const saturday = addDays(START, 5);
		const names = habitsForDay(data, saturday).map((h) => h.id);
		expect(names).toContain('salle');
		expect(names).not.toContain('trading-analyse');
		expect(startOfWeek(saturday)).toBe(START);
	});

	it('suspend les cours de danse pendant les vacances et les annulations', () => {
		const data = fresh();
		data.danceClasses.push({
			id: 'c1',
			style: 'salsa',
			weekday: 2,
			time: '20:00',
			durationMin: 90,
			kind: 'obligatory',
			cancelled: [addDays(START, 8)]
		});
		data.vacations.push({ id: 'v', label: 'Toussaint', start: addDays(START, 14), end: addDays(START, 20) });
		expect(danceClassesOn(data, addDays(START, 1))).toHaveLength(1);
		expect(danceClassesOn(data, addDays(START, 8))).toHaveLength(0);
		expect(danceClassesOn(data, addDays(START, 15))).toHaveLength(0);
		expect(danceClassesOn(data, addDays(START, 22))).toHaveLength(1);
	});
});

describe('jauges', () => {
	it('Discipline = taux de réussite pondéré des jours passés', () => {
		const data = fresh();
		expect(discipline(data, START)).toBe(0);
		// Tout fait le lundi : 3 routines + trading
		for (const id of ['reveil', 'kine-matin', 'kine-soir', 'trading-analyse'])
			data.habitLogs.push({ id: id + 'l', habitId: id, date: START, tier: 'min' });
		expect(obligationsOn(data, START)).toEqual({ expected: 4, done: 4 });
		expect(discipline(data, addDays(START, 1))).toBe(100);
		// Rien le mardi : la réussite baisse, le mardi pèse plus
		expect(discipline(data, addDays(START, 2))).toBeLessThan(50);
	});

	it('les jours de repos sont neutres', () => {
		const data = fresh();
		data.restDays.push(START);
		expect(obligationsOn(data, START).expected).toBe(0);
		expect(closeDay(data, START)?.gauge?.motivation ?? 0).toBeGreaterThanOrEqual(0);
	});

	it('un jour raté fait baisser la Motivation, sans perte d’XP', () => {
		const data = fresh();
		const e = closeDay(data, START)!;
		expect(e.gauge!.motivation).toBe(4 * -8 + 3); // 4 ratés puis rappel vers 50
		expect(e.xp).toBeUndefined();
		data.events.push(e);
		expect(gaugeValue(data, 'motivation')).toBe(21);
		expect(xpByDomain(data)['sport'] ?? 0).toBe(0);
	});

	it('clôture seulement les jours non traités', () => {
		const data = fresh();
		expect(daysToClose(data, START)).toEqual([]);
		expect(daysToClose(data, addDays(START, 3))).toEqual([START, addDays(START, 1), addDays(START, 2)]);
	});

	it("l'XP des sous-compétences remonte à la stat parente", () => {
		const data = fresh();
		data.events.push({
			id: 'e',
			at: '2026-10-05T20:00:00Z',
			date: START,
			source: 'dance:x',
			label: 'Cours',
			xp: [{ domainId: 'bachata', amount: 20 }]
		});
		const xp = xpByDomain(data);
		expect(xp['bachata']).toBe(20);
		expect(xp['danse']).toBe(20);
	});
});
