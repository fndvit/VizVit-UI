import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormFeedbackProbe from './FormFeedbackProbe.svelte';

/**
 * FormFeedback owns where focus goes when an outcome replaces the form, and
 * five modules render it: FormResultSlot, FormErrorFeedback, and — writing the
 * success branch inline — LoginForm, SignupForm and ContactForm. The rule was
 * asserted only through FormResultSlot, which three of the five never touch,
 * so a regression in the owner would have surfaced in a test for a module they
 * do not use. These pin it where it lives.
 */
describe('FormFeedback', () => {
	it('moves focus to a success message so it is heard and can be continued from', async () => {
		// The form the reader submitted is gone, and with it the button they
		// activated: without this, focus falls back to <body> and the next Tab
		// restarts at the top of the document with no sign the submit worked.
		render(FormFeedbackProbe, { kind: 'success', message: 'Compte creat.' });

		const status = await page.getByRole('status').element();
		expect(document.activeElement).toBe(status);
		expect(status.getAttribute('tabindex')).toBe('-1');
	});

	it('leaves focus alone on an error, which keeps the form standing', async () => {
		// ContactForm renders errors from live preflight issues, so stealing
		// focus would pull the cursor out of the field being typed in.
		render(FormFeedbackProbe, { kind: 'error', message: 'Alguna cosa ha fallat.' });

		const alert = await page.getByRole('alert').element();
		expect(document.activeElement).not.toBe(alert);
	});

	it('announces success politely and failure assertively', async () => {
		render(FormFeedbackProbe, { kind: 'success', message: 'Fet.' });
		await expect.element(page.getByRole('status')).toHaveTextContent('Fet.');
		expect(document.querySelector('[role="alert"]')).toBeNull();

		document.body.innerHTML = '';

		render(FormFeedbackProbe, { kind: 'error', message: 'Ha fallat.' });
		await expect.element(page.getByRole('alert')).toHaveTextContent('Ha fallat.');
		expect(document.querySelector('[role="status"]')).toBeNull();
	});
});
