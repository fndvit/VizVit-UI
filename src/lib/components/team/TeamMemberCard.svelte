<script module lang="ts">
	import type { EditDescriptor } from '../../edit/types.js';

	/**
	 * Which of the card's localized fields are editable at this render site.
	 * `name` is deliberately absent: it is a plain-text column, not a
	 * localized one, so the per-locale save contract does not apply to it.
	 */
	export interface TeamMemberEditMap {
		role?: EditDescriptor;
		bio?: EditDescriptor;
	}
</script>

<script lang="ts">
	import type { TeamMemberData } from '../../content/types.js';
	import Editable from '../../edit/Editable.svelte';
	import CardMedia from '../ui/CardMedia.svelte';

	interface Props {
		member: TeamMemberData;
		/** 'featured' = big cut-out figures; 'board' = compact grid cell. */
		variant?: 'featured' | 'board';
		/** Marks fields editable where an edit adapter is active. */
		edit?: TeamMemberEditMap;
	}

	let { member, variant = 'board', edit }: Props = $props();
</script>

<article class={variant}>
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
