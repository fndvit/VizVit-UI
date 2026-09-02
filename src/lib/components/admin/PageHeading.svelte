<script lang="ts">
	interface Props {
		/**
		 * Italic brand-colored word ("My", "Hi", "Workers"). Optional: a plain
		 * title is a heading too, and forcing an accent made call sites
		 * hand-roll their own h1.
		 */
		accent?: string;
		/** The serif rest of the heading ("Time Control", "Users"). */
		rest: string;
		level?: 1 | 2;
	}

	let { accent, rest, level = 1 }: Props = $props();
</script>

<svelte:element this={`h${level}`} class="heading">
	{#if accent}<em>{accent}</em>{/if}
	{rest}
</svelte:element>

<style>
	.heading {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 3rem;
		line-height: var(--leading-tight);
		margin: 0;
		color: var(--color-ink);
	}

	h2.heading {
		font-size: 2.1rem;
	}

	em {
		color: var(--color-brand);
		font-style: italic;
		font-weight: 600;
	}
</style>
