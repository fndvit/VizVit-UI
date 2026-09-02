<script module lang="ts">
	import type { EditDescriptor, EntityOp, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * Which of the milestone's fields are editable at this render site:
	 * localized text inline (EditDescriptor), scalars through the frame's
	 * property panel (PropertyDescriptor), and removal from the collection.
	 */
	export interface MilestoneEditMap {
		title?: EditDescriptor;
		body?: EditDescriptor;
		occurredOn?: PropertyDescriptor;
		category?: PropertyDescriptor;
		linkUrl?: PropertyDescriptor;
		image?: PropertyDescriptor;
		/** Accessible name for the frame, e.g. "Fita: Neix la fundació". */
		label?: string;
		/** Set by Timeline from its `collection` — removal of this milestone. */
		removeOp?: Extract<EntityOp, { kind: 'remove' }>;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import type { MilestoneCategory, MilestoneData } from '../../content/types.js';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
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

	const CATEGORIES = Object.keys(MILESTONE_CATEGORY_COLOR) as MilestoneCategory[];

	/**
	 * The panel rows, zipped from the map's descriptors and this milestone's
	 * values. The category select's options come from the same labels the chip
	 * renders — filled here so the host never re-derives them.
	 */
	const panelRows = $derived(
		[
			edit?.occurredOn && { descriptor: edit.occurredOn, value: milestone.occurredOn },
			edit?.category && {
				descriptor: {
					options: CATEGORIES.map((category) => ({
						value: category,
						label: milestoneCategoryLabel(category, config.messages)
					})),
					...edit.category
				},
				value: milestone.category
			},
			edit?.linkUrl && { descriptor: edit.linkUrl, value: milestone.linkUrl },
			edit?.image && { descriptor: edit.image, value: milestone.imageUrls[0] ?? null }
		].filter((row) => row !== undefined)
	);

	const frameSpec = $derived(
		edit && (panelRows.length > 0 || edit.removeOp)
			? {
					label: edit.label ?? milestone.title,
					hasPanel: panelRows.length > 0,
					removeOp: edit.removeOp
				}
			: undefined
	);

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
	<!-- The frame sits INSIDE the article so the timeline's flex row never
	     gains an unexpected child; inactive it renders the content alone. -->
	<EditFrame spec={frameSpec}>
		{#snippet panel()}
			<EditPanel rows={panelRows} />
		{/snippet}
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
	</EditFrame>
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
