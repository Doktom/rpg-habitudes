// Vaisseau : butin, matériaux, orbite hebdomadaire, coût des améliorations, points de compétence.
import { LOOT_BASE, LOOT_REWARDS, MODULE_MAX_LEVEL } from '../config';
import { addDays, startOfWeek } from '../dates';
import { SECTORS, SHIP_CLASSES, SHIP_MODULES } from '../universe';
import type { AppData, Difficulty, ISODate, Loot, Material, ModuleId } from '../types';
import { costFactor, moduleLevel, orbitBonus } from './effects';
import { obligationsOn, totalXp } from './progress';
import { isRestDay } from './schedule';
import { levelInfo } from './xp';

export const MATERIAL_IDS: Material[] = ['metal', 'energy', 'crystal'];

export function scaleLoot(loot: Loot, factor: number): Loot {
	const out: Loot = {};
	for (const m of MATERIAL_IDS) {
		const v = Math.round((loot[m] ?? 0) * factor);
		if (v > 0) out[m] = v;
	}
	return out;
}

export function addLoot(a: Loot, b: Loot): Loot {
	const out: Loot = {};
	for (const m of MATERIAL_IDS) {
		const v = (a[m] ?? 0) + (b[m] ?? 0);
		if (v) out[m] = v;
	}
	return out;
}

export function negate(loot: Loot): Loot {
	const out: Loot = {};
	for (const m of MATERIAL_IDS) if (loot[m]) out[m] = -(loot[m] as number);
	return out;
}

// Butin d'une action : base de la difficulté × facteur du palier.
export const lootFor = (difficulty: Difficulty, factor = 1): Loot => scaleLoot(LOOT_BASE[difficulty], factor);

export function materials(data: AppData): Record<Material, number> {
	const total: Record<Material, number> = { metal: 0, energy: 0, crystal: 0 };
	for (const e of data.events) for (const m of MATERIAL_IDS) total[m] += e.loot?.[m] ?? 0;
	return total;
}

export const canAfford = (balance: Record<Material, number>, cost: Loot) => MATERIAL_IDS.every((m) => balance[m] >= (cost[m] ?? 0));

// Coût du prochain niveau d'un module, ou null s'il est au maximum.
export function upgradeCost(data: AppData, id: ModuleId): Loot | null {
	const next = moduleLevel(data, id) + 1;
	if (next > MODULE_MAX_LEVEL) return null;
	const def = SHIP_MODULES.find((m) => m.id === id)!;
	const base: Loot = { metal: 20 * next, energy: 8 * next, crystal: next >= 2 ? Math.ceil(1.5 * (next - 1)) : 0 };
	const out: Loot = {};
	for (const m of MATERIAL_IDS) {
		const v = Math.ceil((base[m] ?? 0) * def.costFactor * costFactor(data));
		if (v > 0) out[m] = v;
	}
	return out;
}

export const moduleTotal = (data: AppData) => SHIP_MODULES.reduce((s, m) => s + moduleLevel(data, m.id), 0);

export function shipClass(data: AppData): string {
	const total = moduleTotal(data);
	return [...SHIP_CLASSES].reverse().find((c) => total >= c.from)!.name;
}

// 1 point de compétence par niveau de pilote gagné, dépensé niveau par niveau.
export function skillPoints(data: AppData): number {
	const spent = Object.values(data.skills ?? {}).reduce((s, n) => s + (n ?? 0), 0);
	return levelInfo(totalXp(data)).level - 1 - spent;
}

// --- Orbite : la semaine vue comme sept secteurs ---

export type SectorState = 'lit' | 'rest' | 'partial' | 'today' | 'missed' | 'future';

export interface Sector {
	date: ISODate;
	name: string;
	state: SectorState;
	done: number;
	expected: number;
}

// Un secteur est « allumé » quand toutes les obligations du jour sont faites ; un jour de repos compte aussi.
export function orbit(data: AppData, dateInWeek: ISODate, asOf: ISODate): Sector[] {
	const start = startOfWeek(dateInWeek);
	return SECTORS.map((s, i) => {
		const date = addDays(start, i);
		const { expected, done } = obligationsOn(data, date);
		let state: SectorState;
		if (date > asOf) state = 'future';
		else if (isRestDay(data, date)) state = 'rest';
		else if (expected === 0 || done === expected) state = 'lit';
		else if (date === asOf) state = 'today';
		else state = done / expected >= 0.5 ? 'partial' : 'missed';
		return { date, name: s.name, state, done, expected };
	});
}

export const sectorsLit = (sectors: Sector[]) => sectors.filter((s) => s.state === 'lit' || s.state === 'rest').length;

// Un secteur à moitié fait (au moins la moitié des obligations) compte pour la moitié d'un secteur allumé.
export const sectorPoints = (sectors: Sector[]) => sectorsLit(sectors) + 0.5 * sectors.filter((s) => s.state === 'partial').length;

// Butin versé à l'amarrage (revue hebdo) : par secteur allumé, un bonus si l'orbite est parfaite.
export function orbitReward(data: AppData, sectors: Sector[]): Loot {
	let loot = scaleLoot(LOOT_REWARDS.orbitSector, sectorPoints(sectors) * orbitBonus(data));
	if (sectorsLit(sectors) === 7) loot = addLoot(loot, scaleLoot(LOOT_REWARDS.orbitPerfect, orbitBonus(data)));
	return loot;
}
