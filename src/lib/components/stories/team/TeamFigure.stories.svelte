<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleMember, sampleTeam } from '../../../fixtures.js';
	import TeamFigure from '../../team/TeamFigure.svelte';
	import TeamFigureField from '../../team/TeamFigureField.svelte';
	import TeamFigureEditDemo from './TeamFigureEditDemo.svelte';

	const { Story } = defineMeta({
		title: 'Team/TeamFigure',
		component: TeamFigure,
		args: { member: { ...sampleMember, photoUrl: '/images/placeholders/cutout.svg' } }
	});
</script>

<!-- No figure fields set: every default. -->
<Story name="Default" />

<Story
	name="AllFieldsSet"
	args={{
		member: {
			...sampleMember,
			photoUrl: '/images/placeholders/cutout.svg',
			figureArms: 'one-bent',
			figureLegs: 'walking',
			figureHead: 'cutout',
			figureLabelSide: 'left',
			figureLabelAlign: 'bottom',
			figureOffset: 40,
			figureHeadScale: 120,
			figureSize: 120
		}
	}}
/>

<Story name="Circle" args={{ member: { ...sampleMember, figureHead: 'circle' } }} />

<Story
	name="Drawn"
	args={{ member: { ...sampleMember, figureHead: 'drawn', figureLegs: 'sit' } }}
/>

<!-- The featured team as the page renders it. -->
<Story name="Field">
	{#snippet template()}
		<TeamFigureField members={sampleTeam} />
	{/snippet}
</Story>

<!-- A collage: some members placed, the rest on the row layout, one on a higher layer. -->
<Story name="Canvas">
	{#snippet template()}
		<TeamFigureField
			members={sampleTeam.map((m, index) =>
				index === 0
					? { ...m, figureX: 40, figureY: 260, figureZ: 2 }
					: index === 2
						? { ...m, figureX: 640, figureY: 20 }
						: m
			)}
		/>
	{/snippet}
</Story>

<!-- Drag a figure, nudge it from its grip, resize it from its corner: the canvas saves one patch per gesture. -->
<Story name="Editing">
	{#snippet template()}
		<TeamFigureEditDemo />
	{/snippet}
</Story>
