<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		/**
		 * The submitting count of the remote form this button posts, or `null`
		 * for a control that genuinely has no pending state — the classic
		 * `action="?/…"` post, which has no count to read.
		 *
		 * Required and explicitly nullable, for the reason **field constraint**
		 * gives: optional made "this control cannot be pending" and "nobody
		 * thought about it" one value, and two submits had already taken the
		 * second — both logout, both double-submittable. A count rather than a
		 * boolean because that is what kit hands back, and `> 0` was the rule
		 * twelve call sites re-derived. It belongs here, once.
		 */
		pending: number | null;
		children: Snippet;
	}

	let { pending, children, type = 'button', disabled = false, ...rest }: Props = $props();

	// `disabled` stays a separate prop: a button can be unavailable for a reason
	// of its own — the Google button before consent — as well as while posting.
	const isPending = $derived((pending ?? 0) > 0);
</script>

<button {type} {...rest} disabled={disabled || isPending} aria-busy={isPending || undefined}>
	{@render children()}
</button>

<style>
	button {
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	button:hover {
		background: var(--color-navy);
	}

	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
