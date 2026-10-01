import { buildQueryString } from './paths.js';

/**
 * The transparency list's URL contract: the two params it travels as, and
 * the one builder every link to it goes through. The weeklies list had its
 * read half owned (`weekly-list-contract.ts`) and this list had neither:
 * the page spelled `/transparency` and `{ q, category }` by hand, the home
 * page built `?category=` by hand, and two tests restated it.
 *
 * The read side is the host's: fndvit-website's `milestoneListQuerySchema`
 * names the same two params and the category enum.
 */
export const MILESTONE_LIST_PARAMS = ['q', 'category'] as const;

/** The list's path, which a host's localized router prefixes. */
export const TRANSPARENCY_PATH = '/transparency';

export interface MilestoneListFilters {
	q?: string;
	category?: string | null;
}

/**
 * A link to the list, filtered. `base` is the path to append to — the
 * contract's own by default; the home page passes the editable
 * `common_seeAllHref`, so its area links and its «see all» agree.
 */
export function transparencyHref(filters: MilestoneListFilters, base = TRANSPARENCY_PATH): string {
	return `${base}${buildQueryString({ q: filters.q || null, category: filters.category ?? null })}`;
}
