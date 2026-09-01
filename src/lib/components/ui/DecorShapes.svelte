<script lang="ts">
	interface Props {
		/** Mirrors the composition horizontally (wireframes place shapes on both page corners). */
		flip?: boolean;
	}

	let { flip = false }: Props = $props();
</script>

<svg
	class="shapes"
	class:flip
	viewBox="0 0 240 160"
	width="240"
	height="160"
	aria-hidden="true"
	focusable="false"
>
	<rect x="0" y="80" width="80" height="80" fill="var(--color-navy)" />
	<path d="M80 80 L160 80 L80 160 Z" fill="var(--color-magenta)" />
	<rect x="160" y="80" width="80" height="80" fill="var(--color-cream)" />
	<path d="M160 0 A80 80 0 0 1 240 80 L160 80 Z" fill="var(--color-brand-light)" />
	<rect x="80" y="20" width="60" height="60" fill="var(--color-navy)" opacity="0.15" />
</svg>

<style>
	.shapes {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.flip {
		transform: scaleX(-1);
	}
</style>
