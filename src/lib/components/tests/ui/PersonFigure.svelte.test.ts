import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PersonFigure from '../../ui/figure/PersonFigure.svelte';
import PersonFigureCaptionProbe from './PersonFigureCaptionProbe.svelte';
import { ARMS, LEGS } from '../../ui/figure/paths.js';

/**
 * The composition: the parts are held by their own suites (`FigureBody`,
 * `FigureHead`, `figure-paths`); what is asserted here is that they meet —
 * the head and callout inside the body's svg — and the two things only the
 * whole owns: where the label goes, and what the caption says.
 */
const figure = () => document.querySelector('figure');
const svg = () => document.querySelector('svg');
const callout = () => document.querySelector('.vit-figure__callout')?.getAttribute('d') ?? '';

describe('PersonFigure', () => {
	it('composes body, head and callout in one svg, decoratively', () => {
		render(PersonFigure, { name: 'Ada', arms: 'raised', legs: 'walking', photo: '/ada.png' });

		const art = svg();
		expect(art?.getAttribute('aria-hidden')).toBe('true');
		const strokes = [...(art?.querySelectorAll('.vit-figure-body__strokes path') ?? [])].map((p) =>
			p.getAttribute('d')
		);
		expect(strokes).toEqual([ARMS.raised, LEGS.walking]);
		expect(art?.querySelector('image')?.getAttribute('href')).toBe('/ada.png');
		expect(art?.querySelector('.vit-figure__callout')).not.toBeNull();
		expect(document.querySelectorAll('svg')).toHaveLength(1);
	});

	it('draws the head when there is no photo', () => {
		render(PersonFigure, { name: 'Ada', head: 'd' });

		expect(svg()?.querySelector('image')).toBeNull();
		expect(svg()?.querySelector('.vit-figure-head')?.getAttribute('d')).toMatch(/^M27.571 8H38/);
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

	it('lets a host own the caption, and still keys the focus stop on the bio prop', () => {
		render(PersonFigureCaptionProbe, { bio: 'Fa recerca.' });

		const caption = document.querySelector('figcaption');
		expect(caption?.querySelector('em.vit-figure__role')?.textContent).toBe('Probe');
		expect(caption?.querySelector('.vit-figure__name')).toBeNull();
		expect(caption?.querySelector('.vit-figure__bio')).toBeNull();
		expect(figure()?.getAttribute('tabindex')).toBe('0');
	});
});
