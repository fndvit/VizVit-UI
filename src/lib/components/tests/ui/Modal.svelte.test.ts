import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ModalProbe from './ModalProbe.svelte';

/**
 * Modal delegates modality to the native <dialog> — focus trap, top layer,
 * Escape — so what is ours to pin is the wiring: `open` drives showModal(),
 * the close control reports through `onclose`, and the heading renders.
 */
describe('Modal', () => {
	it('opens as a modal dialog when `open` is true', async () => {
		render(ModalProbe, { open: true });

		const dialog = document.querySelector('dialog');
		expect(dialog?.open).toBe(true);
		expect(dialog?.querySelector('h2')?.textContent).toBe('Un títol');
		expect(dialog?.querySelector('[data-testid="modal-body"]')).not.toBeNull();
	});

	it('stays closed when `open` is false', async () => {
		render(ModalProbe, { open: false });

		expect(document.querySelector('dialog')?.open).toBe(false);
	});

	it('closes through the close control', async () => {
		render(ModalProbe, { open: true });

		const dialog = document.querySelector('dialog');
		dialog?.querySelector('button')?.click();
		// The probe flips `open`; the effect closes the native dialog.
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(dialog?.open).toBe(false);
	});

	it('names its close control for screen readers, overridably', async () => {
		render(ModalProbe, { open: true });

		expect(document.querySelector('dialog button')?.getAttribute('aria-label')).toBe('Tanca');
	});
});
