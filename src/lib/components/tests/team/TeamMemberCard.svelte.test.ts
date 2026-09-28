import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TeamMemberCard from '../../team/TeamMemberCard.svelte';
import type { TeamMemberData as TeamMember } from '../../../content/types.js';
import { entityEdit } from '../../../edit/helpers.js';
import { fullAdapter, mountPage } from '../pages/helpers.js';

/**
 * The variant a story enumerated and nothing asserted. The variant picks the
 * portrait's aspect ratio, and a ratio is the one thing a reader notices and
 * no assertion covered.
 */

const member: TeamMember = {
	slug: 'ada',
	name: 'Ada',
	role: 'Directora',
	bio: 'Fa recerca.',
	photoUrl: '/ada.jpg',
	isBoard: true
};

const article = () => document.querySelector('article');

describe('TeamMemberCard', () => {
	it('is a board portrait by default', () => {
		render(TeamMemberCard, { member });

		expect(article()?.className).toContain('board');
	});

	it('takes the featured variant when asked', () => {
		render(TeamMemberCard, { member, variant: 'featured' });

		expect(article()?.className).toContain('featured');
	});

	it('renders the name and role', () => {
		render(TeamMemberCard, { member });

		expect(document.body.textContent).toContain('Ada');
		expect(document.body.textContent).toContain('Directora');
	});

	it('omits the bio paragraph when there is none', () => {
		render(TeamMemberCard, { member: { ...member, bio: null } });

		expect(document.body.textContent).not.toContain('Fa recerca');
	});

	/**
	 * One door per card. The role and bio used to edit in place while the name
	 * could not (a plain column), so a card was two ways to change one thing
	 * and the inline way reached only some of it. With a record the host can
	 * open, the pencil is the door and the text stays plain; a host without a
	 * form keeps the inline editing it had.
	 */
	it('edits no text inline once its record opens the host’s form, and still does without one', () => {
		const inline = entityEdit('team_members', 7, 'ca');
		const edit = {
			role: inline('role'),
			bio: inline('bio'),
			record: { entity: 'team_members' as const, id: 7 }
		};

		const withForm = mountPage(TeamMemberCard, {
			props: { member: { ...member, id: 7 }, edit },
			adapter: { ...fullAdapter(), openRecord: vi.fn() }
		});
		expect(withForm.container.querySelectorAll('[contenteditable]')).toHaveLength(0);
		expect(
			[...withForm.container.querySelectorAll<HTMLButtonElement>('.toolbar button')].map((b) =>
				b.getAttribute('aria-label')
			)
		).toEqual(['Edita la fitxa: Ada']);

		document.body.innerHTML = '';
		const noForm = mountPage(TeamMemberCard, {
			props: { member: { ...member, id: 7 }, edit },
			adapter: fullAdapter()
		});
		expect(noForm.container.querySelectorAll('[contenteditable]')).toHaveLength(2);
	});
});
