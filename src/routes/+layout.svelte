<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { store } from '#lib/store.svelte.ts';

	let { children } = $props();

	const nav = [
		{ href: '#/', label: "Aujourd'hui", icon: '☀' },
		{ href: '#/taches', label: 'À faire', icon: '☑' },
		{ href: '#/planning', label: 'Planning', icon: '▦' },
		{ href: '#/campagnes', label: 'Campagnes', icon: '⚑' },
		{ href: '#/personnage', label: 'Perso', icon: '♛' },
		{ href: '#/habitudes', label: 'Habitudes', icon: '↻' },
		{ href: '#/danse', label: 'Danse', icon: '♪' },
		{ href: '#/revue', label: 'Revue', icon: '✎' }
	];

	// Routage par hash (#/planning…) pour fonctionner sur n'importe quel hébergement statique.
	const active = (href: string) => page.route.id === href.slice(1);

	onMount(() => store.rollover());
</script>

<div class="min-h-screen md:flex">
	<aside class="sticky top-0 hidden h-screen w-52 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
		<div class="mb-6 text-lg font-bold">RPG Habitudes</div>
		<nav class="flex flex-col gap-1">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm {active(item.href)
						? 'bg-zinc-900 text-white'
						: 'text-zinc-700 hover:bg-zinc-100'}"
				>
					<span class="w-4 text-center">{item.icon}</span>{item.label}
				</a>
			{/each}
		</nav>
		<p class="mt-8 text-xs text-zinc-400">V0 prototype · données stockées dans ce navigateur</p>
	</aside>

	<main class="mx-auto w-full min-w-0 max-w-5xl px-4 pt-4 pb-24 md:px-8 md:pt-8">
		{@render children()}
	</main>

	<nav class="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white md:hidden">
		{#each nav as item (item.href)}
			<a
				href={item.href}
				class="flex flex-1 flex-col items-center py-2 text-[10px] {active(item.href)
					? 'font-semibold text-zinc-900'
					: 'text-zinc-500'}"
			>
				<span class="text-base leading-5">{item.icon}</span>{item.label}
			</a>
		{/each}
	</nav>
</div>
