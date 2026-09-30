import type { Motion } from './slide-scroll.js';

/**
 * The STACKED timeline's arithmetic — the flow the page scrolls through when
 * the stage is off (phones, reduced motion, a host that asks for scroll,
 * the CMS editing). The swipe has `slide-scroll.ts`; this is its twin for
 * the other mode, so both live where a test can call them with numbers
 * rather than inside an effect only a real scroll reaches.
 *
 * The rail's geometry is the stylesheet's (`--vit-rail-*` tokens): the CSS
 * places the nodes by it and TimelineAreas reads the same values to call
 * these — one owner, no number retyped.
 */
export type Place = 'passed' | 'current' | 'upcoming';

/**
 * The rail's geometry in px, read off the `--vit-rail-*` tokens where the
 * rail is measured: the current node's row from the top, the step between
 * parked nodes, where the passed stack starts (from the top) and the
 * upcoming stack ends (from the bottom).
 */
export interface RailGeometry {
	top: number;
	step: number;
	stack: number;
	bottom: number;
}

export interface RailPlaces {
	places: Place[];
	/** Each node's top within the rail, in px. */
	tops: number[];
	/** The area the rail points at: the last current, else the last passed, else the first. */
	active: number;
}

/**
 * Where each node sits for the headings at `centres` (each heading's centre,
 * in px from the rail's top): level with its heading while that is between
 * the two stacks, parked in the top stack once passed, in the bottom stack
 * while to come. Every step stays in view.
 */
export function railPlaces(centres: number[], railHeight: number, g: RailGeometry): RailPlaces {
	const n = centres.length;
	const places: Place[] = [];
	const tops: number[] = [];
	centres.forEach((y, i) => {
		const topSlot = g.stack + i * g.step;
		const bottomSlot = railHeight - g.bottom - (n - 1 - i) * g.step;
		if (y < topSlot) {
			places.push('passed');
			tops.push(topSlot);
		} else if (y > bottomSlot) {
			places.push('upcoming');
			tops.push(bottomSlot);
		} else {
			places.push('current');
			tops.push(y);
		}
	});
	const reached = places.lastIndexOf('current');
	const active = reached !== -1 ? reached : Math.max(0, places.lastIndexOf('passed'));
	return { places, tops, active };
}

/** The share of the screen an area's content enters and leaves over. */
export const REVEAL_SPAN = 0.35;
/** How far the content rides while entering or leaving, in px. */
export const REVEAL_SHIFT = 48;

/**
 * An area's content as the page scrolls: coming up from the bottom edge it
 * rises into place and brightens over the lower third of the screen, going
 * out at the top it fades and lifts over the same distance. `rect` is the
 * content's box in the viewport, `screen` the viewport height, `navOffset`
 * what sits above the page. Nothing moves when `still`.
 */
export function areaReveal(
	rect: { top: number; bottom: number },
	screen: number,
	navOffset: number,
	still = false
): { reveal: number; shift: number } {
	if (still) return { reveal: 1, shift: 0 };
	const span = screen * REVEAL_SPAN;
	const entering = Math.min(1, Math.max(0, (screen - rect.top) / span));
	const leaving = Math.min(1, Math.max(0, (rect.bottom - navOffset) / span));
	return {
		reveal: entering * leaving,
		shift: (1 - entering) * REVEAL_SHIFT - (1 - leaving) * REVEAL_SHIFT
	};
}

/**
 * The run's slides and the areas: when the splash is a slide of the run
 * (`entry === 'swipe'`) the first area is the SECOND slide. The two
 * directions of the same rule, where the swipe's `slidePositions` lives too.
 */
export const slideOfArea = (area: number, entry: Motion): number =>
	area + (entry === 'swipe' ? 1 : 0);

export const areaOfSlide = (slide: number, entry: Motion, count: number): number =>
	Math.min(count - 1, Math.max(0, slide - (entry === 'swipe' ? 1 : 0)));
