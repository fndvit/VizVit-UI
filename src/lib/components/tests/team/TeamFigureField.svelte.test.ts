import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TeamMemberData } from '../../../content/types.js';
import type { EditAdapter } from '../../../edit/types.js';
import { sampleTeam } from '../../../fixtures.js';
import TeamFigureField from '../../team/TeamFigureField.svelte';
import { fullAdapter, host, mountPage, rowSpy } from '../pages/helpers.js';

const identified = sampleTeam.map((m, index) => ({ ...m, id: index + 1 }));

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
		expect(document.querySelector('button.add')).toBeNull();
	});

	it('asks editFor once per member, with the member', () => {
		const editFor = rowSpy<TeamMemberData>();
		render(TeamFigureField, { members: sampleTeam.slice(0, 3), editFor });

		expect(editFor.mock.calls.map(([m]) => m)).toEqual(sampleTeam.slice(0, 3));
	});

	it('with a collection under an op-capable adapter: an add slot, and a remove per identified row', () => {
		const { container } = mountPage(TeamFigureField, {
			props: {
				members: identified.slice(0, 2),
				editFor: () => ({}),
				collection: { entity: 'team_members' }
			},
			adapter: fullAdapter()
		});
		const page = host(container);

		expect(page.querySelectorAll('button.add')).toHaveLength(1);
		// The remove is the trash on each frame — the list injected the op.
		expect(page.querySelectorAll('.vit-edit-frame')).toHaveLength(2);
	});

	it('prefers the host’s form for a new member when the adapter opens records', () => {
		const adapter: EditAdapter = { isEditing: true, save: vi.fn(), openRecord: vi.fn() };
		const { container } = mountPage(TeamFigureField, {
			props: { members: identified.slice(0, 1), collection: { entity: 'team_members' } },
			adapter
		});
		const page = host(container);

		const add = page.querySelector<HTMLButtonElement>('button.add');
		expect(add).not.toBeNull();
		add?.click();
		expect(adapter.openRecord).toHaveBeenCalledWith({ entity: 'team_members' });
	});
});
