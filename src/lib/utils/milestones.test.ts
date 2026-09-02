import { describe, expect, it } from 'vitest';
import type { MilestoneCategory } from '../content/types.js';
import { matchesMilestoneFilter } from './milestones.js';

/**
 * The transparency page filters its timeline in the browser (a deliberate
 * choice: the volume is small). The predicate used to live inside the page's
 * $derived, closing over `data`, so this branching had no test at all.
 */
const milestone = (
	overrides: Partial<{ title: string; body: string | null; category: MilestoneCategory }> = {}
) => ({
	title: 'Obertura del laboratori',
	body: 'Hem obert el laboratori a Barcelona.',
	category: 'lab' as MilestoneCategory,
	...overrides
});

describe('matchesMilestoneFilter', () => {
	const noFilter = { q: '', category: null };

	it('keeps everything when nothing is filtered', () => {
		expect(matchesMilestoneFilter(milestone(), noFilter)).toBe(true);
	});

	it('drops entries in another category', () => {
		expect(matchesMilestoneFilter(milestone(), { q: '', category: 'press' })).toBe(false);
		expect(matchesMilestoneFilter(milestone(), { q: '', category: 'lab' })).toBe(true);
	});

	it('matches a substring of the title, case-insensitively', () => {
		expect(matchesMilestoneFilter(milestone(), { q: 'LABORATORI', category: null })).toBe(true);
		expect(matchesMilestoneFilter(milestone(), { q: 'laborat', category: null })).toBe(true);
	});

	it('matches the body as well as the title', () => {
		expect(matchesMilestoneFilter(milestone(), { q: 'Barcelona', category: null })).toBe(true);
	});

	it('survives a null body', () => {
		expect(
			matchesMilestoneFilter(milestone({ body: null }), { q: 'Barcelona', category: null })
		).toBe(false);
		expect(
			matchesMilestoneFilter(milestone({ body: null }), { q: 'laboratori', category: null })
		).toBe(true);
	});

	it('treats a whitespace-only query as no query', () => {
		// SearchInput trims before reporting, but the URL can carry anything.
		expect(matchesMilestoneFilter(milestone(), { q: '   ', category: null })).toBe(true);
	});

	it('requires both the category and the query to match', () => {
		expect(matchesMilestoneFilter(milestone(), { q: 'laboratori', category: 'press' })).toBe(false);
		expect(matchesMilestoneFilter(milestone(), { q: 'laboratori', category: 'lab' })).toBe(true);
	});

	it('drops an entry matching neither', () => {
		expect(matchesMilestoneFilter(milestone(), { q: 'zzz', category: null })).toBe(false);
	});
});
