<!--
  @component FigureBody

  The line body: a shoulder line with two hanging arms and a pair of legs in
  a pose, drawn in the composed figure box (`FIGURE_VIEWBOX` in `./paths`).
  No head — a `FigureHead`, a marker or a callout goes in as `children`, which
  render INSIDE the svg and so share its coordinates (neck at `NECK`, shoulder
  line at `SHOULDER`).

  Decorative: `aria-hidden`, and it never names itself — whatever composes it
  carries the text. Sized by `--vit-figure-width`; the strokes scale with it
  because `--vit-figure-stroke` is in viewBox units.

  @property arms - Arm pose
  @property legs - Leg pose
  @property class - Extra classes on the svg
  @property children - Drawn inside the svg, after the body
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ARMS, ARMS_AT, FIGURE_VIEWBOX, LEGS, LEGS_AT } from './paths.js';
	import type { ArmsPose, LegsPose } from './paths.js';

	interface Props {
		arms?: ArmsPose;
		legs?: LegsPose;
		class?: string;
		children?: Snippet;
	}

	let { arms = 'down', legs = 'standing', class: className = '', children }: Props = $props();
</script>

<svg
	class="vit-figure-body {className}"
	viewBox={FIGURE_VIEWBOX}
	aria-hidden="true"
	focusable="false"
>
	<g class="vit-figure-body__strokes">
		<path d={ARMS[arms]} transform={ARMS_AT} />
		<path d={LEGS[legs]} transform={LEGS_AT} />
	</g>
	{@render children?.()}
</svg>

<style>
	.vit-figure-body {
		display: block;
		width: var(--vit-figure-width, 10rem);
		height: auto;
		/* A callout, or a raised arm at a small width, may leave the box. */
		overflow: visible;
	}

	.vit-figure-body__strokes {
		fill: none;
		stroke: var(--vit-figure-ink, var(--color-ink));
		stroke-width: var(--vit-figure-stroke, 4);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
