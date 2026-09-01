import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProjectCard from '../../projects/ProjectCard.svelte';
import type { ProjectCardData } from '../../../content/types.js';

/**
 * The card's three-way link decision, which a story enumerated and nothing
 * asserted. `hasStory` is what the card links on, and it is the same question
 * /what-we-do/[slug] answers with a 404 — so getting the arms wrong offers a
 * reader a link to nothing, or hides a page that exists.
 */

const base: ProjectCardData = {
	id: 1,
	slug: 'estudi',
	kind: 'passion',
	publishedOn: '2026-01-01',
	title: 'Estudi',
	excerpt: 'Un resum.',
	imageUrl: '/img.jpg',
	externalUrl: null,
	hasStory: false
};

const card = (over: Partial<ProjectCardData> = {}) => ({ ...base, ...over });
const links = () => [...document.querySelectorAll('a')];

describe('ProjectCard', () => {
	it('links the title to the detail page when the project has a story', () => {
		render(ProjectCard, { project: card({ hasStory: true }) });

		expect(links().map((a) => a.getAttribute('href'))).toContain('/what-we-do/estudi');
	});

	it('prefers the detail page over an external URL when both exist', () => {
		// hasStory wins: the story is ours and the outbound link is not a
		// substitute for it.
		render(ProjectCard, { project: card({ hasStory: true, externalUrl: 'https://x.example' }) });

		const title = links()[0];
		expect(title.getAttribute('href')).toBe('/what-we-do/estudi');
		expect(title.getAttribute('rel')).toBeNull();
	});

	it('links the title outward when there is no story but an external URL', () => {
		render(ProjectCard, { project: card({ externalUrl: 'https://x.example/a' }) });

		const title = links()[0];
		expect(title.getAttribute('href')).toBe('https://x.example/a');
		expect(title.getAttribute('rel')).toBe('external noopener');
	});

	it('renders the title as plain text when there is neither', () => {
		render(ProjectCard, { project: card() });

		expect(links()).toHaveLength(0);
		expect(document.body.textContent).toContain('Estudi');
	});

	it('offers the read-more link only where a detail page exists', () => {
		render(ProjectCard, { project: card({ externalUrl: 'https://x.example' }) });

		expect(links().filter((a) => a.className.includes('more'))).toHaveLength(0);
	});
});
