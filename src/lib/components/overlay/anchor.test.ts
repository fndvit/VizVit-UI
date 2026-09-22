/**
 * The placement rule, asserted without a layout.
 *
 * Both implementations this replaced were untested, for the same reason: they
 * could only run inside a live container. The bug that motivated extracting
 * them — a card clamped horizontally but not vertically, which walks off the
 * bottom of a short viewport — is the fourth test below.
 */

import { describe, it, expect } from 'vitest';
import { anchor } from './anchor.js';

const CONTAINER = { width: 1000, height: 600 };
const CARD = { width: 200, height: 100 };

describe('anchor', () => {
	it('places the card to the right of the point, centred on it, by default', () => {
		expect(anchor({ x: 400, y: 300 }, CARD, CONTAINER)).toEqual({ left: 416, top: 250 });
	});

	it('honours an explicit offset and start alignment', () => {
		expect(
			anchor({ x: 400, y: 300 }, CARD, CONTAINER, {
				offset: { x: 12, y: -8 },
				align: 'start'
			})
		).toEqual({ left: 412, top: 292 });
	});

	it('keeps the card inside the container horizontally', () => {
		const pos = anchor({ x: 990, y: 300 }, CARD, CONTAINER, { padding: { right: 10 } });
		expect(pos.left + CARD.width).toBeLessThanOrEqual(CONTAINER.width - 10);
	});

	it('keeps the card inside the container VERTICALLY — the half that gets forgotten', () => {
		const low = anchor({ x: 400, y: 595 }, CARD, CONTAINER, { padding: { bottom: 12 } });
		expect(low.top + CARD.height).toBeLessThanOrEqual(CONTAINER.height - 12);

		const high = anchor({ x: 400, y: 2 }, CARD, CONTAINER, { padding: { top: 12 } });
		expect(high.top).toBeGreaterThanOrEqual(12);
	});

	it('respects padding on every edge at once', () => {
		const pad = { top: 20, right: 30, bottom: 40, left: 50 };
		for (const point of [
			{ x: 0, y: 0 },
			{ x: 1000, y: 600 },
			{ x: 0, y: 600 },
			{ x: 1000, y: 0 }
		]) {
			const pos = anchor(point, CARD, CONTAINER, { padding: pad });
			expect(pos.left).toBeGreaterThanOrEqual(pad.left);
			expect(pos.top).toBeGreaterThanOrEqual(pad.top);
			expect(pos.left + CARD.width).toBeLessThanOrEqual(CONTAINER.width - pad.right);
			expect(pos.top + CARD.height).toBeLessThanOrEqual(CONTAINER.height - pad.bottom);
		}
	});

	describe('flip', () => {
		it('moves the card to the other side when it would not fit', () => {
			const point = { x: 900, y: 300 };
			const stuck = anchor(point, CARD, CONTAINER);
			const flipped = anchor(point, CARD, CONTAINER, { flip: true });
			expect(flipped.left).toBeLessThan(stuck.left);
			// Left of the point, by the offset.
			expect(flipped.left).toBe(900 - 16 - CARD.width);
		});

		it('stays on the preferred side when there is room', () => {
			const point = { x: 100, y: 300 };
			expect(anchor(point, CARD, CONTAINER, { flip: true })).toEqual(
				anchor(point, CARD, CONTAINER)
			);
		});

		it('does not flip into a side with even less room', () => {
			// Card wider than either side has free: the clamp decides, not the flip.
			const wide = { width: 900, height: 100 };
			const pos = anchor({ x: 500, y: 300 }, wide, CONTAINER, { flip: true });
			expect(pos.left).toBeGreaterThanOrEqual(0);
			expect(pos.left + wide.width).toBeLessThanOrEqual(CONTAINER.width);
		});

		it('flips a left-preferring card to the right', () => {
			const pos = anchor({ x: 40, y: 300 }, CARD, CONTAINER, { side: 'left', flip: true });
			expect(pos.left).toBe(40 + 16);
		});
	});

	describe('degenerate inputs', () => {
		it('returns the raw point before the container has been measured', () => {
			expect(anchor({ x: 7, y: 9 }, CARD, { width: 0, height: 0 })).toEqual({ left: 7, top: 9 });
		});

		it('pins a card larger than its container to the near edge', () => {
			const huge = { width: 2000, height: 2000 };
			const pos = anchor({ x: 500, y: 300 }, huge, CONTAINER, { padding: { top: 5, left: 5 } });
			expect(pos).toEqual({ left: 5, top: 5 });
		});
	});
});
