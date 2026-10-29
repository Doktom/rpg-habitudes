<script lang="ts">
	import { addDays, formatShort, range, startOfWeek, today, WEEKDAYS_SHORT, weekday } from '#lib/dates.ts';
	import { danceClassesOn, isDueOn, partiesOn } from '#lib/engine/schedule.ts';
	import { DANCE_LABEL } from '#lib/labels.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { ISODate, Task, TaskList } from '#lib/types.ts';

	const data = $derived(store.data);
	let weekStart = $state(startOfWeek(today()));
	const days = $derived(range(weekStart, addDays(weekStart, 6)));
	const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7 h → 23 h
	const ROW = 40; // px par heure

	const LISTS: { id: TaskList; label: string }[] = [
		{ id: 'today', label: "Aujourd'hui" },
		{ id: 'week', label: 'Cette semaine' },
		{ id: 'month', label: 'Ce mois-ci' },
		{ id: 'someday', label: 'Un jour' }
	];

	let newTask = $state<Record<TaskList, string>>({ today: '', week: '', month: '', someday: '' });
	let editing = $state<Task | null>(null);
	let dragId = $state<string | null>(null);

	const unscheduled = (list: TaskList) => data.tasks.filter((t) => t.list === list && !t.start && !t.done);

	const toMin = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
	const toTime = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

	interface Block {
		id: string;
		label: string;
		start: number;
		end: number;
		color: string;
		task?: Task;
	}

	function blocks(d: ISODate): Block[] {
		const out: Block[] = [];
		for (const c of danceClassesOn(data, d))
			out.push({ id: c.id, label: DANCE_LABEL[c.style], start: toMin(c.time), end: toMin(c.time) + c.durationMin, color: 'bg-pink-100 border-pink-300 text-pink-900' });
		for (const p of partiesOn(data, d))
			out.push({ id: p.id, label: 'Soirée ' + p.styles.map((s) => DANCE_LABEL[s]).join('/'), start: toMin(p.time), end: toMin(p.time) + 180, color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900' });
		for (const h of data.habits)
			if (h.slot && isDueOn(h, d))
				out.push({ id: h.id, label: h.name, start: toMin(h.slot), end: toMin(h.slot) + 30, color: 'bg-teal-50 border-teal-300 text-teal-900' });
		for (const t of data.tasks)
			if (t.date === d && t.start)
				out.push({ id: t.id, label: t.title, start: toMin(t.start), end: t.end ? toMin(t.end) : toMin(t.start) + 60, color: t.done ? 'bg-zinc-100 border-zinc-300 text-zinc-400 line-through' : 'bg-white border-zinc-400', task: t });
		return out;
	}

	function drop(d: ISODate, hour: number) {
		const t = data.tasks.find((x) => x.id === dragId);
		dragId = null;
		if (!t) return;
		const duration = t.start && t.end ? toMin(t.end) - toMin(t.start) : 60;
		t.date = d;
		t.start = toTime(hour * 60);
		t.end = toTime(hour * 60 + duration);
		store.saveTask(t);
	}

	function add(list: TaskList) {
		const title = newTask[list].trim();
		if (!title) return;
		store.saveTask({ id: uid(), title, list, date: list === 'today' ? today() : undefined });
		newTask[list] = '';
	}

	const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
	<h1 class="text-xl font-bold">Planning</h1>
	<div class="flex items-center gap-2">
		<button class="btn px-2" onclick={() => (weekStart = addDays(weekStart, -7))} aria-label="Semaine précédente">‹</button>
		<span class="text-sm">Semaine du {formatShort(weekStart)}</span>
		<button class="btn px-2" onclick={() => (weekStart = addDays(weekStart, 7))} aria-label="Semaine suivante">›</button>
		<button class="btn text-xs" onclick={() => (weekStart = startOfWeek(today()))}>Cette semaine</button>
	</div>
</div>

<p class="mb-3 text-xs text-zinc-500">
	Glisse une tâche de la liste vers un créneau de l'agenda (sur PC), ou clique sur une tâche pour lui donner une date et une heure.
</p>

{#if editing}
	<form
		class="card mb-4 grid gap-3 sm:grid-cols-5"
		onsubmit={(e) => {
			e.preventDefault();
			store.saveTask(editing!);
			editing = null;
		}}
	>
		<div class="sm:col-span-2">
			<label class="label" for="t-title">Tâche</label>
			<input id="t-title" class="input" bind:value={editing.title} />
		</div>
		<div>
			<label class="label" for="t-date">Date</label>
			<input id="t-date" class="input" type="date" bind:value={editing.date} />
		</div>
		<div>
			<label class="label" for="t-start">Début</label>
			<input id="t-start" class="input" type="time" bind:value={editing.start} />
		</div>
		<div>
			<label class="label" for="t-end">Fin</label>
			<input id="t-end" class="input" type="time" bind:value={editing.end} />
		</div>
		<div class="flex flex-wrap gap-2 sm:col-span-5">
			<button class="btn btn-primary">Enregistrer</button>
			<button
				type="button"
				class="btn"
				onclick={() => {
					editing!.start = undefined;
					editing!.end = undefined;
					store.saveTask(editing!);
					editing = null;
				}}>Retirer de l'agenda</button
			>
			<button
				type="button"
				class="btn"
				onclick={() => {
					store.removeTask(editing!.id);
					editing = null;
				}}>Supprimer</button
			>
			<button type="button" class="btn" onclick={() => (editing = null)}>Annuler</button>
		</div>
	</form>
{/if}

<div class="flex flex-col gap-4 lg:flex-row">
	<aside class="flex shrink-0 flex-col gap-3 lg:w-60">
		{#each LISTS as l (l.id)}
			<div class="card p-3">
				<h2 class="mb-2 text-sm font-semibold">{l.label}</h2>
				<ul class="mb-2 flex flex-col gap-1">
					{#each unscheduled(l.id) as t (t.id)}
						<li>
							<button
								draggable="true"
								ondragstart={() => (dragId = t.id)}
								onclick={() => (editing = clone(t))}
								class="w-full cursor-grab rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-left text-sm hover:border-zinc-400"
							>
								{t.title}
								{#if t.date}<span class="text-[11px] text-zinc-500">· {formatShort(t.date)}</span>{/if}
							</button>
						</li>
					{/each}
				</ul>
				<form onsubmit={(e) => (e.preventDefault(), add(l.id))}>
					<input class="input py-1 text-xs" placeholder="+ tâche" bind:value={newTask[l.id]} />
				</form>
			</div>
		{/each}
	</aside>

	<div class="card min-w-0 flex-1 overflow-x-auto p-2">
		<div class="grid min-w-[640px]" style="grid-template-columns: 40px repeat(7, minmax(0, 1fr));">
			<div></div>
			{#each days as d (d)}
				<div class="pb-2 text-center text-xs font-medium {d === today() ? 'text-zinc-900' : 'text-zinc-500'}">
					{WEEKDAYS_SHORT[weekday(d)]} {formatShort(d)}
					{#if data.restDays.includes(d)}<div class="text-[10px] text-zinc-400">repos</div>{/if}
				</div>
			{/each}

			<div class="relative" style="height: {HOURS.length * ROW}px">
				{#each HOURS as h, i (h)}
					<div class="absolute right-1 text-[10px] text-zinc-400" style="top: {i * ROW - 6}px">{h}h</div>
				{/each}
			</div>
			{#each days as d (d)}
				<div class="relative border-l border-zinc-100 {d === today() ? 'bg-amber-50/40' : ''}" style="height: {HOURS.length * ROW}px">
					{#each HOURS as h, i (h)}
						<div
							role="gridcell"
							tabindex="-1"
							class="absolute inset-x-0 border-t border-zinc-100"
							style="top: {i * ROW}px; height: {ROW}px"
							ondragover={(e) => e.preventDefault()}
							ondrop={() => drop(d, h)}
						></div>
					{/each}
					{#each blocks(d) as b (b.id)}
						{@const top = ((b.start - HOURS[0] * 60) / 60) * ROW}
						{@const height = Math.max(18, ((b.end - b.start) / 60) * ROW - 2)}
						{#if top >= 0}
							<button
								class="absolute inset-x-0.5 overflow-hidden rounded border px-1 text-left text-[11px] leading-tight {b.color}"
								style="top: {top}px; height: {height}px"
								draggable={!!b.task}
								ondragstart={() => b.task && (dragId = b.task.id)}
								onclick={() => b.task && (editing = clone(b.task))}
							>
								{b.label}
							</button>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>
