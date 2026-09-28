import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { sampleTeam } from '../../../fixtures.js';
import TeamFigureField from '../../team/TeamFigureField.svelte';
import { rowSpy } from '../pages/helpers.js';
import type { TeamMemberData } from '../../../content/types.js';

describe('TeamFigureField', () => {
	it('draws one figure per member, in order, between two decorative shapes', () => {
		render(TeamFigureField, { members: sampleTeam, class: 'featured' });

		const names = [...document.querySelectorAll('figure .vit-figure__name')].map(
			(el) => el.textContent
		);
		expect(names).toEqual(sampleTeam.map((m) => m.name));
		const shapes = document.querySelectorAll('.shapes svg');
		expect(shapes).toHaveLength(2);
		for (const shape of shapes) expect(shape.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('.vit-team-figures')?.classList.contains('featured')).toBe(true);
	});

	it('asks editFor once per member, with the member', () => {
		const editFor = rowSpy<TeamMemberData>();
		render(TeamFigureField, { members: sampleTeam.slice(0, 3), editFor });

		expect(editFor.mock.calls.map(([m]) => m)).toEqual(sampleTeam.slice(0, 3));
	});
});
