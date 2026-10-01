<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import LinkEdit from '../../edit/chrome/LinkEdit.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import Editable from '../../edit/Editable.svelte';
	import type { CollectionRef, EditDescriptor } from '../../edit/types.js';
	import { currentPage } from '../../utils/paths.js';
	import BrandMark from '../ui/BrandMark.svelte';
	import InlineText from '../ui/InlineText.svelte';
	import Link from '../ui/Link.svelte';
	import type { SiteLinkEditMap } from './site-link-edit.js';

	/**
	 * The foot of every page, on the brand's wine: the ViT mark in white
	 * with the foundation's name beside it (`footer_name`, its `**runs**`
	 * bold), and the site's pages as a column at the right — Home first,
	 * then the links, the current page in bold — with the rights line under.
	 *
	 * The links are a prop rather than a package constant: the host app owns
	 * its routes, and Nav and Footer render the same list — the foundation
	 * site derives both from one `siteLinks()` so the two can never drift.
	 */
	interface Props {
		links: SiteLink[];
		/** The page's URL, to mark the current link; defaults to the config's. */
		url?: URL;
		/** Edit descriptors for the link labels — see Nav. */
		editFor?: (link: SiteLink) => EditDescriptor | undefined;
		/** The modal's Adreça/Ordre rows and removal per link — see LinkEdit. */
		propertiesFor?: (link: SiteLink) => SiteLinkEditMap | undefined;
		/** Names the links' collection; with `applyOp`, turns on add/remove. */
		collection?: CollectionRef;
	}

	let {
		links,
		url = undefined,
		editFor = undefined,
		propertiesFor = undefined,
		collection
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	// Same structural half as Nav — see collectionEditing.
	const list = collectionEditing<SiteLink, SiteLinkEditMap>(() => ({
		collection,
		editFor: propertiesFor
	}));

	const currentUrl = $derived(url ?? config.url() ?? new URL('http://localhost/'));
	const current = $derived(currentPage(config.canonicalPathname(currentUrl)));
	const isCurrent = (href: string): boolean => current.isCurrent(href);

	const year = new Date().getFullYear();
</script>

<footer>
	<div class="inner band">
		<div class="brand">
			<Link href="/" aria-label={msg.nav_home()} class="mark"><BrandMark /></Link>
			<Editable edit={config.messageEdit?.('footer_name')} value={msg.footer_name()}>
				{#snippet children(text, attrs)}
					<p class="name" {...attrs}><InlineText {text} {attrs} /></p>
				{/snippet}
			</Editable>
		</div>
		<ul>
			<li>
				<ActionLabel edit={config.messageEdit?.('nav_home')} value={msg.nav_home()}>
					{#snippet control()}
						<Link href="/" aria-current={isCurrent('/') ? 'page' : undefined}>{msg.nav_home()}</Link
						>
					{/snippet}
				</ActionLabel>
			</li>
			{#each links as link (link.href)}
				{@const map = list.mapFor(link)}
				<li>
					<!-- One gesture: the modal edits text, destination, order, removal. -->
					<LinkEdit
						text={{ edit: editFor?.(link), value: link.label }}
						href={{ descriptor: map?.href, value: link.href }}
						extras={map?.order
							? [{ descriptor: map.order, value: String(link.order ?? 0) }]
							: undefined}
						removeOp={map?.removeOp}
						label={map?.label ?? link.label}
					>
						{#snippet control()}
							<Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
								{link.label}
							</Link>
						{/snippet}
					</LinkEdit>
				</li>
			{/each}
			{#if list.add}
				<li>
					<AddSlot op={list.add} />
				</li>
			{/if}
		</ul>
		<p class="rights">
			© {year}
			<Editable edit={config.messageEdit?.('footer_rights')} value={msg.footer_rights()}>
				{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
			</Editable>
		</p>
	</div>
</footer>

<style>
	footer {
		background: var(--color-wine);
		color: var(--color-surface);
	}

	.inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-5) var(--space-6);
		align-items: start;
		padding-block: var(--space-6);
	}

	/* The mark in white: BrandMark reads its colour from the token. */
	.brand {
		--vit-brand-mark: var(--color-surface);

		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.brand :global(a.mark) {
		display: block;
		width: 7rem;
		flex: none;
	}

	.name {
		margin: 0;
		max-width: 12rem;
		font-size: var(--text-lg);
		font-weight: 300;
		line-height: 1.25;
	}

	.name :global(strong) {
		font-weight: 700;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		font-size: var(--text-lg);
		font-weight: 300;
	}

	ul :global(a) {
		text-decoration: none;
	}

	ul :global(a:hover) {
		text-decoration: underline;
	}

	ul :global(a[aria-current='page']) {
		font-weight: 700;
	}

	.rights {
		grid-column: 1 / -1;
		margin: 0;
		font-size: var(--text-sm);
		opacity: 0.7;
	}

	@media (max-width: 700px) {
		.inner {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
