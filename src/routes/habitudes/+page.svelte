<script lang="ts">
	import { formatShort, today, WEEKDAYS_SHORT } from '#lib/dates.ts';
	import { DIFFICULTY_LABEL, MOMENT_LABEL } from '#lib/labels.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { Difficulty, Exercise, Habit, Moment } from '#lib/types.ts';

	const data = $derived(store.data);
	const active = $derived(data.habits.filter((h) => !h.archived));
	const archived = $derived(data.habits.filter((h) => h.archived));
	const domains = $derived(data.domains);

	let form = $state<Habit | null>(null);
	let routineFor = $state<Habit | null>(null);
	let exercises = $state<Exercise[]>([]);
	let sessionsText = $state('');

	const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
	const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? id;

	function newHabit(): Habit {
		return {
			id: uid(),
			name: '',
			form: 'simple',
			kind: 'obligatory',
			frequency: { type: 'daily' },
			tiers: { min: '', normal: '', excellent: '' },
			moment: 'day',
			difficulty: 'medium',
			domains: [{ domainId: 'sport', weight: 100 }],
			createdAt: today()
		};
	}

	function edit(h?: Habit) {
		form = h ? clone(h) : newHabit();
		sessionsText = (form.sessions ?? []).join(', ');
	}

	function freqLabel(h: Habit) {
		const f = h.frequency;
		if (f.type === 'daily') return 'Tous les jours';
		if (f.type === 'weekly') return `${f.times}x / semaine`;
		return f.days.map((d) => WEEKDAYS_SHORT[d]).join(', ');
	}

	function setFreqType(type: 'daily' | 'weekly' | 'days') {
		if (!form) return;
		form.frequency = type === 'daily' ? { type } : type === 'weekly' ? { type, times: 3 } : { type, days: [1, 3, 5] };
	}

	function toggleDay(d: number) {
		if (form?.frequency.type !== 'days') return;
		const days = form.frequency.days;
		form.frequency.days = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort();
	}

	function setSecondary(id: string) {
		if (!form) return;
		const first = form.domains[0];
		if (!id) form.domains = [{ domainId: first.domainId, weight: 100 }];
		else form.domains = [{ domainId: first.domainId, weight: Math.min(first.weight, 70) }, { domainId: id, weight: 100 - Math.min(first.weight, 70) }];
	}

	function setPrimaryWeight(w: number) {
		if (!form || form.domains.length < 2) return;
		form.domains[0].weight = w;
		form.domains[1].weight = 100 - w;
	}

	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!form) return;
		if (form.form === 'program') form.sessions = sessionsText.split(',').map((s) => s.trim()).filter(Boolean);
		if (form.form === 'routine' && !form.routine) form.routine = [{ from: today(), exercises: [] }];
		store.saveHabit(form);
		form = null;
	}

	function openRoutine(h: Habit) {
		routineFor = h;
		exercises = clone(h.routine?.at(-1)?.exercises ?? []);
	}

	function move(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= exercises.length) return;
		[exercises[i], exercises[j]] = [exercises[j], exercises[i]];
	}
</script>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-xl font-bold">Habitudes et routines</h1>
	<button class="btn btn-primary" onclick={() => edit()}>+ Habitude</button>
</div>

