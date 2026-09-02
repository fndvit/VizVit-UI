# Admin

`import { … } from '@vit-foundation/ui/admin'` — shell-level composition for
the foundation's internal tools (Brain and whatever comes next). The host owns
routes, permissions, and auth: everything arrives here already decided,
through props — the same genericization contract as `Nav`/`Footer`.

An admin app normally brings its own theme instead of `tokens.css` — see
[tokens.md](../tokens.md) for the manifest its `:root` must cover.

## AdminShell

The page frame: a fixed icon rail on the left, content beside it.

| Prop        | Type            | Notes                                                  |
| ----------- | --------------- | ------------------------------------------------------ |
| `items`     | `SidebarItem[]` | rail entries, **already permission-filtered**          |
| `navLabel?` | `string`        | accessible name of the nav landmark (`'Principal'`)    |
| `logo?`     | `Snippet`       | brand mark above the rail; the host owns its home link |
| `footer?`   | `Snippet`       | bottom of the rail — the host's logout form            |
| `children`  | `Snippet`       | the page content                                       |
| `url?`      | `URL`           | highlighting override; tests and stories only          |

```svelte
<AdminShell items={visibleSections}>
	{#snippet logo()}<a href="/" aria-label="Inici"><Logo size={30} /></a>{/snippet}
	{#snippet footer()}
		<form {...logoutForm}><button aria-label="Surt"><Icon name="logout" /></button></form>
	{/snippet}
	{@render children()}
</AdminShell>
```

## Sidebar

The rail on its own, for hosts that lay the shell out themselves. Same props
as AdminShell minus `children`. `SidebarItem = { href, icon: IconName, label }`.
The current section highlights by path (`isPathUnder`, read from
`UiConfig.url()`); `/` matches only itself.

## PageHeading

Serif page heading with an optional italic brand-colored accent word.
Props: `accent?`, `rest`, `level?: 1 | 2`.

## DecorMosaic

Full-page decorative geometric mosaic (`variant: 'login' | 'app'`),
`aria-hidden`, pointer events pass through. Named apart from the website's
corner `DecorShapes` on purpose — they are different compositions.
