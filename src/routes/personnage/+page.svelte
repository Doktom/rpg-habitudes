<script lang="ts">
	import Gauges from '#lib/components/Gauges.svelte';
	import { formatShort, today } from '#lib/dates.ts';
	import { discipline, gaugeValue, sortedEvents, totalXp, xpByDomain } from '#lib/engine/progress.ts';
	import { levelInfo } from '#lib/engine/xp.ts';
	import { store } from '#lib/store.svelte.ts';

	const data = $derived(store.data);
	const level = $derived(levelInfo(totalXp(data)));
	const byDomain = $derived(xpByDomain(data));
	const roots = $derived(data.domains.filter((d) => !d.parentId));
	const recent = $derived(sortedEvents(data.events).reverse().slice(0, 15));

	let fileInput = $state<HTMLInputElement>();

	function download() {
		const blob = new Blob([store.exportJson()], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `rpg-habitudes-${today()}.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	async function upload(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			store.importJson(await file.text());
		} catch (err) {
			alert('Import impossible : ' + (err as Error).message);
		}
	}
</script>

<h1 class="mb-4 text-xl font-bold">Personnage</h1>

<div class="card mb-4">
	<div class="flex items-end justify-between">
		<div>
			<div class="text-xs text-zinc-500">Niveau</div>
			<div class="text-4xl font-bold">{level.level}</div>
		</div>
		<div class="text-right text-sm text-zinc-500">{totalXp(data)} XP au total</div>
	</div>
	<div class="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-200">
		<div class="h-full bg-amber-400" style="width: {(100 * level.into) / level.needed}%"></div>
	</div>
	<div class="mt-1 text-xs text-zinc-500">{level.into} / {level.needed} XP vers le niveau {level.level + 1}</div>
</div>

<div class="card mb-4">
	<Gauges discipline={discipline(data, today())} motivation={gaugeValue(data, 'motivation')} inspiration={gaugeValue(data, 'inspiration')} />
</div>

<h2 class="h2 mb-2">Stats</h2>
<div class="mb-6 grid gap-3 sm:grid-cols-2">
	{#each roots as d (d.id)}
		{@const info = levelInfo(byDomain[d.id] ?? 0)}
		{@const children = data.domains.filter((c) => c.parentId === d.id)}
		<div class="card">
			<div class="flex items-center justify-between">
				<div>
					<span class="font-semibold">{d.stat}</span>
					<span class="text-xs text-zinc-500">· {d.name}</span>
				</div>
				<span class="text-sm font-semibold">niv. {info.level}</span>
			</div>
			<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
				<div class="h-full" style="width: {(100 * info.into) / info.needed}%; background: {d.color}"></div>
			</div>
			{#if children.length}
				<div class="mt-3 grid grid-cols-3 gap-2">
					{#each children as c (c.id)}
						{@const ci = levelInfo(byDomain[c.id] ?? 0)}
						<div>
							<div class="flex justify-between text-xs"><span>{c.name}</span><span>niv. {ci.level}</span></div>
							<div class="mt-1 h-1 overflow-hidden rounded-full bg-zinc-200">
								<div class="h-full" style="width: {(100 * ci.into) / ci.needed}%; background: {c.color}"></div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<h2 class="h2 mb-2">Journal de progression</h2>
<ul class="card mb-6 flex flex-col gap-1 text-sm">
	{#each recent as e (e.id)}
		{@const xp = e.xp?.reduce((s, x) => s + x.amount, 0) ?? 0}
		<li class="flex justify-between gap-2">
			<span><span class="text-xs text-zinc-400">{formatShort(e.date)}</span> {e.label}</span>
			<span class="shrink-0 text-xs text-zinc-500">
				{xp ? `+${xp} XP` : ''}
				{e.gauge?.motivation ? ` Motiv. ${e.gauge.motivation > 0 ? '+' : ''}${e.gauge.motivation}` : ''}
				{e.gauge?.inspiration ? ` Insp. ${e.gauge.inspiration > 0 ? '+' : ''}${e.gauge.inspiration}` : ''}
			</span>
		</li>
	{:else}
		<li class="text-zinc-500">Rien encore : valide une habitude dans Aujourd'hui.</li>
	{/each}
</ul>

<h2 class="h2 mb-2">Données</h2>
<div class="card flex flex-wrap gap-2">
	<button class="btn" onclick={download}>Exporter (JSON)</button>
	<button class="btn" onclick={() => fileInput?.click()}>Importer</button>
	<input bind:this={fileInput} type="file" accept="application/json" class="hidden" onchange={upload} />
	<button class="btn" onclick={() => confirm('Tout effacer et repartir de la configuration de départ ?') && store.reset()}>
		Réinitialiser
	</button>
	<p class="w-full text-xs text-zinc-500">
		V0 : les données vivent dans ce navigateur uniquement. Exporte-les régulièrement en attendant la synchro Supabase.
	</p>
</div>
