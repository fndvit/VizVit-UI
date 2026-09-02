<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLImgAttributes, 'src'> {
		/**
		 * Null/undefined renders the placeholder directly — a row may simply
		 * have no image yet (the CMS creates rows before anyone uploads one).
		 */
		src: string | null | undefined;
		/** Empty string for decorative images (the surrounding card carries the text). */
		alt: string;
		/** CSS aspect-ratio (e.g. '16 / 9'); omit to keep the image's natural height. */
		ratio?: string;
	}

	let { src, alt, ratio, ...rest }: Props = $props();

	/**
	 * The src that 404'd, so a broken path degrades to the placeholder instead
	 * of the browser's broken-image box. Keyed by value, not a boolean: a NEW
	 * src (an editor fixing the path) gets a fresh attempt.
	 */
	let failedSrc = $state<string | null>(null);
	const showImage = $derived(Boolean(src) && src !== failedSrc);

	// The placeholder must hold the image's footprint: the ratio prop when
	// given, else the intrinsic width/height the caller passed, else square.
	const placeholderRatio = $derived(
		ratio ?? (rest.width && rest.height ? `${rest.width} / ${rest.height}` : '1 / 1')
	);
</script>

{#if showImage}
	<img
		{src}
		{alt}
		loading="lazy"
		style:aspect-ratio={ratio}
		onerror={() => (failedSrc = src ?? null)}
		{...rest}
	/>
{:else}
	<!-- Same accessibility contract as the img: named when alt has text,
	     invisible to readers when the image was decorative. -->
	<div
		class="placeholder"
		style:aspect-ratio={placeholderRatio}
		role={alt ? 'img' : undefined}
		aria-label={alt || undefined}
		aria-hidden={alt ? undefined : true}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			aria-hidden="true"
		>
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<circle cx="9" cy="10" r="1.8" />
			<path d="M3.5 17.5 9 13l4 3.2 4-4.2 3.5 4" />
		</svg>
	</div>
{/if}

<style>
	img {
		border-radius: var(--radius);
		background: var(--color-band-grey);
		object-fit: cover;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		border-radius: var(--radius);
		background: var(--color-band-grey);
		color: var(--color-ink-muted);
	}

	.placeholder svg {
		width: clamp(1.5rem, 18%, 3rem);
	}
</style>
