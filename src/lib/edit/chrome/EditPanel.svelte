<script lang="ts">
	import type { EditPanelProps } from '../chrome-props.js';
	import { getEditChrome } from '../context.js';

	/**
	 * The property form's GATE. A renderer builds its panel snippet from this
	 * whether or not anyone will ever open it, so this is the name it imports;
	 * the rows themselves (`edit/live/EditPanel.svelte`, one PropertyRow per
	 * entry with its own commit lifecycle) exist only where a host installed
	 * the chrome. The snippet is only rendered inside a live frame's popover,
	 * so with no chrome there is nothing to render and nothing is.
	 */
	let { rows }: EditPanelProps = $props();

	const chrome = getEditChrome();
</script>

{#if chrome}
	{@const Live = chrome.EditPanel}
	<Live {rows} />
{/if}
