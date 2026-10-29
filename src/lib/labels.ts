import type { DanceStyle, Difficulty, Loot, Moment, Tier } from './types';
import { MATERIALS } from './universe';

export const TIER_LABEL: Record<Tier, string> = { min: 'Min', normal: 'Normal', excellent: 'Excellent' };
export const MOMENT_LABEL: Record<Moment, string> = { morning: 'Matin', day: 'Journée', evening: 'Soir' };
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Facile', medium: 'Moyenne', hard: 'Difficile' };
export const DANCE_LABEL: Record<DanceStyle, string> = { salsa: 'Salsa', bachata: 'Bachata', kizomba: 'Kizomba' };
export const DANCE_STYLES: DanceStyle[] = ['salsa', 'bachata', 'kizomba'];

// « 2 Alliage · 1 Cellule », ou '' s'il n'y a rien.
export function lootLabel(loot?: Loot): string {
	if (!loot) return '';
	return (['metal', 'energy', 'crystal'] as const)
		.filter((m) => loot[m])
		.map((m) => `${loot[m]! > 0 ? '+' : ''}${loot[m]} ${MATERIALS[m].name}`)
		.join(' · ');
}
