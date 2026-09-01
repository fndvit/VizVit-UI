<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleWeekly } from '../../../fixtures.js';
	import WeeklieCard from '../../weeklies/WeeklieCard.svelte';

	const { Story } = defineMeta({
		title: 'Weeklies/WeeklieCard',
		component: WeeklieCard
	});
</script>

<Story name="Default" args={{ weekly: sampleWeekly }} />
