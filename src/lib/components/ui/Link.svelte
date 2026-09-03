<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Locale } from '../../config/types.js';
	import { getUiConfig } from '../../config/context.js';
	import { isInternalPath } from '../../utils/paths.js';

	interface Props extends HTMLAnchorAttributes {
		/**
		 * Canonical (unlocalized) app path, e.g. "/weeklies" — internal only.
		 *
		 * An absolute or protocol-relative URL does not pass through: the
		 * app's href resolver may splice a locale segment into it, so a foreign
		 * path can come back mangled, and no `rel` is emitted. A content column that may hold
		 * either (a milestone's `link_url`) branches at the call site and
		 * renders a bare anchor for the external case.
		 *
		 * This is ENFORCED, not assumed. The sentence above was here while the
		 * component handed anything at all to `config.href` — and a resolver
		 * that localizes paths returns 'javascript:alert(1)' unchanged, so an
		 * editor-written destination reached an <a href> intact. Anything that
		 * is not a root-relative path renders as plain text now: dropping a
		 * link is a visible bug someone reports, emitting a hostile one is not.
		 */
		href: string;
		/** Target locale; defaults to the current request/page locale. */
		locale?: Locale;
		children: Snippet;
	}

	let { href, locale, children, ...rest }: Props = $props();

	const config = getUiConfig();

	const internal = $derived(isInternalPath(href));
	const resolvedHref = $derived(internal ? config.href(href, { locale }) : undefined);
</script>

<!-- No href rather than no element: an anchor without one is not a link and
     navigates nowhere, while the surrounding CSS (which selects `a`) keeps
     applying, so a refused destination costs the layout nothing. -->
<a href={resolvedHref} {...rest}>{@render children()}</a>
