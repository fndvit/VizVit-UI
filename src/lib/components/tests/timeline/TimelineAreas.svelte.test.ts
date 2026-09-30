import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { entityEdit, entityProperty } from '../../../edit/helpers.js';
import type { EditAdapter } from '../../../edit/types.js';
import { areaDestination } from '../../timeline/area-link.js';
import { sampleAreas } from '../../../fixtures.js';
import type { TimelineAreaEditMap } from '../../timeline/TimelineArea.svelte';
import TimelineAreasProbe from './TimelineAreasProbe.svelte';

const AFFORDANCES = '[contenteditable], .vit-edit-frame, button.add';

function editFor(area: { id: number }): TimelineAreaEditMap {
	const text = entityEdit('timeline_areas', area.id, 'ca');
	const property = entityProperty('timeline_areas', area.id);
	return {
		title: text('title', { label: `Títol ${area.id}` }),
		body: text('body', { format: 'multiline' }),
		category: property('category', { type: 'select', label: 'Categoria' }),
		status: property('is_published', { type: 'flag', label: 'Publicat' })
	};
}

const editingAdapter = (): EditAdapter => ({
	isEditing: true,
	save: vi.fn(async () => {}),
	saveProperty: vi.fn(async () => {})
});

describe('TimelineAreas', () => {
	it('renders one full section per area, in order, each with its own timeline link', () => {
		const { container } = render(TimelineAreasProbe, { props: { areas: sampleAreas } });

		const sections = [...container.querySelectorAll('section.area')];
		expect(sections.map((section) => section.id)).toEqual(
			sampleAreas.map((area) => `area-${area.id}`)
		);
		expect(sections.map((section) => section.querySelector('h3')?.textContent)).toEqual(
			sampleAreas.map((area) => area.title)
		);
		expect(
			sections.map((section) => section.querySelector('.more a')?.getAttribute('href'))
		).toEqual(
			sampleAreas.flatMap((area) => {
				const to = areaDestination(area, '/transparency');
				return to ? [to] : [];
			})
		);
		expect(container.querySelector('.see-all a')?.getAttribute('href')).toBe('/transparency');
	});

	it('gives the rail one anchor per area, pointing at its section, the first current until scrolled', () => {
		const { container } = render(TimelineAreasProbe, { props: { areas: sampleAreas } });

		const anchors = [...container.querySelectorAll<HTMLAnchorElement>('.rail a')];
		expect(anchors.map((a) => a.getAttribute('href'))).toEqual(
			sampleAreas.map((area) => `#area-${area.id}`)
		);
		expect(anchors.map((a) => a.getAttribute('aria-current'))).toEqual(
			sampleAreas.map((_, index) => (index === 0 ? 'true' : null))
		);
		expect(
			[...container.querySelectorAll('section.area')].map((section) =>
				section.classList.contains('upcoming')
			)
		).toEqual(sampleAreas.map((_, index) => index > 0));
		expect(container.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe(
			'Les nostres àrees'
		);
	});

	it('renders the collage from the first four images, and none for an area without any', () => {
		const { container } = render(TimelineAreasProbe, {
			props: {
				areas: [
					{
						...sampleAreas[0]!,
						images: [...sampleAreas[0]!.images, { url: '/five.svg', href: null, label: null }]
					},
					sampleAreas[2]!
				]
			}
		});

		const [withImages, without] = [...container.querySelectorAll('section.area')];
		expect(withImages?.querySelectorAll('.collage img')).toHaveLength(4);
		// The first two pictures of the lab lead somewhere; the rest are pictures.
		expect(withImages?.querySelectorAll('.collage a.door')).toHaveLength(2);
		expect(without?.querySelector('.collage')).toBeNull();
	});

	it("renders the body's **runs** as strong elements", () => {
		const { container } = render(TimelineAreasProbe, { props: { areas: sampleAreas } });

		expect(container.querySelector('section.area .body strong')?.textContent).toBe('qualsevol');
	});

	it('renders zero affordances without an adapter, descriptors or not', () => {
		const bare = render(TimelineAreasProbe, { props: { areas: sampleAreas } });
		const described = render(TimelineAreasProbe, { props: { areas: sampleAreas, editFor } });

		expect(bare.container.querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(described.container.innerHTML).toBe(bare.container.innerHTML);
	});

	it('editing: frames every area with its panel and opens title and body inline — the runs stay until a caret lands, then the raw body, markers and all', async () => {
		const { container } = render(TimelineAreasProbe, {
			props: { areas: sampleAreas, editFor, adapter: editingAdapter() }
		});

		expect(container.querySelectorAll('section.area .vit-edit-frame')).toHaveLength(
			sampleAreas.length
		);
		const first = container.querySelector('section.area')!;
		expect(first.querySelector('h3')?.getAttribute('aria-label')).toBe('Títol 1');
		const body = first.querySelector<HTMLElement>('.body')!;
		expect(body.hasAttribute('contenteditable')).toBe(true);
		// Edit mode on, no caret: the runs render, as on the site.
		expect(body.querySelector('strong')?.textContent).toBe('qualsevol');
		// A caret in it: the source, markers and all, which is what a commit reads back.
		body.focus();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(body.hasAttribute('data-vit-caret')).toBe(true);
		expect(body.querySelector('strong')).toBeNull();
		expect(body.textContent).toBe(sampleAreas[0]!.body);
		body.blur();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(body.querySelector('strong')?.textContent).toBe('qualsevol');
	});

	it('editing: Escape after typing restores the saved text with its runs, not the raw draft', async () => {
		const { container } = render(TimelineAreasProbe, {
			props: { areas: sampleAreas, editFor, adapter: editingAdapter() }
		});
		const body = () => container.querySelector<HTMLElement>('section.area .body')!;

		body().focus();
		await new Promise((resolve) => setTimeout(resolve, 0));
		body().textContent = 'un esborrany **a mig**';
		body().dispatchEvent(new Event('input', { bubbles: true }));
		body().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(body().textContent).toBe(sampleAreas[0]!.body!.replaceAll('**', ''));
		expect(body().querySelector('strong')?.textContent).toBe('qualsevol');
		expect(body().hasAttribute('data-vit-caret')).toBe(false);
	});

	it('editing with a collection: an add slot after the sections, and removal on every area', () => {
		const adapter: EditAdapter = {
			...editingAdapter(),
			applyOp: async () => {}
		};
		const { container } = render(TimelineAreasProbe, {
			props: {
				areas: sampleAreas,
				editFor,
				adapter,
				collection: { entity: 'timeline_areas' as const }
			}
		});

		expect(container.querySelector('.sections .add-slot')).not.toBeNull();
		expect(container.querySelectorAll('section.area .vit-edit-frame')).toHaveLength(
			sampleAreas.length
		);
	});

	it('leaves an area without a category or an href of its own without a link, and gives it an id of its own', () => {
		const { container } = render(TimelineAreasProbe, {
			props: { areas: [{ ...sampleAreas[3]!, href: null }] }
		});

		const section = container.querySelector('section.area')!;
		expect(section.id).toBe('area-4');
		expect(section.querySelector('.more')).toBeNull();
	});
});
