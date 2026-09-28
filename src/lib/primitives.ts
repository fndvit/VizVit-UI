/**
 * Generic UI atoms: buttons, cards, text, media, list controls. Domain-free —
 * everything here renders whatever it is handed.
 */
export { default as Button } from './components/ui/Button.svelte';
export { default as CardMedia } from './components/ui/CardMedia.svelte';
export { default as CardTitle } from './components/ui/CardTitle.svelte';
export { default as CopyIntro } from './components/ui/CopyIntro.svelte';
export { default as DateText } from './components/ui/DateText.svelte';
export { default as DecorShapes } from './components/ui/DecorShapes.svelte';
export { default as FilterChips } from './components/ui/FilterChips.svelte';
export { default as GhostButton } from './components/ui/GhostButton.svelte';
export { default as Icon, type IconName } from './components/ui/Icon.svelte';
export { default as IconButton } from './components/ui/IconButton.svelte';
export { default as Link } from './components/ui/Link.svelte';
export { default as Logo } from './components/ui/Logo.svelte';
export { default as Modal } from './components/ui/Modal.svelte';
// The figure, in parts: the drawing and the callout arithmetic, the line
// body, the head's three modes, and the person that composes them.
export { default as FigureBody } from './components/ui/figure/FigureBody.svelte';
export { default as FigureHead } from './components/ui/figure/FigureHead.svelte';
export { default as PersonFigure } from './components/ui/figure/PersonFigure.svelte';
export {
	ARMS,
	LEGS,
	HEADS,
	NECK,
	SHOULDER,
	FIGURE_VIEWBOX,
	calloutPath,
	ARM_POSES,
	LEG_POSES,
	HEAD_MODES,
	LABEL_SIDES,
	LABEL_ALIGNS,
	FIGURE_OFFSET,
	FIGURE_PERCENT
} from './components/ui/figure/paths.js';
export type {
	ArmsPose,
	HeadMode,
	HeadShape,
	LabelAlign,
	LabelSide,
	LegsPose
} from './components/ui/figure/paths.js';
export { default as Pagination } from './components/ui/Pagination.svelte';
export { default as RichText } from './components/ui/RichText.svelte';
export { default as SearchInput } from './components/ui/SearchInput.svelte';
export { default as ShareRow } from './components/ui/ShareRow.svelte';
