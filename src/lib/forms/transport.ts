/**
 * The form-transport constants shared between this package's markup and the
 * host app's server envelope. The package owns them so the two halves are
 * joined by an import rather than by a string typed twice: a hidden field
 * whose name drifts from the value the server checks fails silently, which
 * is the exact defect these modules exist to prevent.
 */

/**
 * The honeypot field's name. Rendered hidden by Honeypot.svelte; a value in
 * it means a bot. The host app's schemas declare the field under this name
 * and its form envelope checks it before running any handler.
 */
export const HONEYPOT_FIELD = 'website';

/**
 * The newsletter intent as it travels in a URL or a hidden field. The value
 * is what the host app's schema accepts (`z.literal(NEWSLETTER_INTENT_VALUE)`);
 * the param is the query key the auth pages read.
 */
export const NEWSLETTER_INTENT_PARAM = 'newsletter';
export const NEWSLETTER_INTENT_VALUE = '1';

/** True when a raw transport value — a URL param, a cookie — carries intent. */
export function isNewsletterIntent(value: string | null | undefined): boolean {
	return value === NEWSLETTER_INTENT_VALUE;
}

/** True when the URL arrived from a newsletter prompt (?newsletter=1). */
export function hasNewsletterIntent(url: URL): boolean {
	return isNewsletterIntent(url.searchParams.get(NEWSLETTER_INTENT_PARAM));
}

/** An auth-page path carrying the intent: '/signup' → '/signup?newsletter=1'. */
export function withNewsletterIntent(path: string): string {
	return `${path}?${NEWSLETTER_INTENT_PARAM}=${NEWSLETTER_INTENT_VALUE}`;
}
