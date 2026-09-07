<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';

	/** What a CMS may open on /legal: its two copy blocks (the body edits as rich text). */
	export interface LegalPageEdit {
		copy?: CopyEditFor<'legal'>;
	}
</script>

<script lang="ts">
	import type { PageCopy } from '../../content/pages.js';
	import Editable from '../../edit/Editable.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import RichText from '../ui/RichText.svelte';

	/** The terms page: a heading and one rich-text body, on the chrome shell. */
	interface Props {
		content: PageCopy<'legal'>;
		edit?: LegalPageEdit;
	}

	let { content, edit }: Props = $props();
</script>

<PageShell title={content.heading} variant="chrome">
	<Editable edit={edit?.copy?.('heading')} value={content.heading}>
		{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
	</Editable>
	<div class="body">
		<RichText body={content.body} edit={edit?.copy?.('body')} />
	</div>
</PageShell>

<style>
	.body {
		color: var(--color-ink-secondary);
		max-width: 40rem;
	}
</style>
