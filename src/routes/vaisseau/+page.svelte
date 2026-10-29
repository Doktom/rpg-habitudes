<script lang="ts">
	import Orbit from '#lib/components/Orbit.svelte';
	import { MODULE_MAX_LEVEL, SKILL_MAX_LEVEL } from '#lib/config.ts';
	import { formatShort, today } from '#lib/dates.ts';
	import { moduleLevel, skillLevel } from '#lib/engine/effects.ts';
	import {
		canAfford,
		MATERIAL_IDS,
		materials,
		moduleTotal,
		orbit,
		orbitReward,
		sectorsLit,
		shipClass,
		skillPoints,
		upgradeCost
	} from '#lib/engine/ship.ts';
	import { TROPHIES } from '#lib/engine/trophies.ts';
	import { lootLabel } from '#lib/labels.ts';
	import { store } from '#lib/store.svelte.ts';
	import { INTRO, MATERIALS, PLANET_NAME, SHIP_MODULES, SHIP_NAME, SKILLS } from '#lib/universe.ts';

	const data = $derived(store.data);
	const stock = $derived(materials(data));
	const points = $derived(Math.max(0, skillPoints(data)));
	const sectors = $derived(orbit(data, today(), today()));
	const unlocked = $derived(TROPHIES.filter((t) => data.trophies[t.id]).length);
</script>

<div class="mb-4 flex flex-wrap items-end justify-between gap-2">
	<div>
		<h1 class="text-xl font-bold">{SHIP_NAME}</h1>
		<p class="text-sm text-zinc-500">
			Classe <strong class="text-zinc-800">{shipClass(data)}</strong> · en orbite autour de {PLANET_NAME} · modules {moduleTotal(data)}/{SHIP_MODULES.length * MODULE_MAX_LEVEL}
		</p>
	</div>
</div>

<p class="mb-4 text-sm text-zinc-600">{INTRO}</p>

<h2 class="h2 mb-2">Soute</h2>
<div class="card mb-5 grid grid-cols-3 gap-3 text-center">
	{#each MATERIAL_IDS as m (m)}
		<div title={MATERIALS[m].lore}>
			<div class="text-2xl">{MATERIALS[m].glyph}</div>
			<div class="text-xl font-semibold">{stock[m]}</div>
			<div class="text-xs text-zinc-500">{MATERIALS[m].name}</div>
		</div>
	{/each}
</div>

<h2 class="h2 mb-2">Orbite de la semaine</h2>
<div class="card mb-5">
	<Orbit {sectors} current={today()} />
	<p class="mt-3 text-xs text-zinc-500">
		Un secteur s'allume quand toutes les obligations du jour sont faites (un jour de repos compte aussi) ; à moitié fait, il compte pour un demi-secteur. {sectorsLit(sectors)}/7 allumés pour l'instant :
		l'amarrage au Havre (revue hebdo) verserait <strong class="text-zinc-700">{lootLabel(orbitReward(data, sectors)) || 'rien encore'}</strong>, avec un bonus si les sept sont allumés.
	</p>
</div>

<h2 class="h2 mb-2">Modules du vaisseau</h2>
<div class="mb-5 grid gap-3 sm:grid-cols-2">
	{#each SHIP_MODULES as m (m.id)}
		{@const level = moduleLevel(data, m.id)}
		{@const cost = upgradeCost(data, m.id)}
		<div class="card">
			<div class="flex items-baseline justify-between">
				<div class="font-semibold">{m.name}</div>
				<span class="rounded bg-zinc-100 px-1.5 text-[10px] text-zinc-600">{m.role}</span>
			</div>
			<p class="mb-2 text-xs text-zinc-500">{m.lore}</p>
			<div class="mb-1 flex gap-1" aria-label="Niveau {level} sur {MODULE_MAX_LEVEL}">
				{#each Array(MODULE_MAX_LEVEL) as _, i (i)}
					<span class="h-2 flex-1 rounded {i < level ? 'bg-indigo-500' : 'bg-zinc-200'}"></span>
				{/each}
			</div>
			<div class="text-sm">{level ? m.effect(level) : 'Hors service'}</div>
			{#if cost}
				<div class="mt-1 text-xs text-zinc-500">Niveau {level + 1} : {m.effect(level + 1)}</div>
				<div class="mt-2 flex items-center justify-between gap-2">
					<span class="text-xs text-zinc-600">{lootLabel(cost).replaceAll('+', '')}</span>
					<button class="btn text-xs" disabled={!canAfford(stock, cost)} onclick={() => store.upgradeModule(m.id)}>Améliorer</button>
				</div>
			{:else}
				<div class="mt-2 text-xs font-medium text-indigo-700">Niveau maximum</div>
			{/if}
		</div>
	{/each}
</div>

<h2 class="h2 mb-1">Compétences du pilote</h2>
<p class="mb-2 text-xs text-zinc-500">1 point par niveau de pilote gagné. Points disponibles : <strong class="text-zinc-800">{points}</strong></p>
<div class="mb-5 grid gap-3 sm:grid-cols-2">
	{#each SKILLS as s (s.id)}
		{@const level = skillLevel(data, s.id)}
		<div class="card">
			<div class="font-semibold">{s.name}</div>
			<p class="mb-2 text-xs text-zinc-500">{s.lore}</p>
			<div class="mb-1 flex gap-1" aria-label="Niveau {level} sur {SKILL_MAX_LEVEL}">
				{#each Array(SKILL_MAX_LEVEL) as _, i (i)}
					<span class="h-2 flex-1 rounded {i < level ? 'bg-amber-400' : 'bg-zinc-200'}"></span>
				{/each}
			</div>
			<div class="text-sm">{level ? s.effect(level) : 'Non apprise'}</div>
			{#if level < SKILL_MAX_LEVEL}
				<div class="mt-1 text-xs text-zinc-500">Niveau {level + 1} : {s.effect(level + 1)}</div>
				<div class="mt-2 text-right">
					<button class="btn text-xs" disabled={points < 1} onclick={() => store.buySkill(s.id)}>Apprendre (1 point)</button>
				</div>
			{:else}
				<div class="mt-2 text-xs font-medium text-amber-700">Niveau maximum</div>
			{/if}
		</div>
	{/each}
</div>

<h2 class="h2 mb-2">Trophées · {unlocked}/{TROPHIES.length}</h2>
<div class="mb-6 grid gap-2 sm:grid-cols-2">
	{#each TROPHIES as t (t.id)}
		{@const date = data.trophies[t.id]}
		<div class="card py-3 {date ? '' : 'opacity-60'}">
			<div class="flex items-baseline justify-between gap-2">
				<div class="font-medium">{date ? '★' : '☆'} {t.name}</div>
				{#if date}<span class="text-xs text-zinc-500">{formatShort(date)}</span>{/if}
			</div>
			<div class="text-xs text-zinc-500">{date ? t.lore : t.hint}</div>
			<div class="mt-1 text-[11px] text-zinc-400">
				Récompense : {[t.reward.xp ? `${t.reward.xp} XP` : '', lootLabel(t.reward.loot)].filter(Boolean).join(' · ')}
			</div>
		</div>
	{/each}
</div>
