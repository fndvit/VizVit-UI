/**
 * The contract, without the components: the vocabularies and the one reading
 * rule a host needs on the SERVER, where a `.svelte` import cannot go.
 *
 * Every other subpath mixes the two. `./edit` exports `localize` beside
 * `Editable.svelte`; `./config` exports `LOCALES` and `BASE_LOCALE` beside
 * `UiProvider.svelte`; `./content` exports `REACTIONS` beside the cards. A
 * host whose server code wants those VALUES has to import the barrel that
 * drags a component graph into a server bundle, so vit-brain imported the
 * types only and restated the values: `WEBSITE_LOCALES`, `CANONICAL_LOCALE`,
 * its own `REACTIONS`, and a `hasLocalizedText` re-derived from `localize`'s
 * body — four facts this package owns, one of them (the canonical locale)
 * with no binding at all.
 *
 * So this subpath is the seam that restatement was standing in for. It is
 * component-free BY TEST (`contract.test.ts` walks its import graph), which
 * is what makes it a promise rather than a description: adding a `.svelte`
 * anywhere beneath it fails here rather than in a consumer's server build.
 *
 * It adds nothing. Every name below is already exported from a semantic
 * subpath and stays there — this is a second door into the same rooms, not a
 * new floor, and the barrel remains the surface a component host reads.
 *
 * It was cut to fit ONE consumer, and the second one did not fit through it.
 * vit-brain's four restatements were the motive, so the first version carried
 * the locale vocabulary, the edit contract and REACTIONS — and of the fifteen
 * names fndvit-website's SERVER modules take from the barrel, it covered
 * exactly one. Its `schemas/{common,auth,comment,contact}.ts` and
 * `remote/result.ts` are read by `server/auth.ts`, `server/form-action.ts` and
 * eleven repositories, so that site reaches a sixty-component graph to obtain
 * string bounds and a hidden field's name.
 *
 * The fix moved no files, which is the tell that the seam was in the right
 * place and merely too narrow: `forms/constraints.ts`, `forms/transport.ts`,
 * `forms/types.ts` and `utils/paths.ts` were ALREADY component-free leaves —
 * they import nothing but `content/types.js`, or nothing at all. They were
 * what this subpath promises, with no door onto them. Now there is one, and
 * the guard walks them like the rest.
 */

export { LOCALES, BASE_LOCALE } from './config/types.js';
export type {
	Locale,
	NotParameterized,
	ParameterizedKey,
	ParameterlessKey,
	SiteLink,
	UiMessages
} from './config/types.js';

export { localize } from './edit/types.js';
export type {
	CollectionRef,
	ContentRef,
	EditableEntity,
	EditDescriptor,
	EntityOp,
	LocalizedText,
	PropertyDescriptor,
	PropertyOption,
	PropertyType,
	PropertyValue
} from './edit/types.js';

export { REACTIONS } from './content/types.js';
export type { Reaction, ReactionSummary, SortDirection } from './content/types.js';

// The two content vocabularies a host's zod enum derives from, the way its
// contact form already derives from CONTACT_CATEGORIES below. Values, because
// a type cannot be the source of an enum.
export { MILESTONE_CATEGORIES, PROJECT_KINDS } from './content/types.js';
export type { MilestoneCategory, ProjectKind } from './content/types.js';

export { WEEKLY_LIST_DEFAULTS } from './utils/weekly-list-contract.js';
export type {
	WeeklyListFilters,
	WeeklyListPage,
	WeeklyListServerData
} from './utils/weekly-list-contract.js';

export { CONTACT_CATEGORIES } from './content/types.js';
export type { ContactCategory, FieldConstraint, FormFailReason } from './content/types.js';

export {
	COMMENT_BODY,
	CONTACT_MESSAGE,
	CONTACT_NAME,
	DISPLAY_NAME,
	EMAIL,
	LOGIN_PASSWORD,
	PASSWORD
} from './forms/constraints.js';

export {
	hasNewsletterIntent,
	HONEYPOT_FIELD,
	isNewsletterIntent,
	NEWSLETTER_INTENT_PARAM,
	NEWSLETTER_INTENT_VALUE,
	withNewsletterIntent
} from './forms/transport.js';

export type {
	FormFail,
	FormFieldIssue,
	FormResultLike,
	FormResultOf,
	KeyedRemoteForms,
	RemoteField,
	RemoteFormAttributes,
	RemoteFormInstance
} from './forms/types.js';

export { buildQueryString, isExternalUrl, isInternalPath, isPathUnder } from './utils/paths.js';

/**
 * The descriptor factories. `edit/helpers.ts` imports nothing but types from
 * two modules this subpath already anchors, so it needed a door rather than a
 * split.
 *
 * They were reachable only beside the components, which cost vit-brain an
 * eslint exception that switched `no-restricted-imports` off WHOLESALE for the
 * two files calling one factory each — and one of those, `mirror.ts`, is
 * already reached from a server repository by `import type`. A per-specifier
 * door replaces a per-file hole.
 */
export {
	chromeEdit,
	chromeProperty,
	collectionOf,
	entityEdit,
	entityProperty,
	pageCopyEdit
} from './edit/helpers.js';
