/**
 * How a page names itself to the browser: `title — siteName`, or the site name
 * alone.
 *
 * The format had two owners. `PageShell` composed it from `UiConfig.siteName`,
 * and fndvit-website's `$lib/site` composed it again for the one page that
 * cannot render through `PageShell` — its error page, whose centred layout is
 * not one of the six variants. Both spelled the same expression, both
 * comments noted that the other existed, and `site.test.ts` pinned the result
 * as the literal `'Transparència — ViT'`: change the separator in the package
 * and the error page drifts with nothing failing.
 *
 * It lives on `./contract` rather than in `UiConfig` because a config field
 * would need a package DEFAULT, and that default is the expression — the
 * duplication would survive the move. No host wants a separator of its own;
 * one is a hypothetical seam.
 *
 * `siteName` is a parameter rather than a read, so this stays component-free
 * and a server module can call it (fndvit-website's `$lib/site` supplies
 * `SITE_NAME`, `PageShell` supplies `config.siteName`).
 */
export function documentTitle(title: string, siteName: string): string {
	// An empty title is a REAL state, not a guard: pages title themselves from
	// page copy and `content.getPage` returns '' for a missing row, so the site
	// name alone must ship rather than a dangling separator.
	return title ? `${title} — ${siteName}` : siteName;
}
