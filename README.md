# @vit-foundation/ui

Fundació VIT's shared Svelte 5 component library: the components behind
[fundaciovit.org](https://fundaciovit.org), decoupled from any one app, with
an optional **edit mode** that lets a CMS-shaped consumer make the rendered
content editable in place.

```sh
npm install @vit-foundation/ui
```

Requires `svelte` ^5.0.0 as a peer. Import the two stylesheets once:

```svelte
<script>
	import '@vit-foundation/ui/tokens.css';
	import '@vit-foundation/ui/base.css';
</script>
```

## The library at a glance

Everything exports flat from the root, and again grouped by role:

| Entry point                                                     | What lives there                                                                                                                                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/primitives`](./docs/components/primitives.md)                | Button, GhostButton, Link, CardMedia, CardTitle, CopyIntro, DateText, DecorShapes, FilterChips, Pagination, RichText, SearchInput, ShareRow                                                              |
| [`/forms`](./docs/forms.md)                                     | Field, FormFeedback, FormErrorFeedback, FormResultSlot, Honeypot, LocaleField, NewsletterIntentField — plus the remote-form seam: structural types, transport constants, field bounds                    |
| [`/chrome`](./docs/components/chrome.md)                        | PageShell, Nav, Footer                                                                                                                                                                                   |
| [`/content`](./docs/components/content.md)                      | WeeklieCard, ProjectCard, Timeline, TimelineMilestone, TeamMemberCard, CollaboratorList, JobList, SortSelect — plus the data shapes, helpers and the two list rules (createWeeklyList, createUrlFilters) |
| [`/community`](./docs/components/community.md)                  | AuthPageShell, LoginForm, SignupForm, GoogleAuthForm, AccountPanel, NewsletterSignup, CommentSection, ReactionBar, ContactForm                                                                           |
| [`/edit`](./docs/edit-mode.md)                                  | Editable, setEditAdapter/getEditAdapter, descriptors and helpers, collectionEditing, LocalizedText                                                                                                       |
| [`/config`](./docs/getting-started.md#wiring-an-app-uiprovider) | UiProvider, UiConfig, the locale set, the default Catalan messages                                                                                                                                       |
| `/contract`                                                     | The component-free half: LOCALES, BASE_LOCALE, localize, REACTIONS and the edit-descriptor types — the one subpath a host may import from SERVER code                                                    |
| `/testing`                                                      | createRemoteFormMock — the remote-form stand-in for stories and tests                                                                                                                                    |

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
  [community](./docs/components/community.md)
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

Releases are MANUAL: bump with `npm version`, then `npm publish`. The
workflow this paragraph used to describe fired on every `v*` tag, had no
`NPM_TOKEN` and no lint, check or test step, so it failed every time and was
deleted; `prepublishOnly` (lint, check, unit tests) is the only publish gate
now. Push the tag by all means — nothing reads it.
