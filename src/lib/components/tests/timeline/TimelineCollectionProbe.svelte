<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import type { CollectionRef, EditAdapter } from '../../../edit/types.js';
	import type { MilestoneData } from '../../../content/types.js';
	import Timeline from '../../timeline/Timeline.svelte';

	/** Timeline under a test-owned adapter, for the collection-ops gating. */
	interface Props {
		milestones: MilestoneData[];
		collection?: CollectionRef;
		adapter?: EditAdapter | null;
	}

	let { milestones, collection, adapter = null }: Props = $props();

	// Context is set once at init, on purpose — tests swap adapters by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
</script>

<Timeline {milestones} {collection} variant="full" />
