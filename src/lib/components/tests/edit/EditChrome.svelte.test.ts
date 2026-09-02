import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { EditAdapter, EntityOp, PropertyDescriptor } from '../../../edit/types.js';
import ChromeProbe from './ChromeProbe.svelte';

const dateDescriptor: PropertyDescriptor = {
	ref: { kind: 'entity', entity: 'milestones', id: 5, field: 'occurred_on' },
	type: 'date',
	label: 'Data'
};

const urlDescriptor: PropertyDescriptor = {
	ref: { kind: 'entity', entity: 'milestones', id: 5, field: 'link_url' },
	type: 'url',
	label: 'Enllaç',
	nullable: true
};

const selectDescriptor: PropertyDescriptor = {
	ref: { kind: 'entity', entity: 'milestones', id: 5, field: 'category' },
	type: 'select',
	label: 'Categoria',
	options: [
		{ value: 'lab', label: 'Laboratori' },
		{ value: 'press', label: 'Premsa' }
	]
};

const flagDescriptor: PropertyDescriptor = {
	ref: { kind: 'entity', entity: 'job_openings', id: 7, field: 'is_open' },
	type: 'flag',
	label: 'Estat',
	on: 'status_open',
	off: 'status_closed'
};

const removeOp: Extract<EntityOp, { kind: 'remove' }> = {
	kind: 'remove',
	collection: { entity: 'milestones' },
	id: 5
};

const addOp: Extract<EntityOp, { kind: 'create' }> = {
	kind: 'create',
	collection: { entity: 'milestones' },
	anchor: { id: 5, placement: 'before' }
};

function fullAdapter(overrides: Partial<EditAdapter> = {}): EditAdapter {
	return {
		isEditing: true,
		save: vi.fn(async () => {}),
		saveProperty: vi.fn(async () => {}),
		applyOp: vi.fn(async () => {}),
		...overrides
	};
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('EditFrame gating', () => {
	it('renders the children ALONE — byte-identical — when inactive', () => {
		const readOnly = render(ChromeProbe, {
			props: { adapter: null, spec: { label: 'Fita', hasPanel: true, removeOp } }
		});
		const bare = render(ChromeProbe, { props: { adapter: null } });

		const host = (container: ParentNode) =>
			container.querySelector('[data-testid="frame-host"]')!.innerHTML;
		expect(host(readOnly.container)).toBe(host(bare.container));
		expect(readOnly.container.querySelector('.vit-edit-frame')).toBeNull();
	});

	it('renders no frame when the adapter lacks every capability method', () => {
		const { container } = render(ChromeProbe, {
			props: {
				adapter: { isEditing: true, save: vi.fn(async () => {}) },
				spec: { label: 'Fita', hasPanel: true, removeOp }
			}
		});
		expect(container.querySelector('.vit-edit-frame')).toBeNull();
	});

	it('shows the gear only with a panel and saveProperty, the trash only with removeOp and applyOp', () => {
		const panelOnly = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ applyOp: undefined }),
				spec: { label: 'Fita', hasPanel: true, removeOp },
				rows: [{ descriptor: dateDescriptor, value: '2026-01-01' }]
			}
		});
		expect(panelOnly.container.querySelectorAll('.toolbar button')).toHaveLength(1);

		const trashOnly = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty: undefined }),
				spec: { label: 'Fita', hasPanel: true, removeOp }
			}
		});
		expect(trashOnly.container.querySelectorAll('.toolbar button')).toHaveLength(1);
	});

	it('confirming the trash applies the remove op', async () => {
		const applyOp = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: { adapter: fullAdapter({ applyOp }), spec: { label: 'Fita', removeOp } }
		});

		const trash = container.querySelector<HTMLButtonElement>('.toolbar button')!;
		trash.click();
		await settle();
		const confirm = [...document.querySelectorAll<HTMLButtonElement>('dialog button')].find(
			(button) => button.textContent?.trim() === 'Elimina'
		)!;
		confirm.click();
		await settle();
		expect(applyOp).toHaveBeenCalledWith(removeOp);
	});
});

