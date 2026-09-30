import { areaOfSlide, slideOfArea } from './rail-flow.js';
import {
	SWIPE_GIVE,
	easeInOut,
	easeOut,
	giveOf,
	pullOf,
	slideAt,
	slideTarget,
	type Motion
} from './slide-scroll.js';

/**
 * THE SWIPE, WITH RESISTANCE — the state machine behind the stage. On the
 * stage a turn of the wheel does not scroll: it pulls. The travel
 * accumulates and the page yields a little — the current slide lifts, the
 * next peeks in — ever more slowly, the way a spring does; stop short of
 * the threshold and it springs back, pass it and the page swipes to the
 * next slide in a few hundred milliseconds. From the splash to the first
 * area, then area to area; arrow keys and a touch swipe go a slide
 * outright. Past the last slide the page is the reader's again (and above
 * the first). The slide positions are the top of the page and one screen
 * per area down the track (`slide-scroll.ts` holds the arithmetic).
 *
 * The machine talks to the page through a PORT — where the scroll is, how
 * to move it, the slides' positions now, a clock, a frame, a timer, and
 * what to show — so TimelineAreas fills it from `window` and a test fills
 * it with numbers and a hand-turned clock. Nothing in here reads the DOM.
 */
export interface SwipePort {
	scrollY(): number;
	scrollTo(y: number): void;
	/** The slides' scroll positions, measured now (a resize moves them). */
	positions(): number[];
	now(): number;
	frame(step: (now: number) => void): number;
	cancelFrame(id: number): void;
	later(run: () => void, ms: number): number;
	cancelLater(id: number): void;
	/** The pull's share of the threshold, signed (down positive); 0 at rest. */
	pull(share: number): void;
	/** The area that is current — set the moment a swipe commits. */
	show(area: number): void;
	/** While the scroll is being driven. */
	moving(on: boolean): void;
}

export interface SwipeOptions {
	/** How many areas the run has. */
	count: number;
	/** Whether the splash is a slide of the run (see slidePositions). */
	entry: Motion;
	slideMs?: number;
	springMs?: number;
	restMs?: number;
	/** Silence after the last wheel event that ends a pull. */
	settleMs?: number;
}

export interface SwipeDriver {
	/** A wheel turn; true when the page took it (the host prevents the default). */
	wheel(deltaY: number, modified?: boolean): boolean;
	/** A key; true when it swiped (the host prevents the default). */
	key(key: string): boolean;
	touchStart(y: number): void;
	touchEnd(y: number): void;
	/** A rail node: drive to the area's slide. */
	jumpTo(area: number): void;
	stop(): void;
}

export const SLIDE_MS = 640;
const SPRING_MS = 220;
const REST_MS = 120;
const SETTLE_MS = 140;
/** A touch shorter than this is a tap, not a swipe. */
const TOUCH_SWIPE_PX = 40;

