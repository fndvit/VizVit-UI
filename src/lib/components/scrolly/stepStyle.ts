/**
 * @module scrolly/stepStyle
 *
 * The per-step style a scrolly card is drawn with, derived from the scroller's
 * `index` / `offset` pair. No DOM, no Svelte — the ramp is assertable as
 * numbers, which is the whole reason it is not inline in the component.
 *
 * In the app this came from, the same arithmetic lived in two modules:
 * `scrollyUtils.ts` held `calcOpacity` / `calcTranslateY`, and a six-line
 * `scrollySteps.ts` re-exported them zipped into one record. Two modules for one
 * three-field value is a pass-through, not a seam, so they are one module here.
 * Both halves stay exported: a caller that wants only the opacity ramp should
 * not have to take the record.
 */

/** Everything one step needs to draw itself for the current scroll position. */
export type StepStyle = {
	/** True when this step is the one the scroller currently reports. */
	active: boolean;
	/** Card opacity: 0 → 1 → 1 → 0 across the step's own scroll progress. */
	opacity: number;
	/** Card translateY in px: 30 → 0 → 0 → -30 across that same progress. */
	translateY: number;
};

/** How far the card slides, in px, at the extremes of a step. */
const TRAVEL_PX = 30;

/**
 * Card opacity across a step's scroll progress: fade in over the first quarter,
 * hold through the middle half, fade out over the last quarter.
 *
 * @param stepIndex - Index of the step being drawn.
 * @param currentIndex - Step index the scroller currently reports.
 * @param currentOffset - Scroll progress within the current step, 0 → 1.
 * @returns Opacity in `[0, 1]`; `0` for any step that is not current.
 */
export function calcOpacity(
	stepIndex: number,
	currentIndex: number,
	currentOffset: number
): number {
	if (stepIndex !== currentIndex) return 0;
	return Math.max(0, Math.min(currentOffset * 4, 1, (1 - currentOffset) * 4));
}

/**
 * Card translateY in px across the same progress: slides up on entry, holds
 * through the plateau, slides further up on exit.
 *
 * @param stepIndex - Index of the step being drawn.
 * @param currentIndex - Step index the scroller currently reports.
 * @param currentOffset - Scroll progress within the current step, 0 → 1.
 * @returns Offset in px; the full travel for any step that is not current, so
 *   an inactive card is parked below rather than mid-animation.
 */
export function calcTranslateY(
	stepIndex: number,
	currentIndex: number,
	currentOffset: number
): number {
	if (stepIndex !== currentIndex) return TRAVEL_PX;
	if (currentOffset < 0.25) return (1 - currentOffset * 4) * TRAVEL_PX;
	if (currentOffset < 0.75) return 0;
	return -(currentOffset - 0.75) * 4 * TRAVEL_PX;
}

/**
 * Projects the scroller's position onto one step.
 *
 * @param i - Index of the step being drawn.
 * @param index - Step index the scroller currently reports.
 * @param offset - Scroll progress within the current step, 0 → 1.
 * @returns The step's `active` flag plus its card opacity and translateY.
 */
export function stepStyle(i: number, index: number, offset: number): StepStyle {
	return {
		active: i === index,
		opacity: calcOpacity(i, index, offset),
		translateY: calcTranslateY(i, index, offset)
	};
}
