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

## Pages

The nine website pages, as modules: a route file becomes one tag over the
site's read projection, and a CMS opens the same tag with an `edit` map. Each
module wraps its content in `PageShell` (so it owns the browser title), reads
its interface wording from `UiMessages`, and renders the site's markup
byte-for-byte when no `edit` is passed and the provider has no `messageEdit`
— the inert `Editable`/`EditFrame`/`ActionLabel` path adds nothing.

| Module             | Data props (the site's `+page.server.ts` shape)                        | Host adapters                                                  | `edit?`                                                                                   |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `HomePage`         | `content: PageCopy<'home'>`, `milestones`, `weeklies`                  | `onsearch(query)` — the host navigates to its /weeklies        | `HomePageEdit { copy?, milestoneFor?, weeklyFor? }`                                       |
| `WhoWeArePage`     | `content`, `featured`, `board`, `collaborators`                        | —                                                              | `WhoWeArePageEdit { copy?, memberFor?, collaboratorFor?, collaborators?: CollectionRef }` |
| `WhatWeDoPage`     | `content`, `latest?` (null = no showcase), `collaborations`, `passion` | —                                                              | `WhatWeDoPageEdit { copy?, projectFor? }`                                                 |
| `GetInvolvedPage`  | `content`, `jobs`                                                      | `form: ContactFormInstance` (preflighted, or the testing mock) | `GetInvolvedPageEdit { copy?, jobFor?, jobs?: CollectionRef }`                            |
| `TransparencyPage` | `content`, `milestones`                                                | `query: { q, category }` (server-parsed), `replaceUrl(path)`   | `TransparencyPageEdit { copy?, milestoneFor?, milestones?: CollectionRef }`               |
| `LegalPage`        | `content: PageCopy<'legal'>`                                           | —                                                              | `LegalPageEdit { copy? }`                                                                 |
| `WeekliesPage`     | `content`, `themes: ThemeData[]`, `server: WeeklyListServerData`       | `fetchPage`, `replaceUrl(path)` — see `createWeeklyList`       | `WeekliesPageEdit { copy?, weeklyFor?, themeFor? }`                                       |
| `ProjectPage`      | `project: ProjectArticleData`                                          | —                                                              | `ArticleEdit { title?, excerpt?, body? }`                                                 |
| `WeeklyPage`       | `weekly: WeeklyArticleData`, `related`, `comments`, `reactions`        | `isLoggedIn`, `commentForm`, `replyFormFor`, `reactionForms`   | `ArticleEdit`                                                                             |

The page-copy vocabulary — `PAGE_COPY_KEYS` (which section keys each page
reads), `GET_INVOLVED_REASON_KEYS` (the five reasons, in order), and the types
`PageId`, `CopyKey<P>`, `PageCopy<P>`, `CopyEditFor<P>` — exports from here
and from `./contract`, so a host's server load builds `PageCopy<P>` from the
same tuple the module indexes. A `copy` editor is `(key: CopyKey<P>) =>
EditDescriptor | undefined`: a CMS answers a `page-copy` ref per block and
cannot name a block the page does not declare.

Wording is the module's own business: the h1 (`nav_*`), the empty states,
«…o explora'n un», the back link and the section headings edit inline through
`config.messageEdit`; the search placeholders, the sort options and the
`common_seeAll` / `cta_*` links edit through their panels and modals over
`chromeProperty`, gated on the same `messageEdit`. The category chips on
/transparency are `category_*` keys; the theme chips on /weeklies are entity
names, so that page takes `themeFor`.

Paging on `WeekliesPage` goes through `Pagination` → `Link` → `UiConfig.href`,
so a host that re-roots the site (a CMS mirror under `/website/pages`) supplies
that prefix ONCE, in `href`, and never wraps `hrefFor` itself.

## Helpers exported here

`renderBody` (the rich-text block parser), `formatDate` / `yearOf`,
`MILESTONE_CATEGORY_COLOR` / `milestoneCategoryLabel(category, messages)` /
`matchesMilestoneFilter(milestone, { q, category })` (the transparency page's
client-side predicate), `contactCategoryLabel(category, messages)`,
`REACTIONS`, `CONTACT_CATEGORIES`, `PAGE_COPY_KEYS` / `GET_INVOLVED_REASON_KEYS`
(the page-copy vocabulary the page modules index by).

## The two list rules

Rune modules a listing page mounts in its script — the state that used to
sit in the site's route files, where nothing could test it.

`createUrlFilters({ path, initial, toQuery, onChange?, replaceUrl })` — filter
state that lives in the URL both ways: seeded from the server-rendered values
(`initial` is a thunk, read in an effect, so a same-route navigation re-seeds
it), mirrored back through `replaceUrl` on every `update(patch)`. `replaceUrl`
is REQUIRED: shallow routing belongs to the host's router, the package has
none. Returns `{ values, query, update }`.

`createWeeklyList({ server, fetchPage, locale, replaceUrl })` — the weeklies
index over those filters: `items`, `total` and `page` read the server data
until a filter change refetches page one through `fetchPage` (the host's
remote query) and takes over; a navigation drops the override and clears a
failed refetch; `hrefFor(page)` builds paging links that carry the filters
and omit defaults. `WEEKLY_LIST_DEFAULTS` (`{ sort: 'desc', page: 1 }`) is
exported so the host's query schema supplies the same values this module
omits.
