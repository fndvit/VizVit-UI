<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import FilterChips from '../../ui/FilterChips.svelte';

	const chips = [
		{ value: 'medi-ambient', label: 'Medi ambient' },
		{ value: 'societat', label: 'Societat' },
		{ value: 'ciencia', label: 'Ciència' },
		{ value: 'dades-obertes', label: 'Dades obertes' }
	];

	const { Story } = defineMeta({
		title: 'UI/FilterChips',
		component: FilterChips,
		args: { chips, label: 'Filtra per tema', onchange: fn() }
	});
</script>

<Story name="NoneSelected" args={{ selected: null }} />
<Story name="OneSelected" args={{ selected: 'ciencia' }} />
