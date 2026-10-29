import type { ISODate } from './types';

// Les dates sont manipulées en 'YYYY-MM-DD', calculées en UTC pour éviter les décalages d'heure d'été.

export function toISO(d: Date): ISODate {
	return d.toISOString().slice(0, 10);
}

export function today(): ISODate {
	const now = new Date();
	return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function parse(date: ISODate): Date {
	return new Date(date + 'T00:00:00Z');
}

export function addDays(date: ISODate, n: number): ISODate {
	const d = parse(date);
	d.setUTCDate(d.getUTCDate() + n);
	return toISO(d);
}

export function weekday(date: ISODate): number {
	return parse(date).getUTCDay();
}

// Les semaines commencent le lundi.
export function startOfWeek(date: ISODate): ISODate {
	return addDays(date, -((weekday(date) + 6) % 7));
}

export function daysBetween(a: ISODate, b: ISODate): number {
	return Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000);
}

export function range(from: ISODate, to: ISODate): ISODate[] {
	const out: ISODate[] = [];
	for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
	return out;
}

export function inRange(date: ISODate, start: ISODate, end: ISODate): boolean {
	return date >= start && date <= end;
}

export const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const WEEKDAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function formatLong(date: ISODate): string {
	return parse(date).toLocaleDateString('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC'
	});
}

export function formatShort(date: ISODate): string {
	return parse(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
