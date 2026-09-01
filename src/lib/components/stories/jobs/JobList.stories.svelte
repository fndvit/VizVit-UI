<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleJobs } from '../../../fixtures.js';
	import JobList from '../../jobs/JobList.svelte';

	const { Story } = defineMeta({
		title: 'Get Involved/JobList',
		component: JobList
	});
</script>

<Story name="WithOpenings" args={{ jobs: sampleJobs }} />
<Story name="Empty" args={{ jobs: [] }} />
