<script lang="ts">
	import UiProvider from '../../../config/UiProvider.svelte';
	import Nav from '../../layout/Nav.svelte';
	import type { SiteLink } from '../../../config/types.js';

	/**
	 * Nav under a UiConfig whose canonicalPathname strips a locale prefix —
	 * the shape the foundation site wires with Paraglide's deLocalizeUrl.
	 */
	interface Props {
		links: SiteLink[];
		url: URL;
	}

	let { links, url }: Props = $props();

	const config = {
		canonicalPathname: (u: URL) => u.pathname.replace(/^\/(en|es)(?=\/|$)/, '') || '/'
	};
</script>

<UiProvider {config}>
	<Nav {links} {url} />
</UiProvider>
