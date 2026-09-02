<script lang="ts">
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import type { EditDescriptor } from '../../edit/types.js';
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
		/**
		 * Edit descriptors for the chip LABELS — a function because the host
		 * owns what a chip's wording is (a theme's localized name, a category
		 * message). While editing, a chip with a descriptor renders as
		 * editable text instead of a button (see ActionLabel).
		 */
		editFor?: (chip: Chip) => EditDescriptor | undefined;
	}

	let { chips, selected, label, onchange, editFor = undefined }: Props = $props();

	function toggle(value: string): void {
		onchange(selected === value ? null : value);
	}
</script>

<div class="chips" role="group" aria-label={label}>
	{#each chips as chip (chip.value)}
		<ActionLabel edit={editFor?.(chip)} value={chip.label}>
			{#snippet control()}
				<GhostButton
					variant="chip"
					aria-pressed={selected === chip.value}
					onclick={() => toggle(chip.value)}
				>
					{chip.label}
				</GhostButton>
			{/snippet}
		</ActionLabel>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
