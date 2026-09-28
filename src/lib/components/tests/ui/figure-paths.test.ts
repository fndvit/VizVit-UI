import { describe, expect, it } from 'vitest';
import {
	ARM_POSES,
	ARMS,
	CALLOUT_RULE,
	CALLOUT_RUN,
	FIGURE_WIDTH,
	HEAD_MODES,
	HEAD_SHAPES,
	HEADS,
	LABEL_ALIGNS,
	LABEL_SIDES,
	LEG_POSES,
	LEGS,
	RULE_Y,
	SHOULDER,
	calloutPath
} from '../../ui/figure/paths.js';

/**
 * The callout is arithmetic — shoulder, run, rule — and arithmetic is what a
 * node test can hold. The four placements are stated as the literal paths a
 * reader can check against the drawing, not re-derived from the constants
 * (which could not fail for its stated reason).
 */
describe('calloutPath', () => {
	it.each([
		['right', 'top', 'M113.5 76L177 50H267'],
		['right', 'bottom', 'M113.5 76L177 200H267'],
		['left', 'top', 'M39.5 76L-24 50H-114'],
		['left', 'bottom', 'M39.5 76L-24 200H-114']
	] as const)('%s × %s runs shoulder → rule', (side, align, path) => {
		expect(calloutPath(side, align)).toBe(path);
	});

	it('starts on the shoulder line and ends a rule past the run, on both sides', () => {
		const right = calloutPath('right', 'top');
		const left = calloutPath('left', 'bottom');

		expect(right.startsWith(`M${SHOULDER.right} ${SHOULDER.y}`)).toBe(true);
		expect(right.endsWith(`H${FIGURE_WIDTH + CALLOUT_RUN + CALLOUT_RULE}`)).toBe(true);
		expect(left.startsWith(`M${SHOULDER.left} ${SHOULDER.y}`)).toBe(true);
		expect(left.endsWith(`H${-CALLOUT_RUN - CALLOUT_RULE}`)).toBe(true);
		expect(left).toContain(` ${RULE_Y.bottom}H`);
	});
});

describe('the closed pose sets', () => {
	it('draw every pose as one open stroke path', () => {
		for (const d of [...Object.values(ARMS), ...Object.values(LEGS)]) {
			expect(d).toMatch(/^M[\d.]+ [\d.]+[LVH]/);
			expect(d.endsWith('Z')).toBe(false);
		}
	});

	it('close every drawn head, so it can take a fill', () => {
		for (const d of Object.values(HEADS)) expect(d.endsWith('Z')).toBe(true);
	});
});

/**
 * The tuples are what a host's enum and a select's options derive from; the
 * maps are what the drawing reads. `satisfies` binds them at compile time,
 * and this holds the ORDER too: a select lists poses in the tuple's order,
 * which is the order the maps spell them in.
 */
describe('the figure vocabulary', () => {
	it('names the pose maps, in display order', () => {
		expect(Object.keys(ARMS)).toEqual([...ARM_POSES]);
		expect(Object.keys(LEGS)).toEqual([...LEG_POSES]);
		expect(Object.keys(RULE_Y)).toEqual([...LABEL_ALIGNS]);
		expect(Object.keys(HEADS)).toEqual([...HEAD_SHAPES]);
	});

	it('is the head MODE, not the drawn outline set', () => {
		expect([...HEAD_MODES]).toEqual(['cutout', 'circle', 'drawn']);
		expect(Object.keys(HEADS)).not.toEqual([...HEAD_MODES]);
		expect([...LABEL_SIDES]).toEqual(['left', 'right']);
	});
});
