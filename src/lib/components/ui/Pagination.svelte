<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Link from './Link.svelte';

	/**
	 * Previous/next paging over a result set. Real links, not buttons: paging
	 * is a navigation, so it works without JavaScript, is crawlable, and each
	 * page keeps its own URL. The caller builds the hrefs because it owns the
	 * rest of the query string (the active filters).
	 */
	interface Props {
		/** 1-based current page. */
		page: number;
		/** Total items across all pages, not just the ones on screen. */
		total: number;
		pageSize: number;
		/** Href for a given 1-based page number. */
		href: (page: number) => string;
	}

	let { page, total, pageSize, href }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const pages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	const hasPrevious = $derived(page > 1);
	const hasNext = $derived(page < pages);

	// A page past the end is reachable through a stale or shared link. It shows
	// the empty state, so it must still show the way back — otherwise the only
	// recovery is editing the URL by hand. "Previous" goes to the last page that
	// has rows, not to page - 1, which would be just as empty.
	const isOutOfRange = $derived(page > pages);
	const previousPage = $derived(Math.min(page - 1, pages));
</script>

{#if pages > 1 || isOutOfRange}
	<nav class="pagination" aria-label={msg.pagination_label()}>
		<ActionLabel
			edit={config.messageEdit?.('pagination_previous')}
			value={msg.pagination_previous()}
		>
			{#snippet control()}
				{#if hasPrevious}
					<Link href={href(previousPage)} rel="prev">{msg.pagination_previous()}</Link>
				{:else}
					<span class="disabled">{msg.pagination_previous()}</span>
				{/if}
			{/snippet}
		</ActionLabel>

		<p class="status" aria-live="polite">
			{msg.pagination_status({ page, pages })}
		</p>

		<ActionLabel edit={config.messageEdit?.('pagination_next')} value={msg.pagination_next()}>
			{#snippet control()}
				{#if hasNext}
					<Link href={href(page + 1)} rel="next">{msg.pagination_next()}</Link>
				{:else}
					<span class="disabled">{msg.pagination_next()}</span>
				{/if}
			{/snippet}
		</ActionLabel>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		margin-top: var(--space-5);
	}

	.status {
		margin: 0;
		color: var(--color-ink-secondary);
		font-size: var(--text-sm);
	}

	.disabled {
		color: var(--color-ink-muted);
		font-size: var(--text-sm);
	}
</style>
