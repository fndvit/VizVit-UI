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
// The sixth `*EditMap`: its five siblings were exported and this one was not,
// so a host typing a collaborator's rows had to restate the shape.
export type { CollaboratorEditMap } from './components/team/CollaboratorList.svelte';
export { default as Timeline } from './components/timeline/Timeline.svelte';
export { default as TimelineMilestone } from './components/timeline/TimelineMilestone.svelte';
export type { MilestoneEditMap } from './components/timeline/TimelineMilestone.svelte';
export { default as WeeklieCard } from './components/weeklies/WeeklieCard.svelte';
export type { WeeklyEditMap } from './components/weeklies/WeeklieCard.svelte';
export * from './content/index.js';
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
	WEEKLY_LIST_DEFAULTS,
	WEEKLY_LIST_PARAMS,
	parseWeeklyListUrl
} from './utils/weekly-list-contract.js';
export type {
	WeeklyListFilters,
	WeeklyListPage,
	WeeklyListServerData
} from './utils/weekly-list-contract.js';
export { contactCategoryLabel } from './utils/contact.js';
export { formatDate, yearOf } from './utils/dates.js';
