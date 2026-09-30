import { describe, expect, it } from 'vitest';
import {
	easeInOut,
	easeOut,
	giveOf,
	pullOf,
	slideAt,
	slidePositions,
	slideTarget
} from './slide-scroll.js';

const positions = slidePositions(800, 3, 800); // [0, 800, 1600, 2400, 3200]

describe('the swipe arithmetic', () => {
	it('lists the splash, one screen per area, and the end of the track', () => {
		expect(positions).toEqual([0, 800, 1600, 2400, 3200]);
	});

	it('sits each slide under a fixed nav', () => {
		expect(slidePositions(860, 2, 780, 60)).toEqual([0, 800, 1580, 2360]);
	});

	it('leaves an end to the page when it is not a swipe', () => {
		expect(slidePositions(800, 3, 800, 0, { entry: 'scroll', exit: 'swipe' })).toEqual([
			800, 1600, 2400, 3200
		]);
		expect(slidePositions(800, 3, 800, 0, { entry: 'swipe', exit: 'scroll' })).toEqual([
			0, 800, 1600, 2400
		]);
		expect(slidePositions(800, 3, 800, 0, { entry: 'scroll', exit: 'scroll' })).toEqual([
			800, 1600, 2400
		]);
	});

	it('hands the page back before a run that starts at the first area', () => {
		const fromFirst = slidePositions(800, 3, 800, 0, { entry: 'scroll', exit: 'swipe' });
		expect(slideTarget(fromFirst, 0, 1)).toBeNull();
		expect(slideTarget(fromFirst, 400, 1)).toBeNull();
		expect(slideTarget(fromFirst, 800, 1)).toBe(1600);
		expect(slideTarget(fromFirst, 800, -1)).toBeNull();
	});

	it('knows which slide the scroll is on, with a small tolerance', () => {
		expect(slideAt(positions, 0)).toBe(0);
		expect(slideAt(positions, 799)).toBe(1);
		expect(slideAt(positions, 800)).toBe(1);
		expect(slideAt(positions, 1500)).toBe(1);
		expect(slideAt(positions, 2400)).toBe(3);
		expect(slideAt(positions, 3200)).toBe(4);
	});

	it('goes to the next or previous slide from a slide', () => {
		expect(slideTarget(positions, 0, 1)).toBe(800);
		expect(slideTarget(positions, 800, 1)).toBe(1600);
		expect(slideTarget(positions, 1600, -1)).toBe(800);
		expect(slideTarget(positions, 800, -1)).toBe(0);
	});

	it('finishes a slide in progress when scrolling down from between two', () => {
		expect(slideTarget(positions, 1000, 1)).toBe(1600);
		expect(slideTarget(positions, 1000, -1)).toBe(800);
	});

	it('hands the page back above the first slide and past the end of the track', () => {
		expect(slideTarget(positions, 0, -1)).toBeNull();
		// The last area still swipes on, to what follows the timeline …
		expect(slideTarget(positions, 2400, 1)).toBe(3200);
		// … and from there, up brings the last area back; down is the page's.
		expect(slideTarget(positions, 3200, -1)).toBe(2400);
		expect(slideTarget(positions, 3200, 1)).toBeNull();
		expect(slideTarget(positions, 4000, 1)).toBeNull();
		expect(slideTarget(positions, 4000, -1)).toBeNull();
	});

	it('yields ever more slowly towards the threshold, and never past the give', () => {
		expect(pullOf(0)).toBe(0);
		expect(pullOf(90, 180)).toBe(0.5);
		expect(pullOf(400, 180)).toBe(1);
		expect(giveOf(0)).toBe(0);
		expect(giveOf(1, 96)).toBe(96);
		// The second quarter of the pull yields less than the first.
		expect(giveOf(0.5) - giveOf(0.25)).toBeLessThan(giveOf(0.25) - giveOf(0));
	});

	it('eases out, and in and out', () => {
		expect(easeOut(0)).toBe(0);
		expect(easeOut(1)).toBe(1);
		expect(easeOut(0.5)).toBeGreaterThan(0.5);
		expect(easeInOut(0)).toBe(0);
		expect(easeInOut(1)).toBe(1);
		expect(easeInOut(0.5)).toBe(0.5);
		expect(easeInOut(0.25)).toBeLessThan(0.25);
	});
});
