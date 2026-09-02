import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import type { WeeklyCardData } from '../content/types.js';
import {
	createWeeklyList,
	WEEKLY_LIST_DEFAULTS,
	type WeeklyListConfig,
	type WeeklyListFilters,
	type WeeklyListServerData
} from './weekly-list.svelte.js';

/**
 * These branches lived in a route file, where nothing could reach them: the
 * server/client reconciliation, the failed-refetch path, and the reset that
 * runs on navigation. Driving the module through its own interface is what
 * makes them assertable — the fetcher, the locale and the URL writer are
 * parameters for exactly that reason.
 */

function card(slug: string): WeeklyCardData {
	return {
		id: 1,
		number: 1,
		slug,
		publishedOn: '2026-01-01',
		title: slug,
		excerpt: '',
		imageUrl: ''
	};
}

function serverData(overrides: Partial<WeeklyListServerData> = {}): WeeklyListServerData {
	return {
		weeklies: [card('server-a'), card('server-b')],
		total: 30,
		page: 2,
		pageSize: 12,
		query: { q: '', theme: null, sort: 'desc' },
		...overrides
	};
}

function setup(options: { fetchPage?: WeeklyListConfig['fetchPage'] } = {}) {
	const urls: string[] = [];
	let data = $state(serverData());
	let list!: ReturnType<typeof createWeeklyList>;

	const stop = $effect.root(() => {
		list = createWeeklyList({
			server: () => data,
			fetchPage: options.fetchPage ?? (async () => ({ items: [card('client')], total: 1 })),
			locale: () => 'ca',
			replaceUrl: (path) => urls.push(path)
		});
	});
	flushSync();

	return {
		get list() {
			return list;
		},
		urls,
		stop,
		/** Stands in for a real navigation: the load re-runs and replaces data. */
		navigate(next: Partial<WeeklyListServerData> = {}) {
			data = serverData(next);
			flushSync();
		}
	};
}

/**
 * The host's half of the URL contract, as the site's query schema reads a
 * URL: an absent param takes the declared default. Stated here so the test
 * below can cross both halves inside the package.
 */
function parseListUrl(href: string): WeeklyListFilters & { page: number } {
	const params = new URL(href, 'https://example.org').searchParams;
	return {
		q: params.get('q') ?? '',
		theme: params.get('theme'),
		sort: (params.get('sort') as WeeklyListFilters['sort'] | null) ?? WEEKLY_LIST_DEFAULTS.sort,
		page: Number(params.get('page') ?? WEEKLY_LIST_DEFAULTS.page)
	};
}

