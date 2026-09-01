/**
 * Structural shapes of the content the components render, one locale already
 * applied. The website's zod-inferred types satisfy these structurally; the
 * package states them itself so consumers owe it no schema library.
 */

/** The bounds of one form field; Field turns them into length attributes. */
export interface FieldConstraint {
	min?: number;
	max: number;
}

/**
 * Shared failure vocabulary of the foundation's form envelopes.
 * FormErrorFeedback owns one sentence per member (minus 'error', which is
 * the generic fallback itself).
 */
export type FormFailReason =
	'rateLimited' | 'unauthenticated' | 'forbidden' | 'unavailable' | 'error';

export type SortDirection = 'asc' | 'desc';

/** A weekly as its listing card shows it. */
export interface WeeklyCardData {
	id: number;
	number: number;
	slug: string;
	/** ISO date (2026-08-30). */
	publishedOn: string;
	title: string;
	excerpt: string;
	imageUrl: string;
}

export type ProjectKind = 'collaboration' | 'passion';

/** A project as its card shows it. */
export interface ProjectCardData {
	id: number;
	slug: string;
	kind: ProjectKind;
	publishedOn: string;
	title: string;
	excerpt: string;
	imageUrl: string;
	externalUrl: string | null;
	hasStory: boolean;
}

export type MilestoneCategory = 'education' | 'lab' | 'foundation' | 'collaboration' | 'press';

/** One timeline milestone. */
export interface MilestoneData {
	id: number;
	occurredOn: string;
	category: MilestoneCategory;
	title: string;
	body: string | null;
	imageUrls: string[];
	linkUrl: string | null;
}

export interface TeamMemberData {
	slug: string;
	name: string;
	role: string;
	bio: string | null;
	photoUrl: string;
	isBoard: boolean;
}

export interface CollaboratorData {
	personName: string;
	affiliation: string;
	url: string | null;
}

export interface JobOpeningData {
	slug: string;
	title: string;
	description: string | null;
	postedOn: string;
}
