import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TeamMemberData } from '../../../content/types.js';
import { entityEdit, entityProperty } from '../../../edit/helpers.js';
import { ARMS, LEGS } from '../../ui/figure/paths.js';
import TeamFigure from '../../team/TeamFigure.svelte';
import type { TeamMemberEditMap } from '../../team/TeamMemberCard.svelte';
import { AFFORDANCES, fullAdapter, host, mountPage } from '../pages/helpers.js';

/**
 * The row → figure mapping and the editing contract. Every `figure*` field
 * is optional with a default, so the two things to hold are: a set field
 * reaches the drawing, and an unset one draws the plain standing figure.
 */
const member: TeamMemberData = {
	id: 7,
	slug: 'ada',
	name: 'Ada',
	role: 'Directora',
	bio: 'Fa recerca.',
	photoUrl: '/ada.png',
	isBoard: false
};

const FIELDS = [
	'figureArms',
	'figureLegs',
	'figureHead',
	'figureLabelSide',
	'figureLabelAlign',
	'figureOffset',
	'figureHeadScale',
	'figureSize'
] as const;

/** A full map the way a CMS words one: selects with options, numbers as text. */
function fullEdit(): TeamMemberEditMap {
	const property = entityProperty('team_members', 7);
	const edit = entityEdit('team_members', 7, 'ca');
	const select = (field: string, label: string, values: readonly string[]) =>
		property(field, {
			type: 'select',
			label,
			options: values.map((v) => ({ value: v, label: v }))
		});
	return {
		role: edit('role', { label: 'Càrrec' }),
		bio: edit('bio', { format: 'multiline', label: 'Biografia' }),
		name: property('name', { type: 'text', label: 'Nom' }),
		photo: property('photo_url', { type: 'image', label: 'Fotografia' }),
		figureArms: select('figureArms', 'Braços', Object.keys(ARMS)),
		figureLegs: select('figureLegs', 'Cames', Object.keys(LEGS)),
		figureHead: select('figureHead', 'Cap', ['cutout', 'circle', 'drawn']),
		figureLabelSide: select('figureLabelSide', 'Costat', ['left', 'right']),
		figureLabelAlign: select('figureLabelAlign', 'Alçada', ['top', 'bottom']),
		figureOffset: property('figureOffset', { type: 'text', label: 'Desplaçament' }),
		figureHeadScale: property('figureHeadScale', { type: 'text', label: 'Escala del cap' }),
		figureSize: property('figureSize', { type: 'text', label: 'Mida' })
	};
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const root = () => document.querySelector<HTMLElement>('.vit-team-figure');
const figure = () => document.querySelector<HTMLElement>('figure');
const strokes = () =>
	[...document.querySelectorAll('.vit-figure-body__strokes path')].map((p) => p.getAttribute('d'));

describe('TeamFigure, the drawing', () => {
	it('draws the plain standing figure with a cut-out head when no field is set', () => {
		render(TeamFigure, { member });

		expect(strokes()).toEqual([ARMS.down, LEGS.standing]);
		expect(figure()?.dataset.side).toBe('right');
		expect(figure()?.dataset.align).toBe('top');
		const image = document.querySelector('image');
		expect(image?.getAttribute('href')).toBe('/ada.png');
		expect(image?.getAttribute('preserveAspectRatio')).toBe('xMidYMax meet');
		expect(image?.getAttribute('transform')).toBeNull();
		expect(root()?.style.getPropertyValue('--vit-team-figure-scale')).toBe('1');
		expect(root()?.style.getPropertyValue('--vit-team-figure-offset')).toBe('0px');
	});

	it('reaches the drawing with every set field', () => {
		render(TeamFigure, {
			member: {
				...member,
				figureArms: 'raised',
				figureLegs: 'sit',
				figureLabelSide: 'left',
				figureLabelAlign: 'bottom',
				figureOffset: 40,
				figureHeadScale: 150,
				figureSize: 120
			}
		});

		expect(strokes()).toEqual([ARMS.raised, LEGS.sit]);
		expect(figure()?.dataset.side).toBe('left');
		expect(figure()?.dataset.align).toBe('bottom');
		expect(document.querySelector('image')?.getAttribute('transform')).toContain('scale(1.5)');
		expect(root()?.style.getPropertyValue('--vit-team-figure-scale')).toBe('1.2');
		expect(root()?.style.getPropertyValue('--vit-team-figure-offset')).toBe('40px');
	});

	it('masks the photo for the circle mode', () => {
		render(TeamFigure, { member: { ...member, figureHead: 'circle' } });

		expect(document.querySelector('clipPath circle')).not.toBeNull();
		expect(document.querySelector('image')?.getAttribute('clip-path')).toMatch(/^url\(#/);
	});

	it('draws the outline for the drawn mode even with a photo, and for no photo at all', () => {
		render(TeamFigure, { member: { ...member, figureHead: 'drawn' } });
		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure-head')).not.toBeNull();

		document.body.innerHTML = '';
		render(TeamFigure, { member: { ...member, photoUrl: '' } });
		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure-head')).not.toBeNull();
	});

	it('captions the name, role and bio by the figure classes', () => {
		render(TeamFigure, { member });

		const caption = document.querySelector('figcaption');
		expect(caption?.querySelector('.vit-figure__name')?.textContent).toBe('Ada');
		expect(caption?.querySelector('.vit-figure__role')?.textContent).toBe('Directora');
		expect(caption?.querySelector('.vit-figure__bio')?.textContent).toBe('Fa recerca.');
		expect(figure()?.getAttribute('tabindex')).toBe('0');
	});
});

describe('TeamFigure, editing', () => {
	it('renders no affordance and byte-identically without an adapter, map or not', () => {
		const bare = mountPage(TeamFigure, { props: { member } });
		const described = mountPage(TeamFigure, { props: { member, edit: fullEdit() } });

		expect(host(described.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});

	it('shows no frame under an adapter when the map has no panel row', () => {
		const edit = fullEdit();
		const { container } = mountPage(TeamFigure, {
			props: { member, edit: { role: edit.role, bio: edit.bio } },
			adapter: fullAdapter()
		});

		expect(container.querySelector('.vit-edit-frame')).toBeNull();
		expect(container.querySelector('.vit-figure__role')?.hasAttribute('contenteditable')).toBe(
			true
		);
		expect(container.querySelector('.vit-figure__bio')?.hasAttribute('contenteditable')).toBe(true);
	});

	it('opens a panel with the name, the photo and the eight figure rows, valued as the drawing is', async () => {
		const { container } = mountPage(TeamFigure, {
			props: { member: { ...member, figureLegs: 'walking', figureOffset: 40 }, edit: fullEdit() },
			adapter: fullAdapter()
		});

		container.querySelector<HTMLButtonElement>('.toolbar button')!.click();
		await settle();

		const labels = [...container.querySelectorAll('.vit-edit-frame label')].map((l) =>
			l.textContent?.trim()
		);
		expect(labels).toEqual([
			'Nom',
			'Fotografia',
			'Braços',
			'Cames',
			'Cap',
			'Costat',
			'Alçada',
			'Desplaçament',
			'Escala del cap',
			'Mida'
		]);
		const selects = [...container.querySelectorAll<HTMLSelectElement>('select')].map(
			(s) => s.value
		);
		expect(selects).toEqual(['down', 'walking', 'cutout', 'right', 'top']);
		const texts = [...container.querySelectorAll<HTMLInputElement>('input[type="text"]')].map(
			(i) => i.value
		);
		// The name, then the photo path, then the three numbers as strings.
		expect(texts).toEqual(['Ada', '/ada.png', '40', '100', '100']);
		expect(FIELDS).toHaveLength(8);
	});
});
