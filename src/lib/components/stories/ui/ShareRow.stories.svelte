<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ShareRow from '../../ui/ShareRow.svelte';

	const { Story } = defineMeta({
		title: 'UI/ShareRow',
		component: ShareRow
	});
</script>

<Story name="Default" args={{ title: 'El planeta enmig d’una galàxia' }} />
