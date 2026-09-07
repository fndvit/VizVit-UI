<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { MilestoneData, WeeklyCardData } from '../../content/types.js';
	import type { MilestoneEditMap } from '../timeline/TimelineMilestone.svelte';
	import type { WeeklyEditMap } from '../weeklies/WeeklieCard.svelte';

	/**
	 * What a CMS may open on the home page. Every member optional: a read-only
	 * host passes no `edit` at all, and the render is byte-identical to the
	 * website's route. The chrome wording (the «Mostra-ho tot» link, the CTAs,
	 * the search placeholder, «…o explora'n un») needs no member here — the
	 * module reads `config.messageEdit`, like every component does for its
	 * own message sites.
	 */
	export interface HomePageEdit {
		copy?: CopyEditFor<'home'>;
		milestoneFor?: (milestone: MilestoneData) => MilestoneEditMap | undefined;
		weeklyFor?: (weekly: WeeklyCardData) => WeeklyEditMap | undefined;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import LinkEdit from '../../edit/chrome/LinkEdit.svelte';
	import Editable from '../../edit/Editable.svelte';
	import { chromeProperty } from '../../edit/helpers.js';
	import PageShell from '../layout/PageShell.svelte';
	import Timeline from '../timeline/Timeline.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';
	import DecorShapes from '../ui/DecorShapes.svelte';
	import Link from '../ui/Link.svelte';
	import SearchInput from '../ui/SearchInput.svelte';
	import WeeklieCard from '../weeklies/WeeklieCard.svelte';

	/**
	 * The landing page: hero, the latest milestones, a weeklies band with a
	 * search box, and two CTAs. Takes the website's read projection — its
	 * `+page.server.ts` returns exactly these three — plus the one thing the
	 * hosts do differently: where a search goes. The package has no router,
	 * so the host navigates to its own /weeklies with the query.
	 */
	interface Props {
		content: PageCopy<'home'>;
		milestones: MilestoneData[];
		weeklies: WeeklyCardData[];
		/** Called with the trimmed query after the search box's debounce. */
		onsearch: (query: string) => void;
		edit?: HomePageEdit;
	}

	let { content, milestones, weeklies, onsearch, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	// A link is configurable whole: clicking it while editing opens ONE modal
	// with Text and Adreça — the label saves as wording, the destination as
	// its *Href key. Both halves undefined without `messageEdit`, so the
	// control stays inert (the CommentSection rule).
	const hrefProperty = (key: string) =>
		config.messageEdit
			? chromeProperty(key, {
					type: 'text',
					locale: config.locale(),
					label: config.editMessages.edit_linkUrl()
				})
			: undefined;
	// A placeholder cannot hold a caret, so it edits through the search box's
	// panel — only where the host exposes `messageEdit` (the ContactForm rule).
	const placeholderProperty = $derived(
		config.messageEdit
			? chromeProperty('weeklies_searchPlaceholder', {
					type: 'text',
					locale: config.locale(),
					label: msg.weeklies_searchPlaceholder()
				})
			: undefined
	);
</script>

<PageShell title={content.hero_title} description={content.hero_subtitle}>
	<section class="hero">
		<div class="shapes left" aria-hidden="true"><DecorShapes /></div>
		<div class="hero-text">
			<Editable edit={edit?.copy?.('hero_title')} value={content.hero_title}>
				{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
			</Editable>
			<Editable edit={edit?.copy?.('hero_subtitle')} value={content.hero_subtitle}>
				{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
			</Editable>
		</div>
		<div class="shapes right" aria-hidden="true"><DecorShapes flip /></div>
	</section>

	<section aria-labelledby="milestones-heading">
		<Editable edit={edit?.copy?.('milestones_heading')} value={content.milestones_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="milestones-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<Timeline {milestones} variant="compact" editFor={edit?.milestoneFor} />
		<p class="see-all">
			<LinkEdit
				text={{ edit: config.messageEdit?.('common_seeAll'), value: msg.common_seeAll() }}
				href={{ descriptor: hrefProperty('common_seeAllHref'), value: msg.common_seeAllHref() }}
			>
				{#snippet control()}
					<Link href={msg.common_seeAllHref()}>{msg.common_seeAll()} →</Link>
				{/snippet}
			</LinkEdit>
		</p>
	</section>

	<section class="weeklies-band" aria-labelledby="weeklies-heading">
		<Editable edit={edit?.copy?.('weeklies_heading')} value={content.weeklies_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="weeklies-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.weeklies_intro} edit={edit?.copy?.('weeklies_intro')} />
		<SearchInput
			placeholder={msg.weeklies_searchPlaceholder()}
			label={msg.weeklies_searchPlaceholder()}
			onsearch={(query) => onsearch(query)}
			debounceMs={800}
			placeholderEdit={placeholderProperty}
		/>
		<Editable edit={config.messageEdit?.('weeklies_exploreOne')} value={msg.weeklies_exploreOne()}>
			{#snippet children(text, attrs)}<p class="explore" {...attrs}>{text}</p>{/snippet}
		</Editable>
		<div class="grid">
			{#each weeklies as weekly (weekly.slug)}
				<WeeklieCard {weekly} edit={edit?.weeklyFor?.(weekly)} />
			{/each}
		</div>
	</section>

	<section class="know-more" aria-labelledby="know-more-heading">
		<Editable edit={edit?.copy?.('know_more_heading')} value={content.know_more_heading}>
			{#snippet children(text, attrs)}<h2 id="know-more-heading" {...attrs}>{text}</h2>{/snippet}
		</Editable>
		<div class="ctas">
			<LinkEdit
				text={{ edit: config.messageEdit?.('cta_meetTeam'), value: msg.cta_meetTeam() }}
				href={{ descriptor: hrefProperty('cta_meetTeamHref'), value: msg.cta_meetTeamHref() }}
			>
				{#snippet control()}
					<Link href={msg.cta_meetTeamHref()} class="cta">{msg.cta_meetTeam()}</Link>
				{/snippet}
			</LinkEdit>
			<LinkEdit
				text={{ edit: config.messageEdit?.('cta_contactUs'), value: msg.cta_contactUs() }}
				href={{ descriptor: hrefProperty('cta_contactUsHref'), value: msg.cta_contactUsHref() }}
			>
				{#snippet control()}
					<Link href={msg.cta_contactUsHref()} class="cta primary">{msg.cta_contactUs()}</Link>
				{/snippet}
			</LinkEdit>
		</div>
	</section>
</PageShell>

<style>
	.hero {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-4);
		padding-block: var(--space-6);
	}

	.hero-text {
		text-align: center;
	}

	/* The one heading in the library that sets its own size: --text-hero is a
	 * deliberate decision about the landing page. Every other page module
	 * takes the h1/h2 scale from the host's global rules. */
	h1 {
		font-size: var(--text-hero);
		margin-bottom: var(--space-3);
	}

	.hero-text p {
		font-size: var(--text-lg);
		color: var(--color-ink-secondary);
		max-width: 44ch;
		margin-inline: auto;
	}

	.see-all :global(a) {
		color: var(--color-brand);
		font-weight: 600;
		text-decoration: none;
	}

	.weeklies-band {
		background: var(--color-band-grey);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		margin-block: var(--space-5);
	}

	.explore {
		color: var(--color-ink-secondary);
		max-width: 60ch;
	}

	.explore {
		margin-top: var(--space-3);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: var(--space-4);
	}

	.know-more {
		text-align: center;
		padding-block: var(--space-6);
	}

	.ctas {
		display: flex;
		justify-content: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.ctas :global(a.cta) {
		padding: var(--space-2) var(--space-5);
		border: 2px solid var(--color-ink);
		border-radius: var(--radius);
		text-decoration: none;
		font-weight: 600;
		color: var(--color-ink);
	}

	.ctas :global(a.cta.primary) {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-surface);
	}

	@media (max-width: 900px) {
		.shapes {
			display: none;
		}

		.hero {
			grid-template-columns: 1fr;
		}
	}
</style>
