<script lang="ts">
	import type { AddSlotProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome } from '../context.js';

	/**
	 * The "+" affordance's GATE. Renders ONLY while the adapter is editing
	 * AND can add — `applyOp`, or `openRecord` for a slot that names a
	 * `record` — otherwise nothing, the byte-identical invariant. The control itself, its pending state and its announcement
	 * live in `edit/live/AddSlot.svelte`, installed by the host.
	 */
	let { op, label = '', record }: AddSlotProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	// Live with either way of adding: the op, or the host's form for a new row.
	const active = $derived(
		(adapter?.isEditing ?? false) &&
			(adapter?.applyOp !== undefined ||
				(record !== undefined && adapter?.openRecord !== undefined))
	);
</script>

{#if active && chrome}
	{@const Live = chrome.AddSlot}
	<Live {op} {label} {record} />
{/if}
