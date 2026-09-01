# Content renderers

`import { … } from '@vit-foundation/ui/content'` — the components that
present database content. All prop-driven (no component fetches anything),
all edit-mode capable through per-field descriptor maps
([edit mode guide](../edit-mode.md)). The structural data shapes they consume
(`WeeklyCardData`, `MilestoneData`, …) export from the same entry point — a
host app's own row types satisfy them structurally.

## WeeklieCard

A weekly's listing card: number, date, square image, linked title, excerpt.

| Prop     | Type                                  |
| -------- | ------------------------------------- |
| `weekly` | `WeeklyCardData`                      |
| `edit?`  | `{ title?, excerpt? }: WeeklyEditMap` |

While the title is being edited it renders as plain text, not a link — a
contenteditable inside an anchor still navigates on click.

## ProjectCard

A project card, `variant: 'wide'` (collaboration rows) or `'grid'` (tiles).
Title links to the story, the external URL, or renders plain — per the row's
`hasStory`/`externalUrl`. Props: `project: ProjectCardData`, `variant?`,
`edit?: ProjectEditMap` (`title`, `excerpt`).

## Timeline

Horizontally scrolling milestone track (keyboard-focusable region);
`variant: 'full'` adds year markers. Props: `milestones: MilestoneData[]`,
`variant?: 'compact' | 'full'`, `editFor?: (milestone) => MilestoneEditMap`.

## TimelineMilestone

One milestone: category dot + label (colored by `MILESTONE_CATEGORY_COLOR`,
labels always accompany the color), date, title, body, optional image and
read-more (external URLs detected and rendered as bare anchors). Props:
`milestone: MilestoneData`, `edit?: MilestoneEditMap` (`title`, `body`).

## TeamMemberCard

Portrait, name, role, optional bio. `variant: 'featured' | 'board'`.
Props: `member: TeamMemberData`, `variant?`, `edit?: TeamMemberEditMap`
(`role`, `bio` — `name` is a plain-text column, not localized, so the
per-locale save contract doesn't apply to it).

## CollaboratorList

Names with linked affiliations. Props: `collaborators: CollaboratorData[]`.

## JobList

Open roles with empty-state and newsletter nudge copy from `UiMessages`.
Props: `jobs: JobOpeningData[]`, `editFor?: (job) => JobEditMap`
(`title`, `description`).

## SortSelect

The weeklies list's date-direction select.
Props: `value: SortDirection`, `onchange(value)`.

## Helpers exported here

`renderBody` (the rich-text block parser), `formatDate` / `yearOf`,
`MILESTONE_CATEGORY_COLOR` / `milestoneCategoryLabel(category, messages)`,
`contactCategoryLabel(category, messages)`, `REACTIONS`, `CONTACT_CATEGORIES`.
