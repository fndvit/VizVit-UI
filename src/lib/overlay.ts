/**
 * Floating-overlay primitives: where a card attached to a point goes, and the
 * chrome it is drawn in.
 *
 * The two are separate because they fail differently. Placement is arithmetic —
 * it can be wrong on a phone and right on a laptop, and it belongs in a test.
 * Chrome is CSS, and belongs behind custom properties. Both were previously
 * re-implemented per call site, which is how one copy ended up clamping
 * horizontally but not vertically.
 *
 * Domain-free: it knows about points, boxes and padding, and nothing about maps,
 * charts or what the card says.
 */
export {
	anchor,
	type AnchorBox,
	type AnchorOptions,
	type AnchorPadding,
	type AnchorPoint,
	type AnchorPosition
} from './components/overlay/anchor.js';
export { default as HoverCard } from './components/overlay/HoverCard.svelte';
