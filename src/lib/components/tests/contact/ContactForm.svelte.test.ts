import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { FormResultOf as FormResult } from '../../../forms/types.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import ContactForm from '../../contact/ContactForm.svelte';
import { CONTACT_CATEGORIES } from '../../../content/types.js';

// Remote form submissions run through kit's client runtime, which isn't
// exercised here — the form arrives as a prop, so these tests substitute a
// stand-in through the component's own interface and cover its render states.
// Input validation lives in the shared schema tests; the submission wire is
// kit's own, verified by dev smoke.
type FormProp = NonNullable<ComponentProps<typeof ContactForm>['form']>;

let result: FormResult | undefined;
let issues: Record<string, Array<{ message: string }> | undefined>;

const renderForm = () =>
	render(ContactForm, {
		form: createRemoteFormMock<FormProp>({ result: () => result, issues: () => issues })
	});

beforeEach(() => {
	result = undefined;
	issues = {};
});

describe('ContactForm', () => {
	it('renders every field it collects', async () => {
		// The hidden locale input and the honeypot are the two coverage scans'
		// rules, and what each posts belongs to LocaleField and Honeypot.
		renderForm();

		await expect.element(page.getByLabelText(/nom|name|nombre/i)).toBeInTheDocument();
		await expect.element(page.getByLabelText(/correu|email|correo/i)).toBeInTheDocument();
		await expect.element(page.getByLabelText(/missatge|message|mensaje/i)).toBeInTheDocument();
	});

	it('offers every category the schema declares, in schema order', () => {
		// The select derives from contactCategorySchema rather than restating it.
		// Read off the schema, not a hand-kept list here: a list is what the
		// missing category would also be absent from.
		renderForm();

		const options = [...document.querySelectorAll<HTMLOptionElement>('select option')];

		expect(options.map((option) => option.value)).toEqual([...CONTACT_CATEGORIES]);
		// Fail closed: an empty select would satisfy a "no unknown option" check.
		expect(options.length).toBeGreaterThan(0);
		for (const option of options) expect(option.textContent?.trim()).not.toBe('');
	});

	it('shows the success state and hides the form after an accepted submission', async () => {
		result = { ok: true };
		renderForm();

		await expect.element(page.getByRole('status')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeNull();
	});

	it('shows the rate-limit message and keeps the form', async () => {
		result = { ok: false, reason: 'rateLimited' };
		renderForm();

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/massa intents|too many attempts|demasiados intentos/i);
		expect(document.querySelector('form')).toBeTruthy();
	});

	it('shows a generic error message when the submission fails', async () => {
		result = { ok: false, reason: 'error' };
		renderForm();

		await expect.element(page.getByRole('alert')).toBeInTheDocument();
	});

	it("shows the schema's message and wires it as the description", async () => {
		issues = { email: [{ message: 'Introdueix una adreça electrònica vàlida.' }] };
		renderForm();

		await expect
			.element(page.getByLabelText(/correu|email|correo/i))
			.toHaveAccessibleDescription('Introdueix una adreça electrònica vàlida.');
		expect(document.getElementById('contact-email-error')?.textContent).toBe(
			'Introdueix una adreça electrònica vàlida.'
		);
		await expect.element(page.getByRole('alert')).toBeInTheDocument();
	});
});
