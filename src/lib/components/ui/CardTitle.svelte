<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** The title content — plain text or a Link/anchor around it. */
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<h3>{@render children()}</h3>

<style>
	h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	h3 :global(a) {
		text-decoration: none;
		color: var(--color-ink);
	}

	h3 :global(a:hover) {
		text-decoration: underline;
	}
</style>
