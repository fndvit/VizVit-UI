<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import Editable from '../../edit/Editable.svelte';
	import type { EditDescriptor } from '../../edit/types.js';
	import BrandMark from '../ui/BrandMark.svelte';
	import InlineText from '../ui/InlineText.svelte';
	import TileMosaic from '../ui/TileMosaic.svelte';
	import { clamp01, watchScroll } from '../../utils/scroll-progress.js';

	/**
	 * The landing splash, the height of the viewport under the nav: the brand
	 * mosaic across the whole of it — a crowd of tiles left of centre thinning
	 * out towards the edges — the ViT mark right of centre, the foundation's
	 * name as a vertical label down the left, the tagline lower left in navy,
	 * and a «Scroll» hint at the bottom edge pointing at what follows. What
	 * follows is below the fold on purpose: the splash is one screen.
	 *
	 * The `<h1>` is the TITLE — the vertical label is how the page's one
	 * heading is set, not a decoration beside it — and the mark is decorative,
	 * since the nav already names the site. Title and tagline render their
	 * `**runs**` as `<strong>` through `InlineText`, raw while a caret is in
	 * them (see that component for the rule). The mosaic is décor and takes
	 * only a seed, so a host that wants a different picture asks for one.
	 *
	 * The height is the viewport's minus `--vit-splash-offset`, whatever sits
	 * above the splash: the token defaults to the website nav's height and a
	 * host with a taller header sets it. A token rather than a measurement,
	 * so the server and the browser draw the same box.
	 */
	interface Props {
		title: string;
		tagline: string;
		titleEdit?: EditDescriptor;
		taglineEdit?: EditDescriptor;
		/** Which mosaic; the same seed draws the same picture every time. */
		seed?: number;
	}

	let { title, tagline, titleEdit, taglineEdit, seed = 7 }: Props = $props();

	const config = getUiConfig();

	const COLS = 16;
	const ROWS = 10;
	/**
	 * Where the text sits, in the mosaic's cells, so no tile is drawn under
	 * it. The server render clears the zones the layout below places the text
	 * in; once mounted the REAL boxes of the label, the mark and the tagline
	 * are measured — copy length and viewport decide them — and the mosaic
	 * redraws with those, then again on resize. `TileMosaic` clears a cell
	 * that any part of a zone touches, so text never meets a tile's edge.
	 */
	const PLACED_CLEARS = [
		{ col: 0.5, row: 1.5, cols: 2, rows: 5 },
		{ col: 9, row: 3.5, cols: 4.5, rows: 2.8 },
		{ col: 3.2, row: 6.9, cols: 7.6, rows: 2.2 }
	];
	let clears = $state(PLACED_CLEARS);
	let root = $state<HTMLElement | null>(null);

	/**
	 * A text box → the cells under it, through `slice`'s scale and centring.
	 * Layout offsets, not client rects: the measurement can run while the
	 * page is scrolled — a return to the page restores its scroll before the
	 * splash has measured, a resize can come at any point — and then the
	 * mosaic is mid-parallax, shifted and shrunk, while the text is not. A
	 * client rect would read the zones off the moved picture and leave tiles
	 * under the words once the reader was back at the top. Offsets are the
	 * boxes at rest, which is where the picture settles.
	 */
	function zonesUnder(splash: HTMLElement): typeof PLACED_CLEARS {
		const mosaic = splash.querySelector<HTMLElement>(':scope > .mosaic');
		if (!mosaic || mosaic.offsetWidth === 0) return PLACED_CLEARS;
		const cell = Math.max(mosaic.offsetWidth / COLS, mosaic.offsetHeight / ROWS);
		const originX = mosaic.offsetLeft + (mosaic.offsetWidth - cell * COLS) / 2;
		const originY = mosaic.offsetTop + (mosaic.offsetHeight - cell * ROWS) / 2;
		const pad = 10;
		return [...splash.querySelectorAll<HTMLElement>('h1, .wordmark, .tagline')].map((box) => ({
			col: (box.offsetLeft - pad - originX) / cell,
			row: (box.offsetTop - pad - originY) / cell,
			cols: (box.offsetWidth + 2 * pad) / cell,
			rows: (box.offsetHeight + 2 * pad) / cell
		}));
	}

	$effect(() => {
		if (!root || typeof ResizeObserver === 'undefined') return;
		const measure = () => {
			if (root) clears = zonesUnder(root);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	});

	/**
	 * The way out: the splash scrolls away like any section, and the mosaic
	 * lags a little behind the text as it goes — a parallax, the picture
	 * sinking under the words — and the scroll hint fades once the reader
	 * has taken it. `--vit-splash-progress` is how far the splash has
	 * scrolled, 0 at rest and 1 once gone, set from the scroll position on
	 * the section itself so the server render carries no inline style.
	 * Under reduced motion nothing moves.
	 */
	$effect(() => {
		if (!root || typeof window === 'undefined') return;
		const splash = root;
		// Measured from the splash's OWN box, not from `window.scrollY`: the
		// site's splash starts at the top of the page, a CMS mirror's sits
		// under the CMS's own header, and the scroll position alone would
		// read the mirror's as half gone before the reader had moved.
		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		const offset =
			parseFloat(getComputedStyle(splash).getPropertyValue('--vit-splash-offset')) * rem || 0;
		return watchScroll(() => {
			const rect = splash.getBoundingClientRect();
			const progress = clamp01((offset - rect.top) / (rect.height || 1));
			splash.style.setProperty('--vit-splash-progress', progress.toFixed(3));
		});
	});
</script>

<section class="splash" bind:this={root}>
	<div class="mosaic" aria-hidden="true">
		<TileMosaic
			cols={COLS}
			rows={ROWS}
			{seed}
			density={0.14}
			focus={{ col: 5, row: 4.5, radius: 3, density: 0.92 }}
			clear={clears}
			arrive
		/>
	</div>
	<Editable edit={titleEdit} value={title}>
		{#snippet children(text, attrs)}
			<h1 {...attrs}><InlineText {text} {attrs} /></h1>
		{/snippet}
	</Editable>
	<div class="wordmark" aria-hidden="true"><BrandMark /></div>
	<Editable edit={taglineEdit} value={tagline}>
		{#snippet children(text, attrs)}
			<p class="tagline" {...attrs}><InlineText {text} {attrs} /></p>
		{/snippet}
	</Editable>
	<Editable
		edit={config.messageEdit?.('hero_scrollHint')}
		value={config.messages.hero_scrollHint()}
	>
		{#snippet children(text, attrs)}
			<p class="scroll">
				<svg
					class="mouse"
					viewBox="0 0 24 36"
					width="20"
					height="30"
					aria-hidden="true"
					focusable="false"
				>
					<rect
						x="1.5"
						y="1.5"
						width="21"
						height="33"
						rx="10.5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					/>
					<circle class="wheel" cx="12" cy="10" r="2.2" fill="currentColor" />
				</svg>
				<span class="hint" {...attrs}>{text}</span>
			</p>
		{/snippet}
	</Editable>
</section>

<style>
	/* One screen: the viewport minus the nav above. No max-width and no
	   gutter — the mosaic runs edge to edge and the text is placed on it by
	   proportion. A container, so the tagline's size follows the splash's
	   OWN width (`cqw`), not the viewport's: in the CMS mirror the splash is
	   narrower than the window and the text used to be the window's size. */
	.splash {
		--vit-splash-progress: 0;

		position: relative;
		container-type: inline-size;
		overflow: hidden;
		height: calc(var(--device-h) - var(--vit-splash-offset));
		height: calc(100dvh - var(--vit-splash-offset));
		min-height: 34rem;
		background: var(--color-surface);
	}

	/* Recede as the next section covers this one. */
	.mosaic {
		position: absolute;
		inset: 0;
		opacity: calc(1 - var(--vit-splash-progress) * 0.9);
		transform: translateY(calc(var(--vit-splash-progress) * -12vh))
			scale(calc(1 - var(--vit-splash-progress) * 0.06));
		transform-origin: 50% 40%;
		will-change: transform, opacity;
	}

	.splash > :global(:not(.mosaic)) {
		position: absolute;
	}

	/* The one heading in the library that sets its own size: the splash is a
	   deliberate decision about the landing page. Reads bottom to top, the
	   way a spine does. */
	/* Vertical, so its inline axis is the height: capping it wraps the name
	   into a few lines side by side, the first one leftmost. */
	h1 {
		top: 18%;
		left: 8%;
		max-height: 40%;
		margin: 0;
		font-size: var(--text-lg);
		font-weight: 300;
		line-height: 1.3;
		color: var(--color-ink);
		writing-mode: vertical-rl;
		text-wrap: balance;
		transform: rotate(180deg);
	}

	h1 :global(strong),
	.tagline :global(strong) {
		font-weight: 700;
	}

	.wordmark {
		top: 38%;
		left: 58%;
		width: 21%;
		min-width: 12rem;
	}

	.tagline {
		top: 71%;
		left: 22%;
		width: 44%;
		max-width: 26ch;
		margin: 0;
		font-size: clamp(1.5rem, 2.6cqw, 2.25rem);
		font-weight: 300;
		line-height: 1.15;
		color: var(--color-navy);
	}

	.scroll {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		opacity: calc(1 - var(--vit-splash-progress) * 4);
		animation: vit-splash-fade 700ms ease-out 1700ms backwards;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		margin: 0;
		padding-bottom: var(--space-1);
		color: var(--color-wine);
	}

	.hint {
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.wheel {
		animation: vit-mouse-wheel 1.6s ease-in-out infinite;
	}

	@keyframes vit-mouse-wheel {
		0%,
		100% {
			transform: translateY(0);
			opacity: 1;
		}

		60% {
			transform: translateY(9px);
			opacity: 0.2;
		}
	}

	/* THE ENTRANCE, after the mosaic's: the label and the tagline rise into
	   place; the mark comes stroke by stroke, each unseen until its turn and
	   then rising in with a little overshoot (the strokes' own levels are
	   `fill-opacity`, so fading `opacity` in leaves them as drawn); and the
	   hint comes last, once there is something to leave. `translate`, not
	   `transform`: the label is turned and the hint centred by `transform`,
	   and the two compose. Pure CSS from the server's markup, so it starts
	   with the first paint. */
	h1,
	.tagline {
		animation: vit-splash-rise 900ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}

	h1 {
		animation-delay: 500ms;
	}

	.tagline {
		animation-delay: 850ms;
	}

	.wordmark :global(path) {
		transform-box: fill-box;
		transform-origin: center;
		animation: vit-splash-stroke 800ms cubic-bezier(0.34, 1.5, 0.64, 1) backwards;
	}

	.wordmark :global(path:nth-child(1)) {
		animation-delay: 700ms;
	}

	.wordmark :global(path:nth-child(2)) {
		animation-delay: 790ms;
	}

	.wordmark :global(path:nth-child(3)) {
		animation-delay: 880ms;
	}

	.wordmark :global(path:nth-child(4)) {
		animation-delay: 970ms;
	}

	.wordmark :global(path:nth-child(5)) {
		animation-delay: 1060ms;
	}

	.wordmark :global(path:nth-child(6)) {
		animation-delay: 1150ms;
	}

	@keyframes vit-splash-rise {
		from {
			translate: 0 28px;
			opacity: 0;
		}

		to {
			translate: 0 0;
			opacity: 1;
		}
	}

	@keyframes vit-splash-stroke {
		from {
			translate: 0 18px;
			scale: 0.7;
			opacity: 0;
		}

		40% {
			opacity: 1;
		}

		to {
			translate: 0 0;
			scale: 1;
			opacity: 1;
		}
	}

	@keyframes vit-splash-fade {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wheel,
		h1,
		.wordmark :global(path),
		.tagline,
		.scroll {
			animation: none;
		}

		.mosaic {
			transform: none;
		}
	}

	/* A phone: the same screen, stacked — the mosaic as a band on top, then
	   the label, the mark, the tagline and the hint in flow. */
	@media (max-width: 900px) {
		.splash {
			display: flex;
			flex-direction: column;
			gap: var(--space-3);
			height: auto;
			min-height: calc(var(--device-h) - var(--vit-splash-offset));
			padding: 0 var(--space-3) var(--space-2);
			box-sizing: border-box;
		}

		.splash > :global(:not(.mosaic)) {
			position: static;
			transform: none;
		}

		.mosaic {
			position: relative;
			height: 14rem;
			margin-inline: calc(-1 * var(--space-3));
		}

		h1 {
			max-height: none;
			writing-mode: horizontal-tb;
			font-size: var(--text-base);
		}

		.wordmark {
			width: 40%;
			min-width: 8rem;
		}

		.tagline {
			width: auto;
			font-size: var(--text-xl);
		}

		.scroll {
			margin-top: auto;
			align-self: center;
		}
	}
</style>
