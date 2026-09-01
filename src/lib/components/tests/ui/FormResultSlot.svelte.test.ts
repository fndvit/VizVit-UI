import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormResultSlot from '../../ui/FormResultSlot.svelte';
import { defaultMessages as m } from '../../../config/messages.js';

/**
 * The slot owns one decision: which of the two feedback modules an outcome
 * reaches. How each of them then behaves — role, and where focus goes — is
 * FormFeedback's, and is pinned in its own test; the reason-to-copy mapping is
 * FormErrorFeedback's. The focus cases that used to live here asserted the
 * owner through a module three of its five renderers never touch, so they moved
 * to it and are not restated here.
 *
 * Per-reason copy is no longer among them. The slot used to take a `messages`
 * record and pass it on unread — no render site ever supplied one — and the
 * case that covered it exercised FormErrorFeedback through a prop nothing used.
 * That module's own test pins the overrides.
 */
describe('FormResultSlot', () => {
	it('routes a success to the success message', async () => {
		render(FormResultSlot, { result: { ok: true }, successMessage: 'Nom actualitzat.' });

		await expect.element(page.getByRole('status')).toHaveTextContent('Nom actualitzat.');
		expect(document.querySelector('[role="alert"]')).toBeNull();
	});

	it('routes a failure to the reason copy, never to the success message', async () => {
		render(FormResultSlot, {
			result: { ok: false, reason: 'unavailable' },
			successMessage: 'Nom actualitzat.'
		});

		await expect.element(page.getByRole('alert')).toHaveTextContent(m.form_error_unavailable());
		expect(document.querySelector('[role="status"]')).toBeNull();
	});

	it('renders nothing before the first submission', () => {
		render(FormResultSlot, { result: undefined, successMessage: 'Fet.' });

		expect(document.querySelector('[role="status"]')).toBeNull();
		expect(document.querySelector('[role="alert"]')).toBeNull();
	});
});
