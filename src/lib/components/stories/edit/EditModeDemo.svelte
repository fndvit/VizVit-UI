<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import { entityEdit, pageCopyEdit } from '../../../edit/helpers.js';
	import type { EditDescriptor } from '../../../edit/types.js';
	import { sampleMember, sampleWeekly } from '../../../fixtures.js';
	import CopyIntro from '../../ui/CopyIntro.svelte';
	import RichText from '../../ui/RichText.svelte';
	import TeamMemberCard from '../../team/TeamMemberCard.svelte';
	import WeeklieCard from '../../weeklies/WeeklieCard.svelte';

	/**
	 * The whole edit-mode loop with an in-memory adapter: toggle editing,
	 * click into any outlined text, and watch the save log fill in — exactly
	 * what a CMS app wires up with a real backend behind `save`.
	 */
	interface Props {
		/** Every save rejects, to show the error affordance. */
		failing?: boolean;
	}

	let { failing = false }: Props = $props();

	let isEditing = $state(true);
	let log = $state<string[]>([]);

	setEditAdapter({
		get isEditing() {
			return isEditing;
		},
		save: async (descriptor: EditDescriptor, value: string) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			if (failing) throw new Error('demo failure');
			const ref = descriptor.ref;
			const target =
				ref.kind === 'page-copy'
					? `${ref.page}.${ref.sectionKey}`
					: ref.kind === 'chrome'
						? `chrome.${ref.key}`
						: `${ref.entity}#${ref.id}.${ref.field}`;
			log = [...log, `${target} [${descriptor.locale}] ← "${value}"`];
		}
	});

	const richBody = '## Sobre el projecte\n\nUn paràgraf editable amb el format de blocs.';

	const weeklyEdit = entityEdit('weeklies', sampleWeekly.id, 'ca');
	const memberEdit = entityEdit('team_members', sampleMember.slug, 'ca');
</script>

<div class="demo">
	<label class="toggle">
		<input type="checkbox" bind:checked={isEditing} />
		Mode edició
	</label>

	<CopyIntro
		text="Fem la informació pública transparent i comprensible."
		edit={pageCopyEdit('home', 'intro', 'ca', { label: 'Introducció de la portada' })}
	/>

	<div class="cards">
		<WeeklieCard
			weekly={sampleWeekly}
			edit={{
				title: weeklyEdit('title', { label: 'Títol del weekly' }),
				excerpt: weeklyEdit('excerpt', { format: 'multiline', label: 'Resum del weekly' })
			}}
		/>
		<TeamMemberCard
			member={sampleMember}
			edit={{
				role: memberEdit('role', { label: 'Càrrec' }),
				bio: memberEdit('bio', { format: 'multiline', label: 'Biografia' })
			}}
		/>
	</div>

	<RichText
		body={richBody}
		edit={weeklyEdit('body', { format: 'richtext', label: 'Cos del weekly' })}
	/>

	{#if log.length > 0}
		<div class="log">
			<h4>Desats</h4>
			<ol>
				{#each log as entry, index (index)}
					<li><code>{entry}</code></li>
				{/each}
			</ol>
		</div>
	{/if}
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 48rem;
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 600;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.log {
		border-top: 1px solid var(--color-hairline);
		padding-top: var(--space-3);
	}

	.log h4 {
		margin: 0 0 var(--space-2);
	}

	.log ol {
		margin: 0;
		padding-left: var(--space-4);
	}
</style>
