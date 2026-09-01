import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { EMAIL } from '../../../forms/constraints.js';
import type { FormResultOf } from '../../../forms/types.js';

type AuthFormResult = FormResultOf<{ reason?: string }, 'invalidCredentials'>;
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import LoginForm from '../../auth/LoginForm.svelte';

// The forms arrive as props, so these tests substitute stand-ins through the
// component's own interface and cover its render states. Input validation
// lives in the shared schema tests; the auth flows are verified by dev smoke.
type Props = ComponentProps<typeof LoginForm>;

let loginResult: AuthFormResult | undefined;
let magicResult: AuthFormResult | undefined;
let issues: Record<string, Array<{ message: string }> | undefined>;

const renderLogin = (props: Partial<Props> = {}) =>
	render(LoginForm, {
		loginForm: createRemoteFormMock<NonNullable<Props['loginForm']>>({
			result: () => loginResult,
			issues: () => issues
		}),
		magicLinkForm: createRemoteFormMock<NonNullable<Props['magicLinkForm']>>({
			result: () => magicResult,
			issues: () => issues
		}),
		...props
	});

beforeEach(() => {
	loginResult = undefined;
	magicResult = undefined;
	issues = {};
});

describe('LoginForm', () => {
	it('renders the password and magic-link forms', async () => {
		// That both carry LocaleField is the hidden-field scan's rule, and what
		// the input posts is LocaleField's own; neither is restated here.
		renderLogin();

		await expect
			.element(page.getByLabelText(/contrasenya|password|contraseña/i))
			.toBeInTheDocument();
		expect(page.getByLabelText(/correu|email|correo/i).elements()).toHaveLength(2);

		// Google moved to GoogleAuthForm, composed at page level.
		expect(document.querySelectorAll('form')).toHaveLength(2);
	});

	it('shows the invalid-credentials message and keeps the form', async () => {
		loginResult = { ok: false, reason: 'invalidCredentials' };
		renderLogin();

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/credencials incorrectes|incorrect credentials|credenciales incorrectas/i);
		expect(document.querySelectorAll('form')).toHaveLength(2);
	});

	it('shows the rate-limit message', async () => {
		loginResult = { ok: false, reason: 'rateLimited' };
		renderLogin();

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/massa intents|too many attempts|demasiados intentos/i);
	});

	it('confirms an anti-enumeration message after a magic-link request', async () => {
		magicResult = { ok: true, reason: 'magicLinkSent' };
		renderLogin();

		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent(/si el correu existeix|if the email exists|si el correo existe/i);
		// The magic-link form is replaced by the confirmation.
		expect(document.querySelectorAll('form')).toHaveLength(1);
	});

	it('renders the sentence the host mapped for a bounced landing', async () => {
		// The closed set of landing failures and the copy for each stay with
		// the host app's schemas; this component renders whichever finished
		// sentence arrives. The mapping's exhaustiveness is the app's test.
		renderLogin({ redirectErrorMessage: "L'enllaç de confirmació ha caducat." });

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent("L'enllaç de confirmació ha caducat.");
	});

	it('bounds both email inputs in the browser, not only on the server', async () => {
		// The magic-link email shipped with its bound stated only server-side:
		// Field's constraint prop was optional, so omitting it and having no
		// length to state were the same thing. Both schemas use boundedEmail.
		renderLogin();

		const emails = document.querySelectorAll<HTMLInputElement>('input[type="email"]');
		expect(emails).toHaveLength(2);
		for (const input of emails) {
			expect(input.maxLength).toBe(EMAIL.max);
		}
	});
});
