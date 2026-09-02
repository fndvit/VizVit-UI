import { describe, expect, it } from 'vitest';
import {
	chromeEdit,
	chromeProperty,
	collectionOf,
	entityEdit,
	entityProperty,
	pageCopyEdit
} from './helpers.js';
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

describe('property and collection helpers', () => {
	it('names the entity row once for many panel properties', () => {
		const property = entityProperty('milestones', 5);

		expect(property('occurred_on', { type: 'date', label: 'Data' })).toEqual({
			ref: { kind: 'entity', entity: 'milestones', id: 5, field: 'occurred_on' },
			type: 'date',
			label: 'Data'
		});
		expect(property('link_url', { type: 'url', label: 'Enllaç', nullable: true })).toEqual({
			ref: { kind: 'entity', entity: 'milestones', id: 5, field: 'link_url' },
			type: 'url',
			label: 'Enllaç',
			nullable: true
		});
	});

	it('builds a chrome property for wording that cannot hold a caret', () => {
		expect(
			chromeProperty('weeklies_searchPlaceholder', { type: 'text', label: 'Placeholder' })
		).toEqual({
			ref: { kind: 'chrome', key: 'weeklies_searchPlaceholder' },
			type: 'text',
			label: 'Placeholder'
		});
	});

	it('names a collection, with and without a scope', () => {
		expect(collectionOf('milestones')).toEqual({ entity: 'milestones' });
		expect(collectionOf('team_members', 'board')).toEqual({
			entity: 'team_members',
			scope: 'board'
		});
	});
});
