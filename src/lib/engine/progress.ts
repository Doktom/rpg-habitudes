import { GAUGES } from '../config';
import { addDays, daysBetween, range, startOfWeek } from '../dates';
import type { AppData, Gauge, ISODate, ProgressEvent } from '../types';
import { danceClassesOn, habitsForDay, isDueOn, isRestDay, logsInWeek } from './schedule';

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function sortedEvents(events: ProgressEvent[]): ProgressEvent[] {
	return [...events].sort((a, b) => a.at.localeCompare(b.at));
}

export function totalXp(data: AppData, from?: ISODate, to?: ISODate): number {
	let sum = 0;
	for (const e of data.events) {
		if ((from && e.date < from) || (to && e.date > to)) continue;
		for (const x of e.xp ?? []) sum += x.amount;
	}
	return sum;
}

// XP par domaine ; un domaine parent cumule l'XP de ses sous-compétences.
export function xpByDomain(data: AppData): Record<string, number> {
	const own: Record<string, number> = {};
	for (const e of data.events) for (const x of e.xp ?? []) own[x.domainId] = (own[x.domainId] ?? 0) + x.amount;
	const out: Record<string, number> = {};
	for (const d of data.domains) {
		out[d.id] = (out[d.id] ?? 0) + (own[d.id] ?? 0);
		if (d.parentId) out[d.parentId] = (out[d.parentId] ?? 0) + (own[d.id] ?? 0);
	}
	return out;
}

// Motivation et Inspiration : on rejoue les événements dans l'ordre, borné à 0-100 à chaque pas.
export function gaugeValue(data: AppData, gauge: Gauge, upTo?: ISODate): number {
	let v: number = gauge === 'motivation' ? GAUGES.motivationStart : GAUGES.inspirationStart;
	for (const e of sortedEvents(data.events)) {
		if (upTo && e.date > upTo) continue;
		const delta = e.gauge?.[gauge];
		if (delta) v = clamp(v + delta);
	}
	return Math.round(v);
}

interface DayItem {
	weight: number;
	success: number; // 0 à 1
}

// Ce qui était attendu un jour donné et ce qui a été fait (habitudes obligatoires + cours de danse obligatoires).
export function obligationsOn(data: AppData, date: ISODate): { expected: number; done: number } {
	if (isRestDay(data, date)) return { expected: 0, done: 0 };
	let expected = 0;
	let done = 0;
	for (const h of data.habits) {
		if (h.kind !== 'obligatory' || !isDueOn(h, date)) continue;
		expected++;
		if (data.habitLogs.some((l) => l.habitId === h.id && l.date === date)) done++;
	}
	for (const c of danceClassesOn(data, date)) {
		if (c.kind !== 'obligatory') continue;
		expected++;
		if (data.danceLogs.some((l) => l.refId === c.id && l.date === date)) done++;
	}
	return { expected, done };
}

// Objectifs « X fois par semaine » non atteints, évalués le dimanche.
export function weeklyMisses(data: AppData, sunday: ISODate): number {
	let misses = 0;
	for (const h of data.habits) {
		if (h.kind !== 'obligatory' || h.frequency.type !== 'weekly') continue;
		if (h.archived || h.createdAt > startOfWeek(sunday)) continue;
		misses += Math.max(0, h.frequency.times - logsInWeek(data, h.id, sunday).length);
	}
	return misses;
}

// Discipline : taux de réussite pondéré sur les 28 derniers jours terminés, les jours récents pèsent plus.
export function discipline(data: AppData, asOf: ISODate): number {
	const window = GAUGES.disciplineWindowDays;
	const items: DayItem[] = [];
	for (let age = 1; age <= window; age++) {
		const date = addDays(asOf, -age);
		const weight = window - age + 1;
		const { expected, done } = obligationsOn(data, date);
		for (let i = 0; i < expected; i++) items.push({ weight, success: i < done ? 1 : 0 });
		// Objectifs hebdo, une fois par semaine terminée (le dimanche).
		if (new Date(date + 'T00:00:00Z').getUTCDay() === 0) {
			for (const h of data.habits) {
				if (h.kind !== 'obligatory' || h.frequency.type !== 'weekly') continue;
				if (h.archived || h.createdAt > startOfWeek(date)) continue;
				const count = logsInWeek(data, h.id, date).length;
				items.push({ weight: weight * 2, success: Math.min(1, count / h.frequency.times) });
			}
		}
	}
	const total = items.reduce((s, i) => s + i.weight, 0);
	if (total === 0) return 0;
	return Math.round((100 * items.reduce((s, i) => s + i.weight * i.success, 0)) / total);
}

export function successRate(data: AppData, from: ISODate, to: ISODate): number {
	let expected = 0;
	let done = 0;
	for (const d of range(from, to)) {
		const o = obligationsOn(data, d);
		expected += o.expected;
		done += o.done;
	}
	return expected === 0 ? 0 : Math.round((100 * done) / expected);
}

// Clôture des journées passées : ratés → Motivation, retour vers 50, campagnes au point mort → Inspiration.
export function closeDay(data: AppData, date: ISODate): ProgressEvent | null {
	const m = GAUGES.motivation;
	let motivation = 0;
	let inspiration = 0;
	const parts: string[] = [];

	if (!isRestDay(data, date)) {
		const { expected, done } = obligationsOn(data, date);
		let missed = expected - done;
		if (new Date(date + 'T00:00:00Z').getUTCDay() === 0) missed += weeklyMisses(data, date);
		if (missed > 0) {
			motivation += missed * m.obligatoryMissed;
			parts.push(`${missed} raté(s)`);
		}
	}

	const current = gaugeValue(data, 'motivation', date) + motivation;
	const pull = Math.round((m.dailyPullToward - current) * m.dailyPullRatio);
	motivation += pull;

	for (const c of data.campaigns) {
		if (c.status !== 'active') continue;
		const progressed = data.events.some((e) => e.date === date && e.campaignId === c.id);
		if (!progressed) inspiration += GAUGES.inspiration.idleCampaignPerDay;
	}
	if (inspiration < 0) parts.push('campagnes sans progrès');

	if (motivation === 0 && inspiration === 0) return null;
	return {
		id: `day:${date}`,
		at: date + 'T23:59:59.000Z',
		date,
		source: `day:${date}`,
		label: parts.length ? `Bilan du jour : ${parts.join(', ')}` : 'Bilan du jour',
		gauge: { motivation, inspiration }
	};
}

// Jours à clôturer entre la dernière clôture et hier (max 60 pour éviter un long rattrapage).
export function daysToClose(data: AppData, todayDate: ISODate): ISODate[] {
	const yesterday = addDays(todayDate, -1);
	const first = data.lastProcessedDay ? addDays(data.lastProcessedDay, 1) : yesterday;
	if (first > yesterday) return [];
	const start = daysBetween(first, yesterday) > 60 ? addDays(yesterday, -60) : first;
	return range(start, yesterday);
}

export { habitsForDay };
