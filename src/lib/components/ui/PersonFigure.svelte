<!--
  @component PersonFigure

  A person drawn as a stick figure — a shoulder line with two hanging arms and
  a pair of legs in a pose — topped by a head that is a cut-out photo sat on
  the neck, a portrait masked into a circle, or, with no photo at all, a drawn
  outline. Beside it, the name and role over a short rule, joined to the
  shoulder by a diagonal callout line. A bio, when there is one, reveals under
  the rule on hover, keyboard focus or tap.

  The body paths are the ones the digital-gap survey drew its avatars with
  (`mwc-enquesta-bretxa-digital`, `paths.json`), composed into ONE viewBox so
  the figure scales as a unit and the callout shares its coordinates.

  ## Accessibility
  The drawing is decorative: the svg is `aria-hidden`, the photo has no alt,
  and the name in the caption is the only text — the `Logo` rule, a mark never
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
  @property children - An extra marker laid over the body (position it absolutely)
-->
<script lang="ts" module>
	/**
	 * Shoulder line and two hanging arms, in the survey's 153×111 torso box.
	 * A closed set: extending it is a package change, so every consumer's
	 * `ArmsPose` stays honest (the `Icon` rule).
	 */
	const ARMS = {
		down: 'M27 107L39.375 8H113.625L126 107',
		raised: 'M7 25L32.9376 57.5L39.125 8H113.375L119.563 57.5L145.5 25',
		'one-bent': 'M51.899 91.3976L19 53.7671L38.9562 8H113.565L126 107'
	} as const;

	/** Two legs in the survey's 91×187 box (its adult set). */
	const LEGS = {
		standing: 'M21 7V179H8M70 7V179H82',
		walking: 'M69 7L85 129.857L69 179H81.4218M21 7L36 129.857L21 179H32.6453',
		stride: 'M21 7V80.7143L38 179H25.0024M71 7V80.7143L54 179H65.3333',
		step: 'M21 7V179H8M70 7L85 129.857L70 179H81.6545',
		kneel: 'M21 7V179H9M71 7V130.087L46 168.589V182',
		sit: 'M21 7V130.087L45 168.589V182M69 7L54 129.857L69 179H57.3546'
	} as const;

	/** Drawn head outlines in the survey's 49×48 box, for a figure with no photo. */
	const HEADS = {
		round:
			'M25 41C33.8366 41 41 33.6127 41 24.5C41 15.3873 33.8366 8 25 8C16.1634 8 9 15.3873 9 24.5C9 33.6127 16.1634 41 25 41Z',
		cup: 'M8 8V24.4952C7.99874 26.6662 8.4255 28.8161 9.25592 30.8216C10.0863 32.8271 11.3042 34.6488 12.8393 36.1822C14.3745 37.7155 16.1968 38.9304 18.2019 39.7571C20.207 40.5839 22.3554 41.0062 24.5239 40.9999C28.8936 40.9999 33.0843 39.262 36.1742 36.1686C39.2641 33.0751 41 28.8795 41 24.5047V8.00955L8 8Z',
		d: 'M27.571 8H38V41H27.571C23.1726 40.9949 18.9563 39.2535 15.8489 36.1585C12.7415 33.0636 10.9975 28.8684 11 24.4952C11 20.1237 12.7453 15.931 15.8524 12.8381C18.9595 9.74519 23.1743 8.00507 27.571 8V8Z'
	} as const;

	export type ArmsPose = keyof typeof ARMS;
	export type LegsPose = keyof typeof LEGS;
	export type HeadShape = keyof typeof HEADS;

	/**
	 * Where the parts go in the composed `0 0 153 280` box. The survey stacked
	 * three svgs on a grid (rows 48 / 111 / 100, the legs' 187 hanging out of
	 * the last row); this is that stack flattened, plus 20 of headroom so a
	 * photo can rise above where the drawn head would be. Landmarks: shoulder
	 * line y 76 from x 39 to 114, legs from y 99, feet at y 271.
	 */
	const HEAD_AT = 'translate(52 20)';
	const ARMS_AT = 'translate(0 68)';
	const LEGS_AT = 'translate(31 92)';
	/** The neck: the photo's chin lands here, and `headScale` scales about it. */
	const NECK = { x: 76.5, y: 84 };

	/**
	 * Shoulder → the rule's inner end → along the rule (90 long, after a run of
	 * 24 out of the art). The rule's y is what the label's grid row is sized
	 * to, so the caption's baseline meets it — see the style block.
	 */
	const RULE_Y = { top: 50, bottom: 200 } as const;
	const CALLOUT = {
		right: {
			top: `M113.5 76L177 ${RULE_Y.top}H267`,
			bottom: `M113.5 76L177 ${RULE_Y.bottom}H267`
		},
		left: {
			top: `M39.5 76L-24 ${RULE_Y.top}H-114`,
			bottom: `M39.5 76L-24 ${RULE_Y.bottom}H-114`
		}
	} as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

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
		labelSide?: 'left' | 'right';
		/** `top` puts the rule beside the head, `bottom` beside the legs. */
		labelAlign?: 'top' | 'bottom';
		class?: string;
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
		children
	}: Props = $props();

	/**
	 * The photo that failed to load, so a broken URL degrades to the drawn head
	 * rather than an empty neck. Keyed by value, not a boolean (the CardMedia
	 * rule): a new URL gets a fresh attempt.
	 */
	let failedSrc = $state<string | null>(null);
	const showPhoto = $derived(Boolean(photo) && photo !== failedSrc);

	// A clipPath is referenced by id, and a team page renders many figures.
	const uid = $props.id();
	const clipId = `${uid}-head`;
	const headTransform = $derived(
		headScale === 1
			? undefined
			: `translate(${NECK.x} ${NECK.y}) scale(${headScale}) translate(${-NECK.x} ${-NECK.y})`
	);
	const callout = $derived(CALLOUT[labelSide][labelAlign]);
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
	<svg class="vit-figure__art" viewBox="0 0 153 280" aria-hidden="true" focusable="false">
		<g class="vit-figure__body">
			<path d={ARMS[arms]} transform={ARMS_AT} />
			<path d={LEGS[legs]} transform={LEGS_AT} />
			{#if !showPhoto}
				<path class="vit-figure__head" d={HEADS[head]} transform={HEAD_AT} />
			{/if}
		</g>
		{#if showPhoto}
			<!-- Drawn after the body so the head covers the middle of the shoulder line. -->
			{#if photoShape === 'circle'}
				<clipPath id={clipId}>
					<circle cx={NECK.x} cy="48" r="34" />
				</clipPath>
				<image
					href={photo}
					x={NECK.x - 34}
					y="14"
					width="68"
					height="68"
					preserveAspectRatio="xMidYMid slice"
					clip-path="url(#{clipId})"
					transform={headTransform}
					onerror={() => (failedSrc = photo ?? null)}
				/>
			{:else}
				<!-- Bottom-anchored (`xMidYMax`): whatever the cut-out's proportions,
				     its chin lands on the neck, 8 over the shoulder line. The box is
				     the shoulders' width — a head that wide is the mockup's proportion. -->
				<image
					href={photo}
					x={NECK.x - 38}
					y="0"
					width="76"
					height="84"
					preserveAspectRatio="xMidYMax meet"
					transform={headTransform}
					onerror={() => (failedSrc = photo ?? null)}
				/>
			{/if}
		{/if}
		<path class="vit-figure__callout" d={callout} vector-effect="non-scaling-stroke" />
	</svg>
	{#if children}
		<div class="vit-figure__extra">{@render children()}</div>
	{/if}
	<figcaption class="vit-figure__label">
		<strong class="vit-figure__name">{name}</strong>
		{#if role}<span class="vit-figure__role">{role}</span>{/if}
		{#if bio}<p class="vit-figure__bio">{bio}</p>{/if}
	</figcaption>
</figure>

<style>
	.vit-figure {
		/* One viewBox unit, so the run and the rule's row follow the width. */
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

	.vit-figure__art {
		grid-area: art;
		display: block;
		width: var(--_w);
		height: auto;
		/* The callout runs out of the art into the label column. */
		overflow: visible;
	}

	.vit-figure__body {
		fill: none;
		stroke: var(--vit-figure-ink, var(--color-ink));
		stroke-width: var(--vit-figure-stroke, 4);
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.vit-figure__head {
		fill: var(--color-surface);
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

	.vit-figure__name {
		font-size: var(--vit-figure-name-size, var(--text-base));
		font-weight: 700;
	}

	.vit-figure__role {
		font-size: var(--vit-figure-role-size, var(--text-sm));
		color: var(--color-ink-secondary);
	}

	.vit-figure__bio {
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

	.vit-figure[data-side='left'] .vit-figure__bio {
		inset-inline-start: auto;
		inset-inline-end: 0;
	}

	.vit-figure:hover .vit-figure__bio,
	.vit-figure:focus-within .vit-figure__bio {
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
		.vit-figure__bio {
			transition: none;
			transform: none;
		}
	}
</style>
