// Effets des modules du vaisseau et des compétences du pilote. Pas d'import du moteur de progression (évite un cycle).
import { EFFECTS, GAUGES, TIER_FACTOR } from '../config';
import type { AppData, ModuleId, SkillId, Tier } from '../types';

export const moduleLevel = (d: AppData, id: ModuleId): number => d.ship?.modules?.[id] ?? 0;
export const skillLevel = (d: AppData, id: SkillId): number => d.skills?.[id] ?? 0;

export const xpBonus = (d: AppData) => 1 + EFFECTS.reactorXp * moduleLevel(d, 'reactor');
export const inspirationBonus = (d: AppData) => 1 + EFFECTS.antennaInspiration * moduleLevel(d, 'antenna');
export const orbitBonus = (d: AppData) => 1 + EFFECTS.thrustersOrbit * moduleLevel(d, 'thrusters');
export const taskBonus = (d: AppData) => 1 + EFFECTS.logisticsTask * skillLevel(d, 'logistics');
export const costFactor = (d: AppData) => 1 - EFFECTS.engineeringCost * skillLevel(d, 'engineering');

// Négatif : Motivation perdue par obligation ratée.
export const missPenalty = (d: AppData) =>
	Math.round(GAUGES.motivation.obligatoryMissed * (1 - EFFECTS.hullShield * moduleLevel(d, 'hull')));

export const pullRatio = (d: AppData) => GAUGES.motivation.dailyPullRatio + EFFECTS.recoveryPull * skillLevel(d, 'recovery');

export const tierFactor = (d: AppData, tier: Tier) =>
	tier === 'min' ? TIER_FACTOR.min + EFFECTS.enduranceMin * skillLevel(d, 'endurance') : TIER_FACTOR[tier];
