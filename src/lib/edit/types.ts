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
	'weeklies' | 'projects' | 'milestones' | 'team_members' | 'job_openings';

/**
 * The identity of one editable string in the content model: either a page
 * copy block (`page_content` row) or one localized field of a domain entity.
 */
export type ContentRef =
	| { kind: 'page-copy'; page: string; sectionKey: string }
	| { kind: 'entity'; entity: EditableEntity; id: string | number; field: string };

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
 * What a consuming app plugs in to make the components writable. The package
 * never talks to a database: `save` is the whole persistence contract.
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
}
