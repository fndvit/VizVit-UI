<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type {
		ArticleEdit,
		CommentThreadData,
		ReactionSummary,
		WeeklyArticleData,
		WeeklyCardData
	} from '../../content/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Editable from '../../edit/Editable.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import DateText from '../ui/DateText.svelte';
	import Link from '../ui/Link.svelte';
	import RichText from '../ui/RichText.svelte';
	import ShareRow from '../ui/ShareRow.svelte';
	import CommentSection, { type CommentFormInstance } from '../weeklies/CommentSection.svelte';
	import ReactionBar, { type ReactionBarForms } from '../weeklies/ReactionBar.svelte';
	import WeeklieCard from '../weeklies/WeeklieCard.svelte';

	/**
	 * A weekly's own page: number and date, title, excerpt, the square hero,
	 * the body, Instagram and sources, share, reactions, comments, and the
	 * related weeklies. The community forms arrive preflighted by the host —
	 * the website's remote forms, a CMS mirror's inert mocks — and
	 * `isLoggedIn` is the host's auth answer; those are the props the hosts
	 * fill differently. `related` is its own prop because vit-brain loads it
	 * apart from the weekly, where the website nests it.
	 */
	interface Props {
		weekly: WeeklyArticleData;
		related: WeeklyCardData[];
		comments: CommentThreadData[];
		reactions: ReactionSummary[];
		isLoggedIn: boolean;
		/** The main comment box, preflighted; see CommentSection. */
		commentForm: CommentFormInstance;
		/** One preflighted instance per reply box; see CommentSection. */
		replyFormFor: (threadId: string) => CommentFormInstance;
		reactionForms: ReactionBarForms;
		/**
		 * What a CMS may open on a weekly's own page: title, excerpt, and the body
		 * as rich text. The «Dades i fonts» and «Segueix explorant» headings and
		 * the back link edit through `config.messageEdit` over their own keys.
		 */
		edit?: ArticleEdit;
	}

	let {
		weekly,
		related,
		comments,
		reactions,
		isLoggedIn,
		commentForm,
		replyFormFor,
		reactionForms,
		edit
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

<PageShell title={weekly.title} description={weekly.excerpt} variant="reading">
	<p class="back">
		<ActionLabel edit={config.messageEdit?.('back_label')} value={msg.back_label()}>
			{#snippet control()}
				<Link href="/weeklies">← {msg.back_label()}</Link>
			{/snippet}
		</ActionLabel>
	</p>

	<header>
		<p class="meta">
			<span class="number">{msg.weeklie_number({ number: weekly.number })}</span>
			<DateText value={weekly.publishedOn} />
		</p>
		<Editable edit={edit?.title} value={weekly.title}>
			{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
		</Editable>
		<Editable edit={edit?.excerpt} value={weekly.excerpt}>
			{#snippet children(text, attrs)}<p class="excerpt" {...attrs}>{text}</p>{/snippet}
		</Editable>
	</header>

	<img class="hero" src={weekly.imageUrl} alt="" width="600" height="600" />

	{#if weekly.body}
		<RichText body={weekly.body} edit={edit?.body} />
	{/if}

	{#if weekly.instagramUrl}
		<p><a href={weekly.instagramUrl} rel="external noopener">Instagram ↗</a></p>
	{/if}

	{#if weekly.sources.length > 0}
		<section aria-labelledby="sources-heading">
			<Editable edit={config.messageEdit?.('weeklie_sources')} value={msg.weeklie_sources()}>
				{#snippet children(text, attrs)}
					<h2 class="subsection-heading" id="sources-heading" {...attrs}>{text}</h2>
				{/snippet}
			</Editable>
			<ul>
				{#each weekly.sources as source (source.url)}
					<li><a href={source.url} rel="external noopener">{source.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<ShareRow title={weekly.title} />

	<ReactionBar
		{reactions}
		target={{ kind: 'weekly', slug: weekly.slug }}
		{isLoggedIn}
		forms={reactionForms}
	/>

	<CommentSection
		{comments}
		weeklySlug={weekly.slug}
		{isLoggedIn}
		{commentForm}
		{replyFormFor}
		{reactionForms}
	/>

	{#if related.length > 0}
		<section aria-labelledby="related-heading">
			<Editable
				edit={config.messageEdit?.('weeklie_keepExploring')}
				value={msg.weeklie_keepExploring()}
			>
				{#snippet children(text, attrs)}
					<h2 class="subsection-heading" id="related-heading" {...attrs}>{text}</h2>
				{/snippet}
			</Editable>
			<div class="related">
				{#each related as card (card.slug)}
					<WeeklieCard weekly={card} />
				{/each}
			</div>
		</section>
	{/if}
</PageShell>

<style>
	.back :global(a) {
		text-decoration: none;
		color: var(--color-ink-secondary);
	}

	.meta {
		display: flex;
		gap: var(--space-3);
		color: var(--color-ink-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.number {
		font-weight: 700;
		color: var(--color-brand);
	}

	h1 {
		margin: var(--space-2) 0;
	}

	.excerpt {
		font-size: var(--text-lg);
		color: var(--color-ink-secondary);
	}

	.hero {
		border-radius: var(--radius-lg);
		margin-block: var(--space-4);
		background: var(--color-band-grey);
		width: 100%;
		max-width: 32rem;
	}

	ul {
		padding-left: var(--space-4);
	}

	a {
		color: var(--color-brand);
	}

	.related {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: var(--space-4);
	}
</style>
