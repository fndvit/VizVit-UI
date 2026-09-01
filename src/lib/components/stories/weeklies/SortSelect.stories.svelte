<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import SortSelect from '../../weeklies/SortSelect.svelte';

	const { Story } = defineMeta({
		title: 'Weeklies/SortSelect',
		component: SortSelect,
		args: { onchange: fn() }
	});
</script>

<Story name="NewestFirst" args={{ value: 'desc' }} />
<Story name="OldestFirst" args={{ value: 'asc' }} />
