import type { SiteLink } from '../../../config/types.js';

/** The link set the chrome tests share — the app's siteLinks() stand-in. */
export const SAMPLE_LINKS: SiteLink[] = [
	{ href: '/what-we-do', label: 'Què fem' },
	{ href: '/who-we-are', label: 'Qui som' },
	{ href: '/weeklies', label: 'Weeklies' },
	{ href: '/transparency', label: 'Transparència' },
	{ href: '/get-involved', label: "Implica-t'hi" }
];
