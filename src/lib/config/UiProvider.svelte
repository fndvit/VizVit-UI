<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setUiConfig } from './context.js';
	import type { UiConfigInput } from './types.js';

	/**
	 * Mounts the host app's UiConfig for everything beneath it — typically
	 * once, in the root layout. The config prop is read lazily on every
	 * access, so reactive inputs (current locale, current URL) stay live.
	 */
	interface Props {
		config: UiConfigInput;
		children: Snippet;
	}

	let { config, children }: Props = $props();

	setUiConfig(() => config);
</script>

{@render children()}
