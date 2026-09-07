import { page as browser } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import type { MilestoneData } from '../../../content/types.js';
import { MILESTONE_CATEGORIES } from '../../../content/types.js';
import { sampleMilestones, samplePageCopy } from '../../../fixtures.js';
import TransparencyPage from '../../pages/TransparencyPage.svelte';
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

const content = samplePageCopy('transparency');
const query = { q: '', category: null };
const props = { content, milestones: sampleMilestones, query, replaceUrl: () => {} };

describe('TransparencyPage, read-only', () => {
	it('titles itself from the copy heading and renders the full timeline with one chip per category', async () => {
		const { container } = mountPage(TransparencyPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${content.heading} — ViT`);
		expect(textOf(page, 'h1')).toEqual([content.heading]);
		expect(textOf(page, '.intro')).toEqual([content.intro]);
		expect(page.querySelectorAll('.timeline article')).toHaveLength(sampleMilestones.length);
		expect(page.querySelectorAll('.chips button')).toHaveLength(MILESTONE_CATEGORIES.length);
		expect(textOf(page, '.year')).toEqual(['2024', '2025', '2026']);
	});

	it('filters from the server-parsed query and shows the empty state when nothing matches', () => {
		const one = mountPage(TransparencyPage, {
			props: { ...props, query: { q: 'laboratori', category: null } }
		});
		expect(host(one.container).querySelectorAll('.timeline article')).toHaveLength(1);

		const none = mountPage(TransparencyPage, {
			props: { ...props, query: { q: 'zzz', category: null } }
		});
		expect(host(none.container).querySelector('.timeline')).toBeNull();
		expect(textOf(host(none.container), '.empty')).toEqual([
			'No hem trobat cap fita amb aquests criteris.'
		]);
	});

	it('mirrors a chip into the URL through the host write and filters in place', async () => {
		const replaceUrl = vi.fn();
		const { container } = mountPage(TransparencyPage, { props: { ...props, replaceUrl } });

		await browser.getByRole('button', { name: 'Laboratori' }).click();

		await expect.poll(() => replaceUrl.mock.calls).toEqual([['/transparency?category=lab']]);
		expect(host(container).querySelectorAll('.timeline article')).toHaveLength(1);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(TransparencyPage, { props });
		const described = mountPage(TransparencyPage, {
			props: {
				...props,
				edit: { copy: copyEditFor('transparency'), milestones: { entity: 'milestones' } }
			},
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('TransparencyPage, editing', () => {
	it('routes copy, asks milestoneFor per row, renders the anchored add slots and opens the category chips as wording', () => {
		const milestoneFor = rowSpy<MilestoneData>();
		const { container } = mountPage(TransparencyPage, {
			props: {
				...props,
				edit: {
					copy: copyEditFor('transparency'),
					milestoneFor,
					milestones: { entity: 'milestones' }
				}
			},
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Bloc heading');
		expect(labelOf(page, '.intro')).toBe('Bloc intro');
		expect(milestoneFor.mock.calls.map(([m]) => m)).toEqual(sampleMilestones);
		expect(page.querySelectorAll('button.add')).toHaveLength(sampleMilestones.length + 1);
		expect(
			[...page.querySelectorAll('.chips .action-label')].map((chip) =>
				chip.getAttribute('aria-label')
			)
		).toEqual(MILESTONE_CATEGORIES.map((category) => `Text category_${category}`));
		expect(page.querySelector('form[role="search"] .vit-edit-frame')).not.toBeNull();
	});

	it('opens the empty state as the timeline_empty wording', () => {
		const { container } = mountPage(TransparencyPage, {
			props: { ...props, query: { q: 'zzz', category: null } },
			adapter: fullAdapter(),
			config: { messageEdit }
		});

		expect(labelOf(host(container), '.empty')).toBe('Text timeline_empty');
	});
});
