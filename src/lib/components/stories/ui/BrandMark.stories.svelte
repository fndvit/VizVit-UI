<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BrandMark from '../../ui/BrandMark.svelte';

	const { Story } = defineMeta({ title: 'UI/BrandMark', component: BrandMark });
</script>

<Story name="Nav">
	{#snippet template()}
		<div style="width: 4rem"><BrandMark title="ViT" /></div>
	{/snippet}
</Story>
<Story name="Splash">
	{#snippet template()}
		<div style="width: 20rem"><BrandMark /></div>
	{/snippet}
</Story>
