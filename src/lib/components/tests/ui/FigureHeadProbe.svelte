<script lang="ts">
	import FigureHead from '../../ui/figure/FigureHead.svelte';
	import { FIGURE_VIEWBOX } from '../../ui/figure/paths.js';
	import type { HeadShape } from '../../ui/figure/paths.js';

	/**
	 * Test-only host for FigureHead: an svg in the figure box, the way
	 * `FigureBody` and `PersonFigure` hold it. `two` renders a second head, for
	 * the clip-id case.
	 */
	interface Props {
		photo?: string | null;
		photoShape?: 'cutout' | 'circle';
		head?: HeadShape;
		headScale?: number;
		two?: boolean;
	}

	let { photo, photoShape, head, headScale, two = false }: Props = $props();
</script>

<svg viewBox={FIGURE_VIEWBOX}>
	<FigureHead {photo} {photoShape} {head} {headScale} />
	{#if two}
		<FigureHead {photo} {photoShape} {head} {headScale} />
	{/if}
</svg>
