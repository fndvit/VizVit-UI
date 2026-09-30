<script module lang="ts">
	import type { RemovableMap } from '../../edit/collection.svelte.js';
	import type { EditDescriptor, PropertyDescriptor, RecordTarget } from '../../edit/types.js';

	/**
	 * Which of the area's fields are editable at this render site: the two
	 * localized texts inline (EditDescriptor), the category, the area's own
	 * destination and the editorial state through the frame's panel
	 * (PropertyDescriptor), and the host's record form behind the pencil. The
	 * collage stays out of the panel: an area carries an ARRAY of images,
	 * which the record form owns — the `MilestoneEditMap` rule. The list
	 * (`TimelineAreas`) injects `removeOp` from its `collection`, like every
	 * other list.
	 */
	export interface TimelineAreaEditMap extends RemovableMap {
		title?: EditDescriptor;
		body?: EditDescriptor;
		category?: PropertyDescriptor;
		/** The area's own destination (a `url` row); empty leaves the category's history. */
		href?: PropertyDescriptor;
		/** Editorial-state `flag` row; on while the area is not a draft. */
		status?: PropertyDescriptor;
		/** The host's full form for this row: the frame's pencil. */
		record?: RecordTarget & { id: string | number };
		/** Accessible name for the frame, e.g. "Àrea: Laboratori". */
		label?: string;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { MILESTONE_CATEGORIES, type TimelineAreaData } from '../../content/types.js';
	import DraftBadge from '../../edit/chrome/DraftBadge.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import Editable from '../../edit/Editable.svelte';
	import { milestoneCategoryLabel } from '../../utils/milestones.js';
	import ImageCollage from '../ui/ImageCollage.svelte';
	import InlineText from '../ui/InlineText.svelte';
	import ArrowLink from '../ui/ArrowLink.svelte';

	/**
	 * One area of the home timeline: the heading, the paragraph, the link to
	 * that area's history and the collage. A full-height `<section>` so the
	 * scrolly's rail has one screen per area to track; the `id` is what the
	 * rail's anchors point at. Where the link goes is the host's answer,
	 * passed down as `href` by `TimelineAreas`.
	 */
	interface Props {
		area: TimelineAreaData;
		/** Where the area leads — `areaDestination` — or null for no link. */
		href: string | null;
		/** The section's id — the rail's anchor target. */
		id: string;
		/**
		 * Where the reader is: on the stage the current card is in the frame
		 * and one passed or to come is a screen above or below it (see
		 * TimelineAreas). `TimelineAreas` sets it; alone, an area is current.
		 */
		state?: 'passed' | 'current' | 'upcoming';
		/** On the stage: the slide right after the current one, which peeks in as the reader pulls. */
		next?: boolean;
		/** On the stage: the slide right before it, which peeks in as the reader pulls back. */
		prev?: boolean;
		/** Marks fields editable where an edit adapter is active. */
		edit?: TimelineAreaEditMap;
	}

	let { area, href, id, state = 'current', next = false, prev = false, edit }: Props = $props();

	const config = getUiConfig();

	/**
	 * The panel rows, zipped from the map's descriptors and this area's
	 * values; the category select's options come from the same labels the
	 * chips render, filled here so the host never re-derives them.
	 */
	const panelRows = $derived(
		[
			edit?.category && {
				descriptor: {
					// A section that is no category's is the row's own «—», which
					// the panel offers for a `nullable` descriptor.
					...edit.category,
					options: MILESTONE_CATEGORIES.map((category) => ({
						value: category,
						label: milestoneCategoryLabel(category, config.messages)
					}))
				},
				value: area.category ?? ''
			},
			edit?.href && { descriptor: edit.href, value: area.href ?? '' },
			edit?.status && { descriptor: edit.status, value: !area.draft }
		].filter((row) => row !== undefined)
	);

	const frameSpec = $derived(
		edit && (panelRows.length > 0 || edit.removeOp || edit.record)
			? {
					label: edit.label ?? area.title,
					hasPanel: panelRows.length > 0,
					removeOp: edit.removeOp,
					record: edit.record
				}
			: undefined
	);

	// «To our lab timeline»: the area's name mid-sentence, so lowercased —
	// the heading above it is what carries the capital.
	const linkLabel = $derived(
		config.messages.timeline_toArea({ area: area.title.toLocaleLowerCase() })
	);
</script>

<section
	class="area"
	class:passed={state === 'passed'}
	class:current={state === 'current'}
	class:upcoming={state === 'upcoming'}
	class:next
	class:prev
	{id}
	aria-labelledby={`${id}-title`}
>
	<EditFrame spec={frameSpec}>
		{#snippet panel()}
			<EditPanel rows={panelRows} />
		{/snippet}
		<div class="layout">
			<div class="text">
				{#if area.draft}<DraftBadge />{/if}
				<Editable edit={edit?.title} value={area.title}>
					{#snippet children(text, attrs)}<h3 id={`${id}-title`} {...attrs}>{text}</h3>{/snippet}
				</Editable>
				{#if area.body}
					<Editable edit={edit?.body} value={area.body}>
						{#snippet children(text, attrs)}
							<p class="body" {...attrs}><InlineText {text} {attrs} /></p>
						{/snippet}
					</Editable>
				{/if}
				{#if href}
					<p class="more"><ArrowLink {href} text={linkLabel} /></p>
				{/if}
			</div>
			{#if area.images.length > 0}
				<div class="collage">
					<ImageCollage images={area.images} />
				</div>
			{/if}
		</div>
	</EditFrame>
</section>

<style>
	/* A screen per area, its heading at the TOP — level with the current
	   node on the rail (see TimelineAreas' rail places). `--vit-rail-top` is
	   the rail's; the heading's half line height brings its middle to the
	   node's. */
	.area {
		/* The stacked flow's scroll-linked entrance and exit (see
		   TimelineAreas); whole and in place until the scroll says otherwise. */
		--vit-area-reveal: 1;
		--vit-area-shift: 0px;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: var(--device-h);
		padding-block: calc(var(--vit-rail-top) - 1.25rem) var(--space-5);
		box-sizing: border-box;
		/* A rail anchor lands with the heading just under the fixed nav. */
		scroll-margin-top: var(--vit-splash-offset);
	}

	/* The grid is its own element under the frame, so the frame (a wrapper
	   only while editing) never has to be one of its cells. */
	/* One column: the text, then the collage beneath it, at the design's
	   measure — the right of the screen is the decor's. */
	.layout {
		max-width: 62%;
		opacity: var(--vit-area-reveal);
		transform: translateY(var(--vit-area-shift));
		will-change: transform, opacity;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		color: var(--color-navy);
	}

	h3 {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: 800;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		line-height: var(--leading-tight);
	}

	.body {
		margin: 0;
		max-width: 38ch;
		font-size: var(--text-lg);
		font-weight: 300;
		line-height: 1.35;
	}

	.body :global(strong) {
		font-weight: 700;
	}

	/* «To our **lab timeline** ————→»: the wording carries the bold, and a
	   long rule with a head runs on from it. */
	.more {
		margin: 0;
		font-size: var(--text-base);
		font-weight: 300;
	}

	.collage {
		margin-top: var(--space-3);
	}

	@media (max-width: 900px) {
		/* Still a screen per area, under the rail strip. */
		.area {
			min-height: calc(var(--device-h) - 4rem);
			padding-block: var(--space-4);
		}

		.layout {
			max-width: none;
		}
	}
</style>
