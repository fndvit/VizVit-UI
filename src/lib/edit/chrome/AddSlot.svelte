<script lang="ts">
	import type { AddSlotProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome } from '../context.js';

	/**
	 * The "+" affordance's GATE. Renders ONLY while the adapter is editing
	 * AND implements `applyOp` — otherwise nothing, the byte-identical
	 * invariant. The control itself, its pending state and its announcement
	 * live in `edit/live/AddSlot.svelte`, installed by the host.
	 */
	let { op, label = '' }: AddSlotProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const active = $derived((adapter?.isEditing ?? false) && adapter?.applyOp !== undefined);
</script>

{#if active && chrome}
	{@const Live = chrome.AddSlot}
	<Live {op} {label} />
{/if}
