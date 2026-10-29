<script lang="ts">
	import type { Sector, SectorState } from '#lib/engine/ship.ts';

	let { sectors, current, compact = false }: { sectors: Sector[]; current: string; compact?: boolean } = $props();

	const GLYPH: Record<SectorState, string> = { lit: '●', rest: '◌', partial: '◐', today: '◉', missed: '○', future: '·' };
	const COLOR: Record<SectorState, string> = {
		lit: 'text-amber-500',
		rest: 'text-sky-400',
		partial: 'text-amber-400',
		today: 'text-zinc-900',
		missed: 'text-rose-400',
		future: 'text-zinc-300'
	};
	const LABEL: Record<SectorState, string> = {
		lit: 'allumé',
		rest: 'repos',
		partial: 'à moitié',
		today: 'en cours',
		missed: 'manqué',
		future: 'à venir'
	};
</script>

<div class="flex items-end justify-between gap-1">
	{#each sectors as s (s.date)}
		<div class="flex flex-1 flex-col items-center" title="{s.name} : {LABEL[s.state]}{s.expected ? ` (${s.done}/${s.expected})` : ''}">
			<span class="h-4 text-xs text-indigo-600 {s.date === current ? '' : 'invisible'}" aria-label="Position du vaisseau">➤</span>
			<span class="text-xl leading-6 {COLOR[s.state]}">{GLYPH[s.state]}</span>
			<span class="text-[10px] text-zinc-500">{s.name}</span>
			{#if !compact}<span class="text-[10px] text-zinc-400">{LABEL[s.state]}</span>{/if}
		</div>
	{/each}
</div>
