<script lang="ts">
	import { GAUGES } from '#lib/config.ts';

	let { discipline, motivation, inspiration }: { discipline: number; motivation: number; inspiration: number } =
		$props();

	const rows = $derived([
		{ name: 'Discipline', value: discipline, color: 'bg-zinc-800', hint: `XP ×${(1 + discipline / 100).toFixed(2)}` },
		{
			name: 'Motivation',
			value: motivation,
			color: 'bg-orange-500',
			hint: motivation < GAUGES.minimumModeBelow ? 'Mode minimum conseillé' : ''
		},
		{
			name: 'Inspiration',
			value: inspiration,
			color: 'bg-violet-500',
			hint: inspiration >= GAUGES.momentumFrom ? 'Élan disponible (V2)' : ''
		}
	]);
</script>

<div class="grid gap-3 sm:grid-cols-3">
	{#each rows as g (g.name)}
		<div>
			<div class="mb-1 flex justify-between text-xs">
				<span class="font-medium">{g.name}</span>
				<span class="text-zinc-500">{g.value}</span>
			</div>
			<div class="h-2 overflow-hidden rounded-full bg-zinc-200">
				<div class="h-full {g.color}" style="width: {g.value}%"></div>
			</div>
			{#if g.hint}<div class="mt-1 text-[11px] text-zinc-500">{g.hint}</div>{/if}
		</div>
	{/each}
</div>
