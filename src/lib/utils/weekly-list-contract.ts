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
