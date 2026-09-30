<script lang="ts">
	import type { ThemeData } from '../../../content/types.js';
	import ThemeCollage from '../../weeklies/ThemeCollage.svelte';

	interface Props {
		themes: ThemeData[];
		themeHref: (theme: ThemeData) => string;
	}

	let { themes, themeHref }: Props = $props();
</script>

<ThemeCollage {themes} {themeHref}>
	{#snippet lead()}<h2>Weeklies</h2>{/snippet}
</ThemeCollage>
