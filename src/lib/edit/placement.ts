import type { PlacementBounds } from './chrome-props.js';

/**
 * The arithmetic of a placement canvas, apart from the pointer and the keys
 * that drive it. A canvas measures every length — x, y, an item's width — in
 * `PER_CANVAS` parts of its OWN WIDTH, on both axes, so a layout scales as
 * one piece; the CSS side renders a length `n` as `calc(n * UNIT_CQI)`.
 *
 * `Placeable` turns a gesture into pixels travelled and hands them here; what
 * comes back is already snapped, rounded and inside the spec's bounds, which
 * are the host's CHECK constraints. Nothing here reads the DOM.
 */

/** Parts of the canvas width in one canvas width: the unit is ‰. */
export const PER_CANVAS = 1000;
/** One unit as a container-query length, for the CSS a canvas and its preview write. */
export const UNIT_CQI = `${100 / PER_CANVAS}cqi`;

/** A value brought inside its bounds, as the integer a column stores. */
export function clampTo(value: number, bounds: PlacementBounds): number {
	return Math.min(bounds.max, Math.max(bounds.min, Math.round(value)));
}

/** A value on the nearest multiple of `step`. */
export function snapTo(value: number, step: number): number {
	return Math.round(value / step) * step;
}

/** An item's and its canvas's widths, in px, when the gesture began. */
export interface CanvasGeometry {
	width: number;
	canvas: number;
}

/**
 * How far right the item may stand and still fit: the canvas less its own
 * width, never past the stored bound nor below its minimum.
 */
export function fitX(bounds: PlacementBounds, { width, canvas }: CanvasGeometry): PlacementBounds {
	const fit = PER_CANVAS - (width / canvas) * PER_CANVAS;
	return { min: bounds.min, max: Math.max(bounds.min, Math.min(bounds.max, fit)) };
}

interface Point {
	x: number;
	y: number;
}

/**
 * A drag: `from` plus the pointer's travel in px, converted to canvas units,
 * snapped to `step` and clamped — x so the item still fits.
 */
export function dragTo(
	from: Point,
	travel: Point,
	geometry: CanvasGeometry,
	bounds: { x: PlacementBounds; y: PlacementBounds },
	step: number
): Point {
	const perPx = PER_CANVAS / geometry.canvas;
	return {
		x: clampTo(snapTo(from.x + travel.x * perPx, step), fitX(bounds.x, geometry)),
		y: clampTo(snapTo(from.y + travel.y * perPx, step), bounds.y)
	};
}

/** A key's nudge: `at` moved by `by` canvas units, clamped like a drag, never snapped. */
export function nudgeTo(
	at: Point,
	by: Point,
	geometry: CanvasGeometry,
	bounds: { x: PlacementBounds; y: PlacementBounds }
): Point {
	return {
		x: clampTo(at.x + by.x, fitX(bounds.x, geometry)),
		y: clampTo(at.y + by.y, bounds.y)
	};
}

/**
 * A corner drag: the size that makes the item `width + travel` px wide, as
 * it was `size` percent at `width` px — snapped to `step` and clamped.
 */
export function resizeTo(
	size: number,
	width: number,
	travel: number,
	bounds: PlacementBounds,
	step: number
): number {
	return clampTo(snapTo((size * (width + travel)) / width, step), bounds);
}

/**
 * The layer buttons: «to the front» is one above every OTHER item, «to the
 * back» one below, both inside the bounds. A button is spent when the item
 * already stands there, or the bound leaves it nowhere to go.
 */
export function layerMoves(
	z: number,
	others: PlacementBounds,
	bounds: PlacementBounds
): { front: number; back: number; onTop: boolean; atBottom: boolean } {
	const front = clampTo(Math.max(others.max + 1, z), bounds);
	const back = clampTo(Math.min(others.min - 1, z), bounds);
	return {
		front,
		back,
		onTop: z > others.max || front === z,
		atBottom: z < others.min || back === z
	};
}
