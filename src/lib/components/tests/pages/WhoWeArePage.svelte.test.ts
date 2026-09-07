import { describe, expect, it } from 'vitest';
import type { CollaboratorData, TeamMemberData } from '../../../content/types.js';
import { sampleCollaborators, sampleMember, samplePageCopy } from '../../../fixtures.js';
import WhoWeArePage from '../../pages/WhoWeArePage.svelte';
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

const content = samplePageCopy('who-we-are');
const featured = [sampleMember, { ...sampleMember, slug: 'pere', name: 'Pere' }];
const board = [{ ...sampleMember, slug: 'joana', name: 'Joana', isBoard: true }];
const collaborators = sampleCollaborators.map((row, index) => ({ ...row, id: index + 1 }));
const props = { content, featured, board, collaborators };

describe('WhoWeArePage, read-only', () => {
	it('titles itself from the nav key and renders the three sections from copy', async () => {
		const { container } = mountPage(WhoWeArePage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe('Qui som — ViT');
		expect(textOf(page, 'h1')).toEqual(['Qui som']);
		expect(textOf(page, 'h2')).toEqual([
			content.team_heading,
			content.board_heading,
			content.collaborators_heading
		]);
		expect(textOf(page, '.intro')).toEqual([content.team_intro, content.board_intro]);
		expect(page.querySelectorAll('.featured > article')).toHaveLength(featured.length);
		expect(page.querySelectorAll('.board > article')).toHaveLength(board.length);
		expect(page.querySelectorAll('ul > li')).toHaveLength(collaborators.length);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(WhoWeArePage, { props });
		const described = mountPage(WhoWeArePage, {
			props: {
				...props,
				edit: { copy: copyEditFor('who-we-are'), collaborators: { entity: 'collaborators' } }
			},
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('WhoWeArePage, editing', () => {
	it('routes copy and the h1 key, asks memberFor per card and collaboratorFor per row, and offers the add slot', () => {
		const memberFor = rowSpy<TeamMemberData>();
		const collaboratorFor = rowSpy<CollaboratorData>();
		const { container } = mountPage(WhoWeArePage, {
			props: {
				...props,
				edit: {
					copy: copyEditFor('who-we-are'),
					memberFor,
					collaboratorFor,
					collaborators: { entity: 'collaborators' }
				}
			},
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Text nav_whoWeAre');
		expect(labelOf(page, '#team-heading')).toBe('Bloc team_heading');
		expect(labelOf(page, '#collaborators-heading')).toBe('Bloc collaborators_heading');
		expect(memberFor.mock.calls.map(([m]) => m)).toEqual([...featured, ...board]);
		expect(collaboratorFor.mock.calls.map(([c]) => c)).toEqual(collaborators);
		// The collection ref reaches the list: one trailing add slot, one remove per identified row.
		expect(page.querySelectorAll('button.add')).toHaveLength(1);
		expect(page.querySelectorAll('ul .vit-edit-frame')).toHaveLength(collaborators.length);
	});
});
