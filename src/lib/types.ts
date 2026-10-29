// Modèle de données de la V0 (stockage local). Voir docs/cahier-des-charges.md, section « Modèle de données ».

export type ISODate = string; // 'YYYY-MM-DD'
export type Time = string; // 'HH:MM'

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Tier = 'min' | 'normal' | 'excellent';
export type Moment = 'morning' | 'day' | 'evening';
export type HabitKind = 'obligatory' | 'bonus';
export type HabitForm = 'simple' | 'routine' | 'program';
export type DanceStyle = 'salsa' | 'bachata' | 'kizomba';

export type Frequency =
	| { type: 'daily' }
	| { type: 'weekly'; times: number } // X fois par semaine, jours libres
	| { type: 'days'; days: number[] }; // jours fixes, 0 = dimanche … 6 = samedi

export interface Domain {
	id: string;
	name: string;
	stat: string;
	color: string;
	parentId?: string; // sous-compétence
}

export interface DomainShare {
	domainId: string;
	weight: number; // en %, total 100
}

export interface Exercise {
	id: string;
	name: string;
	detail?: string; // ex. « 30 s », « 3 x 10 »
}

export interface RoutineVersion {
	from: ISODate;
	exercises: Exercise[];
}

export interface Habit {
	id: string;
	name: string;
	form: HabitForm;
	kind: HabitKind;
	frequency: Frequency;
	tiers: Record<Tier, string>;
	moment: Moment;
	slot?: Time; // créneau par défaut dans l'agenda
	difficulty: Difficulty;
	domains: DomainShare[];
	campaignId?: string;
	routine?: RoutineVersion[]; // forme routine : versions datées
	sessions?: string[]; // forme programme : séances types (A, B, C…)
	createdAt: ISODate;
	archived?: boolean;
}

export interface HabitLog {
	id: string;
	habitId: string;
	date: ISODate;
	tier: Tier;
	doneExercises?: string[];
	session?: string;
	note?: string;
}

// Paramétrage danse
export interface DanceClass {
	id: string;
	style: DanceStyle;
	weekday: number; // 0 = dimanche
	time: Time;
	durationMin: number;
	place?: string;
	kind: HabitKind;
	cancelled: ISODate[]; // séances annulées ponctuellement
}

export interface DanceParty {
	id: string;
	date: ISODate;
	time: Time;
	place?: string;
	styles: DanceStyle[];
	note?: string;
}

export interface Vacation {
	id: string;
	label: string;
	start: ISODate;
	end: ISODate;
}

export interface DanceLog {
	id: string;
	refId: string; // id du cours ou de la soirée
	date: ISODate;
	tier: Tier;
}

export type CampaignStatus = 'active' | 'paused' | 'done';

export interface Quest {
	id: string;
	name: string;
	xp: number;
	boss?: boolean;
	due?: ISODate;
	done?: ISODate;
}

export interface Chapter {
	id: string;
	name: string;
	quests: Quest[];
	done?: ISODate;
}

export interface Campaign {
	id: string;
	name: string;
	intent: string;
	domainId: string;
	status: CampaignStatus;
	target?: ISODate;
	chapters: Chapter[];
	done?: ISODate;
}

export type TaskList = 'today' | 'week' | 'month' | 'someday';

export interface Task {
	id: string;
	title: string;
	list: TaskList;
	date?: ISODate;
	start?: Time;
	end?: Time;
	questId?: string;
	done?: ISODate;
}

export interface Review {
	id: string;
	type: 'weekly' | 'monthly';
	periodStart: ISODate;
	createdAt: ISODate;
	worked: string;
	stuck: string;
	adjust: string;
	priorities: string[];
	snapshot: { xp: number; discipline: number; motivation: number; inspiration: number; successRate: number };
}

export type Gauge = 'motivation' | 'inspiration';

// Journal de tout ce qui modifie la progression : les totaux sont recalculés à partir de lui.
export interface ProgressEvent {
	id: string;
	at: string; // horodatage ISO, pour l'ordre
	date: ISODate;
	source: string; // ex. 'habit:<logId>', 'quest:<id>', 'day:<date>'
	label: string;
	xp?: { domainId: string; amount: number }[];
	gauge?: Partial<Record<Gauge, number>>;
	campaignId?: string; // progression sur une campagne (pour l'Inspiration)
}

export interface AppData {
	version: 1;
	domains: Domain[];
	habits: Habit[];
	habitLogs: HabitLog[];
	danceClasses: DanceClass[];
	danceParties: DanceParty[];
	vacations: Vacation[];
	danceLogs: DanceLog[];
	campaigns: Campaign[];
	tasks: Task[];
	reviews: Review[];
	events: ProgressEvent[];
	restDays: ISODate[];
	minimumModeDays: ISODate[];
	lastProcessedDay?: ISODate;
}
