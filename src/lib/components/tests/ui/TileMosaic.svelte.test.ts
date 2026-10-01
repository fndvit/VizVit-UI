import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TileMosaic from '../../ui/TileMosaic.svelte';

const tiles = (root: ParentNode): string[] =>
	[...root.querySelectorAll('svg > g.tile')].map((tile) => tile.outerHTML);

describe('TileMosaic', () => {
	it('is deterministic for a seed and differs across seeds', () => {
		const a = render(TileMosaic, { props: { seed: 3 } });
		const b = render(TileMosaic, { props: { seed: 3 } });
		const c = render(TileMosaic, { props: { seed: 4 } });

		expect(tiles(a.container)).toEqual(tiles(b.container));
		expect(tiles(a.container)).not.toEqual(tiles(c.container));
	});

	it('fills every cell at full density and sizes the viewBox from the grid', () => {
		const { container } = render(TileMosaic, { props: { cols: 3, rows: 2, density: 1 } });

		expect(tiles(container)).toHaveLength(6);
		expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 300 200');
		expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('keys the hatch pattern id on the seed, so the same picture renders the same twice', () => {
		const { container } = render(TileMosaic, { props: { seed: 5, cols: 1, rows: 1, density: 0 } });
		const same = render(TileMosaic, { props: { seed: 5, cols: 1, rows: 1, density: 0 } });
		const other = render(TileMosaic, { props: { seed: 6, cols: 1, rows: 1, density: 0 } });

		const id = (root: ParentNode) => root.querySelector('pattern')?.id;
		expect(id(container)).toBe('vit-hatch-5');
		expect(id(same.container)).toBe(id(container));
		expect(id(other.container)).not.toBe(id(container));
	});
});

describe('TileMosaic, the focus and the clear zones', () => {
	it('draws nothing inside a cleared rectangle and more inside the focus', () => {
		const grid = { cols: 10, rows: 10, seed: 9, density: 0.3 };
		const focused = render(TileMosaic, {
			props: { ...grid, focus: { col: 5, row: 5, radius: 2, density: 1 } }
		});
		const cleared = render(TileMosaic, {
			props: { ...grid, clear: [{ col: 0, row: 0, cols: 10, rows: 5 }] }
		});

		const ys = (root: ParentNode) =>
			[...root.querySelectorAll('svg > g.tile > .shape')].map((tile) => {
				const y = tile.getAttribute('y') ?? tile.getAttribute('cy');
				return y === null
					? Number(/M\d+ (\d+)/.exec(tile.getAttribute('d') ?? '')?.[1])
					: Number(y);
			});
		expect(ys(cleared.container).every((y) => y >= 500)).toBe(true);
		expect(tiles(focused.container).length).toBeGreaterThan(tiles(cleared.container).length);
	});
});

describe('TileMosaic, under the pointer', () => {
	it('gives every tile the hue it turns into, and keeps the hatching its pattern', () => {
		const { container } = render(TileMosaic, { props: { cols: 6, rows: 6, seed: 2, density: 1 } });

		const groups = [...container.querySelectorAll<SVGGElement>('svg > g.tile')];
		expect(groups.length).toBe(36);
		for (const group of groups) {
			expect(group.style.getPropertyValue('--tile-fill')).toMatch(/^var\(--color-/);
			expect(group.style.getPropertyValue('--tile-next')).toMatch(/^var\(--color-/);
			expect(group.style.getPropertyValue('--tile-next')).not.toBe(
				group.style.getPropertyValue('--tile-fill')
			);
		}
		const hatch = container.querySelector<SVGRectElement>('g.tile > .hatch');
		expect(hatch).not.toBeNull();
		expect(getComputedStyle(hatch!).fill).toMatch(/^url\("#vit-hatch-2"\)/);
	});

	it('turns at once under the pointer and settles back slowly, so a hand leaves a wake', () => {
		const { container } = render(TileMosaic, { props: { cols: 2, rows: 2, seed: 2, density: 1 } });
		const svg = container.querySelector<SVGSVGElement>('svg')!;
		const shape = container.querySelector<SVGElement>('g.tile > .shape')!;

		const seconds = (value: string) => parseFloat(value);
		const settle = seconds(getComputedStyle(shape).transitionDuration);
		expect(settle).toBeGreaterThan(1);
		svg.style.setProperty('--vit-tile-turn', '50ms');
		svg.style.setProperty('--vit-tile-settle', '5s');
		expect(seconds(getComputedStyle(shape).transitionDuration)).toBe(5);
	});

	it('feels the pointer through a still, unseen cell rather than the shape that turns', () => {
		const { container } = render(TileMosaic, { props: { cols: 4, rows: 4, seed: 2, density: 1 } });

		for (const group of container.querySelectorAll<SVGGElement>('svg > g.tile')) {
			const shape = group.firstElementChild!;
			const cell = group.lastElementChild!;
			expect(shape.classList.contains('shape')).toBe(true);
			expect(cell.classList.contains('cell')).toBe(true);
			expect(cell.getAttribute('width')).toBe('100');
			expect(getComputedStyle(cell).pointerEvents).toBe('all');
			expect(getComputedStyle(cell).fill).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
			expect(getComputedStyle(shape).pointerEvents).toBe('none');
		}
	});
});

describe('TileMosaic, the palette', () => {
	it('draws only the hues it is given, and turns each into the next of them', () => {
		const hues = ['var(--color-navy)', 'var(--vit-brand-mark)', 'var(--color-cream)'];
		const { container } = render(TileMosaic, {
			props: { cols: 6, rows: 6, seed: 2, density: 1, hues }
		});

		const groups = [...container.querySelectorAll<SVGGElement>('svg > g.tile')];
		const fills = new Set(groups.map((g) => g.style.getPropertyValue('--tile-fill')));
		expect([...fills].every((fill) => hues.includes(fill))).toBe(true);
		expect(fills.size).toBe(3);
		for (const group of groups) {
			const fill = group.style.getPropertyValue('--tile-fill');
			expect(group.style.getPropertyValue('--tile-next')).toBe(
				hues[(hues.indexOf(fill) + 1) % hues.length]
			);
		}
	});
});

describe('TileMosaic, the entrance', () => {
	const grid = { cols: 6, rows: 4, seed: 11, density: 1 };

	it('gives each tile a birthplace and a wait when asked to arrive, in waves from the centre', () => {
		const { container } = render(TileMosaic, { props: { ...grid, arrive: true } });
		const groups = [...container.querySelectorAll<SVGGElement>('g.tile')];

		expect(groups.length).toBe(24);
		for (const group of groups) {
			expect(group.classList.contains('arrive')).toBe(true);
			expect(group.style.getPropertyValue('--tile-dx')).toMatch(/^-?\d+px$/);
			expect(group.style.getPropertyValue('--tile-wait')).toMatch(/^\d+ms$/);
			expect(
				group.firstElementChild && getComputedStyle(group.firstElementChild).animationName
			).not.toBe('none');
		}
		const wait = (group: SVGGElement) => parseInt(group.style.getPropertyValue('--tile-wait'));
		const corner = groups.find(
			(g) =>
				g.firstElementChild?.getAttribute('x') === '0' ||
				/^M0 0/.test(g.firstElementChild?.getAttribute('d') ?? '')
		);
		const middle = groups.find(
			(g) =>
				g.firstElementChild?.getAttribute('x') === '200' ||
				/^M200 100/.test(g.firstElementChild?.getAttribute('d') ?? '')
		);
		expect(corner && middle && wait(corner) > wait(middle)).toBe(true);
	});

	it('draws the same tiles with and without the entrance, and leaves them still without it', () => {
		const still = render(TileMosaic, { props: grid });
		const arriving = render(TileMosaic, { props: { ...grid, arrive: true } });

		const shapes = (root: ParentNode) =>
			[...root.querySelectorAll('g.tile > .shape')].map((shape) => shape.outerHTML);
		expect(shapes(arriving.container)).toEqual(shapes(still.container));
		for (const group of still.container.querySelectorAll<SVGGElement>('g.tile')) {
			expect(group.classList.contains('arrive')).toBe(false);
			expect(group.style.getPropertyValue('--tile-wait')).toBe('');
		}
	});
});
