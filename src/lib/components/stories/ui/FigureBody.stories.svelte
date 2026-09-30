<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FigureBody from '../../ui/figure/FigureBody.svelte';
	import FigureHead from '../../ui/figure/FigureHead.svelte';
	import { ARM_POSES, LEG_POSES } from '../../ui/figure/paths.js';

	const { Story } = defineMeta({
		title: 'UI/FigureBody',
		component: FigureBody
	});
</script>

<!-- The survey's look: a body with no head at all. -->
<Story name="Poses">
	{#snippet template()}
		<div style="display: flex; gap: 1rem; flex-wrap: wrap; --vit-figure-width: 6rem">
			{#each ARM_POSES as arms (arms)}
				{#each LEG_POSES as legs (legs)}
					<FigureBody {arms} {legs} />
				{/each}
			{/each}
		</div>
	{/snippet}
</Story>

<!-- A head composed in as children: it draws in the body's coordinates. -->
<Story name="WithHead">
	{#snippet template()}
		<div style="display: flex; gap: 2rem">
			<FigureBody legs="walking">
				<FigureHead photo="/images/placeholders/cutout.svg" />
			</FigureBody>
			<FigureBody arms="one-bent">
				<FigureHead photo="/images/placeholders/portrait.svg" photoShape="circle" />
			</FigureBody>
			<FigureBody legs="sit">
				<FigureHead head="cup" />
			</FigureBody>
		</div>
	{/snippet}
</Story>

<!-- The survey's faded companions: the ink token and an opacity, nothing else. -->
<Story name="Companions">
	{#snippet template()}
		<div
			style="display: flex; gap: 1.5rem; align-items: flex-end; --vit-figure-ink: var(--color-brand)"
		>
			<div style="opacity: 0.35"><FigureBody /></div>
			<FigureBody legs="stride"><FigureHead /></FigureBody>
			<div style="opacity: 0.35; --vit-figure-width: 7rem"><FigureBody legs="walking" /></div>
		</div>
	{/snippet}
</Story>
