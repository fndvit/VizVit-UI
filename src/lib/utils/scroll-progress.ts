/**
 * A scroll-linked value's one listener. Two modules write a 0..1 progress
 * from the scroll position as a custom property — the splash's recession,
 * the timeline's rail reveal and area reveals — and each had its own copy of
 * the same skeleton: a scroll listener, a frame guard, the cleanup. Neither
 * heard a resize, so a viewport change left stale values until the next
 * scroll. This owns the skeleton; a caller supplies only what it measures.
 *
 * `update` runs at most once per frame, on scroll and on resize, and once at
 * once when the page is already scrolled (a return to the page restores the
 * scroll before any scroll event fires). Returns the cleanup.
 */
export function watchScroll(update: () => void): () => void {
	let tick = 0;
	const schedule = () => {
		if (!tick) {
			tick = requestAnimationFrame(() => {
				tick = 0;
				update();
			});
		}
	};
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	if (window.scrollY > 0) schedule();
	return () => {
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
		if (tick) cancelAnimationFrame(tick);
	};
}

/** A share, held within 0..1. */
export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
