import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { FormResultOf } from '../../../forms/types.js';

type AccountFormResult = FormResultOf<{ reason?: 'subscribed' | 'unsubscribed' | 'nameUpdated' }>;
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import AccountPanel from '../../account/AccountPanel.svelte';

// The four forms arrive as props, so these tests substitute stand-ins through
// the component's own interface and cover its render states.
type Props = ComponentProps<typeof AccountPanel>;

let nameResult: AccountFormResult | undefined;
let newsletterResult: AccountFormResult | undefined;
let deleteResult: AccountFormResult | undefined;
let issues: Record<string, Array<{ message: string }> | undefined>;

const renderPanel = (props: Partial<Props> = {}) =>
	render(AccountPanel, {
		displayName: 'Núria',
		email: 'nuria@example.org',
		isSubscribed: false,
		canDelete: true,
		updateNameForm: createRemoteFormMock<NonNullable<Props['updateNameForm']>>({
			result: () => nameResult,
			issues: () => issues
		}),
		newsletterToggleForm: createRemoteFormMock<NonNullable<Props['newsletterToggleForm']>>({
			result: () => newsletterResult,
			issues: () => issues
		}),
		deleteAccountForm: createRemoteFormMock<NonNullable<Props['deleteAccountForm']>>({
			result: () => deleteResult,
			issues: () => issues
		}),
		logoutForm: createRemoteFormMock<NonNullable<Props['logoutForm']>>(),
		...props
	});

beforeEach(() => {
	nameResult = undefined;
	newsletterResult = undefined;
	deleteResult = undefined;
	issues = {};
});

describe('AccountPanel', () => {
	it('renders name, newsletter, export, logout and delete sections', async () => {
		renderPanel();

		await expect.element(page.getByLabelText(/^nom$|^name$|^nombre$/i)).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: /descarrega|download|descargar/i }))
			.toBeInTheDocument();
		expect(
			document.querySelector<HTMLAnchorElement>('a[href="/account/data"][download]')
		).toBeTruthy();

		const checkbox = document.querySelector<HTMLInputElement>('input[type="checkbox"]');
		expect(checkbox?.required).toBe(true);
	});

	it('prefills the current display name', async () => {
		renderPanel();

		expect(document.querySelector<HTMLInputElement>('input[name="displayName"]')?.value).toBe(
			'Núria'
		);
	});

	it('flips the newsletter button and hidden action by subscription state', async () => {
		renderPanel({ isSubscribed: true });

		await expect
			.element(page.getByRole('button', { name: /cancel·la|unsubscribe|cancelar/i }))
			.toBeInTheDocument();
		expect(document.querySelector<HTMLInputElement>('input[name="action"]')?.value).toBe(
			'unsubscribe'
		);
	});

	it('hides the delete form when deletion is unavailable', async () => {
		renderPanel({ canDelete: false });

		expect(document.querySelector('input[type="checkbox"]')).toBeNull();
		await expect
			.element(page.getByText(/no està disponible|unavailable|no está disponible/i))
			.toBeInTheDocument();
	});

	it('shows the rename success message', async () => {
		nameResult = { ok: true, reason: 'nameUpdated' };
		renderPanel();

		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent(/nom actualitzat|name updated|nombre actualizado/i);
	});

	it('shows the rate-limit error on delete', async () => {
		deleteResult = { ok: false, reason: 'rateLimited' };
		renderPanel();

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/massa intents|too many attempts|demasiados intentos/i);
	});

	it('hides the newsletter section without an email', async () => {
		renderPanel({ email: null });

		expect(document.querySelector('input[name="action"]')).toBeNull();
	});
});
