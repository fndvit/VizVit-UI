<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../../config/context.js';

	/**
	 * The chrome every page shares: the content column, the vertical rhythm,
	 * and the browser title, composed as `title — siteName` from the config's
	 * site name. (The foundation site's error page spells the same format on
	 * its own; the two are one decision, noted in both places.)
	 *
	 * The shape is one named variant rather than four presentation flags.
	 * Width, spacing, stacking and the wrapper element were independent props,
	 * so 24 combinations were expressible and 6 were used — `width="wide"
	 * element="article" stack` typechecked and meant nothing. Naming the shapes
	 * makes the ones that exist the only ones a page can ask for.
	 */
	type PageVariant =
		/** The standard column. */
		| 'content'
		/** Full width, for content that is deliberately wider (the timeline). */
		| 'wide'
		/** A single editorial piece at the standard column width (a project). */
		| 'article'
		/** A single editorial piece at a long-form reading measure (a weekly). */
		| 'reading'
		/** Sits lower on the page: account, admin, legal. */
		| 'chrome'
		/** Chrome spacing with stacked children: the auth and unsubscribe pages. */
		| 'form';

	interface Props {
		/**
		 * Browser title; the site name is appended. Pages title themselves from
		 * page copy, and content.getPage returns '' for a row that is missing,
		 * so an empty title is a real state — it renders as the site name alone
		 * rather than as a dangling separator.
		 */
		title: string;
		/** Meta description, for the pages that have real copy for one. */
		description?: string;
		variant?: PageVariant;
		children: Snippet;
	}

	let { title, description, variant = 'content', children }: Props = $props();

	const config = getUiConfig();
	const pageTitle = $derived(title ? `${title} — ${config.siteName}` : config.siteName);
	/**
	 * The editorial variants render an <article>, and say so to crawlers too.
	 * og:type was hardcoded to 'website' while the element already switched,
	 * so every weekly and every project story shipped the wrong social type.
	 */
	const isEditorial = $derived(variant === 'article' || variant === 'reading');
	const element = $derived(isEditorial ? 'article' : 'div');
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta property="og:title" content={pageTitle} />
	<meta property="og:type" content={isEditorial ? 'article' : 'website'} />
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
</svelte:head>

<!-- class: directives rather than an interpolated string, so Svelte's CSS
     scoping can see every selector and does not prune them as unused. -->
<svelte:element
	this={element}
	class="page"
	class:reading={variant === 'reading'}
	class:wide={variant === 'wide'}
	class:chrome={variant === 'chrome' || variant === 'form'}
	class:stack={variant === 'form'}
>
	{@render children()}
</svelte:element>

<style>
	.page {
		max-width: var(--content-max);
		margin: 0 auto;
		padding: var(--space-4) var(--space-3);
	}

	.reading {
		max-width: 48rem;
	}

	/* The timeline is intentionally wider than the content column. */
	.wide {
		max-width: none;
		margin: 0;
	}

	.chrome {
		padding: var(--space-5) var(--space-3) var(--space-6);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
