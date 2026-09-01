import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Nav from '../../layout/Nav.svelte';
import { defaultMessages as m } from '../../../config/messages.js';
import { SAMPLE_LINKS } from './links.js';
import NavConfigProbe from './NavConfigProbe.svelte';

/**
 * Current-page highlighting and the locale switcher both read the URL, which
 * comes in as a prop (tests, stories) or through UiConfig.url (apps).
 *
 * The link set itself belongs to site-chrome.svelte.test.ts; this covers what
 * Nav does with the URL it is given.
 */
function renderAt(url: string, account: { displayName: string } | null = null) {
	return render(Nav, { props: { links: SAMPLE_LINKS, url: new URL(url), account } });
}

const current = (root: ParentNode): string[] =>
	[...root.querySelectorAll<HTMLAnchorElement>('a[aria-current="page"]')].map(
		(a) => a.textContent?.trim() ?? ''
	);

describe('Nav', () => {
	it('marks no primary link as current on the home page', () => {
		const { container } = renderAt('https://fundaciovit.org/');

		expect(current(container)).toEqual([]);
	});

	it('marks the section a page belongs to', () => {
		const { container } = renderAt('https://fundaciovit.org/what-we-do');

		expect(current(container)).toHaveLength(1);
	});

	// /what-we-do stays current on /what-we-do/<slug> — the reason isPathUnder
	// exists rather than an equality check.
	it('keeps the section current on a nested page', () => {
		const nested = renderAt('https://fundaciovit.org/what-we-do/dades-obertes');
		const parent = renderAt('https://fundaciovit.org/what-we-do');

		expect(current(nested.container)).toEqual(current(parent.container));
		expect(current(nested.container)).toHaveLength(1);
	});

	// Nav renders in the root layout and is never remounted, so isMenuOpen
	// survives navigation unless something closes it.
	it('closes the mobile menu when the reader navigates', async () => {
		const screen = renderAt('https://fundaciovit.org/');
		const toggle = page.getByRole('button', { name: m.nav_menuLabel() });

		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');

		await screen.rerender({
			links: SAMPLE_LINKS,
			url: new URL('https://fundaciovit.org/weeklies'),
			account: null
		});

		// Otherwise the menu stays open over the page just navigated to, still
		// asserting aria-expanded, with the whole of it to tab back through.
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	it('does not mark a section current from a same-prefix sibling', () => {
		// '/what-we-do-not' must not match '/what-we-do'.
		const { container } = renderAt('https://fundaciovit.org/what-we-do-not');

		expect(current(container)).toEqual([]);
	});

	// The de-localization itself belongs to the app (UiConfig.canonicalPathname);
	// this pins that Nav highlights through whatever the config answers.
	it('reads the current path through the config canonicalPathname', () => {
		const localized = render(NavConfigProbe, {
			props: { links: SAMPLE_LINKS, url: new URL('https://fundaciovit.org/en/what-we-do') }
		});
		const base = renderAt('https://fundaciovit.org/what-we-do');

		expect(current(localized.container)).toEqual(current(base.container));
		expect(current(localized.container)).toHaveLength(1);
	});

	it('keeps the query string on the locale switcher links', () => {
		const { container } = renderAt('https://fundaciovit.org/weeklies?q=dades&page=2');

		const localeLinks = [...container.querySelectorAll<HTMLAnchorElement>('ul.locales a')];
		expect(localeLinks.length).toBeGreaterThan(0);
		for (const link of localeLinks) {
			expect(new URL(link.href).search).toBe('?q=dades&page=2');
		}
	});

	it('marks the account item current on the account page', () => {
		const { container } = renderAt('https://fundaciovit.org/account', { displayName: 'Membre' });

		expect(current(container)).toContain('Membre');
	});
});
