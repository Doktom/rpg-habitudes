import { DANCE_XP_DIFFICULTY, GAUGES, XP_REWARDS } from './config';
import { addDays, today } from './dates';
import { actionXp, bonusXp, splitXp } from './engine/xp';
import { closeDay, daysToClose, discipline } from './engine/progress';
import { seed } from './seed';
import type {
	AppData,
	Campaign,
	DanceClass,
	DanceParty,
	DanceStyle,
	Exercise,
	Habit,
	HabitKind,
	ISODate,
	ProgressEvent,
	Review,
	Task,
	Tier,
	Vacation
} from './types';

// V0 : tout est stocké dans le navigateur (localStorage). La couche Supabase remplacera load/persist.
const KEY = 'rpg-habitudes:v1';

export const uid = () => crypto.randomUUID().slice(0, 8);

function load(): AppData {
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) return JSON.parse(raw) as AppData;
	} catch {
		// stockage indisponible ou corrompu : on repart du seed
	}
	const t = today();
	return { ...seed(t), lastProcessedDay: addDays(t, -1) };
}

class Store {
	data = $state<AppData>(load());

	persist() {
		try {
			localStorage.setItem(KEY, JSON.stringify(this.data));
		} catch {
			// navigation privée : les données restent en mémoire pour la session
		}
	}

	private event(e: Omit<ProgressEvent, 'id' | 'at'>) {
		this.data.events.push({ id: uid(), at: new Date().toISOString(), ...e });
	}

	private dropEvents(source: string) {
		this.data.events = this.data.events.filter((e) => e.source !== source);
	}

	disciplineNow() {
		return discipline(this.data, today());
	}

	// --- Journée ---

	rollover() {
		const days = daysToClose(this.data, today());
		for (const d of days) {
			this.dropEvents(`day:${d}`);
			const e = closeDay(this.data, d);
			if (e) this.data.events.push(e);
			this.data.lastProcessedDay = d;
		}
		if (days.length) this.persist();
	}

	toggleRestDay(date: ISODate) {
		const i = this.data.restDays.indexOf(date);
		if (i >= 0) this.data.restDays.splice(i, 1);
		else this.data.restDays.push(date);
		this.persist();
	}

	toggleMinimumMode(date: ISODate) {
		const i = this.data.minimumModeDays.indexOf(date);
		if (i >= 0) this.data.minimumModeDays.splice(i, 1);
		else this.data.minimumModeDays.push(date);
		this.persist();
	}

	// --- Habitudes ---

	logHabit(habit: Habit, date: ISODate, tier: Tier, extra: { session?: string; doneExercises?: string[] } = {}) {
		const existing = this.data.habitLogs.find((l) => l.habitId === habit.id && l.date === date);
		if (existing) this.unlog(existing.id);
		const id = uid();
		this.data.habitLogs.push({ id, habitId: habit.id, date, tier, ...extra });
		const xp = actionXp(habit.difficulty, tier, discipline(this.data, date));
		const m = GAUGES.motivation;
		this.event({
			date,
			source: `habit:${id}`,
			label: `${habit.name}${extra.session ? ' — ' + extra.session : ''}`,
			xp: splitXp(xp, habit.domains),
			gauge: { motivation: habit.kind === 'obligatory' ? m.obligatoryDone : m.bonusDone },
			campaignId: habit.campaignId
		});
		this.persist();
	}

	unlog(logId: string) {
		this.data.habitLogs = this.data.habitLogs.filter((l) => l.id !== logId);
		this.dropEvents(`habit:${logId}`);
		this.persist();
	}

	saveHabit(habit: Habit) {
		const i = this.data.habits.findIndex((h) => h.id === habit.id);
		if (i >= 0) this.data.habits[i] = habit;
		else this.data.habits.push(habit);
		this.persist();
	}

	// Nouvelle version datée si la liste change un autre jour que celui de la dernière version.
	saveRoutine(habit: Habit, exercises: Exercise[]) {
		const t = today();
		const versions = habit.routine ?? [];
		const last = versions.at(-1);
		if (last && last.from === t) last.exercises = exercises;
		else versions.push({ from: t, exercises });
		habit.routine = versions;
		this.saveHabit(habit);
	}

	archiveHabit(id: string, archived = true) {
		const h = this.data.habits.find((x) => x.id === id);
		if (h) h.archived = archived;
		this.persist();
	}

	// --- Danse ---

	saveDanceClass(c: DanceClass) {
		const i = this.data.danceClasses.findIndex((x) => x.id === c.id);
		if (i >= 0) this.data.danceClasses[i] = c;
		else this.data.danceClasses.push(c);
		this.persist();
	}

	removeDanceClass(id: string) {
		this.data.danceClasses = this.data.danceClasses.filter((c) => c.id !== id);
		this.persist();
	}

	toggleCancelled(classId: string, date: ISODate) {
		const c = this.data.danceClasses.find((x) => x.id === classId);
		if (!c) return;
		const i = c.cancelled.indexOf(date);
		if (i >= 0) c.cancelled.splice(i, 1);
		else c.cancelled.push(date);
		this.persist();
	}

	saveParty(p: DanceParty) {
		const i = this.data.danceParties.findIndex((x) => x.id === p.id);
		if (i >= 0) this.data.danceParties[i] = p;
		else this.data.danceParties.push(p);
		this.persist();
	}

	removeParty(id: string) {
		this.data.danceParties = this.data.danceParties.filter((p) => p.id !== id);
		this.persist();
	}

	saveVacation(v: Vacation) {
		const i = this.data.vacations.findIndex((x) => x.id === v.id);
		if (i >= 0) this.data.vacations[i] = v;
		else this.data.vacations.push(v);
		this.persist();
	}

