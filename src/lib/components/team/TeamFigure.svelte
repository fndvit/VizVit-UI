<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import Placeable from '../../edit/chrome/Placeable.svelte';
	import type { PlaceableSpec, PlacementBounds } from '../../edit/chrome-props.js';
	import { FIGURE_LAYER, FIGURE_PERCENT, FIGURE_POSITION } from '../ui/figure/paths.js';
	import PersonFigure from '../ui/figure/PersonFigure.svelte';
	import type { FigurePlacement } from './layout.js';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * One team member as a `PersonFigure`, drawn from the row's `figure*`
	 * fields, defaults applied here. ONE door to edit it, the frame's pencil:
	 * the host's full form (`record`) holds the name, the role and bio in
	 * every language, the photo and the nine figure settings together. A
	 * panel beside it would repeat the figure rows behind a second button,
	 * and nothing edits inline: a caption is too small a place for three
	 * languages, and a bio that reveals on hover is no place for a caret.
	 *
	 * On the field's canvas the figure also stands at a `placement`, which
	 * the field resolves for every member; where the host saves placements
	 * the same record gives it the canvas handles (drag, arrow keys, resize,
	 * layer). Alone, or on a flowing field, it ignores the placement.
	 */
	interface Props {
		member: TeamMemberData;
		/** Marks fields editable where an edit adapter is active. */
		edit?: TeamMemberEditMap;
		/** Where the field's canvas puts it — resolved, auto places included. */
		placement?: FigurePlacement;
		/** The lowest and highest layer the field's OTHER figures use. */
		layers?: PlacementBounds;
		class?: string;
	}

	let { member, edit, placement, layers, class: className = '' }: Props = $props();

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

	// Size and offset drive the flowing field; the canvas reads x, y and z.
	const wrapperStyle = $derived(
		[
			`--vit-team-figure-scale: ${size / 100}`,
			`--vit-team-figure-offset: ${offset}px`,
			...(placement
				? [
						`--vit-team-figure-x: ${placement.x}`,
						`--vit-team-figure-y: ${placement.y}`,
						`--vit-team-figure-z: ${placement.z}`
					]
				: [])
		].join('; ')
	);

	const placeSpec = $derived<PlaceableSpec | undefined>(
		edit?.record && placement
			? {
					label: edit.label ?? member.name,
					target: edit.record,
					placement,
					layers: layers ?? { min: placement.z, max: placement.z },
					bounds: {
						x: FIGURE_POSITION.x,
						y: FIGURE_POSITION.y,
						z: FIGURE_LAYER,
						size: FIGURE_PERCENT
					}
				}
			: undefined
	);

	const frameSpec = $derived(
		edit && (edit.record || edit.removeOp)
			? { label: edit.label ?? member.name, record: edit.record, removeOp: edit.removeOp }
			: undefined
	);
</script>

<!-- The frame goes around the whole figure, inside this wrapper: inside, so
     the field's flex row never gains a child (the WeeklieCard rule); around,
     so its div never sits between the figure and its figcaption. The canvas
     handles go around the frame, so a drag carries the frame's toolbar too. -->
<div class="vit-team-figure {className}" style={wrapperStyle}>
	<Placeable spec={placeSpec}>
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
	</Placeable>
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
