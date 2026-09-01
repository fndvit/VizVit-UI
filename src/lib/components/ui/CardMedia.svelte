<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		src: string;
		/** Empty string for decorative images (the surrounding card carries the text). */
		alt: string;
		/** CSS aspect-ratio (e.g. '16 / 9'); omit to keep the image's natural height. */
		ratio?: string;
	}

	let { src, alt, ratio, ...rest }: Props = $props();
</script>

<img {src} {alt} loading="lazy" style:aspect-ratio={ratio} {...rest} />

<style>
	img {
		border-radius: var(--radius);
		background: var(--color-band-grey);
		object-fit: cover;
	}
</style>
