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
