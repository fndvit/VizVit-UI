import type { EntityOp, PropertyDescriptor } from '../../edit/types.js';

/**
 * What the CMS may edit on one nav/footer link beyond its LABEL: the href and
 * the display order join the label in ONE modal (LinkEdit — clicking the
 * entry opens it), and removal arrives injected by the list from its
 * `collection`. The modal is entered through the label's `editFor`
 * descriptor, so these rows take effect alongside it.
 */
export interface SiteLinkEditMap {
	href?: PropertyDescriptor;
	order?: PropertyDescriptor;
	/** Accessible name for the frame, defaulting to the link's label. */
	label?: string;
	/** Set by the list from its `collection` — removal of this row. */
	removeOp?: Extract<EntityOp, { kind: 'remove' }>;
}
