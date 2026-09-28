<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import { getEditAdapter } from '../../edit/context.js';
	import type { CollectionRef } from '../../edit/types.js';
	import DecorShapes from '../ui/DecorShapes.svelte';
	import TeamFigure from './TeamFigure.svelte';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * The featured team as a field of figures between the brand shapes — the
	 * home hero's grid, with figures where the hero has text. Each member's
	 * own offset and size scatter them; on a narrow viewport the shapes go,
	 * the base width shrinks and the offsets collapse, so the figures wrap
	 * like any list.
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
	// The op-less way in: a host whose adapter opens a form for a new row.
	const addViaRecord = $derived(
		collection !== undefined &&
			(adapter?.isEditing ?? false) &&
			adapter?.openRecord !== undefined &&
			adapter?.applyOp === undefined
			? { kind: 'create' as const, collection }
			: undefined
	);
	const add = $derived(list.add ?? addViaRecord);
</script>

<div class="vit-team-figures {className}">
	<div class="shapes" aria-hidden="true"><DecorShapes /></div>
	<div class="figures">
		{#each members as member (member.slug)}
			<TeamFigure {member} edit={list.mapFor(member)} />
		{/each}
		{#if add && collection}
			<div class="add-slot">
				<AddSlot op={add} record={{ entity: collection.entity }} />
			</div>
		{/if}
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

	.figures {
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
