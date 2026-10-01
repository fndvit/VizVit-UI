import { describe, expect, it } from 'vitest';
import {
	MILESTONE_LIST_PARAMS,
	TRANSPARENCY_PATH,
	transparencyHref
} from './milestone-list-contract.js';

describe('transparencyHref', () => {
	it('writes only the filters that are set, on the contract path or the base it is given', () => {
		expect(transparencyHref({})).toBe(TRANSPARENCY_PATH);
		expect(transparencyHref({ category: 'lab' })).toBe('/transparency?category=lab');
		expect(transparencyHref({ q: 'aigua', category: null })).toBe('/transparency?q=aigua');
		expect(transparencyHref({ category: 'tools' }, '/historia')).toBe('/historia?category=tools');
	});

	it('names the params a host query schema must read', () => {
		const url = new URL(transparencyHref({ q: 'x', category: 'lab' }), 'https://a.invalid');
		expect([...url.searchParams.keys()].sort()).toEqual([...MILESTONE_LIST_PARAMS].sort());
	});
});
