import { describe, expect, it } from 'vitest';
import { clamp01, watchScroll } from './scroll-progress.js';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

describe('watchScroll', () => {
	it('runs the update once per frame however many scroll and resize events arrive, and stops on cleanup', async () => {
		let runs = 0;
		const stop = watchScroll(() => {
			runs += 1;
		});

		window.dispatchEvent(new Event('scroll'));
		window.dispatchEvent(new Event('scroll'));
		window.dispatchEvent(new Event('resize'));
		await frame();
		await frame();
		expect(runs).toBe(1);

		window.dispatchEvent(new Event('resize'));
		await frame();
		await frame();
		expect(runs).toBe(2);

		stop();
		window.dispatchEvent(new Event('scroll'));
		await frame();
		await frame();
		expect(runs).toBe(2);
	});
});

describe('clamp01', () => {
	it('holds a share within 0..1', () => {
		expect([clamp01(-2), clamp01(0.4), clamp01(7)]).toEqual([0, 0.4, 1]);
	});
});
