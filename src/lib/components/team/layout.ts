import type { TeamMemberData } from '../../content/types.js';
import { PER_CANVAS, clampTo } from '../../edit/placement.js';
import {
	CALLOUT_RULE,
	CALLOUT_RUN,
	FIGURE_HEIGHT,
	FIGURE_POSITION,
	FIGURE_WIDTH
} from '../ui/figure/paths.js';

/**
 * The arithmetic of `TeamFigureField`'s canvas, in node-testable form. Every
 * length is in THOUSANDTHS OF THE CANVAS WIDTH (‰, `PER_CANVAS` in
 * `edit/placement`) — the unit a row stores its `figureX` / `figureY` in — so
 * the field renders a length as `calc(n * 0.1cqi)` and the collage scales as
 * one piece. What a gesture writes back is `edit/placement`'s to clamp.
 *
 * A member with a stored position keeps it. One without gets a place from the
 * field's own row layout — rows of `COLUMNS`, each row centred, the member's
 * `figureOffset` still nudging it down — keyed on its INDEX among all the
 * members, placed or not, so moving one figure never moves another.
 */

/** A figure's art width at 100%, in ‰ — the field's `--vit-team-figure-base: 12cqi`. */
export const FIGURE_BASE = 120;
/** Figures per auto row, and the vertical step between auto rows. */
export const COLUMNS = 4;
export const ROW_STEP = 300;
/** What a caption below the rule and a canvas's bottom edge need past the lowest art. */
const CANVAS_TAIL = 80;
/** The shortest canvas: an empty field still has room for its add slot. */
const CANVAS_MIN = 300;

/** A figure's resolved place on the canvas, and its size in percent. */
export interface FigurePlacement {
	x: number;
	y: number;
	z: number;
	size: number;
}

/** The art's width in ‰ for a size in percent. */
export function figureWidth(size: number): number {
	return (FIGURE_BASE * size) / 100;
}

/** The art's height in ‰ — the drawing's own proportion. */
export function figureHeight(size: number): number {
	return (figureWidth(size) * FIGURE_HEIGHT) / FIGURE_WIDTH;
}

/** Art, callout run and the label's shortest width: what a figure takes across. */
export function figureFootprint(size: number): number {
	return (figureWidth(size) * (FIGURE_WIDTH + CALLOUT_RUN + CALLOUT_RULE)) / FIGURE_WIDTH;
}

/** The place the row layout gives the member at `index` of `count`. */
export function autoPlacement(
	index: number,
	count: number,
	member: Pick<TeamMemberData, 'figureOffset' | 'figureSize'>
): { x: number; y: number } {
	const size = member.figureSize ?? 100;
	const row = Math.floor(index / COLUMNS);
	const inRow = index % COLUMNS;
	const inThisRow = Math.min(COLUMNS, count - row * COLUMNS);
	const column = PER_CANVAS / COLUMNS;
	const start = (PER_CANVAS - inThisRow * column) / 2;
	const x = start + inRow * column + (column - figureFootprint(size)) / 2;
	// An offset was px on a field about a thousand px wide; one px reads as one ‰.
	const y = row * ROW_STEP + (member.figureOffset ?? 0);
	return { x: clampTo(x, FIGURE_POSITION.x), y: clampTo(y, FIGURE_POSITION.y) };
}

/** Every member's resolved placement, in the members' order. */
export function placeFigures(
	members: readonly Pick<
		TeamMemberData,
		'figureX' | 'figureY' | 'figureZ' | 'figureOffset' | 'figureSize'
	>[]
): FigurePlacement[] {
	return members.map((member, index) => {
		// Each axis on its own: a row with an x and no y keeps its x.
		const auto = autoPlacement(index, members.length, member);
		return {
			x: member.figureX ?? auto.x,
			y: member.figureY ?? auto.y,
			z: member.figureZ ?? 0,
			size: member.figureSize ?? 100
		};
	});
}

/** The canvas's height in ‰: past the lowest figure's feet, and never below the minimum. */
export function canvasHeight(placements: readonly FigurePlacement[]): number {
	const lowest = Math.max(0, ...placements.map((p) => p.y + figureHeight(p.size)));
	return Math.max(CANVAS_MIN, Math.ceil(lowest + CANVAS_TAIL));
}
