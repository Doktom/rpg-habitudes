// Mode test : génère des habitudes, tâches et campagnes, simule plusieurs semaines, puis laisse avancer les jours.
import { addDays, realToday, setClock, startOfWeek, today, weekday } from './dates';
import { discipline, gaugeValue, successRate, totalXp } from './engine/progress';
import { danceClassesOn, habitsForDay, isActiveOn, logsInWeek, tasksForDay } from './engine/schedule';
import { uid } from './id';
import { DANCE_LABEL } from './labels';
import { seed } from './seed';
import type { Store } from './store.svelte';
import type { AppData, Difficulty, ISODate, Task, TaskList, Tier } from './types';

// Aléa reproductible : une même date donne toujours les mêmes tirages, donc le scénario est stable.
function rngFor(key: string) {
	let a = 7;
	for (const c of key) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const pick = <T,>(rnd: () => number, items: T[]): T => items[Math.floor(rnd() * items.length)];

// Qualité de la semaine : certaines sont très bonnes, d'autres moins, pour voir les jauges bouger.
export const weekQuality = (date: ISODate) => 0.5 + 0.45 * rngFor('week' + startOfWeek(date))();

const TASK_TITLES = [
	'Appeler le plombier', 'Ranger le bureau', 'Répondre aux emails en retard', 'Préparer les courses', 'Réviser le plan de trading',
	'Nettoyer la cuisine', 'Réserver le prochain stage de danse', 'Trier les photos', 'Payer une facture', 'Planifier la semaine'
];

function extras(data: AppData, start: ISODate) {
	data.domains.push({ id: 'cuisine', name: 'Cuisine', stat: 'Gourmandise', color: '#2563eb' });
	data.habits.push(
		{
			id: 'meditation', name: 'Méditation', form: 'simple', kind: 'bonus', frequency: { type: 'daily' },
			tiers: { min: '2 min', normal: '10 min', excellent: '20 min' }, moment: 'morning', difficulty: 'easy',
			domains: [{ domainId: 'bienetre', weight: 100 }], createdAt: start
		},
		{
			id: 'lecture', name: 'Lecture', form: 'simple', kind: 'bonus', frequency: { type: 'weekly', times: 4 },
			tiers: { min: '5 pages', normal: '20 pages', excellent: '1 chapitre' }, moment: 'evening', difficulty: 'easy',
			domains: [{ domainId: 'projets', weight: 100 }], createdAt: start
		},
		{
			id: 'cuisine-maison', name: 'Cuisiner un vrai repas', form: 'simple', kind: 'obligatory', frequency: { type: 'weekly', times: 2 },
			tiers: { min: 'Plat simple', normal: 'Repas complet', excellent: 'Nouvelle recette' }, moment: 'evening', difficulty: 'medium',
			domains: [{ domainId: 'cuisine', weight: 100 }], createdAt: start
		}
	);
	data.danceClasses.push(
		{ id: 'dc-salsa', style: 'salsa', weekday: 2, time: '20:00', durationMin: 90, kind: 'obligatory', cancelled: [] },
		{ id: 'dc-bachata', style: 'bachata', weekday: 4, time: '20:00', durationMin: 90, kind: 'bonus', cancelled: [] }
	);
	const quests = (prefix: string, items: [string, number, boolean?][]) =>
		items.map(([name, xp, boss], i) => ({ id: `${prefix}${i}`, name, xp, boss }));
	const [trading, maison] = data.campaigns;
	trading.chapters[0].quests = quests('qt1-', [['Choisir les marchés', 40], ['Définir les règles d\'entrée', 50], ['Valider le plan', 120, true]]);
	trading.chapters[1].quests = quests('qt2-', [['Collecter les données', 40], ['Backtest v1', 60], ['Backtest complet', 120, true]]);
	maison.chapters[0].quests = quests('qm1-', [['Choisir la peinture', 30], ['Monter les étagères', 50], ['Finir la pièce', 100, true]]);
	const subtasks = (...titles: string[]) => titles.map((title) => ({ id: uid(), title }));
	data.tasks.push(
		{ id: uid(), title: 'Déclarer les impôts', list: 'month', effort: 'hard', note: 'Penser aux justificatifs de dons.', domainId: 'projets', subtasks: subtasks('Rassembler les documents', 'Remplir le formulaire', 'Envoyer'), due: addDays(start, 24) },
		{ id: uid(), title: 'Ranger le garage', list: 'week', effort: 'medium', subtasks: subtasks('Trier', 'Jeter', 'Étagères') },
		{ id: uid(), title: 'Apprendre une nouvelle choré', list: 'someday', effort: 'medium', domainId: 'danse' },
		{ id: uid(), title: 'Acheter un cadeau', list: 'today', date: start, effort: 'easy' }
	);
}

// Simule une journée : validations aléatoires selon la qualité de la semaine.
export function playDay(store: Store, date: ISODate, quality: number) {
	const rnd = rngFor(date);
	const tierOf = (): Tier => {
		const r = rnd();
		return r < 0.2 ? 'min' : r < 0.85 ? 'normal' : 'excellent';
	};

	if (rnd() < 0.7) {
		const lists: TaskList[] = ['today', 'today', 'week', 'week', 'month', 'someday'];
		const list = pick(rnd, lists);
		const task: Task = {
			id: uid(), title: pick(rnd, TASK_TITLES), list, date: list === 'today' ? date : undefined,
			effort: pick<Difficulty>(rnd, ['easy', 'easy', 'medium', 'hard']),
			domainId: rnd() < 0.5 ? pick(rnd, store.data.domains.map((d) => d.id)) : undefined
		};
		store.saveTask(task);
	}

	for (const h of habitsForDay(store.data, date)) {
		if (!isActiveOn(h, date)) continue;
		let p = h.kind === 'bonus' ? quality * 0.6 : quality;
		if (h.frequency.type === 'weekly') {
			const remaining = h.frequency.times - logsInWeek(store.data, h.id, date).length;
			if (remaining <= 0) continue;
			p = Math.min(1, remaining / (7 - ((weekday(date) + 6) % 7))) * Math.min(1, quality * 1.15);
		}
		if (rnd() < p) store.logHabit(h, date, tierOf(), h.form === 'program' ? { session: pick(rnd, h.sessions ?? ['']) } : {});
	}

	for (const c of danceClassesOn(store.data, date))
		if (rnd() < quality) store.logDance(c.id, `Cours de ${DANCE_LABEL[c.style]}`, [c.style], c.kind, date, tierOf());

	for (const t of tasksForDay(store.data, date, date).filter((x) => !x.done)) {
		const p = t.date === date || t.list === 'today' ? 0.85 * quality : t.due ? 0.5 * quality : 0.15 * quality;
		if (rnd() < p) {
			t.subtasks?.forEach((s) => (s.done = true));
			store.toggleTask(t);
		}
	}

	if (rnd() < 0.3 * quality) {
		for (const c of store.data.campaigns) {
			if (c.status !== 'active') continue;
			const chapter = c.chapters.find((ch) => ch.quests.some((q) => !q.done));
			const quest = chapter?.quests.find((q) => !q.done);
			if (!chapter || !quest) continue;
			store.toggleQuest(c, chapter.id, quest.id);
			break;
		}
	}

	if (weekday(date) === 0 && rnd() < 0.9) {
		const weekStart = startOfWeek(date);
		const d = store.data;
		store.addReview({
			id: uid(), type: 'weekly', periodStart: weekStart, createdAt: date,
			worked: 'Test automatique', stuck: '', adjust: '', priorities: ['Priorité test'],
			snapshot: {
				xp: totalXp(d, weekStart, date), discipline: discipline(d, date), motivation: gaugeValue(d, 'motivation'),
				inspiration: gaugeValue(d, 'inspiration'), successRate: successRate(d, weekStart, date)
			}
		});
		store.saveTask({ id: uid(), title: 'Priorité test', list: 'week', effort: 'medium' });
	}

	store.evaluateTrophies();
}

// Nouvelle partie de test : données de départ + extras, puis les semaines passées jouées une à une.
export function buildScenario(store: Store, weeks: number) {
	const end = realToday();
	const start = addDays(startOfWeek(end), -7 * weeks);
	setClock(start);
	const data: AppData = { ...seed(start), lastProcessedDay: addDays(start, -1) };
	extras(data, start);
	store.data = data;
	store.batch(() => {
		for (let date = start; date < end; date = addDays(date, 1)) {
			setClock(date);
			store.rollover();
			playDay(store, date, weekQuality(date));
		}
		setClock(end);
		store.rollover();
		store.data.testClock = end;
	});
}

// Joue n jours d'affilée à partir de la date simulée (valide au hasard, puis passe au lendemain).
export function autoPlay(store: Store, days: number) {
	store.batch(() => {
		for (let i = 0; i < days; i++) {
			const date = today();
			playDay(store, date, weekQuality(date));
			const next = addDays(date, 1);
			setClock(next);
			store.data.testClock = next;
			store.rollover();
		}
	});
}

// Valide tout ce qui est dû aujourd'hui, au palier normal.
export function validateDay(store: Store) {
	const date = today();
	const d = store.data;
	for (const h of habitsForDay(d, date)) {
		if (!isActiveOn(h, date) || d.habitLogs.some((l) => l.habitId === h.id && l.date === date)) continue;
		if (h.frequency.type === 'weekly' && logsInWeek(d, h.id, date).length >= h.frequency.times) continue;
		store.logHabit(h, date, 'normal', h.form === 'program' ? { session: h.sessions?.[0] } : {});
	}
	for (const c of danceClassesOn(d, date))
		if (!d.danceLogs.some((l) => l.refId === c.id && l.date === date))
			store.logDance(c.id, `Cours de ${DANCE_LABEL[c.style]}`, [c.style], c.kind, date, 'normal');
	for (const t of tasksForDay(d, date, date).filter((x) => !x.done)) {
		t.subtasks?.forEach((s) => (s.done = true));
		store.toggleTask(t);
	}
}
