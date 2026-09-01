/** Prefix match over a URL pathname: '/what-we-do' covers '/what-we-do/<slug>'. */
export function isPathUnder(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
