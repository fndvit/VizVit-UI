<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../../config/context.js';
	import { hasNewsletterIntent, withNewsletterIntent } from '../../forms/transport.js';
	import PageShell from '../layout/PageShell.svelte';
	import Link from '../ui/Link.svelte';

	/**
	 * The /login and /signup chrome: heading, intro, the tab pair that
	 * preserves the newsletter intent, and the legal note. Those two pages
	 * differ in which forms they compose and in how consent is mirrored into
	 * the Google flow — not in any of this.
	 *
	 * The legal note is here rather than per page because it is the no-JS
	 * fallback for the consent copy, and it must appear on both.
	 */
	interface Props {
		/** Browser title. */
		title: string;
		heading: string;
		intro: string;
		/**
		 * The URL the tab pair reads. Defaulted to the config's router URL;
		 * only tests and stories pass one. The current tab is derived from its
		 * canonical pathname, so locale prefixes don't break highlighting.
		 */
		url?: URL;
		/** The email form and the Google button. */
		children: Snippet;
	}

	let { title, heading, intro, url = undefined, children }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const currentUrl = $derived(url ?? config.url() ?? new URL('http://localhost/'));
	const currentPath = $derived(config.canonicalPathname(currentUrl));

	// Real links, not client-side tabs: mode switching works without JS and each
	// mode keeps its own URL. The newsletter intent survives the switch.
	const tabPath = (path: string): string =>
		hasNewsletterIntent(currentUrl) ? withNewsletterIntent(path) : path;

	const tabs = $derived([
		{ href: tabPath('/login'), label: msg.login_title(), current: currentPath === '/login' },
		{ href: tabPath('/signup'), label: msg.signup_title(), current: currentPath === '/signup' }
	]);
</script>

<PageShell {title} variant="form">
	<h1>{heading}</h1>
	<p class="intro">{intro}</p>
	<nav class="tabs" aria-label={msg.auth_tabsLabel()}>
		{#each tabs as tab (tab.href)}
			<Link href={tab.href} aria-current={tab.current ? 'page' : undefined}>{tab.label}</Link>
		{/each}
	</nav>
	{@render children()}
	<p class="legal-note">
		{msg.auth_legalNotePre()}
		<Link href="/legal">{msg.signup_termsLink()}</Link>
	</p>
</PageShell>

<style>
	h1 {
		margin: 0;
	}

	.tabs {
		display: flex;
		gap: var(--space-3);
		border-bottom: 1px solid var(--color-hairline);
		margin-bottom: var(--space-4);
		max-width: 24rem;
	}

	.tabs :global(a) {
		text-decoration: none;
		color: var(--color-ink-secondary);
		padding: var(--space-2) 0;
		border-bottom: 2px solid transparent;
		font-weight: 600;
	}

	.tabs :global(a:hover) {
		color: var(--color-ink);
	}

	.tabs :global(a[aria-current='page']) {
		color: var(--color-ink);
		border-bottom-color: var(--color-brand);
	}

	.intro {
		color: var(--color-ink-secondary);
		margin: 0;
		max-width: 40rem;
	}

	.legal-note {
		color: var(--color-ink-muted);
		font-size: var(--text-sm);
		margin: 0;
		max-width: 24rem;
	}
</style>
