<!--
  @component FigureHead

  The head, three ways: a cut-out photo with a transparent background sat on
  the neck, a portrait masked into a circle, or — with no photo, or one that
  fails to load — the survey's drawn outline. An svg FRAGMENT: it renders
  inside a `FigureBody` (or any svg in the figure box) and places itself on
  `NECK`.

  The photo carries no alt and the outline no title: the head is part of a
  decorative drawing, and the name belongs to whatever composes it.

  @property photo - The photo; absent or failing to load, the head is drawn
  @property photoShape - `cutout` sits a transparent cut-out on the neck; `circle` masks a portrait
  @property head - The drawn outline, used when there is no photo
  @property headScale - Scales the photo about the neck point, so the chin stays put
-->
<svelte:options namespace="svg" />

<script lang="ts">
	import { HEAD_AT, HEADS, NECK } from './paths.js';
	import type { HeadShape } from './paths.js';

	interface Props {
		photo?: string | null;
		photoShape?: 'cutout' | 'circle';
		head?: HeadShape;
		headScale?: number;
	}

	let { photo, photoShape = 'cutout', head = 'round', headScale = 1 }: Props = $props();

	/**
	 * The photo that failed to load, so a broken URL degrades to the drawn head
	 * rather than an empty neck. Keyed by value, not a boolean (the CardMedia
	 * rule): a new URL gets a fresh attempt.
	 */
	let failedSrc = $state<string | null>(null);
	const showPhoto = $derived(Boolean(photo) && photo !== failedSrc);

	// A clipPath is referenced by id, and a team page renders many heads.
	const uid = $props.id();
	const clipId = `${uid}-head`;
	const transform = $derived(
		headScale === 1
			? undefined
			: `translate(${NECK.x} ${NECK.y}) scale(${headScale}) translate(${-NECK.x} ${-NECK.y})`
	);
</script>

{#if !showPhoto}
	<path class="vit-figure-head" d={HEADS[head]} transform={HEAD_AT} />
{:else if photoShape === 'circle'}
	<clipPath id={clipId}>
		<circle cx={NECK.x} cy="48" r="34" />
	</clipPath>
	<image
		class="vit-figure-head__photo"
		href={photo}
		x={NECK.x - 34}
		y="14"
		width="68"
		height="68"
		preserveAspectRatio="xMidYMid slice"
		clip-path="url(#{clipId})"
		{transform}
		onerror={() => (failedSrc = photo ?? null)}
	/>
{:else}
	<!-- Bottom-anchored (`xMidYMax`): whatever the cut-out's proportions, its
	     chin lands on the neck, 8 over the shoulder line. The box is the
	     shoulders' width — a head that wide is the mockup's proportion. -->
	<image
		class="vit-figure-head__photo"
		href={photo}
		x={NECK.x - 38}
		y="0"
		width="76"
		height="84"
		preserveAspectRatio="xMidYMax meet"
		{transform}
		onerror={() => (failedSrc = photo ?? null)}
	/>
{/if}

<style>
	.vit-figure-head {
		fill: var(--color-surface);
		stroke: var(--vit-figure-ink, var(--color-ink));
		stroke-width: var(--vit-figure-stroke, 4);
		stroke-linejoin: round;
	}
</style>
