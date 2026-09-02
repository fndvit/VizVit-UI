<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import type { EditDescriptor } from '../../edit/types.js';
	import { isPathUnder } from '../../utils/paths.js';
	import GhostButton from '../ui/GhostButton.svelte';
	import Link from '../ui/Link.svelte';

	interface Props {
		/**
		 * Primary navigation entries. A prop rather than a package constant:
		 * the host app owns its routes and re-derives the labels when its
		 * locale changes (the foundation site wraps `siteLinks()` in $derived).
		 */
		links: SiteLink[];
		/** Logged-in account shown as a menu item linking to /account. */
		account?: { displayName: string } | null;
		/** The URL highlighting reads from. Only tests and stories pass one. */
		url?: URL;
		/**
		 * Edit descriptors for the link LABELS — a function because the host
		 * owns both the routes and the message keys behind them. While the
		 * adapter is editing, a link with a descriptor renders as editable
		 * text instead of an anchor (see ActionLabel).
		 */
		editFor?: (link: SiteLink) => EditDescriptor | undefined;
	}

	let { links, account = null, url = undefined, editFor = undefined }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	let isMenuOpen = $state(false);

	// The localhost fallback keeps a provider-less render (a story, a bare
	// test) standing: nothing highlights, nothing crashes.
	const currentUrl = $derived(url ?? config.url() ?? new URL('http://localhost/'));
	const currentPath = $derived(config.canonicalPathname(currentUrl));

	// /what-we-do stays current on /what-we-do/<slug>.
	const isCurrent = (href: string): boolean => isPathUnder(currentPath, href);

	const MENU_TOGGLE_ID = 'site-menu-toggle';

	// Nav renders in the root layout, so it is never remounted and `isMenuOpen`
	// survives every client-side navigation. Reading the path here is what
	// subscribes this effect to it: without it, the menu a reader opened stays
	// expanded over the page they navigated to, still asserting aria-expanded,
	// with the whole menu to tab back through to reach the new content.
	$effect(() => {
		void currentPath;
		isMenuOpen = false;
	});

	function closeOnEscape(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !isMenuOpen) return;
		isMenuOpen = false;
		// Focus is inside the menu that just disappeared; put it back on the
		// control that opened it. GhostButton spreads its rest props onto the
		// button, so the id reaches the real element.
		document.getElementById(MENU_TOGGLE_ID)?.focus();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<header class="header">
	<nav class="band-bar" aria-label={msg.nav_mainLabel()}>
		<span class="logo">
			<Link href="/" aria-label={msg.nav_home()}>{config.siteName}</Link>
		</span>

		<GhostButton
			id={MENU_TOGGLE_ID}
			class="menu-toggle"
			aria-expanded={isMenuOpen}
			aria-controls="site-menu"
			onclick={() => (isMenuOpen = !isMenuOpen)}
		>
			{msg.nav_menuLabel()}
		</GhostButton>

		<div class="menu" id="site-menu" class:open={isMenuOpen}>
			<ul class="links">
				{#each links as link (link.href)}
					<li>
						<ActionLabel edit={editFor?.(link)} value={link.label}>
							{#snippet control()}
								<Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
									{link.label}
								</Link>
							{/snippet}
						</ActionLabel>
					</li>
				{/each}
			</ul>

			{#if account}
				<ul class="account" aria-label={msg.account_navLabel()}>
					<li>
						<Link href="/account" aria-current={isCurrent('/account') ? 'page' : undefined}>
							{account.displayName}
						</Link>
					</li>
				</ul>
			{/if}

			<ul class="locales" aria-label={msg.lang_switcherLabel()}>
				{#each config.locales as locale (locale)}
					<li>
						<Link
							href={currentPath + currentUrl.search}
							{locale}
							data-sveltekit-reload
							aria-current={config.locale() === locale ? 'true' : undefined}
						>
							{locale}
						</Link>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
</header>

<style>
	.header {
		border-bottom: 1px solid var(--color-hairline);
		background: var(--color-surface);
	}

	nav {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	.logo :global(a) {
		font-size: var(--text-xl);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-decoration: none;
		color: var(--color-ink);
	}

	.menu {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	ul {
		list-style: none;
		display: flex;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
	}

	.links :global(a) {
		text-decoration: none;
		color: var(--color-ink-secondary);
		padding: var(--space-1) 0;
		border-bottom: 2px solid transparent;
		transition: color var(--transition-fast);
	}

	.links :global(a:hover) {
		color: var(--color-ink);
	}

	.links :global(a[aria-current='page']) {
		color: var(--color-ink);
		border-bottom-color: var(--color-brand);
	}

	.account {
		margin-left: auto;
	}

	.account :global(a) {
		text-decoration: none;
		color: var(--color-ink-secondary);
		font-weight: 600;
		padding: var(--space-1) 0;
		border-bottom: 2px solid transparent;
		transition: color var(--transition-fast);
	}

	.account :global(a:hover) {
		color: var(--color-ink);
	}

	.account :global(a[aria-current='page']) {
		color: var(--color-ink);
		border-bottom-color: var(--color-brand);
	}

	.locales :global(a) {
		text-decoration: none;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		font-size: var(--text-sm);
		padding: var(--space-1);
	}

	.locales :global(a[aria-current='true']) {
		color: var(--color-brand);
		font-weight: 700;
	}

	nav :global(.menu-toggle) {
		display: none;
	}

	@media (max-width: 720px) {
		nav :global(.menu-toggle) {
			display: block;
			margin-left: auto;
		}

		.menu {
			display: none;
			flex-basis: 100%;
			flex-direction: column;
			align-items: flex-start;
		}

		.menu.open {
			display: flex;
		}

		.links {
			flex-direction: column;
		}
	}
</style>
