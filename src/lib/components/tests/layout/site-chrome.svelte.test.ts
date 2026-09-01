import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from '../../layout/Footer.svelte';
import Nav from '../../layout/Nav.svelte';
import { SAMPLE_LINKS } from './links.js';

/**
 * Nav and Footer render whatever link set the app hands them — the foundation
 * site derives both from one siteLinks() so they cannot drift. This asserts
 * the two components render a given set faithfully, and that both name the
 * site from the config's one owner.
 */
const hrefs = (root: ParentNode, selector: string): string[] =>
	[...root.querySelectorAll<HTMLAnchorElement>(selector)].map((a) => new URL(a.href).pathname);

describe('site chrome', () => {
	it('renders the given link set in the nav', () => {
		const { container } = render(Nav, { props: { links: SAMPLE_LINKS } });

		expect(hrefs(container, 'ul.links a')).toEqual(SAMPLE_LINKS.map((link) => link.href));
	});

	it('renders the same link set in the footer', () => {
		const { container } = render(Footer, { props: { links: SAMPLE_LINKS } });

		expect(hrefs(container, 'footer ul a')).toEqual(SAMPLE_LINKS.map((link) => link.href));
	});

	it('names the site from the config default in both logos', () => {
		const nav = render(Nav, { props: { links: SAMPLE_LINKS } });
		expect(nav.container.querySelector('.logo')?.textContent?.trim()).toBe('ViT');
		nav.unmount();

		const footer = render(Footer, { props: { links: SAMPLE_LINKS } });
		expect(footer.container.querySelector('.logo')?.textContent?.trim()).toBe('ViT');
	});
});
