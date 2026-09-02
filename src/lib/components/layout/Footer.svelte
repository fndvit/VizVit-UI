<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import { getEditAdapter } from '../../edit/context.js';
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
		/** Panel rows (href, order) per link — see Nav. */
		propertiesFor?: (link: SiteLink) => SiteLinkEditMap | undefined;
		/** Names the links' collection; with `applyOp`, turns on add/remove. */
		collection?: CollectionRef;
	}

	let { links, editFor = undefined, propertiesFor = undefined, collection }: Props = $props();

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

	const year = new Date().getFullYear();
</script>

<footer>
	<div class="inner band">
		<span class="logo">
			<Link href="/" aria-label={config.messages.nav_home()}>{config.siteName}</Link>
		</span>
		<ul>
			{#each links as link (link.href)}
				{@const map = editMapFor(link)}
				{@const rows = rowsFor(link, map)}
				<li>
					<!-- Inside the li, so the list's flex layout never gains a child. -->
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
							{#snippet control()}<Link href={link.href}>{link.label}</Link>{/snippet}
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
