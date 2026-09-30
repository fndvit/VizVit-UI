<script lang="ts">
	import { setUiConfig } from '../../../config/context.js';
	import type { UiConfigInput } from '../../../config/types.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import { EDIT_CHROME } from '../../../edit/live/index.js';
	import type { EditAdapter, EditDescriptor } from '../../../edit/types.js';
	import SplashHero from '../../layout/SplashHero.svelte';

	interface Props {
		title: string;
		tagline: string;
		titleEdit?: EditDescriptor;
		taglineEdit?: EditDescriptor;
		adapter?: EditAdapter | null;
		config?: UiConfigInput;
	}

	let { title, tagline, titleEdit, taglineEdit, adapter = null, config }: Props = $props();

	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter, EDIT_CHROME);
	// svelte-ignore state_referenced_locally
	if (config) setUiConfig(() => config);
</script>

<SplashHero {title} {tagline} {titleEdit} {taglineEdit} />
