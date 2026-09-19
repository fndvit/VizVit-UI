/**
 * `@sveltejs/svelte-scroller` ships no type declarations, so the peer it is
 * declared as is untyped without this. It lives under `src/lib` deliberately:
 * `svelte-package` emits it into `dist`, so a consumer of this package inherits
 * the declaration instead of having to write their own — which is what the app
 * this was extracted from had to do.
 */
declare module '@sveltejs/svelte-scroller' {
	import type { SvelteComponent } from 'svelte';

	export default class Scroller extends SvelteComponent<{
		top?: number;
		bottom?: number;
		threshold?: number;
		query?: string;
		parallax?: boolean;
		index?: number;
		count?: number;
		offset?: number;
		progress?: number;
		visible?: boolean;
	}> {}
}
