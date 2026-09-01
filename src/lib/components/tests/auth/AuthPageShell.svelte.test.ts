import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AuthPageShell from '../../auth/AuthPageShell.svelte';

/**
 * The tab pair is this module's whole reason to exist: mode switching works
 * without JS, and the newsletter intent survives the switch. The current tab is derived
 * from the URL's canonical pathname through UiConfig.
 */
const children = createRawSnippet(() => ({ render: () => '<p>Formulari</p>' }));

function renderShell(url: string) {
	// Nested under `props`: this component has an `intro` prop, which collides
	// with Svelte's `intro` render option.
	return render(AuthPageShell, {
		props: {
			title: 'Entra',
			heading: 'Entra',
			intro: 'Accedeix al teu compte',
			url: new URL(url),
			children
		}
	});
}

describe('AuthPageShell', () => {
	it('links the two modes as real links', async () => {
		renderShell('https://fundaciovit.org/login');

		await expect
			.element(page.getByRole('link', { name: /inicia la sessió|log in|inicia sesión/i }))
			.toHaveAttribute('href', '/login');
		await expect
			.element(
				page.getByRole('link', { name: /crea un compte|create an account|crea una cuenta/i })
			)
			.toHaveAttribute('href', '/signup');
	});

	it('marks the current mode for assistive technology', async () => {
		renderShell('https://fundaciovit.org/signup');

		await expect
			.element(
				page.getByRole('link', { name: /crea un compte|create an account|crea una cuenta/i })
			)
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(page.getByRole('link', { name: /inicia la sessió|log in|inicia sesión/i }))
			.not.toHaveAttribute('aria-current');
	});

	it('carries the newsletter intent across a mode switch', async () => {
		renderShell('https://fundaciovit.org/login?newsletter=1');

		await expect
			.element(
				page.getByRole('link', { name: /crea un compte|create an account|crea una cuenta/i })
			)
			.toHaveAttribute('href', '/signup?newsletter=1');
	});

	it('leaves the intent off when the visitor did not arrive with one', async () => {
		renderShell('https://fundaciovit.org/login');

		await expect
			.element(
				page.getByRole('link', { name: /crea un compte|create an account|crea una cuenta/i })
			)
			.toHaveAttribute('href', '/signup');
	});
});
