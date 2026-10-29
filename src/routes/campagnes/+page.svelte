<script lang="ts">
	import ConfirmButton from '#lib/components/ConfirmButton.svelte';
	import { formatShort } from '#lib/dates.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { Campaign, CampaignStatus } from '#lib/types.ts';

	const data = $derived(store.data);
	let selectedId = $state<string | null>(null);
	const selected = $derived(data.campaigns.find((c) => c.id === selectedId) ?? null);

	let newCampaign = $state<Campaign | null>(null);
	let newChapter = $state('');
	let questForm = $state<{ chapterId: string; name: string; xp: number; boss: boolean } | null>(null);
	let taskDraft = $state<Record<string, string>>({});

	const STATUS: Record<CampaignStatus, string> = { active: 'Active', paused: 'En pause', done: 'Terminée' };

	function progress(c: Campaign) {
		const quests = c.chapters.flatMap((ch) => ch.quests);
		const done = c.chapters.filter((ch) => ch.done).length;
		return {
			chapters: `${done}/${c.chapters.length} chapitres`,
			pct: quests.length ? Math.round((100 * quests.filter((q) => q.done).length) / quests.length) : 0
		};
	}

	function addQuest(c: Campaign) {
		const d = questForm;
		if (!d || !d.name.trim()) return;
		const ch = c.chapters.find((x) => x.id === d.chapterId)!;
		ch.quests.push({ id: uid(), name: d.name.trim(), xp: d.xp, boss: d.boss });
		ch.done = undefined;
		store.saveCampaign(c);
		questForm = null;
	}

	function addTask(questId: string) {
		const title = taskDraft[questId]?.trim();
		if (!title) return;
		store.saveTask({ id: uid(), title, list: 'week', questId });
		taskDraft[questId] = '';
	}

	// Un chapitre est verrouillé tant que le précédent n'est pas terminé.
	const locked = (c: Campaign, i: number) => i > 0 && !c.chapters[i - 1].done;
</script>

