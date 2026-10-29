<script lang="ts">
	import { formatLong, today } from '#lib/dates.ts';
	import { store } from '#lib/store.svelte.ts';

	let busy = $state(false);

	// Avancer recharge la page : la date simulée est relue partout.
	function run(fn: () => void) {
		busy = true;
		fn();
	}
</script>

{#if store.testMode}
	<div class="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-indigo-300 bg-indigo-50 px-4 py-2 text-sm text-indigo-900">
		<strong>MODE TEST</strong>
		<span>Date simulée : <span class="capitalize">{formatLong(today())}</span></span>
		<span class="flex-1"></span>
		<button class="btn text-xs" disabled={busy} onclick={() => store.validateToday()}>Valider tout aujourd'hui</button>
		<button class="btn text-xs" disabled={busy} onclick={() => run(() => store.advanceDays(1))}>+1 jour</button>
		<button class="btn text-xs" disabled={busy} onclick={() => run(() => store.advanceDays(7))}>+1 semaine</button>
		<button class="btn text-xs" disabled={busy} onclick={() => run(() => store.autoPlayDays(7))}>Jouer 1 semaine</button>
		<button class="btn text-xs" disabled={busy} onclick={() => run(() => store.exitTestMode())}>Quitter</button>
	</div>
{/if}
