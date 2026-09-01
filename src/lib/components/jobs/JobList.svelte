<script module lang="ts">
	import type { EditDescriptor } from '../../edit/types.js';

	/** Which of one opening's localized fields are editable at this render site. */
	export interface JobEditMap {
		title?: EditDescriptor;
		description?: EditDescriptor;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { JobOpeningData } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import DateText from '../ui/DateText.svelte';

	interface Props {
		jobs: JobOpeningData[];
		/**
		 * Edit descriptors per opening — a function because each row needs its
		 * own identity. Returning undefined leaves that row read-only.
		 */
		editFor?: (job: JobOpeningData) => JobEditMap | undefined;
	}

	let { jobs, editFor }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

{#if jobs.length === 0}
	<Editable edit={config.messageEdit?.('jobs_empty')} value={msg.jobs_empty()}>
		{#snippet children(text, attrs)}<p class="empty" {...attrs}>{text}</p>{/snippet}
	</Editable>
	<Editable edit={config.messageEdit?.('jobs_newsletterNudge')} value={msg.jobs_newsletterNudge()}>
		{#snippet children(text, attrs)}<p class="nudge" {...attrs}>{text}</p>{/snippet}
	</Editable>
{:else}
	<ul>
		{#each jobs as job (job.slug)}
			{@const edit = editFor?.(job)}
			<li>
				<Editable edit={edit?.title} value={job.title}>
					{#snippet children(text, attrs)}<h3 {...attrs}>{text}</h3>{/snippet}
				</Editable>
				<DateText value={job.postedOn} />
				{#if job.description}
					<Editable edit={edit?.description} value={job.description}>
						{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
					</Editable>
				{/if}
			</li>
		{/each}
	</ul>
	<Editable edit={config.messageEdit?.('jobs_newsletterNudge')} value={msg.jobs_newsletterNudge()}>
		{#snippet children(text, attrs)}<p class="nudge" {...attrs}>{text}</p>{/snippet}
	</Editable>
{/if}

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	li {
		background: var(--color-band-grey);
		border-radius: var(--radius);
		padding: var(--space-3) var(--space-4);
	}

	h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	li p {
		margin: var(--space-2) 0 0;
		color: var(--color-ink-secondary);
	}

	.empty {
		font-weight: 600;
	}

	.nudge {
		color: var(--color-ink-secondary);
	}
</style>
