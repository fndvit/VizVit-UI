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

## TimelineAreas

The home timeline as a scrolly: a rail down the left with one node per area
(lab, education, tools) and the areas as full-height sections beside it. The
rail sticks while the sections flow. An area is current from the moment its
heading reaches the upper third of the screen: its node is `aria-current`
and sits at the top row, level with the heading, and every other node waits
at the bottom of the screen in the areas' order — moving between those
places as the reader scrolls. In the stacked flow an area's content enters
and leaves with the scroll — rising into place and brightening over the
lower third of the screen, fading and lifting as it goes out at the top —
and the nodes follow their headings: a node rides level with its heading while it is on screen
(ticked to it, its label hidden), parks at the top once the heading has
scrolled past and waits at the bottom while it is still to come, so no step
is ever named twice by a parked label and a heading at once. On a wide
screen with JavaScript and motion allowed it is a STAGE: the frame is pinned
for one screen of track per area and the areas lie over each other in it,
the one reached shown and the others off the frame, so the screen holds
still and the slide changes — a swipe with resistance: the wheel's travel
accumulates and the page only yields (the current slide lifts, the next
peeks in, ever more slowly) until a threshold, springing back if the gesture
stops short and, once it is passed, the cards moving whole — the current up
and out through the top of the frame, the next in through the bottom — on
one ease-in-out curve of ~640 ms; from
the splash to the first area and from area to area, arrow keys and a touch
swipe going a slide outright, and past the last slide the page is the
reader's again. The current node holds the top row; every other node,
passed or to come, waits at the bottom in order, so all the steps stay in
view. Stacked otherwise: the server
render, a phone, reduced motion, and a CMS editing (every frame in reach). Each area is a slide: the document snaps to an area's top
when the scroll rests near one (`scroll-snap-type: y proximity`, set on the
document for the region's lifetime), so a wheel's turn lands the next area
whole; a tick runs from the current node to its heading, and two decor
clusters hold the right edge of the screen. The line draws itself in as the
timeline rises into view. ONE document for every reader — without JavaScript, under
reduced motion, on a narrow viewport or while a CMS edits, the same DOM reads
top to bottom; only the rail's stickiness and the current mark are
progressive. Props: `areas: TimelineAreaData[]`, `areaHref: (area) => string`
(where «To our … timeline» goes — `areaDestination`'s one rule: the area's own `href`, else its category's history on the host's «see all» path, else no link; `HomePage` builds it from
`common_seeAllHref` and the category), `editFor?: (area) => TimelineAreaEditMap`,
`seeAll?: Snippet` (the closing link, bottom-right), `motion?: 'swipe' | 'scroll'`
(`swipe`, the default, is the stage below; `scroll` is the stacked flow
everywhere), and on the stage `entry?` and `exit?` (each `'swipe' |
'scroll'`, `swipe` by default): whether the run begins with the splash as
its first slide or at the first area after the page's own scroll, and
whether it ends with a swipe on to what follows the timeline or lets the
page scroll on from the last area. A reader the page's own scroll drops
between two slides is caught by their first gesture, which drives to the
slide in its direction. The stage sits under the fixed nav
(`--vit-splash-offset`). Wording:
`timeline_areasLabel`, `timeline_toArea({ area })`.

## ThemeCollage

The weeklies' themes as four labelled pictures, the way the home page offers
them: a staggered collage — one picture lower left with its name reading up
its side, one mid with the name under it, one high right with the name over
it, one under that with the name reading down its side — every picture in
the brand's plum (the photo's light over `--color-wine`), full colour under
the pointer; a theme without a picture is a flat tint. Each is a link to the
theme's weeklies. Props: `themes: ThemeData[]` (the first four are shown),
`themeHref(theme)`, `editFor?(theme) → ThemeEditMap { name?, image?, label? }`
(the name inline, the picture through the frame's panel), and a `lead`
snippet laid INSIDE the collage's grid over the first two columns of its
first row — the home page puts the band's heading, intro and search there,
so the high-right picture sits level with the heading whatever the copy's
length. Two columns and no stagger under 900px.

## TimelineArea

One area, one column at the design's measure: heading, paragraph (with
`**strong**` runs), the link to that area's history (`timeline_toArea`, whose
`**` runs the wording carries, with a long rule and head running on from it)
and, beneath, an `ImageCollage` of its first four pictures, each a link where
its `href` says (`TimelineAreaImage { url, href, label }`). A full-height
`<section>` whose `id` the rail anchors point at; `state` (`passed` /
`current` / `upcoming`, set by `TimelineAreas`) holds its pieces back until
the scroll brings it in. Props: `area`, `href`, `id`, `state?`,
`edit?: TimelineAreaEditMap` (`title`, `body` inline; `category`, `status`
in the panel; `record` for the pencil — no image row, the record form owns
the array, and no `removeOp`: an area is one row per category).

## TimelineMilestone

One milestone: category dot + label (colored by `MILESTONE_CATEGORY_COLOR`,
labels always accompany the color), date, title, body, optional image and
read-more (external URLs detected and rendered as bare anchors). Props:
`milestone: MilestoneData`, `edit?: MilestoneEditMap` (`title`, `body`).

## TeamMemberCard