{#if form}
	<form class="card mb-5 grid gap-3 sm:grid-cols-3" onsubmit={save}>
		<div class="sm:col-span-2">
			<label class="label" for="h-name">Nom</label>
			<input id="h-name" class="input" bind:value={form.name} required />
		</div>
		<div>
			<label class="label" for="h-form">Forme</label>
			<select id="h-form" class="input" bind:value={form.form}>
				<option value="simple">Habitude simple</option>
				<option value="routine">Routine (liste d'exercices)</option>
				<option value="program">Programme (séances types)</option>
			</select>
		</div>
		<div>
			<label class="label" for="h-kind">Type</label>
			<select id="h-kind" class="input" bind:value={form.kind}>
				<option value="obligatory">Obligatoire</option>
				<option value="bonus">Bonus (ne coûte jamais rien)</option>
			</select>
		</div>
		<div>
			<label class="label" for="h-freq">Fréquence</label>
			<select
				id="h-freq"
				class="input"
				value={form.frequency.type}
				onchange={(e) => setFreqType(e.currentTarget.value as 'daily' | 'weekly' | 'days')}
			>
				<option value="daily">Tous les jours</option>
				<option value="weekly">X fois par semaine</option>
				<option value="days">Jours fixes</option>
			</select>
		</div>
		<div>
			{#if form.frequency.type === 'weekly'}
				<label class="label" for="h-times">Fois par semaine</label>
				<input id="h-times" class="input" type="number" min="1" max="7" bind:value={form.frequency.times} />
			{:else if form.frequency.type === 'days'}
				<span class="label">Jours</span>
				<div class="flex flex-wrap gap-1">
					{#each [1, 2, 3, 4, 5, 6, 0] as d (d)}
						<button
							type="button"
							class="btn px-2 py-1 text-xs {form.frequency.days.includes(d) ? 'btn-primary' : ''}"
							onclick={() => toggleDay(d)}>{WEEKDAYS_SHORT[d]}</button
						>
					{/each}
				</div>
			{/if}
		</div>
		<div>
			<label class="label" for="h-min">Palier minimum</label>
			<input id="h-min" class="input" bind:value={form.tiers.min} placeholder="ex. 5 min" />
		</div>
		<div>
			<label class="label" for="h-normal">Palier normal</label>
			<input id="h-normal" class="input" bind:value={form.tiers.normal} />
		</div>
		<div>
			<label class="label" for="h-exc">Palier excellent</label>
			<input id="h-exc" class="input" bind:value={form.tiers.excellent} />
		</div>
		<div>
			<label class="label" for="h-moment">Moment</label>
			<select id="h-moment" class="input" bind:value={form.moment}>
				{#each Object.entries(MOMENT_LABEL) as [k, v] (k)}<option value={k as Moment}>{v}</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="h-slot">Créneau agenda (optionnel)</label>
			<input id="h-slot" class="input" type="time" bind:value={form.slot} />
		</div>
		<div>
			<label class="label" for="h-diff">Difficulté</label>
			<select id="h-diff" class="input" bind:value={form.difficulty}>
				{#each Object.entries(DIFFICULTY_LABEL) as [k, v] (k)}<option value={k as Difficulty}>{v}</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="h-dom">Stat principale</label>
			<select id="h-dom" class="input" bind:value={form.domains[0].domainId}>
				{#each domains as d (d.id)}<option value={d.id}>{d.name} ({d.stat})</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="h-dom2">Stat secondaire</label>
			<select id="h-dom2" class="input" value={form.domains[1]?.domainId ?? ''} onchange={(e) => setSecondary(e.currentTarget.value)}>
				<option value="">Aucune</option>
				{#each domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
			</select>
		</div>
		<div>
			{#if form.domains.length > 1}
				<label class="label" for="h-w">Répartition : {form.domains[0].weight} % / {form.domains[1].weight} %</label>
				<input id="h-w" class="w-full" type="range" min="10" max="90" step="10" value={form.domains[0].weight} oninput={(e) => setPrimaryWeight(+e.currentTarget.value)} />
			{/if}
		</div>
		<div>
			<label class="label" for="h-camp">Campagne liée</label>
			<select id="h-camp" class="input" bind:value={form.campaignId}>
				<option value={undefined}>Aucune</option>
				{#each data.campaigns as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
			</select>
		</div>
		{#if form.form === 'program'}
			<div class="sm:col-span-2">
				<label class="label" for="h-sessions">Séances types (séparées par des virgules)</label>
				<input id="h-sessions" class="input" bind:value={sessionsText} placeholder="Push, Pull, Legs" />
			</div>
		{/if}
		<div class="flex gap-2 sm:col-span-3">
			<button class="btn btn-primary">Enregistrer</button>
			<button type="button" class="btn" onclick={() => (form = null)}>Annuler</button>
		</div>
	</form>
{/if}

{#if routineFor}
	<div class="card mb-5">
		<h2 class="h2 mb-1">Exercices : {routineFor.name}</h2>
		<p class="mb-3 text-xs text-zinc-500">
			Modifier la liste crée une nouvelle version datée ; l'historique garde les anciennes
			({routineFor.routine?.length ?? 0} version(s), dernière du {formatShort(routineFor.routine?.at(-1)?.from ?? today())}).
		</p>
		<ul class="mb-3 flex flex-col gap-2">
			{#each exercises as ex, i (ex.id)}
				<li class="flex gap-2">
					<input class="input" placeholder="Exercice" bind:value={ex.name} />
					<input class="input w-36" placeholder="30 s, 3x10…" bind:value={ex.detail} />
					<button class="btn px-2" onclick={() => move(i, -1)} aria-label="Monter">↑</button>
					<button class="btn px-2" onclick={() => move(i, 1)} aria-label="Descendre">↓</button>
					<button class="btn px-2" onclick={() => exercises.splice(i, 1)} aria-label="Supprimer">✕</button>
				</li>
			{/each}
		</ul>
		<div class="flex gap-2">
			<button class="btn" onclick={() => exercises.push({ id: uid(), name: '', detail: '' })}>+ Exercice</button>
			<button
				class="btn btn-primary"
				onclick={() => {
					store.saveRoutine(routineFor!, exercises.filter((e) => e.name.trim()));
					routineFor = null;
				}}>Enregistrer</button
			>
			<button class="btn" onclick={() => (routineFor = null)}>Fermer</button>
		</div>
	</div>
{/if}

<div class="flex flex-col gap-2">
	{#each active as h (h.id)}
		<div class="card flex flex-wrap items-center justify-between gap-2">
			<div>
				<div class="font-medium">
					{h.name}
					{#if h.kind === 'bonus'}<span class="ml-1 rounded bg-amber-100 px-1.5 text-[10px] text-amber-800">bonus</span>{/if}
				</div>
				<div class="text-xs text-zinc-500">
					{freqLabel(h)} · {MOMENT_LABEL[h.moment]} · {DIFFICULTY_LABEL[h.difficulty]} ·
					{h.domains.map((d) => `${domainName(d.domainId)}${h.domains.length > 1 ? ' ' + d.weight + '%' : ''}`).join(', ')}
					{#if h.form === 'routine'}· {h.routine?.at(-1)?.exercises.length ?? 0} exercice(s){/if}
					{#if h.form === 'program'}· {(h.sessions ?? []).join(', ')}{/if}
				</div>
			</div>
			<div class="flex gap-2">
				{#if h.form === 'routine'}<button class="btn text-xs" onclick={() => openRoutine(h)}>Exercices</button>{/if}
				<button class="btn text-xs" onclick={() => edit(h)}>Modifier</button>
				<button class="btn text-xs" onclick={() => store.archiveHabit(h.id)}>Archiver</button>
			</div>
		</div>
	{/each}
</div>

{#if archived.length}
	<h2 class="mt-6 mb-2 text-sm font-semibold text-zinc-500">Archivées</h2>
	<div class="flex flex-col gap-2">
		{#each archived as h (h.id)}
			<div class="card flex items-center justify-between opacity-60">
				<span>{h.name}</span>
				<button class="btn text-xs" onclick={() => store.archiveHabit(h.id, false)}>Réactiver</button>
			</div>
		{/each}
	</div>
{/if}
