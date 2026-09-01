# @vit-foundation/ui

Fundació VIT's shared Svelte 5 component library: the components behind
[fundaciovit.org](https://fundaciovit.org), decoupled from any one app, with an
optional **edit mode** that lets a CMS-shaped consumer make the rendered
content editable in place.

```sh
npm install @vit-foundation/ui
```

Requires `svelte` ^5.0.0 as a peer.

## Quick start

```svelte
<script>
	import { WeeklieCard, PageShell } from '@vit-foundation/ui';
	import '@vit-foundation/ui/tokens.css'; // design tokens (CSS custom properties)
	import '@vit-foundation/ui/base.css'; // utility classes + edit affordance
</script>

<PageShell title="Weeklies">
	<WeeklieCard weekly={data.weekly} />
</PageShell>
```

Every component renders standalone with Catalan copy and identity hrefs.
Subpath imports are available when you want a narrower graph:
`@vit-foundation/ui/ui`, `/layout`, `/weeklies`, `/projects`, `/team`,
`/timeline`, `/jobs`, `/edit`, `/config`.

## Wiring a host app: `UiProvider`

Strings, href resolution, the active locale, and the current URL come from a
`UiConfig` context. Mount it once, in the root layout. The foundation website
wires it to Paraglide and SvelteKit like this:

```svelte
<script>
	import { UiProvider } from '@vit-foundation/ui';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, deLocalizeUrl } from '$lib/paraglide/runtime';
</script>

<UiProvider
	config={{
		href: (path, options) => localizeHref(path, options),
		locale: () => getLocale(),
		locales,
		url: () => page.url,
		canonicalPathname: (url) => deLocalizeUrl(url).pathname,
		siteName: 'ViT',
		messages: m
	}}
>
	{@render children()}
</UiProvider>
```

`locale`, `url`, and `messages` reads are lazy, so reactive sources flow
through: a locale switch re-renders every consumer without a remount.
`messages` is a typed structural subset of a Paraglide `m` module — pass it
wholesale. Keys consumed only through this package still count as used;
don't prune them from your message catalogue.

## Edit mode

Components render plain, already-localized strings. To make one editable,
pass an _edit descriptor_ naming what the string is — and install an
`EditAdapter` that knows how to persist it. No adapter (or `isEditing`
off) means every descriptor is inert and the render is byte-identical to
the read-only one. **The package never talks to a database.**

```svelte
<script>
	import { setEditAdapter, entityEdit, WeeklieCard } from '@vit-foundation/ui';

	let editing = $state(false);

	setEditAdapter({
		get isEditing() {
			return editing;
		},
		// Merge { [descriptor.locale]: value } into the localized column.
		// Reject when persistence fails — the editor keeps the draft and
		// shows the error state. Never let a save empty the canonical `ca`.
		save: (descriptor, value) => saveContent(descriptor, value)
	});

	const edit = entityEdit('weeklies', weekly.id, 'ca');
</script>

<WeeklieCard {weekly} edit={{ title: edit('title'), excerpt: edit('excerpt') }} />
```

Editing UX: click into an outlined text, type, and blur or press Enter to
save (Cmd/Ctrl+Enter for multiline fields, Escape reverts). `RichText`
opens a source editor over the block mini-format with a live preview.
Wrap your own render sites with the `Editable` primitive:

```svelte
<Editable edit={pageCopyEdit('home', 'hero_title', 'ca')} value={copy.hero_title}>
	{#snippet children(text, attrs)}
		<h1 {...attrs}>{text}</h1>
	{/snippet}
</Editable>
```

The `content` types (`LocalizedText`, `ContentRef`, …) mirror the
foundation's content model: localized text is a per-locale record whose
Catalan value is canonical and required.

## Development

```sh
npm install
npx playwright install chromium --only-shell # once, for component tests
npm run storybook  # component workbench
npm run check && npm run lint && npm run test:unit -- --run
npm run build      # svelte-package + publint
```

Stories live in `src/lib/components/stories/<group>/`, component tests in
`src/lib/components/tests/<group>/`, mirroring the component tree.

Releases: bump with `npm version`, push the `v*` tag, and the release
workflow publishes to npm.
