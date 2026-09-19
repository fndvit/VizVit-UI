/**
 * The scrolly step ramp, asserted without a scroller.
 *
 * `stepStyle` is the whole of what `<ScrollySteps>` hands each step, so the
 * fade/slide curve every scrolly card on the site draws with can be pinned
 * here instead of by scrolling a real page.
 *
 * The second block is a smoke test for the seam itself: `<ScrollySteps>` drives
 * a Svelte 4 component (`@sveltejs/svelte-scroller`) through its legacy
 * `background`/`foreground` slots, and this proves that bridge renders.
 */

import { describe, it, expect } from 'vitest';
import type { ComponentProps } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { stepStyle } from './stepStyle.js';
import ScrollyStepsHarness from './ScrollyStepsHarness.test.svelte';

/**
 * Mounts the harness and hands back the element to query. This suite runs in a
 * real browser (the `client` project), so the scroller's slots are laid out for
 * real rather than approximated in jsdom.
 */
function mount(props: ComponentProps<typeof ScrollyStepsHarness>): HTMLElement {
	render(ScrollyStepsHarness, props);
	return document.body;
}

describe('stepStyle', () => {
	it('marks only the scroller’s current step active', () => {
		expect(stepStyle(1, 1, 0.5).active).toBe(true);
		expect(stepStyle(0, 1, 0.5).active).toBe(false);
		expect(stepStyle(2, 1, 0.5).active).toBe(false);
	});

	it('keeps inactive steps fully transparent and parked below', () => {
		for (const i of [0, 2, 7]) {
			const style = stepStyle(i, 1, 0.5);
			expect(style.opacity).toBe(0);
			expect(style.translateY).toBe(30);
		}
	});

	it('ramps opacity in over the first quarter, holds, then ramps out', () => {
		expect(stepStyle(0, 0, 0).opacity).toBe(0);
		expect(stepStyle(0, 0, 0.125).opacity).toBeCloseTo(0.5);
		expect(stepStyle(0, 0, 0.25).opacity).toBe(1);
		// plateau
		expect(stepStyle(0, 0, 0.5).opacity).toBe(1);
		expect(stepStyle(0, 0, 0.75).opacity).toBe(1);
		// fade out
		expect(stepStyle(0, 0, 0.875).opacity).toBeCloseTo(0.5);
		expect(stepStyle(0, 0, 1).opacity).toBe(0);
	});

	it('slides up into the plateau and keeps going on the way out', () => {
		expect(stepStyle(0, 0, 0).translateY).toBe(30);
		expect(stepStyle(0, 0, 0.125).translateY).toBeCloseTo(15);
		expect(stepStyle(0, 0, 0.25).translateY).toBe(0);
		// plateau
		expect(stepStyle(0, 0, 0.5).translateY).toBe(0);
		// exit
		expect(stepStyle(0, 0, 0.875).translateY).toBeCloseTo(-15);
		expect(stepStyle(0, 0, 1).translateY).toBe(-30);
	});

	it('never lets opacity leave 0…1, even past the offset boundaries', () => {
		for (const offset of [-1, -0.001, 1.001, 2]) {
			const { opacity } = stepStyle(0, 0, offset);
			expect(opacity).toBeGreaterThanOrEqual(0);
			expect(opacity).toBeLessThanOrEqual(1);
		}
	});
});

describe('<ScrollySteps> over the legacy scroller slots', () => {
	it('renders the background and one section per step', () => {
		const container = mount({ steps: ['one', 'two', 'three'] });

		expect(container.querySelector('.vit-scrolly__bg')).not.toBeNull();
		expect(container.querySelector('[data-testid="background"]')).not.toBeNull();

		const sections = container.querySelectorAll('section');
		expect(sections).toHaveLength(3);
		expect([...sections].map((s) => s.textContent?.trim())).toEqual(['one', 'two', 'three']);
		expect(sections[0].className).toContain('step-0');
	});

	it('draws step 0 at full opacity while the scroller sits at its start', () => {
		const container = mount({ steps: ['one', 'two'] });
		const cards = container.querySelectorAll('[data-testid="card"]');
		// index/offset both start at 0 → step 0 is active but not yet faded in
		expect(cards[0].getAttribute('style')).toContain('opacity: 0');
		expect(cards[1].getAttribute('style')).toContain('translateY(30px)');
	});

	it('renders before/after sections around the steps', () => {
		const container = mount({ steps: ['one'], withBuffers: true });
		const sections = container.querySelectorAll('section');
		// Only the authored class is asserted: Svelte appends its own scoping
		// class to these elements now that the component ships styles, and that
		// is an implementation detail of the compiler, not of the ordering.
		const authored = [...sections].map((el) =>
			[...el.classList].filter((c) => !c.startsWith('svelte-')).join(' ')
		);
		expect(authored).toEqual(['lead-in', 'step-0', 'hold']);
	});
});
