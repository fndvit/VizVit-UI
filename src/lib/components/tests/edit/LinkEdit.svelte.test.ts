import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultMessages } from '../../../config/messages.js';
import type { UiMessages } from '../../../config/types.js';
import { chromeEdit, chromeProperty } from '../../../edit/helpers.js';
import type { EditAdapter } from '../../../edit/types.js';
import LinkEditProbe from './LinkEditProbe.svelte';

/**
 * The link modal: a link's text and destination edit as ONE gesture. The
 * modal's own mechanics here; the two components that resolve their own keys
 * through it are pinned at the end.
 */

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

const textEdit = chromeEdit('comments_signupLink', 'ca');
const hrefDescriptor = chromeProperty('comments_signupLinkHref', { type: 'text', label: 'Adreça' });

function adapterWith(
	overrides: Partial<Pick<EditAdapter, 'save' | 'saveProperty'>> = {}
): EditAdapter {
	return {
		isEditing: true,
		save: vi.fn(() => Promise.resolve()),
		saveProperty: vi.fn(() => Promise.resolve()),
		...overrides
	};
}

const bare = (adapter: EditAdapter | null, withHref = true) =>
	render(LinkEditProbe, {
		props: {
			adapter,
			text: { edit: textEdit, value: 'Crea un compte' },
			href: withHref
				? { descriptor: hrefDescriptor, value: '/signup' }
				: { descriptor: undefined, value: '/signup' }
		}
	});

describe('LinkEdit', () => {
	it('renders the control alone without an adapter — byte-identical to read-only', () => {
		const readOnly = bare(null);
		const notEditing = bare({ ...adapterWith(), isEditing: false });
		expect(readOnly.container.innerHTML).toBe(notEditing.container.innerHTML);
		expect(readOnly.container.querySelector('a')?.getAttribute('href')).toBe('/signup');
		expect(readOnly.container.querySelector('.link-swap')).toBeNull();
	});

	it('while editing, the swap opens the modal seeded with both values', async () => {
		const { container } = bare(adapterWith());
		const swap = container.querySelector<HTMLButtonElement>('.link-swap')!;
		expect(container.querySelector('a')).toBeNull();
		swap.click();
		await settle();
		const dialog = container.querySelector<HTMLDialogElement>('dialog')!;
		expect(dialog.open).toBe(true);
		const inputs = [...dialog.querySelectorAll('input')];
		expect(inputs.map((input) => input.value)).toEqual(['Crea un compte', '/signup']);
	});

	it('Desa commits only the changed halves', async () => {
		const save = vi.fn(() => Promise.resolve());
		const saveProperty = vi.fn(() => Promise.resolve());
		const { container } = bare(adapterWith({ save, saveProperty }));
		container.querySelector<HTMLButtonElement>('.link-swap')!.click();
		await settle();
		const dialog = container.querySelector<HTMLDialogElement>('dialog')!;
		const [, hrefInput] = [...dialog.querySelectorAll('input')];
		hrefInput.value = '/registre';
		hrefInput.dispatchEvent(new Event('input', { bubbles: true }));
		const desa = [...dialog.querySelectorAll('button')].find(
			(button) => button.textContent?.trim() === 'Desa'
		)!;
		desa.click();
		await settle();
		expect(save).not.toHaveBeenCalled();
		expect(saveProperty).toHaveBeenCalledWith(hrefDescriptor, '/registre');
		expect(dialog.open).toBe(false);
	});

	it('a rejection keeps the modal open and names the reason', async () => {
		const save = vi.fn(() => Promise.reject(new Error('El text no pot quedar buit.')));
		const { container } = bare(adapterWith({ save }));
		container.querySelector<HTMLButtonElement>('.link-swap')!.click();
		await settle();
		const dialog = container.querySelector<HTMLDialogElement>('dialog')!;
		const [textInput] = [...dialog.querySelectorAll('input')];
		textInput.value = 'Un altre text';
		textInput.dispatchEvent(new Event('input', { bubbles: true }));
		[...dialog.querySelectorAll('button')]
			.find((button) => button.textContent?.trim() === 'Desa')!
			.click();
		await settle();
		expect(dialog.open).toBe(true);
		expect(dialog.querySelector('[role="alert"]')?.textContent).toBe('El text no pot quedar buit.');
	});

	it('hides the Adreça field when the destination has no descriptor', async () => {
		const { container } = bare(adapterWith(), false);
		container.querySelector<HTMLButtonElement>('.link-swap')!.click();
		await settle();
		expect(container.querySelectorAll('dialog input')).toHaveLength(1);
	});
});

describe('the components that resolve their own keys', () => {
	const editingSetup = {
		adapter: adapterWith(),
		messageEdit: (key: string) => chromeEdit(key, 'ca')
	};

	it('NewsletterSignup offers both links as modals with the catalog destinations', async () => {
		const { container } = render(LinkEditProbe, {
			props: { ...editingSetup, mode: 'newsletter' as const }
		});
		const swaps = [...container.querySelectorAll<HTMLButtonElement>('.link-swap')];
		const signup = swaps.find((swap) => swap.textContent?.includes('Crea un compte'))!;
		signup.click();
		await settle();
		const dialog = [...container.querySelectorAll<HTMLDialogElement>('dialog')].find(
			(candidate) => candidate.open
		)!;
		const [, hrefInput] = [...dialog.querySelectorAll('input')];
		expect(hrefInput.value).toBe('/signup');
	});

	it('a catalog without the optional *Href keys keeps the built-in paths', () => {
		const oldCatalog = { ...defaultMessages } as Partial<UiMessages>;
		delete oldCatalog.comments_loginLinkHref;
		delete oldCatalog.comments_signupLinkHref;
		const { container } = render(LinkEditProbe, {
			props: { mode: 'comments' as const, messages: oldCatalog as UiMessages }
		});
		const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
		expect(hrefs).toContain('/login');
		expect(hrefs).toContain('/signup');
	});

	it('CommentSection routes its links through the catalog destinations', () => {
		const catalog = {
			...defaultMessages,
			comments_loginLinkHref: () => '/entrar',
			comments_signupLinkHref: () => '/registre'
		} as UiMessages;
		const { container } = render(LinkEditProbe, {
			props: { mode: 'comments' as const, messages: catalog }
		});
		const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
		expect(hrefs).toContain('/entrar');
		expect(hrefs).toContain('/registre');
	});
});
