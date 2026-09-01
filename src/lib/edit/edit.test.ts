import { describe, expect, it } from 'vitest';
import { chromeEdit, entityEdit, pageCopyEdit } from './helpers.js';
import { localize } from './types.js';

describe('localize', () => {
	it('reads the requested locale', () => {
		expect(localize({ ca: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
	});

	it('falls back to Catalan for a missing or empty translation', () => {
		expect(localize({ ca: 'Hola' }, 'en')).toBe('Hola');
		expect(localize({ ca: 'Hola', es: '' }, 'es')).toBe('Hola');
	});
});

describe('descriptor helpers', () => {
	it('builds a page-copy descriptor', () => {
		expect(pageCopyEdit('home', 'hero_title', 'ca', { label: 'Títol' })).toEqual({
			ref: { kind: 'page-copy', page: 'home', sectionKey: 'hero_title' },
			locale: 'ca',
			label: 'Títol'
		});
	});

	it('builds a chrome descriptor for one interface-wording key', () => {
		expect(chromeEdit('footer_rights', 'es', { label: 'Drets' })).toEqual({
			ref: { kind: 'chrome', key: 'footer_rights' },
			locale: 'es',
			label: 'Drets'
		});
	});

	it('names the entity row once for many fields', () => {
		const edit = entityEdit('weeklies', 12, 'en');

		expect(edit('title')).toEqual({
			ref: { kind: 'entity', entity: 'weeklies', id: 12, field: 'title' },
			locale: 'en'
		});
		expect(edit('body', { format: 'richtext' })).toEqual({
			ref: { kind: 'entity', entity: 'weeklies', id: 12, field: 'body' },
			locale: 'en',
			format: 'richtext'
		});
	});
});
