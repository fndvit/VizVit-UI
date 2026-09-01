<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Link from '../../ui/Link.svelte';

	const { Story } = defineMeta({
		title: 'UI/Link',
		component: Link
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Link href="/weeklies">Weeklies</Link>
	{/snippet}
</Story>

<Story name="ExplicitLocale">
	{#snippet template()}
		<Link href="/weeklies" locale="en">Weeklies (EN)</Link>
	{/snippet}
</Story>
