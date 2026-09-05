import { describe, expect, it } from 'vitest';
import {
	WEEKLY_LIST_DEFAULTS,
	WEEKLY_LIST_PARAMS,
	parseWeeklyListUrl
} from './weekly-list-contract.js';

/**
 * The READ half of the weeklies URL contract, on its own.
 *
 * `weekly-list.svelte.test.ts` crosses it against the write half, which is the
 * assertion that matters and the one that could not fail before this function
 * existed. These cases are the tolerance: what a hand-edited or stale URL
 * means, which is a decision two hosts were each making separately.
 *
 * A plain `.test.ts` on purpose — the module is component-free, so this runs in
 * the `server` project without the compiler, exactly as a host's
 * `+page.server.ts` reads it.
 */
describe('parseWeeklyListUrl', () => {
	it('reads all four params', () => {
		expect(parseWeeklyListUrl('/weeklies?q=clima&theme=lab&sort=asc&page=3')).toEqual({
			q: 'clima',
			theme: 'lab',
			sort: 'asc',
			page: 3
		});
	});

	/** An absent param takes the value the write half omitted it FOR. */
	it('an empty URL is the declared defaults', () => {
		expect(parseWeeklyListUrl('/weeklies')).toEqual({
			q: '',
			theme: null,
			sort: WEEKLY_LIST_DEFAULTS.sort,
			page: WEEKLY_LIST_DEFAULTS.page
		});
	});

	/**
	 * Tolerant, because these URLs are shared and hand-edited: a junk value
	 * falls back rather than refusing the page. `sort` admits only the two
	 * directions — a cast would have let `?sort=sideways` reach a repository's
	 * ORDER BY.
	 */
	it.each(['?sort=sideways', '?sort=', '?sort=ASC', '?sort=descending'])(
		'%s is not a sort direction',
		(query) => {
			expect(parseWeeklyListUrl(`/weeklies${query}`).sort).toBe(WEEKLY_LIST_DEFAULTS.sort);
		}
	);

	it.each(['?page=nope', '?page=0', '?page=-3', '?page=', '?page=1.9'])(
		'%s is the first page',
		(query) => {
			expect(parseWeeklyListUrl(`/weeklies${query}`).page).toBe(WEEKLY_LIST_DEFAULTS.page);
		}
	);

	it('a theme is absent as null, not as an empty string', () => {
		expect(parseWeeklyListUrl('/weeklies').theme).toBeNull();
		expect(parseWeeklyListUrl('/weeklies?theme=').theme).toBe('');
	});

	/** `hrefFor` writes a relative href, so the parse must take one. */
	it('takes a relative href and an absolute URL alike', () => {
		const relative = parseWeeklyListUrl('/weeklies?q=clima');
		const absolute = parseWeeklyListUrl(new URL('https://fundaciovit.org/weeklies?q=clima'));

		expect(relative).toEqual(absolute);
	});

	/**
	 * The names a host's query schema has to agree with. fndvit-website spells
	 * all four as zod fields, and until this list existed nothing said they were
	 * these four.
	 */
	it('names the four params the parse actually reads', () => {
		expect(WEEKLY_LIST_PARAMS).toEqual(['q', 'theme', 'sort', 'page']);

		const read = parseWeeklyListUrl(
			`/weeklies?${WEEKLY_LIST_PARAMS.map((name) => `${name}=x`).join('&')}`
		);
		// Every name reached something: `q` and `theme` take the value, and the
		// two that refuse 'x' fall back rather than being ignored outright.
		expect(read.q).toBe('x');
		expect(read.theme).toBe('x');
		expect(read.sort).toBe(WEEKLY_LIST_DEFAULTS.sort);
		expect(read.page).toBe(WEEKLY_LIST_DEFAULTS.page);
	});
});
