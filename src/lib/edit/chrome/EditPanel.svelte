<script lang="ts">
	import type { PropertyDescriptor, PropertyValue } from '../types.js';
	import PropertyRow from './PropertyRow.svelte';

	/**
	 * The property form an EditFrame's popover holds: one PropertyRow per
	 * entry, each with its own independent commit lifecycle. The component
	 * knows nothing about the entity — the descriptors say everything.
	 */
	interface Props {
		rows: { descriptor: PropertyDescriptor; value: PropertyValue }[];
	}

	let { rows }: Props = $props();
</script>

<div class="panel">
	{#each rows as row (JSON.stringify(row.descriptor.ref) + row.descriptor.label)}
		<PropertyRow descriptor={row.descriptor} value={row.value} />
	{/each}
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
