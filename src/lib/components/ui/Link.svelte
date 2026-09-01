<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Locale } from '../../config/types.js';
	import { getUiConfig } from '../../config/context.js';

	interface Props extends HTMLAnchorAttributes {
		/**
		 * Canonical (unlocalized) app path, e.g. "/weeklies" — internal only.
		 *
		 * An absolute or protocol-relative URL does not pass through: the
		 * app's href resolver may splice a locale segment into it, so a foreign
		 * path can come back mangled, and no `rel` is emitted. A content column that may hold
		 * either (a milestone's `link_url`) branches at the call site and
		 * renders a bare anchor for the external case.
		 */
		href: string;
		/** Target locale; defaults to the current request/page locale. */
		locale?: Locale;
		children: Snippet;
	}

	let { href, locale, children, ...rest }: Props = $props();

	const config = getUiConfig();

	const resolvedHref = $derived(config.href(href, { locale }));
</script>

<a href={resolvedHref} {...rest}>{@render children()}</a>
