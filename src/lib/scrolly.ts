/**
 * Scrollytelling primitives: the scroller and its step ramp, a responsive
 * crossfading video, step dots, and a frosted panel. Domain-free, and themed
 * with CSS custom properties rather than utility classes.
 *
 * `<ScrollySteps>` needs the optional peer `@sveltejs/svelte-scroller`; nothing
 * else here does, so a consumer that only wants `CrossfadeVideo` or the
 * `stepStyle` ramp can skip it.
 */
export { default as ScrollySteps } from './components/scrolly/ScrollySteps.svelte';
export { default as ScrollyStepIndicator } from './components/scrolly/ScrollyStepIndicator.svelte';
export { default as CrossfadeVideo } from './components/scrolly/CrossfadeVideo.svelte';
export { default as GlassCard } from './components/scrolly/GlassCard.svelte';
export {
	calcOpacity,
	calcTranslateY,
	stepStyle,
	type StepStyle
} from './components/scrolly/stepStyle.js';
