<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import SearchInput from '../../ui/SearchInput.svelte';

	const { Story } = defineMeta({
		title: 'UI/SearchInput',
		component: SearchInput,
		args: {
			placeholder: 'Cerca un tema…',
			label: 'Cerca un tema…',
			onsearch: fn()
		}
	});
</script>

<Story name="Empty" args={{ value: '' }} />
<Story name="Prefilled" args={{ value: 'aigua' }} />
