<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import PersonFigure from '../ui/figure/PersonFigure.svelte';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * One team member as a `PersonFigure`, drawn from the row's `figure*`
	 * fields, defaults applied here. ONE door to edit it, the frame's pencil:
	 * the host's full form (`record`) holds the name, the role and bio in
	 * every language, the photo and the nine figure settings together. A
	 * panel beside it would repeat the figure rows behind a second button,
	 * and nothing edits inline: a caption is too small a place for three
	 * languages, and a bio that reveals on hover is no place for a caret.
	 */
	interface Props {
		member: TeamMemberData;
		/** Marks fields editable where an edit adapter is active. */
		edit?: TeamMemberEditMap;
		class?: string;
	}

	let { member, edit, class: className = '' }: Props = $props();

	const arms = $derived(member.figureArms ?? 'down');
	const legs = $derived(member.figureLegs ?? 'standing');
	const head = $derived(member.figureHead ?? 'cutout');
	const headShape = $derived(member.figureHeadShape ?? 'round');
	const labelSide = $derived(member.figureLabelSide ?? 'right');
	const labelAlign = $derived(member.figureLabelAlign ?? 'top');
	const offset = $derived(member.figureOffset ?? 0);
	const headScale = $derived(member.figureHeadScale ?? 100);
	const size = $derived(member.figureSize ?? 100);

	// The head MODE becomes the figure's two head props: `drawn` withholds the
	// photo, and an empty photoUrl draws anyway (FigureHead's own rule).
	const photo = $derived(head === 'drawn' ? null : member.photoUrl || null);
	const photoShape = $derived(head === 'circle' ? 'circle' : 'cutout');

	const frameSpec = $derived(
		edit && (edit.record || edit.removeOp)
			? { label: edit.label ?? member.name, record: edit.record, removeOp: edit.removeOp }
			: undefined
	);
</script>

<!-- The frame goes around the whole figure, inside this wrapper: inside, so
     the field's flex row never gains a child (the WeeklieCard rule); around,
     so its div never sits between the figure and its figcaption. -->
<div
	class="vit-team-figure {className}"
	style="--vit-team-figure-scale: {size / 100}; --vit-team-figure-offset: {offset}px"
>
	<EditFrame spec={frameSpec}>
		<PersonFigure
			name={member.name}
			role={member.role}
			bio={member.bio}
			{photo}
			{photoShape}
			head={headShape}
			{arms}
			{legs}
			headScale={headScale / 100}
			{labelSide}
			{labelAlign}
		/>
	</EditFrame>
</div>

<style>
	.vit-team-figure {
		position: relative;
		/* A member's size is a percent of the field's base width, and its
		   offset an in-flow margin (the row grows; nothing overlaps the next
		   section), which the field can switch off on a narrow viewport. */
		--vit-figure-width: calc(var(--vit-team-figure-base, 10rem) * var(--vit-team-figure-scale, 1));
		margin-top: calc(var(--vit-team-figure-offset, 0px) * var(--vit-team-figure-offsets, 1));
	}

	/* The revealed bio overlaps a neighbour's box; lift the one being read. */
	.vit-team-figure:hover,
	.vit-team-figure:focus-within {
		z-index: 1;
	}
</style>
