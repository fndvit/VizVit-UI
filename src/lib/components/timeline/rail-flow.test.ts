import { describe, expect, it } from 'vitest';
import { areaOfSlide, areaReveal, railPlaces, slideOfArea } from './rail-flow.js';

const HEIGHT = 800;
/** The tokens at 16px: 4rem, 2.5rem, 1.5rem, 5.5rem. */
const G = { top: 64, step: 40, stack: 24, bottom: 88 };

describe('railPlaces', () => {
	it('parks the headings scrolled past in the top stack, rides level with the one on screen, and holds the rest at the bottom', () => {
		const { places, tops, active } = railPlaces([-100, 300, 2000], HEIGHT, G);

		expect(places).toEqual(['passed', 'current', 'upcoming']);
		expect(tops[0]).toBe(G.stack);
		expect(tops[1]).toBe(300);
		expect(tops[2]).toBe(HEIGHT - G.bottom);
		expect(active).toBe(1);
	});

	it('stacks several parked nodes a step apart, in the areas order, so every step stays in view', () => {
		const { places, tops } = railPlaces([-500, -400, 1500, 1600], HEIGHT, G);

		expect(places).toEqual(['passed', 'passed', 'upcoming', 'upcoming']);
		expect(tops[1] - tops[0]).toBe(G.step);
		expect(tops[3] - tops[2]).toBe(G.step);
		expect(tops[3]).toBe(HEIGHT - G.bottom);
	});

	it('points at the last passed area between two headings, and at the first before any', () => {
		expect(railPlaces([-500, -400, 1500], HEIGHT, G).active).toBe(1);
		expect(railPlaces([1500, 1600, 1700], HEIGHT, G).active).toBe(0);
	});
});

describe('areaReveal', () => {
	it('is fully shown mid-screen, dim and lifted at the top edge, dim and lowered off the bottom', () => {
		expect(areaReveal({ top: 200, bottom: 600 }, HEIGHT, 60)).toEqual({ reveal: 1, shift: 0 });

		const leaving = areaReveal({ top: -300, bottom: 60 }, HEIGHT, 60);
		expect(leaving.reveal).toBe(0);
		expect(leaving.shift).toBe(-48);

		const entering = areaReveal({ top: 800, bottom: 1200 }, HEIGHT, 60);
		expect(entering.reveal).toBe(0);
		expect(entering.shift).toBe(48);
	});

	it('moves nothing under reduced motion', () => {
		expect(areaReveal({ top: 800, bottom: 1200 }, HEIGHT, 60, true)).toEqual({
			reveal: 1,
			shift: 0
		});
	});
});

describe('the run and the areas', () => {
	it('offsets by the splash only when the splash is a slide of the run', () => {
		expect(slideOfArea(0, 'swipe')).toBe(1);
		expect(slideOfArea(0, 'scroll')).toBe(0);
		expect(areaOfSlide(1, 'swipe', 3)).toBe(0);
		expect(areaOfSlide(0, 'swipe', 3)).toBe(0);
		expect(areaOfSlide(5, 'scroll', 3)).toBe(2);
	});
});
