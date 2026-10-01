<script lang="ts">
	import { areaDestination } from '../../timeline/area-link.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import { EDIT_CHROME } from '../../../edit/live/index.js';
	import type { CollectionRef, EditAdapter } from '../../../edit/types.js';
	import type { TimelineAreaData } from '../../../content/types.js';
	import TimelineAreas from '../../timeline/TimelineAreas.svelte';
	import type { TimelineAreaEditMap } from '../../timeline/TimelineArea.svelte';

	/** TimelineAreas under a test-owned adapter, for the edit-map gating. */
	interface Props {
		areas: TimelineAreaData[];
		editFor?: (area: TimelineAreaData) => TimelineAreaEditMap | undefined;
		adapter?: EditAdapter | null;
		collection?: CollectionRef;
	}

	let { areas, editFor, adapter = null, collection }: Props = $props();

	// Context is set once at init, on purpose — tests swap adapters by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter, EDIT_CHROME);
</script>

<TimelineAreas
	{areas}
	areaHref={(area) => areaDestination(area, '/transparency')}
	{editFor}
	{collection}
>
	{#snippet seeAll()}<a href="/transparency">Tot</a>{/snippet}
</TimelineAreas>
