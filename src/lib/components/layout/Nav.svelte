<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import { getEditAdapter } from '../../edit/context.js';
	import type { CollectionRef, EditDescriptor } from '../../edit/types.js';
	import { isPathUnder } from '../../utils/paths.js';
	import GhostButton from '../ui/GhostButton.svelte';
	import Link from '../ui/Link.svelte';
	import type { SiteLinkEditMap } from './site-link-edit.js';

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
		/** Panel rows (href, order) per link — the label edits via `editFor`. */
		propertiesFor?: (link: SiteLink) => SiteLinkEditMap | undefined;
		/** Names the links' collection; with `applyOp`, turns on add/remove. */
		collection?: CollectionRef;
	}

	let {
		links,
		account = null,
		url = undefined,
		editFor = undefined,
		propertiesFor = undefined,
		collection
	}: Props = $props();

	const config = getUiConfig();
	const adapter = getEditAdapter();

	const structural = $derived(
		collection !== undefined && (adapter?.isEditing ?? false) && adapter?.applyOp !== undefined
	);

	/** The map the host gave, plus removal — the list owns identity. */
	function editMapFor(link: SiteLink): SiteLinkEditMap | undefined {
		const map = propertiesFor?.(link);
		if (!structural || !collection || link.id === undefined) return map;
		return { ...map, removeOp: { kind: 'remove', collection, id: link.id } };
	}

	function rowsFor(link: SiteLink, map: SiteLinkEditMap | undefined) {
		return [
			map?.href && { descriptor: map.href, value: link.href },
			map?.order && { descriptor: map.order, value: String(link.order ?? 0) }
		].filter((row) => row !== undefined);
	}
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
					{@const map = editMapFor(link)}
					{@const rows = rowsFor(link, map)}
					<li>
						<!-- Inside the li, so the row's layout never gains a child. -->
						<EditFrame
							spec={map && (rows.length > 0 || map.removeOp)
								? {
										label: map.label ?? link.label,
										hasPanel: rows.length > 0,
										removeOp: map.removeOp
									}
								: undefined}
						>
							{#snippet panel()}
								<EditPanel {rows} />
							{/snippet}
							<ActionLabel edit={editFor?.(link)} value={link.label}>
								{#snippet control()}
									<Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
										{link.label}
									</Link>
								{/snippet}
							</ActionLabel>
						</EditFrame>
					</li>
				{/each}
				{#if structural && collection}
					<li>
						<AddSlot op={{ kind: 'create', collection }} />
					</li>
				{/if}
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
