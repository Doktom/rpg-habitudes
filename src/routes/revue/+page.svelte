<script lang="ts">
	import { addDays, formatShort, range, startOfWeek, today } from '#lib/dates.ts';
	import { discipline, gaugeValue, obligationsOn, successRate, totalXp } from '#lib/engine/progress.ts';
	import { store, uid } from '#lib/store.svelte.ts';

	const data = $derived(store.data);
	// La revue du dimanche porte sur la semaine qui se termine.
	const weekStart = startOfWeek(today());
	const weekEnd = addDays(weekStart, 6);
	const days = range(weekStart, weekEnd);

	const stats = $derived({
		xp: totalXp(data, weekStart, weekEnd),
		discipline: discipline(data, today()),
		motivation: gaugeValue(data, 'motivation'),
		inspiration: gaugeValue(data, 'inspiration'),
		successRate: successRate(data, weekStart, today())
	});

	const perHabit = $derived(
		data.habits
			.filter((h) => !h.archived)
			.map((h) => ({ name: h.name, count: data.habitLogs.filter((l) => l.habitId === h.id && l.date >= weekStart && l.date <= weekEnd).length }))
	);
	const postponed = $derived(data.tasks.filter((t) => !t.done && t.date && t.date < today()));
	const doneThisWeek = $derived(data.reviews.some((r) => r.type === 'weekly' && r.periodStart === weekStart));

	let worked = $state('');
	let stuck = $state('');
	let adjust = $state('');
	let priorities = $state(['', '', '']);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		store.addReview({
			id: uid(),
			type: 'weekly',
			periodStart: weekStart,
			createdAt: today(),
			worked,
			stuck,
			adjust,
			priorities: priorities.filter((p) => p.trim()),
			snapshot: stats
		});
		for (const p of priorities.filter((x) => x.trim()))
			store.saveTask({ id: uid(), title: p.trim(), list: 'week' });
		worked = stuck = adjust = '';
		priorities = ['', '', ''];
	}
</script>

<h1 class="mb-1 text-xl font-bold">Revue hebdo</h1>
<p class="mb-4 text-sm text-zinc-500">Semaine du {formatShort(weekStart)} au {formatShort(weekEnd)} · environ 10 minutes · +50 XP et +25 Inspiration</p>

<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
	{#each [['XP gagnée', stats.xp], ['Réussite', stats.successRate + ' %'], ['Discipline', stats.discipline], ['Motivation', stats.motivation], ['Inspiration', stats.inspiration]] as [label, value] (label)}
		<div class="card p-3">
			<div class="text-xs text-zinc-500">{label}</div>
			<div class="text-xl font-semibold">{value}</div>
		</div>
	{/each}
</div>

<div class="mb-4 grid gap-3 sm:grid-cols-2">
	<div class="card">
		<h2 class="mb-2 text-sm font-semibold">Jour par jour (obligations)</h2>
		<ul class="flex flex-col gap-1 text-sm">
			{#each days as d (d)}
				{@const o = obligationsOn(data, d)}
				<li class="flex justify-between">
					<span>{formatShort(d)}</span>
					<span class="text-zinc-500">{d > today() ? '—' : o.expected ? `${o.done}/${o.expected}` : 'repos / rien'}</span>
				</li>
			{/each}
		</ul>
	</div>
	<div class="card">
		<h2 class="mb-2 text-sm font-semibold">Par habitude (cette semaine)</h2>
		<ul class="flex flex-col gap-1 text-sm">
			{#each perHabit as h (h.name)}
				<li class="flex justify-between"><span>{h.name}</span><span class="text-zinc-500">{h.count}</span></li>
			{/each}
		</ul>
		{#if postponed.length}
			<p class="mt-3 text-xs text-orange-700">{postponed.length} tâche(s) datée(s) non faite(s) : à replanifier ou abandonner.</p>
		{/if}
	</div>
</div>

{#if doneThisWeek}
	<p class="card mb-4 text-sm text-emerald-800">Revue de la semaine faite. Bravo.</p>
{:else}
	<form class="card mb-6 flex flex-col gap-3" onsubmit={submit}>
		<div>
			<label class="label" for="r-worked">Ce qui a marché</label>
			<textarea id="r-worked" class="input" rows="2" bind:value={worked}></textarea>
		</div>
		<div>
			<label class="label" for="r-stuck">Ce qui a coincé</label>
			<textarea id="r-stuck" class="input" rows="2" bind:value={stuck}></textarea>
		</div>
		<div>
			<label class="label" for="r-adjust">Ce que j'ajuste</label>
			<textarea id="r-adjust" class="input" rows="2" bind:value={adjust}></textarea>
		</div>
		<div>
			<span class="label">3 priorités pour la semaine prochaine (ajoutées à « Cette semaine »)</span>
			<div class="grid gap-2 sm:grid-cols-3">
				{#each priorities as _, i (i)}<input class="input" bind:value={priorities[i]} />{/each}
			</div>
		</div>
		<button class="btn btn-primary self-start">Valider la revue</button>
	</form>
{/if}

{#if data.reviews.length}
	<h2 class="h2 mb-2">Archive</h2>
	<div class="flex flex-col gap-2">
		{#each [...data.reviews].reverse() as r (r.id)}
			<details class="card">
				<summary class="cursor-pointer text-sm">
					Semaine du {formatShort(r.periodStart)} · {r.snapshot.xp} XP · réussite {r.snapshot.successRate} %
				</summary>
				<div class="mt-2 text-sm whitespace-pre-line">
					<p><strong>Marché :</strong> {r.worked || '—'}</p>
					<p><strong>Coincé :</strong> {r.stuck || '—'}</p>
					<p><strong>Ajusté :</strong> {r.adjust || '—'}</p>
					<p><strong>Priorités :</strong> {r.priorities.join(', ') || '—'}</p>
				</div>
			</details>
		{/each}
	</div>
{/if}
