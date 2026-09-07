import { describe, expect, it } from 'vitest';
import type { ProjectCardData } from '../../../content/types.js';
import { samplePageCopy, sampleProject } from '../../../fixtures.js';
import WhatWeDoPage from '../../pages/WhatWeDoPage.svelte';
import {
	AFFORDANCES,
	copyEditFor,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	rowSpy,
	textOf
} from './helpers.js';

const content = samplePageCopy('what-we-do');
const latest = sampleProject;
const collaborations = [{ ...sampleProject, id: 2, slug: 'dos', title: 'Dos' }];
const passion = [
	{ ...sampleProject, id: 3, slug: 'tres', title: 'Tres', kind: 'passion' as const },
	{ ...sampleProject, id: 4, slug: 'quatre', title: 'Quatre', kind: 'passion' as const }
];
const props = { content, latest, collaborations, passion };

describe('WhatWeDoPage, read-only', () => {
	it('titles itself from the nav key and renders the showcase and the two groups', async () => {
		const { container } = mountPage(WhatWeDoPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe('Què fem — ViT');
		expect(textOf(page, 'h1')).toEqual(['Què fem']);
		expect(textOf(page, 'h2')).toEqual([
			content.latest_heading,
			content.collaborations_heading,
			content.passion_heading
		]);
		expect(page.querySelectorAll('.latest > article')).toHaveLength(1);
		expect(page.querySelectorAll('.stack > article')).toHaveLength(collaborations.length);
		expect(page.querySelectorAll('.grid > article')).toHaveLength(passion.length);
	});

	it('drops the showcase band when there is no latest project', () => {
		const { container } = mountPage(WhatWeDoPage, { props: { ...props, latest: null } });

		expect(host(container).querySelector('.latest')).toBeNull();
		expect(textOf(host(container), 'h2')).toHaveLength(2);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(WhatWeDoPage, { props });
		const described = mountPage(WhatWeDoPage, {
			props: { ...props, edit: { copy: copyEditFor('what-we-do') } },
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('WhatWeDoPage, editing', () => {
	it('routes copy and the h1 key, and asks projectFor once per card across the three groups', () => {
		const projectFor = rowSpy<ProjectCardData>();
		const { container } = mountPage(WhatWeDoPage, {
			props: { ...props, edit: { copy: copyEditFor('what-we-do'), projectFor } },
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Text nav_whatWeDo');
		expect(labelOf(page, '#latest-heading')).toBe('Bloc latest_heading');
		expect(labelOf(page, '#passion-heading')).toBe('Bloc passion_heading');
		expect(projectFor.mock.calls.map(([p]) => p)).toEqual([latest, ...collaborations, ...passion]);
	});
});
