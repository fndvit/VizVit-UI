/**
 * Structural shapes of the content the components render, one locale already
 * applied. The website's zod-inferred types satisfy these structurally; the
 * package states them itself so consumers owe it no schema library.
 */
import type { EditDescriptor } from '../edit/types.js';
import type {
	ArmsPose,
	HeadMode,
	HeadShape,
	LabelAlign,
	LabelSide,
	LegsPose
} from '../components/ui/figure/paths.js';

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

/**
 * A theme a weekly is filed under, as the /weeklies filter chips render it
 * and the home page's collage pictures it; `imageUrl` is null for a theme
 * without a picture, which the collage draws as a flat tint.
 */
export interface ThemeData {
	/** The row's id, like every editable datum's: an edit producer takes it, no lookup by slug. */
	id: number;
	slug: string;
	name: string;
	imageUrl: string | null;
}

/** One cited source of a weekly. */
export interface WeeklySourceData {
	label: string;
	url: string;
}

/**
 * A weekly's OWN page: the card, plus what only the detail renders. The
 * website's `weeklyDetailSchema` carries `related` too; the page module
 * takes that list as its own prop, because vit-brain loads it separately.
 */
export interface WeeklyArticleData extends WeeklyCardData {
	body: string | null;
	instagramUrl: string | null;
	sources: WeeklySourceData[];
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
 * A project's OWN page: the card, plus what only the detail renders. The
 * website's `projectDetailSchema` and vit-brain's `toProjectArticle` both
 * answer this shape.
 */
export interface ProjectArticleData extends ProjectCardData {
	body: string | null;
	previewImageUrl: string | null;
}

/**
 * A weekly's or a project's OWN page: the same localized fields as its card,
 * except that `body` renders as rich text there. Which surface a field is
 * rendered on is the page's fact, and these two are the only pages with one
 * — so the map is shared by `ProjectPage` and `WeeklyPage` and answered by
 * one producer (vit-brain's `articleEdit`). All members optional, like every
 * `*EditMap`: a host may open the body and leave the title alone.
 */
export interface ArticleEdit {
	title?: EditDescriptor;
	excerpt?: EditDescriptor;
	body?: EditDescriptor;
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
	'press',
	// The third area of the home page's timeline (lab, education, tools): a
	// category, so «To our tools timeline» is the same filtered history as
	// the other two, and so an area row can be keyed by it.
	'tools'
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

/**
 * One AREA of the home page's timeline — lab, education, tools, or any
 * section an editor adds — as the scrolly presents it: a heading, a
 * paragraph and a collage. Not a milestone: it has no date. Where its «To
 * our … timeline» link goes is ONE rule (`areaDestination`): the area's own
 * `href` when it has one, else the full timeline filtered by its `category`
 * when it has one, else no link — so a section need not be a milestone
 * category at all (the website's `timeline_areas` table holds any number of
 * rows, at most one per category).
 */
export interface TimelineAreaData {
	id: number;
	/** CMS-only: true renders the «Esborrany» badge. The public site never sets it. */
	draft?: boolean;
	/** The milestone category whose history this area opens; null for a free section. */
	category: MilestoneCategory | null;
	/** The area's own destination, which wins over the category's history; null for none of its own. */
	href: string | null;
	title: string;
	body: string | null;
	/** The collage: `ImageCollage` renders the first four. */
	images: TimelineAreaImage[];
}

/**
 * One picture of an area's collage and where it leads — a project's page, a
 * story on another site — or nowhere (`null`): then it is a picture and no
 * link. The website stores the list as one jsonb column (`timeline_areas.images`).
 */
export interface TimelineAreaImage {
	url: string;
	href: string | null;
	/** What it shows — the project's name — for the hover's «To the … project». Localized in the store. */
	label: string | null;
}

export interface TeamMemberData {
	/** Present only where the card is editable — a descriptor needs the row (precedent: CollaboratorData). */
	id?: string | number;
	slug: string;
	name: string;
	role: string;
	bio: string | null;
	photoUrl: string;
	isBoard: boolean;
	/**
	 * How `TeamFigure` draws this member. All optional, with the defaults the
	 * component applies, so a host that stores none renders the plain standing
	 * figure. Integers and percents rather than factors, because a CMS number
	 * field is integer-only and a property panel has no number row at all.
	 */
	figureArms?: ArmsPose;
	figureLegs?: LegsPose;
	/** `drawn` forces the outline even with a photo; an empty `photoUrl` draws anyway. */
	figureHead?: HeadMode;
	/** Which outline a drawn head wears. */
	figureHeadShape?: HeadShape;
	figureLabelSide?: LabelSide;
	figureLabelAlign?: LabelAlign;
	/** Vertical shift down, in px — `FIGURE_OFFSET`'s range. */
	figureOffset?: number;
	/** Percent — `FIGURE_PERCENT`'s range; 100 is the natural head. */
	figureHeadScale?: number;
	/** Percent of the base figure width — `FIGURE_PERCENT`'s range. */
	figureSize?: number;
	/**
	 * Where the figure stands on the field's canvas, in thousandths of its
	 * width (`FIGURE_POSITION`). Null or absent is unplaced: the field gives it
	 * the next place of its own row layout. A narrow field ignores both and
	 * flows the figures in order.
	 */
	figureX?: number | null;
	figureY?: number | null;
	/** The figure's layer on the canvas (`FIGURE_LAYER`); a higher one draws above. */
	figureZ?: number;
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

/**
 * A comment's moderation state, as the database constrains it.
 *
 * The set is `comments.status`'s CHECK in fndvit-website and the vocabulary
 * vit-brain's Comentaris tab moderates through — two repositories that cannot
 * import each other — and it had no owner in TypeScript at all: the site read
 * `status = 'published'` as a bare SQL literal in four queries, typed the
 * field `z.string()`, and never named the other two states anywhere. A test
 * fixture using `'visible'`, a value the CHECK refuses, passed green.
 *
 * `published` is what a reader sees; `hidden` is moderated away; `pending`
 * awaits review. Which of them a given surface SHOWS is that surface's rule,
 * not this list's.
 */
export const COMMENT_STATUSES = ['published', 'pending', 'hidden'] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

/** A top-level comment with its flat reply list. */
export interface CommentThreadData extends CommentData {
	replies: CommentData[];
}

/** The contact form's reasons, in display order — the host schema derives its enum from this. */
export const CONTACT_CATEGORIES = ['collaborate', 'event', 'press', 'brand', 'other'] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];
