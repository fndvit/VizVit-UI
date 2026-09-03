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
