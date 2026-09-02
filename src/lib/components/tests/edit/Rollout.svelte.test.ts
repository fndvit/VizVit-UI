import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { EditAdapter, PropertyDescriptor } from '../../../edit/types.js';
import { entityProperty } from '../../../edit/helpers.js';
import type {
	CollaboratorData,
	JobOpeningData,
	ProjectCardData,
	TeamMemberData,
	WeeklyCardData
} from '../../../content/types.js';
import RolloutProbe from './RolloutProbe.svelte';

/**
 * The Phase-4 rollout: cards zip their panel rows from their own data, lists
 * gate collection ops the way Timeline does, and the two form controls whose
 * strings cannot hold a caret (a placeholder, <option> labels) edit through
 * panels. The chrome's own mechanics (commit, null-clear, error state) are
 * EditChrome.svelte.test.ts's — here each component only has to hand the
 * panel the RIGHT descriptor and value.
 */

const weekly: WeeklyCardData = {
	id: 12,
	number: 12,
	slug: 'setmana-12',
	publishedOn: '2026-08-10',
	title: 'El planeta',
	excerpt: 'Un extracte',
	imageUrl: '/w12.svg'
};

const project: ProjectCardData = {
	id: 3,
	slug: 'projecte',
	kind: 'collaboration',
	publishedOn: '2026-05-01',
	title: 'Un projecte',
	excerpt: 'Extracte',
	imageUrl: '/p.svg',
	externalUrl: null,
	hasStory: false
};

const member: TeamMemberData = {
	slug: 'nuria',
	name: 'Núria P.',
	role: 'Direcció',
	bio: null,
	photoUrl: '/nuria.jpg',
	isBoard: false
};

const collaborators: CollaboratorData[] = [
	{ id: 1, personName: 'Joan V.', affiliation: 'Universitat', url: null },
	// No id: the list must not offer removal for a row it cannot name.
	{ personName: 'Mar T.', affiliation: 'Estudi', url: 'https://estudi.example' }
];

const jobs: JobOpeningData[] = [
	{ id: 7, slug: 'dev', title: 'Dev', description: null, postedOn: '2026-07-01' }
];

function fullAdapter(overrides: Partial<EditAdapter> = {}): EditAdapter {
	return {
		isEditing: true,
		save: vi.fn(async () => {}),
		saveProperty: vi.fn(async () => {}),
		applyOp: vi.fn(async () => {}),
		...overrides
	};
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

function openPanel(container: ParentNode): void {
	container.querySelector<HTMLButtonElement>('.toolbar button')!.click();
}

async function commitText(input: HTMLInputElement, value: string): Promise<void> {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	await settle();
}

describe('card panels hand the adapter their own values', () => {
	it('WeeklieCard: the image row carries imageUrl, and read-only renders no frame', async () => {
		const image = entityProperty('weeklies', weekly.id)('imageUrl', {
			type: 'image',
			label: 'Imatge'
		});

		const readOnly = render(RolloutProbe, {
			props: { adapter: null, show: 'weekly', weekly, weeklyEdit: { image } }
		});
		expect(readOnly.container.querySelector('.vit-edit-frame')).toBeNull();

		const saveProperty = vi.fn(async () => {});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'weekly',
				weekly,
				weeklyEdit: { image }
			}
		});
		openPanel(container);
		await settle();
		const input = container.querySelector<HTMLInputElement>('[role="dialog"] input')!;
		expect(input.value).toBe('/w12.svg');
		await commitText(input, '/w12-nou.svg');
		expect(saveProperty).toHaveBeenCalledWith(image, '/w12-nou.svg');
	});

	it('ProjectCard: the kind select gets default options, host descriptors win', async () => {
		const kind = entityProperty('projects', project.id)('kind', {
			type: 'select',
			label: 'Tipus'
		});
		const saveProperty = vi.fn(async () => {});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'project',
				project,
				projectEdit: { kind }
			}
		});
		openPanel(container);
		await settle();

		const select = container.querySelector<HTMLSelectElement>('[role="dialog"] select')!;
		expect([...select.options].map((option) => option.value)).toEqual(['collaboration', 'passion']);
		select.value = 'passion';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();
		expect(saveProperty).toHaveBeenCalledWith(
			expect.objectContaining({ ref: kind.ref, type: 'select' }),
			'passion'
		);
	});

	it('TeamMemberCard: the plain-text name edits through the panel, not inline', async () => {
		const name = entityProperty('team_members', 9)('name', { type: 'text', label: 'Nom' });
		const saveProperty = vi.fn(async () => {});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'member',
				member,
				memberEdit: { name }
			}
		});
		expect(container.querySelector('h3[contenteditable]')).toBeNull();
		openPanel(container);
		await settle();
		const input = container.querySelector<HTMLInputElement>('[role="dialog"] input')!;
		expect(input.value).toBe('Núria P.');
		await commitText(input, 'Núria Pons');
		expect(saveProperty).toHaveBeenCalledWith(name, 'Núria Pons');
	});
});

