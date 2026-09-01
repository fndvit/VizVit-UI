<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleMilestones } from '../../../fixtures.js';
	import TimelineMilestone from '../../timeline/TimelineMilestone.svelte';

	const { Story } = defineMeta({
		title: 'Timeline/TimelineMilestone',
		component: TimelineMilestone
	});
</script>

<Story name="WithImage" args={{ milestone: sampleMilestones[0] }} />
<Story name="WithLink" args={{ milestone: sampleMilestones[1] }} />
