import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { FormResultOf as FormResult } from '../../../forms/types.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import SignupForm from '../../auth/SignupForm.svelte';

/**
 * The most logic-carrying form in the app and it had no test: three fields,
 * two consent checkboxes whose live state the page mirrors into the Google
 * flow, a honeypot, and a success branch that replaces the whole form.
 */
type FormProp = NonNullable<ComponentProps<typeof SignupForm>['signupForm']>;

let result: FormResult | undefined;
let issues: Record<string, Array<{ message: string }> | undefined>;

const renderForm = (props: Partial<ComponentProps<typeof SignupForm>> = {}) =>
	render(SignupForm, {
		signupForm: createRemoteFormMock<FormProp>({ result: () => result, issues: () => issues }),
		...props
	});

beforeEach(() => {
	result = undefined;
	issues = {};
});

describe('SignupForm', () => {
	it('renders the fields it collects', async () => {
		// The hidden locale input and the honeypot are the two coverage scans'
		// rules, and what each posts belongs to LocaleField and Honeypot.
		renderForm();

		await expect.element(page.getByLabelText(/nom|name|nombre/i)).toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/contrasenya|password|contraseña/i))
			.toBeInTheDocument();
	});

	it('requires the terms checkbox but not the newsletter one', () => {
		renderForm();

		const terms = document.querySelector<HTMLInputElement>('input[name="terms"]');
		const newsletter = document.querySelector<HTMLInputElement>('input[name="newsletter"]');
		expect(terms?.required).toBe(true);
		expect(newsletter?.required).toBe(false);
	});

	it('pre-checks the newsletter box when arriving from the band', () => {
		renderForm({ newsletterIntent: true });

		const newsletter = document.querySelector<HTMLInputElement>('input[name="newsletter"]');
		expect(newsletter?.getAttribute('value')).toBeTruthy();
	});

	it('reports consent changes so the page can mirror them into the Google flow', async () => {
		const onTermsChange = vi.fn();
		const onNewsletterChange = vi.fn();
		renderForm({ onTermsChange, onNewsletterChange });

		const terms = document.querySelector<HTMLInputElement>('input[name="terms"]');
		const newsletter = document.querySelector<HTMLInputElement>('input[name="newsletter"]');

		terms?.click();
		newsletter?.click();

		expect(onTermsChange).toHaveBeenCalledWith(true);
		expect(onNewsletterChange).toHaveBeenCalledWith(true);
	});

	it('replaces the form with the check-your-email notice on success', async () => {
		result = { ok: true };
		renderForm();

		await expect.element(page.getByRole('status')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeNull();
	});

	it('keeps the form and shows an alert when the submission fails', async () => {
		result = { ok: false, reason: 'rateLimited' };
		renderForm();

		await expect.element(page.getByRole('alert')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeTruthy();
	});

	it("renders the schema's message and wires it as the description", async () => {
		// The exact sentence matters: it comes from the schema that failed, not
		// from a prop this component supplies.
		issues = { displayName: [{ message: 'Introdueix un nom visible.' }] };
		renderForm();

		await expect
			.element(page.getByLabelText(/nom|name|nombre/i))
			.toHaveAccessibleDescription('Introdueix un nom visible.');
		expect(document.getElementById('signup-name-error')?.textContent).toBe(
			'Introdueix un nom visible.'
		);
	});
});
