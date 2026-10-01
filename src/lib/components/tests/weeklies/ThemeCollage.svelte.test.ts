import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { sampleThemes } from '../../../fixtures.js';
import ThemeCollage from '../../weeklies/ThemeCollage.svelte';
import ThemeCollageProbe from './ThemeCollageProbe.svelte';
import { fullAdapter, host, mountPage } from '../pages/helpers.js';

const themeHref = (theme: { slug: string }) => `/weeklies?theme=${theme.slug}`;

describe('ThemeCollage', () => {
	it('pictures at most four themes, each a link to its weeklies with its name as the label', () => {
		const five = [...sampleThemes, { id: 5, slug: 'cinque', name: 'Cinquè', imageUrl: null }];
		const { container } = render(ThemeCollage, { props: { themes: five, themeHref } });

		const items = [...container.querySelectorAll<HTMLAnchorElement>('.theme a')];
		expect(items.map((a) => a.getAttribute('href'))).toEqual(
			sampleThemes.map((theme) => `/weeklies?theme=${theme.slug}`)
		);
		expect(items.map((a) => a.querySelector('.label')?.textContent)).toEqual(
			sampleThemes.map((theme) => theme.name)
		);
		// Each slot has its own place in the stagger.
		expect(
			[...container.querySelectorAll('.theme')].map((el) =>
				['first', 'second', 'third', 'fourth'].find((c) => el.classList.contains(c))
			)
		).toEqual(['first', 'second', 'third', 'fourth']);
	});

	it('draws a theme without a picture as a flat tint, and a picture as a decorative image', () => {
		const { container } = render(ThemeCollage, { props: { themes: sampleThemes, themeHref } });

		const pictures = [...container.querySelectorAll('.picture')];
		expect(pictures.map((p) => p.classList.contains('blank'))).toEqual([false, false, false, true]);
		expect(pictures.map((p) => p.querySelector('img')?.getAttribute('src') ?? null)).toEqual(
			sampleThemes.map((theme) => theme.imageUrl)
		);
		expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
	});

	it('edits a theme in place: the name becomes text, not a link, and the picture is a panel row', () => {
		const editFor = (theme: { id: number; name: string }) => ({
			name: {
				ref: { kind: 'entity' as const, entity: 'themes' as const, id: theme.id, field: 'name' },
				locale: 'ca' as const,
				label: `Nom ${theme.name}`
			},
			image: {
				ref: {
					kind: 'entity' as const,
					entity: 'themes' as const,
					id: theme.id,
					field: 'imageUrl'
				},
				type: 'image' as const,
				label: 'Imatge'
			},
			label: `Tema ${theme.name}`
		});
		const { container } = mountPage(ThemeCollage, {
			props: { themes: sampleThemes, themeHref, editFor },
			adapter: fullAdapter()
		});
		const page = host(container);

		expect(page.querySelectorAll('.theme a')).toHaveLength(0);
		expect(page.querySelectorAll('.theme .vit-edit-frame')).toHaveLength(sampleThemes.length);
		expect(
			[...page.querySelectorAll('.theme .label [contenteditable]')].map((el) => el.textContent)
		).toEqual(sampleThemes.map((theme) => theme.name));
		expect(page.querySelectorAll('.theme .picture')).toHaveLength(sampleThemes.length);
	});

	it('lays the lead over the first row of its own grid', () => {
		const { container } = render(ThemeCollageProbe, { props: { themes: sampleThemes, themeHref } });

		const lead = container.querySelector('.collage > .lead');
		expect(lead?.querySelector('h2')?.textContent).toBe('Weeklies');
		expect(lead?.nextElementSibling?.classList.contains('theme')).toBe(true);
	});
});
