import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { EditAdapter, EditDescriptor } from '../../../edit/types.js';
import EditableProbe from './EditableProbe.svelte';

const descriptor: EditDescriptor = {
	ref: { kind: 'page-copy', page: 'home', sectionKey: 'hero_title' },
	locale: 'ca',
	label: 'Títol'
};

interface SaveCall {
	descriptor: EditDescriptor;
	value: string;
}

function adapterWith(
	save: (descriptor: EditDescriptor, value: string) => Promise<void>,
	isEditing = true
): EditAdapter {
	return { isEditing, save };
}

function target(container: ParentNode): HTMLElement {
	const element = container.querySelector<HTMLElement>('[data-testid="target"]');
	if (!element) throw new Error('probe target not rendered');
	return element;
}

/** Simulates the reader editing the node: the DOM owns the draft. */
function type(element: HTMLElement, text: string): void {
	element.textContent = text;
	element.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Editable', () => {
	it('renders a plain element with no adapter in context', () => {
		const { container } = render(EditableProbe, {
			props: { value: 'Hola', edit: descriptor, adapter: null }
		});

		const element = target(container);
		expect(element.getAttribute('contenteditable')).toBeNull();
		expect(element.getAttribute('role')).toBeNull();
		expect(element.textContent).toBe('Hola');
	});

	it('renders a plain element with an adapter whose edit mode is off', () => {
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(() => Promise.resolve(), false)
			}
		});

		expect(target(container).getAttribute('contenteditable')).toBeNull();
	});

	it('renders a plain element with no descriptor, even in edit mode', () => {
		const { container } = render(EditableProbe, {
			props: { value: 'Hola', adapter: adapterWith(() => Promise.resolve()) }
		});

		expect(target(container).getAttribute('contenteditable')).toBeNull();
	});

	it('becomes a labelled textbox when a descriptor meets an editing adapter', () => {
		const { container } = render(EditableProbe, {
			props: { value: 'Hola', edit: descriptor, adapter: adapterWith(() => Promise.resolve()) }
		});

		const element = target(container);
		expect(element.getAttribute('contenteditable')).toBe('plaintext-only');
		expect(element.getAttribute('role')).toBe('textbox');
		expect(element.getAttribute('aria-label')).toBe('Títol');
		expect(element.getAttribute('data-vit-editing')).toBe('idle');
	});

	it('saves the trimmed draft on blur and settles back to idle', async () => {
		const calls: SaveCall[] = [];
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(async (d, v) => {
					calls.push({ descriptor: d, value: v });
				})
			}
		});

		const element = target(container);
		type(element, '  Adeu  ');
		element.dispatchEvent(new FocusEvent('blur'));

		await expect.poll(() => calls).toEqual([{ descriptor, value: 'Adeu' }]);
		await expect.poll(() => element.getAttribute('data-vit-editing')).toBe('idle');
		// The committed draft stays on screen; the stale prop must not repaint it.
		expect(element.textContent).toBe('  Adeu  ');
	});

	it('commits a single-line field on Enter', async () => {
		const calls: SaveCall[] = [];
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(async (d, v) => {
					calls.push({ descriptor: d, value: v });
				})
			}
		});

		const element = target(container);
		type(element, 'Nou títol');
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		await expect.poll(() => calls.map((call) => call.value)).toEqual(['Nou títol']);
	});

	it('commits a multiline field on Ctrl+Enter, not on Enter', async () => {
		const calls: SaveCall[] = [];
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: { ...descriptor, format: 'multiline' as const },
				adapter: adapterWith(async (d, v) => {
					calls.push({ descriptor: d, value: v });
				})
			}
		});

		const element = target(container);
		type(element, 'Línia una');
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(calls).toEqual([]);

		element.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })
		);
		await expect.poll(() => calls.map((call) => call.value)).toEqual(['Línia una']);
	});

	it('does not call save when the draft matches the saved value', async () => {
		const calls: SaveCall[] = [];
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(async (d, v) => {
					calls.push({ descriptor: d, value: v });
				})
			}
		});

		const element = target(container);
		type(element, 'Hola');
		element.dispatchEvent(new FocusEvent('blur'));

		await expect.poll(() => element.getAttribute('data-vit-editing')).toBe('idle');
		expect(calls).toEqual([]);
	});

	it('keeps the draft and shows the error state when a save fails', async () => {
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(() => Promise.reject(new Error('offline')))
			}
		});

		const element = target(container);
		type(element, 'Esborrany');
		element.dispatchEvent(new FocusEvent('blur'));

		await expect.poll(() => element.getAttribute('data-vit-editing')).toBe('error');
		// Nothing typed is lost.
		expect(element.textContent).toBe('Esborrany');
	});

	it('reverts to the last saved value on Escape', async () => {
		const calls: SaveCall[] = [];
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(async (d, v) => {
					calls.push({ descriptor: d, value: v });
				})
			}
		});

		const element = target(container);
		type(element, 'Descartat');
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

		await expect.poll(() => element.textContent).toBe('Hola');
		expect(calls).toEqual([]);
	});
});

describe('editMessages', () => {
	it('announcements come from config.editMessages, not hardcoded copy', async () => {
		const { container } = render(EditableProbe, {
			props: {
				value: 'Hola',
				edit: descriptor,
				adapter: adapterWith(() => Promise.resolve()),
				editMessages: {
					edit_saving: () => 'SAVING…',
					edit_saved: () => 'SAVED',
					edit_saveError: () => 'FAILED',
					edit_save: () => 'x',
					edit_cancel: () => 'x',
					edit_edit: () => 'x',
					edit_preview: () => 'x',
					edit_editBody: () => 'x',
					edit_properties: () => 'x',
					edit_remove: () => 'x',
					edit_removeConfirm: () => 'x',
					edit_close: () => 'x',
					edit_add: () => 'x',
					edit_addFailed: () => 'x',
					edit_uploadImage: () => 'x',
					edit_draftBadge: () => 'Esborrany (proves)',
					edit_clearValue: () => 'x',
					edit_emptyRequired: () => 'x',
					edit_editLink: () => 'x',
					edit_linkText: () => 'x',
					edit_linkUrl: () => 'x'
				}
			}
		});

		const element = target(container);
		type(element, 'Adeu');
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(container.querySelector('[role="status"]')?.textContent).toBe('SAVED');
	});
});
