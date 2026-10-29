<script lang="ts">
	import { today } from '#lib/dates.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { TaskList } from '#lib/types.ts';

	const data = $derived(store.data);

	const LISTS: { id: TaskList; label: string }[] = [
		{ id: 'today', label: "Aujourd'hui" },
		{ id: 'week', label: 'Cette semaine' },
		{ id: 'month', label: 'Ce mois-ci' },
		{ id: 'someday', label: 'Un jour' }
	];

	let title = $state('');
	let list = $state<TaskList>('today');
	let domainId = $state('');
	let filter = $state('');
	let showDone = $state(false);

	const domainName = (id?: string) => data.domains.find((d) => d.id === id)?.name;
	const domainColor = (id?: string) => data.domains.find((d) => d.id === id)?.color ?? '#a1a1aa';
	const visible = $derived(data.tasks.filter((t) => !filter || t.domainId === filter));
	const open = (l: TaskList) => visible.filter((t) => t.list === l && !t.done);
	const done = $derived(visible.filter((t) => t.done).sort((a, b) => (b.done ?? '').localeCompare(a.done ?? '')));

	function add(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		store.saveTask({ id: uid(), title: title.trim(), list, date: list === 'today' ? today() : undefined, domainId: domainId || undefined });
		title = '';
	}

	function move(id: string, to: TaskList) {
		const t = data.tasks.find((x) => x.id === id);
		if (!t) return;
		t.list = to;
		t.date = to === 'today' ? today() : undefined;
		t.start = undefined;
		t.end = undefined;
		store.saveTask(t);
	}
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
	<h1 class="text-xl font-bold">À faire</h1>
	<select class="input w-auto" bind:value={filter} aria-label="Filtrer par catégorie">
		<option value="">Toutes les catégories</option>
		{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
	</select>
</div>

<form class="card mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]" onsubmit={add}>
	<input class="input" placeholder="Nouvelle tâche…" bind:value={title} aria-label="Nouvelle tâche" />
	<select class="input" bind:value={list} aria-label="Liste">
		{#each LISTS as l (l.id)}<option value={l.id}>{l.label}</option>{/each}
	</select>
	<select class="input" bind:value={domainId} aria-label="Catégorie">
		<option value="">Sans catégorie</option>
		{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
	</select>
	<button class="btn btn-primary">Ajouter</button>
</form>

<div class="grid gap-4 md:grid-cols-2">
	{#each LISTS as l (l.id)}
		<section>
			<h2 class="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">{l.label} · {open(l.id).length}</h2>
			<div class="card flex flex-col gap-2">
				{#each open(l.id) as t (t.id)}
					<div class="flex items-center gap-2 text-sm">
						<input type="checkbox" checked={false} onchange={() => store.toggleTask(t)} aria-label="Terminer {t.title}" />
						<span class="min-w-0 flex-1 truncate">{t.title}</span>
						{#if t.domainId}
							<span class="flex items-center gap-1 text-xs text-zinc-500">
								<span class="h-2 w-2 rounded-full" style="background:{domainColor(t.domainId)}"></span>{domainName(t.domainId)}
							</span>
						{/if}
						<select class="rounded border border-zinc-200 text-xs" value={t.list} onchange={(e) => move(t.id, e.currentTarget.value as TaskList)} aria-label="Déplacer {t.title}">
							{#each LISTS as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
						</select>
						<button class="btn px-2 py-0.5 text-xs" onclick={() => store.removeTask(t.id)} aria-label="Supprimer {t.title}">✕</button>
					</div>
				{:else}
					<p class="text-sm text-zinc-500">Rien ici.</p>
				{/each}
			</div>
		</section>
	{/each}
</div>

<div class="mt-6">
	<button class="btn text-xs" onclick={() => (showDone = !showDone)}>{showDone ? 'Masquer' : 'Voir'} les terminées ({done.length})</button>
	{#if showDone}
		<div class="card mt-2 flex flex-col gap-2">
			{#each done as t (t.id)}
				<div class="flex items-center gap-2 text-sm text-zinc-400">
					<input type="checkbox" checked onchange={() => store.toggleTask(t)} aria-label="Rouvrir {t.title}" />
					<span class="flex-1 line-through">{t.title}</span>
					<button class="btn px-2 py-0.5 text-xs" onclick={() => store.removeTask(t.id)} aria-label="Supprimer {t.title}">✕</button>
				</div>
			{:else}
				<p class="text-sm text-zinc-500">Aucune tâche terminée.</p>
			{/each}
		</div>
	{/if}
</div>
