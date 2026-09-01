import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WeeklieCard from '../../weeklies/WeeklieCard.svelte';
import { sampleWeekly as weekly } from '../../../fixtures.js';

describe('WeeklieCard', () => {
	it('renders number badge, date, title link, and excerpt', async () => {
		render(WeeklieCard, { weekly });

		await expect.element(page.getByText('#12')).toBeInTheDocument();
		const link = page.getByRole('link', { name: weekly.title });
		await expect
			.element(link)
			.toHaveAttribute('href', expect.stringContaining('/weeklies/el-planeta-enmig-d-una-galaxia'));
		await expect.element(page.getByText(weekly.excerpt)).toBeInTheDocument();
	});

	it('marks the published date with a machine-readable datetime', async () => {
		render(WeeklieCard, { weekly });

		const time = document.querySelector('time');
		expect(time?.getAttribute('datetime')).toBe('2026-08-10');
	});
});
