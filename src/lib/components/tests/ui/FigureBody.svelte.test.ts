import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FigureBody from '../../ui/figure/FigureBody.svelte';
import { ARMS, LEGS } from '../../ui/figure/paths.js';

const svg = () => document.querySelector('svg');
const paths = () =>
	[...document.querySelectorAll('.vit-figure-body__strokes path')].map((p) => p.getAttribute('d'));

describe('FigureBody', () => {
	it('draws the default pose as a decorative image', () => {
		render(FigureBody);

		expect(svg()?.getAttribute('aria-hidden')).toBe('true');
		expect(svg()?.getAttribute('role')).toBeNull();
		expect(svg()?.querySelector('title')).toBeNull();
		expect(paths()).toEqual([ARMS.down, LEGS.standing]);
	});

	it('picks the arm and leg paths from the pose props', () => {
		render(FigureBody, { arms: 'raised', legs: 'walking' });

		expect(paths()).toEqual([ARMS.raised, LEGS.walking]);
	});

	it('draws no head of its own', () => {
		render(FigureBody);

		expect(document.querySelector('.vit-figure-head')).toBeNull();
		expect(document.querySelector('image')).toBeNull();
	});
});
