# Admin

`import { … } from '@vit-foundation/ui/admin'` — shell-level composition for
the foundation's internal tools (Brain and whatever comes next). The host owns
routes, permissions, and auth: everything arrives here already decided,
through props — the same genericization contract as `Nav`/`Footer`.

An admin app normally brings its own theme instead of `tokens.css` — see
[tokens.md](../tokens.md) for the manifest its `:root` must cover.

## Sidebar

The rail, which a host lays out itself — the package ships no page frame, on
the evidence that the only admin host composes its own.

| Prop        | Type            | Notes                                                  |
| ----------- | --------------- | ------------------------------------------------------ |
| `items`     | `SidebarItem[]` | rail entries, **already permission-filtered**          |
| `navLabel?` | `string`        | accessible name of the nav landmark (`'Principal'`)    |
| `logo?`     | `Snippet`       | brand mark above the rail; the host owns its home link |
| `footer?`   | `Snippet`       | bottom of the rail — the host's logout form            |
| `url?`      | `URL`           | highlighting override; tests and stories only          |

`SidebarItem = { href, icon: IconName, label }`.
The current section highlights by path (`isPathUnder`, read from
`UiConfig.url()`); `/` matches only itself.

## PageHeading

Serif page heading with an optional italic brand-colored accent word.
Props: `accent?`, `rest`, `level?: 1 | 2`.

## DecorMosaic

Full-page decorative geometric mosaic (`variant: 'login' | 'app'`),
`aria-hidden`, pointer events pass through. Named apart from the website's
corner `DecorShapes` on purpose — they are different compositions.
