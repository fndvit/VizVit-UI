<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import DecorShapes from '../ui/DecorShapes.svelte';
	import TeamFigure from './TeamFigure.svelte';
	import type { TeamMemberEditMap } from './TeamMemberCard.svelte';

	/**
	 * The featured team as a field of figures between the brand shapes — the
	 * home hero's grid, with figures where the hero has text. Each member's
	 * own offset and size scatter them; on a narrow viewport the shapes go,
	 * the base width shrinks and the offsets collapse, so the figures wrap
	 * like any list.
	 */
	interface Props {
		members: TeamMemberData[];
		editFor?: (member: TeamMemberData) => TeamMemberEditMap | undefined;
		class?: string;
	}

	let { members, editFor, class: className = '' }: Props = $props();
</script>

<div class="vit-team-figures {className}">
	<div class="shapes" aria-hidden="true"><DecorShapes /></div>
	<div class="figures">
		{#each members as member (member.slug)}
			<TeamFigure {member} edit={editFor?.(member)} />
		{/each}
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
