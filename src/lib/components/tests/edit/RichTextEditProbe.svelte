<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import type { EditAdapter, EditDescriptor } from '../../../edit/types.js';
	import RichText from '../../ui/RichText.svelte';

	/** RichText under a test-owned adapter. */
	interface Props {
		body: string;
		edit: EditDescriptor;
		adapter: EditAdapter;
	}

	let { body, edit, adapter }: Props = $props();

	// Context is set once at init, on purpose — the probe swaps adapters by remounting.
	// svelte-ignore state_referenced_locally
	setEditAdapter(adapter);
</script>

<RichText {body} {edit} />
