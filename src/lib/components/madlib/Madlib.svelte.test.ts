import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Madlib from './Madlib.svelte';
import type { MadlibControls } from './Madlib.svelte';
import type { SentenceNode } from './sentenceTree.js';

/**
 * `<Madlib>` as a projection of the tree helpers: what it draws for a path,
 * and which path it hands back for a pick. The arithmetic itself is pinned in
 * `sentenceTree.test.ts`; these check the seam between it and the DOM — that
 * a toggle and a dropdown both route through `replaceAt`, that a lead line and
 * a body line come out of `controls`, and that a leaf's connector trails.
 */
const by = (): SentenceNode[] => [
	{ id: 'area', label: 'area' },
	{ id: 'percent', label: 'percent' }
];

const tree: SentenceNode = {
	id: 'root',
	label: 'Farming in the',
	children: [
		{
			id: 'present',
			label: 'present',
			connector: 'show me where',
			children: [
				{ id: 'all', label: 'all crops', connector: 'are grown, by', children: by() },
				{ id: 'maize', label: 'maize', connector: 'is grown, by', children: by() }
			]
		},
		{
			id: 'future',
			label: 'future',
			connector: 'show me land suitable for',
			children: [{ id: 'wheat', label: 'wheat', connector: 'and nothing else' }]
		}
	]
};

const headline: MadlibControls = (depth) => (depth === 0 ? 'toggle' : 'dropdown');

describe('Madlib', () => {
	it('renders one control per level of the path, introduced by the text before it', async () => {
		render(Madlib, { tree, path: ['present', 'maize', 'percent'], onchange: () => {} });

		await expect.element(page.getByText('Farming in the')).toBeInTheDocument();
		await expect.element(page.getByText('show me where')).toBeInTheDocument();
		await expect.element(page.getByText('is grown, by')).toBeInTheDocument();
		// Every level is a dropdown by default: three triggers, one per level.
		expect(document.querySelectorAll('[aria-haspopup="listbox"]')).toHaveLength(3);
	});

	it('renders a toggle level as its options in the text, the chosen one pressed', async () => {
		render(Madlib, {
			tree,
			path: ['present', 'all', 'area'],
			onchange: () => {},
			controls: headline
		});

		await expect
			.element(page.getByRole('button', { name: 'present' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'future' }))
			.toHaveAttribute('aria-pressed', 'false');
		// The toggle takes the lead line; the two dropdowns share the body line.
		expect(document.querySelectorAll('.vit-madlib__line--lead')).toHaveLength(1);
		expect(document.querySelectorAll('.vit-madlib__line--body')).toHaveLength(1);
		expect(document.querySelectorAll('[aria-haspopup="listbox"]')).toHaveLength(2);
	});

	it('hands back a full path when a toggle is clicked, reset below the change', async () => {
		let received: string[] | undefined;
		render(Madlib, {
			tree,
			path: ['present', 'maize', 'percent'],
			onchange: (path) => (received = path),
			controls: headline
		});

		await page.getByRole('button', { name: 'future' }).click();

		expect(received).toEqual(['future', 'wheat']);
	});

	it('hands back a full path when a dropdown option is picked, keeping what still applies', async () => {
		let received: string[] | undefined;
		render(Madlib, {
			tree,
			path: ['present', 'maize', 'percent'],
			onchange: (path) => (received = path)
		});

		// Open the crop dropdown (the second trigger) and pick "all crops".
		const triggers = document.querySelectorAll<HTMLButtonElement>('[aria-haspopup="listbox"]');
		triggers[1].click();
		await page.getByRole('option', { name: 'all crops' }).click();

		// "by percent" exists under "all crops" too, so it is kept.
		expect(received).toEqual(['present', 'all', 'percent']);
	});

	it('fires onopen before a dropdown opens, so a cycling host can stop', async () => {
		const calls: string[] = [];
		render(Madlib, {
			tree,
			path: ['present', 'maize', 'percent'],
			onchange: () => calls.push('change'),
			onopen: () => calls.push('open')
		});

		document.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')?.click();
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();

		expect(calls).toEqual(['open']);
	});

	it('renders a leaf connector as trailing text', async () => {
		render(Madlib, { tree, path: ['future', 'wheat'], onchange: () => {} });

		await expect.element(page.getByText('and nothing else')).toBeInTheDocument();
	});

	it('lets a connector that opens with punctuation hug the control before it', async () => {
		const punctuated: SentenceNode = {
			id: 'root',
			label: 'Between',
			children: [
				{
					id: 'p1',
					label: '2040-2069',
					connector: ', under a',
					children: [{ id: 's', label: 'sustainable scenario' }]
				}
			]
		};
		render(Madlib, { tree: punctuated, path: ['p1', 's'], onchange: () => {} });

		await expect.element(page.getByText(', under a')).toBeInTheDocument();
		// No leading space in the connector's own text node — the ordinary lead
		// gets one — so the comma sits against the control before it.
		const texts = [...document.querySelectorAll('.vit-madlib__text')].map((s) => s.textContent);
		expect(texts).toContain(', under a ');
		expect(texts).toContain(' Between ');
	});

	it('renders only the leading text for an empty path', async () => {
		render(Madlib, { tree, path: [], onchange: () => {} });

		await expect.element(page.getByText('Farming in the')).toBeInTheDocument();
		expect(document.querySelectorAll('[aria-haspopup="listbox"]')).toHaveLength(0);
	});
});
