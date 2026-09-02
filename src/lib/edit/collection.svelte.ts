import { getEditAdapter } from './context.js';
import type { CollectionRef, EntityOp } from './types.js';

type CreateOp = Extract<EntityOp, { kind: 'create' }>;
type RemoveOp = Extract<EntityOp, { kind: 'remove' }>;

/** An edit map a list may inject removal into. */
export interface RemovableMap {
	/** Set by the list from its `collection` — removal of this row. */
	removeOp?: RemoveOp;
}

/**
 * The structural half of one editable LIST, as its template reads it.
 * Both members answer `undefined` while the collection is not live, so the
 * template's `{#if}` is the whole gate.
 */
export interface CollectionEditing<Row, Map extends RemovableMap> {
	/** The create op for the add slot at the end of the list. */
	readonly add: CreateOp | undefined;
	/** The create op for an add slot anchored before one row (Timeline). */
	addBefore(id: string | number): CreateOp | undefined;
	/**
	 * The host's map for one row, plus the remove op the LIST injects — lists
	 * own identity, so a host never spells a removal. Rows without an `id`
	 * keep the host's map untouched: a remove op needs an identity, and
	 * read-only hosts never pass one.
	 */
	mapFor(row: Row): Map | undefined;
}

/**
 * What every list with a `collection` prop used to repeat — Timeline,
 * CollaboratorList, JobList, Nav and Footer each carried the triple gate
 * (collection named ∧ adapter editing ∧ `applyOp` present) and the same
 * remove-op injection, five times verbatim. One helper, one place to keep
 * the rule: a structural affordance renders only when all three hold.
 *
 * `read` is a thunk over the list's props so both stay reactive; the
 * adapter comes from context, so call this during component init like
 * `getEditAdapter` itself.
 */
export function collectionEditing<Row extends { id?: string | number }, Map extends RemovableMap>(
	read: () => {
		collection: CollectionRef | undefined;
		/** The host's per-row map (`editFor`, or Nav/Footer's `propertiesFor`). */
		editFor: ((row: Row) => Map | undefined) | undefined;
	}
): CollectionEditing<Row, Map> {
	const adapter = getEditAdapter();

	const live = $derived.by(() => {
		const { collection } = read();
		return collection !== undefined &&
			(adapter?.isEditing ?? false) &&
			adapter?.applyOp !== undefined
			? collection
			: undefined;
	});

	return {
		get add() {
			return live ? { kind: 'create' as const, collection: live } : undefined;
		},
		addBefore(id) {
			return live
				? { kind: 'create', collection: live, anchor: { id, placement: 'before' } }
				: undefined;
		},
		mapFor(row) {
			const map = read().editFor?.(row);
			if (!live || row.id === undefined) return map;
			return { ...(map as Map), removeOp: { kind: 'remove', collection: live, id: row.id } };
		}
	};
}
