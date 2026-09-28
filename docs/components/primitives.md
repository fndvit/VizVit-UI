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

## FigureBody, FigureHead, PersonFigure

A person drawn as a stick figure, in parts. `figure/paths.ts` holds the
drawing — the digital-gap survey's stroke paths as closed sets (`ARMS`,
`LEGS`, `HEADS`, with `ArmsPose`, `LegsPose`, `HeadShape`), where each part
sits in the composed box (`FIGURE_VIEWBOX`, `NECK`, `SHOULDER`), and
`calloutPath(side, align)` — so a chart or a decorative band can draw line
people from the same set.

### FigureBody

The line body: a shoulder line with hanging arms and legs in a pose, an
`aria-hidden` svg sized by `--vit-figure-width`. No head — `children` render
INSIDE the svg and share its coordinates, which is where a `FigureHead`, a
marker or a callout goes.
Props: `arms?` (`down`), `legs?` (`standing`), `class?`, `children?`.

### FigureHead

An svg fragment placed on the neck: a cut-out photo with a transparent
background (`photoShape: 'cutout'`), a portrait masked into a circle
(`'circle'`), or, with no photo or one that fails to load, the drawn outline
(`head`). Renders inside a `FigureBody` or any svg in the figure box.
Props: `photo?`, `photoShape?` (`cutout`), `head?` (`round`), `headScale?`
(`1`, scales the photo about the neck so the chin stays put).

```svelte
<FigureBody legs="walking">
	<FigureHead photo={member.cutoutUrl} />
</FigureBody>
```

### PersonFigure

The composition: body, head, and beside them the name and role over a short
rule, joined to the shoulder by a diagonal callout; a `bio` reveals under the
rule on hover, keyboard focus or tap. The drawing is `aria-hidden` and the
name in the caption is the only text.

| Prop          | Type                   | Notes                                                              |
| ------------- | ---------------------- | ------------------------------------------------------------------ |
| `name`        | `string`               | the figure's only accessible text                                  |
| `role?`       | `string`               |                                                                    |
| `bio?`        | `string \| null`       | present → the figure is a focus stop and the bio reveals           |
| `photo?`      | `string \| null`       | absent, or failing to load, the head is drawn                      |
| `photoShape?` | `'cutout' \| 'circle'` | default `cutout`                                                   |
| `head?`       | `HeadShape`            | the drawn head, default `round`                                    |
| `arms?`       | `ArmsPose`             | default `down`                                                     |
| `legs?`       | `LegsPose`             | default `standing`                                                 |
| `headScale?`  | `number`               | default `1`                                                        |
| `labelSide?`  | `'left' \| 'right'`    | default `right`                                                    |
| `labelAlign?` | `'top' \| 'bottom'`    | `top` = beside the head, `bottom` = beside the legs; default `top` |
| `class?`      | `string`               |                                                                    |
| `children?`   | `Snippet`              | an extra marker laid over the body — position it absolutely        |

```svelte
<div style="--vit-figure-width: 9rem">
	<PersonFigure
		name="Núria Serra"
		role="Directora de dades"
		photo={member.cutoutUrl}
		legs="walking"
	/>
</div>
```

Size the three with `--vit-figure-width` (default `10rem`): the art, the
callout run and the rule's height above the caption all follow it, the text
stays in rem. Below about 8rem the two caption lines outgrow the room above a
top-aligned rule — lower `--vit-figure-name-size`/`--vit-figure-role-size` or
align the label `bottom`. The callout leaves the art's box on purpose, so an
ancestor with `overflow: hidden` clips it. Tokens: `--vit-figure-width`,
`-ink`, `-stroke` (viewBox units), `-callout-ink`, `-name-size`, `-role-size`,
`-bio-width` — see [tokens.md](../tokens.md).

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
