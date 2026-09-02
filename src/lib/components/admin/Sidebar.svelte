<script lang="ts" module>
	import type { IconName } from '../ui/Icon.svelte';

	/** One rail entry. The host owns routes, labels, and who sees what — a
	 * permission-filtered list arrives here already filtered. */
	export interface SidebarItem {
		href: string;
		icon: IconName;
		label: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../../config/context.js';
	import { isPathUnder } from '../../utils/paths.js';
	import Icon from '../ui/Icon.svelte';

	interface Props {
		items: SidebarItem[];
		/** Accessible name of the nav landmark. */
		label?: string;
		/** Brand mark above the rail; the host owns its logo and home link. */
		logo?: Snippet;
		/** Bottom slot — the host's logout form lives here, never in the package. */
		footer?: Snippet;
		/** The URL highlighting reads from. Only tests and stories pass one. */
		url?: URL;
	}

	let { items, label = 'Principal', logo, footer, url = undefined }: Props = $props();

	const config = getUiConfig();

	// The localhost fallback keeps a provider-less render (a story, a bare
	// test) standing: nothing highlights, nothing crashes — the Nav pattern.
	const currentUrl = $derived(url ?? config.url() ?? new URL('http://localhost/'));
	const currentPath = $derived(config.canonicalPathname(currentUrl));

	// '/' matches only itself; a section stays current on its subpages.
	const isCurrent = (href: string): boolean =>
		href === '/' ? currentPath === '/' : isPathUnder(currentPath, href);
</script>

<nav class="sidebar" aria-label={label}>
	{#if logo}
		{@render logo()}
	{/if}

	<div class="rail">
		{#each items as item (item.href)}
			<a
				href={item.href}
				class="item"
				class:active={isCurrent(item.href)}
				aria-label={item.label}
				aria-current={isCurrent(item.href) ? 'page' : undefined}
				title={item.label}
			>
				<Icon name={item.icon} />
			</a>
		{/each}
	</div>

	{#if footer}
		<div class="footer">
			{@render footer()}
		</div>
	{/if}
</nav>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 4.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-4) 0;
		gap: var(--space-4);
		z-index: var(--z-raised);
	}

	.rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		background: var(--color-surface);
		border-radius: 999px;
		padding: var(--space-2);
		box-shadow: var(--shadow-1);
	}

	.item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		color: var(--color-navy);
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.item:hover {
		background: color-mix(in srgb, var(--color-navy) 10%, transparent);
	}

	.item.active {
		background: var(--color-navy);
		color: var(--color-surface);
	}

	.footer {
		margin-top: auto;
	}

	/* The host's footer control (a logout submit) should sit like an item. */
	.footer :global(button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		color: var(--color-navy);
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.footer :global(button:hover) {
		background: color-mix(in srgb, var(--color-navy) 10%, transparent);
	}

	@media print {
		.sidebar {
			display: none;
		}
	}
</style>
