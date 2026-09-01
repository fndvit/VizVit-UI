import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Honeypot from '../../ui/Honeypot.svelte';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import { HONEYPOT_FIELD } from '../../../forms/transport.js';

/**
 * The trap only works while its two halves agree on a name: the envelope
 * short-circuits on HONEYPOT_FIELD, and the markup has to post under it. The
 * callers used to spell the name themselves, so the join was a string typed
 * twice — and a trap whose name drifts stops catching without failing.
 */
function renderHoneypot() {
	const form = createRemoteFormMock<Record<string, never>>();
	render(Honeypot, {
		form: (form as unknown as { fields: Record<string, never> }).fields,
		id: 'test-website'
	});
	const input = document.getElementById('test-website');
	if (!input) throw new Error('Honeypot rendered no input');
	return input;
}

describe('Honeypot', () => {
	it('posts under the name the form envelope checks', () => {
		expect(renderHoneypot().getAttribute('name')).toBe(HONEYPOT_FIELD);
	});

	it('stays out of the way of everyone the trap is not for', () => {
		// Hidden from assistive technology, skipped by the tab order, and not
		// offered a saved value — a human should never be given the chance to
		// fill it, because filling it is what marks a submission as a bot.
		const input = renderHoneypot();

		expect(input.closest('[aria-hidden="true"]')).not.toBeNull();
		expect(input.getAttribute('tabindex')).toBe('-1');
		expect(input.getAttribute('autocomplete')).toBe('off');
	});
});
