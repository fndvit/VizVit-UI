<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar, { type SidebarItem } from './Sidebar.svelte';

	interface Props {
		/** Rail entries, already permission-filtered by the host. */
		items: SidebarItem[];
		/** Accessible name of the sidebar nav landmark. */
		navLabel?: string;
		logo?: Snippet;
		/** Bottom of the rail — the host's logout form. */
		footer?: Snippet;
		/** The page content. */
		children: Snippet;
		/** Highlighting override for tests and stories. */
		url?: URL;
	}

	let { items, navLabel = 'Principal', logo, footer, children, url = undefined }: Props = $props();
</script>

<div class="shell">
	<Sidebar {items} label={navLabel} {logo} {footer} {url} />
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	/* The sidebar is fixed at 4.5rem; the content pays for it once, here,
	   instead of every page knowing the rail's width. */
	.content {
		margin-left: 4.5rem;
		min-height: 100vh;
	}

	@media print {
		.content {
			margin-left: 0;
		}
	}
</style>
