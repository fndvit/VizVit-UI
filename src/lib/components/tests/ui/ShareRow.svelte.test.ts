import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ShareRow from '../../ui/ShareRow.svelte';

/**
 * ShareRow read the page URL and the clipboard at module scope, so neither was
 * in its interface and none of the copy branches could be reached. They are
 * parameters now, the same way the form components take their remote function.
 */
const URL_UNDER_TEST = 'https://fundaciovit.org/weeklies/dades-obertes';

describe('ShareRow', () => {
	it('builds share links from the URL it is given', async () => {
		render(ShareRow, { title: 'Dades obertes', url: URL_UNDER_TEST });

		const encoded = encodeURIComponent(URL_UNDER_TEST);
		await expect
			.element(page.getByRole('link', { name: 'X' }))
			.toHaveAttribute(
				'href',
				`https://twitter.com/intent/tweet?url=${encoded}&text=Dades%20obertes`
			);
		await expect
			.element(page.getByRole('link', { name: 'LinkedIn' }))
			.toHaveAttribute('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`);
	});

	it('copies the shared URL and confirms it', async () => {
		const writes: string[] = [];
		render(ShareRow, {
			title: 'Dades obertes',
			url: URL_UNDER_TEST,
			writeClipboard: async (text) => void writes.push(text)
		});

		await page.getByRole('button').click();

		expect(writes).toEqual([URL_UNDER_TEST]);
		await expect.element(page.getByRole('status')).toHaveTextContent(/copiat|copied|copiado/i);
	});

	it('drops the confirmation once the reset window passes', async () => {
		vi.useFakeTimers();
		try {
			render(ShareRow, {
				title: 'Dades obertes',
				url: URL_UNDER_TEST,
				writeClipboard: async () => {},
				copiedResetMs: 10
			});

			document.querySelector('button')?.click();
			await vi.advanceTimersByTimeAsync(0);
			expect(document.querySelector('[role="status"]')?.textContent).toMatch(
				/copiat|copied|copiado/i
			);

			await vi.advanceTimersByTimeAsync(11);

			expect(document.querySelector('[role="status"]')?.textContent).toBe('');
		} finally {
			vi.useRealTimers();
		}
	});

	it('stays silent when the clipboard write is refused', async () => {
		render(ShareRow, {
			title: 'Dades obertes',
			url: URL_UNDER_TEST,
			writeClipboard: async () => Promise.reject(new Error('denied'))
		});

		await page.getByRole('button').click();

		// No confirmation, and no unhandled rejection reaching the page.
		await expect.element(page.getByRole('status')).toHaveTextContent('');
	});
});
