import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { SidebarItem } from '../../admin/Sidebar.svelte';
import SidebarProbe from './SidebarProbe.svelte';

const ITEMS: SidebarItem[] = [
	{ href: '/', icon: 'home', label: 'Inici' },
	{ href: '/website', icon: 'globe', label: 'Web' },
	{ href: '/settings', icon: 'gear', label: 'Configuració' }
];

/**
 * Sidebar is the genericized admin rail: the host hands it already-filtered
 * items and its own footer control; the package owns only rendering and the
 * current-path highlight.
 */
describe('Sidebar (admin)', () => {
	it('renders one labelled link per item, in order', async () => {
		render(SidebarProbe, { items: ITEMS });

		const links = [...document.querySelectorAll('nav a')];
		expect(links.map((a) => a.getAttribute('aria-label'))).toEqual([
			'Inici',
			'Web',
			'Configuració'
		]);
	});

	it('marks the section owning the current path, including subpages', async () => {
		render(SidebarProbe, { items: ITEMS, url: new URL('http://localhost/website/pages/home') });

		const current = document.querySelector('nav a[aria-current="page"]');
		expect(current?.getAttribute('href')).toBe('/website');
	});

	it('never lets the root item claim other sections', async () => {
		// '/' is under '/' by the path rule, so it gets an exact-match exception.
		render(SidebarProbe, { items: ITEMS, url: new URL('http://localhost/settings') });

		const marked = [...document.querySelectorAll('nav a[aria-current="page"]')];
		expect(marked.map((a) => a.getAttribute('href'))).toEqual(['/settings']);
	});

	it('renders the host logo and footer snippets', async () => {
		render(SidebarProbe, { items: ITEMS, withFooter: true });

		expect(document.querySelector('[data-testid="logo"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="logout"]')).not.toBeNull();
	});
});
