import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectField from '../../ui/SelectField.svelte';

const OPTIONS = [
	{ value: 'ca', label: 'Català' },
	{ value: 'es', label: 'Castellà' },
	{ value: 'en', label: 'Anglès', disabled: true }
];

describe('SelectField', () => {
	it('labels the control and renders the options it is handed', async () => {
		render(SelectField, { id: 'locale', label: 'Idioma', options: OPTIONS });

		const label = document.querySelector('label');
		expect(label?.textContent).toBe('Idioma');
		expect(label?.getAttribute('for')).toBe('locale');
		const values = [...document.querySelectorAll('option')].map((option) => option.value);
		expect(values).toEqual(['ca', 'es', 'en']);
		expect(document.querySelector('option[value="en"]')?.hasAttribute('disabled')).toBe(true);
	});

	it('hides the label visually in bare, keeping it for readers', async () => {
		render(SelectField, { id: 'l', label: 'Idioma', variant: 'bare', options: OPTIONS });

		expect(document.querySelector('label')?.classList.contains('visually-hidden')).toBe(true);
	});

	/**
	 * The two placeholder meanings the call sites need: a value the reader may
	 * choose ("No manager") and one they must choose past ("choose…").
	 */
	it('renders a selectable empty option, or a disabled one for a placeholder', async () => {
		render(SelectField, {
			id: 'a',
			label: 'Manager',
			placeholder: { label: 'No manager' },
			options: OPTIONS
		});
		const selectable = document.querySelector('option');
		expect(selectable?.value).toBe('');
		expect(selectable?.hasAttribute('disabled')).toBe(false);

		document.body.innerHTML = '';
		render(SelectField, {
			id: 'b',
			label: 'Plantilla',
			placeholder: { label: 'tria…', disabled: true },
			options: OPTIONS
		});
		expect(document.querySelector('option')?.hasAttribute('disabled')).toBe(true);
	});

	it('wires an error to the control through aria, not just a red line', async () => {
		render(SelectField, {
			id: 'manager',
			label: 'Manager',
			options: OPTIONS,
			error: 'Aquest usuari no existeix'
		});

		const select = document.querySelector('select');
		expect(select?.getAttribute('aria-invalid')).toBe('true');
		expect(select?.getAttribute('aria-describedby')).toBe('manager-error');
		expect(document.getElementById('manager-error')?.textContent).toBe('Aquest usuari no existeix');
	});

	/** An error must not silence standing help: both ids travel. */
	it('describes by hint and error together, and by neither when there is neither', async () => {
		render(SelectField, {
			id: 'kind',
			label: 'Tipus',
			options: OPTIONS,
			hint: 'Es pot canviar més tard',
			error: 'Tria un tipus'
		});
		expect(document.querySelector('select')?.getAttribute('aria-describedby')).toBe(
			'kind-error kind-hint'
		);

		document.body.innerHTML = '';
		render(SelectField, { id: 'plain', label: 'Tipus', options: OPTIONS });
		const select = document.querySelector('select');
		expect(select?.hasAttribute('aria-describedby')).toBe(false);
		expect(select?.hasAttribute('aria-invalid')).toBe(false);
	});

	it('reports the chosen value to onchange as a string', async () => {
		const seen: string[] = [];
		render(SelectField, {
			id: 'year',
			label: 'Any',
			options: [
				{ value: '2026', label: '2026' },
				{ value: '2027', label: '2027' }
			],
			onchange: (value: string) => seen.push(value)
		});

		const select = document.querySelector('select')!;
		select.value = '2027';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		expect(seen).toEqual(['2027']);
	});

	it('spreads remote-form attributes instead of binding when given', async () => {
		render(SelectField, {
			id: 'category',
			label: 'Categoria',
			options: OPTIONS,
			attributes: { name: 'category' }
		});

		expect(document.querySelector('select')?.getAttribute('name')).toBe('category');
	});

	it('carries a name for a native form submit', async () => {
		render(SelectField, { id: 'table', label: 'Taula', name: 'table', options: OPTIONS });

		expect(document.querySelector('select')?.getAttribute('name')).toBe('table');
	});

	it('marks the filled variant, so a toolbar control is not a form field', async () => {
		render(SelectField, { id: 'y', label: 'Any', variant: 'pill', options: OPTIONS });

		expect(document.querySelector('.select-field')?.classList.contains('pill')).toBe(true);
	});
});
