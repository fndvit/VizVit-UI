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
	/** CMS-only: true renders the «Esborrany» badge. The public site never sets it. */
	draft?: boolean;
	number: number;
	slug: string;
	/** ISO date (2026-08-30). */
	publishedOn: string;
	title: string;
	excerpt: string;
	imageUrl: string;
}

/** The kinds a project can have, in display order — a host's enum derives from this. */
export const PROJECT_KINDS = ['collaboration', 'passion'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

/** A project as its card shows it. */
export interface ProjectCardData {
	id: number;
	/** CMS-only: true renders the «Esborrany» badge. The public site never sets it. */
	draft?: boolean;
	slug: string;
	kind: ProjectKind;
	publishedOn: string;
	title: string;
	excerpt: string;
	imageUrl: string;
	externalUrl: string | null;
	hasStory: boolean;
}

/**
 * The timeline's categories, in DISPLAY ORDER — every select that offers them
 * and every host enum derives from this.
 *
 * The order was an emergent property of two unrelated literals before: the
 * panel select read `Object.keys(MILESTONE_CATEGORY_COLOR)` while vit-brain's
 * record form spelled its own array, so one CMS offered the same field in two
 * orders and seeded a new row with the third member of one of them. The order
 * kept here is the colour map's, which is the one with a reason attached (its
 * slots are fixed and never reordered).
 *
 * A tuple rather than a union for the reason `CONTACT_CATEGORIES` is one: a
 * `satisfies readonly MilestoneCategory[]` binds the element type and never
 * the list, so a host could drop a member and still compile.
 */
export const MILESTONE_CATEGORIES = [
	'foundation',
	'lab',
	'education',
	'collaboration',
	'press'
] as const;
export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

/** One timeline milestone. */
export interface MilestoneData {
	id: number;
	/** CMS-only: true renders the «Esborrany» badge. The public site never sets it. */
	draft?: boolean;
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
	/** Present only where the list is editable — remove ops need an identity. */
	id?: string | number;
	personName: string;
	affiliation: string;
	url: string | null;
}

export interface JobOpeningData {
	/** Present only where the list is editable — remove ops need an identity. */
	id?: string | number;
	/** CMS-only: true renders the «Esborrany» badge. The public site never sets it. */
	draft?: boolean;
	slug: string;
	title: string;
	description: string | null;
	postedOn: string;
}

/** The reactions a weekly or comment can carry, in display order. */
export const REACTIONS = ['like', 'love', 'clap'] as const;
export type Reaction = (typeof REACTIONS)[number];

/** One reaction's tally as the bar renders it. */
export interface ReactionSummary {
	reaction: Reaction;
	count: number;
	/** Whether the signed-in reader is among the reactors. */
	mine: boolean;
}

/** The weekly or comment a reaction bar belongs to. */
export type ReactionTarget = { kind: 'weekly'; slug: string } | { kind: 'comment'; id: number };

/** One comment as the section renders it. */
export interface CommentData {
	id: number;
	displayName: string;
	body: string;
	/** ISO timestamp. */
	createdAt: string;
	reactions: ReactionSummary[];
}

/** A top-level comment with its flat reply list. */
export interface CommentThreadData extends CommentData {
	replies: CommentData[];
}

/** The contact form's reasons, in display order — the host schema derives its enum from this. */
export const CONTACT_CATEGORIES = ['collaborate', 'event', 'press', 'brand', 'other'] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];
