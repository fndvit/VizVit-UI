<script module lang="ts">
	import type { EntityOp, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * A collaborator is three plain (non-localized) columns, so everything
	 * edits through the frame's PANEL — the per-locale inline contract does
	 * not apply to any of it.
	 */
	export interface CollaboratorEditMap {
		personName?: PropertyDescriptor;
		affiliation?: PropertyDescriptor;
		url?: PropertyDescriptor;
		/** Accessible name for the frame — usually the person's name. */
		label?: string;
		/** Set by the list from its `collection` — removal of this row. */
		removeOp?: Extract<EntityOp, { kind: 'remove' }>;
	}
</script>

<script lang="ts">
	import type { CollaboratorData } from '../../content/types.js';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import type { CollectionRef } from '../../edit/types.js';

	interface Props {
		collaborators: CollaboratorData[];
		/** Edit descriptors per row; returning undefined leaves it read-only. */
		editFor?: (collaborator: CollaboratorData) => CollaboratorEditMap | undefined;
		/**
		 * Names the collection these rows belong to. Set alongside an adapter
		 * with `applyOp`, it turns on the add slot and each frame's remove —
		 * for rows that carry an `id` (removal needs an identity).
		 */
		collection?: CollectionRef;
	}

	let { collaborators, editFor, collection }: Props = $props();

	// The structural half (add slot, removal for rows with an id) — see
	// collectionEditing.
	const list = collectionEditing<CollaboratorData, CollaboratorEditMap>(() => ({
		collection,
		editFor
	}));

	function rowsFor(collaborator: CollaboratorData, map: CollaboratorEditMap | undefined) {
		return [
			map?.personName && { descriptor: map.personName, value: collaborator.personName },
			map?.affiliation && { descriptor: map.affiliation, value: collaborator.affiliation },
			map?.url && { descriptor: map.url, value: collaborator.url }
		].filter((row) => row !== undefined);
	}
</script>

<ul>
	{#each collaborators as collaborator (collaborator.id ?? collaborator.personName + collaborator.affiliation)}
		{@const map = list.mapFor(collaborator)}
		{@const rows = rowsFor(collaborator, map)}
		<li>
			<!-- Inside the li, so the list's own layout never gains a child. -->
			<EditFrame
				spec={map && (rows.length > 0 || map.removeOp)
					? {
							label: map.label ?? collaborator.personName,
							hasPanel: rows.length > 0,
							removeOp: map.removeOp
						}
					: undefined}
			>
				{#snippet panel()}
					<EditPanel {rows} />
				{/snippet}
				<strong>{collaborator.personName}</strong>
				·
				{#if collaborator.url}
					<a href={collaborator.url} rel="external noopener">{collaborator.affiliation}</a>
				{:else}
					{collaborator.affiliation}
				{/if}
			</EditFrame>
		</li>
	{/each}
	{#if list.add}
		<li class="add-slot">
			<AddSlot op={list.add} />
		</li>
	{/if}
</ul>

<style>
	ul {
		margin: 0;
		padding-left: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	a {
		color: var(--color-brand);
	}

	li.add-slot {
		list-style: none;
	}
</style>
