<!--
	@component ScrollySteps

	The one scrolly mechanism: a sticky background with a column of scrolling
	step sections over it.

	Wraps `@sveltejs/svelte-scroller` (a Svelte 4 component, driven through its
	legacy `background`/`foreground` slots) and owns everything every scrolly
	section on the site used to re-implement by hand: the `index`/`offset`
	state, the `<Scroller>` element, the `scrolly-bg` sticky wrapper, and the
	per-step opacity/translateY ramp (see `./scrollySteps.ts`).

	Content stays in the feature component: `background` paints whatever sits
	behind, `step` paints one section's card. One `<section>` is rendered per
	entry of `steps` — including spacer/buffer entries, since the scroller
	counts `<section>` elements to decide `index`. Sections that are not steps
	at all (a trailing "hold" section, say) go in `before`/`after`.

	@prop {T[]} steps - One entry per `<section>`, in scroll order. Spacer
		sections are entries too, so `index` lines up with the array.
	@prop {number} [top=0] - Scroller `top`, as a fraction of the viewport.
	@prop {number} [bottom=1] - Scroller `bottom`, as a fraction of the viewport.
	@prop {number} [threshold=0.5] - Viewport fraction at which a section
		becomes the current step.
	@prop {number} [index=0] - Bindable. Step index the scroller reports.
	@prop {number} [offset=0] - Bindable. Scroll progress within that step, 0 → 1.
	@prop {Snippet} background - Sticky background, rendered inside the
		`scrolly-bg` wrapper. Receives `{ index, offset, progress }`.
	@prop {Snippet} step - One step's content, rendered inside its `<section>`.
		Receives `{ item, i, active, opacity, translateY }`.
	@prop {Snippet} [before] - Raw sections rendered before the step sections.
	@prop {Snippet} [after] - Raw sections rendered after the step sections
		(trailing buffer / hold sections).
	@prop {string} [class='w-full'] - Classes on the foreground column.
	@prop {string} [backgroundClass] - Extra classes next to `scrolly-bg`.
	@prop {string | ((item: T, i: number) => string)} [sectionClass] - Classes
		on each step `<section>`; a function when they differ per step.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import Scroller from '@sveltejs/svelte-scroller';
	import { stepStyle } from './stepStyle.js';

	let {
		steps,
		top = 0,
		bottom = 1,
		threshold = 0.5,
		index = $bindable(0),
		offset = $bindable(0),
		background,
		step,
		before,
		after,
		class: className = 'w-full',
		backgroundClass = '',
		sectionClass = ''
	}: {
		steps: T[];
		top?: number;
		bottom?: number;
		threshold?: number;
		index?: number;
		offset?: number;
		background: Snippet<[{ index: number; offset: number; progress: number }]>;
		step: Snippet<[{ item: T; i: number; active: boolean; opacity: number; translateY: number }]>;
		before?: Snippet;
		after?: Snippet;
		class?: string;
		backgroundClass?: string;
		sectionClass?: string | ((item: T, i: number) => string);
	} = $props();

	/** Scroller progress across the whole sequence, 0 → 1. Handed to `background`. */
	let progress = $state(0);

	/** Resolves the per-section class list, which may depend on the step. */
	function classFor(item: T, i: number): string {
		return typeof sectionClass === 'function' ? sectionClass(item, i) : sectionClass;
	}
</script>

<Scroller {top} {bottom} {threshold} bind:index bind:offset bind:progress>
	<!-- BACKGROUND: sticky, full viewport height -->
	<div slot="background" class="vit-scrolly__bg {backgroundClass}">
		{@render background({ index, offset, progress })}
	</div>

	<!-- FOREGROUND: the step sections, scrolling over the background -->
	<div slot="foreground" class={className}>
		{@render before?.()}
		{#each steps as item, i (i)}
			<section class={classFor(item, i)}>
				{@render step({ item, i, ...stepStyle(i, index, offset) })}
			</section>
		{/each}
		{@render after?.()}
	</div>
</Scroller>

<style>
	/*
	 * The sticky background fills the viewport. `--device-h` lets a host pin a
	 * measured height instead of `100vh`, which is what mobile browsers need
	 * when the URL bar collapses and `vh` jumps.
	 */
	.vit-scrolly__bg {
		position: relative;
		width: 100%;
		height: var(--device-h, 100vh);
	}
</style>
