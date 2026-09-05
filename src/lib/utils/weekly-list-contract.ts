import type { SortDirection, WeeklyCardData } from '../content/types.js';

/**
 * The weeklies index's contract, without the view that runs it.
 *
 * `createWeeklyList` needs the Svelte compiler — four `$state` cells, an
 * `$effect` and three `$derived` — so it lives in a `.svelte.ts` rune module.
 * These four names do not: they are what a HOST has to agree with this
 * package about before any of that runs, and a host agrees with them on the
 * server. `+page.server.ts` builds `WeeklyListServerData`, a query schema
 * takes its defaults from `WEEKLY_LIST_DEFAULTS`, and a repository answers
 * `WeeklyListPage`.
 *
 * They were in the rune module, which put them behind `./content` — eight
 * components — and, worse, out of reach of `./contract` altogether, because
 * that subpath's guard refuses a rune module by name (they need the
 * compiler, so a server import of one is the defect the guard exists to
 * catch). So the release that gave `pageSize` an owner, to end a restatement
 * in two repositories that cannot import each other, shipped it where
 * neither host's server could import it: fndvit-website's
 * `schemas/weekly.ts` reaches it through `./content` and is itself read by
 * `routes/weeklies/+page.server.ts`.
 *
 * Splitting the file is the whole fix. Nothing moves for a component host —
 * `./content` still exports every name from here — and the four facts a
 * server needs stop being locked behind a graph it must not load.
 */

/**
 * The weeklies index's URL defaults: the value a param stands for when it is
 * absent. Both halves of the URL contract — `createWeeklyList` omitting a
 * default, the host's query schema supplying one — must name the same values,
 * so a host derives its schema defaults from here rather than restating them.
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

/**
 * The four params this list travels as, in the order a URL reads.
 *
 * Exported so a host's query schema can be bound to them rather than agreeing
 * by coincidence: fndvit-website's `weeklyListQuerySchema` names all four as
 * zod fields, and nothing said they were these four.
 */
export const WEEKLY_LIST_PARAMS = ['q', 'theme', 'sort', 'page'] as const;

/**
 * The READ half of the weeklies URL contract — what a URL this package wrote
 * means when it comes back.
 *
 * `WEEKLY_LIST_DEFAULTS` gave the VALUES one owner and both hosts derive from
 * it correctly. The param NAMES and the parse had none: they were spelled four
 * times across three repositories — `toQuery`/`hrefFor` here, a `parseListUrl`
 * declared inside this package's own test, `weeklyListQuerySchema` in
 * fndvit-website and `weeklyQuery` in vit-brain — and the two repositories
 * cannot import each other, so nothing could disagree out loud. vit-brain's
 * docblock states the failure exactly: rename a param here and the read side
 * drops the filter silently while the write side keeps producing it.
 *
 * Worse, the round-trip case that exists to catch precisely that
 * ("builds URLs that parse back to the filters they were built from") crossed
 * the write half against the stand-in in the test file, not against either
 * real reader. It could not fail for the reason it was written.
 *
 * TOLERANT, because these URLs are shared and hand-edited: an unknown sort or
 * a junk page falls back to its default rather than refusing the page. A host
 * may still layer its own tolerance on top — fndvit-website trims and caps
 * lengths in zod, vit-brain clamps nothing further — but the names, and what
 * an absent or bad value means, are answered once, here.
 */
export function parseWeeklyListUrl(url: URL | string): WeeklyListFilters & { page: number } {
	// A relative href (`hrefFor` writes one) needs a base to parse against; it
	// is never read, only discarded with the rest of the origin.
	const params = (typeof url === 'string' ? new URL(url, 'https://weekly-list.invalid') : url)
		.searchParams;
	const sort = params.get('sort');
	const page = Math.trunc(Number(params.get('page')));
	return {
		q: params.get('q') ?? '',
		theme: params.get('theme'),
		sort: sort === 'asc' || sort === 'desc' ? sort : WEEKLY_LIST_DEFAULTS.sort,
		page: page >= WEEKLY_LIST_DEFAULTS.page ? page : WEEKLY_LIST_DEFAULTS.page
	};
}
