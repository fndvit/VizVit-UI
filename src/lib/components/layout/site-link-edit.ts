import type { EntityOp, PropertyDescriptor } from '../../edit/types.js';

/**
 * What the CMS may edit on one nav/footer link beyond its LABEL (which edits
 * through the existing `editFor` ActionLabel swap): the href and the display
 * order are panel rows, and removal arrives injected by the list from its
 * `collection` — the Timeline/CollaboratorList pattern.
 */
export interface SiteLinkEditMap {
	href?: PropertyDescriptor;
	order?: PropertyDescriptor;
	/** Accessible name for the frame, defaulting to the link's label. */
	label?: string;
	/** Set by the list from its `collection` — removal of this row. */
	removeOp?: Extract<EntityOp, { kind: 'remove' }>;
}
