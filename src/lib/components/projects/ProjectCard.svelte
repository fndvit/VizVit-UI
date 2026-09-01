<script module lang="ts">
	import type { EditDescriptor } from '../../edit/types.js';

	/** Which of the card's localized fields are editable at this render site. */
	export interface ProjectEditMap {
		title?: EditDescriptor;
		excerpt?: EditDescriptor;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { ProjectCardData } from '../../content/types.js';
	import { getEditAdapter } from '../../edit/context.js';
	import Editable from '../../edit/Editable.svelte';
	import CardMedia from '../ui/CardMedia.svelte';
	import CardTitle from '../ui/CardTitle.svelte';
	import DateText from '../ui/DateText.svelte';
	import Link from '../ui/Link.svelte';

	interface Props {
		project: ProjectCardData;
		/** 'wide' for collaboration rows, 'grid' for passion-project tiles. */
		variant?: 'wide' | 'grid';
		/** Marks fields editable where an edit adapter is active. */
		edit?: ProjectEditMap;
	}

	let { project, variant = 'grid', edit }: Props = $props();

	const config = getUiConfig();
	const adapter = getEditAdapter();

	// See WeeklieCard: an editing title renders as plain text, never inside
	// the story link or the external anchor.
	const titleEditing = $derived(edit?.title !== undefined && (adapter?.isEditing ?? false));
</script>

<article class={variant}>
	<CardMedia src={project.imageUrl} alt="" ratio="16 / 9" width="1200" height="675" />
	<div class="text">
		<DateText value={project.publishedOn} />
		<CardTitle>
			{#if titleEditing}
				<Editable edit={edit?.title} value={project.title}>
					{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
				</Editable>
			{:else if project.hasStory}
				<Link href={`/what-we-do/${project.slug}`}>{project.title}</Link>
			{:else if project.externalUrl}
				<a href={project.externalUrl} rel="external noopener">{project.title}</a>
			{:else}
				{project.title}
			{/if}
		</CardTitle>
		<Editable edit={edit?.excerpt} value={project.excerpt}>
			{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
		</Editable>
		{#if project.hasStory}
			<Link href={`/what-we-do/${project.slug}`} class="more">
				{config.messages.common_readMore()}
			</Link>
		{/if}
	</div>
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	article.wide {
		flex-direction: row;
		align-items: flex-start;
	}

	article.wide > :global(img) {
		flex: 1 1 55%;
		min-width: 0;
	}

	article.wide .text {
		flex: 1 1 45%;
	}

	.text :global(h3) {
		margin: var(--space-1) 0 var(--space-2);
	}

	p {
		margin: 0 0 var(--space-2);
		color: var(--color-ink-secondary);
	}

	.text :global(a.more) {
		font-weight: 600;
		color: var(--color-brand);
	}

	@media (max-width: 720px) {
		article.wide {
			flex-direction: column;
		}
	}
</style>
