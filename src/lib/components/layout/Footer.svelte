<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { SiteLink } from '../../config/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Editable from '../../edit/Editable.svelte';
	import type { EditDescriptor } from '../../edit/types.js';
	import Link from '../ui/Link.svelte';

	/**
	 * The links are a prop rather than a package constant: the host app owns
	 * its routes, and Nav and Footer render the same list — the foundation
	 * site derives both from one `siteLinks()` so the two can never drift.
	 */
	interface Props {
		links: SiteLink[];
		/** Edit descriptors for the link labels — see Nav. */
		editFor?: (link: SiteLink) => EditDescriptor | undefined;
	}

	let { links, editFor = undefined }: Props = $props();

	const config = getUiConfig();

	const year = new Date().getFullYear();
</script>

<footer>
	<div class="inner band">
		<span class="logo">
			<Link href="/" aria-label={config.messages.nav_home()}>{config.siteName}</Link>
		</span>
		<ul>
			{#each links as link (link.href)}
				<li>
					<ActionLabel edit={editFor?.(link)} value={link.label}>
						{#snippet control()}<Link href={link.href}>{link.label}</Link>{/snippet}
					</ActionLabel>
				</li>
			{/each}
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
