// Sample domain data for stories AND component tests — excluded from the
// published tarball. Shared so a shape change breaks one fixture, not one per
// consumer.
import type {
	CollaboratorData,
	JobOpeningData,
	MilestoneData,
	ProjectCardData,
	TeamMemberData,
	WeeklyCardData
} from './content/types.js';

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
