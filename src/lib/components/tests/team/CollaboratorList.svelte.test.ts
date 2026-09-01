import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CollaboratorList from '../../team/CollaboratorList.svelte';
import type { CollaboratorData as Collaborator } from '../../../content/types.js';

/**
 * `url` is nullable and editable, and the branch a story enumerated decides
 * whether the affiliation is a link at all. An outbound link needs its `rel`;
 * the column is external by definition, so this is the one arm that matters.
 */

const withUrl: Collaborator = {
	personName: 'Ada',
	affiliation: 'Universitat',
	url: 'https://uni.example'
};

const items = () => [...document.querySelectorAll('li')];

describe('CollaboratorList', () => {
	it('links the affiliation outward when a url is set', () => {
		render(CollaboratorList, { collaborators: [withUrl] });

		const link = document.querySelector('a');
		expect(link?.getAttribute('href')).toBe('https://uni.example');
		expect(link?.getAttribute('rel')).toBe('external noopener');
	});

	it('renders the affiliation as plain text when there is no url', () => {
		render(CollaboratorList, { collaborators: [{ ...withUrl, url: null }] });

		expect(document.querySelector('a')).toBeNull();
		expect(document.body.textContent).toContain('Universitat');
	});

	it('names the person either way', () => {
		// The keyed each is personName + affiliation, so the two entries differ
		// in affiliation rather than only in url.
		render(CollaboratorList, {
			collaborators: [withUrl, { ...withUrl, affiliation: 'Institut', url: null }]
		});

		expect(items()).toHaveLength(2);
		expect(document.querySelectorAll('strong')).toHaveLength(2);
	});
});
