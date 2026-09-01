import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TeamMemberCard from '../../team/TeamMemberCard.svelte';
import type { TeamMemberData as TeamMember } from '../../../content/types.js';

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
});
