import { describe, expect, it } from 'vitest';
import { sampleProjectArticle } from '../../../fixtures.js';
import { entityEdit } from '../../../edit/helpers.js';
import ProjectPage from '../../pages/ProjectPage.svelte';
import {
	AFFORDANCES,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	textOf
} from './helpers.js';

const project = sampleProjectArticle;
const props = { project };
const edit = (() => {
	const field = entityEdit('projects', project.id, 'ca');
	return {
		title: field('title', { label: 'Títol' }),
		excerpt: field('excerpt', { label: 'Resum' }),
		body: field('body', { format: 'richtext', label: 'Cos' })
	};
})();

describe('ProjectPage, read-only', () => {
	it('titles itself from the project and renders header, hero, body, share and the preview card', async () => {
		const { container } = mountPage(ProjectPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe(`${project.title} — ViT`);
		expect(textOf(page, 'h1')).toEqual([project.title]);
		expect(textOf(page, '.excerpt')).toEqual([project.excerpt]);
		expect(page.querySelector('.back a')?.getAttribute('href')).toBe('/what-we-do');
		expect(page.querySelector('time')?.getAttribute('datetime')).toBe(project.publishedOn);
		expect(page.querySelector('img.hero')?.getAttribute('src')).toBe(project.imageUrl);
		expect(textOf(page, '.richtext h2')).toEqual(['Context']);
		expect(page.querySelector('.share')).not.toBeNull();
		const preview = page.querySelector<HTMLAnchorElement>('aside a.preview')!;
		expect(preview.getAttribute('href')).toBe(project.externalUrl);
		expect(preview.querySelector('img')?.getAttribute('src')).toBe(project.previewImageUrl);
		expect(preview.textContent?.trim()).toBe('aqli.example.org/index ↗');
	});

	it('omits the preview aside without an external URL, and the body without one', () => {
		const { container } = mountPage(ProjectPage, {
			props: { project: { ...project, externalUrl: null, body: null } }
		});
		const page = host(container);

		expect(page.querySelector('aside')).toBeNull();
		expect(page.querySelector('.richtext')).toBeNull();
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(ProjectPage, { props });
		const described = mountPage(ProjectPage, {
			props: { ...props, edit },
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('ProjectPage, editing', () => {
	it('routes title and excerpt inline, the body to RichText, and the back label through messageEdit', () => {
		const { container } = mountPage(ProjectPage, {
			props: { ...props, edit },
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Títol');
		expect(labelOf(page, '.excerpt')).toBe('Resum');
		expect(page.querySelector('.richtext .edit-row button')).not.toBeNull();
		expect(labelOf(page, '.back .action-label')).toBe('Text back_label');
		expect(page.querySelector('.back a')).toBeNull();
	});
});
