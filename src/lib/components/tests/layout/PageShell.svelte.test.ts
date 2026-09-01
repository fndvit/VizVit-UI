import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';
import PageShell from '../../layout/PageShell.svelte';

const children = createRawSnippet(() => ({ render: () => '<p>Contingut</p>' }));

describe('PageShell', () => {
	it('appends the site name to a page title', async () => {
		render(PageShell, { title: 'Transparència', children });

		await expect.poll(() => document.title).toBe('Transparència — ViT');
	});

	// content.getPage returns '' for a page_content row that is missing, so an
	// untitled page is a reachable state, not a programming error. It used to
	// render as a dangling ' — ViT'.
	it('renders the site name alone when the page has no title copy', async () => {
		render(PageShell, { title: '', children });

		await expect.poll(() => document.title).toBe('ViT');
	});

	it('omits the meta description when the page has none', async () => {
		render(PageShell, { title: 'Qui som', children });

		await expect.poll(() => document.querySelector('meta[name="description"]')).toBeNull();
	});

	it('emits the meta description when the page has one', async () => {
		render(PageShell, { title: 'Qui som', description: 'L’equip de la Fundació', children });

		await expect
			.poll(() => document.querySelector('meta[name="description"]')?.getAttribute('content'))
			.toBe('L’equip de la Fundació');
	});
});
