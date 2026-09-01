<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { MilestoneData } from '../../content/types.js';
	import type { MilestoneEditMap } from './TimelineMilestone.svelte';
	import { yearOf } from '../../utils/dates.js';
	import TimelineMilestone from './TimelineMilestone.svelte';

	interface Props {
		milestones: MilestoneData[];
		/** 'compact' = homepage slice; 'full' = transparency history with year markers. */
		variant?: 'compact' | 'full';
		/** Edit descriptors for one milestone's fields; see TimelineMilestone. */
		editFor?: (milestone: MilestoneData) => MilestoneEditMap | undefined;
	}

	let { milestones, variant = 'compact', editFor }: Props = $props();

	const config = getUiConfig();

	interface TimelineEntry {
		milestone: MilestoneData;
		/** Set on the first milestone of each year (full variant only). */
		yearMarker: string | null;
	}

	const entries = $derived(
		milestones.map((milestone, index): TimelineEntry => {
			const year = yearOf(milestone.occurredOn);
			const previousYear = index > 0 ? yearOf(milestones[index - 1].occurredOn) : null;
			return {
				milestone,
				yearMarker: variant === 'full' && year !== previousYear ? year : null
			};
		})
	);
</script>

<!-- Scrollable overflow region: tabindex="0" is required so keyboard users
     can focus it and scroll horizontally (axe: scrollable-region-focusable). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class={`timeline ${variant}`}
	role="region"
	aria-label={config.messages.timeline_label()}
	tabindex="0"
>
	<ol>
		{#each entries as entry (entry.milestone.id)}
			<li>
				{#if entry.yearMarker}
					<span class="year">{entry.yearMarker}</span>
				{/if}
				<TimelineMilestone milestone={entry.milestone} edit={editFor?.(entry.milestone)} />
			</li>
		{/each}
	</ol>
</div>

<style>
	.timeline {
		overflow-x: auto;
		padding-block: var(--space-3);
		scrollbar-width: thin;
	}

	ol {
		list-style: none;
		margin: 0;
		padding: var(--space-2) 0 0;
		display: flex;
		gap: var(--space-5);
		position: relative;
	}

	/* The track line the milestone dots sit on. */
	ol::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-ink);
	}

	li {
		position: relative;
		flex: 0 0 16rem;
	}

	.full li {
		flex-basis: 18rem;
	}

	.year {
		position: absolute;
		top: -2.4rem;
		left: 0;
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-ink-muted);
	}

	.full {
		padding-top: var(--space-5);
	}

	.timeline:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 4px;
	}

	.compact {
		overflow-x: auto;
	}
</style>
