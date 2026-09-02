<script lang="ts">
	interface Props {
		/** Height of the head mark in px. */
		size?: number;
		/** Adds the "Brain VIT" wordmark under the mark. */
		withWordmark?: boolean;
	}

	let { size = 32, withWordmark = false }: Props = $props();
</script>

<span class="logo">
	<svg
		viewBox="0 0 48 56"
		width={size * (48 / 56)}
		height={size}
		aria-hidden={withWordmark ? undefined : true}
		role={withWordmark ? 'img' : undefined}
		focusable="false"
	>
		{#if withWordmark}<title>Brain VIT</title>{/if}
		<path
			d="M25 2c11.6 0 21 9.4 21 21 0 6.9-3.3 13-8.5 16.8V54H17v-9h-4.5A4.5 4.5 0 0 1 8 40.5V34H4.2c-1.7 0-2.7-1.9-1.7-3.3L8 22.4C9 11 16.2 2 25 2Z"
			fill="currentColor"
		/>
		<g stroke="var(--color-surface)" stroke-width="3.2" stroke-linecap="round">
			<line x1="26" y1="13" x2="26" y2="31" />
			<line x1="18.2" y1="17.5" x2="33.8" y2="26.5" />
			<line x1="18.2" y1="26.5" x2="33.8" y2="17.5" />
		</g>
	</svg>
	{#if withWordmark}
		<span class="wordmark"><em>Brain</em> <strong>VIT</strong></span>
	{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-ink);
	}

	.wordmark {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		line-height: 1;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.wordmark em {
		color: var(--color-brand);
		font-style: italic;
		font-weight: 600;
	}

	.wordmark strong {
		font-weight: 600;
	}
</style>
