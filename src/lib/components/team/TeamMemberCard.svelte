<script module lang="ts">
	import type { EditDescriptor, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * Which of the card's fields are editable at this render site. `name` and
	 * `photo` are plain (non-localized) columns, so they edit through the
	 * frame's PANEL — the per-locale inline contract does not apply to them.
	 */
	export interface TeamMemberEditMap {
		role?: EditDescriptor;
		bio?: EditDescriptor;
		name?: PropertyDescriptor;
		photo?: PropertyDescriptor;
		/** Accessible name for the frame — usually the member's name. */
		label?: string;
	}
</script>

<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import CardMedia from '../ui/CardMedia.svelte';

	interface Props {
		member: TeamMemberData;
		/** 'featured' = big cut-out figures; 'board' = compact grid cell. */
		variant?: 'featured' | 'board';
		/** Marks fields editable where an edit adapter is active. */
		edit?: TeamMemberEditMap;
	}

	let { member, variant = 'board', edit }: Props = $props();

	const panelRows = $derived(
		[
			edit?.name && { descriptor: edit.name, value: member.name },
			edit?.photo && { descriptor: edit.photo, value: member.photoUrl }
		].filter((row) => row !== undefined)
	);
	const frameSpec = $derived(
		edit && panelRows.length > 0 ? { label: edit.label ?? member.name, hasPanel: true } : undefined
	);
</script>

<article class={variant}>
	<!-- Inside the article — see WeeklieCard. -->
	<EditFrame spec={frameSpec}>
		{#snippet panel()}
			<EditPanel rows={panelRows} />
		{/snippet}
		<CardMedia
			src={member.photoUrl}
			alt={member.name}
			ratio={variant === 'featured' ? '4 / 5' : '1 / 1'}
			width="400"
			height="500"
		/>
		<h3>{member.name}</h3>
		<Editable edit={edit?.role} value={member.role}>
			{#snippet children(text, attrs)}<p class="role" {...attrs}>{text}</p>{/snippet}
		</Editable>
		{#if member.bio}
			<Editable edit={edit?.bio} value={member.bio}>
				{#snippet children(text, attrs)}<p class="bio" {...attrs}>{text}</p>{/snippet}
			</Editable>
		{/if}
	</EditFrame>
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	h3 {
		margin: var(--space-2) 0 0;
		font-size: var(--text-base);
	}

	.featured h3 {
		font-size: var(--text-lg);
	}

	.role {
		margin: 0;
		font-weight: 600;
		color: var(--color-brand);
		font-size: var(--text-sm);
	}

	.bio {
		margin: 0;
		color: var(--color-ink-secondary);
		font-size: var(--text-sm);
	}
</style>