describe('list collection ops gate like Timeline', () => {
	const collection = { entity: 'collaborators' } as const;

	it('CollaboratorList: no add slot without a collection or without applyOp', () => {
		const noCollection = render(RolloutProbe, {
			props: { adapter: fullAdapter(), show: 'collaborators', collaborators }
		});
		expect(noCollection.container.querySelector('button.add')).toBeNull();

		const noOp = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ applyOp: undefined }),
				show: 'collaborators',
				collaborators,
				collaboratorsCollection: collection
			}
		});
		expect(noOp.container.querySelector('button.add')).toBeNull();
	});

	it('CollaboratorList: removal only for rows that carry an id; panel rows fire', async () => {
		const applyOp = vi.fn(async () => {});
		const saveProperty = vi.fn(async () => {});
		const editFor = (collaborator: CollaboratorData) => ({
			personName: entityProperty('collaborators', collaborator.id ?? 0)('personName', {
				type: 'text' as const,
				label: 'Nom'
			})
		});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ applyOp, saveProperty }),
				show: 'collaborators',
				collaborators,
				collaboratorsEditFor: editFor,
				collaboratorsCollection: collection
			}
		});

		expect(container.querySelector('button.add')).not.toBeNull();
		// Two rows, one id: exactly one trash across both frames.
		const trashes = [...container.querySelectorAll('.toolbar button')].filter(
			(button) => button.getAttribute('aria-label') === 'Elimina'
		);
		expect(trashes).toHaveLength(1);

		openPanel(container);
		await settle();
		const input = container.querySelector<HTMLInputElement>('[role="dialog"] input')!;
		await commitText(input, 'Joana V.');
		expect(saveProperty).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'text' }),
			'Joana V.'
		);
	});

	it('JobList: add slot and per-row date panel', async () => {
		const saveProperty = vi.fn(async () => {});
		const postedOn = entityProperty('job_openings', 7)('postedOn', {
			type: 'date',
			label: 'Data'
		});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'jobs',
				jobs,
				jobsEditFor: () => ({ postedOn }),
				jobsCollection: { entity: 'job_openings' }
			}
		});

		expect(container.querySelector('button.add')).not.toBeNull();
		openPanel(container);
		await settle();
		const input = container.querySelector<HTMLInputElement>('input[type="date"]')!;
		expect(input.value).toBe('2026-07-01');
		await commitText(input, '2026-08-01');
		expect(saveProperty).toHaveBeenCalledWith(postedOn, '2026-08-01');
	});
});

describe('caretless strings edit through panels', () => {
	it('SearchInput: the placeholder row carries the rendered placeholder', async () => {
		const placeholderEdit: PropertyDescriptor = {
			ref: { kind: 'chrome', key: 'weeklies_searchPlaceholder' },
			type: 'text',
			label: 'Text de cerca'
		};
		const saveProperty = vi.fn(async () => {});
		const { container } = render(RolloutProbe, {
			props: { adapter: fullAdapter({ saveProperty }), show: 'search', placeholderEdit }
		});

		openPanel(container);
		await settle();
		const input = container.querySelector<HTMLInputElement>('[role="dialog"] input')!;
		expect(input.value).toBe('Cerca…');
		await commitText(input, 'Cerca un tema…');
		expect(saveProperty).toHaveBeenCalledWith(placeholderEdit, 'Cerca un tema…');
	});

	it('SearchInput: inert without the descriptor or without an adapter', () => {
		const bare = render(RolloutProbe, { props: { adapter: fullAdapter(), show: 'search' } });
		expect(bare.container.querySelector('.vit-edit-frame')).toBeNull();
	});

	it('ContactForm: category option labels edit as chrome rows, only where messageEdit exists', async () => {
		const saveProperty = vi.fn(async () => {});
		const withEdit = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'contact',
				messageEdit: (key) => ({ ref: { kind: 'chrome', key }, locale: 'ca' })
			}
		});
		const frame = withEdit.container.querySelector('.vit-edit-frame');
		expect(frame).not.toBeNull();
		openPanel(frame!);
		await settle();
		const inputs = withEdit.container.querySelectorAll<HTMLInputElement>('[role="dialog"] input');
		// Five category labels plus the two post-submit feedback strings.
		expect(inputs).toHaveLength(7);
		expect(inputs[0].value).toBe('Vull col·laborar');
		await commitText(inputs[0], 'Col·laborem?');
		expect(saveProperty).toHaveBeenCalledWith(
			expect.objectContaining({
				ref: { kind: 'chrome', key: 'contact_category_collaborate' }
			}),
			'Col·laborem?'
		);

		// A host without messageEdit (the website itself) gets no affordance.
		const without = render(RolloutProbe, {
			props: { adapter: fullAdapter(), show: 'contact' }
		});
		expect(without.container.querySelector('.vit-edit-frame')).toBeNull();
	});

	it('SortSelect: one row per direction, saving the option label', async () => {
		const forDirection = (direction: 'asc' | 'desc'): PropertyDescriptor => ({
			ref: { kind: 'chrome', key: `weeklies_sort${direction === 'asc' ? 'Asc' : 'Desc'}` },
			type: 'text',
			label: direction
		});
		const saveProperty = vi.fn(async () => {});
		const { container } = render(RolloutProbe, {
			props: {
				adapter: fullAdapter({ saveProperty }),
				show: 'sort',
				optionsEdit: forDirection
			}
		});

		openPanel(container);
		await settle();
		const inputs = container.querySelectorAll<HTMLInputElement>('[role="dialog"] input');
		expect(inputs).toHaveLength(2);
		expect(inputs[0].value).toBe('Data descendent');
		await commitText(inputs[0], 'Més recents primer');
		expect(saveProperty).toHaveBeenCalledWith(
			expect.objectContaining({ ref: { kind: 'chrome', key: 'weeklies_sortDesc' } }),
			'Més recents primer'
		);
	});
});
