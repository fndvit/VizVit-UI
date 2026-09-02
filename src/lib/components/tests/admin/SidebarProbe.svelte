<script lang="ts">
	import Sidebar, { type SidebarItem } from '../../admin/Sidebar.svelte';

	/** Test-only host: supplies the snippets the way the admin app does. */
	interface Props {
		items: SidebarItem[];
		url?: URL;
		withFooter?: boolean;
	}

	let { items, url = undefined, withFooter = false }: Props = $props();
</script>

<Sidebar {items} {url}>
	{#snippet logo()}
		<span data-testid="logo">ViT</span>
	{/snippet}
	{#snippet footer()}
		{#if withFooter}
			<button type="button" data-testid="logout">Surt</button>
		{/if}
	{/snippet}
</Sidebar>
