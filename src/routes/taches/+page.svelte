<script lang="ts">
	import { formatShort, today } from '#lib/dates.ts';
	import { DIFFICULTY_LABEL, lootLabel } from '#lib/labels.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { Difficulty, Task, TaskList } from '#lib/types.ts';

	const data = $derived(store.data);

	const LISTS: { id: TaskList; label: string }[] = [
		{ id: 'today', label: "Aujourd'hui" },
		{ id: 'week', label: 'Cette semaine' },
		{ id: 'month', label: 'Ce mois-ci' },
		{ id: 'someday', label: 'Un jour' }
	];
	const EFFORTS = Object.entries(DIFFICULTY_LABEL) as [Difficulty, string][];

	let title = $state('');
	let list = $state<TaskList>('today');
	let domainId = $state('');
	let effort = $state<Difficulty>('easy');
	let filter = $state('');
	let showDone = $state(false);
	let openId = $state<string | null>(null);
	let newSub = $state<Record<string, string>>({});

	const domainName = (id?: string) => data.domains.find((d) => d.id === id)?.name;
	const domainColor = (id?: string) => data.domains.find((d) => d.id === id)?.color ?? '#a1a1aa';
	const visible = $derived(data.tasks.filter((t) => !filter || t.domainId === filter));
	const open = (l: TaskList) =>
		visible.filter((t) => t.list === l && !t.done).sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'));
	const done = $derived(visible.filter((t) => t.done).sort((a, b) => (b.done ?? '').localeCompare(a.done ?? '')));
	const subProgress = (t: Task) => `${t.subtasks?.filter((s) => s.done).length ?? 0}/${t.subtasks?.length ?? 0}`;

	function add(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		const id = uid();
		store.saveTask({ id, title: title.trim(), list, date: list === 'today' ? today() : undefined, domainId: domainId || undefined, effort });
		title = '';
		openId = id;
	}

	function move(t: Task, to: TaskList) {
		t.list = to;
		t.date = to === 'today' ? today() : undefined;
		t.start = undefined;
		t.end = undefined;
		store.persist();
	}

	function addSub(t: Task) {
		const text = (newSub[t.id] ?? '').trim();
		if (!text) return;
		(t.subtasks ??= []).push({ id: uid(), title: text });
		newSub[t.id] = '';
		store.persist();
	}

	function removeSub(t: Task, id: string) {
		t.subtasks = t.subtasks?.filter((s) => s.id !== id);
		store.persist();
	}
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
	<h1 class="text-xl font-bold">À faire</h1>
	<select class="input w-auto" bind:value={filter} aria-label="Filtrer par catégorie">
		<option value="">Toutes les catégories</option>
		{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
	</select>
</div>

<form class="card mb-2 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" onsubmit={add}>
	<input class="input" placeholder="Nouvelle tâche…" bind:value={title} aria-label="Nouvelle tâche" />
	<select class="input" bind:value={list} aria-label="Liste">
		{#each LISTS as l (l.id)}<option value={l.id}>{l.label}</option>{/each}
	</select>
	<select class="input" bind:value={effort} aria-label="Effort">
		{#each EFFORTS as [k, v] (k)}<option value={k}>{v}</option>{/each}
	</select>
	<select class="input" bind:value={domainId} aria-label="Catégorie">
		<option value="">Sans catégorie</option>
		{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
	</select>
	<button class="btn btn-primary">Ajouter</button>
</form>
<p class="mb-5 text-xs text-zinc-500">
	Chaque tâche terminée rapporte de l'XP et des matériaux selon son effort. Clique sur une tâche pour la détailler : note, échéance, sous-tâches. Les tâches de la semaine et du mois
	apparaissent aussi dans la todo d'Aujourd'hui.
</p>

<div class="grid gap-4 md:grid-cols-2">
	{#each LISTS as l (l.id)}
		<section>
			<h2 class="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">{l.label} · {open(l.id).length}</h2>
			<div class="flex flex-col gap-2">
				{#each open(l.id) as t (t.id)}
					{@const reward = store.taskReward(t.effort)}
					<div class="card p-0">
						<div class="flex items-center gap-2 p-2.5 text-sm">
							<input type="checkbox" checked={false} onchange={() => store.toggleTask(t)} aria-label="Terminer {t.title}" />
							<button class="min-w-0 flex-1 truncate text-left" onclick={() => (openId = openId === t.id ? null : t.id)} aria-expanded={openId === t.id}>
								{t.title}
							</button>
							{#if t.subtasks?.length}<span class="text-xs text-zinc-500" title="Sous-tâches">☰ {subProgress(t)}</span>{/if}
							{#if t.due}<span class="text-xs {t.due < today() ? 'font-medium text-rose-600' : 'text-zinc-500'}">⏱ {formatShort(t.due)}</span>{/if}
							{#if t.domainId}
								<span class="flex items-center gap-1 text-xs text-zinc-500">
									<span class="h-2 w-2 rounded-full" style="background:{domainColor(t.domainId)}"></span>{domainName(t.domainId)}
								</span>
							{/if}
						</div>
						{#if openId === t.id}
							<div class="grid gap-3 border-t border-zinc-100 p-3 sm:grid-cols-2">
								<div class="sm:col-span-2">
									<label class="label" for="t-title-{t.id}">Titre</label>
									<input id="t-title-{t.id}" class="input" bind:value={t.title} onchange={() => store.persist()} />
								</div>
								<div class="sm:col-span-2">
									<label class="label" for="t-note-{t.id}">Détails</label>
									<textarea id="t-note-{t.id}" class="input h-20" bind:value={t.note} onchange={() => store.persist()} placeholder="Contexte, étapes, liens…"></textarea>
								</div>
								<div>
									<label class="label" for="t-effort-{t.id}">Effort</label>
									<select id="t-effort-{t.id}" class="input" bind:value={t.effort} onchange={() => store.persist()}>
										{#each EFFORTS as [k, v] (k)}<option value={k}>{v}</option>{/each}
									</select>
									<p class="mt-1 text-xs text-zinc-500">Rapporte {reward.xp} XP · {lootLabel(reward.loot).replaceAll('+', '')}</p>
								</div>
								<div>
									<label class="label" for="t-due-{t.id}">Échéance</label>
									<input id="t-due-{t.id}" class="input" type="date" bind:value={t.due} onchange={() => store.persist()} />
								</div>
								<div>
									<label class="label" for="t-dom-{t.id}">Catégorie</label>
									<select id="t-dom-{t.id}" class="input" bind:value={t.domainId} onchange={() => store.persist()}>
										<option value={undefined}>Sans catégorie</option>
										{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
									</select>
								</div>
								<div>
									<label class="label" for="t-list-{t.id}">Liste</label>
									<select id="t-list-{t.id}" class="input" value={t.list} onchange={(e) => move(t, e.currentTarget.value as TaskList)}>
										{#each LISTS as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
									</select>
								</div>
								<div class="sm:col-span-2">
									<span class="label">Sous-tâches {t.subtasks?.length ? subProgress(t) : ''}</span>
									<ul class="mb-2 flex flex-col gap-1">
										{#each t.subtasks ?? [] as s (s.id)}
											<li class="flex items-center gap-2 text-sm">
												<input type="checkbox" bind:checked={s.done} onchange={() => store.persist()} aria-label="Sous-tâche {s.title}" />
												<span class="flex-1 {s.done ? 'text-zinc-400 line-through' : ''}">{s.title}</span>
												<button class="btn px-2 py-0.5 text-xs" onclick={() => removeSub(t, s.id)} aria-label="Supprimer {s.title}">✕</button>
											</li>
										{/each}
									</ul>
									<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), addSub(t))}>
										<input class="input" placeholder="Ajouter une sous-tâche…" bind:value={newSub[t.id]} />
										<button class="btn">+</button>
									</form>
								</div>
								<div class="flex justify-between sm:col-span-2">
									<button class="btn text-xs" onclick={() => (openId = null)}>Fermer</button>
									<button class="btn text-xs" onclick={() => store.removeTask(t.id)}>Supprimer la tâche</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="card text-sm text-zinc-500">Rien ici.</div>
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
