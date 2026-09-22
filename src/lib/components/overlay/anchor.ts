/**
 * @module components/overlay/anchor
 * Where a floating card goes when it is attached to a point.
 *
 * "Put a card next to the pointer without letting it leave the container" is a
 * rule every hover tooltip needs and nobody writes down. It gets re-derived at
 * each call site, slightly differently each time, and because it only runs
 * inside a live layout it is never tested — so the version that forgot to clamp
 * vertically ships a card that falls off the bottom of a short viewport, and
 * nobody notices until a phone does it.
 *
 * It is one function here, it takes measurements rather than elements, and it
 * returns two numbers. No DOM, no framework, no CSS: the caller owns all three.
 */

/** The point the card is attached to, in container coordinates. */
export type AnchorPoint = {
	/** Distance from the container's left edge, in px. */
	x: number;
	/** Distance from the container's top edge, in px. */
	y: number;
};

/** A measured rectangle, in px. */
export type AnchorBox = {
	/** Width in px. */
	width: number;
	/** Height in px. */
	height: number;
};

/** Space to keep between the card and each container edge, in px. */
export type AnchorPadding = {
	/** Minimum gap above the card. */
	top?: number;
	/** Minimum gap to the right of the card. */
	right?: number;
	/** Minimum gap below the card. */
	bottom?: number;
	/** Minimum gap to the left of the card. */
	left?: number;
};

/** How the card is placed relative to the point, before clamping. */
export type AnchorOptions = {
	/**
	 * Gap between the point and the card's near edge, in px. `x` is the
	 * horizontal offset to whichever side the card lands on; `y` shifts the
	 * card vertically and is only read when `align` is `'start'`.
	 */
	offset?: { x?: number; y?: number };
	/**
	 * Vertical relationship to the point: `'center'` centres the card on it,
	 * `'start'` puts the card's top edge there (plus `offset.y`).
	 */
	align?: 'center' | 'start';
	/** Minimum gaps from the container edges. */
	padding?: AnchorPadding;
	/**
	 * When the card does not fit on its preferred side, put it on the other one
	 * instead of letting the clamp slide it back over the point. Leave it off
	 * for a card that should simply stay put.
	 */
	flip?: boolean;
	/** Preferred horizontal side. Default `'right'`. */
	side?: 'right' | 'left';
};

/** The resolved position, ready to write to `left` / `top` in px. */
export type AnchorPosition = {
	/** Distance from the container's left edge, in px. */
	left: number;
	/** Distance from the container's top edge, in px. */
	top: number;
};

/**
 * Places a card beside a point, kept inside its container.
 *
 * The card is laid out on its preferred side, optionally flipped to the other
 * side when it would not fit, and then clamped on **both** axes so it can never
 * cross the container's padding — including vertically, which is the half most
 * hand-rolled versions leave out.
 *
 * A container with no measured size yet (width or height `0`) returns the raw
 * point, so a first frame renders somewhere sensible rather than at `0,0`.
 *
 * @param point - Where the card is attached, in container coordinates.
 * @param card - The card's measured size. Height may be an estimate on the
 *   first frame; re-running once it is measured is cheap and exact.
 * @param container - The box the card must stay inside.
 * @param options - Offset, alignment, padding, flipping and preferred side.
 * @returns The `left` / `top` to position the card at, in px.
 */
export function anchor(
	point: AnchorPoint,
	card: AnchorBox,
	container: AnchorBox,
	options: AnchorOptions = {}
): AnchorPosition {
	if (!container.width || !container.height) return { left: point.x, top: point.y };

	const offsetX = options.offset?.x ?? 16;
	const offsetY = options.offset?.y ?? 0;
	const padTop = options.padding?.top ?? 0;
	const padRight = options.padding?.right ?? 0;
	const padBottom = options.padding?.bottom ?? 0;
	const padLeft = options.padding?.left ?? 0;

	const toLeftOf = point.x - offsetX - card.width;
	const toRightOf = point.x + offsetX;

	let left = options.side === 'left' ? toLeftOf : toRightOf;
	if (options.flip) {
		if (options.side === 'left') {
			if (left < padLeft && toRightOf + card.width <= container.width - padRight) left = toRightOf;
		} else if (left + card.width > container.width - padRight && toLeftOf >= padLeft) {
			left = toLeftOf;
		}
	}

	let top = options.align === 'start' ? point.y + offsetY : point.y - card.height / 2;

	// Clamp last, on both axes. `Math.max` after `Math.min` so a card taller or
	// wider than the space it has left is pinned to the near edge rather than
	// pushed off the far one.
	left = Math.max(padLeft, Math.min(left, container.width - card.width - padRight));
	top = Math.max(padTop, Math.min(top, container.height - card.height - padBottom));

	return { left, top };
}
