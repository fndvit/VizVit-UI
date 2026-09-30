/**
 * The swipe's arithmetic, kept out of the component so it can be tested: the
 * page's slide positions — the top of the page (the splash), then one screen
 * per area down the track — and which one a gesture goes to.
 *
 * The component takes the wheel, the arrow keys and a touch swipe over that
 * range and drives the scroll to the next position itself, quickly, instead
 * of leaving it to the browser's snapping, which waits for the scroll to
 * settle and only then eases. Past the last slide the page is the reader's
 * again.
 */

/** How the run begins and ends: a swipe, or the page's own scroll. */
export type Motion = 'swipe' | 'scroll';

/**
 * Document offsets of the slides: the top of the page (the splash) when the
 * ENTRY is a swipe, then one per area down the track, then the track's END —
 * where what follows the timeline begins — when the EXIT is a swipe, so the
 * last swipe hands the reader on to the next element of the page. Either end
 * left out is the page's own scroll. The screen is the viewport under the
 * fixed nav (`offset` tall), and a slide is in place when the track's top
 * sits right under it.
 */
export function slidePositions(
	trackTop: number,
	count: number,
	screen: number,
	offset = 0,
	ends: { entry: Motion; exit: Motion } = { entry: 'swipe', exit: 'swipe' }
): number[] {
	const positions = ends.entry === 'swipe' ? [0] : [];
	const last = ends.exit === 'swipe' ? count : count - 1;
	for (let i = 0; i <= last; i += 1) positions.push(trackTop - offset + i * screen);
	return positions;
}

/** The slide the reader is on: the last position at or above the scroll, within a tolerance. */
export function slideAt(positions: number[], scrollY: number, tolerance = 2): number {
	let index = 0;
	positions.forEach((position, i) => {
		if (scrollY + tolerance >= position) index = i;
	});
	return index;
}

/**
 * Where a gesture in `direction` (+1 down, −1 up) goes from `scrollY`, or
 * null where the page should scroll on its own: above the first slide, or
 * down past the last — the reader has left the swipe's range.
 */
export function slideTarget(
	positions: number[],
	scrollY: number,
	direction: 1 | -1
): number | null {
	const first = positions[0] ?? 0;
	const last = positions[positions.length - 1] ?? 0;
	if (scrollY < first - 2 || scrollY > last + 2) return null;
	const current = slideAt(positions, scrollY);
	if (scrollY > (positions[current] ?? 0) + 2) {
		// Between two slides (a resize, a hash jump): down finishes the one in
		// progress, up returns to the one left.
		return direction > 0
			? (positions[Math.min(current + 1, positions.length - 1)] ?? null)
			: (positions[current] ?? null);
	}
	const next = current + direction;
	if (next < 0 || next >= positions.length) return null;
	return positions[next] ?? null;
}

/** Ease-out: fast off the mark, settling at the end. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Ease-in-out: gathers, travels, settles — the swipe's own curve. */
export const easeInOut = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * THE RESISTANCE. Wheel travel accumulates towards a threshold; until it is
 * reached the page only yields — a give that grows ever more slowly, the
 * feel of a spring — and springs back if the gesture stops short. `pull` is
 * the share of the threshold covered (0..1), `give` the pixels the page
 * yields for it, at most `max`.
 */
export const SWIPE_THRESHOLD = 180;
export const SWIPE_GIVE = 96;

export const pullOf = (travel: number, threshold = SWIPE_THRESHOLD): number =>
	Math.min(1, Math.abs(travel) / threshold);

export const giveOf = (pull: number, max = SWIPE_GIVE): number => max * (1 - Math.pow(1 - pull, 2));
