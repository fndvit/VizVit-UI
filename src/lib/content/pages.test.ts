import { describe, expect, it } from 'vitest';
import { GET_INVOLVED_REASON_KEYS, PAGE_COPY_KEYS } from './pages.js';

/**
 * The page-copy vocabulary as the two hosts depend on it. The website's
 * repository test compares it to `seed.sql` and vit-brain's census test to
 * the live table; what neither can see is the shape of the declaration
 * itself, which is what the page modules index by.
 */
describe('PAGE_COPY_KEYS', () => {
	it('declares the seven static pages the website renders from copy', () => {
		expect(Object.keys(PAGE_COPY_KEYS).sort()).toEqual(
			[
				'get-involved',
				'home',
				'legal',
				'transparency',
				'weeklies',
				'what-we-do',
				'who-we-are'
			].sort()
		);
	});

	it('names every key once per page — a duplicate would be two blocks with one row', () => {
		for (const [page, keys] of Object.entries(PAGE_COPY_KEYS)) {
			expect(new Set(keys).size, page).toBe(keys.length);
			expect(keys.length, page).toBeGreaterThan(0);
		}
	});

	it('spells keys as snake_case section names, the way page_content stores them', () => {
		for (const keys of Object.values(PAGE_COPY_KEYS)) {
			for (const key of keys) expect(key).toMatch(/^[a-z]+(_[a-z]+)*$/);
		}
	});
});

describe('GET_INVOLVED_REASON_KEYS', () => {
	it('is spread into the get-involved page IN ORDER, so the list renders in declared sequence', () => {
		const keys: readonly string[] = PAGE_COPY_KEYS['get-involved'];
		const first = keys.indexOf(GET_INVOLVED_REASON_KEYS[0]);
		expect(first).toBeGreaterThan(-1);
		expect(keys.slice(first, first + GET_INVOLVED_REASON_KEYS.length)).toEqual([
			...GET_INVOLVED_REASON_KEYS
		]);
	});

	it('every reason is a key of that page and of no other', () => {
		for (const [page, keys] of Object.entries(PAGE_COPY_KEYS)) {
			const present = GET_INVOLVED_REASON_KEYS.filter((key) =>
				(keys as readonly string[]).includes(key)
			);
			expect(present.length, page).toBe(
				page === 'get-involved' ? GET_INVOLVED_REASON_KEYS.length : 0
			);
		}
	});
});
