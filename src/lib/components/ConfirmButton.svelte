<script lang="ts">
	// Confirmation en deux clics, sans confirm() (bloqué dans certains navigateurs intégrés).
	let { label, confirmLabel = 'Confirmer ?', class: cls = 'btn text-xs', onconfirm }: {
		label: string;
		confirmLabel?: string;
		class?: string;
		onconfirm: () => void;
	} = $props();

	let armed = $state(false);
</script>

{#if armed}
	<span class="inline-flex gap-1">
		<button class="{cls} border-red-300 text-red-700" onclick={() => ((armed = false), onconfirm())}>{confirmLabel}</button>
		<button class={cls} onclick={() => (armed = false)}>Non</button>
	</span>
{:else}
	<button class={cls} onclick={() => (armed = true)}>{label}</button>
{/if}