export function createSwipeDriver(port: SwipePort, options: SwipeOptions): SwipeDriver {
	const { count, entry } = options;
	const slideMs = options.slideMs ?? SLIDE_MS;
	const springMs = options.springMs ?? SPRING_MS;
	const restMs = options.restMs ?? REST_MS;
	const settleMs = options.settleMs ?? SETTLE_MS;

	let tick = 0;
	let travel = 0;
	let anchor: number | null = null;
	let settle: number | undefined;
	let moving = false;
	let touchY: number | null = null;

	const setPull = (share: number) => port.pull(share);

	/**
	 * Drive the scroll to `target` over `ms`, then rest. A swipe names the
	 * slide it goes to, and that slide becomes current AT ONCE — the cards
	 * start moving the moment the gesture commits, not when the scroll
	 * happens to pass the halfway mark — while the scroll catches up
	 * underneath.
	 */
	const drive = (
		target: number,
		ms: number,
		rest: number,
		ease: (t: number) => number,
		area?: number
	) => {
		const from = port.scrollY();
		moving = true;
		port.moving(true);
		travel = 0;
		setPull(0);
		if (area !== undefined) port.show(area);
		if (tick) port.cancelFrame(tick);
		const started = port.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - started) / ms);
			port.scrollTo(from + (target - from) * ease(t));
			if (t < 1) tick = port.frame(step);
			else {
				tick = 0;
				port.later(() => {
					moving = false;
					port.moving(false);
				}, rest);
			}
		};
		tick = port.frame(step);
	};

	/** The area a slide position shows: the splash (when in the run) shows the first, the end keeps the last. */
	const areaAt = (all: number[], target: number) => areaOfSlide(all.indexOf(target), entry, count);

	const springBack = () => {
		if (anchor === null || moving) return;
		drive(anchor, springMs, 0, easeOut);
		anchor = null;
	};

	/** The slide the reader is anchored on, or null off the slides (before the run too). */
	const anchorAt = (): number | null => {
		const all = port.positions();
		const y = port.scrollY();
		const at = all[slideAt(all, y)] ?? 0;
		return y >= at - 2 && y - at <= SWIPE_GIVE + 2 ? at : null;
	};

	/** A whole slide outright — keys and touch. True when taken. */
	const swipe = (direction: 1 | -1): boolean => {
		if (moving) return true;
		const all = port.positions();
		const target = slideTarget(all, port.scrollY(), direction);
		if (target === null) return false;
		drive(target, slideMs, restMs, easeInOut, areaAt(all, target));
		return true;
	};

	return {
		wheel(deltaY, modified = false) {
			if (modified || Math.abs(deltaY) < 2) return false;
			if (moving) return true;
			const direction: 1 | -1 = deltaY > 0 ? 1 : -1;
			const all = port.positions();
			if (anchor === null) anchor = anchorAt();
			if (anchor === null) {
				// Inside the run but between slides — the page's own scroll
				// brought the reader here (an entry by scroll, a resize): the
				// first gesture catches, driving to the slide in its direction.
				const first = all[0] ?? 0;
				const last = all[all.length - 1] ?? 0;
				const y = port.scrollY();
				if (y > first && y < last) {
					const target = slideTarget(all, y, direction);
					if (target !== null) {
						drive(target, slideMs, restMs, easeInOut, areaAt(all, target));
						return true;
					}
				}
				return false;
			}
			const target = slideTarget(all, anchor, direction);
			if (target === null) {
				// Off the range in this direction: the page scrolls itself.
				anchor = null;
				return false;
			}
			// A change of mind starts the pull over.
			if (Math.sign(travel) !== direction) travel = 0;
			travel += deltaY;
			const pull = pullOf(travel);
			if (pull >= 1) {
				drive(target, slideMs, restMs, easeInOut, areaAt(all, target));
				anchor = null;
				return true;
			}
			port.scrollTo(anchor + giveOf(pull) * direction);
			setPull(pull * direction);
			if (settle !== undefined) port.cancelLater(settle);
			settle = port.later(springBack, settleMs);
			return true;
		},
		key(key) {
			const direction =
				key === 'ArrowDown' || key === 'PageDown' || key === ' '
					? 1
					: key === 'ArrowUp' || key === 'PageUp'
						? -1
						: null;
			return direction !== null && swipe(direction);
		},
		touchStart(y) {
			touchY = y;
		},
		touchEnd(y) {
			if (touchY === null) return;
			const delta = touchY - y;
			touchY = null;
			if (Math.abs(delta) > TOUCH_SWIPE_PX) swipe(delta > 0 ? 1 : -1);
		},
		jumpTo(area) {
			const all = port.positions();
			const target = all[slideOfArea(area, entry)];
			if (target !== undefined) drive(target, slideMs, restMs, easeInOut, area);
		},
		stop() {
			if (settle !== undefined) port.cancelLater(settle);
			if (tick) port.cancelFrame(tick);
			setPull(0);
		}
	};
}
