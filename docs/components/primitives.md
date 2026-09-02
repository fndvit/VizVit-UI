# Primitives

`import { … } from '@vit-foundation/ui/primitives'` — generic UI atoms,
domain-free. All of them also re-export from the package root.

## Button

Button (or anchor styled as one) in the brand style. Two prop branches that
cannot mix: a form button carries `pending`, an anchor carries `href`.

| Prop        | Type                             | Notes                                                                                                                                                                           |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant?`  | `'primary' \| 'navy' \| 'ghost'` | closed set; `primary` is the pre-variant look and the default                                                                                                                   |
| `size?`     | `'md' \| 'sm'`                   | default `md`                                                                                                                                                                    |
| `pending`   | `number \| null`                 | button branch, **required** — the remote form's submitting count (`form.pending`), or `null` for a control with genuinely no pending state. `> 0` disables and sets `aria-busy` |
| `disabled?` | `boolean`                        | button branch: unavailability of the button's own, independent of pending                                                                                                       |
| `href`      | `string`                         | anchor branch — renders `<a class="button">`; no `pending`, no `disabled`                                                                                                       |
| `download?` | `boolean`                        | anchor branch                                                                                                                                                                   |
| …rest       | element attributes of the branch | spread onto the element; `type` defaults to `'button'`                                                                                                                          |

```svelte
<Button type="submit" pending={form.pending}>Envia</Button>
<Button href="/export.csv" download variant="navy">Descarrega</Button>
```

Shapes follow `--radius`; a theme wanting pill buttons overrides the token,
not the component (see [tokens.md](../tokens.md)).

## GhostButton

Transparent (`variant="ghost"`) or grey-pill (`variant="chip"`) button; chips
style their `aria-pressed` state. Spreads rest props.

## Icon

Stroke-based 24×24 icon from a closed named set (`IconName`); decorative
(`aria-hidden`) — pair it with a labelled control. Props: `name`, `size?` (20).

## IconButton

Icon-only button that must say what it does.
Props: `icon: IconName`, `label` (becomes `aria-label` + `title`),
`disabled?`, `onclick?`.

## Logo

The foundation's brain-head mark, optionally with the "Brain VIT" wordmark
(`--font-serif`). Props: `size?` (32), `withWordmark?`.

## Modal

Native `<dialog>` modal: `showModal()` focus trap, backdrop click and Escape
both report through `onclose`. The host owns `open`.
Props: `open`, `title`, `onclose`, `closeLabel?` (`'Tanca'`), `children`.

## Link

Internal anchor whose `href` is a canonical app path run through
`UiConfig.href` (the app's locale prefixing). Never hand it an absolute URL —
external links render a bare `<a rel="external noopener">` at the call site.

| Prop      | Type                   | Notes                                      |
| --------- | ---------------------- | ------------------------------------------ |
| `href`    | `string`               | canonical (unlocalized) internal path      |
| `locale?` | `Locale`               | target locale; defaults to the current one |
| …rest     | `HTMLAnchorAttributes` |                                            |

## CardMedia

Lazy `<img>` with rounded corners and grey placeholder background.
Props: `src`, `alt` (empty string for decorative images), `ratio?` (CSS
aspect-ratio, e.g. `'16 / 9'`), plus img attributes.

## CardTitle

The `<h3>` a card titles itself with; children may be plain text or a Link.

## CopyIntro

Editorial intro paragraph (muted, 60ch measure).
Props: `text: string`, `edit?: EditDescriptor`.

## DateText

`<time>` with a machine-readable `datetime` and the day formatted in the
config locale (fixed Europe/Madrid resolution for timestamps).
Props: `value: string` — ISO date or timestamp.

## DecorShapes

The brand's decorative corner composition (static SVG, `aria-hidden`).
Props: `flip?: boolean`.

## FilterChips

Toggle chip group; clicking the active chip unselects it.
Props: `chips: {value, label}[]`, `selected: string | null`, `label` (group
aria-label), `onchange(value | null)`.

## Pagination

Previous/next paging as real links (works without JS, crawlable). Renders
nothing on a single page; recovers from out-of-range pages.
Props: `page` (1-based), `total` (items), `pageSize`, `href(page) => string`.

## RichText

Renders the block mini-format (`## ` subheadings, blank-line paragraphs) with
real elements — never `{@html}`. With `edit` (format `'richtext'`) and an
active adapter it offers a source editor with live preview.
Props: `body: string`, `edit?: EditDescriptor`. Parse with the exported
`renderBody(body)` if you need the blocks yourself.

## SearchInput

Debounced `role="search"` box with echo-detection (a caller writing the
emitted value back mid-debounce doesn't clobber typing).
Props: `placeholder`, `label`, `onsearch(query)`, `value?`, `id?`,
`debounceMs?` (300).

## ShareRow

Share links (X, LinkedIn) plus copy-to-clipboard with an announced
confirmation. Props: `title`, `url?` (defaults to the config URL),
`writeClipboard?`, `copiedResetMs?`.
