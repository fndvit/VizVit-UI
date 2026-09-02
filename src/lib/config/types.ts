// Type-only and erased at compile time, so the config ↔ edit type cycle is
// harmless — edit/types.js imports Locale from here the same way.
import type { EditDescriptor } from '../edit/types.js';
import type { EditMessages } from './edit-messages.js';

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
	/** Present only where the nav is editable — structural ops need identity. */
	id?: string | number;
	href: string;
	label: string;
	/** The row's sort_order, for the CMS's order panel row. */
	order?: number;
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
	login_title(): string;
	login_emailLabel(): string;
	login_passwordLabel(): string;
	login_submit(): string;
	login_divider(): string;
	login_magicLinkSubmit(): string;
	login_magicLinkSuccess(): string;
	login_googleSubmit(): string;
	login_error_invalidCredentials(): string;
	signup_title(): string;
	signup_nameLabel(): string;
	signup_passwordLabel(): string;
	signup_newsletterLabel(): string;
	signup_submit(): string;
	signup_success(): string;
	signup_termsPre(): string;
	signup_termsLink(): string;
	auth_tabsLabel(): string;
	auth_legalNotePre(): string;
	account_nameHeading(): string;
	account_nameLabel(): string;
	account_nameSubmit(): string;
	account_nameSuccess(): string;
	account_newsletterHeading(): string;
	account_newsletterStatusOn(params: { email: string }): string;
	account_newsletterStatusOff(): string;
	account_newsletterSubscribe(): string;
	account_newsletterUnsubscribe(): string;
	account_newsletterSuccessOn(): string;
	account_newsletterSuccessOff(): string;
	account_dataHeading(): string;
	account_dataDescription(): string;
	account_dataDownload(): string;
	account_logout(): string;
	account_deleteHeading(): string;
	account_deleteWarning(): string;
	account_deleteConfirmLabel(): string;
	account_deleteSubmit(): string;
	account_error_unavailable(): string;
	newsletter_title(): string;
	newsletter_intro(): string;
	newsletter_promptLoggedOut(): string;
	newsletter_subscribedNote(): string;
	comments_title(): string;
	comments_empty(): string;
	comments_bodyLabel(): string;
	comments_submit(): string;
	comments_replyLabel(): string;
	comments_replySubmit(): string;
	comments_loginPrompt(): string;
	comments_loginLink(): string;
	comments_signupLink(): string;
	/**
	 * OPTIONAL — the login/signup destinations, added after the catalogs these
	 * components first shipped with. A host without the keys keeps the
	 * built-in /login and /signup paths, byte-identically.
	 */
	comments_loginLinkHref?(): string;
	comments_signupLinkHref?(): string;
	reaction_like(): string;
	reaction_love(): string;
	reaction_clap(): string;
	reactions_groupLabel(): string;
	contact_categoryLabel(): string;
	contact_nameLabel(): string;
	contact_emailLabel(): string;
	contact_messageLabel(): string;
	contact_submit(): string;
	contact_success(): string;
	contact_invalid(): string;
	contact_category_collaborate(): string;
	contact_category_event(): string;
	contact_category_press(): string;
	contact_category_brand(): string;
	contact_category_other(): string;
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
	/**
	 * The editor chrome's own strings (status announcements, panel wording) —
	 * resolved, Catalan by default. NOT part of `messages`: see
	 * `./edit-messages.js` for why the two catalogs must not mix.
	 */
	editMessages: EditMessages;
	/**
	 * Edit descriptor for one of THIS config's message strings, by catalog
	 * key — the interface-wording half of edit mode. Optional and undefined by
	 * default, so a read-only app (and every story/test) renders the messages
	 * as plain text. A CMS-shaped host supplies it alongside an EditAdapter;
	 * components offer only their parameterless, plain-text message sites.
	 */
	messageEdit?: (key: string) => EditDescriptor | undefined;
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
	editMessages?: EditMessages;
	messageEdit?: UiConfig['messageEdit'];
}
