import type { Locale } from '../config/types.js';

/**
 * The stored shape of one localized text column (`jsonb` keyed by locale).
 * Catalan is canonical and required — the database enforces `content ? 'ca'`
 * on every localized column, and this type states the same rule to writers.
 */
export interface LocalizedText {
	ca: string;
	en?: string;
	es?: string;
}

/** One locale's reading of a localized value, falling back to Catalan. */
export function localize(value: LocalizedText, locale: Locale): string {
	return value[locale] || value.ca;
}

/**
 * The entities whose fields the components can mark editable. Names match
 * the content tables so an adapter can route a save without a mapping layer.
 */
export type EditableEntity =
	'weeklies' | 'projects' | 'milestones' | 'team_members' | 'job_openings' | 'themes';

/**
 * The identity of one editable string in the content model: a page copy
 * block (`page_content` row), one localized field of a domain entity, or one
 * interface-wording message (`chrome`) — a Paraglide catalog key. What a
 * chrome save MEANS is the host's decision, like every other ref: the
 * foundation CMS writes the website's `ui_messages` table, from which the
 * catalogs are regenerated at deploy.
 */
export type ContentRef =
	| { kind: 'page-copy'; page: string; sectionKey: string }
	| { kind: 'entity'; entity: EditableEntity; id: string | number; field: string }
	| { kind: 'chrome'; key: string };

/** What a component hands the adapter alongside the new value. */
export interface EditDescriptor {
	ref: ContentRef;
	/** The translation this save writes — one locale per save. */
	locale: Locale;
	/**
	 * 'text' commits on Enter and forbids newlines; 'multiline' commits on
	 * Cmd/Ctrl+Enter; 'richtext' is the block mini-format (RichText renders
	 * its own textarea editor for it).
	 */
	format?: 'text' | 'multiline' | 'richtext';
	/** Accessible name for the edit control, e.g. "Títol del weekly #12". */
	label?: string;
}

/**
 * The value kinds a property panel can edit. Everything in this content model
 * serializes to a string on the wire — an ISO date, a URL, an enum member, a
 * storage path — so there is no typed value union: the ADAPTER parses, and
 * the host's schemas stay the sole validators.
 */
export type PropertyType = 'text' | 'url' | 'date' | 'select' | 'image';

/** One choice of a `select` property. */
export interface PropertyOption {
	value: string;
	label: string;
}

/**
 * Identity + shape of one panel-edited property. Unlike `EditDescriptor`,
 * `locale` is optional: dates, urls, enum members and image paths are not
 * localized, and its absence says so to the adapter.
 */
export interface PropertyDescriptor {
	ref: ContentRef;
	/** Present only for localized text properties. */
	locale?: Locale;
	type: PropertyType;
	/** Panel row label — required, the panel renders it. */
	label: string;
	/** Required when `type` is 'select'. */
	options?: readonly PropertyOption[];
	placeholder?: string;
	/** Clearing the field saves null (linkUrl, externalUrl). */
	nullable?: boolean;
}

/**
 * Names one entity collection at one render site. `scope` disambiguates when
 * the same entity renders in several lists (a board grid vs. a full roster).
 */
export interface CollectionRef {
	entity: EditableEntity;
	scope?: string;
}

/**
 * A structural collection operation. Deliberately WITHOUT an `update` verb:
 * field values always travel through `save`/`saveProperty` — one save path
 * per value — and ops stay purely about existence and order.
 */
export type EntityOp =
	| {
			kind: 'create';
			collection: CollectionRef;
			anchor?: { id: string | number; placement: 'before' | 'after' };
	  }
	| { kind: 'remove'; collection: CollectionRef; id: string | number }
	| {
			kind: 'reorder';
			collection: CollectionRef;
			id: string | number;
			anchor: { id: string | number; placement: 'before' | 'after' };
	  };

/**
 * What a consuming app plugs in to make the components writable. The package
 * never talks to a database: `save` is the whole persistence contract for
 * inline text, and the three OPTIONAL members below are the property-panel
 * and structural halves — leave them off and the components render no panel
 * or collection affordance at all, byte-identical to a read-only build.
 *
 * Implementations must:
 * - back `isEditing` with reactive state (`$state`) — it gates every edit
 *   affordance live;
 * - merge `{ [descriptor.locale]: value }` into the stored localized column
 *   rather than replacing it;
 * - reject a save that would empty the canonical `ca` value (the database's
 *   `? 'ca'` check makes that a hard error anyway — fail it politely);
 * - resolve when persisted, reject on failure (the editor keeps the draft
 *   and shows the error state).
 */
export interface EditAdapter {
	readonly isEditing: boolean;
	save(descriptor: EditDescriptor, value: string): Promise<void>;
	/**
	 * Panel property save. The value stays a string on the wire (ISO date,
	 * url, enum member, image path); `null` clears a `nullable` property.
	 */
	saveProperty?(descriptor: PropertyDescriptor, value: string | null): Promise<void>;
	/**
	 * Structural collection ops. `create` may resolve the new row's id so the
	 * UI can point at it after the host's refresh.
	 */
	applyOp?(op: EntityOp): Promise<{ id?: string | number } | void>;
	/** Image upload; resolves to the stored path an `image` property saves. */
	uploadImage?(descriptor: PropertyDescriptor, file: File): Promise<string>;
}
