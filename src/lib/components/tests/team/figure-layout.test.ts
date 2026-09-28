import { describe, expect, it } from 'vitest';
import {
	COLUMNS,
	FIGURE_BASE,
	ROW_STEP,
	autoPlacement,
	canvasHeight,
	clampPlacement,
	figureFootprint,
	figureHeight,
	placeFigures
} from '../../team/layout.js';
import { FIGURE_POSITION } from '../../ui/figure/paths.js';

/**
 * The canvas arithmetic. What has to hold: a stored position is kept as
 * stored, an unplaced figure's place depends only on its index (so moving one
 * figure never moves another), and everything written back is an integer
 * inside the bounds the host's CHECK constraints share.
 */
describe('team canvas layout', () => {
	it('keeps a stored position and fills the rest from the row layout', () => {
		const members = [{ figureX: 700, figureY: 40, figureZ: 3 }, {}, { figureSize: 150 }];
		const [placed, second, third] = placeFigures(members);

		expect(placed).toEqual({ x: 700, y: 40, z: 3, size: 100 });
		expect(second).toEqual({ ...autoPlacement(1, 3, {}), z: 0, size: 100 });
		expect(third.size).toBe(150);
	});

	it('an unplaced figure keeps its place when another one moves', () => {
		const before = placeFigures([{}, {}, {}]);
		const after = placeFigures([{ figureX: 10, figureY: 900 }, {}, {}]);

		expect(after.slice(1)).toEqual(before.slice(1));
	});

	it('rows of COLUMNS, each row centred, the offset pushing a figure down', () => {
		const count = COLUMNS + 1;
		const first = autoPlacement(0, count, {});
		const lastOfRow = autoPlacement(COLUMNS - 1, count, {});
		const alone = autoPlacement(COLUMNS, count, {});
		const nudged = autoPlacement(0, count, { figureOffset: 40 });

		expect(first.y).toBe(0);
		expect(lastOfRow.y).toBe(0);
		expect(alone.y).toBe(ROW_STEP);
		// A row of one is centred: its footprint straddles the middle.
		expect(alone.x + figureFootprint(100) / 2).toBeCloseTo(500, -1);
		// The full row is symmetric about the middle.
		expect(first.x + lastOfRow.x + figureFootprint(100)).toBeCloseTo(1000, -1);
		expect(nudged.y).toBe(40);
	});

	it('the canvas reaches past the lowest figure’s feet', () => {
		const placements = placeFigures([{ figureX: 0, figureY: 1000, figureSize: 200 }, {}]);

		expect(canvasHeight(placements)).toBeGreaterThan(1000 + figureHeight(200));
		expect(canvasHeight([])).toBeGreaterThan(0);
		expect(figureHeight(100)).toBeGreaterThan(FIGURE_BASE);
	});

	it('clamps and rounds what it writes back, and leaves out what it was not given', () => {
		expect(clampPlacement({ x: -5, y: 99_999, z: 150, size: 12.6 })).toEqual({
			x: 0,
			y: FIGURE_POSITION.y.max,
			z: 99,
			size: 50
		});
		expect(clampPlacement({ x: 412.4 })).toEqual({ x: 412 });
	});
});
