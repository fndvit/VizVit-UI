import { describe, expect, it } from 'vitest';
import { documentTitle } from './document-title.js';

/**
 * The format's only owner, so both of its branches are asserted here rather
 * than in the two markup files that used to spell it. fndvit-website's
 * `site.test.ts` keeps one case of its own — that its wrapper supplies
 * `SITE_NAME` — which is behaviour, not a restatement of this.
 */
describe('documentTitle', () => {
	it('appends the site name to a page that has one', () => {
		expect(documentTitle('Transparència', 'ViT')).toBe('Transparència — ViT');
	});

	it('renders the site name alone rather than a dangling separator', () => {
		expect(documentTitle('', 'ViT')).toBe('ViT');
	});
});
