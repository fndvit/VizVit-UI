import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { FormResultOf } from '../../../forms/types.js';

type AccountFormResult = FormResultOf<{ reason?: 'subscribed' | 'unsubscribed' }>;
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import NewsletterSignup from '../../account/NewsletterSignup.svelte';

// The form arrives as a prop, so these tests substitute a stand-in through the
// component's own interface and cover the band's three render states.
type Props = ComponentProps<typeof NewsletterSignup>;

let result: AccountFormResult | undefined;

const renderBand = (account: Props['account']) =>
	render(NewsletterSignup, {
		account,
		newsletterToggleForm: createRemoteFormMock<NonNullable<Props['newsletterToggleForm']>>({
			result: () => result
		})
	});

beforeEach(() => {
	result = undefined;
});

describe('NewsletterSignup', () => {
	it('routes logged-out visitors to the auth pages with the newsletter intent', async () => {
		renderBand(null);

		expect(document.querySelector('form')).toBeNull();
		const links = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
		expect(links.some((href) => href?.includes('/signup?newsletter=1'))).toBe(true);
		expect(links.some((href) => href?.includes('/login?newsletter=1'))).toBe(true);
	});

	it('offers one-click subscription to a logged-in unsubscribed user', async () => {
		renderBand({ displayName: 'Núria', newsletterSubscribed: false });

		await expect
			.element(page.getByRole('button', { name: /subscriu|subscribe|suscribirme/i }))
			.toBeInTheDocument();
		expect(document.querySelector<HTMLInputElement>('input[name="action"]')?.value).toBe(
			'subscribe'
		);
	});

	it('shows the subscribed state without a form', async () => {
		renderBand({ displayName: 'Núria', newsletterSubscribed: true });

		expect(document.querySelector('form')).toBeNull();
		await expect
			.element(page.getByText(/ja estàs subscrit|you are subscribed|ya estás suscrito/i))
			.toBeInTheDocument();
	});

	it('shows the success feedback after subscribing', async () => {
		result = { ok: true, reason: 'subscribed' };
		renderBand({ displayName: 'Núria', newsletterSubscribed: false });

		await expect.element(page.getByRole('status')).toHaveTextContent(/activada|activated/i);
	});
});
