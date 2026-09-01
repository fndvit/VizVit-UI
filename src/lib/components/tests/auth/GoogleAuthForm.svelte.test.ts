import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import GoogleAuthForm from '../../auth/GoogleAuthForm.svelte';

/**
 * This module had no test file while it held half of the signup consent gate
 * in a `hydrated && requireConsent` expression. The hydration half now belongs
 * to the gate (see utils/signup-consent.svelte.ts), which leaves this module
 * reporting exactly what it is handed — and that is what these pin.
 */
type Props = ComponentProps<typeof GoogleAuthForm>;

const renderGoogle = (props: Partial<Props> = {}) =>
	render(GoogleAuthForm, {
		googleLoginForm: createRemoteFormMock<NonNullable<Props['googleLoginForm']>>(),
		...props
	});

const submitButton = () => document.querySelector('button[type="submit"]');

describe('GoogleAuthForm', () => {
	it('offers the button when no consent is owed', async () => {
		renderGoogle();

		await expect.element(page.getByRole('button')).toBeInTheDocument();
		expect(submitButton()).not.toBeDisabled();
	});

	it('refuses the submission while consent is owed', () => {
		renderGoogle({ requireConsent: true });

		expect(submitButton()).toBeDisabled();
	});

	it('carries the newsletter intent as a hidden input only when there is one', () => {
		renderGoogle({ newsletterIntent: true });
		expect(document.querySelector('input[name="newsletter"]')).toBeInTheDocument();

		document.body.innerHTML = '';

		renderGoogle({ newsletterIntent: false });
		expect(document.querySelector('input[name="newsletter"]')).toBeNull();
	});
});
