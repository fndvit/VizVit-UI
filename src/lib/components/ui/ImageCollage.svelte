<script lang="ts">
	import { plainInline } from '../../content/richtext.js';
	import { getUiConfig } from '../../config/context.js';
	import { linkDoor } from '../../utils/paths.js';
	import CardMedia from './CardMedia.svelte';
	import InlineText from './InlineText.svelte';
	import Link from './Link.svelte';

	/**
	 * Up to four pictures as one composition, the home timeline's collage:
	 * the first large on the left, two small ones stacked in the column
	 * beside it, and the fourth further right, set a row lower — the design's
	 * placement, with its deliberate gap above the last one. A fifth and
	 * later are not shown, so a CMS that stores more loses nothing; one, two
	 * and three each have a layout of their own, so no count leaves a hole.
	 *
	 * A picture with an `href` is a LINK to it — a project's page, a story
	 * elsewhere — and says so under the pointer: a mask covers it and names
	 * where it leads («To the … project», the project's name in bold, from
	 * the picture's `label`; the link's own label when it has none). An
	 * internal path goes through `Link` (the host's locale resolver); an
	 * external URL is a bare anchor with the outbound `rel`; anything else
	 * renders as a plain picture, the `Link` rule. The images are decorative
	 * (`alt=""`): the text beside the collage carries the meaning, so a linked
	 * picture's accessible name is the mask's sentence.
	 */
	interface Props {
		images: { url: string; href?: string | null; label?: string | null; alt?: string }[];
		/** One alt text for the composition, when it IS the content. */
		alt?: string;
		/** The accessible name — and the mask's text — of a linked picture without a label. */
		linkLabel?: string;
	}

	let { images, alt = '', linkLabel }: Props = $props();

	const config = getUiConfig();
	const fallback = $derived(linkLabel ?? config.messages.common_readMore());

	/** The mask's sentence: the project's name in bold, or the plain fallback. */
	const maskText = (label: string | null | undefined): string =>
		label ? config.messages.timeline_toProject({ project: `**${label}**` }) : fallback;

	/**
	 * Grid areas per count over the design's grid — columns 2fr 1fr 1.25fr,
	 * rows 1fr 1fr 0.25fr, so the large picture is a square two rows tall,
	 * the two small ones a square each in the column beside it, and the
	 * fourth a larger square further right that starts on the second row and
	 * reaches below the others. Index 0 is the large one.
	 */
	const LAYOUTS: Record<number, readonly string[]> = {
		1: ['1 / 1 / 3 / 4'],
		2: ['1 / 1 / 3 / 2', '1 / 2 / 3 / 4'],
		3: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 3 / 4 / 4'],
		4: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 2 / 3 / 3', '2 / 3 / 4 / 4']
	};

	const shown = $derived(images.slice(0, 4));
	const areas = $derived(LAYOUTS[shown.length] ?? []);
</script>

{#snippet picture(image: { url: string; alt?: string }, index: number)}
	<CardMedia src={image.url} alt={index === 0 ? (image.alt ?? alt) : (image.alt ?? '')} />
{/snippet}

{#snippet mask(text: string)}
	<span class="mask" aria-hidden="true"><span class="mask-text"><InlineText {text} /></span></span>
{/snippet}

{#if shown.length > 0}
	<div class="collage" class:one={shown.length === 1}>
		{#each shown as image, index (image.url + index)}
			{@const door = linkDoor(image.href)}
			{@const text = maskText(image.label)}
			<div
				class="cell"
				class:big={index === 0}
				class:linked={door !== 'none'}
				style:grid-area={areas[index]}
			>
				{#if door === 'internal' && image.href}
					<Link href={image.href} class="door" aria-label={plainInline(text)}>
						{@render picture(image, index)}
						{@render mask(text)}
					</Link>
				{:else if door === 'external' && image.href}
					<a href={image.href} class="door" rel="external noopener" aria-label={plainInline(text)}>
						{@render picture(image, index)}
						{@render mask(text)}
					</a>
				{:else}
					{@render picture(image, index)}
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* A fixed frame the areas fill: the pictures are cropped to their cells
	   (cover), so the composition holds whatever their own shapes are. */
	.collage {
		display: grid;
		grid-template-columns: 2fr 1fr 1.25fr;
		grid-template-rows: 1fr 1fr 0.25fr;
		gap: var(--space-3);
		/* The columns' and the rows' fr units equal, so each area is the
		   square the design draws. */
		aspect-ratio: 4.25 / 2.25;
	}

	.collage.one {
		aspect-ratio: 4 / 3;
	}

	.cell {
		position: relative;
		min-width: 0;
		min-height: 0;
	}

	.cell :global(img),
	.cell :global(.placeholder) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.cell :global(.door) {
		position: relative;
		display: block;
		height: 100%;
		overflow: hidden;
		cursor: pointer;
	}

	.cell :global(.door img) {
		transition:
			transform 600ms ease,
			filter 400ms ease;
	}

	/* Under the pointer or the keyboard: the picture blurs and darkens under
	   a mask, and the mask says where it leads. */
	.cell :global(.door:hover img),
	.cell :global(.door:focus-visible img) {
		transform: scale(1.04);
		filter: blur(3px);
	}

	.cell :global(.door:focus-visible) {
		outline: 3px solid var(--color-brand);
		outline-offset: 2px;
	}

	/* The design's plum: the wine deepened with ink, over the blurred picture. */
	.mask {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: var(--space-3);
		background: color-mix(in srgb, var(--color-plum) 82%, transparent);
		color: var(--color-surface);
		text-align: center;
		opacity: 0;
		transition: opacity 300ms ease;
	}

	.mask-text {
		font-size: var(--text-base);
		font-weight: 300;
		line-height: 1.3;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.big .mask-text {
		font-size: var(--text-lg);
	}

	.mask-text :global(strong) {
		font-weight: 700;
	}

	.cell :global(.door:hover .mask),
	.cell :global(.door:focus-visible .mask) {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.cell :global(.door img),
		.mask {
			transition: none;
		}

		.cell :global(.door:hover img) {
			transform: none;
		}
	}
</style>
