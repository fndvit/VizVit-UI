import { describe, expect, it, vi } from 'vitest';
import type { ThemeData, TimelineAreaData } from '../../../content/types.js';
import { sampleAreas, samplePageCopy, sampleThemes } from '../../../fixtures.js';
import HomePage from '../../pages/HomePage.svelte';
import { areaDestination } from '../../timeline/area-link.js';
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

const content = samplePageCopy('home');
const props = { content, areas: sampleAreas, themes: sampleThemes, onsearch: () => {} };

describe('HomePage, read-only', () => {
	it('titles the document from the hero and renders every copy block where it belongs', async () => {
		const { container } = mountPage(HomePage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${content.hero_title} — ViT`);
		expect(textOf(page, 'h1')).toEqual([content.hero_title]);
		expect(textOf(page, '.tagline')).toEqual([content.hero_subtitle]);
		expect(textOf(page, 'h2')).toEqual([content.weeklies_heading, content.know_more_heading]);
		expect(textOf(page, '.intro')).toEqual([content.weeklies_intro, content.know_more_intro]);
	});

	it('renders the three areas with their own timeline links, the themes as pictures leading to their weeklies, and every arrow link from the catalog', () => {
		const { container } = mountPage(HomePage, { props });
		const page = host(container);

		expect(textOf(page, 'section.area h3')).toEqual(sampleAreas.map((area) => area.title));
		expect(
			[...page.querySelectorAll('section.area .more a')].map((a) => a.getAttribute('href'))
		).toEqual(
			sampleAreas.flatMap((area) => {
				const to = areaDestination(area, '/transparency');
				return to ? [to] : [];
			})
		);
		expect(page.querySelector('.see-all a')?.getAttribute('href')).toBe('/transparency');

		// The themes, in the weeklies band under its lead, each a link to its weeklies.
		const themes = [...page.querySelectorAll<HTMLAnchorElement>('.weeklies-band .theme a')];
		expect(themes.map((a) => a.getAttribute('href'))).toEqual(
			sampleThemes.map((theme) => `/weeklies?theme=${theme.slug}`)
		);
		expect(textOf(page, '.weeklies-band .theme .label')).toEqual(
			sampleThemes.map((theme) => theme.name)
		);
		expect(page.querySelector('.weeklies-band .lead h2')?.id).toBe('weeklies-heading');
		expect(page.querySelector('.go a')?.getAttribute('href')).toBe('/weeklies');
		expect(textOf(page, '.go strong')).toEqual(['weeklies']);

		// «Meet our **team** ⟶», «Contact **us** ⟶»: the bold run and the drawn arrow.
		const ctas = [...page.querySelectorAll<HTMLAnchorElement>('.ctas a')];
		expect(ctas.map((a) => a.getAttribute('href'))).toEqual(['/who-we-are', '/get-involved']);
		expect(ctas.map((a) => a.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'Coneix el nostre equip',
			'Contacta amb nosaltres'
		]);
		expect(textOf(page, '.ctas strong')).toEqual(['equip', 'amb nosaltres']);
		expect(page.querySelectorAll('.ctas .arrow')).toHaveLength(2);
	});

	it('hands the search box the query and nothing else — the host navigates', async () => {
		const onsearch = vi.fn();
		const { container } = mountPage(HomePage, { props: { ...props, onsearch } });
		const form = host(container).querySelector<HTMLFormElement>('form[role="search"]')!;
		const input = form.querySelector<HTMLInputElement>('input')!;
		input.value = ' dades ';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

		await expect.poll(() => onsearch.mock.calls).toEqual([['dades']]);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(HomePage, { props });
		const described = mountPage(HomePage, {
			props: { ...props, edit: { copy: copyEditFor('home') } },
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('HomePage, editing', () => {
	it('routes each copy descriptor to its element and asks the row maps once per row', () => {
		const areaFor = rowSpy<TimelineAreaData>();
		const themeFor = rowSpy<ThemeData>();
		const { container } = mountPage(HomePage, {
			props: { ...props, edit: { copy: copyEditFor('home'), areaFor, themeFor } },
			adapter: fullAdapter()
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Bloc hero_title');
		expect(labelOf(page, '.tagline')).toBe('Bloc hero_subtitle');
		expect(labelOf(page, '.weeklies-band .intro')).toBe('Bloc weeklies_intro');
		expect(labelOf(page, '.know-more .intro')).toBe('Bloc know_more_intro');
		expect(labelOf(page, '#know-more-heading')).toBe('Bloc know_more_heading');
		expect(areaFor.mock.calls.map(([a]) => a)).toEqual(sampleAreas);
		expect(themeFor.mock.calls.map(([t]) => t)).toEqual(sampleThemes);
	});

	it('opens the chrome wording through messageEdit: the explore line inline, the four links as modals, the placeholder as a panel', () => {
		const { container } = mountPage(HomePage, {
			props,
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, '.explore')).toBe('Text weeklies_exploreOne');
		expect(labelOf(page, '.hint')).toBe('Text hero_scrollHint');
		// The live swap shows the wording RAW — the `**` are what the editor edits.
		expect(textOf(page, '.link-swap').map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
			'A la cronologia completa',
			'A les **weeklies**',
			'Coneix el nostre **equip**',
			'Contacta **amb nosaltres**'
		]);
		// The search box is framed (gear → placeholder row) only under messageEdit.
		expect(page.querySelector('form[role="search"] .vit-edit-frame')).not.toBeNull();
	});
});