{#if !selected}
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-bold">Campagnes</h1>
		<button
			class="btn btn-primary"
			onclick={() =>
				(newCampaign = { id: uid(), name: '', intent: '', domainId: 'projets', status: 'active', chapters: [] })}
			>+ Campagne</button
		>
	</div>

	{#if newCampaign}
		<form
			class="card mb-4 grid gap-3 sm:grid-cols-2"
			onsubmit={(e) => {
				e.preventDefault();
				store.saveCampaign(newCampaign!);
				selectedId = newCampaign!.id;
				newCampaign = null;
			}}
		>
			<div>
				<label class="label" for="c-name">Nom</label>
				<input id="c-name" class="input" bind:value={newCampaign.name} required />
			</div>
			<div>
				<label class="label" for="c-dom">Stat</label>
				<select id="c-dom" class="input" bind:value={newCampaign.domainId}>
					{#each data.domains as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
				</select>
			</div>
			<div class="sm:col-span-2">
				<label class="label" for="c-intent">Intention (le fil rouge)</label>
				<input id="c-intent" class="input" bind:value={newCampaign.intent} />
			</div>
			<div class="flex gap-2">
				<button class="btn btn-primary">Créer</button>
				<button type="button" class="btn" onclick={() => (newCampaign = null)}>Annuler</button>
			</div>
		</form>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2">
		{#each data.campaigns as c (c.id)}
			{@const p = progress(c)}
			<button class="card text-left hover:border-zinc-400" onclick={() => (selectedId = c.id)}>
				<div class="flex items-start justify-between gap-2">
					<div class="font-semibold">{c.name}</div>
					<span class="rounded bg-zinc-100 px-1.5 text-[11px] text-zinc-600">{STATUS[c.status]}</span>
				</div>
				<p class="mt-1 text-sm text-zinc-500">{c.intent}</p>
				<div class="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">
					<div class="h-full bg-zinc-800" style="width: {p.pct}%"></div>
				</div>
				<div class="mt-1 text-xs text-zinc-500">{p.chapters} · {p.pct} % des quêtes</div>
			</button>
		{/each}
	</div>
{:else}
	{@const c = selected}
	<button class="mb-3 text-sm text-zinc-500 underline" onclick={() => (selectedId = null)}>← Toutes les campagnes</button>
	<div class="mb-4 flex flex-wrap items-start justify-between gap-2">
		<div>
			<h1 class="text-xl font-bold">{c.name}</h1>
			<p class="text-sm text-zinc-500">{c.intent}</p>
		</div>
		<div class="flex gap-2">
			{#if c.status !== 'done'}
				<button
					class="btn text-xs"
					onclick={() => {
						c.status = c.status === 'paused' ? 'active' : 'paused';
						store.saveCampaign(c);
					}}>{c.status === 'paused' ? 'Reprendre' : 'Mettre en pause'}</button
				>
			{/if}
			<button class="btn text-xs" onclick={() => store.toggleCampaignDone(c)}>
				{c.done ? 'Rouvrir' : 'Terminer la campagne'}
			</button>
			<ConfirmButton
				label="Supprimer"
				onconfirm={() => {
					store.removeCampaign(c.id);
					selectedId = null;
				}}
			/>
		</div>
	</div>

	<ol class="flex flex-col gap-3">
		{#each c.chapters as ch, i (ch.id)}
			{@const isLocked = locked(c, i)}
			<li class="card {ch.done ? 'border-emerald-300' : ''} {isLocked ? 'opacity-60' : ''}">
				<div class="mb-2 flex items-center justify-between gap-2">
					<div class="font-semibold">
						Ch. {i + 1} — {ch.name}
						{#if ch.done}<span class="ml-1 text-xs font-normal text-emerald-700">terminé le {formatShort(ch.done)}</span>{/if}
						{#if isLocked}<span class="ml-1 text-xs font-normal text-zinc-500">verrouillé</span>{/if}
					</div>
					<button
						class="text-xs text-zinc-400 hover:text-zinc-700"
						onclick={() => {
							c.chapters.splice(i, 1);
							store.saveCampaign(c);
						}}>Supprimer</button
					>
				</div>
				<ul class="flex flex-col gap-2">
					{#each ch.quests as q (q.id)}
						{@const tasks = data.tasks.filter((t) => t.questId === q.id)}
						<li class="rounded-lg border border-zinc-100 p-2">
							<label class="flex items-center gap-2 text-sm">
								<input type="checkbox" checked={!!q.done} disabled={isLocked} onchange={() => store.toggleQuest(c, ch.id, q.id)} />
								<span class={q.done ? 'text-zinc-400 line-through' : ''}>{q.name}</span>
								{#if q.boss}<span class="rounded bg-red-100 px-1.5 text-[10px] text-red-700">boss</span>{/if}
								<span class="ml-auto text-xs text-zinc-500">{q.xp} XP</span>
							</label>
							<ul class="mt-1 ml-6 flex flex-col gap-1">
								{#each tasks as t (t.id)}
									<li>
										<label class="flex items-center gap-2 text-xs">
											<input type="checkbox" checked={!!t.done} onchange={() => store.toggleTask(t)} />
											<span class={t.done ? 'text-zinc-400 line-through' : ''}>{t.title}</span>
										</label>
									</li>
								{/each}
								{#if !q.done}
									<li>
										<form class="flex gap-1" onsubmit={(e) => (e.preventDefault(), addTask(q.id))}>
											<input class="input py-0.5 text-xs" placeholder="+ tâche (part dans « Cette semaine »)" bind:value={taskDraft[q.id]} />
										</form>
									</li>
								{/if}
							</ul>
						</li>
					{/each}
				</ul>
				{#if questForm?.chapterId === ch.id}
					<form class="mt-2 flex flex-wrap gap-2" onsubmit={(e) => (e.preventDefault(), addQuest(c))}>
						<!-- svelte-ignore a11y_autofocus -->
						<input class="input min-w-40 flex-1" placeholder="Nouvelle quête" bind:value={questForm.name} autofocus />
						<input class="input w-20" type="number" min="10" step="10" bind:value={questForm.xp} title="XP" />
						<label class="flex items-center gap-1 text-xs"><input type="checkbox" bind:checked={questForm.boss} /> boss</label>
						<button class="btn btn-primary">Ajouter</button>
						<button type="button" class="btn" onclick={() => (questForm = null)}>Annuler</button>
					</form>
				{:else if !ch.done}
					<button class="btn mt-2 text-xs" onclick={() => (questForm = { chapterId: ch.id, name: '', xp: 100, boss: false })}>+ Quête</button>
				{/if}
			</li>
		{/each}
	</ol>

	<form
		class="mt-4 flex gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			if (!newChapter.trim()) return;
			c.chapters.push({ id: uid(), name: newChapter.trim(), quests: [] });
			store.saveCampaign(c);
			newChapter = '';
		}}
	>
		<input class="input" placeholder="Nouveau chapitre" bind:value={newChapter} />
		<button class="btn">+ Chapitre</button>
	</form>
{/if}
