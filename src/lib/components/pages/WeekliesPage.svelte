<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { ThemeData, WeeklyCardData } from '../../content/types.js';
	import type { EditDescriptor } from '../../edit/types.js';
	import type { WeeklyEditMap } from '../weeklies/WeeklieCard.svelte';

	/**
	 * What a CMS may open on /weeklies. A theme chip's wording is a THEME's
	 * localized name — an entity, unlike the category chips — so the host
	 * answers `themeFor` per theme. The search placeholder and the sort
	 * options edit through their panels over `config.messageEdit`; the h1
	 * and the empty state inline over the same gate.
	 */
	export interface WeekliesPageEdit {
		copy?: CopyEditFor<'weeklies'>;
		weeklyFor?: (weekly: WeeklyCardData) => WeeklyEditMap | undefined;
		themeFor?: (theme: ThemeData) => EditDescriptor | undefined;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import type { SortDirection } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import { chromeProperty } from '../../edit/helpers.js';
	import type { WeeklyListServerData } from '../../utils/weekly-list-contract.js';
	import { createWeeklyList, type WeeklyListConfig } from '../../utils/weekly-list.svelte.js';
	import PageShell from '../layout/PageShell.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';
	import FilterChips from '../ui/FilterChips.svelte';
	import Pagination from '../ui/Pagination.svelte';
	import SearchInput from '../ui/SearchInput.svelte';
	import SortSelect from '../weeklies/SortSelect.svelte';
	import WeeklieCard from '../weeklies/WeeklieCard.svelte';

	/**
	 * The weeklies index: theme chips, search, sort, the grid, paging.
	 * Filters, paging, the refetch and the server/client reconciliation are
	 * `createWeeklyList`'s; this renders what it reports. The three things
	 * the package deliberately lacks — a backend, an i18n runtime and a
	 * router — are the host's `fetchPage`, the provider's locale, and
	 * `replaceUrl`.
	 *
	 * The paging links go to `Pagination` UNWRAPPED: it renders them through
	 * `Link`, which resolves every internal path through `UiConfig.href`, so
	 * a host that re-roots the site (vit-brain's `mirrorHref`) must NOT wrap
	 * `hrefFor` itself — that prefixed the path twice.
	 */
	interface Props {
		content: PageCopy<'weeklies'>;
		themes: ThemeData[];
		/** The server-rendered page — the website's route `data` satisfies it as is. */
		server: WeeklyListServerData;
		/** The host's remote query for the first page of a changed filter. */
		fetchPage: WeeklyListConfig['fetchPage'];
		/** Shallow-routing URL write — see UrlFiltersConfig.replaceUrl. */
		replaceUrl: (path: string) => void;
		edit?: WeekliesPageEdit;
	}

	let { content, themes, server, fetchPage, replaceUrl, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const list = createWeeklyList({
		server: () => server,
		fetchPage: (input) => fetchPage(input),
		locale: () => config.locale(),
		replaceUrl: (path) => replaceUrl(path)
	});

	const chips = $derived(themes.map((theme) => ({ value: theme.slug, label: theme.name })));
	const themeEdit = (chip: { value: string }) => {
		const theme = themes.find((candidate) => candidate.slug === chip.value);
		return theme ? edit?.themeFor?.(theme) : undefined;
	};

	// Wording that cannot hold a caret — the placeholder, the two <option>
	// labels — edits through a panel, only where the host exposes `messageEdit`.
	const placeholderProperty = $derived(
		config.messageEdit
			? chromeProperty('weeklies_searchPlaceholder', {
					type: 'text',
					locale: config.locale(),
					label: msg.weeklies_searchPlaceholder()
				})
			: undefined
	);
	const sortOptionProperty = (direction: SortDirection) =>
		config.messageEdit
			? chromeProperty(direction === 'desc' ? 'weeklies_sortDesc' : 'weeklies_sortAsc', {
					type: 'text',
					locale: config.locale(),
					label: direction === 'desc' ? msg.weeklies_sortDesc() : msg.weeklies_sortAsc()
				})
			: undefined;
</script>

<PageShell title={msg.nav_weeklies()}>
	<header>
		<Editable edit={config.messageEdit?.('nav_weeklies')} value={msg.nav_weeklies()}>
			{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
		</Editable>
		<CopyIntro text={content.intro} edit={edit?.copy?.('intro')} />
	</header>

	<div class="controls">
		<FilterChips
			{chips}
			selected={list.filters.theme}
			label={msg.weeklies_filterLabel()}
			onchange={(value) => list.update({ theme: value })}
			editFor={themeEdit}
		/>
		<SearchInput
			value={list.filters.q}
			placeholder={msg.weeklies_searchPlaceholder()}
			label={msg.weeklies_searchPlaceholder()}
			onsearch={(q) => list.update({ q })}
			placeholderEdit={placeholderProperty}
		/>
		<SortSelect
			value={list.filters.sort}
			onchange={(sort) => list.update({ sort })}
			optionsEdit={sortOptionProperty}
		/>
	</div>

	<section
		aria-live="polite"
		aria-busy={list.isLoading}
		aria-label={msg.weeklies_searchResultsLabel()}
	>
		{#if list.loadError}
			<p class="load-error" role="alert">{msg.weeklies_loadError()}</p>
		{/if}
		{#if list.items.length === 0}
			<Editable edit={config.messageEdit?.('weeklies_empty')} value={msg.weeklies_empty()}>
				{#snippet children(text, attrs)}<p class="empty" {...attrs}>{text}</p>{/snippet}
			</Editable>
		{:else}
			<div class="grid">
				{#each list.items as weekly (weekly.slug)}
					<WeeklieCard {weekly} edit={edit?.weeklyFor?.(weekly)} />
				{/each}
			</div>
		{/if}
	</section>

	<Pagination
		page={list.page}
		total={list.total}
		pageSize={server.pageSize}
		href={(page) => list.hrefFor(page)}
	/>
</PageShell>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-4);
		margin-block: var(--space-4);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: var(--space-5) var(--space-4);
	}

	.empty {
		color: var(--color-ink-secondary);
		padding-block: var(--space-5);
	}

	.load-error {
		color: var(--series-8);
		font-weight: 600;
	}
</style>
