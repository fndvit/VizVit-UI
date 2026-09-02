<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import LinkEdit from '../../edit/chrome/LinkEdit.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import Editable from '../../edit/Editable.svelte';
	import type { CollectionRef, EditDescriptor } from '../../edit/types.js';
	import Link from '../ui/Link.svelte';
	import type { SiteLinkEditMap } from './site-link-edit.js';

	/**
	 * The links are a prop rather than a package constant: the host app owns
	 * its routes, and Nav and Footer render the same list — the foundation
	 * site derives both from one `siteLinks()` so the two can never drift.
	 */
	interface Props {
		links: SiteLink[];
		/** Edit descriptors for the link labels — see Nav. */
		editFor?: (link: SiteLink) => EditDescriptor | undefined;
		/** The modal's Adreça/Ordre rows and removal per link — see LinkEdit. */
		propertiesFor?: (link: SiteLink) => SiteLinkEditMap | undefined;
		/** Names the links' collection; with `applyOp`, turns on add/remove. */
		collection?: CollectionRef;
	}

	let { links, editFor = undefined, propertiesFor = undefined, collection }: Props = $props();

	const config = getUiConfig();

	// Same structural half as Nav — see collectionEditing.
	const list = collectionEditing<SiteLink, SiteLinkEditMap>(() => ({
		collection,
		editFor: propertiesFor
	}));

	const year = new Date().getFullYear();
</script>

<footer>
	<div class="inner band">
		<span class="logo">
			<Link href="/" aria-label={config.messages.nav_home()}>{config.siteName}</Link>
		</span>
		<ul>
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
						{#snippet control()}<Link href={link.href}>{link.label}</Link>{/snippet}
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
			<Editable
				edit={config.messageEdit?.('footer_rights')}
				value={config.messages.footer_rights()}
			>
				{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
			</Editable>
		</p>
	</div>
</footer>

<style>
	footer {
		background: var(--color-navy);
		color: var(--color-surface);
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.logo :global(a) {
		font-size: var(--text-lg);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-decoration: none;
	}

	ul {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
	}

	ul :global(a) {
		text-decoration: none;
		opacity: 0.85;
	}

	ul :global(a:hover) {
		opacity: 1;
		text-decoration: underline;
	}

	.rights {
		margin: 0;
		font-size: var(--text-sm);
		opacity: 0.7;
	}
</style>
