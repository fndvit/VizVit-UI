// Sample domain data for stories AND component tests — excluded from the
// published tarball. Shared so a shape change breaks one fixture, not one per
// consumer.
import {
	GET_INVOLVED_REASON_KEYS,
	PAGE_COPY_KEYS,
	type PageCopy,
	type PageId
} from './content/pages.js';
import type {
	CollaboratorData,
	CommentThreadData,
	JobOpeningData,
	MilestoneData,
	ProjectArticleData,
	ProjectCardData,
	ReactionSummary,
	TeamMemberData,
	ThemeData,
	WeeklyArticleData,
	WeeklyCardData
} from './content/types.js';
import type { WeeklyListServerData } from './utils/weekly-list-contract.js';

export const sampleWeekly: WeeklyCardData = {
	id: 12,
	number: 12,
	slug: 'el-planeta-enmig-d-una-galaxia',
	publishedOn: '2026-08-10',
	title: 'El planeta enmig d’una galàxia',
	excerpt:
		'Si la Terra fos una llentia, on cauria Neptú? Un exercici d’escala per entendre com de buit és el sistema solar.',
	imageUrl: '/images/placeholders/square.svg'
};

export const sampleProject: ProjectCardData = {
	id: 1,
	slug: 'air-quality-life-index',
	kind: 'collaboration',
	publishedOn: '2026-03-02',
	title: 'Air Quality Life Index',
	excerpt:
		'Visualització interactiva de l’impacte de la qualitat de l’aire en l’esperança de vida.',
	imageUrl: '/images/placeholders/wide.svg',
	externalUrl: null,
	hasStory: true
};

export const sampleMember: TeamMemberData = {
	slug: 'nuria-serra',
	name: 'Núria Serra',
	role: 'Directora de dades',
	bio: 'Especialista en periodisme de dades i visualització de la informació pública.',
	photoUrl: '/images/placeholders/portrait.svg',
	isBoard: false
};

export const sampleMilestones: MilestoneData[] = [
	{
		id: 1,
		occurredOn: '2024-02-12',
		category: 'foundation',
		title: 'Neix la Fundació VIT',
		body: 'Es constitueix la fundació amb la missió de fer transparent la informació pública.',
		imageUrls: ['/images/placeholders/photo-strip.svg'],
		linkUrl: null
	},
	{
		id: 2,
		occurredOn: '2025-06-03',
		category: 'education',
		title: 'Primer taller de dataviz a instituts',
		body: null,
		imageUrls: [],
		linkUrl: 'https://example.org'
	},
	{
		id: 3,
		occurredOn: '2026-01-20',
		category: 'lab',
		title: 'Llancem el laboratori de dades obertes',
		body: 'Un espai per prototipar visualitzacions amb dades públiques.',
		imageUrls: [],
		linkUrl: null
	}
];

export const sampleJobs: JobOpeningData[] = [
	{
		slug: 'dataviz-developer',
		title: 'Desenvolupador/a de visualització de dades',
		description: 'Busquem una persona per construir visualitzacions interactives amb Svelte i D3.',
		postedOn: '2026-07-15'
	}
];

export const sampleCollaborators: CollaboratorData[] = [
	{ personName: 'Joan Ribas', affiliation: 'Universitat de Barcelona', url: 'https://example.org' },
	{ personName: 'Marta Vidal', affiliation: 'Institut Català d’Estadística', url: null }
];

/**
 * One page's copy, every declared key filled with a string that NAMES the
 * key — so a page test can assert that `hero_title` rendered where the hero
 * title goes, and a misrouted block reads as its own key. `PAGE_COPY_KEYS`
 * drives it: a key added there is present here without an edit.
 */
export function samplePageCopy<P extends PageId>(page: P): PageCopy<P> {
	return Object.fromEntries(
		PAGE_COPY_KEYS[page].map((key: string) => [key, `Copy ${page} ${key}`])
	) as PageCopy<P>;
}

/** The get-involved reasons as the copy fixture words them, in declared order. */
export const sampleReasons = GET_INVOLVED_REASON_KEYS.map((key) => `Copy get-involved ${key}`);

export const sampleProjectArticle: ProjectArticleData = {
	...sampleProject,
	body: 'Un projecte amb història.\n\n## Context\n\nEl segon bloc.',
	previewImageUrl: '/images/placeholders/wide.svg',
	externalUrl: 'https://aqli.example.org/index'
};

export const sampleWeeklyArticle: WeeklyArticleData = {
	...sampleWeekly,
	body: 'La Terra és una llentia.\n\nNeptú cau lluny.',
	instagramUrl: 'https://instagram.com/p/abc',
	sources: [
		{ label: 'NASA', url: 'https://nasa.example/planets' },
		{ label: 'ESA', url: 'https://esa.example/solar' }
	]
};

export const sampleThemes: ThemeData[] = [
	{ slug: 'ciencia', name: 'Ciència' },
	{ slug: 'salut', name: 'Salut' }
];

/** The weeklies index as its server load renders it: one page, no filters. */
export const sampleWeeklyListServer: WeeklyListServerData = {
	weeklies: [sampleWeekly, { ...sampleWeekly, id: 11, number: 11, slug: 'onze', title: 'Onze' }],
	total: 2,
	page: 1,
	pageSize: 12,
	query: { q: '', theme: null, sort: 'desc' }
};

export const sampleReactions: ReactionSummary[] = [
	{ reaction: 'like', count: 3, mine: false },
	{ reaction: 'love', count: 1, mine: true },
	{ reaction: 'clap', count: 0, mine: false }
];

export const sampleComments: CommentThreadData[] = [
	{
		id: 1,
		displayName: 'Anna',
		body: 'Quina passada.',
		createdAt: '2026-08-11T10:00:00Z',
		reactions: [],
		replies: []
	}
];
