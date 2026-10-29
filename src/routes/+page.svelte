<script lang="ts">
	import Gauges from '#lib/components/Gauges.svelte';
	import TierButtons from '#lib/components/TierButtons.svelte';
	import { GAUGES } from '#lib/config.ts';
	import { addDays, formatLong, today } from '#lib/dates.ts';
	import { discipline, gaugeValue, totalXp } from '#lib/engine/progress.ts';
	import { danceClassesOn, habitsForDay, logsInWeek, partiesOn, routineOn } from '#lib/engine/schedule.ts';
	import { levelInfo } from '#lib/engine/xp.ts';
	import { DANCE_LABEL, MOMENT_LABEL } from '#lib/labels.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { Habit, Moment } from '#lib/types.ts';

	let date = $state(today());
	const data = $derived(store.data);

	const isToday = $derived(date === today());
	const restDay = $derived(data.restDays.includes(date));
	const minimumMode = $derived(data.minimumModeDays.includes(date));
	const disc = $derived(discipline(data, date));
	const motivation = $derived(gaugeValue(data, 'motivation'));
	const inspiration = $derived(gaugeValue(data, 'inspiration'));
	const level = $derived(levelInfo(totalXp(data)));
	const xpDay = $derived(totalXp(data, date, date));
	const dayEvents = $derived(data.events.filter((e) => e.date === date && e.xp?.length));

	const habits = $derived(habitsForDay(data, date));
	const classes = $derived(danceClassesOn(data, date));
	const parties = $derived(partiesOn(data, date));
	const tasks = $derived(
		data.tasks.filter((t) => (t.date ? t.date === date : t.list === 'today' && isToday))
	);

	const moments: Moment[] = ['morning', 'day', 'evening'];

	// État local des routines et séances avant validation
	let checked = $state<Record<string, string[]>>({});
	let sessionPick = $state<Record<string, string>>({});
	let open = $state<Record<string, boolean>>({});
	let newTask = $state('');

	const logOf = (h: Habit) => data.habitLogs.find((l) => l.habitId === h.id && l.date === date);

	function toggleExercise(habitId: string, exId: string) {
		const list = checked[habitId] ?? [];
		checked[habitId] = list.includes(exId) ? list.filter((x) => x !== exId) : [...list, exId];
	}

	function addTask() {
		if (!newTask.trim()) return;
		store.saveTask({ id: uid(), title: newTask.trim(), list: 'today', date });
		newTask = '';
	}
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
	<div>
		<div class="flex items-center gap-2">
			<button class="btn px-2" onclick={() => (date = addDays(date, -1))} aria-label="Jour précédent">‹</button>
			<h1 class="text-xl font-bold capitalize">{formatLong(date)}</h1>
			<button class="btn px-2" onclick={() => (date = addDays(date, 1))} aria-label="Jour suivant">›</button>
			{#if !isToday}<button class="btn text-xs" onclick={() => (date = today())}>Aujourd'hui</button>{/if}
		</div>
		<p class="mt-1 text-sm text-zinc-500">
			Niveau {level.level} · {level.into}/{level.needed} XP · <strong class="text-zinc-800">+{xpDay} XP</strong> ce jour
		</p>
	</div>
	<div class="flex gap-2">
		<button class="btn text-xs {minimumMode ? 'btn-primary' : ''}" onclick={() => store.toggleMinimumMode(date)}>
			Mode minimum
		</button>
		<button class="btn text-xs {restDay ? 'btn-primary' : ''}" onclick={() => store.toggleRestDay(date)}>
			Jour de repos
		</button>
	</div>
</div>

<div class="card mb-4">
	<Gauges discipline={disc} {motivation} {inspiration} />
	{#if motivation < GAUGES.minimumModeBelow && !minimumMode && isToday}
		<p class="mt-3 rounded-lg bg-orange-50 p-2 text-sm text-orange-800">
			Motivation basse : active le mode minimum, faire le minimum préserve ta Discipline.
		</p>
	{/if}
	{#if restDay}
		<p class="mt-3 rounded-lg bg-zinc-100 p-2 text-sm text-zinc-700">
			Jour de repos : rien n'est compté comme raté aujourd'hui.
		</p>
	{/if}
</div>

{#each moments as moment (moment)}
	{@const items = habits.filter((h) => h.moment === moment)}
	{@const danceHere = moment === 'evening'}
	{#if items.length || (danceHere && (classes.length || parties.length))}
		<section class="mb-5">
			<h2 class="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">{MOMENT_LABEL[moment]}</h2>
			<div class="flex flex-col gap-2">
				{#each items as h (h.id)}
					{@const log = logOf(h)}
					{@const routine = h.form === 'routine' ? routineOn(h, date) : undefined}
					<div class="card {log ? 'border-emerald-300 bg-emerald-50/40' : ''}">
						<div class="flex flex-wrap items-start justify-between gap-2">
							<div>
								<div class="font-medium">
									{h.name}
									{#if h.kind === 'bonus'}<span class="ml-1 rounded bg-amber-100 px-1.5 text-[10px] text-amber-800">bonus</span>{/if}
								</div>
								<div class="text-xs text-zinc-500">
									{#if h.frequency.type === 'weekly'}
										{@const n = logsInWeek(data, h.id, date).length}
										{n}/{h.frequency.times} cette semaine ·
									{/if}
									{log ? h.tiers[log.tier] : minimumMode ? h.tiers.min : h.tiers.normal}
									{#if log?.session}· {log.session}{/if}
								</div>
							</div>
							<div class="flex items-center gap-2">
								{#if h.form === 'program' && !log}
									<select class="input w-auto py-1 text-xs" bind:value={sessionPick[h.id]}>
										<option value={undefined}>Séance…</option>
										{#each h.sessions ?? [] as s (s)}<option value={s}>{s}</option>{/each}
									</select>
								{/if}
								<TierButtons
									current={log?.tier}
									minimumOnly={minimumMode && !log}
									titles={h.tiers}
									onpick={(t) =>
										store.logHabit(h, date, t, {
											session: sessionPick[h.id],
											doneExercises: checked[h.id]
										})}
									onclear={() => log && store.unlog(log.id)}
								/>
							</div>
						</div>
						{#if routine}
							<button class="mt-2 text-xs text-zinc-500 underline" onclick={() => (open[h.id] = !open[h.id])}>
								{open[h.id] ? 'Masquer' : 'Voir'} les exercices ({routine.exercises.length})
							</button>
							{#if open[h.id]}
								{#if routine.exercises.length === 0}
									<p class="mt-2 text-xs text-zinc-500">
										Aucun exercice pour l'instant : ajoute-les dans <a class="underline" href="#/habitudes">Habitudes</a>.
									</p>
								{:else}
									<ul class="mt-2 flex flex-col gap-1">
										{#each routine.exercises as ex (ex.id)}
											<li>
												<label class="flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={(log?.doneExercises ?? checked[h.id] ?? []).includes(ex.id)}
														disabled={!!log}
														onchange={() => toggleExercise(h.id, ex.id)}
													/>
													{ex.name}
													{#if ex.detail}<span class="text-xs text-zinc-500">{ex.detail}</span>{/if}
												</label>
											</li>
										{/each}
									</ul>
								{/if}
							{/if}
						{/if}
					</div>
				{/each}

				{#if danceHere}
					{#each classes as c (c.id)}
						{@const log = data.danceLogs.find((l) => l.refId === c.id && l.date === date)}
						<div class="card flex flex-wrap items-center justify-between gap-2 {log ? 'border-emerald-300 bg-emerald-50/40' : ''}">
							<div>
								<div class="font-medium">
									Cours de {DANCE_LABEL[c.style]}
									{#if c.kind === 'bonus'}<span class="ml-1 rounded bg-amber-100 px-1.5 text-[10px] text-amber-800">bonus</span>{/if}
								</div>
								<div class="text-xs text-zinc-500">{c.time} · {c.durationMin} min{c.place ? ' · ' + c.place : ''}</div>
							</div>
							<TierButtons
								current={log?.tier}
								onpick={(t) => store.logDance(c.id, `Cours de ${DANCE_LABEL[c.style]}`, [c.style], c.kind, date, t)}
								onclear={() => log && store.unlogDance(log.id)}
							/>
						</div>
					{/each}
					{#each parties as p (p.id)}
						{@const log = data.danceLogs.find((l) => l.refId === p.id && l.date === date)}
						<div class="card flex flex-wrap items-center justify-between gap-2 {log ? 'border-emerald-300 bg-emerald-50/40' : ''}">
							<div>
								<div class="font-medium">
									Soirée {p.styles.map((s) => DANCE_LABEL[s]).join(' / ')}
									<span class="ml-1 rounded bg-amber-100 px-1.5 text-[10px] text-amber-800">bonus</span>
								</div>
								<div class="text-xs text-zinc-500">{p.time}{p.place ? ' · ' + p.place : ''}{p.note ? ' · ' + p.note : ''}</div>
							</div>
							<TierButtons
								current={log?.tier}
								onpick={(t) => store.logDance(p.id, 'Soirée de danse', p.styles, 'bonus', date, t)}
								onclear={() => log && store.unlogDance(log.id)}
							/>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	{/if}
{/each}

<section class="mb-5">
	<h2 class="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">Tâches</h2>
	<div class="card flex flex-col gap-2">
		{#each tasks as t (t.id)}
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" checked={!!t.done} onchange={() => store.toggleTask(t)} />
				<span class={t.done ? 'text-zinc-400 line-through' : ''}>{t.title}</span>
				{#if t.start}<span class="text-xs text-zinc-500">{t.start}</span>{/if}
			</label>
		{:else}
			<p class="text-sm text-zinc-500">Aucune tâche pour ce jour.</p>
		{/each}
		<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), addTask())}>
			<input class="input" placeholder="Ajouter une tâche…" bind:value={newTask} />
			<button class="btn">Ajouter</button>
		</form>
	</div>
</section>

{#if dayEvents.length}
	<section>
		<h2 class="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">Gains du jour</h2>
		<ul class="card flex flex-col gap-1 text-sm">
			{#each dayEvents as e (e.id)}
				<li class="flex justify-between">
					<span>{e.label}</span>
					<span class="text-zinc-500">+{e.xp?.reduce((s, x) => s + x.amount, 0)} XP</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}
