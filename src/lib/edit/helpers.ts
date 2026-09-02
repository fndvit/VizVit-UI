import type { Locale } from '../config/types.js';
import type { CollectionRef, EditableEntity, EditDescriptor, PropertyDescriptor } from './types.js';

/** Everything a property descriptor carries beyond its ref. */
type PropertySpec = Omit<PropertyDescriptor, 'ref'>;

/**
 * Descriptor for one interface-wording message (a Paraglide catalog key).
 * Only parameterless messages are sensibly editable in place — editing the
 * RENDERED text of a parameterized one would overwrite its template.
 */
export function chromeEdit(
	key: string,
	locale: Locale,
	options?: { format?: EditDescriptor['format']; label?: string }
): EditDescriptor {
	return { ref: { kind: 'chrome', key }, locale, ...options };
}

/** Descriptor for one page-copy block (`page_content` row). */
export function pageCopyEdit(
	page: string,
	sectionKey: string,
	locale: Locale,
	options?: { format?: EditDescriptor['format']; label?: string }
): EditDescriptor {
	return { ref: { kind: 'page-copy', page, sectionKey }, locale, ...options };
}

/**
 * Descriptor factory for one entity's fields, so a call site editing several
 * fields of the same row names the row once:
 *
 *   const edit = entityEdit('weeklies', weekly.id, locale);
 *   <WeeklieCard {weekly} edit={{ title: edit('title'), excerpt: edit('excerpt') }} />
 */
export function entityEdit(
	entity: EditableEntity,
	id: string | number,
	locale: Locale
): (
	field: string,
	options?: { format?: EditDescriptor['format']; label?: string }
) => EditDescriptor {
	return (field, options) => ({ ref: { kind: 'entity', entity, id, field }, locale, ...options });
}

/**
 * Property-descriptor factory for one entity's scalar fields — the panel
 * sibling of `entityEdit`, naming the row once:
 *
 *   const property = entityProperty('milestones', milestone.id);
 *   occurredOn: property('occurred_on', { type: 'date', label: 'Data' })
 */
export function entityProperty(
	entity: EditableEntity,
	id: string | number
): (field: string, spec: PropertySpec) => PropertyDescriptor {
	return (field, spec) => ({ ref: { kind: 'entity', entity, id, field }, ...spec });
}

/**
 * A panel property over one interface-wording message — how strings that can
 * never hold a caret (an `<option>` label, an input placeholder) still edit.
 */
export function chromeProperty(key: string, spec: PropertySpec): PropertyDescriptor {
	return { ref: { kind: 'chrome', key }, ...spec };
}

/** Names one entity collection at one render site. */
export function collectionOf(entity: EditableEntity, scope?: string): CollectionRef {
	return scope === undefined ? { entity } : { entity, scope };
}
