import type { Locale } from '../config/types.js';

/** Explicit BCP 47 tags — never rely on the runtime's default locale (SSR mismatch). */
const LOCALE_TAG: Record<Locale, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };

/**
 * The foundation's editorial timezone, pinned for the same reason LOCALE_TAG
 * pins the locale. A timestamp names an instant, and which day that instant
 * falls on depends on where the reader stands: the server renders in UTC and
 * the browser in the visitor's own zone, so leaving the day to the runtime
 * makes one comment show two different dates across hydration.
 */
const SITE_TIME_ZONE = 'Europe/Madrid';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats an ISO date (`2026-08-30`) or timestamp (`2026-08-29T23:30:00.000Z`)
 * like "30 ag. 2025".
 *
 * The two are different things and are resolved differently. A date-only value
 * is a calendar day with no instant attached, so it is rendered verbatim and
 * reads the same everywhere. A timestamp is an instant, and the day it belongs
 * to is resolved in SITE_TIME_ZONE: a comment posted at 01:30 in Barcelona
 * belongs to that day, not to the previous one its UTC value spells out.
 */
export function formatDate(isoValue: string, locale: Locale): string {
	const dateOnly = DATE_ONLY.test(isoValue);
	return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: dateOnly ? 'UTC' : SITE_TIME_ZONE
	}).format(new Date(dateOnly ? `${isoValue}T00:00:00Z` : isoValue));
}

/** Extracts the year of an ISO date without constructing a Date. */
export function yearOf(isoDate: string): string {
	return isoDate.slice(0, 4);
}
