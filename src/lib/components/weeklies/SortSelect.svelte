<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SortDirection } from '../../content/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import type { PropertyDescriptor } from '../../edit/types.js';

	interface Props {
		value: SortDirection;
		onchange: (value: SortDirection) => void;
		/**
		 * An <option> cannot hold a caret, so the option labels edit through
		 * the frame's panel — one text row per direction, descriptors from the
		 * host (chrome keys on the foundation site). The visible label keeps
		 * its ActionLabel swap. Inert without an adapter.
		 */
		optionsEdit?: (direction: SortDirection) => PropertyDescriptor | undefined;
	}

	let { value, onchange, optionsEdit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const panelRows = $derived(
		(
			[
				['desc', msg.weeklies_sortDesc()],
				['asc', msg.weeklies_sortAsc()]
			] as const
		).flatMap(([direction, label]) => {
			const descriptor = optionsEdit?.(direction);
			return descriptor ? [{ descriptor, value: label }] : [];
		})
	);
	const frameSpec = $derived(
		panelRows.length > 0 ? { label: msg.weeklies_sortLabel(), hasPanel: true } : undefined
	);

	function handleChange(event: Event): void {
		const target = event.currentTarget as HTMLSelectElement;
		onchange(target.value === 'asc' ? 'asc' : 'desc');
	}
</script>

<EditFrame spec={frameSpec}>
	{#snippet panel()}
		<EditPanel rows={panelRows} />
	{/snippet}
	<ActionLabel edit={config.messageEdit?.('weeklies_sortLabel')} value={msg.weeklies_sortLabel()}>
		{#snippet control()}
			<label>
				<span>{msg.weeklies_sortLabel()}</span>
				<select class="control" {value} onchange={handleChange}>
					<option value="desc">{msg.weeklies_sortDesc()}</option>
					<option value="asc">{msg.weeklies_sortAsc()}</option>
				</select>
			</label>
		{/snippet}
	</ActionLabel>
</EditFrame>

<style>
	label {
		display: inline-flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
		color: var(--color-ink-secondary);
	}

	select {
		padding: var(--space-1) var(--space-2);
		font-weight: 600;
	}
</style>