describe('EditPanel rows', () => {
	function openPanel(container: ParentNode): void {
		container.querySelector<HTMLButtonElement>('.toolbar button')!.click();
	}

	it('a row commit hands the adapter the descriptor and the string value', async () => {
		const saveProperty = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				spec: { label: 'Fita', hasPanel: true },
				rows: [{ descriptor: dateDescriptor, value: '2026-01-01' }]
			}
		});
		openPanel(container);
		await settle();

		const input = container.querySelector<HTMLInputElement>('input[type="date"]')!;
		input.value = '2026-02-02';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(saveProperty).toHaveBeenCalledWith(dateDescriptor, '2026-02-02');
		expect(input.getAttribute('data-vit-editing')).toBe('idle');
	});

	it('emptying a nullable row saves null; the clear affordance does too', async () => {
		const saveProperty = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				spec: { label: 'Fita', hasPanel: true },
				rows: [{ descriptor: urlDescriptor, value: 'https://exemple.cat' }]
			}
		});
		openPanel(container);
		await settle();

		const input = container.querySelector<HTMLInputElement>('input[type="url"]')!;
		input.value = '  ';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();
		expect(saveProperty).toHaveBeenCalledWith(urlDescriptor, null);

		const clear = [...container.querySelectorAll<HTMLButtonElement>('button.aux')].find((button) =>
			button.textContent?.includes('Buida')
		);
		// After saving null the stored value is empty, so the affordance is gone.
		expect(clear).toBeUndefined();
	});

	it('a select row saves the chosen option value', async () => {
		const saveProperty = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				spec: { label: 'Fita', hasPanel: true },
				rows: [{ descriptor: selectDescriptor, value: 'lab' }]
			}
		});
		openPanel(container);
		await settle();

		const select = container.querySelector<HTMLSelectElement>('select')!;
		select.value = 'press';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(saveProperty).toHaveBeenCalledWith(selectDescriptor, 'press');
	});

	it('a flag row words its two states from the catalog and saves a boolean', async () => {
		const saveProperty = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				spec: { label: 'Oferta', hasPanel: true },
				rows: [
					{ descriptor: flagDescriptor, value: true },
					// Default wording: the published/draft pair (its own field — the
					// panel keys rows by ref + label).
					{
						descriptor: {
							ref: { kind: 'entity', entity: 'job_openings', id: 7, field: 'is_published' },
							type: 'flag',
							label: 'Publicació'
						},
						value: false
					}
				]
			}
		});
		openPanel(container);
		await settle();

		const [open, published] = [...container.querySelectorAll<HTMLSelectElement>('select')];
		expect([...open.options].map((option) => option.textContent)).toEqual(['Oberta', 'Tancada']);
		expect(open.value).toBe('true');
		expect([...published.options].map((option) => option.textContent)).toEqual([
			'Publicat',
			'Esborrany'
		]);
		expect(published.value).toBe('false');

		open.value = 'false';
		open.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		// The adapter receives the boolean, never the select's 'false' string.
		expect(saveProperty).toHaveBeenCalledWith(flagDescriptor, false);
		expect(open.getAttribute('data-vit-editing')).toBe('idle');
	});

	it('a failed save keeps the draft in the control, in the error state', async () => {
		const saveProperty = vi.fn(async () => {
			throw new Error('refused');
		});
		const { container } = render(ChromeProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				spec: { label: 'Fita', hasPanel: true },
				rows: [{ descriptor: dateDescriptor, value: '2026-01-01' }]
			}
		});
		openPanel(container);
		await settle();

		const input = container.querySelector<HTMLInputElement>('input[type="date"]')!;
		input.value = '2026-03-03';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(input.value).toBe('2026-03-03');
		expect(input.getAttribute('data-vit-editing')).toBe('error');
	});
});

describe('AddSlot', () => {
	it('renders nothing without applyOp, and fires the op with its anchor', async () => {
		const without = render(ChromeProbe, {
			props: { adapter: fullAdapter({ applyOp: undefined }), addOp }
		});
		expect(without.container.querySelector('button.add')).toBeNull();

		const applyOp = vi.fn(async () => {});
		const { container } = render(ChromeProbe, {
			props: { adapter: fullAdapter({ applyOp }), addOp }
		});
		const button = container.querySelector<HTMLButtonElement>('button.add')!;
		expect(button.textContent).toContain('Afegeix una fita');
		button.click();
		await settle();
		expect(applyOp).toHaveBeenCalledWith(addOp);
	});
});
