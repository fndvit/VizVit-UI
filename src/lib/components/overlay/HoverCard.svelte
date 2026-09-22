<!--
  @component HoverCard

  The chrome of a hover card: a fixed-width surface with a shimmer skeleton
  while its content is still resolving.

  It owns the *shell*, never the content — what goes inside is the host's
  snippet. It pairs with {@link ./anchor}, which decides where it goes, and the
  two are separate on purpose: placement is arithmetic a test can check, chrome
  is CSS a test cannot.

  ## Why the shimmer is here
  A hover card whose content arrives asynchronously flickers between empty and
  full. Showing a skeleton for a beat makes the transition deliberate, and doing
  it on *every* new target rather than only on slow ones keeps the rhythm
  even — a card that sometimes shimmers and sometimes does not reads as jank.
  Remount the component (a `{#key}` on the hovered target) and it shimmers
  again; pass `skipShimmer` for a clone that is animating out, which should fade
  real content rather than a fresh skeleton.

  ## Theming
  Presentation is CSS custom properties with plain fallbacks, so the card
  renders standalone and restyles without a CSS framework:

  | property                   | default   |
  |----------------------------|-----------|
  | `--vit-card-font`          | `inherit` |
  | `--vit-card-width`         | `277px`   |
  | `--vit-card-padding`       | `10px`    |
  | `--vit-card-gap`           | `10px`    |
  | `--vit-card-bg`            | `#ffffff` |
  | `--vit-card-radius`        | `0`       |
  | `--vit-card-shadow`        | `none`    |
  | `--vit-card-shimmer-color` | `currentColor` |

  @property skipShimmer - Suppresses the mount shimmer, for a card fading out
  @property shimmerMs - How long the skeleton is held, in ms
  @property lines - Skeleton rows drawn under the heading block
  @property class - Extra classes appended to the card
  @property children - The card's content
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let {
		skipShimmer = false,
		shimmerMs = 150,
		lines = 3,
		class: className = '',
		children
	}: {
		skipShimmer?: boolean;
		shimmerMs?: number;
		lines?: number;
		class?: string;
		children: Snippet;
	} = $props();

	// Fixed per mount — the leaving clone must never re-shimmer.
	// svelte-ignore state_referenced_locally
	let shimmer = $state(!skipShimmer);

	onMount(() => {
		if (!shimmer) return;
		const t = setTimeout(() => (shimmer = false), shimmerMs);
		return () => clearTimeout(t);
	});

	/** Descending widths, so the skeleton reads as text rather than as bars. */
	const widths = $derived(Array.from({ length: Math.max(0, lines) }, (_, i) => `${100 - i * 25}%`));
</script>

<div class="vit-card {className}">
	{#if shimmer}
		<div class="vit-card__skeleton">
			<span class="vit-card__line" style="height: 12px; width: 100%"></span>
			<span class="vit-card__line" style="height: 8px; width: 5rem"></span>
			<span class="vit-card__rows">
				{#each widths as w, i (i)}
					<span class="vit-card__line" style="height: 17px; width: {w}"></span>
				{/each}
			</span>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	.vit-card {
		display: flex;
		flex-direction: column;
		gap: var(--vit-card-gap, 10px);
		width: var(--vit-card-width, 277px);
		padding: var(--vit-card-padding, 10px);
		overflow: hidden;
		background: var(--vit-card-bg, #ffffff);
		border-radius: var(--vit-card-radius, 0);
		box-shadow: var(--vit-card-shadow, none);
		font-family: var(--vit-card-font, inherit);
	}
	.vit-card__skeleton {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.vit-card__rows {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 8px;
	}
	.vit-card__line {
		display: block;
		border-radius: 2px;
		background: var(--vit-card-shimmer-color, currentColor);
		animation: vit-card-shimmer 400ms ease-in-out infinite;
	}

	@keyframes vit-card-shimmer {
		0% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 0.3;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.vit-card__line {
			animation: none;
			opacity: 0.3;
		}
	}
</style>
