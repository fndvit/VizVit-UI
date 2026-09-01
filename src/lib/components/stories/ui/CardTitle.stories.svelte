<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CardTitle from '../../ui/CardTitle.svelte';
	import Link from '../../ui/Link.svelte';

	const { Story } = defineMeta({
		title: 'UI/CardTitle',
		component: CardTitle
	});
</script>

<Story name="Linked">
	{#snippet template()}
		<CardTitle>
			<Link href="/weeklies/el-planeta-enmig-d-una-galaxia">El planeta enmig d’una galàxia</Link>
		</CardTitle>
	{/snippet}
</Story>

<Story name="PlainText">
	{#snippet template()}
		<CardTitle>Un títol sense enllaç</CardTitle>
	{/snippet}
</Story>
