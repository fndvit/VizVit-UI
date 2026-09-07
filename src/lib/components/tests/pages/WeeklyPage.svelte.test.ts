import { describe, expect, it } from 'vitest';
import {
	sampleComments,
	sampleReactions,
	sampleWeekly,
	sampleWeeklyArticle
} from '../../../fixtures.js';
import { entityEdit } from '../../../edit/helpers.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import type { CommentFormInstance } from '../../weeklies/CommentSection.svelte';
import type { ReactionBarForms } from '../../weeklies/ReactionBar.svelte';
import WeeklyPage from '../../pages/WeeklyPage.svelte';
import {
	AFFORDANCES,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	textOf
} from './helpers.js';

const weekly = sampleWeeklyArticle;
const related = [{ ...sampleWeekly, id: 11, number: 11, slug: 'onze', title: 'Onze' }];
const commentForm = createRemoteFormMock<CommentFormInstance>();
const reactionForms: ReactionBarForms = {
	weeklyReactionForm: createRemoteFormMock<ReactionBarForms['weeklyReactionForm']>(),
	commentReactionForm: createRemoteFormMock<ReactionBarForms['commentReactionForm']>()
};
const props = {
	weekly,
	related,
	comments: sampleComments,
	reactions: sampleReactions,
	isLoggedIn: false,
	commentForm,
	replyFormFor: () => commentForm,
	reactionForms
};
const edit = (() => {
	const field = entityEdit('weeklies', weekly.id, 'ca');
	return {
		title: field('title', { label: 'Títol' }),
		excerpt: field('excerpt', { label: 'Resum' }),
		body: field('body', { format: 'richtext', label: 'Cos' })
	};
})();

describe('WeeklyPage, read-only', () => {
	it('titles itself from the weekly and renders every section in the site’s order', async () => {
		const { container } = mountPage(WeeklyPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${weekly.title} — ViT`);
		expect(textOf(page, 'h1')).toEqual([weekly.title]);
		expect(textOf(page, '.meta .number')).toEqual(['#12']);
		expect(textOf(page, '.excerpt')).toEqual([weekly.excerpt]);
		expect(page.querySelector('.back a')?.getAttribute('href')).toBe('/weeklies');
		expect(page.querySelector('img.hero')?.getAttribute('src')).toBe(weekly.imageUrl);
		expect(textOf(page, '.richtext p')).toEqual(['La Terra és una llentia.', 'Neptú cau lluny.']);
		expect(textOf(page, 'h2')).toEqual(['Dades i fonts', 'Comentaris', 'Segueix explorant']);
		expect(textOf(page, '#sources-heading ~ ul a')).toEqual(['NASA', 'ESA']);
		expect(page.querySelector(`a[href="${weekly.instagramUrl}"]`)).not.toBeNull();
		expect(page.querySelector('.share')).not.toBeNull();
		expect(page.querySelectorAll('.related > article')).toHaveLength(related.length);
	});

	it('omits Instagram, sources and related when the weekly has none', () => {
		const { container } = mountPage(WeeklyPage, {
			props: { ...props, weekly: { ...weekly, instagramUrl: null, sources: [] }, related: [] }
		});
		const page = host(container);

		expect(page.querySelector('#sources-heading')).toBeNull();
		expect(page.querySelector('#related-heading')).toBeNull();
		expect(page.querySelector('a[rel="external noopener"]:not(.share a)')).toBeNull();
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(WeeklyPage, { props });
		const described = mountPage(WeeklyPage, { props: { ...props, edit }, config: { messageEdit } });

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('WeeklyPage, editing', () => {
	it('routes the article fields, and opens the back label and the two section headings as wording', () => {
		const { container } = mountPage(WeeklyPage, {
			props: { ...props, edit },
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Títol');
		expect(labelOf(page, '.excerpt')).toBe('Resum');
		expect(page.querySelector('.richtext .edit-row button')).not.toBeNull();
		expect(labelOf(page, '.back .action-label')).toBe('Text back_label');
		expect(labelOf(page, '#sources-heading')).toBe('Text weeklie_sources');
		expect(labelOf(page, '#related-heading')).toBe('Text weeklie_keepExploring');
	});
});
