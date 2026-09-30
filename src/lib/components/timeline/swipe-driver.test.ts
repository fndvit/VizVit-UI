import { describe, expect, it } from 'vitest';
import { SWIPE_THRESHOLD } from './slide-scroll.js';
import { createSwipeDriver, type SwipePort } from './swipe-driver.js';

/** A page in numbers: a scroll position, a hand-turned clock, frames and timers run by `advance`. */
function fakePage(positions: number[], scrollY = 0) {
	let now = 0;
	let nextId = 1;
	const frames = new Map<number, (now: number) => void>();
	const timers = new Map<number, { at: number; run: () => void }>();
	const log = { pulls: [] as number[], shown: [] as number[], moving: [] as boolean[] };
	const port: SwipePort = {
		scrollY: () => scrollY,
		scrollTo: (y) => {
			scrollY = y;
		},
		positions: () => positions,
		now: () => now,
		frame: (step) => {
			const id = nextId++;
			frames.set(id, step);
			return id;
		},
		cancelFrame: (id) => void frames.delete(id),
		later: (run, ms) => {
			const id = nextId++;
			timers.set(id, { at: now + ms, run });
			return id;
		},
		cancelLater: (id) => void timers.delete(id),
		pull: (share) => void log.pulls.push(share),
		show: (area) => void log.shown.push(area),
		moving: (on) => void log.moving.push(on)
	};
	/** Turn the clock by `ms`, running every frame (one per 16ms) and every timer that comes due. */
	const advance = (ms: number) => {
		const until = now + ms;
		while (now < until) {
			now = Math.min(until, now + 16);
			for (const [id, step] of [...frames]) {
				frames.delete(id);
				step(now);
			}
			for (const [id, timer] of [...timers]) {
				if (timer.at <= now) {
					timers.delete(id);
					timer.run();
				}
			}
		}
	};
	return {
		port,
		advance,
		get scrollY() {
			return scrollY;
		},
		log
	};
}

// The splash and three areas, one screen each; the splash is a slide of the run.
const SLIDES = [0, 740, 1480, 2220];

describe('the swipe driver', () => {
	it('yields to a short pull and springs back once the wheel goes quiet', () => {
		const page = fakePage(SLIDES);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		expect(driver.wheel(60)).toBe(true);
		expect(page.scrollY).toBeGreaterThan(0);
		expect(page.scrollY).toBeLessThan(100);
		expect(page.log.pulls.at(-1)).toBeCloseTo(60 / SWIPE_THRESHOLD, 2);
		expect(page.log.shown).toEqual([]);

		page.advance(1000);
		expect(page.scrollY).toBe(0);
		expect(page.log.pulls.at(-1)).toBe(0);
	});

	it('commits past the threshold: the next area shows at once and the scroll arrives in a slide', () => {
		const page = fakePage(SLIDES);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		driver.wheel(100);
		driver.wheel(100);
		expect(page.log.shown).toEqual([0]);
		expect(page.log.moving.at(-1)).toBe(true);
		page.advance(700);
		expect(page.scrollY).toBe(740);
		page.advance(200);
		expect(page.log.moving.at(-1)).toBe(false);
	});

	it('takes the wheel while a slide is in flight and lets the page go past the last slide', () => {
		const page = fakePage(SLIDES, 2220);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		expect(driver.wheel(100)).toBe(false);
		expect(page.scrollY).toBe(2220);

		expect(driver.wheel(-100)).toBe(true);
		driver.wheel(-100);
		expect(page.log.shown).toEqual([1]);
		expect(driver.wheel(100)).toBe(true);
		expect(page.log.shown).toEqual([1]);
	});

	it('starts the pull over on a change of mind', () => {
		const page = fakePage(SLIDES, 740);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		driver.wheel(120);
		driver.wheel(-120);
		driver.wheel(100);
		expect(page.log.shown).toEqual([]);
	});

	it('goes a whole slide on a key or a long touch, and nowhere above the first', () => {
		const page = fakePage(SLIDES);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		expect(driver.key('ArrowUp')).toBe(false);
		expect(driver.key('x')).toBe(false);
		expect(driver.key('ArrowDown')).toBe(true);
		expect(page.log.shown).toEqual([0]);
		page.advance(900);

		driver.touchStart(500);
		driver.touchEnd(490);
		expect(page.log.shown).toEqual([0]);
		driver.touchStart(500);
		driver.touchEnd(400);
		expect(page.log.shown).toEqual([0, 1]);
	});

	it('catches a reader dropped between slides on the first wheel turn', () => {
		const page = fakePage(SLIDES, 1000);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		expect(driver.wheel(30)).toBe(true);
		expect(page.log.shown).toEqual([1]);
		page.advance(900);
		expect(page.scrollY).toBe(1480);
	});

	it('jumps to an area from the rail, by the run the splash is part of', () => {
		const page = fakePage(SLIDES);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		driver.jumpTo(2);
		expect(page.log.shown).toEqual([2]);
		page.advance(900);
		expect(page.scrollY).toBe(2220);
	});

	it('stops cleanly: no timer fires after, and the pull is released', () => {
		const page = fakePage(SLIDES);
		const driver = createSwipeDriver(page.port, { count: 3, entry: 'swipe' });

		driver.wheel(60);
		driver.stop();
		page.advance(1000);
		expect(page.log.pulls.at(-1)).toBe(0);
		expect(page.scrollY).toBeGreaterThan(0);
	});
});
