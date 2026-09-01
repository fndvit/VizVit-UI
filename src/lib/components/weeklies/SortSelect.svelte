<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SortDirection } from '../../content/types.js';

	interface Props {
		value: SortDirection;
		onchange: (value: SortDirection) => void;
	}

	let { value, onchange }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	function handleChange(event: Event): void {
		const target = event.currentTarget as HTMLSelectElement;
		onchange(target.value === 'asc' ? 'asc' : 'desc');
	}
</script>

<label>
	<span>{msg.weeklies_sortLabel()}</span>
	<select class="control" {value} onchange={handleChange}>
		<option value="desc">{msg.weeklies_sortDesc()}</option>
		<option value="asc">{msg.weeklies_sortAsc()}</option>
	</select>
</label>

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
