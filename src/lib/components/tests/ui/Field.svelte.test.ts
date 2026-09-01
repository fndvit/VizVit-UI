import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldProbe from './FieldProbe.svelte';

/**
 * Field owns the wiring a caller cannot see going wrong: label/control
 * association, the error paragraph's id, and aria-describedby appearing only
 * while there is something to describe.
 *
 * The message itself is no longer the caller's to supply — Field renders the
 * issue the schema produced, so the constraint and the sentence describing it
 * have one owner (the host app's schema layer).
 */
describe('Field', () => {
	it('associates the label with the control', async () => {
		render(FieldProbe, { id: 'body', label: 'Comentari' });

		await expect.element(page.getByLabelText('Comentari')).toBeInTheDocument();
	});

	it('keeps the label accessible when hidden', async () => {
		render(FieldProbe, { id: 'body', label: 'Comentari', hideLabel: true });

		// Still the accessible name; just not shown.
		await expect.element(page.getByLabelText('Comentari')).toBeInTheDocument();
		expect(document.querySelector('label')?.className).toContain('visually-hidden');
	});

	it('describes the control only while the field has issues', async () => {
		render(FieldProbe, { id: 'body', label: 'Comentari' });

		const control = document.getElementById('body');
		expect(control?.getAttribute('aria-describedby')).toBeNull();
		expect(document.getElementById('body-error')).toBeNull();
	});

	it('renders the failing validation message and wires it as the description', async () => {
		render(FieldProbe, {
			id: 'body',
			label: 'Comentari',
			issues: [{ message: 'Escriu un comentari (màxim 2000 caràcters).' }]
		});

		await expect
			.element(page.getByLabelText('Comentari'))
			.toHaveAccessibleDescription('Escriu un comentari (màxim 2000 caràcters).');
		expect(document.getElementById('body-error')?.textContent).toBe(
			'Escriu un comentari (màxim 2000 caràcters).'
		);
	});

	it('shows the first issue when a field has several', async () => {
		render(FieldProbe, {
			id: 'body',
			label: 'Comentari',
			issues: [{ message: 'primer' }, { message: 'segon' }]
		});

		expect(document.getElementById('body-error')?.textContent).toBe('primer');
	});

	/**
	 * The constraint's other half. The sentence already came from the schema;
	 * the number was imported by each form and written beside the input, which
	 * is how the password and email bounds came to be enforced on the server
	 * and stated nowhere in the markup.
	 */
	it('constrains the control to the bounds the schema declared', () => {
		render(FieldProbe, {
			id: 'body',
			label: 'Comentari',
			constraint: { min: 8, max: 200 }
		});

		const control = document.getElementById('body');
		expect(control?.getAttribute('maxlength')).toBe('200');
		expect(control?.getAttribute('minlength')).toBe('8');
	});

	it('states only the bounds a constraint actually has', () => {
		// An upper-bounded field must not acquire a minimum it never declared:
		// on the login password that would refuse a valid older password in the
		// browser before the server ever saw it.
		render(FieldProbe, { id: 'body', label: 'Comentari', constraint: { max: 200 } });

		const control = document.getElementById('body');
		expect(control?.getAttribute('maxlength')).toBe('200');
		expect(control?.getAttribute('minlength')).toBeNull();
	});

	it('leaves a control with no constraint unconstrained', () => {
		render(FieldProbe, { id: 'body', label: 'Comentari' });

		const control = document.getElementById('body');
		expect(control?.getAttribute('maxlength')).toBeNull();
		expect(control?.getAttribute('minlength')).toBeNull();
	});
});
