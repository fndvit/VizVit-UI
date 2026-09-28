import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FigureHeadProbe from './FigureHeadProbe.svelte';
import { HEADS } from '../../ui/figure/paths.js';

/**
 * Three ways of being a head, and the fall from one to another. Rendered
 * through the probe's svg, the way the body holds it.
 */
const drawn = () => document.querySelector('.vit-figure-head');
const image = () => document.querySelector('image');

describe('FigureHead', () => {
	it('draws the round outline when there is no photo', () => {
		render(FigureHeadProbe);

		expect(image()).toBeNull();
		expect(drawn()?.getAttribute('d')).toBe(HEADS.round);
	});

	it('draws the outline asked for', () => {
		render(FigureHeadProbe, { head: 'cup' });

		expect(drawn()?.getAttribute('d')).toBe(HEADS.cup);
	});

	it('sits a cut-out on the neck, bottom-anchored and unclipped', () => {
		render(FigureHeadProbe, { photo: '/ada.png' });

		expect(image()?.getAttribute('href')).toBe('/ada.png');
		expect(image()?.getAttribute('preserveAspectRatio')).toBe('xMidYMax meet');
		expect(image()?.hasAttribute('clip-path')).toBe(false);
		expect(document.querySelector('clipPath')).toBeNull();
		expect(drawn()).toBeNull();
	});

	it('masks a portrait into a circle, with a clip id of its own per head', () => {
		render(FigureHeadProbe, { photo: '/ada.jpg', photoShape: 'circle', two: true });

		const clips = [...document.querySelectorAll('clipPath')];
		expect(clips).toHaveLength(2);
		expect(clips[0]?.querySelector('circle')).not.toBeNull();
		expect(clips[0]?.id).not.toBe(clips[1]?.id);

		const images = [...document.querySelectorAll('image')];
		expect(images[0]?.getAttribute('clip-path')).toBe(`url(#${clips[0]?.id})`);
		expect(images[1]?.getAttribute('clip-path')).toBe(`url(#${clips[1]?.id})`);
		expect(images[0]?.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice');
	});

	it('scales the photo about the neck', () => {
		render(FigureHeadProbe, { photo: '/ada.png', headScale: 1.2 });

		expect(image()?.getAttribute('transform')).toBe(
			'translate(76.5 84) scale(1.2) translate(-76.5 -84)'
		);
	});

	it('falls back to the drawn head when the photo fails to load', () => {
		render(FigureHeadProbe, { photo: '/missing.png' });

		image()?.dispatchEvent(new Event('error'));
		flushSync();

		expect(image()).toBeNull();
		expect(drawn()).not.toBeNull();
	});
});
