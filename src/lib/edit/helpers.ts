import type { Locale } from '../config/types.js';
import type { EditableEntity, EditDescriptor } from './types.js';

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
