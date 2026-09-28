import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TeamMemberData } from '../../../content/types.js';
import { entityProperty } from '../../../edit/helpers.js';
import type { EditAdapter, RecordTarget } from '../../../edit/types.js';
import { ARMS, HEADS, LEGS } from '../../ui/figure/paths.js';
import TeamFigure from '../../team/TeamFigure.svelte';
import type { TeamMemberEditMap } from '../../team/TeamMemberCard.svelte';
import { AFFORDANCES, fullAdapter, host, mountPage } from '../pages/helpers.js';

/**
 * The row → figure mapping and the editing contract. Every `figure*` field
 * is optional with a default, so the two things to hold are: a set field
 * reaches the drawing, and an unset one draws the plain standing figure.
 * Editing has two doors and no inline text: the gear's panel for what is
 * visual, the pencil for the host's form.
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

/** The map a CMS hands a figure: the record, and the card's rows it ignores. */
function fullEdit(): TeamMemberEditMap {
	const property = entityProperty('team_members', 7);
	return {
		name: property('name', { type: 'text', label: 'Nom' }),
		photo: property('photo_url', { type: 'image', label: 'Fotografia' }),
		record: { entity: 'team_members', id: 7 }
	};
}

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

	it('draws the outline for the drawn mode even with a photo, in the shape asked for', () => {
		render(TeamFigure, { member: { ...member, figureHead: 'drawn', figureHeadShape: 'cup' } });
		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure-head')?.getAttribute('d')).toBe(HEADS.cup);

		document.body.innerHTML = '';
		render(TeamFigure, { member: { ...member, photoUrl: '' } });
		expect(document.querySelector('image')).toBeNull();
		expect(document.querySelector('.vit-figure-head')?.getAttribute('d')).toBe(HEADS.round);
	});

	it('captions the name, role and bio', () => {
		render(TeamFigure, { member });

		const caption = document.querySelector('figcaption');
		expect(caption?.querySelector('.vit-figure__name')?.textContent).toBe('Ada');
		expect(caption?.querySelector('.vit-figure__role')?.textContent).toBe('Directora');
		expect(caption?.querySelector('.vit-figure__bio')?.textContent).toBe('Fa recerca.');
		expect(figure()?.getAttribute('tabindex')).toBe('0');
	});
});

describe('TeamFigure, editing', () => {
	const openRecord = vi.fn<(target: RecordTarget) => void>();
	const withRecord = (): EditAdapter => ({ ...fullAdapter(), openRecord });

	it('renders no affordance and byte-identically without an adapter, map or not', () => {
		const bare = mountPage(TeamFigure, { props: { member } });
		const described = mountPage(TeamFigure, { props: { member, edit: fullEdit() } });

		expect(host(described.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});

	it('edits no text inline and opens no panel — the pencil is the one door', () => {
		const { container } = mountPage(TeamFigure, {
			props: { member, edit: fullEdit() },
			adapter: withRecord()
		});

		expect(container.querySelectorAll('[contenteditable]')).toHaveLength(0);
		const buttons = [...container.querySelectorAll<HTMLButtonElement>('.toolbar button')];
		expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Edita la fitxa: Ada']);
	});

	it('offers the pencil only to an adapter that opens records, and hands it the row', () => {
		openRecord.mockClear();
		const adapter = withRecord();
		const { container } = mountPage(TeamFigure, {
			props: { member, edit: { record: { entity: 'team_members', id: 7 }, label: 'Ada' } },
			adapter
		});

		const buttons = [...container.querySelectorAll<HTMLButtonElement>('.toolbar button')];
		expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Edita la fitxa: Ada']);
		buttons[0]?.click();
		expect(openRecord).toHaveBeenCalledWith({ entity: 'team_members', id: 7 });

		document.body.innerHTML = '';
		const noDoor = mountPage(TeamFigure, {
			props: { member, edit: { record: { entity: 'team_members', id: 7 } } },
			adapter: fullAdapter()
		});
		expect(noDoor.container.querySelector('.vit-edit-frame')).toBeNull();
	});
});
