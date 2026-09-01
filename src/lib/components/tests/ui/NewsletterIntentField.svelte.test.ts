import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NewsletterIntentField from '../../ui/NewsletterIntentField.svelte';
import { NEWSLETTER_INTENT_PARAM, NEWSLETTER_INTENT_VALUE } from '../../../forms/transport.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';

/**
 * The intent's fourth transport. The other three read
 * `NEWSLETTER_INTENT_VALUE`; these two markup sites spelled `'1'`, so the
 * schema's `z.literal(NEWSLETTER_INTENT_VALUE)` and the value posted to it
 * could drift apart with nothing failing.
 */
function renderField() {
	const form = createRemoteFormMock<{ newsletter?: string }>();
	render(NewsletterIntentField, {
		field: (form as unknown as { fields: { newsletter: never } }).fields.newsletter
	});
	const input = document.querySelector<HTMLInputElement>('input');
	if (!input) throw new Error('NewsletterIntentField rendered no input');
	return input;
}

describe('NewsletterIntentField', () => {
	it('posts the value the schema declares, not a literal of its own', () => {
		expect(renderField().value).toBe(NEWSLETTER_INTENT_VALUE);
	});

	it('posts under the name the intent travels as', () => {
		const input = renderField();

		expect(input.type).toBe('hidden');
		expect(input.getAttribute('name')).toBe(NEWSLETTER_INTENT_PARAM);
	});
});
