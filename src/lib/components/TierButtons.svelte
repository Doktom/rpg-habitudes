<script lang="ts">
	import { TIER_LABEL } from '#lib/labels.ts';
	import type { Tier } from '#lib/types.ts';

	let {
		current,
		minimumOnly = false,
		titles,
		onpick,
		onclear
	}: {
		current?: Tier;
		minimumOnly?: boolean;
		titles?: Record<Tier, string>;
		onpick: (t: Tier) => void;
		onclear: () => void;
	} = $props();

	const tiers = $derived<Tier[]>(minimumOnly ? ['min'] : ['min', 'normal', 'excellent']);
</script>

<div class="flex flex-wrap gap-1">
	{#each tiers as t (t)}
		<button
			class="btn px-2 py-1 text-xs {current === t ? 'btn-primary' : ''}"
			title={titles?.[t]}
			onclick={() => (current === t ? onclear() : onpick(t))}
		>
			{current === t ? '✓ ' : ''}{TIER_LABEL[t]}
		</button>
	{/each}
</div>