Portrait, name, role, optional bio. `variant: 'featured' | 'board'`.
Props: `member: TeamMemberData`, `variant?`, `edit?: TeamMemberEditMap`
(`role`, `bio` — `name` is a plain-text column, not localized, so the
per-locale save contract doesn't apply to it; `name` and `photo` edit through
the frame's panel). The map also carries the eight `figure*` rows, which the
card ignores and `TeamFigure` reads.

## TeamFigure

One member as a `PersonFigure`, drawn from the row's optional `figure*`
fields (`TeamMemberData`): `figureArms`, `figureLegs`, `figureHead`
(`cutout` sits the photo on the neck, `circle` masks it, `drawn` uses the
outline whatever the photo — as does an empty `photoUrl`), `figureLabelSide`,
`figureLabelAlign`, `figureOffset` (px down, `FIGURE_OFFSET`'s range),
`figureHeadScale` and `figureSize` (percents, `FIGURE_PERCENT`'s range). The
vocabularies are `ARM_POSES`, `LEG_POSES`, `HEAD_MODES`, `LABEL_SIDES`,
`LABEL_ALIGNS` on `./contract`, so a host's enum derives from them.
Props: `member: TeamMemberData`, `edit?: TeamMemberEditMap`, `class?`.

Editing is one door and no inline text: the frame's pencil opens the host's
full form for the row (`edit.record`, with an adapter that implements
`openRecord`) — the name, the role and bio in every language, the photo and
the nine figure settings together. No panel: it would repeat the figure rows
behind a second button. With a `collection` on the field, the trash removes.

Sizing: `--vit-figure-width` is `--vit-team-figure-base` × `figureSize`, and
the offset is an in-flow `margin-top` × `--vit-team-figure-offsets` (both in
`tokens.css`; the field sets them per breakpoint). On the field's canvas it
also takes `placement` (the field's resolved x, y, layer and size) and
`layers` (the other figures' lowest and highest layer), which it sets as
`--vit-team-figure-x` / `-y` / `-z` and hands to the `Placeable` handles.

## TeamFigureField

The featured team between the brand shapes: `DecorShapes` left and right on
the home hero's grid, the figures on a CANVAS between them. Each member stands
at its row's `figureX` / `figureY` on its `figureZ` layer — thousandths of the
canvas WIDTH, both axes (`FIGURE_POSITION`, `FIGURE_LAYER` on `./contract`),
so the collage scales as one piece and the base width is `12cqi`. A member
with no position takes the next place of a centred row layout of four, its
`figureOffset` nudging it down, keyed on its index among ALL the members, so
moving one figure never moves another (`layout.ts`: `placeFigures`,
`canvasHeight`). The canvas grows to the lowest figure.

Narrow — the field's container under 40rem — the positions are ignored and the
figures flow in order (`sort_order`), wrapping like any list; below 900px the
shapes go, the base width drops to 6.5rem and offsets collapse. The switch is a
container query: the server renders both and no script decides.

Props: `members: TeamMemberData[]`,
`editFor?: (member) => TeamMemberEditMap | undefined`, `collection?:
CollectionRef` (turns on the add slot — which prefers the host's `openRecord`
form for a new member over a seeded row — and each figure's remove), `class?`.
Where the adapter implements `savePlacement`, each figure on the canvas takes
the `Placeable` handles through its `record` (see the edit-mode guide).

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

| Module             | Data props (the site's `+page.server.ts` shape)                        | Host adapters                                                                                                                              | `edit?`                                                                                             |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `HomePage`         | `content: PageCopy<'home'>`, `areas`, `themes`                         | `onsearch(query)` — the host navigates to its /weeklies; `timelineMotion?`, `timelineEntry?`, `timelineExit?` (each `'swipe' \| 'scroll'`) | `HomePageEdit { copy?, areaFor?, areas? (collection), themeFor? }`                                  |
| `WhoWeArePage`     | `content`, `featured` (as `TeamFigureField`), `board`, `collaborators` | —                                                                                                                                          | `WhoWeArePageEdit { copy?, memberFor?, collaboratorFor?, collaborators?, members?: CollectionRef }` |
| `WhatWeDoPage`     | `content`, `latest?` (null = no showcase), `collaborations`, `passion` | —                                                                                                                                          | `WhatWeDoPageEdit { copy?, projectFor? }`                                                           |
| `GetInvolvedPage`  | `content`, `jobs`                                                      | `form: ContactFormInstance` (preflighted, or the testing mock)                                                                             | `GetInvolvedPageEdit { copy?, jobFor?, jobs?: CollectionRef }`                                      |
| `TransparencyPage` | `content`, `milestones`                                                | `query: { q, category }` (server-parsed), `replaceUrl(path)`                                                                               | `TransparencyPageEdit { copy?, milestoneFor?, milestones?: CollectionRef }`                         |
| `LegalPage`        | `content: PageCopy<'legal'>`                                           | —                                                                                                                                          | `LegalPageEdit { copy? }`                                                                           |
| `WeekliesPage`     | `content`, `themes: ThemeData[]`, `server: WeeklyListServerData`       | `fetchPage`, `replaceUrl(path)` — see `createWeeklyList`                                                                                   | `WeekliesPageEdit { copy?, weeklyFor?, themeFor? }`                                                 |
| `ProjectPage`      | `project: ProjectArticleData`                                          | —                                                                                                                                          | `ArticleEdit { title?, excerpt?, body? }`                                                           |
| `WeeklyPage`       | `weekly: WeeklyArticleData`, `related`, `comments`, `reactions`        | `isLoggedIn`, `commentForm`, `replyFormFor`, `reactionForms`                                                                               | `ArticleEdit`                                                                                       |

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

`renderBody` (the rich-text block parser), `renderInline` / `plainInline`
(its `**strong**` runs, and the text without them), `formatDate` / `yearOf`,
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
