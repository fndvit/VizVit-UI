<script lang="ts">
	import type { LinkEditProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome } from '../context.js';

	/**
	 * A LINK edited whole — the GATE. While the adapter is editing and a text
	 * descriptor is supplied, the control is REPLACED by the live half
	 * (`edit/live/LinkEdit.svelte`): a button wearing the label that opens one
	 * modal for the link's text and destination, the ActionLabel rule (a
	 * caret or a click inside a live link would navigate mid-edit). Without an
	 * adapter or a descriptor the control renders untouched, byte-identical to
	 * a read-only build, and the modal's code is not in that build.
	 */
	let {
		text,
		href,
		extras = undefined,
		removeOp = undefined,
		label = undefined,
		control
	}: LinkEditProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const editing = $derived(text.edit !== undefined && (adapter?.isEditing ?? false));
</script>

{#if editing && chrome}
	{@const Live = chrome.LinkEdit}
	<Live {text} {href} {extras} {removeOp} {label} {control} />
{:else}
	{@render control()}
{/if}
