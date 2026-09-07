<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { ArticleEdit, ProjectArticleData } from '../../content/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Editable from '../../edit/Editable.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import DateText from '../ui/DateText.svelte';
	import Link from '../ui/Link.svelte';
	import RichText from '../ui/RichText.svelte';
	import ShareRow from '../ui/ShareRow.svelte';

	/**
	 * A project's story: date, title, excerpt, hero image, the rich-text body
	 * with a share row, and — when the project points somewhere — a preview
	 * card of the external destination. Whether a project HAS a page is the
	 * host's load's decision (a body-less project 404s there).
	 */
	interface Props {
		project: ProjectArticleData;
		/** What a CMS may open on a project's own page: title, excerpt, and the body as rich text. */
		edit?: ArticleEdit;
	}

	let { project, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

<PageShell title={project.title} description={project.excerpt} variant="article">
	<p class="back">
		<ActionLabel edit={config.messageEdit?.('back_label')} value={msg.back_label()}>
			{#snippet control()}
				<Link href="/what-we-do">← {msg.back_label()}</Link>
			{/snippet}
		</ActionLabel>
	</p>

	<header>
		<DateText value={project.publishedOn} />
		<Editable edit={edit?.title} value={project.title}>
			{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
		</Editable>
		<Editable edit={edit?.excerpt} value={project.excerpt}>
			{#snippet children(text, attrs)}<p class="excerpt" {...attrs}>{text}</p>{/snippet}
		</Editable>
	</header>

	<img class="hero" src={project.imageUrl} alt="" width="1200" height="675" />

	<div class="layout">
		<div class="body">
			{#if project.body}
				<RichText body={project.body} edit={edit?.body} />
			{/if}
			<ShareRow title={project.title} />
		</div>

		{#if project.externalUrl}
			<aside>
				<a class="preview" href={project.externalUrl} rel="external noopener">
					{#if project.previewImageUrl}
						<img src={project.previewImageUrl} alt="" width="900" height="300" />
					{/if}
					<span>{project.externalUrl.replace(/^https?:\/\//, '')} ↗</span>
				</a>
			</aside>
		{/if}
	</div>
</PageShell>

<style>
	.back :global(a) {
		text-decoration: none;
		color: var(--color-ink-secondary);
	}

	h1 {
		margin: var(--space-2) 0;
	}

	.excerpt {
		font-size: var(--text-lg);
		color: var(--color-ink-secondary);
		max-width: 60ch;
	}

	.hero {
		border-radius: var(--radius-lg);
		margin-block: var(--space-4);
		background: var(--color-band-grey);
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: var(--space-5);
		align-items: start;
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		padding: var(--space-3);
		text-decoration: none;
		color: var(--color-brand);
		font-weight: 600;
	}

	.preview img {
		border-radius: var(--radius);
	}

	@media (max-width: 720px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
