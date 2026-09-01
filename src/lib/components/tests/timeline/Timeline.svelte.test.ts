import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Timeline from '../../timeline/Timeline.svelte';
import type { MilestoneData as Milestone } from '../../../content/types.js';

const milestones: Milestone[] = [
	{
		id: 1,
		occurredOn: '2024-03-01',
		category: 'lab',
		title: 'Primer prototip',
		body: 'Un experiment de laboratori.',
		imageUrls: [],
		linkUrl: null
	},
	{
		id: 2,
		occurredOn: '2024-09-15',
		category: 'education',
		title: 'Taller a la universitat',
		body: null,
		imageUrls: [],
		linkUrl: null
	},
	{
		id: 3,
		occurredOn: '2025-02-10',
		category: 'foundation',
		title: 'Informe anual',
		body: null,
		imageUrls: [],
		linkUrl: '/transparency'
	}
];

describe('Timeline', () => {
	it('renders every milestone with its category label', async () => {
		render(Timeline, { milestones, variant: 'compact' });

		await expect.element(page.getByText('Primer prototip')).toBeInTheDocument();
		await expect.element(page.getByText('Taller a la universitat')).toBeInTheDocument();
		expect(document.querySelectorAll('article')).toHaveLength(3);
	});

	it('shows year markers only once per year in the full variant', async () => {
		render(Timeline, { milestones, variant: 'full' });

		await expect.element(page.getByText('Informe anual')).toBeInTheDocument();
		const years = [...document.querySelectorAll('.year')].map((el) => el.textContent);
		expect(years).toEqual(['2024', '2025']);
	});

	it('is a keyboard-reachable scroll region with an accessible name', async () => {
		render(Timeline, { milestones, variant: 'full' });

		const region = page.getByRole('region');
		await expect.element(region).toHaveAttribute('tabindex', '0');
		await expect.element(region).toHaveAttribute('aria-label');
	});

	it('colors milestone dots from the category series tokens', async () => {
		render(Timeline, { milestones: [milestones[0]], variant: 'compact' });

		await expect.element(page.getByText('Primer prototip')).toBeInTheDocument();
		const article = document.querySelector('article');
		expect(article?.getAttribute('style')).toContain('var(--series-2)');
	});
});

describe('milestone link_url', () => {
	/**
	 * `link_url` is an unconstrained editable column and the `press` category
	 * exists for coverage on someone else's site. Routed through Link, an
	 * absolute URL comes back with our locale segment spliced into a foreign
	 * path and no `rel` — an anchor that renders correctly and breaks on click.
	 */
	const withLink = (linkUrl: string): Milestone[] => [
		{
			id: 9,
			occurredOn: '2025-06-01',
			category: 'press',
			title: 'Cobertura',
			body: null,
			imageUrls: [],
			linkUrl
		}
	];

	const anchor = () => {
		const found = document.querySelector<HTMLAnchorElement>('.more a');
		if (!found) throw new Error('milestone rendered no link');
		return found;
	};

	it('sends an internal path through Paraglide localization', () => {
		render(Timeline, { milestones: withLink('/what-we-do/estudi'), variant: 'full' });

		expect(anchor().getAttribute('href')).toBe('/what-we-do/estudi');
		expect(anchor().getAttribute('rel')).toBeNull();
	});

	it('leaves an external URL intact, and marks it as outbound', () => {
		render(Timeline, { milestones: withLink('https://diari.example/article'), variant: 'full' });

		expect(anchor().getAttribute('href')).toBe('https://diari.example/article');
		expect(anchor().getAttribute('rel')).toBe('external noopener');
	});

	it('treats a protocol-relative URL as external too', () => {
		// //evil.example is another origin, and localizeHref would still splice.
		render(Timeline, { milestones: withLink('//diari.example/article'), variant: 'full' });

		expect(anchor().getAttribute('href')).toBe('//diari.example/article');
		expect(anchor().getAttribute('rel')).toBe('external noopener');
	});
});
