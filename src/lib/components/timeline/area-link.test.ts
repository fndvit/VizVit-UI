import { describe, expect, it } from 'vitest';
import { areaDestination } from './area-link.js';

describe('areaDestination', () => {
	it('prefers the area’s own href, then its category’s history, then no link', () => {
		expect(areaDestination({ href: '/what-we-do/eina', category: 'lab' }, '/transparency')).toBe(
			'/what-we-do/eina'
		);
		expect(areaDestination({ href: null, category: 'lab' }, '/transparency')).toBe(
			'/transparency?category=lab'
		);
		expect(areaDestination({ href: null, category: 'tools' }, '/historia')).toBe(
			'/historia?category=tools'
		);
		expect(areaDestination({ href: null, category: null }, '/transparency')).toBeNull();
		expect(areaDestination({ href: '', category: null }, '/transparency')).toBeNull();
	});
});
