/**
 * Content renderers: the components that present database content — cards,
 * the timeline, listings. All prop-driven, all edit-mode capable, plus the
 * structural data shapes they consume.
 */
export { default as CollaboratorList } from './components/team/CollaboratorList.svelte';
export { default as JobList } from './components/jobs/JobList.svelte';
export type { JobEditMap } from './components/jobs/JobList.svelte';
export { default as ProjectCard } from './components/projects/ProjectCard.svelte';
export type { ProjectEditMap } from './components/projects/ProjectCard.svelte';
export { default as SortSelect } from './components/weeklies/SortSelect.svelte';
export { default as TeamMemberCard } from './components/team/TeamMemberCard.svelte';
export type { TeamMemberEditMap } from './components/team/TeamMemberCard.svelte';
// The featured team as figures: one member, and the scattered field of them.
export { default as TeamFigure } from './components/team/TeamFigure.svelte';
export { default as TeamFigureField } from './components/team/TeamFigureField.svelte';
// The sixth `*EditMap`: its five siblings were exported and this one was not,
// so a host typing a collaborator's rows had to restate the shape.
export type { CollaboratorEditMap } from './components/team/CollaboratorList.svelte';
export { default as Timeline } from './components/timeline/Timeline.svelte';
export { default as TimelineMilestone } from './components/timeline/TimelineMilestone.svelte';
export type { MilestoneEditMap } from './components/timeline/TimelineMilestone.svelte';
// The home timeline: the three areas as a scrolly, and one area of it.
export { default as TimelineAreas } from './components/timeline/TimelineAreas.svelte';
export { default as TimelineArea } from './components/timeline/TimelineArea.svelte';
export type { TimelineAreaEditMap } from './components/timeline/TimelineArea.svelte';
export { default as WeeklieCard } from './components/weeklies/WeeklieCard.svelte';
export type { WeeklyEditMap } from './components/weeklies/WeeklieCard.svelte';
export { default as ThemeCollage } from './components/weeklies/ThemeCollage.svelte';
export type { ThemeEditMap } from './components/weeklies/ThemeCollage.svelte';
// The nine PAGE modules: a website route is one tag over the site's read
// projection, and a CMS opens it with the module's `*PageEdit` map. Same door
// as the cards they compose — a page is content that renders, not chrome.
export { default as HomePage } from './components/pages/HomePage.svelte';
export type { HomePageEdit } from './components/pages/HomePage.svelte';
export { default as WhoWeArePage } from './components/pages/WhoWeArePage.svelte';
export type { WhoWeArePageEdit } from './components/pages/WhoWeArePage.svelte';
export { default as WhatWeDoPage } from './components/pages/WhatWeDoPage.svelte';
export type { WhatWeDoPageEdit } from './components/pages/WhatWeDoPage.svelte';
export { default as GetInvolvedPage } from './components/pages/GetInvolvedPage.svelte';
export type { GetInvolvedPageEdit } from './components/pages/GetInvolvedPage.svelte';
export { default as TransparencyPage } from './components/pages/TransparencyPage.svelte';
export type { TransparencyPageEdit } from './components/pages/TransparencyPage.svelte';
export { default as LegalPage } from './components/pages/LegalPage.svelte';
export type { LegalPageEdit } from './components/pages/LegalPage.svelte';
export { default as WeekliesPage } from './components/pages/WeekliesPage.svelte';
export type { WeekliesPageEdit } from './components/pages/WeekliesPage.svelte';
export { default as ProjectPage } from './components/pages/ProjectPage.svelte';
export { default as WeeklyPage } from './components/pages/WeeklyPage.svelte';
// The content vocabularies and data shapes, beside the renderers that consume
// them. `./contract` names the component-free ones a second time, by design.
export { plainInline, renderBody, renderInline } from './content/richtext.js';
export type { InlineRun, RichTextBlock } from './content/richtext.js';
export { GET_INVOLVED_REASON_KEYS, PAGE_COPY_KEYS } from './content/pages.js';
export type { CopyEditFor, CopyKey, PageCopy, PageId } from './content/pages.js';
export {
	COMMENT_STATUSES,
	CONTACT_CATEGORIES,
	MILESTONE_CATEGORIES,
	PROJECT_KINDS,
	REACTIONS
} from './content/types.js';
export type {
	ArticleEdit,
	CollaboratorData,
	CommentData,
	CommentThreadData,
	CommentStatus,
	ContactCategory,
	FieldConstraint,
	FormFailReason,
	JobOpeningData,
	MilestoneCategory,
	MilestoneData,
	ProjectArticleData,
	ProjectCardData,
	ProjectKind,
	Reaction,
	ReactionSummary,
	ReactionTarget,
	SortDirection,
	TeamMemberData,
	ThemeData,
	TimelineAreaData,
	TimelineAreaImage,
	WeeklyArticleData,
	WeeklyCardData,
	WeeklySourceData
} from './content/types.js';
export {
	MILESTONE_CATEGORY_COLOR,
	matchesMilestoneFilter,
	milestoneCategoryLabel
} from './utils/milestones.js';
// The two list rules: URL-mirrored filters, and the weeklies index over them.
export { createUrlFilters } from './utils/url-filters.svelte.js';
export type { UrlFilters, UrlFiltersConfig } from './utils/url-filters.svelte.js';
export { createWeeklyList } from './utils/weekly-list.svelte.js';
export type { WeeklyList, WeeklyListConfig } from './utils/weekly-list.svelte.js';
// The list's contract is component-free on purpose, so ./contract carries it
// too — a host's +page.server.ts reads these without loading the grid.
export {
	parseWeeklyListUrl,
	WEEKLIES_PATH,
	weekliesHref,
	WEEKLY_LIST_DEFAULTS,
	WEEKLY_LIST_PARAMS
} from './utils/weekly-list-contract.js';
export { MEDIA_PREFIX, foldMediaUrl, resolveMediaReference } from './utils/media-reference.js';
export {
	MILESTONE_LIST_PARAMS,
	TRANSPARENCY_PATH,
	transparencyHref
} from './utils/milestone-list-contract.js';
export type { MilestoneListFilters } from './utils/milestone-list-contract.js';
export type {
	WeeklyListFilters,
	WeeklyListPage,
	WeeklyListServerData
} from './utils/weekly-list-contract.js';
export { contactCategoryLabel } from './utils/contact.js';
export { formatDate, yearOf } from './utils/dates.js';
