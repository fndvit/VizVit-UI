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

<!-- Open a member's panel and change a pose: the figure redraws. -->
<Story name="Editing">
	{#snippet template()}
		<TeamFigureEditDemo />
	{/snippet}
</Story>
