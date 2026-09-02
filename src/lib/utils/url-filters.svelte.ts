import { buildQueryString } from './paths.js';

export interface UrlFiltersConfig<T extends Record<string, unknown>> {
	/** Unlocalized path the query string is appended to. */
	path: string;
	/**
	 * The server-rendered values. A thunk so callers reference props in a
	 * closure; read inside an effect, so it tracks them and re-seeds when a
	 * navigation changes what the server sent.
	 */
	initial: () => T;
	/** Which values ride the URL. Null/undefined/empty entries are dropped. */
	toQuery: (values: T) => Record<string, string | null | undefined>;
	/** Runs after the URL is mirrored; omit for purely client-side filtering. */
	onChange?: () => void;
	/**
	 * How a mirrored URL is written. Required, not defaulted: shallow routing
	 * is the host's router's (SvelteKit's `replaceState` through its locale
	 * prefixing), and the package has no router — the same reason hrefs
	 * resolve through `UiConfig.href`.
	 */
	replaceUrl: (path: string) => void;
}

export interface UrlFilters<T extends Record<string, unknown>> {
	/** Current filter values, for the controls to render. */
	readonly values: T;
	/**
	 * The params riding the URL for the current values. Exposed so a caller
	 * can build a URL that carries the filters plus something of its own —
	 * the weeklies index adds a page number. What that extra means, and when
	 * it survives a filter change, is the caller's rule.
	 */
	readonly query: Record<string, string | null | undefined>;
	/** Applies a change, mirrors it into the URL, then notifies. */
	update(patch: Partial<T>): void;
}

/**
 * Filter state that lives in the URL, in both directions: seeded from the
 * values the server rendered, mirrored back on every client change so the
 * page stays deep-linkable, and re-seeded whenever the server sends
 * different ones.
 *
 * The site's /weeklies and /transparency each wrote this by hand — the
 * seeding, the mirroring, and a handful of `state_referenced_locally`
 * suppressions apiece. `initial` is a thunk, so a page reads its
 * server-rendered data inside a closure, which is what the compiler asked for.
 *
 * The client→URL direction alone was not enough. Read once, `initial` left a
 * same-route navigation carrying different filters — the header's own
 * "Weeklies" link, followed from /weeklies?theme=salut — with the controls
 * displaying the previous filter while the page below showed the server's
 * unfiltered answer. Which surface went stale differed per caller: one
 * contradicted its own chips, the other kept filtering by a chip the URL no
 * longer carried. One rule, two symptoms, so it lives here and not in either.
 *
 * What a page does *with* a change stays the page's — refetch through a
 * remote function, or filter a list it already has — which is why this owns
 * the URL and not the filtering.
 */
export function createUrlFilters<T extends Record<string, unknown>>(
	config: UrlFiltersConfig<T>
): UrlFilters<T> {
	const values = $state<T>({ ...config.initial() });

	// A client change mirrors through replaceState, which does not re-run the
	// load — so `initial()` still reports what the server last sent and this
	// does not fight the reader's own filtering. It fires on a real
	// navigation, exactly when the controls would otherwise keep old filters.
	$effect(() => {
		Object.assign(values, config.initial());
	});

	return {
		get values(): T {
			return values;
		},
		get query(): Record<string, string | null | undefined> {
			return config.toQuery(values);
		},
		update(patch: Partial<T>): void {
			Object.assign(values, patch);
			config.replaceUrl(`${config.path}${buildQueryString(config.toQuery(values))}`);
			config.onChange?.();
		}
	};
}
