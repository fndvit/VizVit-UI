<!--
  @component PersonFigure

  A person: a `FigureBody` in a pose, a `FigureHead` on its neck, and beside
  them the name and role over a short rule, joined to the shoulder by a
  diagonal callout line. A bio, when there is one, reveals under the rule on
  hover, keyboard focus or tap.

  This is the composition; the parts stand alone. `./paths` holds the drawing
  and the callout arithmetic, `FigureBody` the strokes, `FigureHead` the head's
  three modes. What is here is what only the whole needs: the grid that pins
  the caption's baseline to the rule, and the reveal.

  ## Accessibility
  The drawing is decorative — the svg is `aria-hidden`, the photo has no alt —
  and the name in the caption is the only text: the `Logo` rule, a mark never
  names itself. The bio is hidden by opacity, not removed, so a screen reader
  reads it without hovering; the figure takes `tabindex="0"` only when there
  is a bio to reveal.

  ## Sizing
  Set `--vit-figure-width` on the figure or an ancestor. The art, the callout
  run and the height of the rule above the baseline all derive from it; the
  text is in rem. Below about 8rem the two label lines outgrow the room above
  a top-aligned rule — lower `--vit-figure-name-size`/`--vit-figure-role-size`
  or align the label `bottom`. The callout leaves the art's box on purpose
  (`overflow: visible`), so an ancestor clipping its overflow hides it.

  | property                    | default             |
  |-----------------------------|---------------------|
  | `--vit-figure-width`        | `10rem`             |
  | `--vit-figure-ink`          | `var(--color-ink)`  |
  | `--vit-figure-stroke`       | `4` (viewBox units) |
  | `--vit-figure-callout-ink`  | `var(--color-ink)`  |
  | `--vit-figure-name-size`    | `var(--text-base)`  |
  | `--vit-figure-role-size`    | `var(--text-sm)`    |
  | `--vit-figure-bio-width`    | `14rem`             |

  @property name - The person's name; the figure's accessible text
  @property role - The line under the name
  @property bio - Revealed under the rule on hover, focus or tap
  @property photo - The head photo; absent or failing to load, the head is drawn
  @property photoShape - `cutout` sits a transparent cut-out on the neck; `circle` masks a portrait
  @property head - Drawn head outline used when there is no photo
  @property arms - Arm pose
  @property legs - Leg pose
  @property headScale - Scales the photo head about the neck point
  @property labelSide - Which side of the figure the label sits on
  @property labelAlign - `top` puts the rule beside the head, `bottom` beside the legs
  @property class - Extra classes on the figure
  @property caption - Replaces the default name/role/bio inside the figcaption; keep the `vit-figure__name/role/bio` classes for the styling
  @property children - An extra marker laid over the body (position it absolutely)
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import FigureBody from './FigureBody.svelte';
	import FigureHead from './FigureHead.svelte';
	import { calloutPath } from './paths.js';
	import type { ArmsPose, HeadShape, LabelAlign, LabelSide, LegsPose } from './paths.js';

	interface Props {
		/** The figure's only accessible text — the drawing never names itself. */
		name: string;
		role?: string;
		/** Revealed under the rule on hover, focus or tap. Absent: nothing to reveal, no tabindex. */
		bio?: string | null;
		/** Absent, or failing to load, the head is drawn instead. */
		photo?: string | null;
		/** `cutout` = a transparent-background cut-out sat on the neck; `circle` = a portrait masked into a circle. */
		photoShape?: 'cutout' | 'circle';
		/** The drawn head, used when there is no photo. */
		head?: HeadShape;
		arms?: ArmsPose;
		legs?: LegsPose;
		/** Scales the photo head about the neck point, so the chin stays put. */
		headScale?: number;
		labelSide?: LabelSide;
		/** `top` puts the rule beside the head, `bottom` beside the legs. */
		labelAlign?: LabelAlign;
		class?: string;
		/**
		 * Replaces the default name, role and bio inside the figcaption — for a
		 * host whose caption text is editable and so must own the elements.
		 * Keep the `vit-figure__name/role/bio` classes: the styling (and the bio
		 * reveal) is by class, reaching into the snippet.
		 */
		caption?: Snippet;
		/** An extra marker over the body; position it absolutely inside the art's box. */
		children?: Snippet;
	}

	let {
		name,
		role,
		bio,
		photo,
		photoShape = 'cutout',
		head = 'round',
		arms = 'down',
		legs = 'standing',
		headScale = 1,
		labelSide = 'right',
		labelAlign = 'top',
		class: className = '',
		caption,
		children
	}: Props = $props();

	const callout = $derived(calloutPath(labelSide, labelAlign));
