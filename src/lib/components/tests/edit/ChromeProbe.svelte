<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import AddSlot from '../../../edit/chrome/AddSlot.svelte';
	import EditFrame, { type EditFrameSpec } from '../../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../../edit/chrome/EditPanel.svelte';
	import type { EditAdapter, EntityOp, PropertyDescriptor } from '../../../edit/types.js';

	/**
	 * The editor chrome under a test-owned adapter: an EditFrame around a
	 * known child, its panel rows, and an AddSlot — everything the gating
	 * tests need in one mount. `adapter: null` = read-only app.
	 */
	interface Props {
		adapter?: EditAdapter | null;
		spec?: EditFrameSpec;
		rows?: { descriptor: PropertyDescriptor; value: string | null }[];
		addOp?: Extract<EntityOp, { kind: 'create' }>;
	}

	let { adapter = null, spec, rows = [], addOp }: Props = $props();

	// Context is set once at init, on purpose — tests swap adapters by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
</script>

<div data-testid="frame-host">
	<EditFrame {spec}>
		{#snippet panel()}
			<EditPanel {rows} />
		{/snippet}
		<p data-testid="content">Contingut</p>
	</EditFrame>
</div>

{#if addOp}
	<AddSlot op={addOp} label="una fita" />
{/if}
