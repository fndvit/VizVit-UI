<script lang="ts">
	/**
	 * The ViT mark: the six strokes of the wordmark, each at its own level
	 * of the brand pink (`--vit-brand-mark`). Scales with its box — the nav
	 * shows it at 4rem, the splash at a quarter of the viewport. The levels
	 * are `fill-opacity`, not `opacity`, so a call site may fade a stroke in
	 * with `opacity` and the level holds once it is there (the splash does).
	 *
	 * Decorative unless named: with a `title` it is an image with that
	 * accessible name; without one it is hidden from assistive technology,
	 * for a call site that carries the name itself (the nav's home link).
	 */
	interface Props {
		/** Accessible name; omit where the surrounding element names the mark. */
		title?: string;
	}

	let { title }: Props = $props();
</script>

<svg
	class="brand-mark"
	viewBox="0 0 80 45"
	role={title ? 'img' : undefined}
	aria-label={title}
	aria-hidden={title ? undefined : 'true'}
	focusable="false"
>
	<path fill-opacity="0.7" d="M47.3252 20.6356H42.1588V44.8298H47.3252V20.6356Z" />
	<path fill-opacity="0.45" d="M22.3036 44.8298H17.1415L31.749 0H37.477L22.3036 44.8298Z" />
	<path fill-opacity="0.9" d="M15.6022 44.8298H20.7686L6.16111 0H0L15.6022 44.8298Z" />
	<path fill-opacity="0.45" d="M65.0927 0H59.4975V44.8298H65.0927V0Z" />
	<path fill-opacity="0.9" d="M80 0V5.16641H30.0637L31.7487 0H80Z" />
	<path fill-opacity="0.9" d="M47.3252 10.5472H42.1588V15.7136H47.3252V10.5472Z" />
</svg>

<style>
	.brand-mark {
		display: block;
		width: 100%;
		height: auto;
		fill: var(--vit-brand-mark);
	}
</style>
