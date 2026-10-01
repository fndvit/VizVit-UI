import { describe, expect, it } from 'vitest';
import { MEDIA_PREFIX, foldMediaUrl, resolveMediaReference } from './media-reference.js';

const ORIGIN = 'https://ref.supabase.co';

describe('the media reference', () => {
	it('resolves a reference against the origin, an SVG as an attachment, whatever slash the origin ends in', () => {
		expect(resolveMediaReference('/media/areas/a.webp', ORIGIN)).toBe(
			`${ORIGIN}/storage/v1/object/public/media/areas/a.webp`
		);
		expect(resolveMediaReference('/media/areas/a.webp', `${ORIGIN}/`)).toBe(
			`${ORIGIN}/storage/v1/object/public/media/areas/a.webp`
		);
		expect(resolveMediaReference('/media/u/logo.SVG', ORIGIN)).toMatch(/\?download$/);
	});

	it('passes through what is not a reference, and a reference with no origin to resolve it against', () => {
		for (const value of ['/images/placeholders/square.svg', 'https://pictures.example/a.webp']) {
			expect(resolveMediaReference(value, ORIGIN)).toBe(value);
		}
		expect(resolveMediaReference('/media/a.webp', '')).toBe('/media/a.webp');
	});

	it('round-trips: what resolves folds back to the same reference, from either spelling of the origin', () => {
		for (const reference of ['/media/areas/a.webp', '/media/uploads/2026-10/logo.svg']) {
			for (const origin of [ORIGIN, `${ORIGIN}/`]) {
				expect(foldMediaUrl(resolveMediaReference(reference, origin), origin)).toBe(reference);
			}
		}
		expect(MEDIA_PREFIX).toBe('/media/');
	});

	it('folds only this origin’s bucket: another project’s public URL, or any other value, stays as it is', () => {
		const other = 'https://other.supabase.co/storage/v1/object/public/media/x.webp';
		expect(foldMediaUrl(other, ORIGIN)).toBe(other);
		expect(foldMediaUrl('https://pictures.example/a.webp', ORIGIN)).toBe(
			'https://pictures.example/a.webp'
		);
		expect(foldMediaUrl(`${ORIGIN}/storage/v1/object/public/media/x.webp`, '')).toBe(
			`${ORIGIN}/storage/v1/object/public/media/x.webp`
		);
	});
});
