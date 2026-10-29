import { addDays, inRange, startOfWeek, weekday } from '../dates';
import type { AppData, DanceClass, DanceParty, Habit, ISODate, RoutineVersion, Task } from '../types';

export function isRestDay(data: AppData, date: ISODate): boolean {
	return data.restDays.includes(date);
}

export function isActiveOn(habit: Habit, date: ISODate): boolean {
	return !habit.archived && habit.createdAt <= date;
}

// Habitude attendue ce jour-là (quotidienne ou jour fixe). Les habitudes « X fois par semaine » sont gérées à part.
export function isDueOn(habit: Habit, date: ISODate): boolean {
	if (!isActiveOn(habit, date)) return false;
	const f = habit.frequency;
	if (f.type === 'daily') return true;
	if (f.type === 'days') return f.days.includes(weekday(date));
	return false;
}

export function logsInWeek(data: AppData, habitId: string, date: ISODate) {
	const start = startOfWeek(date);
	const end = addDays(start, 6);
	return data.habitLogs.filter((l) => l.habitId === habitId && l.date >= start && l.date <= end);
}

// Ce qui s'affiche pour une journée : les habitudes dues + les objectifs hebdo actifs.
export function habitsForDay(data: AppData, date: ISODate): Habit[] {
	return data.habits.filter(
		(h) => isDueOn(h, date) || (h.frequency.type === 'weekly' && isActiveOn(h, date))
	);
}

// Todo d'une journée : tâches planifiées ce jour-là ; le jour courant y ajoute les tâches libres
// d'aujourd'hui / de la semaine / du mois, les reportées et les échéances arrivées.
export function tasksForDay(data: AppData, date: ISODate, asOf: ISODate): Task[] {
	return data.tasks.filter((t) => {
		if (t.date === date || t.done === date) return true;
		if (date !== asOf || t.done) return false;
		if (t.date) return t.date < date; // planifiée plus tôt et non faite : reportée
		if (t.due && t.due <= date) return true;
		return t.list !== 'someday';
	});
}

export function routineOn(habit: Habit, date: ISODate): RoutineVersion | undefined {
	const versions = (habit.routine ?? []).filter((v) => v.from <= date);
	return versions.at(-1) ?? habit.routine?.[0];
}

export function onVacation(data: AppData, date: ISODate): boolean {
	return data.vacations.some((v) => inRange(date, v.start, v.end));
}

export function classOccursOn(data: AppData, c: DanceClass, date: ISODate): boolean {
	return c.weekday === weekday(date) && !c.cancelled.includes(date) && !onVacation(data, date);
}

export function danceClassesOn(data: AppData, date: ISODate): DanceClass[] {
	return data.danceClasses
		.filter((c) => classOccursOn(data, c, date))
		.sort((a, b) => a.time.localeCompare(b.time));
}

export function partiesOn(data: AppData, date: ISODate): DanceParty[] {
	return data.danceParties.filter((p) => p.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

export function upcomingParties(data: AppData, from: ISODate): DanceParty[] {
	return data.danceParties
		.filter((p) => p.date >= from)
		.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
