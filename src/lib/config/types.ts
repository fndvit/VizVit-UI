/**
 * The site's locales and their canonical member. Fixed rather than generic:
 * `ca` is load-bearing — it is the required key of every localized column
 * (see LocalizedText in ../edit/types.js) and the fallback `localize()`
 * resolves to — so widening the set is a deliberate package change, not a
 * consumer option.
 */
export const LOCALES = ['ca', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const BASE_LOCALE: Locale = 'ca';

/** One primary-navigation entry, rendered by Nav and repeated by Footer. */
export interface SiteLink {
	href: string;
	label: string;
}

/**
 * The strings the components render, as message *functions* so the app's
 * i18n runtime resolves the active locale at call time. The shape is a
 * structural subset of a Paraglide `messages` module — an app that compiles
 * these keys can pass its `m` object wholesale.
 *
 * Keys consumed only through this package still count as used: an app
 * pruning its message catalogue must keep every key named here.
 */
export interface UiMessages {
	common_readMore(): string;
	pagination_label(): string;
	pagination_previous(): string;
	pagination_next(): string;
	pagination_status(params: { page: number; pages: number }): string;
	share_label(): string;
	share_copyLink(): string;
	share_copied(): string;
	form_error_generic(): string;
	form_error_rateLimited(): string;
	form_error_unauthenticated(): string;
	form_error_forbidden(): string;
	form_error_unavailable(): string;
	weeklie_number(params: { number: number }): string;
	weeklies_sortLabel(): string;
	weeklies_sortDesc(): string;
	weeklies_sortAsc(): string;
	timeline_label(): string;
	nav_mainLabel(): string;
	nav_home(): string;
	nav_menuLabel(): string;
	account_navLabel(): string;
	lang_switcherLabel(): string;
	footer_rights(): string;
	jobs_empty(): string;
	jobs_newsletterNudge(): string;
	category_foundation(): string;
	category_lab(): string;
	category_education(): string;
	category_collaboration(): string;
	category_press(): string;
}

/**
 * Everything the components read from their host app, resolved. Apps provide
 * a partial (`UiConfigInput`) through UiProvider; components read this
 * through `getUiConfig()`, which fills the gaps with identity/Catalan
 * defaults so the package renders standalone (stories, tests, previews).
 *
 * `locale()` and `url()` are function reads, not snapshots, so the provider's
 * reactive sources (an i18n runtime, the router's current URL) flow through:
 * a provider that passes a captured value freezes locale switching and
 * current-page highlighting.
 */
export interface UiConfig {
	/** Resolve a canonical internal path to a final href (e.g. locale prefixing). */
	href(path: string, options?: { locale?: Locale }): string;
	/** The locale being rendered. Reactive read. */
	locale(): Locale;
	locales: readonly Locale[];
	/** The URL being rendered, when the app has a router to ask. Reactive read. */
	url(): URL | undefined;
	/** Canonical (de-localized) pathname of a URL, for current-page checks. */
	canonicalPathname(url: URL): string;
	/** Appended to document titles and shown as the wordmark. */
	siteName: string;
	messages: UiMessages;
}

/** What an app hands UiProvider: any subset; the rest keeps package defaults. */
export interface UiConfigInput {
	href?: UiConfig['href'];
	locale?: UiConfig['locale'];
	locales?: readonly Locale[];
	url?: UiConfig['url'];
	canonicalPathname?: UiConfig['canonicalPathname'];
	siteName?: string;
	messages?: UiMessages;
}
