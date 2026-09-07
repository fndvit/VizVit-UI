import { describe, expect, it, vi } from 'vitest';
import type { MilestoneData, WeeklyCardData } from '../../../content/types.js';
import { sampleMilestones, samplePageCopy, sampleWeekly } from '../../../fixtures.js';
import HomePage from '../../pages/HomePage.svelte';
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
const weeklies = [
	sampleWeekly,
	{ ...sampleWeekly, id: 13, number: 13, slug: 'tretze', title: 'Tretze' }
];
const props = { content, milestones: sampleMilestones, weeklies, onsearch: () => {} };

describe('HomePage, read-only', () => {
	it('titles the document from the hero and renders every copy block where it belongs', async () => {
		const { container } = mountPage(HomePage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${content.hero_title} — ViT`);
		expect(textOf(page, 'h1')).toEqual([content.hero_title]);
		expect(textOf(page, '.hero-text p')).toEqual([content.hero_subtitle]);
		expect(textOf(page, 'h2')).toEqual([
			content.milestones_heading,
			content.weeklies_heading,
			content.know_more_heading
		]);
		expect(textOf(page, '.intro')).toEqual([content.weeklies_intro]);
	});

	it('renders the milestone slice, the weekly grid, the see-all link and both CTAs from the catalog', () => {
		const { container } = mountPage(HomePage, { props });
		const page = host(container);

		expect(page.querySelectorAll('.timeline article')).toHaveLength(sampleMilestones.length);
		expect(page.querySelectorAll('.grid > article')).toHaveLength(weeklies.length);
		expect(page.querySelector('.see-all a')?.getAttribute('href')).toBe('/transparency');
		const ctas = [...page.querySelectorAll<HTMLAnchorElement>('.ctas a')];
		expect(ctas.map((a) => a.getAttribute('href'))).toEqual(['/who-we-are', '/get-involved']);
		expect(ctas.map((a) => a.textContent?.trim())).toEqual(["Coneix l'equip", "Contacta'ns"]);
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
		const milestoneFor = rowSpy<MilestoneData>();
		const weeklyFor = rowSpy<WeeklyCardData>();
		const { container } = mountPage(HomePage, {
			props: { ...props, edit: { copy: copyEditFor('home'), milestoneFor, weeklyFor } },
			adapter: fullAdapter()
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Bloc hero_title');
		expect(labelOf(page, '.hero-text p')).toBe('Bloc hero_subtitle');
		expect(labelOf(page, '#milestones-heading')).toBe('Bloc milestones_heading');
		expect(labelOf(page, '.intro')).toBe('Bloc weeklies_intro');
		expect(labelOf(page, '#know-more-heading')).toBe('Bloc know_more_heading');
		expect(milestoneFor.mock.calls.map(([m]) => m)).toEqual(sampleMilestones);
		expect(weeklyFor.mock.calls.map(([w]) => w)).toEqual(weeklies);
	});

	it('opens the chrome wording through messageEdit: the explore line inline, the three links as modals, the placeholder as a panel', () => {
		const { container } = mountPage(HomePage, {
			props,
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, '.explore')).toBe('Text weeklies_exploreOne');
		expect(textOf(page, '.link-swap').map((t) => t.replace(/\s+/g, ' '))).toEqual([
			'Mostra-ho tot',
			"Coneix l'equip",
			"Contacta'ns"
		]);
		// The search box is framed (gear → placeholder row) only under messageEdit.
		expect(page.querySelector('form[role="search"] .vit-edit-frame')).not.toBeNull();
	});
});