</script>

<!-- Focusable only when there is a bio to reveal; `figure` is not interactive
     otherwise, and a focus stop with nothing behind it is noise. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<figure
	class="vit-figure {className}"
	data-side={labelSide}
	data-align={labelAlign}
	tabindex={bio ? 0 : undefined}
>
	<FigureBody {arms} {legs} class="vit-figure__art">
		<!-- After the body, so the head covers the middle of the shoulder line. -->
		<FigureHead {photo} {photoShape} {head} {headScale} />
		<path class="vit-figure__callout" d={callout} vector-effect="non-scaling-stroke" />
	</FigureBody>
	{#if children}
		<div class="vit-figure__extra">{@render children()}</div>
	{/if}
	<figcaption class="vit-figure__label">
		{#if caption}
			{@render caption()}
		{:else}
			<strong class="vit-figure__name">{name}</strong>
			{#if role}<span class="vit-figure__role">{role}</span>{/if}
			{#if bio}<p class="vit-figure__bio">{bio}</p>{/if}
		{/if}
	</figcaption>
</figure>

<style>
	.vit-figure {
		/* One viewBox unit, so the run and the rule's row follow the width.
		   The 24 and 90 are `CALLOUT_RUN` and `CALLOUT_RULE` in paths.ts. */
		--_w: var(--vit-figure-width, 10rem);
		--_u: calc(var(--_w) / 153);
		--_run: calc(var(--_u) * 24);
		--_rule-y: 50;
		position: relative;
		display: inline-grid;
		align-items: start;
		/* The first row ends exactly where the callout's rule is drawn, and the
		   caption sits on that edge — so the rule underlines the role whatever
		   the font size, and the text grows upward from it. */
		grid-template-rows: calc(var(--_u) * var(--_rule-y)) auto;
		margin: 0;
		color: var(--color-ink);
	}

	.vit-figure[data-align='bottom'] {
		--_rule-y: 200;
	}

	.vit-figure[data-side='right'] {
		grid-template-columns: var(--_w) var(--_run) auto;
		grid-template-areas:
			'art run label'
			'art run .';
	}

	.vit-figure[data-side='left'] {
		grid-template-columns: auto var(--_run) var(--_w);
		grid-template-areas:
			'label run art'
			'. run art';
	}

	/* The body's svg is another component's element, hence the :global. */
	.vit-figure > :global(.vit-figure__art) {
		grid-area: art;
	}

	.vit-figure__callout {
		fill: none;
		stroke: var(--vit-figure-callout-ink, var(--color-ink));
		stroke-width: 1;
	}

	.vit-figure__label {
		grid-area: label;
		position: relative;
		display: flex;
		flex-direction: column;
		align-self: end;
		min-width: calc(var(--_u) * 90);
		padding-bottom: var(--space-1);
		line-height: var(--leading-tight);
	}

	.vit-figure[data-side='left'] .vit-figure__label {
		align-items: flex-end;
		text-align: right;
	}

	/* The caption's children may be a host's snippet, which carries no scope
	   hash — so they are reached by class under the scoped figcaption. */
	.vit-figure__label :global(.vit-figure__name) {
		font-size: var(--vit-figure-name-size, var(--text-base));
		font-weight: 700;
	}

	.vit-figure__label :global(.vit-figure__role) {
		font-size: var(--vit-figure-role-size, var(--text-sm));
		color: var(--color-ink-secondary);
	}

	.vit-figure__label :global(.vit-figure__bio) {
		position: absolute;
		top: 100%;
		inset-inline-start: 0;
		width: var(--vit-figure-bio-width, 14rem);
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		line-height: var(--leading-body);
		color: var(--color-ink-secondary);
		opacity: 0;
		transform: translateY(-0.25rem);
		pointer-events: none;
		transition:
			opacity var(--transition-fast),
			transform var(--transition-fast);
	}

	.vit-figure[data-side='left'] .vit-figure__label :global(.vit-figure__bio) {
		inset-inline-start: auto;
		inset-inline-end: 0;
	}

	.vit-figure:hover .vit-figure__label :global(.vit-figure__bio),
	.vit-figure:focus-within .vit-figure__label :global(.vit-figure__bio) {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}

	.vit-figure:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 4px;
	}

	.vit-figure__extra {
		grid-area: art;
		position: relative;
		width: var(--_w);
		height: 100%;
		pointer-events: none;
	}

	.vit-figure__extra > :global(*) {
		pointer-events: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.vit-figure__label :global(.vit-figure__bio) {
			transition: none;
			transform: none;
		}
	}
</style>
