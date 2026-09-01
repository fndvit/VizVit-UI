import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Pagination from '../../ui/Pagination.svelte';

/**
 * Paging is a navigation, so these are real links: they work without
 * JavaScript, are crawlable, and each page keeps its own URL.
 */
const href = (target: number) => (target > 1 ? `/weeklies?page=${target}` : '/weeklies');

const renderAt = (props: { page: number; total: number; pageSize?: number }) =>
	render(Pagination, { pageSize: 12, href, ...props });

describe('Pagination', () => {
	it('renders nothing when everything fits on one page', () => {
		renderAt({ page: 1, total: 12 });

		expect(document.querySelector('nav')).toBeNull();
	});

	it('renders nothing for an empty result set', () => {
		renderAt({ page: 1, total: 0 });

		expect(document.querySelector('nav')).toBeNull();
	});

	it('reports the position within the result set', async () => {
		renderAt({ page: 2, total: 30 });

		// 30 items at 12 per page is three pages, not two.
		await expect.element(page.getByRole('navigation')).toHaveTextContent(/2.*3/);
	});

	it('links forward and back from a middle page', () => {
		renderAt({ page: 2, total: 30 });

		const links = [...document.querySelectorAll<HTMLAnchorElement>('nav a')];
		expect(links).toHaveLength(2);
		expect(links[0].getAttribute('rel')).toBe('prev');
		expect(links[0].href).toContain('/weeklies');
		expect(links[1].getAttribute('rel')).toBe('next');
		expect(links[1].href).toContain('page=3');
	});

	it('offers no previous link on the first page', () => {
		renderAt({ page: 1, total: 30 });

		const links = [...document.querySelectorAll<HTMLAnchorElement>('nav a')];
		expect(links).toHaveLength(1);
		expect(links[0].getAttribute('rel')).toBe('next');
	});

	it('offers no next link on the last page', () => {
		renderAt({ page: 3, total: 30 });

		const links = [...document.querySelectorAll<HTMLAnchorElement>('nav a')];
		expect(links).toHaveLength(1);
		expect(links[0].getAttribute('rel')).toBe('prev');
	});

	it('drops the page param when linking back to the first page', () => {
		renderAt({ page: 2, total: 30 });

		const previous = document.querySelector<HTMLAnchorElement>('nav a[rel="prev"]');
		expect(previous?.href).not.toContain('page=');
	});

	it('still shows the way back from a page past the end', () => {
		// A stale or shared link lands here: 30 items is three pages, and the
		// reader asked for the fifth. The page renders its empty state, so the
		// nav is the only route back — hiding it left hand-editing the URL as
		// the only recovery.
		renderAt({ page: 5, total: 30 });

		const previous = document.querySelector<HTMLAnchorElement>('nav a[rel="prev"]');
		expect(previous).not.toBeNull();
		// Page 4 is empty too. Back means the last page that has rows.
		expect(previous?.href).toContain('page=3');
		expect(document.querySelector('nav a[rel="next"]')).toBeNull();
	});

	it('names itself for assistive technology', async () => {
		renderAt({ page: 2, total: 30 });

		await expect.element(page.getByRole('navigation')).toHaveAccessibleName();
	});
});
