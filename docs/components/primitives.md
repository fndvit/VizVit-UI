# Primitives

`import { … } from '@vit-foundation/ui/primitives'` — generic UI atoms,
domain-free. All of them also re-export from the package root.

## ArrowLink

A link that is a short sentence and a long thin arrow — «To our **lab
timeline** ⟶», «Go to **weeklies** ⟶», «Meet our **team** ⟶»: the wording
with its `**runs**` bold (`InlineText`), the arrow drawn in the text's colour
and lengthening under the pointer. One primitive for every such link, so they
all read the same. Props: `href`, `text`.

## BrandMark

The ViT mark — the six strokes of the wordmark at their own opacities, in
`--vit-brand-mark` — scaling with its box. Decorative unless `title` names it
(then `role="img"`). Props: `title?`, `class?`. The nav's logo and the splash's
wordmark.

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

Editorial intro paragraph, in one of two roles: `intro` (muted, 60ch
measure) or `lede` (light, navy, 36ch — the band lede under a large light
heading, the home page's). Renders `**runs**` as `<strong>`, raw while a
caret is in it. Props: `text: string`, `edit?: EditDescriptor`,
`role?: 'intro' | 'lede'`.

## DateText

`<time>` with a machine-readable `datetime` and the day formatted in the
config locale (fixed Europe/Madrid resolution for timestamps).
Props: `value: string` — ISO date or timestamp.

## DecorShapes

The brand's decorative corner composition (static SVG, `aria-hidden`).
Props: `flip?: boolean`.

## ImageCollage

Up to four pictures as one composition in a fixed frame: the first large on
the left, two small ones stacked in the column beside it, the fourth further
right and a row lower, the design's placement. A fifth and later are not
shown; one, two and three each have a layout, so no count leaves a hole. A
picture with an `href` is a link to it — an internal path through `Link`, an
https URL as an outbound anchor, anything else a plain picture — and says so
under the pointer: a navy mask covers the blurred picture and names where it
leads, `timeline_toProject` with the picture's `label` in bold (the
`linkLabel` when it has none). Props: `images: { url; href?; label?; alt? }[]`,
`alt?` (on the large image only; the rest are decorative), `linkLabel?`
(«Read more» by default).

## InlineText

A paragraph's runs as real elements: `**text**` in the source is a
`<strong>`. Renders no element of its own — the caller owns the `<p>` — so it
drops into an `Editable` snippet; pass `raw={'contenteditable' in attrs}`
there, because a live editor reads the draft back as `innerText` and a
`<strong>` run would commit without its markers. Props: `text`, `raw?`.

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
drawing — the digital-gap survey's stroke paths keyed by the closed tuples
`ARM_POSES` and `LEG_POSES` (`ARMS`, `LEGS`, `HEADS`, bound with `satisfies`; `HEAD_SHAPES`), the vocabularies a host row stores (`HEAD_MODES`,
`LABEL_SIDES`, `LABEL_ALIGNS`, the `FIGURE_OFFSET`/`FIGURE_PERCENT` bounds —
all on `./contract` too), where each part sits in the composed box
(`FIGURE_VIEWBOX`, `NECK`, `SHOULDER`), and `calloutPath(side, align)` — so a
chart or a decorative band can draw line people from the same set.

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

Renders the block mini-format (`## ` subheadings, blank-line paragraphs,
`**strong**` runs) with real elements — never `{@html}`. With `edit` (format `'richtext'`) and an
active adapter it offers a source editor with live preview.
Props: `body: string`, `edit?: EditDescriptor`. Parse with the exported
`renderBody(body)` if you need the blocks yourself.

## TileMosaic

The brand's geometric mosaic: a grid of squares, quarter and half circles,
triangles, discs and hatched squares in navy, magenta, cream and wine
(`--color-wine`). Décor, `aria-hidden`, and deterministic from `seed` — the
same seed draws the same picture on the server and in the browser. Fills its
container (`slice`). Props: `cols?` (8), `rows?` (5), `seed?` (1), `density?`
(0.8, the share of cells that draw a tile), `focus?` (a denser cluster around
one cell, falling off over a radius), `clear?` (rectangles in cell units
that draw nothing — a cell any part of a zone touches stays empty, so text
laid over the mosaic never meets a tile) and `arrive?` (an entrance: each
tile is born a way in towards the focus, turned and small, and travels out
to its place with a little overshoot, in waves from the centre — pure CSS
from the server's markup, so it starts with the first paint). Under the
pointer a tile turns a quarter at once and takes the next hue of the
palette, a disc swells, the hatching flips its stripes, and it settles back
slowly, so a hand passing over leaves a wake of turned tiles returning one
after another — the paces are `--vit-tile-turn` (260ms) and
`--vit-tile-settle` (1600ms), set on the svg or any ancestor; the pointer is
felt by an unseen, still cell, never by the shape that turns, so nothing
flickers; none of it moves under `prefers-reduced-motion`.

## SearchInput

Debounced `role="search"` box with echo-detection (a caller writing the
emitted value back mid-debounce doesn't clobber typing).
Props: `placeholder`, `label`, `onsearch(query)`, `value?`, `id?`,
`debounceMs?` (300), `shape?` (`box` | `pill`).

## ShareRow

Share links (X, LinkedIn) plus copy-to-clipboard with an announced
confirmation. Props: `title`, `url?` (defaults to the config URL),
`writeClipboard?`, `copiedResetMs?`.
