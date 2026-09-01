# Getting started

```sh
npm install @vit-foundation/ui
```

`svelte` ^5.0.0 is the only peer dependency.

## Styles

Two stylesheets ship with the package. Import both once, in your root layout:

```svelte
<script>
	import '@vit-foundation/ui/tokens.css'; // design tokens (CSS custom properties)
	import '@vit-foundation/ui/base.css'; // utility classes + edit-mode affordance
</script>
```

Every component styles itself through the tokens (`--color-brand`, `--space-*`,
`--text-*`, …), so overriding a token restyles the whole set. An app with its
own global stylesheet that already defines the `base.css` utility classes
(`.visually-hidden`, `.band`, `.control`, `.form-stack`, …) can keep its copies
and skip that file.

## Entry points

Everything is exported flat from the root, and again grouped by role:

| Import                          | Contents                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `@vit-foundation/ui`            | everything below, flat                                                               |
| `@vit-foundation/ui/primitives` | generic UI atoms — [reference](./components/primitives.md)                           |
| `@vit-foundation/ui/forms`      | form building blocks + the remote-form seam — [guide](./forms.md)                    |
| `@vit-foundation/ui/chrome`     | PageShell, Nav, Footer — [reference](./components/chrome.md)                         |
| `@vit-foundation/ui/content`    | content renderers + data shapes — [reference](./components/content.md)               |
| `@vit-foundation/ui/community`  | auth, account, comments, reactions, contact — [reference](./components/community.md) |
| `@vit-foundation/ui/edit`       | the edit-mode contract — [guide](./edit-mode.md)                                     |
| `@vit-foundation/ui/config`     | `UiProvider` and the `UiConfig` context                                              |
| `@vit-foundation/ui/testing`    | `createRemoteFormMock` for stories and tests                                         |

## Wiring an app: `UiProvider`

Every component renders standalone — Catalan copy, identity hrefs, no router.
To integrate with an app's i18n and routing, mount `UiProvider` once in the
root layout. The foundation website wires it to Paraglide and SvelteKit:

```svelte
<script lang="ts">
	import { UiProvider, Nav, Footer } from '@vit-foundation/ui';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { deLocalizeUrl, getLocale, locales, localizeHref } from '$lib/paraglide/runtime';

	let { children, data } = $props();

	const links = $derived([
		{ href: '/what-we-do', label: m.nav_whatWeDo() }
		// …the app owns its route list
	]);
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
	<Nav account={data.account} {links} />
	{@render children()}
	<Footer {links} />
</UiProvider>
```

Rules that keep this working:

- **`locale()` and `url()` are function reads, on purpose.** The provider's
  reactive sources flow through them; a captured snapshot silently freezes
  locale switching and current-page highlighting.
- **`messages` is all-or-nothing** — a typed structural subset of a Paraglide
  `m` module, so an app that compiles these keys passes its `m` wholesale.
  Keys consumed only through this package still count as used: don't prune
  them from the message catalogue.
- Omit any field to keep the package default (identity hrefs, `'ca'`, the
  built-in Catalan copy, `siteName: 'ViT'`).

## The component workbench

```sh
npm run storybook
```

Every component has a story; `Edit mode/EditMode` is an interactive demo of
the whole editing loop against an in-memory adapter.
