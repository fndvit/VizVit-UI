<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import PersonFigure from '../ui/figure/PersonFigure.svelte';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * One team member as a `PersonFigure`, drawn from the row's `figure*`
	 * fields (defaults applied here, once, and shared by the drawing and the
	 * panel rows). Two doors to edit it, both on the frame: the gear's panel
	 * holds what is VISUAL and immediate — the photo and the nine figure
	 * settings — and the pencil opens the host's full form (`record`) for the
	 * rest: the name, the role and bio in every language, the slug. Nothing
	 * edits inline: a caption is too small a place for three languages, and
	 * a bio that reveals on hover is no place for a caret.
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

	const panelRows = $derived(
		[
			edit?.photo && { descriptor: edit.photo, value: member.photoUrl },
			edit?.figureArms && { descriptor: edit.figureArms, value: arms },
			edit?.figureLegs && { descriptor: edit.figureLegs, value: legs },
			edit?.figureHead && { descriptor: edit.figureHead, value: head },
			edit?.figureHeadShape && { descriptor: edit.figureHeadShape, value: headShape },
			edit?.figureLabelSide && { descriptor: edit.figureLabelSide, value: labelSide },
			edit?.figureLabelAlign && { descriptor: edit.figureLabelAlign, value: labelAlign },
			// The numbers travel as text: the panel has no number row.
			edit?.figureOffset && { descriptor: edit.figureOffset, value: String(offset) },
			edit?.figureHeadScale && { descriptor: edit.figureHeadScale, value: String(headScale) },
			edit?.figureSize && { descriptor: edit.figureSize, value: String(size) }
		].filter((row) => row !== undefined)
	);
	const frameSpec = $derived(
		edit && (panelRows.length > 0 || edit.record || edit.removeOp)
			? {
					label: edit.label ?? member.name,
					hasPanel: panelRows.length > 0,
					record: edit.record,
					removeOp: edit.removeOp
				}
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
		{#snippet panel()}
			<EditPanel rows={panelRows} />
		{/snippet}
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