	removeVacation(id: string) {
		this.data.vacations = this.data.vacations.filter((v) => v.id !== id);
		this.persist();
	}

	logDance(refId: string, label: string, styles: DanceStyle[], kind: HabitKind, date: ISODate, tier: Tier) {
		const existing = this.data.danceLogs.find((l) => l.refId === refId && l.date === date);
		if (existing) this.unlogDance(existing.id);
		const id = uid();
		this.data.danceLogs.push({ id, refId, date, tier });
		const xp = actionXp(DANCE_XP_DIFFICULTY, tier, discipline(this.data, date));
		const m = GAUGES.motivation;
		this.event({
			date,
			source: `dance:${id}`,
			label,
			xp: splitXp(xp, styles.map((s) => ({ domainId: s, weight: 1 }))),
			gauge: { motivation: kind === 'obligatory' ? m.obligatoryDone : m.bonusDone }
		});
		this.persist();
	}

	unlogDance(logId: string) {
		this.data.danceLogs = this.data.danceLogs.filter((l) => l.id !== logId);
		this.dropEvents(`dance:${logId}`);
		this.persist();
	}

	// --- Campagnes ---

	saveCampaign(c: Campaign) {
		const i = this.data.campaigns.findIndex((x) => x.id === c.id);
		if (i >= 0) this.data.campaigns[i] = c;
		else this.data.campaigns.push(c);
		this.persist();
	}

	removeCampaign(id: string) {
		this.data.campaigns = this.data.campaigns.filter((c) => c.id !== id);
		this.persist();
	}

	toggleQuest(campaign: Campaign, chapterId: string, questId: string) {
		const chapter = campaign.chapters.find((c) => c.id === chapterId);
		const quest = chapter?.quests.find((q) => q.id === questId);
		if (!chapter || !quest) return;
		const date = today();
		const d = discipline(this.data, date);
		if (quest.done) {
			quest.done = undefined;
			this.dropEvents(`quest:${quest.id}`);
			if (chapter.done) {
				chapter.done = undefined;
				this.dropEvents(`chapter:${chapter.id}`);
			}
		} else {
			quest.done = date;
			this.event({
				date,
				source: `quest:${quest.id}`,
				label: `${quest.boss ? 'Boss vaincu' : 'Quête'} : ${quest.name}`,
				xp: [{ domainId: campaign.domainId, amount: bonusXp(quest.xp, d) }],
				gauge: { motivation: GAUGES.motivation.questDone },
				campaignId: campaign.id
			});
			if (chapter.quests.every((q) => q.done)) {
				chapter.done = date;
				this.event({
					date,
					source: `chapter:${chapter.id}`,
					label: `Chapitre terminé : ${chapter.name}`,
					xp: [{ domainId: campaign.domainId, amount: bonusXp(XP_REWARDS.chapter, d) }],
					gauge: { inspiration: GAUGES.inspiration.chapterDone },
					campaignId: campaign.id
				});
			}
		}
		this.persist();
	}

	toggleCampaignDone(campaign: Campaign) {
		if (campaign.done) {
			campaign.done = undefined;
			campaign.status = 'active';
			this.dropEvents(`campaign:${campaign.id}`);
		} else {
			const date = today();
			campaign.done = date;
			campaign.status = 'done';
			this.event({
				date,
				source: `campaign:${campaign.id}`,
				label: `Campagne terminée : ${campaign.name}`,
				xp: [{ domainId: campaign.domainId, amount: XP_REWARDS.campaign }],
				gauge: { inspiration: GAUGES.inspiration.campaignDone },
				campaignId: campaign.id
			});
		}
		this.persist();
	}

	// --- Tâches ---

	saveTask(t: Task) {
		const i = this.data.tasks.findIndex((x) => x.id === t.id);
		if (i >= 0) this.data.tasks[i] = t;
		else this.data.tasks.push(t);
		this.persist();
	}

	removeTask(id: string) {
		this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
		this.dropEvents(`task:${id}`);
		this.persist();
	}

	toggleTask(task: Task) {
		if (task.done) {
			task.done = undefined;
			this.dropEvents(`task:${task.id}`);
		} else {
			const date = today();
			task.done = date;
			const campaign = this.data.campaigns.find((c) =>
				c.chapters.some((ch) => ch.quests.some((q) => q.id === task.questId))
			);
			this.event({
				date,
				source: `task:${task.id}`,
				label: `Tâche : ${task.title}`,
				xp: [{ domainId: campaign?.domainId ?? '', amount: XP_REWARDS.task }],
				campaignId: campaign?.id
			});
		}
		this.persist();
	}

	// --- Revue ---

	addReview(r: Review) {
		this.data.reviews.push(r);
		this.event({
			date: r.createdAt,
			source: `review:${r.id}`,
			label: r.type === 'weekly' ? 'Revue hebdo' : 'Revue mensuelle',
			xp: [{ domainId: '', amount: r.type === 'weekly' ? XP_REWARDS.weeklyReview : XP_REWARDS.monthlyReview }],
			gauge: { inspiration: GAUGES.inspiration.weeklyReview }
		});
		this.persist();
	}

	// --- Données ---

	exportJson(): string {
		return JSON.stringify(this.data, null, 2);
	}

	importJson(json: string) {
		const parsed = JSON.parse(json) as AppData;
		if (parsed.version !== 1 || !Array.isArray(parsed.habits)) throw new Error('Fichier non reconnu');
		this.data = parsed;
		this.persist();
	}

	reset() {
		const t = today();
		this.data = { ...seed(t), lastProcessedDay: addDays(t, -1) };
		this.persist();
	}
}

export const store = new Store();
