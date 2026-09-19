<!--
  @component ScrollyStepIndicator

  The row (or column) of dots that shows which step of a scrolly a reader is on,
  optionally clickable to jump.

  Colours arrive as CSS custom properties rather than class-name props. The
  version this was extracted from took `activeColor="bg-[#3E2A12] ring-1 …"` —
  Tailwind class strings with a brand hex baked into the default — which meant a
  consumer had to have Tailwind *and* had to restate the whole class list to
  change one colour.

  | property               | default   |
  |------------------------|-----------|
  | `--dot-size`       | `0.375rem`|
  | `--dot-gap`        | `0.5rem`  |
  | `--dot-color`      | `currentColor` |
  | `--dot-active`     | `var(--dot-color, currentColor)` |

  @prop {number} total - How many steps
  @prop {number} current - Index of the active step
  @prop {(index: number) => void} [onSelect] - Makes the dots buttons that jump
  @prop {'vertical' | 'horizontal'} [orientation] - Layout direction
  @prop {string} [class] - Extra classes appended to the container
-->
<script lang="ts">
	let {
		total,
		current,
		onSelect,
		orientation = 'vertical',
		class: className = ''
	}: {
		total: number;
		current: number;
		onSelect?: (index: number) => void;
		orientation?: 'vertical' | 'horizontal';
		class?: string;
	} = $props();

	const isHorizontal = $derived(orientation === 'horizontal');
</script>

<div class="vit-dots {className}" class:vit-dots--horizontal={isHorizontal}>
	{#each Array.from({ length: total }, (_, k) => k) as i (i)}
		{#if onSelect}
			<button
				type="button"
				aria-label="Go to slide {i + 1}"
				aria-current={i === current ? 'true' : undefined}
				onclick={() => onSelect(i)}
				class="vit-dots__dot vit-dots__dot--button"
				class:vit-dots__dot--active={i === current}
			></button>
		{:else}
			<div class="vit-dots__dot" class:vit-dots__dot--active={i === current}></div>
		{/if}
	{/each}
</div>

<style>
	.vit-dots {
		display: flex;
		flex-direction: column;
		gap: var(--dot-gap, 0.5rem);
	}

	.vit-dots--horizontal {
		flex-direction: row;
	}

	.vit-dots__dot {
		width: var(--dot-size, 0.375rem);
		height: var(--dot-size, 0.375rem);
		border-radius: 9999px;
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--dot-color, currentColor);
		transition:
			background-color 300ms,
			box-shadow 300ms;
	}

	.vit-dots__dot--active {
		background: var(--dot-active, var(--dot-color, currentColor));
	}

	.vit-dots__dot--button {
		padding: 0;
		border: 0;
		cursor: pointer;
		appearance: none;
	}
</style>
