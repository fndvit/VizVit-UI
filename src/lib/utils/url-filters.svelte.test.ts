import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { createUrlFilters } from './url-filters.svelte.js';

/**
 * The re-seed rule this module owns produced two different symptoms on the
 * site — /weeklies contradicting its own chips, /transparency filtering by a
 * chip the URL had dropped — and the omitted `onChange` is exactly the
 * /transparency shape, which no component test renders. `replaceUrl` is
 * injected for the reason it is a parameter: the real one is the host's
 * shallow routing, which needs a live router.
 */

interface Filters extends Record<string, unknown> {
	q: string;
	category: string | null;
}

function setup(options: { onChange?: () => void } = {}) {
	const urls: string[] = [];
	let server = $state<Filters>({ q: '', category: null });
	let filters!: ReturnType<typeof createUrlFilters<Filters>>;

	const stop = $effect.root(() => {
		filters = createUrlFilters<Filters>({
			path: '/transparency',
			initial: () => server,
			toQuery: (values) => ({ q: values.q, category: values.category }),
			onChange: options.onChange,
			replaceUrl: (path) => urls.push(path)
		});
	});
	flushSync();

	return {
		get filters() {
			return filters;
		},
		urls,
		stop,
		/** Stands in for a real navigation: the load re-runs and replaces data. */
		navigate(next: Partial<Filters>) {
			server = { ...server, ...next };
			flushSync();
		}
	};
}

describe('createUrlFilters', () => {
	it('seeds from the values the server rendered', () => {
		const h = setup();

		expect(h.filters.values).toEqual({ q: '', category: null });
		h.stop();
	});

	it('mirrors a change into the URL through the path it was given', () => {
		const h = setup();

		h.filters.update({ q: 'pressupost', category: 'finances' });

		expect(h.filters.values).toEqual({ q: 'pressupost', category: 'finances' });
		expect(h.urls).toEqual(['/transparency?q=pressupost&category=finances']);
		h.stop();
	});

	it('exposes the params riding the URL so a caller can add its own', () => {
		// The weeklies index appends a page number to these; what that means,
		// and when it survives a filter change, is the caller's rule.
		const h = setup();

		h.filters.update({ q: 'pressupost' });

		expect(h.filters.query).toEqual({ q: 'pressupost', category: null });
		h.stop();
	});

	it('notifies after mirroring, so a caller refetches against the new URL', () => {
		const seen: string[][] = [];
		// Reads the mirrored URLs at notify time, which is what pins the order.
		const h = setup({ onChange: () => seen.push([...h.urls]) });

		h.filters.update({ q: 'pressupost' });

		expect(seen).toEqual([['/transparency?q=pressupost']]);
		h.stop();
	});

	it('applies a change with no onChange at all', () => {
		// The /transparency shape: it filters the list it already has, so there
		// is nothing to notify. An unguarded call here would throw on every
		// chip click on that page.
		const h = setup();

		expect(() => h.filters.update({ category: 'finances' })).not.toThrow();
		expect(h.filters.values.category).toBe('finances');
		expect(h.urls).toEqual(['/transparency?category=finances']);
		h.stop();
	});

	it('re-seeds when a navigation sends different values', () => {
		// The bug the module exists for: `initial` was read once, so following
		// the header's own link from an already-filtered page left the controls
		// showing the previous filter.
		const h = setup();

		h.filters.update({ q: 'pressupost' });
		h.navigate({ q: 'dades', category: 'salut' });

		expect(h.filters.values).toEqual({ q: 'dades', category: 'salut' });
		h.stop();
	});

	it('does not undo a client change the server has not answered', () => {
		// Mirroring goes through replaceState, which does not re-run the load —
		// so `initial()` still reports what the server last sent. Re-seeding on
		// that would fight the reader's own filtering.
		const h = setup();

		h.filters.update({ q: 'pressupost' });
		flushSync();

		expect(h.filters.values.q).toBe('pressupost');
		h.stop();
	});

	it('notifies once per change rather than once per mirrored param', () => {
		const onChange = vi.fn();
		const h = setup({ onChange });

		h.filters.update({ q: 'pressupost', category: 'finances' });

		expect(onChange).toHaveBeenCalledTimes(1);
		h.stop();
	});
});
