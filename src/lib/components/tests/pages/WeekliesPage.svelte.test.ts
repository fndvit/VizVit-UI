import { page as browser } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import type { ThemeData, WeeklyCardData } from '../../../content/types.js';
import type { WeeklyListConfig } from '../../../utils/weekly-list.svelte.js';
import { samplePageCopy, sampleThemes, sampleWeeklyListServer } from '../../../fixtures.js';
import WeekliesPage from '../../pages/WeekliesPage.svelte';
import {
	AFFORDANCES,
	copyEditFor,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	rowSpy,
	textOf
} from './helpers.js';

const content = samplePageCopy('weeklies');
const server = sampleWeeklyListServer;
const fetchPage: WeeklyListConfig['fetchPage'] = () =>
	Promise.resolve({ items: server.weeklies, total: server.total });
const props = { content, themes: sampleThemes, server, fetchPage, replaceUrl: () => {} };

describe('WeekliesPage, read-only', () => {
	it('titles itself from the nav key and renders the controls and the server page', async () => {
		const { container } = mountPage(WeekliesPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe('Weeklies — ViT');
		expect(textOf(page, 'h1')).toEqual(['Weeklies']);
		expect(textOf(page, '.intro')).toEqual([content.intro]);
		expect(textOf(page, '.chips button')).toEqual(sampleThemes.map((theme) => theme.name));
		expect(page.querySelector('form[role="search"] input')?.getAttribute('placeholder')).toBe(
			'Cerca un tema…'
		);
		expect(page.querySelector('select')).not.toBeNull();
		expect(page.querySelectorAll('.grid > article')).toHaveLength(server.weeklies.length);
		expect(page.querySelector('.pagination')).toBeNull();
	});

	it('shows the empty state when the server page has no rows', () => {
		const { container } = mountPage(WeekliesPage, {
			props: { ...props, server: { ...server, weeklies: [], total: 0 } }
		});

		expect(textOf(host(container), '.empty')).toEqual([
			'No hem trobat cap weekly amb aquests criteris.'
		]);
	});

	it('builds paging links that resolve through UiConfig.href exactly once', () => {
		const paged = { ...server, total: 30 };
		const { container } = mountPage(WeekliesPage, {
			props: { ...props, server: paged },
			config: { href: (path) => `/mirror${path}` }
		});

		expect(host(container).querySelector('a[rel="next"]')?.getAttribute('href')).toBe(
			'/mirror/weeklies?page=2'
		);
	});

	it('mirrors a theme chip into the URL through the host write and refetches page one', async () => {
		const replaceUrl = vi.fn();
		const fetch = vi.fn<WeeklyListConfig['fetchPage']>(fetchPage);
		mountPage(WeekliesPage, { props: { ...props, replaceUrl, fetchPage: fetch } });

		await browser.getByRole('button', { name: 'Salut' }).click();

		await expect.poll(() => replaceUrl.mock.calls).toEqual([['/weeklies?theme=salut']]);
		await expect.poll(() => fetch.mock.calls.length).toBe(1);
		expect(fetch.mock.calls[0][0]).toMatchObject({
			theme: 'salut',
			sort: 'desc',
			limit: 12,
			locale: 'ca'
		});
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(WeekliesPage, { props });
		const described = mountPage(WeekliesPage, {
			props: { ...props, edit: { copy: copyEditFor('weeklies') } },
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('WeekliesPage, editing', () => {
	it('routes copy and the h1 key, asks weeklyFor per card and themeFor per chip, and frames the search and sort', () => {
		const weeklyFor = rowSpy<WeeklyCardData>();
		const themeFor = rowSpy<ThemeData>();
		const { container } = mountPage(WeekliesPage, {
			props: { ...props, edit: { copy: copyEditFor('weeklies'), weeklyFor, themeFor } },
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Text nav_weeklies');
		expect(labelOf(page, '.intro')).toBe('Bloc intro');
		expect(weeklyFor.mock.calls.map(([w]) => w)).toEqual(server.weeklies);
		expect(themeFor.mock.calls.map(([t]) => t)).toEqual(sampleThemes);
		expect(page.querySelector('form[role="search"] .vit-edit-frame')).not.toBeNull();
		// The sort control is framed (gear → the two option labels) and its
		// label swaps for editable text — so the <select> itself is not on screen.
		expect(
			page.querySelector('.vit-edit-frame .action-label[aria-label="Text weeklies_sortLabel"]')
		).not.toBeNull();
		expect(page.querySelector('select')).toBeNull();
	});
});
