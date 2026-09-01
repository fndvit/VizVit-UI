import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormErrorFeedback from '../../ui/FormErrorFeedback.svelte';
import { defaultMessages as m } from '../../../config/messages.js';
import type { FormFailReason } from '../../../content/types.js';

/**
 * The single site mapping a failure reason to Catalan copy, and it had no
 * direct test — four form suites exercised it transitively and between them
 * never rendered `forbidden` or `unavailable`.
 *
 * Expected strings come from a *different* message function than the one a
 * mis-mapping would call, so swapping two rows in the table fails here. The
 * type-level exhaustiveness check in the component guarantees the keys exist;
 * it cannot check that each reason reaches the right one.
 */
describe('FormErrorFeedback', () => {
	const reasons: Array<[Exclude<FormFailReason, 'error'>, string]> = [
		['rateLimited', m.form_error_rateLimited()],
		['unauthenticated', m.form_error_unauthenticated()],
		['forbidden', m.form_error_forbidden()],
		['unavailable', m.form_error_unavailable()]
	];

	for (const [reason, expected] of reasons) {
		it(`renders the ${reason} copy as an alert`, async () => {
			render(FormErrorFeedback, { result: { ok: false, reason } });

			await expect.element(page.getByRole('alert')).toHaveTextContent(expected);
		});
	}

	it('falls back to the generic copy for the error reason', async () => {
		render(FormErrorFeedback, { result: { ok: false, reason: 'error' } });

		await expect.element(page.getByRole('alert')).toHaveTextContent(m.form_error_generic());
	});

	it('falls back to the generic copy when a failure names no reason', async () => {
		render(FormErrorFeedback, { result: { ok: false } });

		await expect.element(page.getByRole('alert')).toHaveTextContent(m.form_error_generic());
	});

	it('prefers a per-form override over the shared copy', async () => {
		render(FormErrorFeedback, {
			result: { ok: false, reason: 'unauthenticated' },
			messages: { unauthenticated: 'Inicia la sessió per comentar.' }
		});

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Inicia la sessió per comentar.');
	});

	it('renders nothing for a success or an absent result', () => {
		render(FormErrorFeedback, { result: { ok: true } });
		expect(document.querySelector('[role="alert"]')).toBeNull();

		render(FormErrorFeedback, { result: undefined });
		expect(document.querySelector('[role="alert"]')).toBeNull();
	});

	it('falls back to the shared copy for a reason it does not list', async () => {
		// The rule the `messages` prop documents. It held for ordinary strings
		// and not for the handful that name Object.prototype members: a bare
		// `messages[reason]` returns a truthy *inherited* value for these, and
		// `reason in GENERIC` is true for them too, so each rendered
		// "function Object() { [native code] }" where a sentence belongs.
		//
		// Unreachable from the server, whose reasons are constants from a closed
		// set — this pins the documented fallback, not a way in.
		for (const reason of ['constructor', 'toString', '__proto__']) {
			render(FormErrorFeedback, { result: { ok: false, reason } });

			await expect.element(page.getByRole('alert')).toHaveTextContent(m.form_error_generic());
			document.body.innerHTML = '';
		}
	});
});
