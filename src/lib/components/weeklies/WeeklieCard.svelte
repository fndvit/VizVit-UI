<script module lang="ts">
	import type { EditDescriptor } from '../../edit/types.js';

	/** Which of the card's localized fields are editable at this render site. */
	export interface WeeklyEditMap {
		title?: EditDescriptor;
		excerpt?: EditDescriptor;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { WeeklyCardData } from '../../content/types.js';
	import { getEditAdapter } from '../../edit/context.js';
	import Editable from '../../edit/Editable.svelte';
	import CardMedia from '../ui/CardMedia.svelte';
	import CardTitle from '../ui/CardTitle.svelte';
	import DateText from '../ui/DateText.svelte';
	import Link from '../ui/Link.svelte';

	interface Props {
		weekly: WeeklyCardData;
		/** Marks fields editable where an edit adapter is active. */
		edit?: WeeklyEditMap;
	}

	let { weekly, edit }: Props = $props();

	const config = getUiConfig();
	const adapter = getEditAdapter();

	// While the title is being edited it renders as plain text, not a link:
	// a contenteditable inside an anchor still navigates on click, which
	// would throw the editor off the page mid-draft.
	const titleEditing = $derived(edit?.title !== undefined && (adapter?.isEditing ?? false));
</script>

<article>
	<header>
		<span class="number">{config.messages.weeklie_number({ number: weekly.number })}</span>
		<DateText value={weekly.publishedOn} />
	</header>
	<CardMedia src={weekly.imageUrl} alt="" ratio="1 / 1" width="600" height="600" />
	<CardTitle>
		{#if titleEditing}
			<Editable edit={edit?.title} value={weekly.title}>
				{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
			</Editable>
		{:else}
			<Link href={`/weeklies/${weekly.slug}`}>{weekly.title}</Link>
		{/if}
	</CardTitle>
	<Editable edit={edit?.excerpt} value={weekly.excerpt}>
		{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
	</Editable>
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: var(--text-sm);
		color: var(--color-ink-secondary);
	}

	.number {
		font-weight: 700;
	}

	p {
		margin: 0;
		color: var(--color-ink-secondary);
		font-size: var(--text-sm);
	}
</style>
