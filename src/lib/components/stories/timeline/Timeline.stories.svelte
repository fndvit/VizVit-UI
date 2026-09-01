<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleMilestones } from '../../../fixtures.js';
	import Timeline from '../../timeline/Timeline.svelte';

	const { Story } = defineMeta({
		title: 'Timeline/Timeline',
		component: Timeline,
		args: { milestones: sampleMilestones }
	});
</script>

<Story name="Compact" args={{ variant: 'compact' }} />
<Story name="FullWithYearMarkers" args={{ variant: 'full' }} />
