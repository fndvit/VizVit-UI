import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FilterChips from '../../ui/FilterChips.svelte';

const chips = [
	{ value: 'medi-ambient', label: 'Medi ambient' },
	{ value: 'societat', label: 'Societat' }
];

describe('FilterChips', () => {
	it('marks the selected chip with aria-pressed', async () => {
		render(FilterChips, { chips, selected: 'societat', label: 'Filtra', onchange: vi.fn() });

		await expect
			.element(page.getByRole('button', { name: 'Societat' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Medi ambient' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('reports the toggled value on click', async () => {
		const onchange = vi.fn();
		render(FilterChips, { chips, selected: null, label: 'Filtra', onchange });

		await page.getByRole('button', { name: 'Medi ambient' }).click();

		expect(onchange).toHaveBeenCalledWith('medi-ambient');
	});

	it('reports null when the active chip is clicked again', async () => {
		const onchange = vi.fn();
		render(FilterChips, { chips, selected: 'societat', label: 'Filtra', onchange });

		await page.getByRole('button', { name: 'Societat' }).click();

		expect(onchange).toHaveBeenCalledWith(null);
	});
});
