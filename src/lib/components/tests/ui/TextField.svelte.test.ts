import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TextField from '../../ui/TextField.svelte';

describe('TextField', () => {
	it('shows the label and derives a lowercase placeholder in the field variant', async () => {
		render(TextField, { id: 'name', label: 'Nom' });

		const label = document.querySelector('label');
		expect(label?.textContent).toBe('Nom');
		expect(label?.classList.contains('visually-hidden')).toBe(false);
		expect(document.querySelector('input')?.getAttribute('placeholder')).toBe('nom');
	});

	it('hides the label visually in cell and bare, keeping it for readers', async () => {
		for (const variant of ['cell', 'bare'] as const) {
			document.body.innerHTML = '';
			render(TextField, { id: 'f', label: 'Cerca', variant });

			expect(document.querySelector('label')?.classList.contains('visually-hidden'), variant).toBe(
				true
			);
		}
	});

	it('wires an error to the input through aria, not just a red line', async () => {
		render(TextField, { id: 'email', label: 'Correu', error: 'Cal un correu vàlid' });

		const input = document.querySelector('input');
		expect(input?.getAttribute('aria-invalid')).toBe('true');
		expect(input?.getAttribute('aria-describedby')).toBe('email-error');
		expect(document.getElementById('email-error')?.textContent).toBe('Cal un correu vàlid');
	});

	it('spreads remote-form attributes instead of binding when given', async () => {
		render(TextField, {
			id: 'email',
			label: 'Correu',
			attributes: { name: 'email', type: 'email' }
		});

		const input = document.querySelector('input');
		expect(input?.getAttribute('name')).toBe('email');
		// The form's `as(...)` owns the type; the prop default must not win.
		expect(input?.getAttribute('type')).toBe('email');
	});
});
