<script lang="ts">
	import GhostButton from './GhostButton.svelte';

	interface Chip {
		value: string;
		label: string;
	}

	interface Props {
		chips: Chip[];
		/** Currently selected chip value; null = none selected. */
		selected: string | null;
		label: string;
		/** Called with the toggled value, or null when the active chip is unselected. */
		onchange: (value: string | null) => void;
	}

	let { chips, selected, label, onchange }: Props = $props();

	function toggle(value: string): void {
		onchange(selected === value ? null : value);
	}
</script>

<div class="chips" role="group" aria-label={label}>
	{#each chips as chip (chip.value)}
		<GhostButton
			variant="chip"
			aria-pressed={selected === chip.value}
			onclick={() => toggle(chip.value)}
		>
			{chip.label}
		</GhostButton>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
