import type { EditDescriptor } from '../edit/types.js';

/**
 * Page copy: the editorial blocks of a static page, stored per page and
 * section key in the website's `page_content` table. This module is the
 * only declaration of which keys each page has — the website's `seed.sql`
 * supplies their text and its repository integration test asserts the two
 * agree, so a renamed or dropped row fails that suite instead of silently
 * rendering nothing. vit-brain's `page-copy-keys.test.ts` pins the same set
 * against the live table from the other side.
 *
 * It lived in fndvit-website's `schemas/page-copy.ts` and was restated in
 * vit-brain's `mirror.ts` (with the FORMAT each block edits in — that half
 * stays in brain, ADR-0019). Now that the page modules render from this
 * package, the keys a page reads are the package's fact: a module indexes
 * `copy.hero_title`, so the tuple that makes that compile has to live beside
 * it. Component-free on purpose — `./contract` re-exports it for a host's
 * `+page.server.ts` and a CMS's producer alike.
 *
 * UI chrome (labels, buttons, error messages) is not page copy: it lives in
 * `UiMessages` and ships with the build.
 */

/**
 * The "why get in touch" blocks, rendered as one list on /get-involved.
 *
 * Named because a run of keys being a *group* is a fact about the copy, and it
 * needs the same single owner the keys themselves have: the page used to
 * restate these five, so adding a sixth reason here and to the seed left the
 * page silently ignoring it — no type error, no failing test.
 */
export const GET_INVOLVED_REASON_KEYS = [
	'reason_collaborate',
	'reason_event',
	'reason_press',
	'reason_brand',
	'reason_other'
] as const;

export const PAGE_COPY_KEYS = {
	home: [
		'hero_title',
		'hero_subtitle',
		'milestones_heading',
		'weeklies_heading',
		'weeklies_intro',
		'know_more_heading'
	],
	'what-we-do': [
		'latest_heading',
		'collaborations_heading',
		'collaborations_intro',
		'passion_heading',
		'passion_intro'
	],
	'who-we-are': [
		'team_heading',
		'team_intro',
		'board_heading',
		'board_intro',
		'collaborators_heading'
	],
	weeklies: ['intro'],
	'get-involved': [
		'contact_heading',
		'contact_intro',
		...GET_INVOLVED_REASON_KEYS,
		'funding_heading',
		'funding_body',
		'careers_heading',
		'careers_intro'
	],
	transparency: ['heading', 'intro'],
	legal: ['heading', 'body']
} as const satisfies Record<string, readonly string[]>;

/** A page that has editorial copy. Matches the `page_content.page` column. */
export type PageId = keyof typeof PAGE_COPY_KEYS;

/** The section keys declared for one page. */
export type CopyKey<P extends PageId> = (typeof PAGE_COPY_KEYS)[P][number];

/**
 * One page's copy, one locale already applied. Every declared key is present:
 * a row missing from the database resolves to an empty string rather than
 * `undefined`.
 *
 * The page modules do NOT guard for that empty string. It is not a state the
 * site is meant to render around — the website's repository integration test
 * asserts that every declared key resolves to non-empty copy, so a dropped or
 * renamed row fails the suite. Guarding at the render site instead puts the
 * decision back at every call site, which is what the assertion exists to
 * avoid (the same answer `CopyIntro` gives).
 */
export type PageCopy<P extends PageId> = Record<CopyKey<P>, string>;

/**
 * How a page module asks for one copy block's edit descriptor: by the key it
 * renders, so a module cannot name a block its page does not declare. A
 * read-only host passes nothing; a CMS answers with a `page-copy` ref for the
 * locale being edited (vit-brain's `pageCopyEditor`), or `undefined` to leave
 * one block alone.
 */
export type CopyEditFor<P extends PageId> = (key: CopyKey<P>) => EditDescriptor | undefined;
