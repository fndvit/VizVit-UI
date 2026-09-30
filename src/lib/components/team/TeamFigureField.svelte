<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import { getEditAdapter } from '../../edit/context.js';
	import type { CollectionRef } from '../../edit/types.js';
	import DecorShapes from '../ui/DecorShapes.svelte';
	import { canvasHeight, placeFigures } from './layout.js';
	import TeamFigure from './TeamFigure.svelte';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * The featured team as a field of figures between the brand shapes — the
	 * home hero's grid, with figures where the hero has text.
	 *
	 * Wide, the field is a CANVAS: each figure stands at its row's
	 * `figureX` / `figureY` on its `figureZ` layer, in thousandths of the
	 * canvas width, so the collage scales as one piece; a member with no
	 * position gets the next place of a centred row layout (`layout.ts`), its
	 * `figureOffset` still nudging it down, and the canvas grows to the lowest
	 * figure. Narrow — a container under 40rem — the positions are ignored and
	 * the figures flow in order, wrapping like any list; there the shapes go,
	 * the base width shrinks and the offsets collapse. The switch is a
	 * container query, so the server renders both and no script decides.
	 *
	 * Where the host saves placements (`savePlacement`), each figure on the
	 * canvas can be dragged, nudged, resized and layered — the `Placeable`
	 * chrome, through the same record the pencil opens.
	 *
	 * With a `collection` and an editing adapter, the field ends in an add
	 * slot and each figure's frame can remove its row. A new member is a
	 * whole person — a name, a role in three languages, a photo — so the slot
	 * prefers the host's form for a new row (`openRecord`) over a seeded row
	 * created in place; the op is the fallback for a host without one.
	 */
	interface Props {
		members: TeamMemberData[];
		editFor?: (member: TeamMemberData) => TeamMemberEditMap | undefined;
		/** Names the collection the members belong to: turns on the add slot and removals. */
		collection?: CollectionRef;
		class?: string;
	}

	let { members, editFor, collection, class: className = '' }: Props = $props();

	const adapter = getEditAdapter();
	const list = collectionEditing<TeamMemberData, TeamMemberEditMap>(() => ({
		collection,
		editFor
	}));

	const placements = $derived(placeFigures(members));
	const height = $derived(canvasHeight(placements));
	// Each figure's neighbours' layers: «to the front» is one above them.
	const layersFor = (index: number) => {
		const others = placements.filter((_, at) => at !== index).map((p) => p.z);
		const own = placements[index].z;
		return others.length === 0
			? { min: own, max: own }
			: { min: Math.min(...others), max: Math.max(...others) };
	};
</script>

<div class="vit-team-figures {className}">
	<div class="shapes" aria-hidden="true"><DecorShapes /></div>
	<div class="figures">
		<div class="canvas" data-vit-placement-canvas style="--vit-team-canvas-height: {height}">
			{#each members as member, index (member.slug)}
				<TeamFigure
					{member}
					edit={list.mapFor(member)}
					placement={placements[index]}
					layers={layersFor(index)}
				/>
			{/each}
			<!-- While editing, the field has a place for its add slot; the slot
			     decides whether it is live — the op, or the host's form. -->
			{#if collection && adapter?.isEditing}
				<div class="add-slot">
					<AddSlot op={list.add} record={{ entity: collection.entity }} />
				</div>
			{/if}
		</div>
	</div>
	<div class="shapes" aria-hidden="true"><DecorShapes flip /></div>
</div>

<style>
	.vit-team-figures {
		/* The mockup's figures are about 130px wide at the content width, and
		   three or four share a row — the 10rem token default is for a figure
		   on its own. */
		--vit-team-figure-base: 8rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: var(--space-4);
		padding-block: var(--space-5);
	}

	.shapes {
		width: 8rem;
	}

	/* The container the canvas measures itself against: every canvas length
	   is a `cqi` of this box. */
	.figures {
		container-type: inline-size;
		min-width: 0;
	}

	/* Flowing, the default: the members in order. */
	.canvas {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		/* Each figure's label column is inside its own grid; the gap only has
		   to clear a raised arm and a revealed bio. */
		gap: var(--space-6) var(--space-4);
	}

	.add-slot {
		align-self: center;
	}

	/* Placing: each figure at its own x, y and layer. The `--vit-placement*`
	   properties tell the canvas handles that a drag means something here. */
	@container (min-width: 40rem) {
		.canvas {
			--vit-team-figure-base: 12cqi;
			--vit-team-figure-offsets: 0;
			--vit-placement: on;
			--vit-placement-handles: flex;
			--vit-placement-touch: none;
			--vit-placement-cursor: grab;
			display: block;
			position: relative;
			height: calc(var(--vit-team-canvas-height) * 0.1cqi);
		}

		.canvas > :global(.vit-team-figure) {
			position: absolute;
			left: calc(var(--vit-team-figure-x, 0) * 0.1cqi);
			top: calc(var(--vit-team-figure-y, 0) * 0.1cqi);
			z-index: var(--vit-team-figure-z, 0);
		}

		/* The one being read, or moved, above every layer. */
		.canvas > :global(.vit-team-figure:hover),
		.canvas > :global(.vit-team-figure:focus-within) {
			z-index: 100;
		}

		.add-slot {
			position: absolute;
			right: 0;
			bottom: 0;
		}
	}

	@media (max-width: 900px) {
		.shapes {
			display: none;
		}

		.vit-team-figures {
			grid-template-columns: 1fr;
			--vit-team-figure-base: 6.5rem;
			--vit-team-figure-offsets: 0;
		}
	}
</style>
