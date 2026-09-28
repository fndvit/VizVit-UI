import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { TeamMemberData } from '../../../content/types.js';
import type { EditAdapter } from '../../../edit/types.js';
import { sampleTeam } from '../../../fixtures.js';
import TeamFigureField from '../../team/TeamFigureField.svelte';
import { AFFORDANCES, fullAdapter, host, mountPage, rowSpy } from '../pages/helpers.js';

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

/**
 * The canvas. Wide, each figure stands at its stored x / y (thousandths of
 * the canvas width) and the unplaced ones take the row layout; narrow, the
 * same markup flows. Editing, where the adapter saves placements, a drag, an
 * arrow-key nudge or a layer button is ONE `savePlacement` patch.
 */
describe('TeamFigureField canvas', () => {
	const placed: TeamMemberData[] = [
		{ ...identified[0], figureX: 500, figureY: 100, figureZ: 2 },
		{ ...identified[1], figureZ: 5 },
		identified[2]
	];
	const record = (member: TeamMemberData) => ({
		label: member.name,
		record: { entity: 'team_members' as const, id: member.id as number }
	});
	const wrappers = () => [...document.querySelectorAll<HTMLElement>('.vit-team-figure')];
	const canvas = () => document.querySelector<HTMLElement>('[data-vit-placement-canvas]');

	beforeEach(async () => {
		await page.viewport(1280, 900);
	});
	afterEach(async () => {
		await page.viewport(414, 896);
	});

	it('stands a stored figure at its x and y, on its layer', () => {
		render(TeamFigureField, { members: placed });

		const [first] = wrappers();
		const width = canvas()?.getBoundingClientRect().width ?? 0;
		const style = getComputedStyle(first);
		expect(style.position).toBe('absolute');
		expect(parseFloat(style.left)).toBeCloseTo(width * 0.5, 0);
		expect(parseFloat(style.top)).toBeCloseTo(width * 0.1, 0);
		expect(style.zIndex).toBe('2');
		// The canvas reaches past the figures, so nothing overlaps the next section.
		const bottom = Math.max(...wrappers().map((w) => w.getBoundingClientRect().bottom));
		expect(canvas()?.getBoundingClientRect().bottom ?? 0).toBeGreaterThanOrEqual(bottom);
		expect(document.querySelector(AFFORDANCES)).toBeNull();
	});

	it('flows in order on a narrow viewport, positions ignored', async () => {
		await page.viewport(414, 896);
		render(TeamFigureField, { members: placed });

		for (const wrapper of wrappers()) expect(getComputedStyle(wrapper).position).toBe('relative');
	});

	it('no handles without savePlacement', () => {
		const { container } = mountPage(TeamFigureField, {
			props: { members: placed, editFor: record },
			adapter: fullAdapter()
		});

		expect(host(container).querySelector('.vit-placeable')).toBeNull();
	});

	function placing() {
		const savePlacement = vi.fn(async () => {});
		const adapter: EditAdapter = { ...fullAdapter(), savePlacement };
		const { container } = mountPage(TeamFigureField, {
			props: { members: placed, editFor: record },
			adapter
		});
		const items = [...host(container).querySelectorAll<HTMLElement>('.vit-placeable')];
		return { savePlacement, items };
	}

	it('a drag is one patch with both axes, snapped to the step', async () => {
		const { savePlacement, items } = placing();
		const width = canvas()?.getBoundingClientRect().width ?? 0;
		const item = items[0];
		const box = item.getBoundingClientRect();
		const at = { clientX: box.left + 20, clientY: box.top + 60, pointerId: 1, bubbles: true };

		item.dispatchEvent(new PointerEvent('pointerdown', { ...at, button: 0 }));
		item.dispatchEvent(
			new PointerEvent('pointermove', { ...at, clientX: at.clientX + width * 0.1 + 2 })
		);
		item.dispatchEvent(
			new PointerEvent('pointerup', { ...at, clientX: at.clientX + width * 0.1 + 2 })
		);

		await expect.poll(() => savePlacement.mock.calls.length).toBe(1);
		expect(savePlacement).toHaveBeenCalledWith(
			{ entity: 'team_members', id: placed[0].id },
			{ x: 600, y: 100 }
		);
	});

	it('a press that does not travel is not a drag', () => {
		const { savePlacement, items } = placing();
		const box = items[0].getBoundingClientRect();
		const at = { clientX: box.left + 20, clientY: box.top + 60, pointerId: 1, bubbles: true };

		items[0].dispatchEvent(new PointerEvent('pointerdown', { ...at, button: 0 }));
		items[0].dispatchEvent(new PointerEvent('pointermove', { ...at, clientX: at.clientX + 2 }));
		items[0].dispatchEvent(new PointerEvent('pointerup', at));

		expect(savePlacement).not.toHaveBeenCalled();
	});

	it('the grip’s arrows settle into one patch; an unplaced figure writes both axes', async () => {
		const { savePlacement, items } = placing();
		const grip = items[1].querySelector<HTMLButtonElement>('.grip');
		grip?.focus();
		for (const key of ['ArrowRight', 'ArrowRight', 'ArrowDown']) {
			grip?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		}

		await expect.poll(() => savePlacement.mock.calls.length, { timeout: 2000 }).toBe(1);
		const [target, patch] = savePlacement.mock.calls[0] as unknown as [
			unknown,
			{ x: number; y: number }
		];
		expect(target).toEqual({ entity: 'team_members', id: placed[1].id });
		expect(Object.keys(patch).sort()).toEqual(['x', 'y']);
		expect(patch.y).toBe(10 + (placed[1].figureOffset ?? 0));
	});

	it('«to the front» goes one above the other layers, and is spent once on top', async () => {
		const { savePlacement, items } = placing();
		const [front] = [...items[0].querySelectorAll<HTMLButtonElement>('.handles button')].filter(
			(b) => b.getAttribute('aria-label') === 'Porta al davant'
		);
		front.click();
		await expect.poll(() => savePlacement.mock.calls.length).toBe(1);
		expect(savePlacement).toHaveBeenCalledWith(
			{ entity: 'team_members', id: placed[0].id },
			{ z: 6 }
		);

		const [onTop] = [...items[1].querySelectorAll<HTMLButtonElement>('.handles button')].filter(
			(b) => b.getAttribute('aria-label') === 'Porta al davant'
		);
		expect(onTop.disabled).toBe(true);
	});

	it('a narrow canvas takes no drag', async () => {
		await page.viewport(414, 896);
		const { savePlacement, items } = placing();
		const box = items[0].getBoundingClientRect();
		const at = { clientX: box.left + 20, clientY: box.top + 60, pointerId: 1, bubbles: true };

		items[0].dispatchEvent(new PointerEvent('pointerdown', { ...at, button: 0 }));
		items[0].dispatchEvent(new PointerEvent('pointermove', { ...at, clientX: at.clientX + 80 }));
		items[0].dispatchEvent(new PointerEvent('pointerup', { ...at, clientX: at.clientX + 80 }));

		expect(savePlacement).not.toHaveBeenCalled();
		expect(getComputedStyle(items[0].querySelector('.handles') as Element).display).toBe('none');
	});
});
