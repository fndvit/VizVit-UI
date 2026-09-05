/**
 * The four path rules, and which doors they go out of.
 *
 * This note used to live in `index.ts` and argue that only `buildQueryString`
 * was exported, that the other three were private, and that exporting them
 * "would pin their behaviour into semver for no reader". All three claims had
 * stopped being true:
 *
 * - `contract.ts` exports all four, and has since the subpath reached both
 *   hosts.
 * - Two of them DO have a host reader. fndvit-website's repository integration
 *   suite asserts the `site_links.href` check constraint against
 *   `isInternalPath` byte for byte, and the https columns against
 *   `isExternalUrl` — that binding is the whole reason those cases exist, and
 *   it is why these two belong on `./contract`: a CHECK constraint is a
 *   server-side rule, and the classifier that has to agree with it must be
 *   importable without loading a component.
 * - fndvit-website does not re-export `buildQueryString` from its `nav.ts`
 *   any more; that pass-through is deleted and its one reader imports the
 *   package directly.
 *
 * What the old note got right is the principle, and `isPathUnder` is the name
 * it applies to: it is the prefix match `Nav` and `Sidebar` highlight the
 * current section with, both of them reach it by relative import, and no host
 * has ever imported it. So it is the one of the four that stays in, held by
 * `paths.test.ts` rather than by semver.
 */

/** Prefix match over a URL pathname: '/what-we-do' covers '/what-we-do/<slug>'. */
export function isPathUnder(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Builds "?a=1&b=2" from the truthy entries, or "" when none remain — the one
 * way a filter or a page number joins a canonical path, so the URL a list
 * mirrors and the hrefs it renders are spelled by the same function.
 */
export function buildQueryString(params: Record<string, string | null | undefined>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value) search.set(key, value);
	}
	const encoded = search.toString();
	return encoded ? `?${encoded}` : '';
}

/**
 * Whether a destination is a ROOT-RELATIVE path — the only shape `Link` will
 * resolve, and what "internal" means everywhere in this package.
 *
 * One leading slash, and the second character must not be another slash:
 * '//evil.example' is protocol-relative and leaves the site. A bare scheme is
 * not a path either, so 'javascript:alert(1)' fails here — which is the point.
 */
export function isInternalPath(href: string): boolean {
	return /^\/([^/]|$)/.test(href);
}

/**
 * Whether a destination is an EXTERNAL URL this package is willing to emit.
 *
 * An allow-list, not a deny-list, and it is the reason this function exists
 * rather than a `!isInternalPath` at each call site: the classifier it
 * replaced accepted ANY scheme followed by '//', so a scheme WITHOUT one —
 * 'javascript:alert(1)' — fell through to the internal branch and reached the
 * locale resolver, which returns it verbatim into an <a href>.
 *
 * Protocol-relative ('//host/path') stays external on purpose: it is another
 * origin, so localizing it would splice a locale segment into someone else's
 * URL, and it carries the page's own scheme rather than a new one. What is
 * excluded is every scheme that is not http(s) — which is where the harm was.
 */
export function isExternalUrl(href: string): boolean {
	return /^(?:https?:)?\/\/[^/]/i.test(href);
}
