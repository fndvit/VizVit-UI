<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import { EDIT_CHROME } from '../../../edit/live/index.js';
	import { collectionOf } from '../../../edit/helpers.js';
	import type { RecordTarget } from '../../../edit/types.js';
	import type { TeamMemberData } from '../../../content/types.js';
	import { sampleTeam } from '../../../fixtures.js';
	import TeamFigureField from '../../team/TeamFigureField.svelte';
	import type { TeamMemberEditMap } from '../../team/TeamMemberCard.svelte';

	/**
	 * The figure's whole editing loop with an in-memory adapter: open a
	 * member's panel, change a pose or a number, and watch the figure redraw —
	 * what a CMS wires up with a real row behind `saveProperty`. The pencil
	 * and the add slot call `openRecord`, which a CMS answers with its own
	 * form; here it only logs the target. The selects'
	 * options are worded here, inline, the way a host words them.
	 *
	 * On a wide canvas every figure can be dragged, nudged from its grip with
	 * the arrow keys, resized from its corner or sent a layer up or down:
	 * `savePlacement` writes the patch into the row, and the log shows it.
	 */
	let isEditing = $state(true);
	let members = $state<TeamMemberData[]>(sampleTeam.map((m, index) => ({ ...m, id: index + 1 })));
	let log = $state<string[]>([]);

	setEditAdapter(
		{
			get isEditing() {
				return isEditing;
			},
			save: async () => {},
			openRecord: (target: RecordTarget) => {
				log = [
					...log,
					target.id === undefined
						? `obre la fitxa d’un ${target.entity} nou`
						: `obre la fitxa de ${target.entity}#${target.id}`
				];
			},
			savePlacement: async (target, placement) => {
				members = members.map((m) =>
					m.id === target.id
						? {
								...m,
								...(placement.x !== undefined && { figureX: placement.x }),
								...(placement.y !== undefined && { figureY: placement.y }),
								...(placement.z !== undefined && { figureZ: placement.z }),
								...(placement.size !== undefined && { figureSize: placement.size })
							}
						: m
				);
				log = [...log, `place ${target.entity}#${target.id} ${JSON.stringify(placement)}`];
			},
			applyOp: async (op) => {
				if (op.kind === 'remove') members = members.filter((m) => m.id !== op.id);
				log = [...log, `${op.kind} ${op.collection.entity}${'id' in op ? `#${op.id}` : ''}`];
			}
		},
		EDIT_CHROME
	);

	function editFor(member: TeamMemberData): TeamMemberEditMap {
		const id = member.id ?? member.slug;
		return {
			label: member.name,
			record: { entity: 'team_members', id }
		};
	}
</script>

<div class="demo">
	<label class="toggle">
		<input type="checkbox" bind:checked={isEditing} />
		Mode edició
	</label>

	<TeamFigureField {members} {editFor} collection={collectionOf('team_members')} />

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
