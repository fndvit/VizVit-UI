import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { EditDescriptor } from '../../../edit/types.js';
import RichTextEditProbe from './RichTextEditProbe.svelte';

const descriptor: EditDescriptor = {
	ref: { kind: 'entity', entity: 'weeklies', id: 12, field: 'body' },
	locale: 'ca',
	format: 'richtext',
	label: 'Cos del weekly'
};

const BODY = '## Un títol\n\nUn paràgraf.';

describe('RichText edit mode', () => {
	it('renders the blocks and no editor without an editing adapter', () => {
		const { container } = render(RichTextEditProbe, {
			props: {
				body: BODY,
				edit: descriptor,
				adapter: { isEditing: false, save: () => Promise.resolve() }
			}
		});

		expect(container.querySelector('h2')?.textContent).toBe('Un títol');
		expect(container.querySelector('textarea')).toBeNull();
		expect(container.querySelector('button')).toBeNull();
	});

	it('opens a source editor over the raw body and saves it', async () => {
		const saved: string[] = [];
		const { container } = render(RichTextEditProbe, {
			props: {
				body: BODY,
				edit: descriptor,
				adapter: {
					isEditing: true,
					save: async (_d, value) => {
						saved.push(value);
					}
				}
			}
		});

		await page.getByRole('button', { name: 'Edita' }).click();

		const textarea = container.querySelector('textarea');
		expect(textarea?.value).toBe(BODY);

		await page.getByRole('textbox', { name: 'Cos del weekly' }).fill('## Canviat\n\nNou text.');
		await page.getByRole('button', { name: 'Desa' }).click();

		await expect.poll(() => saved).toEqual(['## Canviat\n\nNou text.']);
		// The editor closes onto the updated rendering.
		await expect.poll(() => container.querySelector('h2')?.textContent).toBe('Canviat');
	});

	it('keeps the editor open with the draft when a save fails', async () => {
		const { container } = render(RichTextEditProbe, {
			props: {
				body: BODY,
				edit: descriptor,
				adapter: { isEditing: true, save: () => Promise.reject(new Error('offline')) }
			}
		});

		await page.getByRole('button', { name: 'Edita' }).click();
		await page.getByRole('textbox', { name: 'Cos del weekly' }).fill('Esborrany');
		await page.getByRole('button', { name: 'Desa' }).click();

		await expect.element(page.getByRole('alert')).toBeInTheDocument();
		expect(container.querySelector('textarea')?.value).toBe('Esborrany');
	});

	it('discards the draft on Cancel·la', async () => {
		const { container } = render(RichTextEditProbe, {
			props: {
				body: BODY,
				edit: descriptor,
				adapter: { isEditing: true, save: () => Promise.resolve() }
			}
		});

		await page.getByRole('button', { name: 'Edita' }).click();
		await page.getByRole('textbox', { name: 'Cos del weekly' }).fill('Descartat');
		await page.getByRole('button', { name: 'Cancel·la' }).click();

		expect(container.querySelector('textarea')).toBeNull();
		expect(container.querySelector('h2')?.textContent).toBe('Un títol');
	});
});
