<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface CommonProps {
		/**
		 * A closed named set, not orthogonal booleans (the PageShell rationale).
		 * `primary` is the brand fill and the default — the only look this
		 * component had before variants existed, so old call sites render
		 * byte-identically. `navy` and `ghost` come from the admin app.
		 */
		variant?: 'primary' | 'navy' | 'ghost';
		size?: 'md' | 'sm';
		children: Snippet;
	}

	type ButtonProps = CommonProps &
		Omit<HTMLButtonAttributes, 'type'> & {
			type?: 'button' | 'submit' | 'reset';
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
			href?: never;
			download?: never;
		};

	type AnchorProps = CommonProps &
		Omit<HTMLAnchorAttributes, 'download' | 'type'> & {
			/**
			 * Renders an anchor styled as a button (downloads, external tools).
			 * An anchor has no form behind it, so the branch admits no `pending`
			 * and no `disabled` — an unavailable action is a button's business.
			 */
			href: string;
			download?: boolean;
			pending?: never;
			disabled?: never;
			type?: never;
		};

	type Props = ButtonProps | AnchorProps;

	let {
		variant = 'primary',
		size = 'md',
		pending = null,
		href = undefined,
		download = false,
		children,
		type = 'button',
		disabled = false,
		...rest
	}: Props = $props();

	// `disabled` stays a separate prop: a button can be unavailable for a reason
	// of its own — the Google button before consent — as well as while posting.
	const isPending = $derived((pending ?? 0) > 0);
</script>

{#if href !== undefined}
	<a
		class="button {variant} {size}"
		{href}
		download={download ? '' : undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render children()}
	</a>
{:else}
	<button
		class="button {variant} {size}"
		{type}
		{...rest as HTMLButtonAttributes}
		disabled={disabled || isPending}
		aria-busy={isPending || undefined}
	>
		{@render children()}
	</button>
{/if}

<style>
	/* The `primary md` declarations reproduce the pre-variant component
	   exactly — consumers of the old single look must not repaint. */
	.button {
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius);
		font-weight: 600;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			filter var(--transition-fast);
	}

	a.button {
		display: inline-block;
		text-decoration: none;
		text-align: center;
	}

	.sm {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
	}

	.primary {
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.primary:hover:not(:disabled) {
		background: var(--color-navy);
	}

	.navy {
		background: var(--color-navy);
		color: var(--color-surface);
	}

	.navy:hover:not(:disabled) {
		filter: brightness(1.25);
	}

	.ghost {
		background: transparent;
		color: var(--color-ink);
		border: 1px solid var(--color-ink);
	}

	.ghost:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-ink) 8%, transparent);
	}

	.button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
