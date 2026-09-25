# @vit-foundation/ui

Fundació VIT's shared Svelte 5 component library: the components behind
[fundaciovit.org](https://fundaciovit.org), decoupled from any one app, with
an optional **edit mode** that lets a CMS-shaped consumer make the rendered
content editable in place.

```sh
npm install @vit-foundation/ui
```

Requires `svelte` ^5.0.0 as a peer. `ScrollySteps`, alone in the package,
also needs the optional peer `@sveltejs/svelte-scroller` — see
[scrolly](./docs/components/scrolly.md#installing-the-peer). Import the two
stylesheets once:

```svelte
<script>
	import '@vit-foundation/ui/tokens.css';
	import '@vit-foundation/ui/base.css';
</script>
```

## The library at a glance

Everything exports flat from the root, and again grouped by role:

| Entry point                                                     | What lives there                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/primitives`](./docs/components/primitives.md)                | Button, GhostButton, Link, CardMedia, CardTitle, CopyIntro, DateText, DecorShapes, FilterChips, Pagination, RichText, SearchInput, ShareRow                                                                                                                                       |
| [`/forms`](./docs/forms.md)                                     | Field, SelectField, TextField, FormFeedback, FormErrorFeedback, FormResultSlot, Honeypot, LocaleField, NewsletterIntentField — plus the remote-form seam: structural types, transport constants, field bounds                                                                     |
| [`/chrome`](./docs/components/chrome.md)                        | PageShell, Nav, Footer                                                                                                                                                                                                                                                            |
| [`/content`](./docs/components/content.md)                      | WeeklieCard, ProjectCard, Timeline, TimelineMilestone, TeamMemberCard, CollaboratorList, JobList, SortSelect, the nine page modules (HomePage … WeeklyPage) — plus the data shapes, the page-copy vocabulary, helpers and the two list rules (createWeeklyList, createUrlFilters) |
| [`/community`](./docs/components/community.md)                  | AuthPageShell, LoginForm, SignupForm, GoogleAuthForm, AccountPanel, NewsletterSignup, CommentSection, ReactionBar, ContactForm                                                                                                                                                    |
| [`/admin`](./docs/components/admin.md)                          | DecorMosaic, PageHeading, Sidebar — shell-level composition for the foundation's internal tools                                                                                                                                                                                   |
| [`/scrolly`](./docs/components/scrolly.md)                      | ScrollySteps, ScrollyStepIndicator, CrossfadeVideo, GlassCard, the stepStyle ramp — the only entry point that does NOT re-export from the root, and the only one with a peer of its own                                                                                           |
| [`/madlib`](./docs/components/madlib.md)                        | Madlib, InlineSelect, the sentence-tree helpers (walkTree, completePath, defaultPath, replaceAt, leafPaths) — a sentence with blanks, themed with `--vit-madlib-*`; like `/scrolly`, not re-exported from the root                                                                |
| [`/edit`](./docs/edit-mode.md)                                  | Editable, setEditAdapter(adapter, EDIT_CHROME)/getEditAdapter, descriptors and helpers, collectionEditing, LocalizedText                                                                                                                                                          |
| [`/config`](./docs/getting-started.md#wiring-an-app-uiprovider) | UiProvider, UiConfig, the locale set, the default Catalan messages                                                                                                                                                                                                                |
| `/contract`                                                     | The component-free half: LOCALES, BASE_LOCALE, localize, REACTIONS, PAGE_COPY_KEYS and the edit-descriptor types — the one subpath a host may import from SERVER code                                                                                                             |
| `/testing`                                                      | createRemoteFormMock — the remote-form stand-in for stories and tests                                                                                                                                                                                                             |

Every component renders standalone (Catalan copy, identity hrefs); an app
integrates its i18n and router through one `UiProvider` in the root layout.

## Documentation

- **[Getting started](./docs/getting-started.md)** — install, styles, entry
  points, wiring `UiProvider` (with the foundation website's Paraglide +
  SvelteKit example)
- **[Edit mode](./docs/edit-mode.md)** — descriptors, the `EditAdapter`
  contract, the `Editable` primitive, the editing UX, the save semantics
- **[Forms](./docs/forms.md)** — the remote-form seam: passing preflighted
  forms in, keyed factories, the shared constants, the form building blocks
- **[Theming](./docs/theming.md)** — the design tokens and the base utilities
- **Component reference** — [primitives](./docs/components/primitives.md) ·
  [chrome](./docs/components/chrome.md) ·
  [content](./docs/components/content.md) ·
  [community](./docs/components/community.md) ·
  [admin](./docs/components/admin.md) ·
  [scrolly](./docs/components/scrolly.md)
- **[Changelog](./docs/changelog/index.md)** — one page per version, newest
  first; [unreleased](./docs/changelog/unreleased.md) is what is on `main`
- **Storybook** — `npm run storybook`: every component has a story;
  `Edit mode/EditMode` demos the whole editing loop against an in-memory
  adapter

## Two design rules worth knowing before anything else

1. **The package never talks to a backend.** Content arrives as props; edits
   leave through an injected `EditAdapter`; remote forms are passed in
   preflighted by the host against its own schemas. An app that injects
   nothing gets a read-only render, byte-identical to a build with no edit
   mode at all.
2. **Shared constants have one owner.** The honeypot field name, the
   newsletter-intent encoding, and the field bounds export from `./forms`;
   host apps import them into their schemas so markup and server envelope
   can never drift apart.

## Development

```sh
npm install
npx playwright install chromium --only-shell # once, for component tests
npm run storybook  # component workbench
npm run check && npm run lint && npm run test:unit -- --run
npm run build      # svelte-package + publint
```

Internally, components live in `src/lib/components/<website-group>/` with
stories in `components/stories/<group>/` and tests in
`components/tests/<group>/` — the layout they had in fndvit-website, kept
diffable against history. The public structure is the semantic entry points
above, assembled in `src/lib/{primitives,chrome,content-components,community}.ts`
and `src/lib/forms/index.ts`.

## Cutting a release

Releases are MANUAL. The workflow this section used to describe fired on every
`v*` tag, had no `NPM_TOKEN` and no lint, check or test step, so it failed
every time and was deleted; `prepublishOnly` (lint, check, unit tests) is the
only publish gate now.

**While you work**, add the entry to
[`docs/changelog/unreleased.md`](./docs/changelog/unreleased.md) in the same PR
as the change, under one of Keep a Changelog's types — `Added`, `Changed`,
`Deprecated`, `Removed`, `Fixed`, `Security` — or
`Other (dependencies, CI, tools…)` for what a consumer never sees. One fact,
one entry: if a type already covers the thing you changed, edit that entry so
it describes the end state. A change a consumer must act on before upgrading
carries an **Upgrading:** paragraph.

**On release day**, in one commit (`chore(release): x.y.z`):

1. Read `unreleased.md` once as a whole and merge what the individual PRs
   restated.
2. `git mv docs/changelog/unreleased.md docs/changelog/x.y.z.md`. Retitle it
   `# x.y.z`, date it, and point its compare link at the tag range rather than
   at `main`.
3. Write a fresh `unreleased.md` with the same header and no entries — copy the
   one you just renamed rather than inventing a new shape.
4. Add the row to [`docs/changelog/index.md`](./docs/changelog/index.md).
5. `npm version x.y.z` — MINOR for new exports and features, PATCH for fixes
   alone, MAJOR for anything that breaks a consumer's imports or markup.
6. `npm publish`. Check `npm view @vit-foundation/ui version` first: the
   registry has been ahead of `main` before.
7. `git push && git push origin vx.y.z`. Nothing automated reads the tag, but
   the compare links in the changelog do.

**Publish from a clean checkout of `main`, never from a tree with uncommitted
work.** 0.28.0 was published from one: it carried an icon that reached npm and
nothing else, and the next release would have silently removed it again if the
tarball had not been diffed against the source first.

A released page is history: never rewrite one to match later code. If it is
wrong, say so on the next version's page.
