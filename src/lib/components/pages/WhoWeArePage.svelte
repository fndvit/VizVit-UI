<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { CollaboratorData, TeamMemberData } from '../../content/types.js';
	import type { CollectionRef } from '../../edit/types.js';
	import type { CollaboratorEditMap } from '../team/CollaboratorList.svelte';
	import type { TeamMemberEditMap } from '../team/TeamMemberCard.svelte';

	/**
	 * What a CMS may open on /who-we-are. `memberFor` answers per row, so a
	 * host reads the identity it put on `TeamMemberData.id`; `collaborators`
	 * names the list's collection, which turns on its add slot and removes.
	 */
	export interface WhoWeArePageEdit {
		copy?: CopyEditFor<'who-we-are'>;
		memberFor?: (member: TeamMemberData) => TeamMemberEditMap | undefined;
		collaboratorFor?: (collaborator: CollaboratorData) => CollaboratorEditMap | undefined;
		collaborators?: CollectionRef;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { PageCopy } from '../../content/pages.js';
	import Editable from '../../edit/Editable.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import CollaboratorList from '../team/CollaboratorList.svelte';
	import TeamMemberCard from '../team/TeamMemberCard.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';

	/**
	 * The team page: the featured members, the board, the collaborators. The
	 * split into `featured` and `board` is the website's load's (one `isBoard`
	 * filter each), so the module takes the two lists rather than re-deciding.
	 */
	interface Props {
		content: PageCopy<'who-we-are'>;
		featured: TeamMemberData[];
		board: TeamMemberData[];
		collaborators: CollaboratorData[];
		edit?: WhoWeArePageEdit;
	}

	let { content, featured, board, collaborators, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

<PageShell title={msg.nav_whoWeAre()}>
	<Editable edit={config.messageEdit?.('nav_whoWeAre')} value={msg.nav_whoWeAre()}>
		{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
	</Editable>

	<section aria-labelledby="team-heading">
		<Editable edit={edit?.copy?.('team_heading')} value={content.team_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="team-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.team_intro} edit={edit?.copy?.('team_intro')} />
		<div class="featured">
			{#each featured as member (member.slug)}
				<TeamMemberCard {member} variant="featured" edit={edit?.memberFor?.(member)} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="board-heading">
		<Editable edit={edit?.copy?.('board_heading')} value={content.board_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="board-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.board_intro} edit={edit?.copy?.('board_intro')} />
		<div class="board">
			{#each board as member (member.slug)}
				<TeamMemberCard {member} variant="board" edit={edit?.memberFor?.(member)} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="collaborators-heading">
		<Editable edit={edit?.copy?.('collaborators_heading')} value={content.collaborators_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="collaborators-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CollaboratorList
			{collaborators}
			editFor={edit?.collaboratorFor}
			collection={edit?.collaborators}
		/>
	</section>
</PageShell>

<style>
	.featured {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: var(--space-4);
	}

	.board {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
		gap: var(--space-4);
	}
</style>
