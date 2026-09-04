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
