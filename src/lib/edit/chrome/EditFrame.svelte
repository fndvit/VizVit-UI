<script lang="ts">
	import type { EditFrameProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome } from '../context.js';

	/**
	 * The page-builder wrapper's GATE. With no spec, no adapter or editing
	 * off it renders the children ALONE — zero wrapper element, so an
	 * unadapted app's DOM is byte-identical (pinned by test). Editing, it
	 * mounts the live frame the host installed (`edit/live/EditFrame.svelte`),
	 * which owns the corner toolbar, the property popover and the confirmed
	 * remove, and which applies the finer per-affordance gates itself.
	 * Components mount this INSIDE their own root element, so the wrapper
	 * never disturbs the parent's flex/grid.
	 */
	let { spec, panel, children }: EditFrameProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const editing = $derived(spec !== undefined && (adapter?.isEditing ?? false));
</script>

{#if editing && chrome}
	{@const Live = chrome.EditFrame}
	<Live {spec} {panel} {children} />
{:else}
	{@render children()}
{/if}
