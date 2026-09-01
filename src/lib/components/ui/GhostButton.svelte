<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		/** 'ghost' = transparent with the app radius; 'chip' = grey pill with an aria-pressed state. */
		variant?: 'ghost' | 'chip';
		children: Snippet;
	}

	let { variant = 'ghost', children, type = 'button', class: className, ...rest }: Props = $props();
</script>

<button {type} class="{variant} {className ?? ''}" {...rest}>{@render children()}</button>

<style>
	button {
		border: 1px solid var(--color-hairline);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	button:hover {
		border-color: var(--color-brand);
	}

	.ghost {
		background: none;
		border-radius: var(--radius);
		padding: var(--space-1) var(--space-2);
	}

	.chip {
		background: var(--color-band-grey);
		border-radius: 999px;
		padding: var(--space-1) var(--space-3);
	}

	.chip[aria-pressed='true'] {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-surface);
	}
</style>
