import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { LOCALES, type Locale } from '../../../config/types.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import LocaleFieldProbe from './LocaleFieldProbe.svelte';

/**
 * The hidden input that carries the request locale through a no-JS submission.
 * Without the value following the config locale, an en/es submission is stored
 * under the base locale, because the unprefixed POST target resolves there
 * before the locale cookie is consulted.
 */
function renderField(locale: Locale = 'ca') {
	const form = createRemoteFormMock<{ fields: { locale: never } }>();
	render(LocaleFieldProbe, { locale, field: form.fields.locale });
	const input = document.querySelector<HTMLInputElement>('input');
	if (!input) throw new Error('LocaleField rendered no input');
	return input;
}

describe('LocaleField', () => {
	it('posts under the name the form schemas parse', () => {
		const input = renderField();

		expect(input.type).toBe('hidden');
		expect(input.getAttribute('name')).toBe('locale');
	});

	it('posts the locale the page is being rendered in', () => {
		expect(renderField('es').value).toBe('es');
	});

	it('follows the config locale rather than restating a default', () => {
		expect(renderField('en').value).toBe('en');
	});

	it('posts a value from the package locale set', () => {
		expect(LOCALES).toContain(renderField().value);
	});
});
