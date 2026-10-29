import { LEVEL_BASE, LEVEL_EXPONENT, TIER_FACTOR, XP_BASE } from '../config';
import type { Difficulty, DomainShare, Tier } from '../types';

// XP = base × palier × (1 + Discipline/100)
export function actionXp(difficulty: Difficulty, tier: Tier, discipline: number): number {
	return Math.round(XP_BASE[difficulty] * TIER_FACTOR[tier] * (1 + discipline / 100));
}

export function bonusXp(base: number, discipline: number): number {
	return Math.round(base * (1 + discipline / 100));
}

export function xpToNext(level: number): number {
	return Math.round(LEVEL_BASE * Math.pow(level, LEVEL_EXPONENT));
}

export interface LevelInfo {
	level: number;
	into: number; // XP acquise dans le niveau courant
	needed: number; // XP nécessaire pour passer au suivant
}

export function levelInfo(totalXp: number): LevelInfo {
	let level = 1;
	let rest = Math.max(0, totalXp);
	while (rest >= xpToNext(level)) {
		rest -= xpToNext(level);
		level++;
	}
	return { level, into: rest, needed: xpToNext(level) };
}

// Répartit un montant d'XP entre domaines selon leurs poids ; l'arrondi est absorbé par le premier.
export function splitXp(amount: number, shares: DomainShare[]): { domainId: string; amount: number }[] {
	if (shares.length === 0) return [{ domainId: '', amount }];
	const total = shares.reduce((s, x) => s + x.weight, 0) || 1;
	const parts = shares.map((s) => ({ domainId: s.domainId, amount: Math.floor((amount * s.weight) / total) }));
	parts[0].amount += amount - parts.reduce((s, p) => s + p.amount, 0);
	return parts;
}
