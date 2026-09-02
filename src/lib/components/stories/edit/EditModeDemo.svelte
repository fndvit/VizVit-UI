<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import { collectionOf, entityEdit, entityProperty, pageCopyEdit } from '../../../edit/helpers.js';
	import type { EditDescriptor, EntityOp, PropertyDescriptor } from '../../../edit/types.js';
	import type { MilestoneData } from '../../../content/types.js';
	import { sampleMember, sampleMilestones, sampleWeekly } from '../../../fixtures.js';
	import CopyIntro from '../../ui/CopyIntro.svelte';
	import RichText from '../../ui/RichText.svelte';
	import TeamMemberCard from '../../team/TeamMemberCard.svelte';
	import Timeline from '../../timeline/Timeline.svelte';
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
	// The timeline's rows live in demo state so applyOp visibly mutates them.
	let milestones = $state<MilestoneData[]>([...sampleMilestones]);
	let nextId = $state(1000);

	function nameOf(ref: EditDescriptor['ref']): string {
		return ref.kind === 'page-copy'
			? `${ref.page}.${ref.sectionKey}`
			: ref.kind === 'chrome'
				? `chrome.${ref.key}`
				: `${ref.entity}#${ref.id}.${ref.field}`;
	}

	// The living spec of the full adapter: text saves, panel properties,
	// structural ops and image upload, all in memory.
	setEditAdapter({
		get isEditing() {
			return isEditing;
		},
		save: async (descriptor: EditDescriptor, value: string) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			if (failing) throw new Error('demo failure');
			log = [...log, `${nameOf(descriptor.ref)} [${descriptor.locale}] ← "${value}"`];
		},
		saveProperty: async (descriptor: PropertyDescriptor, value: string | null) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			if (failing) throw new Error('demo failure');
			const ref = descriptor.ref;
			if (ref.kind === 'entity' && ref.entity === 'milestones') {
				const FIELDS = {
					occurred_on: 'occurredOn',
					category: 'category',
					link_url: 'linkUrl'
				} as const;
				const field = FIELDS[ref.field as keyof typeof FIELDS];
				if (field) {
					milestones = milestones
						.map((m) => (m.id === ref.id ? { ...m, [field]: value } : m))
						.sort((a, b) => a.occurredOn.localeCompare(b.occurredOn));
				}
			}
			log = [...log, `${nameOf(ref)} ← ${value === null ? 'null' : `"${value}"`}`];
		},
		applyOp: async (op: EntityOp) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			if (failing) throw new Error('demo failure');
			if (op.kind === 'create') {
				const anchorIndex = op.anchor
					? milestones.findIndex((m) => m.id === op.anchor?.id)
					: milestones.length;
				const created: MilestoneData = {
					id: (nextId += 1),
					occurredOn: milestones[anchorIndex]?.occurredOn ?? '2026-01-01',
					category: 'foundation',
					title: 'Nova fita',
					body: null,
					imageUrls: [],
					linkUrl: null
				};
				milestones = milestones.toSpliced(
					anchorIndex === -1 ? milestones.length : anchorIndex,
					0,
					created
				);
				log = [...log, `+ ${op.collection.entity}#${created.id}`];
				return { id: created.id };
			}
			if (op.kind === 'remove') {
				milestones = milestones.filter((m) => m.id !== op.id);
				log = [...log, `− ${op.collection.entity}#${op.id}`];
			}
		},
		uploadImage: async (_descriptor: PropertyDescriptor, file: File) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			if (failing) throw new Error('demo failure');
			return URL.createObjectURL(file);
		}
	});

	function milestoneEditMap(milestone: MilestoneData) {
		const property = entityProperty('milestones', milestone.id);
		const edit = entityEdit('milestones', milestone.id, 'ca');
		return {
			title: edit('title', { label: 'Títol de la fita' }),
			body: edit('body', { format: 'multiline', label: 'Cos de la fita' }),
			label: `Fita: ${milestone.title}`,
			occurredOn: property('occurred_on', { type: 'date' as const, label: 'Data' }),
			category: property('category', { type: 'select' as const, label: 'Categoria' }),
			linkUrl: property('link_url', { type: 'url' as const, label: 'Enllaç', nullable: true }),
			image: property('image_url', { type: 'image' as const, label: 'Imatge' })
		};
	}

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

	<Timeline
		{milestones}
		variant="full"
		collection={collectionOf('milestones')}
		editFor={milestoneEditMap}
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
