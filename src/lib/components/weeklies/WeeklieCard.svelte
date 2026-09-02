<script module lang="ts">
	import type { EditDescriptor, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * Which of the card's fields are editable at this render site: localized
	 * text inline, the cover image through the frame's panel. NO collection
	 * ops — weeklies keep their own authoring flow in the CMS.
	 */
	export interface WeeklyEditMap {
		title?: EditDescriptor;
		excerpt?: EditDescriptor;
		image?: PropertyDescriptor;
		/** Accessible name for the frame, e.g. "Weekly #12". */
		label?: string;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { WeeklyCardData } from '../../content/types.js';
	import { getEditAdapter } from '../../edit/context.js';
	import Editable from '../../edit/Editable.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import CardMedia from '../ui/CardMedia.svelte';
	import DraftBadge from '../../edit/chrome/DraftBadge.svelte';
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

	const panelRows = $derived(
		[edit?.image && { descriptor: edit.image, value: weekly.imageUrl }].filter(
			(row) => row !== undefined
		)
	);
	const frameSpec = $derived(
		edit && panelRows.length > 0 ? { label: edit.label ?? weekly.title, hasPanel: true } : undefined
	);
</script>

<article>
	<!-- Inside the article, so the grid the host lays cards into never gains
	     an unexpected child; inactive it renders the content alone. -->
	<EditFrame spec={frameSpec}>
		{#snippet panel()}
			<EditPanel rows={panelRows} />
		{/snippet}
		<header>
			<span class="number">{config.messages.weeklie_number({ number: weekly.number })}</span>
			{#if weekly.draft}<DraftBadge />{/if}
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
	</EditFrame>
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