describe('createWeeklyList', () => {
	it('reports the server-rendered page until a filter changes', () => {
		const h = setup();

		expect(h.list.items.map((w) => w.slug)).toEqual(['server-a', 'server-b']);
		expect(h.list.total).toBe(30);
		expect(h.list.page).toBe(2);
		h.stop();
	});

	it('refetches on a filter change and returns to the first page', async () => {
		const h = setup();

		h.list.update({ q: 'dades' });

		await vi.waitFor(() => expect(h.list.items.map((w) => w.slug)).toEqual(['client']));
		expect(h.list.total).toBe(1);
		// The server still says page 2; a refetched filter always shows page 1.
		expect(h.list.page).toBe(1);
		h.stop();
	});

	it('hands the fetcher the filters, the page size and the locale', async () => {
		const fetchPage = vi.fn(async () => ({ items: [card('client')], total: 1 }));
		const h = setup({ fetchPage });

		h.list.update({ q: 'dades', theme: 'salut', sort: 'asc' });

		await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));
		expect(fetchPage).toHaveBeenCalledWith({
			q: 'dades',
			theme: 'salut',
			sort: 'asc',
			limit: 12,
			locale: 'ca'
		});
		h.stop();
	});

	it('mirrors the filter into the URL and drops the stale page number', () => {
		const h = setup();

		h.list.update({ q: 'dades', theme: 'salut' });

		expect(h.urls).toEqual(['/weeklies?q=dades&theme=salut']);
		h.stop();
	});

	it('keeps the stale list on screen when a refetch fails', async () => {
		const h = setup({ fetchPage: async () => Promise.reject(new Error('offline')) });

		h.list.update({ q: 'dades' });

		await vi.waitFor(() => expect(h.list.loadError).toBe(true));
		expect(h.list.items.map((w) => w.slug)).toEqual(['server-a', 'server-b']);
		expect(h.list.isLoading).toBe(false);
		h.stop();
	});

	it('clears a failed refetch on the next navigation', async () => {
		// The bug this module was extracted to fix: the route file reset the two
		// lists but not loadError, so the alert stayed on screen above fresh
		// results for the rest of the visit.
		const h = setup({ fetchPage: async () => Promise.reject(new Error('offline')) });
		h.list.update({ q: 'dades' });
		await vi.waitFor(() => expect(h.list.loadError).toBe(true));

		h.navigate({ page: 3 });

		expect(h.list.loadError).toBe(false);
		expect(h.list.page).toBe(3);
		h.stop();
	});

	it('drops the client override on navigation so the URL and the grid agree', async () => {
		const h = setup();
		h.list.update({ q: 'dades' });
		await vi.waitFor(() => expect(h.list.page).toBe(1));

		h.navigate({ page: 3, weeklies: [card('page-three')] });

		expect(h.list.items.map((w) => w.slug)).toEqual(['page-three']);
		expect(h.list.page).toBe(3);
		h.stop();
	});

	it('re-seeds the filters when a navigation carries different ones', async () => {
		// The header's own "Weeklies" link, followed from /weeklies?theme=salut:
		// a same-route navigation the component survives. The grid followed the
		// server while the chips kept reporting the filter the URL had dropped.
		const h = setup();
		h.list.update({ q: 'dades', theme: 'salut' });
		await vi.waitFor(() => expect(h.list.page).toBe(1));

		h.navigate({ query: { q: '', theme: null, sort: 'desc' } });

		expect(h.list.filters).toEqual({ q: '', theme: null, sort: 'desc' });
		h.stop();
	});

	it('re-seeds from a navigation that arrives with filters of its own', () => {
		const h = setup();

		h.navigate({ query: { q: 'clima', theme: 'lab', sort: 'asc' } });

		expect(h.list.filters).toEqual({ q: 'clima', theme: 'lab', sort: 'asc' });
		// The re-seeded filters are what the paging hrefs must carry.
		expect(h.list.hrefFor(2)).toBe('/weeklies?q=clima&theme=lab&sort=asc&page=2');
		h.stop();
	});

	it('does not re-seed on a client filter change, which never re-runs the load', async () => {
		// replaceState mirrors the filter without re-running the load, so the
		// server data still reports the old query. Re-seeding from it here would
		// undo the reader's own filtering on the next flush.
		const h = setup();

		h.list.update({ theme: 'salut' });
		await vi.waitFor(() => expect(h.list.page).toBe(1));
		flushSync();

		expect(h.list.filters.theme).toBe('salut');
		h.stop();
	});

	it('builds page hrefs that carry the filters and omit page one', () => {
		const h = setup();

		h.list.update({ theme: 'salut' });

		expect(h.list.hrefFor(1)).toBe('/weeklies?theme=salut');
		expect(h.list.hrefFor(4)).toBe('/weeklies?theme=salut&page=4');
		h.stop();
	});

	it('keeps a non-default sort in the URL and leaves the default out', () => {
		const h = setup();

		h.list.update({ sort: 'asc' });
		expect(h.list.hrefFor(2)).toBe('/weeklies?sort=asc&page=2');

		h.list.update({ sort: 'desc' });
		expect(h.list.hrefFor(2)).toBe('/weeklies?page=2');
		h.stop();
	});

	it('builds URLs that parse back to the filters they were built from', () => {
		// The two halves of the URL contract live in different modules: this one
		// omits a value it considers default, and the host's query schema
		// supplies one when a param is absent. They have to name the same value
		// — WEEKLY_LIST_DEFAULTS is exported so the schema can derive its
		// defaults from it — and only a test that crosses both notices when
		// they stop.
		const h = setup();

		for (const filters of [
			{ q: '', theme: null, sort: 'desc' as const },
			{ q: 'clima', theme: 'lab', sort: 'asc' as const },
			{ q: '', theme: null, sort: 'asc' as const }
		]) {
			h.list.update(filters);

			const parsed = parseListUrl(h.list.hrefFor(1));

			expect({ q: parsed.q, theme: parsed.theme, sort: parsed.sort }).toEqual(filters);
			expect(parsed.page).toBe(WEEKLY_LIST_DEFAULTS.page);
		}
		h.stop();
	});
});
