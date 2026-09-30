<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleMember } from '../../../fixtures.js';
	import PersonFigure from '../../ui/figure/PersonFigure.svelte';
	import { ARM_POSES, LEG_POSES } from '../../ui/figure/paths.js';

	const { Story } = defineMeta({
		title: 'UI/PersonFigure',
		component: PersonFigure,
		args: {
			name: sampleMember.name,
			role: sampleMember.role,
			photo: '/images/placeholders/cutout.svg'
		}
	});

	/** The mockup's team section: seven figures at their own heights and sizes. */
	const TEAM = [
		{
			left: '2%',
			top: '14%',
			width: '9rem',
			arms: 'down',
			legs: 'walking',
			side: 'right',
			align: 'top'
		},
		{
			left: '24%',
			top: '4%',
			width: '10rem',
			arms: 'down',
			legs: 'step',
			side: 'right',
			align: 'top'
		},
		{
			left: '46%',
			top: '20%',
			width: '9.5rem',
			arms: 'down',
			legs: 'standing',
			side: 'left',
			align: 'bottom'
		},
		{
			left: '72%',
			top: '0%',
			width: '10.5rem',
			arms: 'one-bent',
			legs: 'walking',
			side: 'right',
			align: 'top'
		},
		{
			left: '14%',
			top: '58%',
			width: '8.5rem',
			arms: 'raised',
			legs: 'stride',
			side: 'left',
			align: 'bottom'
		},
		{
			left: '42%',
			top: '60%',
			width: '9rem',
			arms: 'down',
			legs: 'walking',
			side: 'right',
			align: 'top'
		},
		{
			left: '68%',
			top: '62%',
			width: '10rem',
			arms: 'down',
			legs: 'standing',
			side: 'left',
			align: 'bottom'
		}
	] as const;
</script>

<Story name="Cutout" />

<Story
	name="Circle"
	args={{ photo: '/images/placeholders/portrait.svg', photoShape: 'circle', headScale: 1.1 }}
/>

<Story name="DrawnHeads">
	{#snippet template(args)}
		<div style="display: flex; gap: 3rem; flex-wrap: wrap">
			<PersonFigure {...args} photo={null} head="round" role="round" />
			<PersonFigure {...args} photo={null} head="cup" role="cup" />
			<PersonFigure {...args} photo={null} head="d" role="d" />
		</div>
	{/snippet}
</Story>

<Story name="Poses">
	{#snippet template(args)}
		<div style="display: flex; gap: 2rem 4rem; flex-wrap: wrap; --vit-figure-width: 8rem">
			{#each ARM_POSES as arms (arms)}
				{#each LEG_POSES as legs (legs)}
					<PersonFigure {...args} {arms} {legs} role="{arms} / {legs}" />
				{/each}
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="LabelLeft" args={{ labelSide: 'left' }} />
<Story name="LabelBottom" args={{ labelAlign: 'bottom', legs: 'step' }} />
<Story name="LabelLeftBottom" args={{ labelSide: 'left', labelAlign: 'bottom', legs: 'walking' }} />

<Story name="WithBio" args={{ bio: sampleMember.bio, legs: 'walking' }} />

<Story name="FailedPhoto" args={{ photo: '/images/placeholders/nope.png' }} />

<Story name="WithMarker">
	{#snippet template(args)}
		<PersonFigure {...args}>
			<span
				style="position: absolute; right: -0.5rem; top: 45%; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: var(--color-brand); color: white; display: grid; place-items: center; font-weight: 700"
			>
				X
			</span>
		</PersonFigure>
	{/snippet}
</Story>

<Story name="Team">
	{#snippet template(args)}
		<div style="position: relative; height: 56rem; max-width: 80rem">
			{#each TEAM as spot, index (index)}
				<div
					style="position: absolute; left: {spot.left}; top: {spot.top}; --vit-figure-width: {spot.width}"
				>
					<PersonFigure
						{...args}
						arms={spot.arms}
						legs={spot.legs}
						labelSide={spot.side}
						labelAlign={spot.align}
						bio={index === 4 ? sampleMember.bio : undefined}
					/>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>
