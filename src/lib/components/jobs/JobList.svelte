<script module lang="ts">
	import type { EditDescriptor, EntityOp, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * Which of one opening's fields are editable at this render site:
	 * localized text inline, the posting date through the frame's panel.
	 */
	export interface JobEditMap {
		title?: EditDescriptor;
		description?: EditDescriptor;
		postedOn?: PropertyDescriptor;
		/** Accessible name for the frame — usually the opening's title. */
		label?: string;
		/** Set by the list from its `collection` — removal of this opening. */
		removeOp?: Extract<EntityOp, { kind: 'remove' }>;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { JobOpeningData } from '../../content/types.js';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import DraftBadge from '../../edit/chrome/DraftBadge.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import { getEditAdapter } from '../../edit/context.js';
	import Editable from '../../edit/Editable.svelte';
	import type { CollectionRef } from '../../edit/types.js';
	import DateText from '../ui/DateText.svelte';

	interface Props {
		jobs: JobOpeningData[];
		/**
		 * Edit descriptors per opening — a function because each row needs its
		 * own identity. Returning undefined leaves that row read-only.
		 */
		editFor?: (job: JobOpeningData) => JobEditMap | undefined;
		/**
		 * Names the collection the openings belong to. Set alongside an adapter
		 * with `applyOp`, it turns on the add slot and each frame's remove —
		 * for rows that carry an `id` (removal needs an identity).
		 */
		collection?: CollectionRef;
	}

	let { jobs, editFor, collection }: Props = $props();

	const config = getUiConfig();
	const adapter = getEditAdapter();
	const msg = $derived(config.messages);

	const structural = $derived(
		collection !== undefined && (adapter?.isEditing ?? false) && adapter?.applyOp !== undefined
	);

	/** The map the host gave, plus removal — the list owns identity. */
	function editMapFor(job: JobOpeningData): JobEditMap | undefined {
		const map = editFor?.(job);
		if (!structural || !collection || job.id === undefined) return map;
		return { ...map, removeOp: { kind: 'remove', collection, id: job.id } };
	}
</script>

{#if jobs.length === 0}
	<Editable edit={config.messageEdit?.('jobs_empty')} value={msg.jobs_empty()}>
		{#snippet children(text, attrs)}<p class="empty" {...attrs}>{text}</p>{/snippet}
	</Editable>
	{#if structural && collection}
		<AddSlot op={{ kind: 'create', collection }} />
	{/if}
	<Editable edit={config.messageEdit?.('jobs_newsletterNudge')} value={msg.jobs_newsletterNudge()}>
		{#snippet children(text, attrs)}<p class="nudge" {...attrs}>{text}</p>{/snippet}
	</Editable>
{:else}
	<ul>
		{#each jobs as job (job.slug)}
			{@const edit = editMapFor(job)}
			{@const rows = [edit?.postedOn && { descriptor: edit.postedOn, value: job.postedOn }].filter(
				(row) => row !== undefined
			)}
			<li>
				<!-- Inside the li — see CollaboratorList. -->
				<EditFrame
					spec={edit && (rows.length > 0 || edit.removeOp)
						? {
								label: edit.label ?? job.title,
								hasPanel: rows.length > 0,
								removeOp: edit.removeOp
							}
						: undefined}
				>
					{#snippet panel()}
						<EditPanel {rows} />
					{/snippet}
					<Editable edit={edit?.title} value={job.title}>
						{#snippet children(text, attrs)}<h3 {...attrs}>{text}</h3>{/snippet}
					</Editable>
					{#if job.draft}<DraftBadge />{/if}
					<DateText value={job.postedOn} />
					{#if job.description}
						<Editable edit={edit?.description} value={job.description}>
							{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
						</Editable>
					{/if}
				</EditFrame>
			</li>
		{/each}
		{#if structural && collection}
			<li class="add-slot">
				<AddSlot op={{ kind: 'create', collection }} />
			</li>
		{/if}
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

	li.add-slot {
		background: none;
		padding: 0;
	}
</style>
