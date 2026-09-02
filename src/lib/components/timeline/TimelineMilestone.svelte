<script module lang="ts">
	import type { EditDescriptor } from '../../edit/types.js';

	/** Which of the milestone's localized fields are editable at this render site. */
	export interface MilestoneEditMap {
		title?: EditDescriptor;
		body?: EditDescriptor;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import type { MilestoneData } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import { MILESTONE_CATEGORY_COLOR, milestoneCategoryLabel } from '../../utils/milestones.js';
	import CardMedia from '../ui/CardMedia.svelte';
	import DateText from '../ui/DateText.svelte';
	import Link from '../ui/Link.svelte';

	interface Props {
		milestone: MilestoneData;
		/** Marks fields editable where an edit adapter is active. */
		edit?: MilestoneEditMap;
	}

	let { milestone, edit }: Props = $props();

	const config = getUiConfig();

	const color = $derived(MILESTONE_CATEGORY_COLOR[milestone.category]);
	/**
	 * `link_url` is an unconstrained editable column, and the `press` category
	 * exists for coverage that lives on someone else's site. Link is for
	 * internal paths: it runs its href through the app's resolver, which may
	 * splice a locale segment into a foreign path, and drops the `rel` an
	 * outbound link needs. The failure is silent: the anchor renders and only
	 * breaks on click.
	 *
	 * This is the only place the rule is stated, and the only column that needs
	 * it. A project's `external_url` and a collaborator's `url` are external by
	 * definition, so their render sites emit `rel="external noopener"` with no
	 * predicate — they never route the value through Link, so nothing splices a
	 * locale into it.
	 */
	const isExternal = $derived(/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(milestone.linkUrl ?? ''));
</script>

<article style={`--milestone-color: ${color}`}>
	<span class="dot" aria-hidden="true"></span>
	<Editable
		edit={config.messageEdit?.(`category_${milestone.category}`)}
		value={milestoneCategoryLabel(milestone.category, config.messages)}
	>
		{#snippet children(text, attrs)}<p class="category" {...attrs}>{text}</p>{/snippet}
	</Editable>
	<DateText value={milestone.occurredOn} />
	<Editable edit={edit?.title} value={milestone.title}>
		{#snippet children(text, attrs)}<h3 {...attrs}>{text}</h3>{/snippet}
	</Editable>
	{#if milestone.body}
		<Editable edit={edit?.body} value={milestone.body}>
			{#snippet children(text, attrs)}<p class="body" {...attrs}>{text}</p>{/snippet}
		</Editable>
	{/if}
	{#if milestone.imageUrls.length > 0}
		<CardMedia src={milestone.imageUrls[0]} alt="" width="1200" height="675" />
	{/if}
	{#if milestone.linkUrl}
		<p class="more">
			<ActionLabel
				edit={config.messageEdit?.('common_readMore')}
				value={config.messages.common_readMore()}
			>
				{#snippet control()}
					{#if isExternal}
						<a href={milestone.linkUrl} rel="external noopener"
							>{config.messages.common_readMore()}</a
						>
					{:else if milestone.linkUrl}
						<Link href={milestone.linkUrl}>{config.messages.common_readMore()}</Link>
					{/if}
				{/snippet}
			</ActionLabel>
		</p>
	{/if}
</article>

<style>
	article {
		position: relative;
		padding-top: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	/* Sits on the track line drawn by the parent Timeline. */
	.dot {
		position: absolute;
		top: -7px;
		left: 0;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--milestone-color);
		border: 2px solid var(--color-surface);
	}

	.category {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--milestone-color);
	}

	h3 {
		margin: 0;
		font-size: var(--text-base);
	}

	.body {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-ink-secondary);
	}

	article > :global(img) {
		margin-top: var(--space-2);
	}

	.more {
		margin: 0;
	}

	.more :global(a) {
		color: var(--color-brand);
		font-weight: 600;
	}
</style>
