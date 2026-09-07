<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { ProjectCardData } from '../../content/types.js';
	import type { ProjectEditMap } from '../projects/ProjectCard.svelte';

	/** What a CMS may open on /what-we-do; `projectFor` answers per card by its `id`. */
	export interface WhatWeDoPageEdit {
		copy?: CopyEditFor<'what-we-do'>;
		projectFor?: (project: ProjectCardData) => ProjectEditMap | undefined;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import Editable from '../../edit/Editable.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import ProjectCard from '../projects/ProjectCard.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';

	/**
	 * The projects page: a showcase of the latest project, the collaborations
	 * as wide rows, the passion projects as a grid. The three groups are the
	 * website's load's (`getLatest`, one `list(kind)` each); a host that
	 * groups differently (vit-brain's `projectSections`) answers the same
	 * three props.
	 */
	interface Props {
		content: PageCopy<'what-we-do'>;
		/** The showcase slot; `null`/absent renders no «Últim projecte» band. */
		latest?: ProjectCardData | null;
		collaborations: ProjectCardData[];
		passion: ProjectCardData[];
		edit?: WhatWeDoPageEdit;
	}

	let { content, latest = null, collaborations, passion, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

<PageShell title={msg.nav_whatWeDo()}>
	<Editable edit={config.messageEdit?.('nav_whatWeDo')} value={msg.nav_whatWeDo()}>
		{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
	</Editable>

	{#if latest}
		<section class="latest" aria-labelledby="latest-heading">
			<Editable edit={edit?.copy?.('latest_heading')} value={content.latest_heading}>
				{#snippet children(text, attrs)}
					<h2 class="section-heading" id="latest-heading" {...attrs}>{text}</h2>
				{/snippet}
			</Editable>
			<ProjectCard project={latest} variant="wide" edit={edit?.projectFor?.(latest)} />
		</section>
	{/if}

	<section aria-labelledby="collaborations-heading">
		<Editable edit={edit?.copy?.('collaborations_heading')} value={content.collaborations_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="collaborations-heading" {...attrs}>
					{text}
				</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.collaborations_intro} edit={edit?.copy?.('collaborations_intro')} />
		<div class="stack">
			{#each collaborations as project (project.slug)}
				<ProjectCard {project} variant="wide" edit={edit?.projectFor?.(project)} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="passion-heading">
		<Editable edit={edit?.copy?.('passion_heading')} value={content.passion_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="passion-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.passion_intro} edit={edit?.copy?.('passion_intro')} />
		<div class="grid">
			{#each passion as project (project.slug)}
				<ProjectCard {project} variant="grid" edit={edit?.projectFor?.(project)} />
			{/each}
		</div>
	</section>
</PageShell>

<style>
	.latest {
		padding-block-end: var(--space-4);
		border-bottom: 1px solid var(--color-hairline);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: var(--space-5) var(--space-4);
	}
</style>
