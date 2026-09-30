<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TileMosaic from '../../ui/TileMosaic.svelte';

	const { Story } = defineMeta({
		title: 'UI/TileMosaic',
		component: TileMosaic
	});
</script>

<Story name="Hero">
	{#snippet template()}
		<div style="width: 100%; height: 24rem">
			<TileMosaic cols={12} rows={6} seed={7} density={0.72} />
		</div>
	{/snippet}
</Story>
<Story name="Arriving">
	{#snippet template()}
		<div style="width: 100%; height: 24rem">
			<TileMosaic
				cols={12}
				rows={6}
				seed={7}
				density={0.5}
				focus={{ col: 4, row: 3, radius: 2, density: 0.95 }}
				arrive
			/>
		</div>
	{/snippet}
</Story>
<Story name="CornerCluster">
	{#snippet template()}
		<div style="width: 6rem; height: 6rem">
			<TileMosaic cols={2} rows={2} seed={31} density={1} />
		</div>
	{/snippet}
</Story>
