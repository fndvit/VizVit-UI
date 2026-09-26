import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PersonFigure from '../../ui/PersonFigure.svelte';

/**
 * The figure is a drawing that must never speak, a head that has three ways
 * of being there, and a label whose line has four places to go. Each is a
 * branch a story shows and, before this file, nothing asserted.
 */

const DOWN = 'M27 107L39.375 8H113.625L126 107';
const STANDING = 'M21 7V179H8M70 7V179H82';
const ROUND_HEAD_START = 'M25 41C33.8366 41';

const svg = () => document.querySelector('svg');
const bodyPaths = () =>
	[...document.querySelectorAll('.vit-figure__body path')].map((path) => path.getAttribute('d'));
const figure = () => document.querySelector('figure');
const callout = () => document.querySelector('.vit-figure__callout')?.getAttribute('d') ?? '';

describe('PersonFigure', () => {
	it('draws the default pose as a decorative image', () => {
		render(PersonFigure, { name: 'Ada' });

		expect(svg()?.getAttribute('aria-hidden')).toBe('true');
		expect(svg()?.getAttribute('role')).toBeNull();
		expect(svg()?.querySelector('title')).toBeNull();
		expect(bodyPaths()).toContain(DOWN);
		expect(bodyPaths()).toContain(STANDING);
	});

	it('picks the arm and leg paths from the pose props', () => {
		render(PersonFigure, { name: 'Ada', arms: 'raised', legs: 'walking' });

		expect(bodyPaths().some((d) => d?.startsWith('M7 25L32.9376'))).toBe(true);
		expect(bodyPaths().some((d) => d?.startsWith('M69 7L85 129.857'))).toBe(true);
		expect(bodyPaths()).not.toContain(DOWN);
	});

	it('draws the head when there is no photo', () => {
		render(PersonFigure, { name: 'Ada' });

		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure__head')?.getAttribute('d')).toContain(
			ROUND_HEAD_START
		);
	});

	it('draws the head shape asked for', () => {
		render(PersonFigure, { name: 'Ada', head: 'cup' });

		expect(document.querySelector('.vit-figure__head')?.getAttribute('d')).toMatch(/^M8 8V24/);
	});

	it('sits a cut-out on the neck, bottom-anchored and unclipped', () => {
		render(PersonFigure, { name: 'Ada', photo: '/ada.png' });

		const image = document.querySelector('image');
		expect(image?.getAttribute('href')).toBe('/ada.png');
		expect(image?.getAttribute('preserveAspectRatio')).toBe('xMidYMax meet');
		expect(image?.hasAttribute('clip-path')).toBe(false);
		expect(document.querySelector('clipPath')).toBeNull();
		expect(document.querySelector('.vit-figure__head')).toBeNull();
	});

	it('masks a portrait into a circle, with an id of its own per figure', () => {
		render(PersonFigure, { name: 'Ada', photo: '/ada.jpg', photoShape: 'circle' });
		render(PersonFigure, { name: 'Bea', photo: '/bea.jpg', photoShape: 'circle' });

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
		render(PersonFigure, { name: 'Ada', photo: '/ada.png', headScale: 1.2 });

		expect(document.querySelector('image')?.getAttribute('transform')).toBe(
			'translate(76.5 84) scale(1.2) translate(-76.5 -84)'
		);
	});

	it('falls back to the drawn head when the photo fails to load', () => {
		render(PersonFigure, { name: 'Ada', photo: '/missing.png' });

		document.querySelector('image')?.dispatchEvent(new Event('error'));
		flushSync();

		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure__head')).not.toBeNull();
	});

	it('runs the callout from the right shoulder to a label on the right, by default', () => {
		render(PersonFigure, { name: 'Ada' });

		expect(figure()?.dataset.side).toBe('right');
		expect(figure()?.dataset.align).toBe('top');
		expect(callout()).toBe('M113.5 76L177 50H267');
	});

	it('mirrors the callout for a label on the left, and drops it for a bottom label', () => {
		render(PersonFigure, { name: 'Ada', labelSide: 'left', labelAlign: 'bottom' });

		expect(figure()?.dataset.side).toBe('left');
		expect(figure()?.dataset.align).toBe('bottom');
		expect(callout()).toBe('M39.5 76L-24 200H-114');
	});

	it('captions the name and role, and is not a focus stop without a bio', () => {
		render(PersonFigure, { name: 'Ada', role: 'Directora' });

		const caption = document.querySelector('figcaption');
		expect(caption?.querySelector('.vit-figure__name')?.textContent).toBe('Ada');
		expect(caption?.querySelector('.vit-figure__role')?.textContent).toBe('Directora');
		expect(document.querySelector('.vit-figure__bio')).toBeNull();
		expect(figure()?.hasAttribute('tabindex')).toBe(false);
	});

	it('carries the bio and becomes focusable so a keyboard can reveal it', () => {
		render(PersonFigure, { name: 'Ada', bio: 'Fa recerca.' });

		expect(document.querySelector('.vit-figure__bio')?.textContent).toBe('Fa recerca.');
		expect(figure()?.getAttribute('tabindex')).toBe('0');
	});
});
