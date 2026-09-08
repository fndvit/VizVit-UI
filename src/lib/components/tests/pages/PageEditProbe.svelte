<script lang="ts">
	import type { Component } from 'svelte';
	import { setUiConfig } from '../../../config/context.js';
	import type { UiConfigInput } from '../../../config/types.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import { EDIT_CHROME } from '../../../edit/live/index.js';
	import type { EditAdapter } from '../../../edit/types.js';

	/**
	 * A page module under a test-owned adapter and provider config, the way
	 * `EditableProbe` mounts the primitive: `adapter: null` is a read-only
	 * app; `config.messageEdit` is the CMS's chrome-wording seam. One probe
	 * for all nine pages — the module is a prop. It is untyped HERE on
	 * purpose: `render()` cannot carry a component generic through, so the
	 * pairing of a page with its props is typed once, in `mountPage`.
	 */
	interface Props {
		page: Component<Record<string, unknown>>;
		props: Record<string, unknown>;
		adapter?: EditAdapter | null;
		config?: UiConfigInput;
	}

	let { page: Page, props, adapter = null, config }: Props = $props();

	// Context is set once at init, on purpose — tests swap by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter, EDIT_CHROME);
	// svelte-ignore state_referenced_locally
	if (config) setUiConfig(() => config);
</script>

<div data-testid="page-host">
	<Page {...props} />
</div>
