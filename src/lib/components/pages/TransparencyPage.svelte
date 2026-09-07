<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { MilestoneData } from '../../content/types.js';
	import type { CollectionRef } from '../../edit/types.js';
	import type { MilestoneEditMap } from '../timeline/TimelineMilestone.svelte';

	/**
	 * What a CMS may open on /transparency. `milestones` names the timeline's
	 * collection (add slots, removes); the category chips edit through
	 * `config.messageEdit` over their own `category_*` keys, and the search
	 * placeholder through the box's panel — neither needs a member here.
	 */
	export interface TransparencyPageEdit {
		copy?: CopyEditFor<'transparency'>;
		milestoneFor?: (milestone: MilestoneData) => MilestoneEditMap | undefined;
		milestones?: CollectionRef;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import { MILESTONE_CATEGORIES, type MilestoneCategory } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import { chromeProperty } from '../../edit/helpers.js';
	import { matchesMilestoneFilter, milestoneCategoryLabel } from '../../utils/milestones.js';
	import { createUrlFilters } from '../../utils/url-filters.svelte.js';
	import PageShell from '../layout/PageShell.svelte';
	import Timeline from '../timeline/Timeline.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';
	import FilterChips from '../ui/FilterChips.svelte';
	import SearchInput from '../ui/SearchInput.svelte';

	/** The two filters, as they ride the URL. An alias: createUrlFilters needs an index signature. */
	type TimelineFilters = { q: string; category: MilestoneCategory | null };

	/**
	 * The full milestone history with a search box and category chips. The
	 * whole timeline is already loaded, so filtering stays in the browser
	 * (`matchesMilestoneFilter`); only the URL is mirrored, through the
	 * host's shallow-routing write — the package has no router.
	 */
	interface Props {
		content: PageCopy<'transparency'>;
		milestones: MilestoneData[];
		/** The server-parsed filters of a deep link; invalid values already fell back. */
		query: TimelineFilters;
		/** Shallow-routing URL write — see UrlFiltersConfig.replaceUrl. */
		replaceUrl: (path: string) => void;
		edit?: TransparencyPageEdit;
	}

	let { content, milestones, query, replaceUrl, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const filters = createUrlFilters<TimelineFilters>({
		path: '/transparency',
		initial: () => ({ q: query.q, category: query.category }),
		toQuery: (values) => ({ q: values.q, category: values.category }),
		replaceUrl: (path) => replaceUrl(path)
	});

	// $derived, not a const: the labels resolve to STRINGS through `msg`, and
	// a CMS switching its editing locale (or saving a wording) repaints every
	// other string on the page — the chips must follow.
	const chips = $derived(
		MILESTONE_CATEGORIES.map((value) => ({ value, label: milestoneCategoryLabel(value, msg) }))
	);

	const filtered = $derived(
		milestones.filter((milestone) => matchesMilestoneFilter(milestone, filters.values))
	);

	const isCategory = (value: string | null): value is MilestoneCategory =>
		value !== null && (MILESTONE_CATEGORIES as readonly string[]).includes(value);

	function handleSearch(value: string): void {
		filters.update({ q: value });
	}

	function handleCategory(value: string | null): void {
		filters.update({ category: isCategory(value) ? value : null });
	}

	/** A chip's wording is a catalog key — `category_lab` for `lab`. */
	const categoryKey = (category: MilestoneCategory) => `category_${category}` as const;

	const placeholderProperty = $derived(
		config.messageEdit
			? chromeProperty('timeline_searchPlaceholder', {
					type: 'text',
					locale: config.locale(),
					label: msg.timeline_searchPlaceholder()
				})
			: undefined
	);
</script>

<PageShell title={content.heading} variant="wide">
	<header>
		<Editable edit={edit?.copy?.('heading')} value={content.heading}>
			{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
		</Editable>
		<CopyIntro text={content.intro} edit={edit?.copy?.('intro')} />
	</header>

	<div class="controls">
		<SearchInput
			value={filters.values.q}
			placeholder={msg.timeline_searchPlaceholder()}
			label={msg.timeline_searchPlaceholder()}
			onsearch={handleSearch}
			placeholderEdit={placeholderProperty}
		/>
		<FilterChips
			{chips}
			selected={filters.values.category}
			label={msg.timeline_filterLabel()}
			onchange={handleCategory}
			editFor={(chip) =>
				isCategory(chip.value) ? config.messageEdit?.(categoryKey(chip.value)) : undefined}
		/>
	</div>

	<section aria-live="polite" aria-label={msg.timeline_label()}>
		{#if filtered.length === 0}
			<Editable edit={config.messageEdit?.('timeline_empty')} value={msg.timeline_empty()}>
				{#snippet children(text, attrs)}<p class="empty" {...attrs}>{text}</p>{/snippet}
			</Editable>
		{:else}
			<Timeline
				milestones={filtered}
				variant="full"
				editFor={edit?.milestoneFor}
				collection={edit?.milestones}
			/>
		{/if}
	</section>
</PageShell>

<style>
	header,
	.controls {
		max-width: var(--content-max);
		margin-inline: auto;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: center;
		margin-block: var(--space-4);
	}

	.empty {
		max-width: var(--content-max);
		margin-inline: auto;
		color: var(--color-ink-secondary);
		padding-block: var(--space-5);
	}
</style>
