import { describe, expect, it } from 'vitest';
import { FIGURE_LAYER, FIGURE_PERCENT, FIGURE_POSITION } from '../components/ui/figure/paths.js';
import {
	PER_CANVAS,
	UNIT_CQI,
	clampTo,
	dragTo,
	fitX,
	layerMoves,
	nudgeTo,
	resizeTo,
	snapTo
} from './placement.js';

/**
 * What a placement gesture writes back. The bounds are the team canvas's —
 * the one canvas there is, and the host's CHECK constraints — so the edges
 * asked here are the ones a column refuses past. Every length is in parts of
 * the canvas width; the geometry is px.
 */
const bounds = { x: FIGURE_POSITION.x, y: FIGURE_POSITION.y };
/** A 120 px item on a 1000 px canvas: one px is one unit. */
const geometry = { width: 120, canvas: 1000 };

describe('the unit', () => {
	it('is thousandths of the canvas width, rendered as a tenth of a cqi', () => {
		expect(PER_CANVAS).toBe(1000);
		expect(UNIT_CQI).toBe('0.1cqi');
	});
});

describe('clampTo and snapTo', () => {
	it('bring a value inside its bounds as an integer', () => {
		expect(clampTo(-5, FIGURE_POSITION.x)).toBe(FIGURE_POSITION.x.min);
		expect(clampTo(99_999, FIGURE_POSITION.y)).toBe(FIGURE_POSITION.y.max);
		expect(clampTo(150, FIGURE_LAYER)).toBe(FIGURE_LAYER.max);
		expect(clampTo(12.6, FIGURE_PERCENT)).toBe(FIGURE_PERCENT.min);
		expect(clampTo(412.4, FIGURE_POSITION.x)).toBe(412);
	});

	it('snap to the nearest step', () => {
		expect(snapTo(414, 10)).toBe(410);
		expect(snapTo(415, 10)).toBe(420);
		expect(snapTo(414, 1)).toBe(414);
	});
});

describe('fitX', () => {
	it('keeps the whole item on the canvas', () => {
		expect(fitX(FIGURE_POSITION.x, geometry)).toEqual({ min: 0, max: 880 });
		// The canvas is half as wide in px: the same item takes twice the units.
		expect(fitX(FIGURE_POSITION.x, { width: 120, canvas: 500 })).toEqual({ min: 0, max: 760 });
	});

	it('never goes below the minimum, even for an item wider than the canvas', () => {
		expect(fitX(FIGURE_POSITION.x, { width: 1200, canvas: 1000 })).toEqual({ min: 0, max: 0 });
	});
});

describe('dragTo', () => {
	it('converts px to units by the canvas width, then snaps', () => {
		expect(dragTo({ x: 100, y: 100 }, { x: 63, y: 27 }, geometry, bounds, 10)).toEqual({
			x: 160,
			y: 130
		});
		// On a 500 px canvas one px is two units.
		const half = { width: 60, canvas: 500 };
		expect(dragTo({ x: 100, y: 100 }, { x: 30, y: 30 }, half, bounds, 10)).toEqual({
			x: 160,
			y: 160
		});
	});

	it('an unsnapped (Alt) drag lands on the unit', () => {
		expect(dragTo({ x: 100, y: 100 }, { x: 63, y: 27 }, geometry, bounds, 1)).toEqual({
			x: 163,
			y: 127
		});
	});

	it('stops at every edge: the left and top, the fit on the right, the bottom bound', () => {
		expect(dragTo({ x: 20, y: 20 }, { x: -500, y: -500 }, geometry, bounds, 10)).toEqual({
			x: 0,
			y: 0
		});
		expect(dragTo({ x: 800, y: 2900 }, { x: 500, y: 500 }, geometry, bounds, 10)).toEqual({
			x: 880,
			y: FIGURE_POSITION.y.max
		});
	});
});

describe('nudgeTo', () => {
	it('moves by whole units, unsnapped, and stops at the same edges', () => {
		expect(nudgeTo({ x: 413, y: 90 }, { x: 10, y: 0 }, geometry, bounds)).toEqual({
			x: 423,
			y: 90
		});
		expect(nudgeTo({ x: 875, y: 5 }, { x: 50, y: -50 }, geometry, bounds)).toEqual({
			x: 880,
			y: 0
		});
	});
});

describe('resizeTo', () => {
	it('scales the size by the corner’s travel, snapped', () => {
		// 120 px at 100 %, dragged 30 px wider: 125 %.
		expect(resizeTo(100, 120, 30, FIGURE_PERCENT, 5)).toBe(125);
		expect(resizeTo(100, 120, 31, FIGURE_PERCENT, 5)).toBe(125);
		expect(resizeTo(100, 120, 31, FIGURE_PERCENT, 1)).toBe(126);
	});

	it('stops at the smallest and the largest size', () => {
		expect(resizeTo(100, 120, -200, FIGURE_PERCENT, 5)).toBe(FIGURE_PERCENT.min);
		expect(resizeTo(100, 120, 600, FIGURE_PERCENT, 5)).toBe(FIGURE_PERCENT.max);
	});
});

describe('layerMoves', () => {
	it('fronts one above the others and backs one below them', () => {
		expect(layerMoves(3, { min: 2, max: 5 }, FIGURE_LAYER)).toEqual({
			front: 6,
			back: 1,
			onTop: false,
			atBottom: false
		});
	});

	it('spends the front button above everyone, and the back one below', () => {
		expect(layerMoves(7, { min: 2, max: 5 }, FIGURE_LAYER)).toMatchObject({
			onTop: true,
			atBottom: false
		});
		expect(layerMoves(1, { min: 2, max: 5 }, FIGURE_LAYER)).toMatchObject({
			onTop: false,
			atBottom: true
		});
	});

	it('spends a button the bound leaves nowhere to go', () => {
		// Everyone else on the bottom layer, this one too: nothing is below 0.
		expect(layerMoves(0, { min: 0, max: 0 }, FIGURE_LAYER)).toMatchObject({
			front: 1,
			back: 0,
			onTop: false,
			atBottom: true
		});
		// The others at the top layer: «to the front» cannot pass it.
		expect(
			layerMoves(FIGURE_LAYER.max, { min: 0, max: FIGURE_LAYER.max }, FIGURE_LAYER)
		).toMatchObject({
			front: FIGURE_LAYER.max,
			onTop: true
		});
	});
});
