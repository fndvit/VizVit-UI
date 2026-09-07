import { describe, expect, it } from 'vitest';
import { samplePageCopy } from '../../../fixtures.js';
import LegalPage from '../../pages/LegalPage.svelte';
import {
	AFFORDANCES,
	copyEditFor,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	textOf
} from './helpers.js';

const content = { ...samplePageCopy('legal'), body: 'Primer paràgraf.\n\n## Secció\n\nSegon.' };
const props = { content };

describe('LegalPage, read-only', () => {
	it('titles itself from the copy heading and renders the body as rich text on the chrome shell', async () => {
		const { container } = mountPage(LegalPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${content.heading} — ViT`);
		expect(textOf(page, 'h1')).toEqual([content.heading]);
		expect(page.querySelector('.page.chrome')).not.toBeNull();
		expect(textOf(page, '.richtext h2')).toEqual(['Secció']);
		expect(textOf(page, '.richtext p')).toEqual(['Primer paràgraf.', 'Segon.']);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(LegalPage, { props });
		const described = mountPage(LegalPage, {
			props: { ...props, edit: { copy: copyEditFor('legal') } },
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('LegalPage, editing', () => {
	it('opens the heading inline and the body through RichText’s source editor', () => {
		const { container } = mountPage(LegalPage, {
			props: { ...props, edit: { copy: copyEditFor('legal') } },
			adapter: fullAdapter()
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Bloc heading');
		expect(page.querySelector('.richtext .edit-row button')).not.toBeNull();
	});
});
