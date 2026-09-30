<script lang="ts">
	import type { PlaceableProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome } from '../context.js';

	/**
	 * The canvas handles' GATE. With no spec, no adapter, editing off, no
	 * `savePlacement` or a chrome table without the live half, it renders the
	 * children ALONE — zero wrapper element, the byte-identical invariant.
	 * The drag, the arrow keys, the resize and the layer buttons live in
	 * `edit/live/Placeable.svelte`, installed by the host.
	 */
	let { spec, children }: PlaceableProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const active = $derived(
		spec !== undefined && (adapter?.isEditing ?? false) && adapter?.savePlacement !== undefined
	);
</script>

{#if active && chrome?.Placeable}
	{@const Live = chrome.Placeable}
	<Live {spec} {children} />
{:else}
	{@render children()}
{/if}
