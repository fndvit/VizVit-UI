import type { Locale } from '../config/types.js';
import type { SortDirection, WeeklyCardData } from '../content/types.js';
import { buildQueryString } from './paths.js';
import { createUrlFilters } from './url-filters.svelte.js';

/**
 * The weeklies index's URL defaults: the value a param stands for when it is
 * absent. Both halves of the URL contract — this module omitting a default,
 * the host's query schema supplying one — must name the same values, so a
 * host derives its schema defaults from here rather than restating them.
 *
 * `pageSize` is here for the same reason one step further out. It is not a
 * URL param: it is what a page of this list HOLDS, which the grid this
 * package renders decides. Every host was spelling its own — fndvit-website
 * as `WEEKLIES_PAGE_SIZE`, vit-brain's mirror as a bare `12` in markup — and
 * the two must agree, because the mirror exists to page the same corpus the
 * site pages. Two repositories that cannot import each other were each
 * holding half of one number. `createWeeklyList` still READS the size from
 * `config.server().pageSize`, so a host may still answer something else; this
 * is the value it should answer unless it means to differ.
 */
export const WEEKLY_LIST_DEFAULTS = { sort: 'desc', page: 1, pageSize: 12 } as const;

/** The index's path, shared by the mirrored URL and the paging hrefs. */
const WEEKLIES_PATH = '/weeklies';

/** A type alias, not an interface: createUrlFilters needs an index signature. */
export type WeeklyListFilters = {
	q: string;
	theme: string | null;
	sort: SortDirection;
};

/** One page of the list plus the unpaged total (for the pagination). */
export interface WeeklyListPage {
	items: WeeklyCardData[];
	total: number;
}

/** The server-rendered page, re-read on every navigation. */
export interface WeeklyListServerData {
	weeklies: WeeklyCardData[];
	total: number;
	page: number;
	pageSize: number;
	query: WeeklyListFilters;
}

export interface WeeklyListConfig {
	/** Reads the route's `data`; called inside an effect, so it tracks it. */
	server: () => WeeklyListServerData;
	/**
	 * Fetches the first page of a filter — the host's remote query. Required,
	 * like `locale` and `replaceUrl`: the package never talks to a backend, an
	 * i18n runtime or a router, so the site hands in its own three.
	 */
	fetchPage: (input: {
		q?: string;
		theme?: string | null;
		sort: SortDirection;
		limit: number;
		locale: Locale;
	}) => Promise<WeeklyListPage>;
	/** The locale being rendered. Reactive read. */
	locale: () => Locale;
	/** Shallow-routing URL write — see UrlFiltersConfig.replaceUrl. */
	replaceUrl: (path: string) => void;
}

export interface WeeklyList {
	readonly items: WeeklyCardData[];
	readonly total: number;
	/** A client-side refetch always shows the first page of the new filter. */
	readonly page: number;
	readonly isLoading: boolean;
	readonly loadError: boolean;
	/** Current filter values, for the controls to render. */
	readonly filters: WeeklyListFilters;
	/** Href for a 1-based page, carrying the active filters. */
	hrefFor(page: number): string;
	/** Applies a filter change: mirrors the URL, then refetches page one. */
	update(patch: Partial<WeeklyListFilters>): void;
}

/**
 * The weeklies index view: the filters that ride the URL, the page the
 * server rendered, and the page a filter change refetched in place.
 *
 * The two disagree by design — a changed filter returns to the first page
 * while the URL still carries the old one — and reconciling them was four
 * `$state` cells, an `$effect` and three `$derived` sitting in a route file,
 * where nothing could reach them. Two things went wrong there: `loadError`
 * was never cleared on navigation, so a failed refetch kept its alert on
 * screen above fresh results; and a failed refetch left the URL, the grid
 * and the pagination status giving three different answers.
 *
 * `createUrlFilters` owns the URL and deliberately not the fetching, because
 * the transparency page filters client-side over data it already has. This
 * owns the fetching and the reconciliation, for the one page that does both.
 */
export function createWeeklyList(config: WeeklyListConfig): WeeklyList {
	// The client's answer, or null while the server's still stands.
	let clientItems = $state<WeeklyCardData[] | null>(null);
	let clientTotal = $state<number | null>(null);
	let isLoading = $state(false);
	let loadError = $state(false);

	const filters = createUrlFilters<WeeklyListFilters>({
		path: WEEKLIES_PATH,
		initial: () => ({ ...config.server().query }),
		// A param is left out exactly when it holds the value the parse would
		// have supplied anyway, so both sides read the same declaration —
		// otherwise "oldest first" builds a link that reloads as newest-first.
		toQuery: (values) => ({
			q: values.q,
			theme: values.theme,
			sort: values.sort !== WEEKLY_LIST_DEFAULTS.sort ? values.sort : null
		}),
		onChange: () => void refresh(),
		replaceUrl: config.replaceUrl
	});

	$effect(() => {
		// Paging is a real navigation, so the load re-runs and replaces the
		// server data. Reading it here registers the dependency and drops the
		// client override, which would otherwise keep the previous filter's
		// first page on screen while the URL claimed to be on page 2.
		config.server();
		clientItems = null;
		clientTotal = null;
		// Cleared with the rest: the route file reset only the two lists, so a
		// refetch that failed kept its alert across the next navigation.
		loadError = false;
	});

	async function refresh(): Promise<void> {
		isLoading = true;
		const { q, theme, sort } = filters.values;
		try {
			const result = await config.fetchPage({
				q: q || undefined,
				theme,
				sort,
				limit: config.server().pageSize,
				locale: config.locale()
			});
			clientItems = result.items;
			clientTotal = result.total;
			loadError = false;
		} catch {
			// Keep the stale list on screen; `loadError` explains the failure.
			loadError = true;
		} finally {
			isLoading = false;
		}
	}

	return {
		get items(): WeeklyCardData[] {
			return clientItems ?? config.server().weeklies;
		},
		get total(): number {
			return clientTotal ?? config.server().total;
		},
		get page(): number {
			return clientItems ? 1 : config.server().page;
		},
		get isLoading(): boolean {
			return isLoading;
		},
		get loadError(): boolean {
			return loadError;
		},
		get filters(): WeeklyListFilters {
			return filters.values;
		},
		/**
		 * Paging is this module's concern and not the URL module's — the
		 * transparency page filters a list it already has and has no page at
		 * all — so the page number is added here rather than held in the
		 * filter state. That is also what makes a filter change drop it: the
		 * mirrored URL carries only filters, and a changed filter invalidates
		 * the position within the old result set.
		 */
		hrefFor(page: number): string {
			return `${WEEKLIES_PATH}${buildQueryString({
				...filters.query,
				page: page > WEEKLY_LIST_DEFAULTS.page ? String(page) : null
			})}`;
		},
		update(patch: Partial<WeeklyListFilters>): void {
			filters.update(patch);
		}
	};
}
