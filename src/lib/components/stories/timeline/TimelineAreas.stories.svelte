<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleAreas } from '../../../fixtures.js';
	import type { TimelineAreaData } from '../../../content/types.js';
	import TimelineAreas from '../../timeline/TimelineAreas.svelte';

	const areaHref = (area: TimelineAreaData): string => `/transparency?category=${area.category}`;

	const { Story } = defineMeta({
		title: 'Timeline/TimelineAreas',
		component: TimelineAreas,
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Scrolly">
	{#snippet template()}
		<TimelineAreas areas={sampleAreas} {areaHref}>
			{#snippet seeAll()}<a href="/transparency">A la cronologia completa →</a>{/snippet}
		</TimelineAreas>
	{/snippet}
</Story>
