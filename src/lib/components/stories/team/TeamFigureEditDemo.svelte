<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import { EDIT_CHROME } from '../../../edit/live/index.js';
	import { entityEdit, entityProperty } from '../../../edit/helpers.js';
	import type { PropertyDescriptor, PropertyValue } from '../../../edit/types.js';
	import type { TeamMemberData } from '../../../content/types.js';
	import { sampleTeam } from '../../../fixtures.js';
	import {
		ARM_POSES,
		HEAD_MODES,
		LABEL_ALIGNS,
		LABEL_SIDES,
		LEG_POSES
	} from '../../ui/figure/paths.js';
	import TeamFigureField from '../../team/TeamFigureField.svelte';
	import type { TeamMemberEditMap } from '../../team/TeamMemberCard.svelte';

	/**
	 * The figure's whole editing loop with an in-memory adapter: open a
	 * member's panel, change a pose or a number, and watch the figure redraw —
	 * what a CMS wires up with a real row behind `saveProperty`. The selects'
	 * options are worded here, inline, the way a host words them.
	 */
	let isEditing = $state(true);
	let members = $state<TeamMemberData[]>(sampleTeam.map((m, index) => ({ ...m, id: index + 1 })));
	let log = $state<string[]>([]);

	const NUMBERS = new Set(['figureOffset', 'figureHeadScale', 'figureSize']);

	setEditAdapter(
		{
			get isEditing() {
				return isEditing;
			},
			save: async (descriptor, value) => {
				const ref = descriptor.ref;
				if (ref.kind === 'entity') {
					members = members.map((m) => (m.id === ref.id ? { ...m, [ref.field]: value } : m));
					log = [...log, `#${ref.id}.${ref.field} ← "${value}"`];
				}
			},
			saveProperty: async (descriptor: PropertyDescriptor, value: PropertyValue) => {
				const ref = descriptor.ref;
				if (ref.kind !== 'entity') return;
				const field = ref.field === 'photo_url' ? 'photoUrl' : ref.field;
				const next = NUMBERS.has(field) ? Number(value) : value;
				members = members.map((m) => (m.id === ref.id ? { ...m, [field]: next } : m));
				log = [...log, `#${ref.id}.${field} ← ${JSON.stringify(next)}`];
			},
			uploadImage: async (_descriptor, file: File) => URL.createObjectURL(file)
		},
		EDIT_CHROME
	);

	const options = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

	function editFor(member: TeamMemberData): TeamMemberEditMap {
		const id = member.id ?? member.slug;
		const property = entityProperty('team_members', id);
		const edit = entityEdit('team_members', id, 'ca');
		return {
			label: member.name,
			role: edit('role', { label: 'Càrrec' }),
			bio: edit('bio', { format: 'multiline', label: 'Biografia' }),
			name: property('name', { type: 'text', label: 'Nom' }),
			photo: property('photo_url', { type: 'image', label: 'Fotografia' }),
			figureArms: property('figureArms', {
				type: 'select',
				label: 'Braços',
				options: options(ARM_POSES)
			}),
			figureLegs: property('figureLegs', {
				type: 'select',
				label: 'Cames',
				options: options(LEG_POSES)
			}),
			figureHead: property('figureHead', {
				type: 'select',
				label: 'Cap',
				options: options(HEAD_MODES)
			}),
			figureLabelSide: property('figureLabelSide', {
				type: 'select',
				label: 'Costat de l’etiqueta',
				options: options(LABEL_SIDES)
			}),
			figureLabelAlign: property('figureLabelAlign', {
				type: 'select',
				label: 'Alçada de l’etiqueta',
				options: options(LABEL_ALIGNS)
			}),
			figureOffset: property('figureOffset', { type: 'text', label: 'Desplaçament (px)' }),
			figureHeadScale: property('figureHeadScale', { type: 'text', label: 'Escala del cap (%)' }),
			figureSize: property('figureSize', { type: 'text', label: 'Mida (%)' })
		};
	}
</script>

<div class="demo">
	<label class="toggle">
		<input type="checkbox" bind:checked={isEditing} />
		Mode edició
	</label>

	<TeamFigureField {members} {editFor} />

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
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 600;
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
