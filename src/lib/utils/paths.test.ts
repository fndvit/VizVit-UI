import { describe, expect, it } from 'vitest';
import { buildQueryString, isExternalUrl, isInternalPath, isPathUnder } from './paths.js';

/**
 * The four path helpers, and in particular the two DESTINATION CLASSIFIERS
 * this package branches on before it emits an `<a href>`.
 *
 * Those two had no test at all. `Link` renders a localized internal link when
 * `isInternalPath` says yes and a bare `rel="external noopener"` anchor
 * otherwise; `TimelineMilestone` picks its branch with `isExternalUrl`. So a
 * regex that loosens here is a `javascript:` URL reaching an anchor on the
 * public site, in the one module whose job is to prevent exactly that — and
 * the classifier it replaced had that bug (any scheme followed by `//`, so a
 * scheme WITHOUT one fell through to the internal branch and the locale
 * resolver returned it verbatim).
 *
 * The two are deliberately NOT complements: protocol-relative `//host/path`
 * is external, and neither accepts a bare scheme.
 */
describe('isInternalPath', () => {
	it('accepts a root-relative path, and the root itself', () => {
		expect(isInternalPath('/')).toBe(true);
		expect(isInternalPath('/weeklies')).toBe(true);
		expect(isInternalPath('/what-we-do/some-slug')).toBe(true);
		expect(isInternalPath('/weeklies?sort=oldest#top')).toBe(true);
	});

	it('refuses a protocol-relative URL, which leaves the site', () => {
		expect(isInternalPath('//evil.example')).toBe(false);
		expect(isInternalPath('//evil.example/path')).toBe(false);
	});

	it('refuses a bare scheme — this is the case that used to fall through', () => {
		expect(isInternalPath('javascript:alert(1)')).toBe(false);
		expect(isInternalPath('data:text/html,<script>')).toBe(false);
		expect(isInternalPath('mailto:hola@example.org')).toBe(false);
	});

	it('refuses an absolute URL and a relative path', () => {
		expect(isInternalPath('https://example.org/a')).toBe(false);
		expect(isInternalPath('weeklies')).toBe(false);
		expect(isInternalPath('')).toBe(false);
	});
});

describe('isExternalUrl', () => {
	it('accepts http and https with a host', () => {
		expect(isExternalUrl('https://example.org')).toBe(true);
		expect(isExternalUrl('http://example.org/path')).toBe(true);
		expect(isExternalUrl('HTTPS://EXAMPLE.ORG')).toBe(true);
	});

	it('accepts protocol-relative, which is another origin carrying our scheme', () => {
		expect(isExternalUrl('//example.org/path')).toBe(true);
	});

	it('refuses every other scheme — an allow-list, not a deny-list', () => {
		expect(isExternalUrl('javascript:alert(1)')).toBe(false);
		expect(isExternalUrl('javascript://evil')).toBe(false);
		expect(isExternalUrl('data:text/html,<script>')).toBe(false);
		expect(isExternalUrl('mailto:hola@example.org')).toBe(false);
		expect(isExternalUrl('ftp://example.org')).toBe(false);
	});

	it('refuses an internal path and a missing host', () => {
		expect(isExternalUrl('/weeklies')).toBe(false);
		expect(isExternalUrl('https:///nohost')).toBe(false);
		expect(isExternalUrl('')).toBe(false);
	});
});

describe('isPathUnder', () => {
	it('covers the prefix itself and its segments', () => {
		expect(isPathUnder('/what-we-do', '/what-we-do')).toBe(true);
		expect(isPathUnder('/what-we-do/a-slug', '/what-we-do')).toBe(true);
	});

	it('does not match a longer sibling segment', () => {
		expect(isPathUnder('/what-we-domain', '/what-we-do')).toBe(false);
		expect(isPathUnder('/weeklies', '/what-we-do')).toBe(false);
	});
});

describe('buildQueryString', () => {
	it('joins the truthy entries, and answers empty when none remain', () => {
		expect(buildQueryString({ sort: 'oldest', page: '2' })).toBe('?sort=oldest&page=2');
		expect(buildQueryString({ sort: null, page: undefined, theme: '' })).toBe('');
	});

	it('encodes the values it is given', () => {
		expect(buildQueryString({ q: 'a b&c' })).toBe('?q=a+b%26c');
	});
});
