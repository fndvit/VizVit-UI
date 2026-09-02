<script lang="ts">
	import { setUiConfig } from '../../../config/context.js';
	import type { EditMessages } from '../../../config/edit-messages.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import Editable from '../../../edit/Editable.svelte';
	import type { EditAdapter, EditDescriptor } from '../../../edit/types.js';

	/** Editable under a test-owned adapter; `adapter: null` = read-only app. */
	interface Props {
		value: string;
		edit?: EditDescriptor;
		adapter?: EditAdapter | null;
		/** Overrides the editor-chrome strings, proving they come from config. */
		editMessages?: EditMessages;
	}

	let { value, edit, adapter = null, editMessages }: Props = $props();

	// Context is set once at init, on purpose — the probe swaps adapters by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
	// svelte-ignore state_referenced_locally
	if (editMessages) setUiConfig(() => ({ editMessages }));
</script>

<Editable {edit} {value}>
	{#snippet children(text, attrs)}
		<p data-testid="target" {...attrs}>{text}</p>
	{/snippet}
</Editable>
