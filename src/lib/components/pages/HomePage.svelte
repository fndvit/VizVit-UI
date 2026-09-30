<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { CollectionRef } from '../../edit/types.js';
	import type { ThemeData, TimelineAreaData } from '../../content/types.js';
	import type { TimelineAreaEditMap } from '../timeline/TimelineArea.svelte';
	import type { ThemeEditMap } from '../weeklies/ThemeCollage.svelte';

	/**
	 * What a CMS may open on the home page. Every member optional: a read-only
	 * host passes no `edit` at all, and the render is byte-identical to the
	 * website's route. The chrome wording (the full-timeline and weeklies
	 * links, the CTAs, the search placeholder, «…o explora'n un») needs no
	 * member here — the module reads `config.messageEdit`, like every
	 * component does for its own message sites.
	 */
	export interface HomePageEdit {
		copy?: CopyEditFor<'home'>;
		areaFor?: (area: TimelineAreaData) => TimelineAreaEditMap | undefined;
		/** Names the areas' collection: with it, a host adds and removes sections in place. */
		areas?: CollectionRef;
		themeFor?: (theme: ThemeData) => ThemeEditMap | undefined;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import { plainInline } from '../../content/richtext.js';
	import WordedLink from '../../edit/chrome/WordedLink.svelte';
	import Editable from '../../edit/Editable.svelte';
	import { chromeProperty } from '../../edit/helpers.js';
	import { areaDestination } from '../timeline/area-link.js';
	import { weekliesHref } from '../../utils/weekly-list-contract.js';
	import PageShell from '../layout/PageShell.svelte';
	import SplashHero from '../layout/SplashHero.svelte';
	import TimelineAreas from '../timeline/TimelineAreas.svelte';
	import ArrowLink from '../ui/ArrowLink.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';
	import SearchInput from '../ui/SearchInput.svelte';
	import TileMosaic from '../ui/TileMosaic.svelte';
	import ThemeCollage from '../weeklies/ThemeCollage.svelte';

	/**
	 * The landing page: the splash, the three areas of the timeline as a
	 * scrolly, the weeklies band — a search box and the themes as labelled
	 * pictures — and «Want to know more?» with its two arrow links. Takes
	 * the website's read projection — its `+page.server.ts` returns exactly
	 * these three — plus the one thing the hosts do differently: where a
	 * search goes. The package has no router, so the host navigates to its
	 * own /weeklies with the query.
	 *
	 * Edge to edge (`variant="full"`): the splash is one screen under the nav
	 * with nothing between, and each section below centres itself at the
	 * content measure and keeps its own gutter. Tile clusters sit at the
	 * page's left edge beside the bands, as the design draws them.
	 */
	interface Props {
		content: PageCopy<'home'>;
		areas: TimelineAreaData[];
		themes: ThemeData[];
		/** Called with the trimmed query after the search box's debounce. */
		onsearch: (query: string) => void;
		/** How the timeline moves: one slide at a time (`swipe`, the default) or as sections the page scrolls through. */
		timelineMotion?: 'swipe' | 'scroll';
		/** How the reader enters it from the splash: a swipe (default) or the page's own scroll. */
		timelineEntry?: 'swipe' | 'scroll';
		/** How the reader leaves it for the weeklies: a swipe (default) or the page's own scroll. */
		timelineExit?: 'swipe' | 'scroll';
		edit?: HomePageEdit;
	}

	let {
		content,
		areas,
		themes,
		onsearch,
		timelineMotion = 'swipe',
		timelineEntry = 'swipe',
		timelineExit = 'swipe',
		edit
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	/** Where an area leads (`areaDestination`): its own href, else its category's history on «See all»'s editable path. */
	const areaHref = (area: TimelineAreaData): string | null =>
		areaDestination(area, msg.common_seeAllHref());

	/** A theme's weeklies: the index the «Go to weeklies» link opens, filtered by it. */
	const themeHref = (theme: ThemeData): string =>
		weekliesHref({ theme: theme.slug }, msg.weeklies_goHref());
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

<PageShell
	title={plainInline(content.hero_title)}
	description={plainInline(content.hero_subtitle)}
	variant="full"
>
	<SplashHero
		title={content.hero_title}
		tagline={content.hero_subtitle}
		titleEdit={edit?.copy?.('hero_title')}
		taglineEdit={edit?.copy?.('hero_subtitle')}
	/>

	<!-- Everything after the splash, on the page's ground. -->
	<div class="after-splash">
		<TimelineAreas
			{areas}
			{areaHref}
			editFor={edit?.areaFor}
			collection={edit?.areas}
			motion={timelineMotion}
			entry={timelineEntry}
			exit={timelineExit}
		>
			{#snippet seeAll()}
				<WordedLink text="timeline_toFull" href="common_seeAllHref">
					{#snippet link(href, text)}<ArrowLink {href} {text} />{/snippet}
				</WordedLink>
			{/snippet}
		</TimelineAreas>

		<section class="weeklies-band" aria-labelledby="weeklies-heading">
			<div class="cluster cluster-top" aria-hidden="true">
				<TileMosaic cols={3} rows={1} seed={53} density={1} />
			</div>
			<div class="inner">
				<ThemeCollage {themes} {themeHref} editFor={edit?.themeFor}>
					{#snippet lead()}
						<Editable edit={edit?.copy?.('weeklies_heading')} value={content.weeklies_heading}>
							{#snippet children(text, attrs)}
								<h2 class="band-heading" id="weeklies-heading" {...attrs}>{text}</h2>
							{/snippet}
						</Editable>
						<CopyIntro
							text={content.weeklies_intro}
							edit={edit?.copy?.('weeklies_intro')}
							role="lede"
						/>
						<SearchInput
							placeholder={msg.weeklies_searchPlaceholder()}
							label={msg.weeklies_searchPlaceholder()}
							onsearch={(query) => onsearch(query)}
							debounceMs={800}
							placeholderEdit={placeholderProperty}
							shape="pill"
						/>
						<Editable
							edit={config.messageEdit?.('weeklies_exploreOne')}
							value={msg.weeklies_exploreOne()}
						>
							{#snippet children(text, attrs)}<p class="explore" {...attrs}>{text}</p>{/snippet}
						</Editable>
					{/snippet}
				</ThemeCollage>
				<p class="go">
					<WordedLink text="weeklies_go" href="weeklies_goHref">
						{#snippet link(href, text)}<ArrowLink {href} {text} />{/snippet}
					</WordedLink>
				</p>
			</div>
		</section>

		<section class="know-more" aria-labelledby="know-more-heading">
			<div class="cluster cluster-know" aria-hidden="true">
				<TileMosaic cols={2} rows={1} seed={59} density={1} />
			</div>
			<div class="inner">
				<Editable edit={edit?.copy?.('know_more_heading')} value={content.know_more_heading}>
					{#snippet children(text, attrs)}
						<h2 class="band-heading" id="know-more-heading" {...attrs}>{text}</h2>
					{/snippet}
				</Editable>
				<CopyIntro
					text={content.know_more_intro}
					edit={edit?.copy?.('know_more_intro')}
					role="lede"
				/>
				<ul class="ctas">
					<li>
						<WordedLink text="cta_meetTeam" href="cta_meetTeamHref">
							{#snippet link(href, text)}<ArrowLink {href} {text} />{/snippet}
						</WordedLink>
					</li>
					<li>
						<WordedLink text="cta_contactUs" href="cta_contactUsHref">
							{#snippet link(href, text)}<ArrowLink {href} {text} />{/snippet}
						</WordedLink>
					</li>
				</ul>
			</div>
		</section>
	</div>
</PageShell>

<style>
	.after-splash {
		position: relative;
		background: var(--color-surface);
	}

	/* The shell is full width for the splash: each band runs edge to edge
	   for the clusters at its left, and centres its content at the measure
	   with its own gutter. */
	.weeklies-band,
	.know-more {
		position: relative;
	}

	.inner {
		position: relative;
		max-width: var(--content-max);
		margin-inline: auto;
		padding-inline: var(--space-3);
		box-sizing: border-box;
	}

	/* Room above the lead for the cluster at the band's top-left corner. */
	.weeklies-band {
		padding-block: calc(6rem + var(--space-4)) var(--space-5);
	}

	/* The bands' headings: large and light, in navy, like the design. */
	.band-heading {
		margin: 0 0 var(--space-2);
		font-size: var(--text-2xl);
		font-weight: 300;
		line-height: 1.1;
		color: var(--color-navy);
	}

	.explore {
		margin: var(--space-2) 0 0;
		max-width: 60ch;
		font-size: var(--text-sm);
		font-weight: 300;
		color: var(--color-navy);
	}

	.go {
		margin: var(--space-4) 0 0;
		text-align: right;
	}

	/* The clusters: a few tiles flush with the page's left edge. */
	.cluster {
		position: absolute;
		left: 0;
		pointer-events: none;
	}

	.cluster-top {
		top: 0;
		width: 18rem;
		height: 6rem;
	}

	/* Level with the «know more» heading, at the page's edge. */
	.cluster-know {
		top: var(--space-5);
		width: 12rem;
		height: 6rem;
	}

	.know-more {
		padding-block: var(--space-5) var(--space-6);
	}

	/* The design indents this block past the cluster beside it. */
	.know-more .inner {
		padding-inline-start: calc(var(--space-3) + 12rem);
	}

	.ctas {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (max-width: 900px) {
		.cluster {
			display: none;
		}

		.know-more .inner {
			padding-inline-start: var(--space-3);
		}
	}
</style>
